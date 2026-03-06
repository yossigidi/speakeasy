import { callGroq } from '../lib/groq.js';
import { handleCors } from '../lib/cors.js';
import admin from 'firebase-admin';
import { rateLimit } from '../lib/rateLimit.js';

// Ensure Firebase Admin is initialised (shared with lib/firebase.js)
function ensureApp() {
  if (admin.apps.length === 0) {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    } catch (e) {
      serviceAccount = {};
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }
}

async function verifyAuth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    ensureApp();
    return await admin.auth().verifyIdToken(token);
  } catch { return null; }
}

// Consolidated AI endpoint — dispatches based on ?action= query param
// Rewrites in vercel.json map /api/chat → /api/ai?action=chat, etc.

const actions = {
  chat: handleChat,
  'child-advice': handleChildAdvice,
  simulation: handleSimulation,
  'pronunciation-feedback': handlePronunciationFeedback,
  'generate-lesson': handleGenerateLesson,
  'generate-story': handleGenerateStory,
  'speaking-coach': handleSpeakingCoach,
  'life-coach': handleLifeCoach,
};

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (!rateLimit(user.uid, 20)) return res.status(429).json({ error: 'Too many requests' });

  const action = req.query.action;
  const fn = actions[action];
  if (!fn) return res.status(400).json({ error: `Unknown action: ${action}` });

  try {
    return await fn(req, res);
  } catch (error) {
    console.error(`AI API error (${action}):`, error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}

// ── Chat ──────────────────────────────────────────────────────────────
const VALID_CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const MAX_MESSAGES = 30;
const MAX_TEXT_LEN = 2000;

function sanitizeStr(s, maxLen = MAX_TEXT_LEN) {
  return typeof s === 'string' ? s.slice(0, maxLen) : '';
}

async function handleChat(req, res) {
  const { messages, scenario, cefrLevel = 'B1', uiLang = 'en' } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const scenarioContext = {
    free: 'Have a natural conversation on any topic.',
    restaurant: 'You are a waiter at a restaurant. Help the customer order food and drinks.',
    airport: 'You are an airport information desk agent. Help the traveler with directions, boarding, and luggage.',
    'job-interview': 'You are a job interviewer. Ask professional questions and give feedback.',
    doctor: 'You are a doctor. Listen to symptoms and give basic advice.',
    hotel: 'You are a hotel receptionist. Help with check-in, room requests, and local recommendations.',
    'small-talk': 'Have casual small talk about weather, hobbies, weekend plans, etc.',
  };

  const safeCefr = VALID_CEFR.includes(cefrLevel) ? cefrLevel : 'B1';
  const safeMessages = messages.slice(-MAX_MESSAGES).map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: sanitizeStr(m.content),
  }));

  const systemPrompt = `You are an English conversation practice partner for a ${safeCefr} level learner.
${scenarioContext[scenario] || scenarioContext.free}

IMPORTANT RULES:
- Speak at ${safeCefr} level. Use simple vocabulary for A1-A2, moderate for B1-B2.
- Keep responses 1-3 sentences. Be conversational and natural.
- If the user makes a grammar or vocabulary mistake, include a correction.
- Be encouraging and supportive.
- ${uiLang === 'he' ? 'Give corrections/explanations in Hebrew when helpful.' : 'Give corrections in English.'}

RESPONSE FORMAT - Reply with valid JSON:
{
  "reply": "Your conversational response here",
  "correction": null or { "original": "what user said wrong", "corrected": "correct version", "explanation": "brief explanation${uiLang === 'he' ? ' in Hebrew' : ''}" },
  "vocabulary": ["any new words used"]
}

Only include "correction" if there was an actual error. Reply ONLY with the JSON, no extra text.`;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...safeMessages
  ];

  const rawResponse = await callGroq(apiMessages, { temperature: 0.7, max_tokens: 512 });

  let parsed;
  try {
    const clean = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    parsed = { reply: rawResponse, correction: null, vocabulary: [] };
  }

  return res.status(200).json(parsed);
}

// ── Child Advice ──────────────────────────────────────────────────────
async function handleChildAdvice(req, res) {
  const { childName, age, stats, lang = 'he' } = req.body;
  if (!childName || !stats) {
    return res.status(400).json({ error: 'childName and stats are required' });
  }

  const systemPrompt = lang === 'he'
    ? `אתה יועץ חינוכי מומחה ללמידת אנגלית לילדים. אתה נותן עצות להורים על איך לעזור לילד שלהם להתקדם בלמידת אנגלית.
       כתוב בעברית. היה חיובי, מעודד ומעשי. תן 3-4 עצות קצרות וספציפיות.
       השתמש באימוג'ים כדי להפוך את הטקסט ליותר ידידותי.
       אל תציין "בתור יועץ" או "כמומחה" - פשוט תן עצות ישירות.`
    : `You are an educational advisor specializing in English learning for children. You give advice to parents on how to help their child progress in learning English.
       Write in English. Be positive, encouraging and practical. Give 3-4 short, specific tips.
       Use emojis to make the text more friendly.
       Don't mention "as an advisor" or "as an expert" - just give direct advice.`;

  const streakInfo = stats.streak > 0
    ? (lang === 'he' ? `רצף נוכחי: ${stats.streak} ימים` : `Current streak: ${stats.streak} days`)
    : (lang === 'he' ? 'אין רצף פעיל' : 'No active streak');

  const userPrompt = lang === 'he'
    ? `הילד: ${childName}, בן/בת ${age || 'לא ידוע'}
       רמה: ${stats.level}, CEFR: ${stats.cefrLevel}
       סה"כ XP: ${stats.xp}
       מילים שנלמדו: ${stats.totalWordsLearned}
       שיעורים שהושלמו: ${stats.totalLessonsCompleted}
       ${streakInfo}
       רצף הכי ארוך: ${stats.longestStreak} ימים
       XP היום: ${stats.dailyXP}

       בהתבסס על הנתונים האלה, תן עצות להורה איך לעזור לילד להתקדם.
       אם הילד לא פעיל - תן עצות איך לעודד אותו לחזור.
       אם הילד פעיל - תן עצות איך לשפר את הלמידה.`
    : `Child: ${childName}, age ${age || 'unknown'}
       Level: ${stats.level}, CEFR: ${stats.cefrLevel}
       Total XP: ${stats.xp}
       Words learned: ${stats.totalWordsLearned}
       Lessons completed: ${stats.totalLessonsCompleted}
       ${streakInfo}
       Longest streak: ${stats.longestStreak} days
       Today's XP: ${stats.dailyXP}

       Based on this data, give advice to the parent on how to help the child progress.
       If the child is inactive - give tips on how to encourage them to come back.
       If the child is active - give tips on how to improve learning.`;

  const advice = await callGroq([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], { temperature: 0.8, max_tokens: 512 });

  return res.status(200).json({ advice });
}

// ── Simulation ────────────────────────────────────────────────────────
async function handleSimulation(req, res) {
  const {
    scenarioContext, npcRole, npcName, npcPersonality,
    userMessage, cefrLevel = 'B1', uiLang = 'en', history,
    evaluationFocus, step, freeMode, industry,
  } = req.body;

  if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
    return res.status(400).json({ error: 'userMessage is required' });
  }

  const safeCefr = VALID_CEFR.includes(cefrLevel) ? cefrLevel : 'B1';
  const safeUserMsg = sanitizeStr(userMessage);
  const safeHistory = Array.isArray(history) ? history.slice(-MAX_MESSAGES) : [];

  const langNote = uiLang === 'he'
    ? 'Give corrections and explanations in Hebrew.'
    : 'Give corrections and explanations in English.';

  let systemPrompt;

  if (freeMode) {
    const roleMap = {
      tech: 'a friendly senior software engineer at a tech company',
      business: 'a friendly business consultant at a major firm',
      tourism: 'a friendly hotel concierge at a luxury resort',
    };
    const role = roleMap[industry] || roleMap.tech;

    systemPrompt = `You are ${role}, having an open English conversation practice with a ${safeCefr} level learner.

RULES:
- Stay in character. Be natural, conversational, and engaging.
- Match your vocabulary to ${safeCefr} level.
- Keep responses 1-3 sentences. Ask follow-up questions to keep the conversation going.
- After responding, evaluate the user's English on 4 metrics (0-100 each).
- If the user makes mistakes, provide a correction.
- ${langNote}

Reply with ONLY valid JSON:
{
  "npcReply": "Your in-character response",
  "metrics": { "clarity": 0-100, "grammar": 0-100, "vocabulary": 0-100, "confidence": 0-100 },
  "correction": null or { "original": "what was wrong", "corrected": "correct version", "explanation": "brief explanation" },
  "mistakes": [{ "type": "grammar|vocabulary|register", "detail": "what was wrong", "suggestion": "how to fix it" }],
  "overallScore": 0-100
}`;
  } else {
    systemPrompt = `You are ${npcName}, a ${npcRole}. Personality: ${npcPersonality}.

CONTEXT: ${scenarioContext || 'Professional workplace scenario'}
This is step ${step} of a simulation. The learner's English level is ${safeCefr}.

RULES:
- Stay in character as ${npcName} the ${npcRole}.
- React naturally to the user's response. Keep your reply to 1-3 sentences.
- Match vocabulary complexity to ${safeCefr} level.
- Evaluate the user's response on these focus areas: ${(evaluationFocus || []).join(', ')}.
- Rate each metric honestly based on the response quality.
- If the user makes grammar, vocabulary, or register mistakes, list them.
- ${langNote}

Reply with ONLY valid JSON:
{
  "npcReply": "Your in-character response continuing the scenario",
  "metrics": { "clarity": 0-100, "grammar": 0-100, "vocabulary": 0-100, "confidence": 0-100 },
  "correction": null or { "original": "what was wrong", "corrected": "correct version", "explanation": "brief explanation" },
  "mistakes": [{ "type": "grammar|vocabulary|register", "detail": "what was wrong", "suggestion": "how to fix it" }],
  "overallScore": 0-100
}`;
  }

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...safeHistory.filter(m => m && m.role && m.content).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: sanitizeStr(m.content) })),
    { role: 'user', content: safeUserMsg },
  ];

  const rawResponse = await callGroq(apiMessages, { temperature: 0.7, max_tokens: 512 });

  let parsed;
  try {
    const clean = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    parsed = {
      npcReply: rawResponse,
      metrics: { clarity: 70, grammar: 70, vocabulary: 70, confidence: 70 },
      correction: null,
      mistakes: [],
      overallScore: 70,
    };
  }

  return res.status(200).json(parsed);
}

// ── Pronunciation Feedback ────────────────────────────────────────────
async function handlePronunciationFeedback(req, res) {
  const { target, spoken, score } = req.body;
  if (!target || !spoken) {
    return res.status(400).json({ error: 'target and spoken are required' });
  }
  const safeTarget = sanitizeStr(target, 500);
  const safeSpoken = sanitizeStr(spoken, 500);
  const safeScore = Math.min(100, Math.max(0, parseInt(score, 10) || 0));

  const prompt = `A student tried to say: "${safeTarget}"
They actually said: "${safeSpoken}"
Pronunciation score: ${safeScore}/100

Give brief, encouraging feedback (2-3 sentences). Point out specific pronunciation issues if any.
If Hebrew explanation helps, include one.
Reply as plain text, not JSON.`;

  const response = await callGroq([
    { role: 'system', content: 'You are a friendly pronunciation coach.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.6, max_tokens: 256 });

  return res.status(200).json({ feedback: response });
}

// ── Generate Lesson ───────────────────────────────────────────────────
async function handleGenerateLesson(req, res) {
  const { cefrLevel, topic, grammarFocus } = req.body;
  if (!cefrLevel || !topic) {
    return res.status(400).json({ error: 'cefrLevel and topic are required' });
  }

  const safeCefr = VALID_CEFR.includes(cefrLevel) ? cefrLevel : 'B1';
  const safeTopic = sanitizeStr(topic, 200);
  const safeGrammar = grammarFocus ? sanitizeStr(grammarFocus, 200) : '';

  const prompt = `Generate an English lesson for ${safeCefr} level learners about "${safeTopic}"${safeGrammar ? ` with grammar focus on ${safeGrammar}` : ''}.

Create exactly 8 exercises as a JSON array. Mix these types:
1. "multiple-choice" - { type, question, options: [4 strings], correct: index, explanation }
2. "fill-blank" - { type, sentence (use ___ for blank), answer, alternatives: [], hint }
3. "word-arrange" - { type, words: [shuffled], correct: "correct sentence", translation }
4. "translation" - { type, source (Hebrew), target (English), alternatives: [] }
5. "match-pairs" - { type, pairs: [[english, hebrew], ...] (4-5 pairs) }

Rules:
- All content must be appropriate for ${safeCefr} level
- Include Hebrew translations where relevant
- Make exercises progressively harder
- Reply with ONLY a JSON array of exercises, no extra text.`;

  const response = await callGroq([
    { role: 'system', content: 'You are an expert English language teacher. Generate lesson exercises as valid JSON arrays.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.6, max_tokens: 2048 });

  const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  let exercises;
  try {
    exercises = JSON.parse(clean);
  } catch {
    return res.status(500).json({ error: 'Failed to parse lesson response' });
  }

  return res.status(200).json({ exercises });
}

// ── Generate Story ────────────────────────────────────────────────────
async function handleGenerateStory(req, res) {
  const { cefrLevel, topic } = req.body;
  if (!cefrLevel) {
    return res.status(400).json({ error: 'cefrLevel is required' });
  }

  const safeCefr = VALID_CEFR.includes(cefrLevel) ? cefrLevel : 'B1';
  const safeTopic = sanitizeStr(topic || 'daily life', 200);
  const wordCount = safeCefr === 'A1' ? '100-150' : safeCefr === 'A2' ? '150-200' : '200-300';

  const prompt = `Write an English reading passage for ${safeCefr} level learners about "${safeTopic}".

Requirements:
- ${wordCount} words
- Vocabulary appropriate for ${safeCefr}
- Engaging and relatable content
- Include 5 key vocabulary words with Hebrew translations

Reply with valid JSON:
{
  "title": "Story Title",
  "titleHe": "Hebrew title",
  "text": "Full story text...",
  "vocabulary": [
    { "word": "example", "translation": "דוגמה", "definition": "English definition" }
  ],
  "questions": [
    { "question": "Comprehension question?", "options": ["A", "B", "C", "D"], "correct": 0 }
  ]
}

Include 3 comprehension questions. Reply ONLY with JSON.`;

  const response = await callGroq([
    { role: 'system', content: 'You are an expert English teacher and story writer.' },
    { role: 'user', content: prompt }
  ], { temperature: 0.8, max_tokens: 2048 });

  const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  let story;
  try {
    story = JSON.parse(clean);
  } catch {
    return res.status(500).json({ error: 'Failed to parse story response' });
  }

  return res.status(200).json(story);
}

// ── Speaking Coach ───────────────────────────────────────────────────
async function handleSpeakingCoach(req, res) {
  const {
    transcript, scenario = 'free', history = [], cefrLevel = 'B1',
    uiLang = 'he', isChild = false, speakingTime = 0, wordCount = 0,
    weaknesses = {},
  } = req.body;

  if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
    return res.status(400).json({ error: 'transcript is required' });
  }

  const safeCefr = VALID_CEFR.includes(cefrLevel) ? cefrLevel : 'B1';
  const safeTranscript = sanitizeStr(transcript);
  const safeHistory = Array.isArray(history) ? history.slice(-MAX_MESSAGES) : [];

  const langNote = uiLang === 'he' ? 'Give correction explanations and exercise translations in Hebrew.'
    : uiLang === 'ar' ? 'Give correction explanations and exercise translations in Arabic.'
    : uiLang === 'ru' ? 'Give correction explanations and exercise translations in Russian.'
    : 'Give correction explanations in English.';

  const weaknessKeys = Object.keys(weaknesses || {});
  const weaknessNote = weaknessKeys.length > 0
    ? `The student's known weak areas are: ${weaknessKeys.join(', ')}. Focus corrections on these areas when relevant.`
    : '';

  const wpm = speakingTime > 0 ? Math.round(wordCount / (speakingTime / 60)) : 0;

  let systemPrompt;

  if (isChild) {
    systemPrompt = `You are "Speakli" — a friendly, enthusiastic English learning character for kids.

PERSONALITY:
- Super encouraging and fun! Use simple words.
- Celebrate every attempt: "Great job!", "Wow, you said that so well!"
- Keep sentences SHORT (5-10 words max per sentence).
- Only correct 1-2 mistakes maximum per turn. Don't overwhelm.
- If the child makes no mistakes, just continue the conversation happily.

SCENARIO: ${scenario}
LEVEL: ${safeCefr} (adapt to A1-A2 vocabulary)
${weaknessNote}
${langNote}

FLUENCY DATA: The student spoke ${wordCount} words in ${Math.round(speakingTime)}s (${wpm} WPM).

RESPONSE FORMAT — Reply with ONLY valid JSON:
{
  "reply": "Your short conversational response (1-2 sentences, kid-friendly)",
  "corrections": [
    { "wrong": "what they said wrong", "correct": "correct version", "rule": "grammar_rule_key", "explanation": "brief explanation in student's language" }
  ],
  "grammarScore": 0-100,
  "vocabularyScore": 0-100,
  "fluencyScore": 0-100,
  "overallScore": 0-100,
  "exercise": null or { "type": "repeat", "sentence": "correct sentence to repeat", "translation": "translation in student's UI language" }
}

RULES:
- "corrections" array should have 0-2 items max.
- Only include "exercise" if there was a real mistake worth practicing.
- Exercise type is always "repeat" for kids.
- Scores should be generous for kids (60-100 range, reward effort).
- Reply ONLY with the JSON, no extra text.`;
  } else {
    systemPrompt = `You are "Emma" — a warm, professional English teacher and speaking coach.

PERSONALITY:
- Patient but honest. Encouraging but doesn't sugarcoat mistakes.
- Names the grammar rule for each correction (e.g. "past_tense", "articles", "subject_verb_agreement").
- Provides targeted exercises based on mistakes.
- Adapts complexity to the student's CEFR level.

SCENARIO: ${scenario}
LEVEL: ${safeCefr}
${weaknessNote}
${langNote}

FLUENCY DATA: The student spoke ${wordCount} words in ${Math.round(speakingTime)}s (${wpm} WPM). Ideal for learners: 100-150 WPM.

RESPONSE FORMAT — Reply with ONLY valid JSON:
{
  "reply": "Your conversational response (1-3 sentences, natural and engaging)",
  "corrections": [
    { "wrong": "what they said wrong", "correct": "correct version", "rule": "grammar_rule_key", "explanation": "brief explanation in student's language" }
  ],
  "grammarScore": 0-100,
  "vocabularyScore": 0-100,
  "fluencyScore": 0-100,
  "overallScore": 0-100,
  "exercise": null or { "type": "repeat|fill-blank|rephrase", "sentence": "target sentence", "translation": "translation" }
}

RULES:
- "corrections" array should have 0-3 items max. Focus on the most impactful mistakes.
- Each correction must include a "rule" key (e.g. "past_tense", "articles", "prepositions", "word_order", "subject_verb_agreement", "th_sound", "pronunciation").
- Include "exercise" when there's a meaningful mistake to practice. Vary exercise types.
- Score honestly: grammar based on actual errors, vocabulary based on range and appropriateness, fluency based on WPM and natural flow.
- Reply ONLY with the JSON, no extra text.`;
  }

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...safeHistory.filter(m => m && m.role && m.content).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: sanitizeStr(m.content),
    })),
    { role: 'user', content: safeTranscript },
  ];

  const rawResponse = await callGroq(apiMessages, { temperature: 0.7, max_tokens: 768 });

  let parsed;
  try {
    const clean = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    parsed = {
      reply: rawResponse,
      corrections: [],
      grammarScore: 70,
      vocabularyScore: 70,
      fluencyScore: 70,
      overallScore: 70,
      exercise: null,
    };
  }

  return res.status(200).json(parsed);
}

// ── Life Coach ──────────────────────────────────────────────────────
async function handleLifeCoach(req, res) {
  const {
    transcript, mode = 'free-chat', modeContext = '', history = [],
    cefrLevel = 'B1', uiLang = 'he', isChild = false,
  } = req.body;

  if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
    return res.status(400).json({ error: 'transcript is required' });
  }

  const safeCefr = VALID_CEFR.includes(cefrLevel) ? cefrLevel : 'B1';
  const safeTranscript = sanitizeStr(transcript);
  const safeHistory = Array.isArray(history) ? history.slice(-MAX_MESSAGES) : [];

  const langNote = uiLang === 'he' ? 'Give correction explanations in Hebrew.'
    : uiLang === 'ar' ? 'Give correction explanations in Arabic.'
    : uiLang === 'ru' ? 'Give correction explanations in Russian.'
    : 'Give correction explanations in English.';

  let systemPrompt;

  if (isChild) {
    systemPrompt = `You are "Speakli" — the child's best friend, not a teacher. You're a fun, warm character who loves hearing about the child's life.

PERSONALITY:
- Super enthusiastic and caring! You genuinely love talking to this child.
- Keep sentences SHORT (5-8 words max). Use simple vocabulary.
- Celebrate everything they share: "That's so cool!", "Wow, really?"
- Ask follow-up questions to keep the conversation going.
- Maximum 1 correction per turn, woven naturally into your response.
- Example of natural correction: "Oh, you WENT to the park? That sounds fun!"
- If no mistakes, just keep the conversation flowing.

MODE: ${mode}
CONTEXT: ${modeContext}
LEVEL: ${safeCefr} (use A1-A2 vocabulary)
${langNote}

RESPONSE FORMAT — Reply with ONLY valid JSON:
{
  "reply": "Your short, enthusiastic response (1-2 sentences, kid-friendly)",
  "corrections": [
    { "wrong": "what they said wrong", "correct": "natural correction", "explanation": "brief explanation in student's language" }
  ],
  "overallScore": 0-100
}

RULES:
- "corrections" array: 0-1 items max. Only correct real mistakes, not style.
- Scores should be generous (70-100 range). Reward effort and communication.
- NEVER interrupt the conversation flow with exercises or drills.
- Reply ONLY with the JSON, no extra text.`;
  } else {
    systemPrompt = `You are "Emma" — a supportive friend who happens to be great at English. You're genuinely interested in the user's life, feelings, and stories.

PERSONALITY:
- Warm, empathetic, curious. Like chatting with a close friend.
- Show genuine interest: ask follow-up questions, react emotionally to their stories.
- Weave corrections naturally: "Oh, you WENT to the store? What did you buy?"
- Maximum 2 corrections per turn. Prioritize communication over perfection.
- Adapt vocabulary to ${safeCefr} level.
- Never feel like a lesson — this is a real conversation.

MODE: ${mode}
CONTEXT: ${modeContext}
LEVEL: ${safeCefr}
${langNote}

RESPONSE FORMAT — Reply with ONLY valid JSON:
{
  "reply": "Your natural, conversational response (1-3 sentences)",
  "corrections": [
    { "wrong": "what they said wrong", "correct": "natural correction", "explanation": "brief explanation in student's language" }
  ],
  "overallScore": 0-100
}

RULES:
- "corrections" array: 0-2 items max. Focus on the most impactful mistakes.
- Score honestly but kindly (50-100 range).
- NEVER interrupt with exercises. This is a conversation, not a classroom.
- Ask questions to keep the dialogue going.
- Reply ONLY with the JSON, no extra text.`;
  }

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...safeHistory.filter(m => m && m.role && m.content).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: sanitizeStr(m.content),
    })),
    { role: 'user', content: safeTranscript },
  ];

  const rawResponse = await callGroq(apiMessages, { temperature: 0.8, max_tokens: 512 });

  let parsed;
  try {
    const clean = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    parsed = {
      reply: rawResponse,
      corrections: [],
      overallScore: 75,
    };
  }

  return res.status(200).json(parsed);
}

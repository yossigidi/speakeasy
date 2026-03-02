import { callGroq } from './_lib/groq.js';
import { handleCors } from './_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      scenarioContext, npcRole, npcName, npcPersonality,
      userMessage, cefrLevel, uiLang, history,
      evaluationFocus, step, freeMode, industry,
    } = req.body;

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

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

      systemPrompt = `You are ${role}, having an open English conversation practice with a ${cefrLevel} level learner.

RULES:
- Stay in character. Be natural, conversational, and engaging.
- Match your vocabulary to ${cefrLevel} level.
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
This is step ${step} of a simulation. The learner's English level is ${cefrLevel}.

RULES:
- Stay in character as ${npcName} the ${npcRole}.
- React naturally to the user's response. Keep your reply to 1-3 sentences.
- Match vocabulary complexity to ${cefrLevel} level.
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
      ...(history || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
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
  } catch (error) {
    console.error('Simulation API error:', error);
    return res.status(500).json({ error: 'Failed to process simulation' });
  }
}

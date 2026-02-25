import { callGroq } from './_lib/groq.js';
import { handleCors } from './_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, scenario, cefrLevel, uiLang } = req.body;

    const scenarioContext = {
      free: 'Have a natural conversation on any topic.',
      restaurant: 'You are a waiter at a restaurant. Help the customer order food and drinks.',
      airport: 'You are an airport information desk agent. Help the traveler with directions, boarding, and luggage.',
      'job-interview': 'You are a job interviewer. Ask professional questions and give feedback.',
      doctor: 'You are a doctor. Listen to symptoms and give basic advice.',
      hotel: 'You are a hotel receptionist. Help with check-in, room requests, and local recommendations.',
      'small-talk': 'Have casual small talk about weather, hobbies, weekend plans, etc.',
    };

    const systemPrompt = `You are an English conversation practice partner for a ${cefrLevel} level learner.
${scenarioContext[scenario] || scenarioContext.free}

IMPORTANT RULES:
- Speak at ${cefrLevel} level. Use simple vocabulary for A1-A2, moderate for B1-B2.
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
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const rawResponse = await callGroq(apiMessages, { temperature: 0.7, max_tokens: 512 });

    // Try to parse as JSON
    let parsed;
    try {
      // Handle potential markdown code block wrapping
      const clean = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      // Fallback: treat entire response as reply text
      parsed = { reply: rawResponse, correction: null, vocabulary: [] };
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
}

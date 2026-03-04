import { callGroq } from '../lib/groq.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { target, spoken, score } = req.body;

    if (!target || !spoken) {
      return res.status(400).json({ error: 'target and spoken are required' });
    }
    const safeScore = Math.min(100, Math.max(0, parseInt(score, 10) || 0));

    const prompt = `A student tried to say: "${target}"
They actually said: "${spoken}"
Pronunciation score: ${safeScore}/100

Give brief, encouraging feedback (2-3 sentences). Point out specific pronunciation issues if any.
If Hebrew explanation helps, include one.
Reply as plain text, not JSON.`;

    const response = await callGroq([
      { role: 'system', content: 'You are a friendly pronunciation coach.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.6, max_tokens: 256 });

    return res.status(200).json({ feedback: response });
  } catch (error) {
    console.error('Pronunciation feedback error:', error);
    return res.status(500).json({ error: 'Failed to generate feedback' });
  }
}

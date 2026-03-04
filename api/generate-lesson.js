import { callGroq } from '../lib/groq.js';
import { handleCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cefrLevel, topic, grammarFocus } = req.body;

    if (!cefrLevel || !topic) {
      return res.status(400).json({ error: 'cefrLevel and topic are required' });
    }

    const prompt = `Generate an English lesson for ${cefrLevel} level learners about "${topic}"${grammarFocus ? ` with grammar focus on ${grammarFocus}` : ''}.

Create exactly 8 exercises as a JSON array. Mix these types:
1. "multiple-choice" - { type, question, options: [4 strings], correct: index, explanation }
2. "fill-blank" - { type, sentence (use ___ for blank), answer, alternatives: [], hint }
3. "word-arrange" - { type, words: [shuffled], correct: "correct sentence", translation }
4. "translation" - { type, source (Hebrew), target (English), alternatives: [] }
5. "match-pairs" - { type, pairs: [[english, hebrew], ...] (4-5 pairs) }

Rules:
- All content must be appropriate for ${cefrLevel} level
- Include Hebrew translations where relevant
- Make exercises progressively harder
- Reply with ONLY a JSON array of exercises, no extra text.`;

    const response = await callGroq([
      { role: 'system', content: 'You are an expert English language teacher. Generate lesson exercises as valid JSON arrays.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.6, max_tokens: 2048 });

    const clean = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const exercises = JSON.parse(clean);

    return res.status(200).json({ exercises });
  } catch (error) {
    console.error('Generate lesson error:', error);
    return res.status(500).json({ error: 'Failed to generate lesson' });
  }
}

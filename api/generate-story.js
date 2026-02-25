import { callGroq } from './_lib/groq.js';
import { handleCors } from './_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cefrLevel, topic } = req.body;

    const wordCount = cefrLevel === 'A1' ? '100-150' : cefrLevel === 'A2' ? '150-200' : '200-300';

    const prompt = `Write an English reading passage for ${cefrLevel} level learners about "${topic || 'daily life'}".

Requirements:
- ${wordCount} words
- Vocabulary appropriate for ${cefrLevel}
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
    const story = JSON.parse(clean);

    return res.status(200).json(story);
  } catch (error) {
    console.error('Generate story error:', error);
    return res.status(500).json({ error: 'Failed to generate story' });
  }
}

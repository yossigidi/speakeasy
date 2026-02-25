import { handleCors } from './_lib/cors.js';

// Simple daily word selection based on date
export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { level = 'A1', count = 5 } = req.query;

  // Seed based on date for consistent daily selection
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);

  // Return word IDs to fetch from local data
  const startIndex = (seed * 7) % 500;
  const prefix = level.toLowerCase() === 'a2' ? 'a2' : 'a1';

  const wordIds = Array.from({ length: parseInt(count) }, (_, i) => {
    const idx = ((startIndex + i * 13) % 500) + 1;
    return `${prefix}_${String(idx).padStart(3, '0')}`;
  });

  return res.status(200).json({ date: today, level, wordIds });
}

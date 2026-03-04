import { handleCors } from '../lib/cors.js';

// Simple daily word selection based on date
export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { level = 'A1', count: rawCount = '5' } = req.query;

  // Sanitize count — cap at 20 to prevent abuse
  const count = Math.min(Math.max(parseInt(rawCount, 10) || 5, 1), 20);

  // Seed based on date for consistent daily selection
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((a, b) => a + parseInt(b, 10), 0);

  // Return word IDs to fetch from local data
  const startIndex = (seed * 7) % 500;
  const prefix = level.toLowerCase() === 'a2' ? 'a2' : 'a1';

  const wordIds = Array.from({ length: count }, (_, i) => {
    const idx = ((startIndex + i * 13) % 500) + 1;
    return `${prefix}_${String(idx).padStart(3, '0')}`;
  });

  return res.status(200).json({ date: today, level, wordIds });
}

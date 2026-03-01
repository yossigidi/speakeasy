import { callGroq } from './_lib/groq.js';
import { handleCors } from './_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
  } catch (error) {
    console.error('Child advice error:', error);
    return res.status(500).json({ error: 'Failed to generate advice' });
  }
}

import { handleCors } from './_lib/cors.js';
import { getFirestore, getAccessToken } from './_lib/firebase.js';

const CLOUD_TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const CACHE_COLLECTION = 'tts-cache';

// Best natural-sounding voices per language
const VOICES = {
  he: { name: 'he-IL-Chirp3-HD-Kore', languageCode: 'he-IL', speakingRate: 0.92 },
  en: { name: 'en-US-Chirp3-HD-Achernar', languageCode: 'en-US', speakingRate: 0.95 },
};

// Detect language from text (simple heuristic)
function detectLang(text) {
  // If contains Hebrew characters → Hebrew
  if (/[\u0590-\u05FF]/.test(text)) return 'he';
  return 'en';
}

// Clean text for natural pronunciation
function cleanForTTS(text, lang) {
  let cleaned = text;
  if (lang === 'he') {
    // Remove parenthetical content (e.g. "יד (כף יד)" → "יד")
    cleaned = cleaned.replace(/\s*\([^)]*\)/g, '');
    cleaned = cleaned.replace(/\s*\/\s*/g, ' או ');
  }
  return cleaned.replace(/\s+/g, ' ').trim();
}

async function callCloudTTS(text, voiceConfig, accessToken) {
  const audioConfig = {
    audioEncoding: 'MP3',
  };
  // Add speaking rate if configured (slower = more teacher-like)
  if (voiceConfig.speakingRate) {
    audioConfig.speakingRate = voiceConfig.speakingRate;
  }

  const response = await fetch(CLOUD_TTS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceConfig.name,
      },
      audioConfig,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cloud TTS ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.audioContent; // base64 MP3
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voice, lang } = req.body || {};
  if (!text || typeof text !== 'string' || text.length > 500) {
    return res.status(400).json({ error: 'Invalid text (required, max 500 chars)' });
  }

  const trimmed = text.trim();

  // Determine language and voice
  const detectedLang = lang || detectLang(trimmed);
  const voiceConfig = voice
    ? { name: voice, languageCode: detectedLang === 'he' ? 'he-IL' : 'en-US' }
    : VOICES[detectedLang] || VOICES.en;

  const rateStr = voiceConfig.speakingRate ? `_r${voiceConfig.speakingRate}` : '';
  const cacheKey = Buffer.from(`${trimmed}__${voiceConfig.name}${rateStr}`).toString('base64url');

  // 1. Check Firestore cache
  try {
    const db = getFirestore();
    const doc = await db.collection(CACHE_COLLECTION).doc(cacheKey).get();
    if (doc.exists) {
      const cached = doc.data();
      return res.status(200).json({
        audio: cached.audio,
        mimeType: cached.mimeType,
      });
    }
  } catch (e) {
    console.warn('Firestore cache read failed:', e.message);
  }

  // 2. Generate via Google Cloud TTS
  try {
    const token = await getAccessToken();
    const audioBase64 = await callCloudTTS(cleanForTTS(trimmed, detectedLang), voiceConfig, token);

    if (!audioBase64) {
      return res.status(500).json({ error: 'No audio in response' });
    }

    const result = {
      audio: audioBase64,
      mimeType: 'audio/mpeg',
    };

    // 3. Save to Firestore cache (fire-and-forget)
    try {
      const db = getFirestore();
      db.collection(CACHE_COLLECTION).doc(cacheKey).set({
        audio: result.audio,
        mimeType: result.mimeType,
        text: trimmed,
        lang: detectedLang,
        voice: voiceConfig.name,
        createdAt: new Date().toISOString(),
      }).catch(e => console.warn('Firestore cache write failed:', e.message));
    } catch (e) {
      console.warn('Firestore cache save failed:', e.message);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('TTS API error:', error.message);
    return res.status(502).json({ error: 'TTS generation failed' });
  }
}

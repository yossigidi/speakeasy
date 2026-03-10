import { handleCors } from '../lib/cors.js';
import { getFirestore } from '../lib/firebase.js';
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

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const CACHE_COLLECTION = 'tts-cache';

// Jessica - Playful, Bright, Warm (works great with Hebrew on v3)
const VOICE_ID = 'cgSgspJ2msm6clMCkdW9';
const MODEL_ID = 'eleven_v3';

// Detect language from text (simple heuristic)
function detectLang(text) {
  if (/[\u0590-\u05FF]/.test(text)) return 'he';
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';
  return 'en';
}

// Strip Hebrew niqqud (vowel diacritics) — TTS engines mispronounce with them
function stripNiqqud(text) {
  return text.replace(/[\u0591-\u05C7]/g, '');
}

// Hebrew pronunciation overrides — words that ElevenLabs mispronounces
const HE_PRONUNCIATION = {
  'ברווז': 'ברוז',
  'בַּרְוָז': 'ברוז',
};

// Clean text for natural pronunciation
function cleanForTTS(text, lang) {
  let cleaned = text;
  if (lang === 'he') {
    // Apply pronunciation overrides for mispronounced words
    const stripped = stripNiqqud(cleaned.trim());
    if (HE_PRONUNCIATION[stripped]) {
      cleaned = HE_PRONUNCIATION[stripped];
    } else if (HE_PRONUNCIATION[cleaned.trim()]) {
      cleaned = HE_PRONUNCIATION[cleaned.trim()];
    }
    // Remove parenthetical content (e.g. "יד (כף יד)" → "יד")
    cleaned = cleaned.replace(/\s*\([^)]*\)/g, '');
    cleaned = cleaned.replace(/\s*\/\s*/g, ' או ');
  }
  if (lang === 'ar') {
    // Remove parenthetical content for Arabic
    cleaned = cleaned.replace(/\s*\([^)]*\)/g, '');
    cleaned = cleaned.replace(/\s*\/\s*/g, ' أو ');
  }
  if (lang === 'ru') {
    // Remove parenthetical content for Russian
    cleaned = cleaned.replace(/\s*\([^)]*\)/g, '');
    cleaned = cleaned.replace(/\s*\/\s*/g, ' или ');
  }
  return cleaned.replace(/\s+/g, ' ').trim();
}

// Use multilingual v2 for Arabic and Russian (v3 is better for Hebrew + English)
const MULTILINGUAL_MODEL_ID = 'eleven_multilingual_v2';
const MULTILINGUAL_LANGS = new Set(['ar', 'ru']);

async function callElevenLabsTTS(text, voiceId, lang) {
  const modelId = MULTILINGUAL_LANGS.has(lang) ? MULTILINGUAL_MODEL_ID : MODEL_ID;
  const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs TTS ${response.status}: ${err}`);
  }

  // ElevenLabs returns raw binary MP3
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (!rateLimit(user.uid, 30)) return res.status(429).json({ error: 'Too many requests' });

  const { text, lang } = req.body || {};
  if (!text || typeof text !== 'string' || text.length > 500) {
    return res.status(400).json({ error: 'Invalid text (required, max 500 chars)' });
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return res.status(400).json({ error: 'Text cannot be empty' });
  }
  const ALLOWED_LANGS = ['he', 'en', 'en-US', 'en-GB', 'ar', 'ru'];
  const detectedLang = (lang && ALLOWED_LANGS.includes(lang)) ? lang : detectLang(trimmed);
  const voiceId = VOICE_ID;

  // Use cleaned text for cache key (Hebrew now includes niqqud for better pronunciation)
  const cleanedText = cleanForTTS(trimmed, detectedLang);
  const modelId = MULTILINGUAL_LANGS.has(detectedLang) ? MULTILINGUAL_MODEL_ID : MODEL_ID;
  const cacheKey = Buffer.from(`${cleanedText}__el_${voiceId}_${modelId}`).toString('base64url');

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

  // 2. Generate via ElevenLabs TTS
  try {
    const audioBase64 = await callElevenLabsTTS(cleanForTTS(trimmed, detectedLang), voiceId, detectedLang);

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
        voice: voiceId,
        provider: 'elevenlabs',
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

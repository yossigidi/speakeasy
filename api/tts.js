import { handleCors } from './_lib/cors.js';
import { getFirestore } from './_lib/firebase.js';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const CACHE_COLLECTION = 'tts-cache';

// Jessica - Playful, Bright, Warm (works great with Hebrew on v3)
const VOICE_ID = 'cgSgspJ2msm6clMCkdW9';
const MODEL_ID = 'eleven_v3';

// Detect language from text (simple heuristic)
function detectLang(text) {
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

async function callElevenLabsTTS(text, voiceId) {
  const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
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

  const { text, lang } = req.body || {};
  if (!text || typeof text !== 'string' || text.length > 500) {
    return res.status(400).json({ error: 'Invalid text (required, max 500 chars)' });
  }

  const trimmed = text.trim();
  const detectedLang = lang || detectLang(trimmed);
  const voiceId = VOICE_ID;

  const cacheKey = Buffer.from(`${trimmed}__el_${voiceId}`).toString('base64url');

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
    const audioBase64 = await callElevenLabsTTS(cleanForTTS(trimmed, detectedLang), voiceId);

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

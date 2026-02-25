import { handleCors } from './_lib/cors.js';
import { getFirestore } from './_lib/firebase.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent';
const CACHE_COLLECTION = 'tts-cache';

async function callTTS(prompt, voice, apiKey) {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_modalities: ['AUDIO'],
        speech_config: {
          voice_config: {
            prebuilt_voice_config: { voice_name: voice },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voice } = req.body || {};
  if (!text || typeof text !== 'string' || text.length > 500) {
    return res.status(400).json({ error: 'Invalid text (required, max 500 chars)' });
  }

  const trimmed = text.trim();
  const voiceName = voice || 'Kore';
  // Use text+voice as cache key (safe for Firestore doc IDs)
  const cacheKey = Buffer.from(`${trimmed}__${voiceName}`).toString('base64url');

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
    // Firestore unavailable — continue to Gemini
    console.warn('Firestore cache read failed:', e.message);
  }

  // 2. Generate via Gemini
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    let audioData = await callTTS(
      `Read aloud the following text exactly as written: ${trimmed}`,
      voiceName, apiKey
    );

    if (!audioData?.data) {
      audioData = await callTTS(
        `Please pronounce this clearly: "${trimmed}". Only speak the quoted text, nothing else.`,
        voiceName, apiKey
      );
    }

    if (!audioData?.data) {
      return res.status(500).json({ error: 'No audio in response' });
    }

    const result = {
      audio: audioData.data,
      mimeType: audioData.mimeType || 'audio/L16;rate=24000',
    };

    // 3. Save to Firestore cache (fire-and-forget)
    try {
      const db = getFirestore();
      db.collection(CACHE_COLLECTION).doc(cacheKey).set({
        audio: result.audio,
        mimeType: result.mimeType,
        text: trimmed,
        voice: voiceName,
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

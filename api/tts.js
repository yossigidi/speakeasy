import { handleCors } from './_lib/cors.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent';

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

  const voiceName = voice || 'Kore';
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // Try with instruction prompt first; if model returns no audio
    // (common with very short text), retry with padded prompt
    let audioData = await callTTS(
      `Read aloud the following text exactly as written: ${text}`,
      voiceName, apiKey
    );

    if (!audioData?.data) {
      audioData = await callTTS(
        `Please pronounce this clearly: "${text}". Only speak the quoted text, nothing else.`,
        voiceName, apiKey
      );
    }

    if (!audioData?.data) {
      return res.status(500).json({ error: 'No audio in response' });
    }

    return res.status(200).json({
      audio: audioData.data,
      mimeType: audioData.mimeType || 'audio/L16;rate=24000',
    });
  } catch (error) {
    console.error('TTS API error:', error.message);
    return res.status(502).json({ error: 'TTS generation failed' });
  }
}

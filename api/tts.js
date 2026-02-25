import { GoogleGenAI } from '@google/genai';
import { handleCors } from './_lib/cors.js';

let ai = null;
function getAI() {
  if (!ai) ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return ai;
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

  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!audioData?.data) {
      return res.status(500).json({ error: 'No audio in response' });
    }

    return res.status(200).json({
      audio: audioData.data,
      mimeType: audioData.mimeType || 'audio/L16;rate=24000',
    });
  } catch (error) {
    console.error('TTS API error:', error.message);
    return res.status(500).json({ error: 'TTS generation failed' });
  }
}

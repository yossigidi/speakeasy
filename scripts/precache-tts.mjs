/**
 * Pre-cache all Hebrew translations via Gemini TTS → Firestore
 *
 * Usage: node scripts/precache-tts.mjs
 *
 * Reads all Hebrew translations from the app's data files,
 * checks Firestore for existing cache, and generates+stores
 * audio for any missing entries.
 */

import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ── Config ──
const GEMINI_API_KEY = 'AIzaSyB4ncOYYX6sCQ7GIlaN7cuwiXaXxAHCxi0';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent';
const VOICE = 'Kore';
const COLLECTION = 'tts-cache';
const DELAY_MS = 5000; // 12 RPM — safe with Gemini TTS limits

// ── Firebase init ──
const sa = JSON.parse(readFileSync('./speakeasy-learn-firebase-adminsdk-fbsvc-8361c07095.json', 'utf8').trim());

// Try the downloads folder if not in project root
let serviceAccount;
try {
  serviceAccount = sa;
} catch {
  serviceAccount = JSON.parse(readFileSync(
    new URL('../speakeasy-learn-firebase-adminsdk-fbsvc-8361c07095.json', import.meta.url), 'utf8'
  ));
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── Load all Hebrew translations from data files ──
function loadTranslations() {
  const basePath = './vite-prod/src/data';
  const all = new Set();

  // words-a1.json & words-a2.json: array of { translation: "..." }
  for (const file of ['words-a1.json', 'words-a2.json']) {
    const data = JSON.parse(readFileSync(`${basePath}/${file}`, 'utf8'));
    data.forEach(w => { if (w.translation) all.add(w.translation.trim()); });
  }

  // alphabet-kids.json: array of { words: [{ translation: "..." }] }
  const alpha = JSON.parse(readFileSync(`${basePath}/alphabet-kids.json`, 'utf8'));
  alpha.forEach(letter => {
    if (letter.words) letter.words.forEach(w => { if (w.translation) all.add(w.translation.trim()); });
  });

  // phrases-common.json: array of { translation: "..." }
  const phrases = JSON.parse(readFileSync(`${basePath}/phrases-common.json`, 'utf8'));
  phrases.forEach(p => { if (p.translation) all.add(p.translation.trim()); });

  return [...all].filter(t => t.length > 0);
}

// ── Cache key (same logic as api/tts.js) ──
function cacheKey(text) {
  return Buffer.from(`${text}__${VOICE}`).toString('base64url');
}

// ── Call Gemini TTS ──
async function generateTTS(text) {
  // Try two prompt strategies
  const prompts = [
    `Read aloud the following text exactly as written: ${text}`,
    `Please pronounce this clearly: "${text}". Only speak the quoted text, nothing else.`,
  ];

  for (const prompt of prompts) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            response_modalities: ['AUDIO'],
            speech_config: {
              voice_config: {
                prebuilt_voice_config: { voice_name: VOICE },
              },
            },
          },
        }),
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const err = await res.text();
        if (res.status === 429) throw new Error(`RATE_LIMITED: ${err}`);
        console.error(`  API error ${res.status}`);
        continue;
      }

      const data = await res.json();
      const audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (audio?.data) return audio;
    } catch (e) {
      clearTimeout(timeout);
      if (e.name === 'AbortError') {
        console.error('timeout');
        continue;
      }
      throw e;
    }
  }

  return null;
}

// ── Main ──
async function main() {
  const translations = loadTranslations();
  console.log(`\nFound ${translations.length} unique Hebrew translations\n`);

  // Check which are already cached (batch read for speed)
  let cached = 0;
  let toGenerate = [];

  console.log('Checking Firestore cache...');
  const allDocs = await db.collection(COLLECTION).get();
  const existingKeys = new Set();
  allDocs.forEach(doc => existingKeys.add(doc.id));

  for (const text of translations) {
    if (existingKeys.has(cacheKey(text))) {
      cached++;
    } else {
      toGenerate.push(text);
    }
  }

  console.log(`  Already cached: ${cached}`);
  console.log(`  Need to generate: ${toGenerate.length}\n`);

  if (toGenerate.length === 0) {
    console.log('All translations are already cached!');
    return;
  }

  // Generate and cache
  let success = 0;
  let failed = 0;
  const failedWords = [];

  for (let i = 0; i < toGenerate.length; i++) {
    const text = toGenerate[i];
    const pct = Math.round(((i + 1) / toGenerate.length) * 100);
    process.stdout.write(`  [${pct}%] ${i + 1}/${toGenerate.length} "${text}" ... `);

    let retries = 5;
    while (retries > 0) {
      try {
        const audio = await generateTTS(text);
        if (audio?.data) {
          await db.collection(COLLECTION).doc(cacheKey(text)).set({
            audio: audio.data,
            mimeType: audio.mimeType || 'audio/L16;rate=24000',
            text,
            voice: VOICE,
            createdAt: new Date().toISOString(),
          });
          console.log('OK');
          success++;
          break;
        } else {
          if (retries > 1) {
            process.stdout.write('retry... ');
            await new Promise(r => setTimeout(r, 5000));
            retries--;
          } else {
            console.log('no audio');
            failed++;
            failedWords.push(text);
            break;
          }
        }
      } catch (e) {
        if (e.message.startsWith('RATE_LIMITED') && retries > 1) {
          process.stdout.write('rate limited, waiting 90s... ');
          await new Promise(r => setTimeout(r, 90000));
          retries--;
        } else {
          console.log(`error: ${e.message.slice(0, 80)}`);
          failed++;
          failedWords.push(text);
          break;
        }
      }
    }

    // Delay between requests
    if (i < toGenerate.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n── Done ──`);
  console.log(`  Success: ${success}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total cached: ${cached + success}`);

  if (failedWords.length > 0) {
    console.log(`\n  Failed words:`);
    failedWords.forEach(w => console.log(`    - "${w}"`));
  }

  const estimatedCost = (success * 85 * 10 / 1000000).toFixed(2);
  console.log(`\n  Estimated Gemini cost: ~$${estimatedCost}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });

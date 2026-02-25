/**
 * Pre-cache all Hebrew translations via Google Cloud TTS → Firestore
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
import { GoogleAuth } from 'google-auth-library';

// ── Config ──
const CLOUD_TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const VOICE = 'he-IL-Chirp3-HD-Kore';
const COLLECTION = 'tts-cache';
const DELAY_MS = 100; // Cloud TTS allows 1000 RPM — 100ms is safe

// ── Firebase init ──
const sa = JSON.parse(readFileSync('./speakeasy-learn-firebase-adminsdk-fbsvc-8361c07095.json', 'utf8').trim());
initializeApp({ credential: cert(sa) });
const db = getFirestore();

// ── Google Auth for Cloud TTS ──
const auth = new GoogleAuth({
  credentials: sa,
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

async function getToken() {
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}

// ── Load all Hebrew translations from data files ──
function loadTranslations() {
  const basePath = './vite-prod/src/data';
  const all = new Set();

  for (const file of ['words-a1.json', 'words-a2.json']) {
    const data = JSON.parse(readFileSync(`${basePath}/${file}`, 'utf8'));
    data.forEach(w => { if (w.translation) all.add(w.translation.trim()); });
  }

  const alpha = JSON.parse(readFileSync(`${basePath}/alphabet-kids.json`, 'utf8'));
  alpha.forEach(letter => {
    if (letter.words) letter.words.forEach(w => { if (w.translation) all.add(w.translation.trim()); });
  });

  const phrases = JSON.parse(readFileSync(`${basePath}/phrases-common.json`, 'utf8'));
  phrases.forEach(p => { if (p.translation) all.add(p.translation.trim()); });

  return [...all].filter(t => t.length > 0);
}

// ── Cache key (same logic as api/tts.js) ──
function cacheKey(text) {
  return Buffer.from(`${text}__${VOICE}`).toString('base64url');
}

// ── Call Google Cloud TTS ──
async function generateTTS(text, token) {
  const response = await fetch(CLOUD_TTS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: 'he-IL',
        name: VOICE,
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) throw new Error(`RATE_LIMITED: ${err}`);
    throw new Error(`Cloud TTS ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.audioContent; // base64 MP3
}

// ── Main ──
async function main() {
  const translations = loadTranslations();
  console.log(`\nFound ${translations.length} unique Hebrew translations\n`);

  // Check which are already cached
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

  // Get access token
  let token = await getToken();
  let tokenTime = Date.now();

  // Generate and cache
  let success = 0;
  let failed = 0;
  const failedWords = [];

  for (let i = 0; i < toGenerate.length; i++) {
    const text = toGenerate[i];
    const pct = Math.round(((i + 1) / toGenerate.length) * 100);
    process.stdout.write(`  [${pct}%] ${i + 1}/${toGenerate.length} "${text}" ... `);

    // Refresh token every 30 minutes
    if (Date.now() - tokenTime > 30 * 60 * 1000) {
      token = await getToken();
      tokenTime = Date.now();
    }

    let retries = 3;
    while (retries > 0) {
      try {
        const audioBase64 = await generateTTS(text, token);
        if (audioBase64) {
          await db.collection(COLLECTION).doc(cacheKey(text)).set({
            audio: audioBase64,
            mimeType: 'audio/mpeg',
            text,
            voice: VOICE,
            createdAt: new Date().toISOString(),
          });
          console.log('OK');
          success++;
          break;
        } else {
          console.log('no audio');
          failed++;
          failedWords.push(text);
          break;
        }
      } catch (e) {
        if (e.message.startsWith('RATE_LIMITED') && retries > 1) {
          process.stdout.write('rate limited, waiting 10s... ');
          await new Promise(r => setTimeout(r, 10000));
          retries--;
        } else {
          console.log(`error: ${e.message.slice(0, 80)}`);
          failed++;
          failedWords.push(text);
          break;
        }
      }
    }

    // Short delay between requests
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
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });

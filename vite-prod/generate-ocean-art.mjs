#!/usr/bin/env node
/**
 * Generate Ocean World art assets using OpenAI DALL-E 3.
 *
 * Usage:
 *   export OPENAI_API_KEY=sk-...
 *   node generate-ocean-art.mjs
 *
 * Cost: ~$0.50-$1.00 total (12 images × $0.04-$0.08 each)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.join(__dirname, 'public', 'images', 'adventure');

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('Missing OPENAI_API_KEY. Run:\n  export OPENAI_API_KEY=sk-...');
  process.exit(1);
}

// Style prefix for consistency
const STYLE = 'cute 2D cartoon game art, children\'s storybook illustration style, vibrant saturated colors, soft cel shading, rounded shapes, warm lighting, no text, no watermarks, clean vector-like edges';

// DALL-E 3 only supports: 1024x1024, 1024x1792, 1792x1024
const WIDE = '1792x1024';
const SQUARE = '1024x1024';

const ASSETS = [
  // ── SCENE BACKGROUNDS (WIDE) ──
  {
    file: 'backgrounds/ocean-scene1-reef.jpg',
    size: WIDE,
    prompt: `Underwater coral reef scene for children's 2D adventure game, colorful coral formations in pink orange and purple, tropical fish swimming around, sunlight rays streaming through clear blue water, sandy ocean floor, sea anemones and starfish, magical underwater atmosphere, ${STYLE}`,
  },
  {
    file: 'backgrounds/ocean-scene2-ship.jpg',
    size: WIDE,
    prompt: `Sunken pirate ship underwater scene for children's 2D adventure game, old wooden ship resting on ocean floor, treasure chest with golden glow peeking out, seaweed and barnacles covering the hull, small fish swimming through portholes, mysterious but friendly atmosphere, blue-green water, ${STYLE}`,
  },
  {
    file: 'backgrounds/ocean-scene3-garden.jpg',
    size: WIDE,
    prompt: `Beautiful underwater sea garden for children's 2D adventure game, lush kelp forest with tall swaying seaweed, colorful sea flowers and plants, bioluminescent elements glowing softly, jellyfish floating gracefully, peaceful magical underwater garden, ${STYLE}`,
  },
  {
    file: 'backgrounds/ocean-scene4-cave.jpg',
    size: WIDE,
    prompt: `Underwater cave entrance for children's 2D adventure game, dark blue rocky cave with glowing crystals on walls, bioluminescent mushrooms and sea creatures providing soft light, mysterious but not scary, gentle blue and purple lighting, stalactites dripping, ${STYLE}`,
  },
  {
    file: 'backgrounds/ocean-scene5-trench.jpg',
    size: WIDE,
    prompt: `Deep ocean trench scene for children's 2D adventure game, dark deep water fading to navy blue, glowing deep-sea creatures providing points of light, rocky cliff walls on sides, mysterious bioluminescent plants, three glowing lanterns visible in distance, dramatic but child-friendly, ${STYLE}`,
  },
  {
    file: 'backgrounds/ocean-scene6-whale.jpg',
    size: WIDE,
    prompt: `Epic underwater arena for children's 2D adventure game boss battle, wide open ocean space with coral formations forming a natural amphitheater, sunlight streaming from above creating a spotlight effect, sparkles and bubbles everywhere, magical golden glow, grand and exciting atmosphere, ${STYLE}`,
  },

  // ── NPC CHARACTERS (SQUARE) ──
  {
    file: 'characters/dolphin-dina.jpg',
    size: SQUARE,
    prompt: `Cute cartoon dolphin character for children's game, friendly blue dolphin with lighter belly, big sparkling eyes, wearing a small pearl necklace, playful happy expression, jumping pose with fins spread, full body, solid white background, ${STYLE}`,
  },
  {
    file: 'characters/turtle-tami.jpg',
    size: SQUARE,
    prompt: `Cute cartoon sea turtle character for children's game, green shell with colorful pattern, gentle wise eyes, wearing a tiny sailor hat, calm friendly smile, swimming pose, full body, solid white background, ${STYLE}`,
  },
  {
    file: 'characters/octopus-oscar.jpg',
    size: SQUARE,
    prompt: `Cute cartoon octopus character for children's game, purple body with lighter spots, eight curly tentacles, big round eyes wearing small round glasses, holding a tiny book in one tentacle, scholarly but playful expression, full body, solid white background, ${STYLE}`,
  },
  {
    file: 'characters/seahorse-sandy.jpg',
    size: SQUARE,
    prompt: `Cute cartoon seahorse character for children's game, orange and yellow colors, curly tail, delicate fins, wearing a tiny coral crown, graceful elegant pose, gentle kind eyes, full body, solid white background, ${STYLE}`,
  },
  {
    file: 'characters/crab-carlos.jpg',
    size: SQUARE,
    prompt: `Cute cartoon crab character for children's game, bright red shell with orange accents, big friendly claws raised up, wearing a tiny bandana, confident brave expression, standing upright pose, full body, solid white background, ${STYLE}`,
  },
  {
    file: 'characters/whale-wendy.jpg',
    size: SQUARE,
    prompt: `Cute cartoon whale character for children's game, deep blue body with lighter belly, large but friendly, tiny crown on head, big warm eyes, spraying a small rainbow water spout, majestic but adorable, full body, solid white background, ${STYLE}`,
  },
];

// ── API call ──
async function generateImage(prompt, size) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality: 'standard',
      response_format: 'url',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.data[0].url;
}

// ── Download image ──
async function downloadImage(url, filePath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

// ── Main ──
async function main() {
  console.log(`\nGenerating ${ASSETS.length} Ocean World assets with DALL-E 3...\n`);

  // Check which already exist (skip them)
  const todo = ASSETS.filter(a => {
    const fp = path.join(BASE_DIR, a.file);
    if (fs.existsSync(fp)) {
      console.log(`Skip (exists): ${a.file}`);
      return false;
    }
    return true;
  });

  if (todo.length === 0) {
    console.log('\nAll images already exist! Delete any to regenerate.\n');
    return;
  }

  console.log(`\n${todo.length} images to generate (${ASSETS.length - todo.length} already exist)\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < todo.length; i++) {
    const asset = todo[i];
    const filePath = path.join(BASE_DIR, asset.file);
    const progress = `[${i + 1}/${todo.length}]`;

    try {
      console.log(`${progress} Generating: ${asset.file}...`);
      const url = await generateImage(asset.prompt, asset.size);
      await downloadImage(url, filePath);
      console.log(`${progress} Saved: ${asset.file}`);
      success++;

      // Small delay to avoid rate limits
      if (i < todo.length - 1) {
        await new Promise(r => setTimeout(r, 9000));
      }
    } catch (err) {
      console.error(`${progress} Failed: ${asset.file} — ${err.message}`);
      failed++;
      if (err.message.includes('429') || err.message.includes('rate')) {
        console.log('   Rate limited, waiting 60s...');
        await new Promise(r => setTimeout(r, 60000));
      }
    }
  }

  console.log(`\nDone! ${success} generated, ${failed} failed\n`);
  console.log(`Images saved to: ${BASE_DIR}/\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

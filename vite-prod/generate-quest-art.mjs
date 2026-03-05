#!/usr/bin/env node
/**
 * Generate quest game art assets using OpenAI DALL-E 3.
 *
 * Usage:
 *   export OPENAI_API_KEY=sk-...
 *   node generate-quest-art.mjs
 *
 * Cost: ~$0.50 total (7 images × $0.04-$0.08 each)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.join(__dirname, 'public', 'images', 'quest');

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY. Run:\n  export OPENAI_API_KEY=sk-...');
  process.exit(1);
}

// Same style prefix as adventure art for consistency
const STYLE = 'cute 2D cartoon game art, children\'s storybook illustration style, vibrant saturated colors, soft cel shading, rounded shapes, warm lighting, no text, no watermarks, clean vector-like edges';

// DALL-E 3 only supports: 1024x1024, 1024x1792, 1792x1024
const WIDE = '1792x1024';
const SQUARE = '1024x1024';

const ASSETS = [
  // ── BACKGROUNDS (3 new) ──
  {
    file: 'backgrounds/school-bg.jpg',
    size: WIDE,
    prompt: `Spooky cartoon school hallway at night for children's game, purple and indigo tones, rows of lockers with magical glowing runes, floating ghostly chalk drawings, flickering lanterns along walls, mysterious purple fog on floor, arched ceiling with cobwebs, eerie but cute not scary atmosphere, ${STYLE}`,
  },
  {
    file: 'backgrounds/space-bg.jpg',
    size: WIDE,
    prompt: `Space station interior with starfield view for children's game, dark blue and indigo tones, large curved windows showing colorful nebula and stars, glowing control panels with cute buttons, floating planets visible outside, holographic displays, futuristic but friendly atmosphere, ${STYLE}`,
  },
  {
    file: 'backgrounds/ocean-bg.jpg',
    size: WIDE,
    prompt: `Underwater ocean scene for children's game, cyan and deep blue tones, colorful coral reef at bottom, tropical fish swimming, sunlight rays filtering through water surface above, bubbles floating upward, seaweed gently swaying, treasure chest partially buried in sand, magical bioluminescent jellyfish, ${STYLE}`,
  },

  // ── BOSS CHARACTERS (3 new) ──
  {
    file: 'bosses/ghost-boss.jpg',
    size: SQUARE,
    prompt: `Cute cartoon ghost boss character for children's game, translucent white and purple glowing body, wearing a tiny wizard hat, mischievous but friendly expression, big round eyes, floating with a wispy tail, surrounded by purple magical sparkles, not scary but playful, full body, solid white background, ${STYLE}`,
  },
  {
    file: 'bosses/alien-boss.jpg',
    size: SQUARE,
    prompt: `Friendly cartoon alien boss character for children's game, green skin with purple spots, big curious eyes, small antennae with glowing tips, wearing a space suit with star badge, holding a ray gun that shoots confetti, three fingers on each hand, standing upright, full body, solid white background, ${STYLE}`,
  },
  {
    file: 'bosses/octopus-boss.jpg',
    size: SQUARE,
    prompt: `Cute cartoon octopus boss character for children's game, pink and coral colored, eight curly tentacles, wearing a tiny pirate hat, one tentacle holding a small trident, big friendly eyes with long eyelashes, suction cups visible on tentacles, playful expression, full body, solid white background, ${STYLE}`,
  },

  // ── SCENE ICON (1 new — forest/ocean/space reuse adventure icons) ──
  {
    file: 'icons/school-icon.jpg',
    size: SQUARE,
    prompt: `Circular icon badge for haunted school world in children's game, purple toned school building with ghostly glow, small friendly ghost peeking from window, ornate golden circular frame border, centered composition, solid white background, ${STYLE}`,
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
  console.log(`\n🎨 Generating ${ASSETS.length} quest game assets with DALL-E 3...\n`);

  // Check which already exist (skip them)
  const todo = ASSETS.filter(a => {
    const fp = path.join(BASE_DIR, a.file);
    if (fs.existsSync(fp)) {
      console.log(`⏭️  Skip (exists): ${a.file}`);
      return false;
    }
    return true;
  });

  if (todo.length === 0) {
    console.log('\n✅ All images already exist! Delete any to regenerate.\n');
    return;
  }

  console.log(`\n📦 ${todo.length} images to generate (${ASSETS.length - todo.length} already exist)\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < todo.length; i++) {
    const asset = todo[i];
    const filePath = path.join(BASE_DIR, asset.file);
    const progress = `[${i + 1}/${todo.length}]`;

    try {
      console.log(`${progress} 🖼️  Generating: ${asset.file}...`);
      const url = await generateImage(asset.prompt, asset.size);
      await downloadImage(url, filePath);
      console.log(`${progress} ✅ Saved: ${asset.file}`);
      success++;

      // Small delay to avoid rate limits (DALL-E 3: 7 images/min for tier 1)
      if (i < todo.length - 1) {
        await new Promise(r => setTimeout(r, 9000));
      }
    } catch (err) {
      console.error(`${progress} ❌ Failed: ${asset.file} — ${err.message}`);
      failed++;
      // On rate limit, wait longer
      if (err.message.includes('429') || err.message.includes('rate')) {
        console.log('   ⏳ Rate limited, waiting 60s...');
        await new Promise(r => setTimeout(r, 60000));
      }
    }
  }

  console.log(`\n🏁 Done! ✅ ${success} generated, ❌ ${failed} failed\n`);
  console.log(`Images saved to: ${BASE_DIR}/\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

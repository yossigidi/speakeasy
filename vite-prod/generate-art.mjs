#!/usr/bin/env node
/**
 * Generate all adventure game art assets using OpenAI DALL-E 3.
 *
 * Usage:
 *   export OPENAI_API_KEY=sk-...
 *   node generate-art.mjs
 *
 * Cost: ~$1.50-$2.00 total (27 images × $0.04-$0.08 each)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.join(__dirname, 'public', 'images', 'adventure');

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('❌ Missing OPENAI_API_KEY. Run:\n  export OPENAI_API_KEY=sk-...');
  process.exit(1);
}

// Style prefix for consistency
const STYLE = 'cute 2D cartoon game art, children\'s storybook illustration style, vibrant saturated colors, soft cel shading, rounded shapes, warm lighting, no text, no watermarks, clean vector-like edges';

// DALL-E 3 only supports: 1024x1024, 1024x1792, 1792x1024
const WIDE = '1792x1024';
const SQUARE = '1024x1024';
const TALL = '1024x1792';

const ASSETS = [
  // ── BACKGROUNDS ──
  {
    file: 'backgrounds/forest-sky.webp',
    size: WIDE,
    prompt: `Seamless horizontal tileable sky background for 2D game, soft gradient from light blue to warm peach, fluffy white cartoon clouds, golden sun rays peeking through, dreamy atmosphere, ${STYLE}`,
  },
  {
    file: 'backgrounds/forest-trees-far.webp',
    size: WIDE,
    prompt: `Seamless horizontal tileable background layer, distant misty forest treeline, soft green and teal tones, layered pine and oak trees fading into mist, magical sparkles floating between trees, 2D game parallax layer, ${STYLE}`,
  },
  {
    file: 'backgrounds/forest-trees-near.webp',
    size: WIDE,
    prompt: `Seamless horizontal tileable foreground trees for 2D platformer, large detailed cartoon oak trees with thick trunks, lush green leaves, hanging vines, colorful mushrooms at base, wildflowers, dappled sunlight, ${STYLE}`,
  },
  {
    file: 'backgrounds/forest-ground.webp',
    size: WIDE,
    prompt: `Seamless horizontal tileable ground for 2D game, lush green grass with wildflowers, small stones, fallen leaves, dirt path winding through, warm earth tones, ${STYLE}`,
  },
  {
    file: 'backgrounds/world-map.webp',
    size: TALL,
    prompt: `Top-down fantasy world map for children's game, parchment paper texture, illustrated regions: green forest area top-left, blue ocean area top-right, dark purple space area bottom-left, golden castle area bottom-right, winding paths connecting them, compass rose in corner, cute cartoon treasure map style, warm aged paper tones, ${STYLE}`,
  },

  // ── SCENE OBJECTS ──
  {
    file: 'objects/forest-gate.webp',
    size: SQUARE,
    prompt: `Magical wooden gate in enchanted forest, large ornate wooden double doors with iron hinges, glowing runes carved into wood, vines and flowers growing around frame, stone archway, golden keyhole glowing, locked with magical chains, front view, solid white background, ${STYLE}`,
  },
  {
    file: 'objects/forest-gate-open.webp',
    size: SQUARE,
    prompt: `Same magical wooden gate but now swung wide open, golden light streaming through doorway, sparkles and magical particles around the opening, vines and flowers blooming, welcoming forest path visible through gate, front view, solid white background, ${STYLE}`,
  },
  {
    file: 'objects/bridge-broken.webp',
    size: WIDE,
    prompt: `Broken wooden rope bridge over a forest ravine, planks missing in the middle, frayed ropes hanging, misty gap below, mossy rocks on both sides, side view, solid white background, ${STYLE}`,
  },
  {
    file: 'objects/bridge-fixed.webp',
    size: WIDE,
    prompt: `Repaired magical wooden rope bridge over forest ravine, all planks intact and glowing with golden magic, sparkles on new planks, sturdy ropes, side view, solid white background, ${STYLE}`,
  },
  {
    file: 'objects/berry-bushes.webp',
    size: SQUARE,
    prompt: `Colorful berry bushes in forest clearing, red strawberries blue blueberries purple grapes on green bushes, woven baskets nearby, sunlit clearing, solid white background, ${STYLE}`,
  },
  {
    file: 'objects/forest-river.webp',
    size: WIDE,
    prompt: `Cartoon forest river with stepping stones, clear blue sparkling water, smooth round stones partially submerged, cattails and lily pads on edges, fish jumping, solid white background, ${STYLE}`,
  },
  {
    file: 'objects/cave-entrance.webp',
    size: SQUARE,
    prompt: `Mysterious dark cave entrance in forest hillside, three small glowing doors visible inside cave in red blue and green colors, bioluminescent mushrooms around entrance, fireflies floating, spooky but friendly atmosphere, ${STYLE}`,
  },
  {
    file: 'objects/dragon-lair.webp',
    size: WIDE,
    prompt: `Dragon's cozy lair in forest clearing, large flat rock like a stage, treasure chest with gold coins, dragon-sized nest with colorful gems, torches on rock pillars, warm orange lighting, epic but cute atmosphere, ${STYLE}`,
  },

  // ── WORLD ICONS ──
  {
    file: 'objects/world-icon-forest.webp',
    size: SQUARE,
    prompt: `Circular icon badge for forest world in children's game, lush green trees with sunlight, cute fox peeking from behind a tree, ornate golden circular frame border, centered composition, solid white background, ${STYLE}`,
  },
  {
    file: 'objects/world-icon-ocean.webp',
    size: SQUARE,
    prompt: `Circular icon badge for ocean world in children's game, blue waves and coral reef, friendly tropical fish, ornate golden circular frame with a small padlock on top, slightly desaturated colors to show locked state, centered, solid white background, ${STYLE}`,
  },
  {
    file: 'objects/world-icon-space.webp',
    size: SQUARE,
    prompt: `Circular icon badge for space world in children's game, purple starry sky with rocket ship and colorful planets, ornate golden circular frame with small padlock, slightly desaturated locked state, centered, solid white background, ${STYLE}`,
  },
  {
    file: 'objects/world-icon-castle.webp',
    size: SQUARE,
    prompt: `Circular icon badge for castle world in children's game, golden castle towers with flags waving and rainbow, ornate golden circular frame with small padlock, slightly desaturated locked state, centered, solid white background, ${STYLE}`,
  },

  // ── NPC CHARACTERS ──
  {
    file: 'characters/fox-felix.webp',
    size: SQUARE,
    prompt: `Cute cartoon fox character for children's game, orange fur with white chest, big friendly eyes, wearing a tiny green scarf, standing upright on hind legs, waving one paw, adventurous happy expression, full body three-quarter view, solid white background, ${STYLE}`,
  },
  {
    file: 'characters/owl-oliver.webp',
    size: SQUARE,
    prompt: `Cute cartoon owl character for children's game, brown and cream feathers, large round wise eyes wearing small round glasses, tiny graduation cap on head, perched upright, one wing raised as if teaching, scholarly but friendly expression, full body, solid white background, ${STYLE}`,
  },
  {
    file: 'characters/bunny-bella.webp',
    size: SQUARE,
    prompt: `Cute cartoon bunny character for children's game, soft pink and white fur, long floppy ears with pink insides, holding a small basket of colorful berries, wearing a flower crown, happy cheerful expression, full body standing upright, solid white background, ${STYLE}`,
  },
  {
    file: 'characters/deer-danny.webp',
    size: SQUARE,
    prompt: `Cute cartoon young deer character for children's game, light brown fur with white spots, small antlers with tiny flowers growing on them, wearing a blue bandana around neck, gentle kind expression, full body standing, solid white background, ${STYLE}`,
  },
  {
    file: 'characters/firefly-glowy.webp',
    size: SQUARE,
    prompt: `Cute cartoon firefly character for children's game, round glowing body with warm yellow-green bioluminescent light, tiny transparent wings, big sparkly eyes, friendly smile, trailing sparkle particles behind, magical appearance, full body, solid white background, ${STYLE}`,
  },
  {
    file: 'characters/dragon-drago.webp',
    size: SQUARE,
    prompt: `Cute cartoon baby dragon character for children's game, purple and teal scales, small bat-like wings, round belly, tiny horns, breathing a small harmless colorful flame, wearing a golden crown, friendly not scary, full body standing, solid white background, ${STYLE}`,
  },

  // ── UI ELEMENTS ──
  {
    file: 'objects/coin.webp',
    size: SQUARE,
    prompt: `Single shiny golden coin with star emblem in center for children's game, cartoon style, slight 3D metallic effect, sparkle highlight on top-left, clean simple design, centered, solid white background, ${STYLE}`,
  },
  {
    file: 'objects/star-full.webp',
    size: SQUARE,
    prompt: `Single golden five-pointed star with happy cute face for children's game reward, glowing warm golden color, sparkle effects radiating outward, cartoon style, centered, solid white background, ${STYLE}`,
  },
  {
    file: 'objects/star-empty.webp',
    size: SQUARE,
    prompt: `Single empty five-pointed star outline for children's game, thin gray outline of star shape, no fill, simple clean design, same proportions as a reward star, centered, solid white background, ${STYLE}`,
  },
  {
    file: 'objects/speech-bubble.webp',
    size: WIDE,
    prompt: `Cartoon speech bubble for children's game dialogue system, white puffy cloud shape with soft blue outline border, small triangular tail pointing down-left, clean and simple, slightly rounded and bubbly, centered, solid transparent-looking light gray background, ${STYLE}`,
  },
];

// ── API call ──
async function generateImage(prompt, size) {
  const [w, h] = size.split('x');
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
  console.log(`\n🎨 Generating ${ASSETS.length} adventure game assets with DALL-E 3...\n`);

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

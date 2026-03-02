# Speakli Adventure — AI Art Generation Prompts

Use these prompts with Midjourney, DALL-E 3, Leonardo AI, or similar tools.
All assets should share a **consistent art style**: cute 2D cartoon, vibrant colors, soft lighting, children's storybook illustration, similar to Angry Birds / Cut the Rope / Toca Boca games.

**Important**: After generating, export as `.webp` or `.png` with transparent backgrounds where noted.

---

## Global Style Prefix (add to ALL prompts)

```
cute 2D cartoon game art, children's storybook illustration style, vibrant saturated colors, soft cel shading, rounded shapes, warm lighting, no text, no watermarks, clean vector-like edges --style raw
```

---

## 1. FOREST BACKGROUNDS (Parallax Layers)

Each background is split into 3-4 horizontal layers that scroll at different speeds. Generate each layer separately.

### 1a. Forest Sky Layer (furthest back)
```
seamless horizontal tileable sky background for 2D game, soft gradient from light blue to warm peach, fluffy white cartoon clouds, golden sun rays peeking through, dreamy atmosphere, cute children's game style, 1920x400 pixels, flat 2D illustration
```
**File**: `backgrounds/forest-sky.webp` — Size: 1920x400

### 1b. Forest Far Trees Layer
```
seamless horizontal tileable background layer, distant misty forest treeline silhouette, soft green and teal tones, layered pine and oak trees fading into mist, magical sparkles floating between trees, 2D game parallax layer, transparent bottom, cute cartoon style, 1920x500 pixels
```
**File**: `backgrounds/forest-trees-far.webp` — Size: 1920x500, transparent bottom

### 1c. Forest Near Trees Layer
```
seamless horizontal tileable foreground trees for 2D platformer, large detailed cartoon oak trees with thick trunks, lush green leaves, hanging vines, colorful mushrooms at base, wildflowers, dappled sunlight, vibrant children's game art, 1920x600 pixels, transparent top and bottom
```
**File**: `backgrounds/forest-trees-near.webp` — Size: 1920x600, transparent top/bottom

### 1d. Forest Ground Layer
```
seamless horizontal tileable ground for 2D game, lush green grass with wildflowers, small stones, fallen leaves, dirt path winding through, cute cartoon style, warm earth tones, 1920x300 pixels, children's storybook illustration
```
**File**: `backgrounds/forest-ground.webp` — Size: 1920x300

---

## 2. SCENE-SPECIFIC OBJECTS

### 2a. Magical Forest Gate (Scene 1)
```
magical wooden gate in enchanted forest, large ornate wooden double doors with iron hinges, glowing runes carved into wood, vines and flowers growing around frame, stone archway, golden keyhole glowing, locked with magical chains, cute 2D cartoon game art style, front view, transparent background, 512x512 pixels
```
**File**: `objects/forest-gate.webp` — Size: 512x512, transparent BG

### 2b. Magical Forest Gate OPEN (Scene 1 — after exercise)
```
same magical wooden gate but now swung wide open, golden light streaming through doorway, sparkles and magical particles around the opening, vines and flowers blooming, welcoming path visible through gate, cute 2D cartoon game art, front view, transparent background, 512x512 pixels
```
**File**: `objects/forest-gate-open.webp` — Size: 512x512, transparent BG

### 2c. Broken Bridge (Scene 2)
```
broken wooden rope bridge over a forest ravine, planks missing in the middle, frayed ropes hanging, misty gap below, mossy rocks on both sides, cute cartoon 2D game object, side view, transparent background, 600x300 pixels
```
**File**: `objects/bridge-broken.webp` — Size: 600x300, transparent BG

### 2d. Fixed Bridge (Scene 2 — after exercise)
```
repaired wooden rope bridge over forest ravine, all planks intact and glowing with magic, golden sparkles on new planks, sturdy ropes, cute cartoon 2D game art, side view, transparent background, 600x300 pixels
```
**File**: `objects/bridge-fixed.webp` — Size: 600x300, transparent BG

### 2e. Berry Bushes (Scene 3)
```
colorful berry bushes in forest clearing, red strawberries blue blueberries purple grapes on green bushes, woven baskets nearby, sunlit clearing, cute 2D cartoon game art, transparent background, 500x400 pixels
```
**File**: `objects/berry-bushes.webp` — Size: 500x400, transparent BG

### 2f. Forest River (Scene 4)
```
cartoon forest river with stepping stones, clear blue sparkling water, smooth round stones partially submerged, cattails and lily pads on edges, fish jumping, cute 2D game background element, 800x300 pixels
```
**File**: `objects/forest-river.webp` — Size: 800x300, transparent BG

### 2g. Dark Cave Entrance (Scene 5)
```
mysterious dark cave entrance in forest hillside, three small glowing doors visible inside cave (red, blue, green), bioluminescent mushrooms around entrance, fireflies floating, spooky but friendly atmosphere, cute 2D cartoon game art, 600x500 pixels, transparent background
```
**File**: `objects/cave-entrance.webp` — Size: 600x500, transparent BG

### 2h. Dragon's Lair (Scene 6)
```
dragon's cozy lair in forest clearing, large flat rock like a stage, treasure chest with gold coins, dragon-sized nest with colorful gems, torches on rock pillars, warm orange lighting, epic but cute atmosphere, 2D cartoon game art, 800x500 pixels
```
**File**: `objects/dragon-lair.webp` — Size: 800x500, transparent BG

---

## 3. NPC CHARACTERS

All characters should be facing slightly to the right (3/4 view), with friendly expressions, on transparent backgrounds, sized around 256x256.

### 3a. Felix the Fox
```
cute cartoon fox character for children's game, orange fur with white chest, big friendly eyes, wearing a tiny green scarf, standing on hind legs, waving one paw, adventurous expression, full body, 2D game character sprite, transparent background, 256x256 pixels
```
**File**: `characters/fox-felix.webp` — Size: 256x256, transparent BG

### 3b. Oliver the Owl
```
cute cartoon owl character for children's game, brown and cream feathers, large round wise eyes with glasses, small graduation cap, perched on a branch, one wing raised as if teaching, scholarly but friendly, full body, 2D game sprite, transparent background, 256x256 pixels
```
**File**: `characters/owl-oliver.webp` — Size: 256x256, transparent BG

### 3c. Bella the Bunny
```
cute cartoon bunny character for children's game, soft pink and white fur, long floppy ears with pink insides, holding a small basket of berries, wearing a flower crown, happy cheerful expression, full body, 2D game sprite, transparent background, 256x256 pixels
```
**File**: `characters/bunny-bella.webp` — Size: 256x256, transparent BG

### 3d. Danny the Deer
```
cute cartoon deer character for children's game, light brown fur with white spots, small antlers with flowers growing on them, wearing a blue bandana, gentle kind expression, standing at river edge, full body, 2D game sprite, transparent background, 256x256 pixels
```
**File**: `characters/deer-danny.webp` — Size: 256x256, transparent BG

### 3e. Glowy the Firefly
```
cute cartoon firefly character for children's game, round glowing body with warm yellow-green light, tiny transparent wings, big sparkly eyes, friendly smile, trailing sparkle particles, magical appearance, full body, 2D game sprite, transparent background, 256x256 pixels
```
**File**: `characters/firefly-glowy.webp` — Size: 256x256, transparent BG

### 3f. Drago the Dragon
```
cute cartoon baby dragon character for children's game, purple and teal scales, small wings, round belly, tiny horns, breathing a small harmless flame, wearing a golden crown, friendly not scary, full body, 2D game sprite, transparent background, 256x256 pixels
```
**File**: `characters/dragon-drago.webp` — Size: 256x256, transparent BG

---

## 4. WORLD MAP ELEMENTS

### 4a. World Map Background
```
top-down fantasy world map for children's game, parchment paper texture, illustrated regions: green forest area, blue ocean area, dark purple space area, golden castle area, winding paths connecting them, compass rose in corner, cute cartoon treasure map style, warm aged paper tones, 1080x1920 pixels (portrait mobile)
```
**File**: `backgrounds/world-map.webp` — Size: 1080x1920

### 4b. Forest World Icon
```
circular icon badge for forest world in children's game, lush green trees, sunlight, cute fox peeking out, golden frame border, vibrant cartoon style, transparent background, 200x200 pixels
```
**File**: `objects/world-icon-forest.webp` — Size: 200x200, transparent BG

### 4c. Ocean World Icon (locked)
```
circular icon badge for ocean world in children's game, blue waves, coral reef, friendly fish, golden frame with a small padlock, slightly desaturated to show locked state, cartoon style, transparent background, 200x200 pixels
```
**File**: `objects/world-icon-ocean.webp` — Size: 200x200, transparent BG

### 4d. Space World Icon (locked)
```
circular icon badge for space world in children's game, purple starry sky, rocket ship, planets, golden frame with padlock, slightly desaturated locked state, cartoon style, transparent background, 200x200 pixels
```
**File**: `objects/world-icon-space.webp` — Size: 200x200, transparent BG

### 4e. Castle World Icon (locked)
```
circular icon badge for castle world in children's game, golden castle towers, flags waving, rainbow, golden frame with padlock, slightly desaturated locked state, cartoon style, transparent background, 200x200 pixels
```
**File**: `objects/world-icon-castle.webp` — Size: 200x200, transparent BG

---

## 5. UI ELEMENTS

### 5a. Coin
```
shiny golden coin with star emblem for children's game, cartoon style, slight 3D effect, sparkle highlight, transparent background, 64x64 pixels
```
**File**: `objects/coin.webp` — Size: 64x64, transparent BG

### 5b. Star (reward)
```
golden cartoon star with happy face for children's game, glowing, sparkle effects, 3 versions: empty outline, half-filled, fully filled gold, transparent background, 64x64 pixels each
```
**File**: `objects/star-full.webp`, `objects/star-empty.webp` — Size: 64x64, transparent BG

### 5c. Speech Bubble
```
cartoon speech bubble for children's game dialogue, white with soft blue outline, rounded puffy cloud shape, small tail pointing down-left, clean and simple, transparent background, 400x200 pixels
```
**File**: `objects/speech-bubble.webp` — Size: 400x200, transparent BG

---

## 6. SPEAKLI CHARACTER POSES

If you want dedicated adventure poses for Speakli (instead of reusing the existing icon):

### 6a. Speakli Walking
```
cute cartoon penguin character "Speakli" walking pose for children's educational game, dark blue body with white belly, orange beak and feet, wearing a small blue scarf, mid-stride walking animation pose, cheerful expression, full body side view, 2D game sprite, transparent background, 256x256 pixels
```
**File**: `characters/speakli-walk.webp`

### 6b. Speakli Celebrating
```
same cute cartoon penguin "Speakli" jumping with joy, arms raised, confetti around, huge happy smile, starry eyes, blue scarf flowing, celebration pose, 2D game sprite, transparent background, 256x256 pixels
```
**File**: `characters/speakli-celebrate.webp`

### 6c. Speakli Talking
```
same cute cartoon penguin "Speakli" talking pose, one flipper raised as if explaining, mouth open, friendly teaching expression, blue scarf, 2D game sprite, transparent background, 256x256 pixels
```
**File**: `characters/speakli-talk.webp`

### 6d. Speakli Sad
```
same cute cartoon penguin "Speakli" sad pose, drooping posture, small tear, blue scarf hanging low, sympathetic expression, 2D game sprite, transparent background, 256x256 pixels
```
**File**: `characters/speakli-sad.webp`

---

## File Placement Summary

After generating, place files in:
```
vite-prod/public/images/adventure/
  backgrounds/
    forest-sky.webp
    forest-trees-far.webp
    forest-trees-near.webp
    forest-ground.webp
    world-map.webp
  characters/
    fox-felix.webp
    owl-oliver.webp
    bunny-bella.webp
    deer-danny.webp
    firefly-glowy.webp
    dragon-drago.webp
    speakli-walk.webp        (optional)
    speakli-celebrate.webp   (optional)
    speakli-talk.webp        (optional)
    speakli-sad.webp         (optional)
  objects/
    forest-gate.webp
    forest-gate-open.webp
    bridge-broken.webp
    bridge-fixed.webp
    berry-bushes.webp
    forest-river.webp
    cave-entrance.webp
    dragon-lair.webp
    world-icon-forest.webp
    world-icon-ocean.webp
    world-icon-space.webp
    world-icon-castle.webp
    coin.webp
    star-full.webp
    star-empty.webp
    speech-bubble.webp
```

Total: ~27 images (23 required + 4 optional Speakli poses)

---

## Tips for Best Results

1. **Consistency**: Generate all characters in one session if possible, or reference previous outputs
2. **Transparent backgrounds**: If your tool doesn't support transparency, generate on a solid green/magenta background and remove it in an image editor
3. **Seamless tiles**: For background layers, specify "seamless horizontal tileable" — verify the left and right edges match
4. **File size**: Compress to WebP at quality 80-85 for good balance of quality and file size
5. **Mobile**: The game runs on mobile — keep important details large enough to see on small screens

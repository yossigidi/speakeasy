import { Sprite, Texture, Rectangle } from 'pixi.js';

/**
 * Frame-based sprite animation from a sprite sheet texture.
 *
 * Layout: rows = animation states, columns = frames.
 * Each row has a fixed frame count defined in `animations`.
 */
export default class SpriteAnimator {
  /**
   * @param {Texture} sheetTexture - Full sprite sheet texture
   * @param {number} frameWidth - Width of a single frame
   * @param {number} frameHeight - Height of a single frame
   * @param {Object} animations - { stateName: { row, frames, loop, speed } }
   */
  constructor(sheetTexture, frameWidth, frameHeight, animations) {
    this.sheetTexture = sheetTexture;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.animations = animations;

    // Pre-build frame textures
    this.frameCache = {};
    for (const [name, anim] of Object.entries(animations)) {
      this.frameCache[name] = [];
      for (let i = 0; i < anim.frames; i++) {
        const rect = new Rectangle(
          i * frameWidth,
          anim.row * frameHeight,
          frameWidth,
          frameHeight
        );
        this.frameCache[name].push(new Texture({ source: sheetTexture.source, frame: rect }));
      }
    }

    // Current state
    this.currentAnim = null;
    this.frameIndex = 0;
    this.elapsed = 0;
    this.sprite = new Sprite(this.frameCache[Object.keys(animations)[0]]?.[0] || Texture.EMPTY);
    this.sprite.anchor.set(0.5, 1); // Bottom-center anchor
    this.onComplete = null;
  }

  play(animName, onComplete = null) {
    if (this.currentAnim === animName && this.animations[animName]?.loop) return;
    const anim = this.animations[animName];
    if (!anim) return;
    this.currentAnim = animName;
    this.frameIndex = 0;
    this.elapsed = 0;
    this.onComplete = onComplete;
    this._setFrame();
  }

  update(dt) {
    if (!this.currentAnim) return;
    const anim = this.animations[this.currentAnim];
    const speed = anim.speed || 0.15;
    this.elapsed += dt * speed;

    if (this.elapsed >= 1) {
      this.elapsed -= 1;
      this.frameIndex++;

      if (this.frameIndex >= anim.frames) {
        if (anim.loop) {
          this.frameIndex = 0;
        } else {
          this.frameIndex = anim.frames - 1;
          if (this.onComplete) {
            const cb = this.onComplete;
            this.onComplete = null;
            cb();
          }
          return;
        }
      }
      this._setFrame();
    }
  }

  _setFrame() {
    const frames = this.frameCache[this.currentAnim];
    if (frames && frames[this.frameIndex]) {
      this.sprite.texture = frames[this.frameIndex];
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}

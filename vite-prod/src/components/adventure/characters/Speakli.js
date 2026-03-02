import { Container, Graphics, Text, Texture } from 'pixi.js';
import SpriteAnimator from '../engine/SpriteAnimator.js';

/**
 * Speakli — the main penguin character.
 *
 * Uses placeholder graphics initially (drawn penguin shape).
 * Replace with sprite sheet later by passing a texture to useSpriteSheet().
 */

// Animation state definitions for sprite sheet
const ANIM_DEFS = {
  idle:      { row: 0, frames: 4, loop: true, speed: 0.08 },
  walk:      { row: 1, frames: 8, loop: true, speed: 0.15 },
  jump:      { row: 2, frames: 6, loop: false, speed: 0.12 },
  celebrate: { row: 3, frames: 8, loop: false, speed: 0.12 },
  talk:      { row: 4, frames: 4, loop: true, speed: 0.10 },
  sad:       { row: 5, frames: 4, loop: true, speed: 0.06 },
};

export default class Speakli {
  constructor(engine) {
    this.engine = engine;
    this.container = new Container();
    this.container.label = 'speakli';
    this.animator = null;
    this.state = 'idle';

    // Movement
    this._walkTarget = null;
    this._walkResolve = null;
    this.walkSpeed = 3; // pixels per frame

    // Build placeholder penguin
    this._buildPlaceholder();
    engine.worldLayer.addChild(this.container);
  }

  get x() { return this.container.x; }
  set x(v) { this.container.x = v; }
  get y() { return this.container.y; }
  set y(v) { this.container.y = v; }

  /**
   * Draw a cute penguin placeholder using Graphics.
   */
  _buildPlaceholder() {
    const g = new Graphics();
    const s = 1; // scale factor

    // Body (dark oval)
    g.ellipse(0, -30 * s, 22 * s, 32 * s);
    g.fill({ color: 0x1a1a2e });

    // Belly (white oval)
    g.ellipse(0, -24 * s, 14 * s, 22 * s);
    g.fill({ color: 0xffffff });

    // Left eye
    g.circle(-7 * s, -40 * s, 4 * s);
    g.fill({ color: 0xffffff });
    g.circle(-6 * s, -40 * s, 2.5 * s);
    g.fill({ color: 0x000000 });
    // Eye shine
    g.circle(-5 * s, -41 * s, 1 * s);
    g.fill({ color: 0xffffff });

    // Right eye
    g.circle(7 * s, -40 * s, 4 * s);
    g.fill({ color: 0xffffff });
    g.circle(8 * s, -40 * s, 2.5 * s);
    g.fill({ color: 0x000000 });
    g.circle(9 * s, -41 * s, 1 * s);
    g.fill({ color: 0xffffff });

    // Beak (orange triangle)
    g.moveTo(-5 * s, -34 * s);
    g.lineTo(5 * s, -34 * s);
    g.lineTo(0, -28 * s);
    g.closePath();
    g.fill({ color: 0xf59e0b });

    // Left wing
    g.ellipse(-24 * s, -28 * s, 8 * s, 18 * s);
    g.fill({ color: 0x1a1a2e });

    // Right wing
    g.ellipse(24 * s, -28 * s, 8 * s, 18 * s);
    g.fill({ color: 0x1a1a2e });

    // Left foot
    g.ellipse(-8 * s, 0, 8 * s, 4 * s);
    g.fill({ color: 0xf59e0b });

    // Right foot
    g.ellipse(8 * s, 0, 8 * s, 4 * s);
    g.fill({ color: 0xf59e0b });

    // Scarf (blue, Speakli's signature color)
    g.roundRect(-18 * s, -14 * s, 36 * s, 6 * s, 3);
    g.fill({ color: 0x2563eb });
    // Scarf tail
    g.roundRect(14 * s, -14 * s, 6 * s, 14 * s, 3);
    g.fill({ color: 0x2563eb });

    this._placeholder = g;
    this.container.addChild(g);

    // Name label
    this._nameLabel = new Text({
      text: 'Speakli',
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        fontWeight: 'bold',
        fill: 0x2563eb,
        align: 'center',
      },
    });
    this._nameLabel.anchor.set(0.5, 1);
    this._nameLabel.y = -70;
    this.container.addChild(this._nameLabel);
  }

  /**
   * Swap placeholder for a real sprite sheet.
   */
  useSpriteSheet(texture, frameW, frameH) {
    if (this._placeholder) {
      this.container.removeChild(this._placeholder);
      this._placeholder.destroy();
      this._placeholder = null;
    }
    this.animator = new SpriteAnimator(texture, frameW, frameH, ANIM_DEFS);
    this.container.addChildAt(this.animator.sprite, 0);
    this.animator.play('idle');
  }

  /**
   * Set position using normalized coordinates (0-1).
   */
  setNormalized(nx, ny) {
    this.container.x = nx * this.engine.width;
    this.container.y = ny * this.engine.height;
  }

  /**
   * Walk to a position (pixels). Returns a promise.
   */
  walkTo(targetX, targetY) {
    return new Promise(resolve => {
      this._walkTarget = { x: targetX, y: targetY };
      this._walkResolve = resolve;
      this.setState('walk');

      // Flip direction
      if (targetX < this.container.x) {
        this.container.scale.x = -Math.abs(this.container.scale.x);
      } else {
        this.container.scale.x = Math.abs(this.container.scale.x);
      }
    });
  }

  /**
   * Walk to normalized position.
   */
  walkToNorm(nx, ny) {
    return this.walkTo(nx * this.engine.width, ny * this.engine.height);
  }

  setState(state) {
    if (this.state === state) return;
    this.state = state;
    if (this.animator) {
      this.animator.play(state);
    } else {
      // Placeholder animations via simple transforms
      this._animatePlaceholder(state);
    }
  }

  _animatePlaceholder(state) {
    // Simple bounce/scale effects for placeholder
    switch (state) {
      case 'celebrate':
        this._bounceAnim(6, 300);
        break;
      case 'talk':
        this._talkAnim();
        break;
      case 'sad':
        // Slight tilt
        this.container.rotation = -0.1;
        break;
      case 'idle':
      case 'walk':
        this.container.rotation = 0;
        break;
    }
  }

  _bounceAnim(count, interval) {
    let i = 0;
    const bounce = () => {
      if (i >= count) {
        this.container.y = this._baseY || this.container.y;
        return;
      }
      this._baseY = this._baseY || this.container.y;
      this.container.y = this._baseY - (i % 2 === 0 ? 10 : 0);
      i++;
      setTimeout(bounce, interval);
    };
    bounce();
  }

  _talkAnim() {
    // Gentle scale pulse for talking
    let tick = 0;
    if (this._talkInterval) clearInterval(this._talkInterval);
    this._talkInterval = setInterval(() => {
      tick++;
      const s = 1 + Math.sin(tick * 0.5) * 0.03;
      this.container.scale.y = s;
      if (this.state !== 'talk') {
        clearInterval(this._talkInterval);
        this._talkInterval = null;
        this.container.scale.y = 1;
      }
    }, 50);
  }

  update(dt) {
    // Animator update
    if (this.animator) this.animator.update(dt);

    // Walk movement
    if (this._walkTarget) {
      const dx = this._walkTarget.x - this.container.x;
      const dy = this._walkTarget.y - this.container.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.walkSpeed * dt) {
        this.container.x = this._walkTarget.x;
        this.container.y = this._walkTarget.y;
        this._walkTarget = null;
        this.setState('idle');
        if (this._walkResolve) {
          this._walkResolve();
          this._walkResolve = null;
        }
      } else {
        const nx = dx / dist;
        const ny = dy / dist;
        this.container.x += nx * this.walkSpeed * dt;
        this.container.y += ny * this.walkSpeed * dt;
      }
    }

    // Idle bobbing animation (placeholder only)
    if (!this.animator && this.state === 'idle') {
      this.container.y += Math.sin(Date.now() * 0.003) * 0.15;
    }
  }

  destroy() {
    if (this._talkInterval) clearInterval(this._talkInterval);
    if (this.animator) this.animator.destroy();
    this.container.destroy({ children: true });
  }
}

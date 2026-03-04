import { Sprite, Assets } from 'pixi.js';
import { playCorrect, playComplete, playStar } from '../../../utils/gameSounds.js';

/**
 * Scene lifecycle manager.
 * Handles: scene load → intro animation → dialogue → exercise → reward → transition.
 */
export default class SceneManager {
  constructor(engine, options) {
    this.engine = engine;
    this.options = options;
    this.dialogue = null; // set by AdventureGame after construction
    this.currentWorld = null;
    this.scenes = [];
    this.sceneIndex = 0;
    this.currentScene = null;
    this.npcs = {}; // active NPC instances
    this.sceneObjects = []; // active scene object sprites

    // State flags
    this.isDialogueActive = false;
    this.isExerciseActive = false;
    this.currentExercise = null;
    this._destroyed = false;
    this._worldCompleteTimer = null;
    this._exerciseResolve = null;
  }

  /**
   * Start a world by loading its scenes.
   */
  async startWorld(worldId) {
    this._destroyed = false;
    this.currentWorld = worldId;

    // Dynamic import of world scenes
    let scenesData;
    switch (worldId) {
      case 'forest':
        scenesData = (await import('../../../data/adventure/forest-scenes.js')).FOREST_SCENES;
        break;
      case 'ocean':
        scenesData = (await import('../../../data/adventure/ocean-scenes.js')).OCEAN_SCENES;
        break;
      case 'space':
        scenesData = (await import('../../../data/adventure/space-scenes.js')).SPACE_SCENES;
        break;
      case 'castle':
        scenesData = (await import('../../../data/adventure/castle-scenes.js')).CASTLE_SCENES;
        break;
      default:
        console.warn('Unknown world:', worldId);
        return;
    }

    this.scenes = scenesData;
    this.sceneIndex = 0;

    // Resume from saved progress
    const savedProgress = this.options.adventureProgress?.worldProgress?.[worldId];
    if (savedProgress?.scenesCompleted > 0 && savedProgress.scenesCompleted < scenesData.length) {
      this.sceneIndex = savedProgress.scenesCompleted;
    }

    await this._loadScene(this.sceneIndex);
  }

  /**
   * Stop the scene pipeline (called when quitting mid-scene).
   */
  stop() {
    this._destroyed = true;
    if (this._worldCompleteTimer) {
      clearTimeout(this._worldCompleteTimer);
      this._worldCompleteTimer = null;
    }
    // Resolve any pending exercise promise so _runScene can unwind
    if (this._exerciseResolve) {
      this._exerciseResolve(false);
      this._exerciseResolve = null;
    }
    if (this.currentExercise) {
      try { this.currentExercise.destroy(); } catch {}
      this.currentExercise = null;
    }
  }

  async _loadScene(index) {
    if (this._destroyed) return;
    if (index >= this.scenes.length) {
      this._worldComplete();
      return;
    }

    const scene = this.scenes[index];
    this.currentScene = scene;
    this.sceneIndex = index;

    // Update HUD
    if (this.engine.hud) {
      this.engine.hud.setScene(index, this.scenes.length);
    }

    // Transition
    if (this.engine.transitions && index > 0) {
      await this.engine.transitions.fade(async () => {
        await this._setupScene(scene);
      });
    } else {
      await this._setupScene(scene);
    }

    // Run scene sequence
    await this._runScene(scene);
  }

  async _setupScene(scene) {
    // Clear previous NPCs
    for (const npc of Object.values(this.npcs)) {
      npc.destroy();
    }
    this.npcs = {};

    // Load parallax background
    if (this.engine.parallax && scene.background) {
      await this.engine.parallax.load(scene.background);
    }

    // Setup particles
    if (this.engine.particles && scene.particles) {
      this.engine.particles.configure(scene.particles);
    }

    // Position Speakli
    if (scene.speakliPosition && this.engine.speakli) {
      this.engine.speakli.setNormalized(scene.speakliPosition.x, scene.speakliPosition.y);
    }

    // Clear previous scene objects
    for (const obj of this.sceneObjects) {
      obj.sprite.destroy();
    }
    this.sceneObjects = [];

    // Spawn NPCs (import the right NPC module for the current world)
    if (scene.npcs) {
      let createNPC;
      switch (this.currentWorld) {
        case 'ocean':
          createNPC = (await import('../characters/OceanNPCs.js')).createNPC;
          break;
        case 'space':
          createNPC = (await import('../characters/SpaceNPCs.js')).createNPC;
          break;
        case 'castle':
          createNPC = (await import('../characters/CastleNPCs.js')).createNPC;
          break;
        default:
          createNPC = (await import('../characters/ForestNPCs.js')).createNPC;
          break;
      }
      for (const npcDef of scene.npcs) {
        const npc = createNPC(this.engine, npcDef);
        this.npcs[npcDef.id] = npc;
      }
    }

    // Load scene objects
    if (scene.sceneObjects) {
      for (const objDef of scene.sceneObjects) {
        try {
          const tex = await Assets.load(objDef.asset);
          const sprite = Sprite.from(tex);
          const targetH = objDef.height || 100;
          const scale = targetH / sprite.texture.height;
          sprite.scale.set(scale);
          sprite.anchor.set(0.5, 0.5);
          sprite.x = objDef.position.x * this.engine.width;
          sprite.y = objDef.position.y * this.engine.height;
          this.engine.worldLayer.addChild(sprite);
          this.sceneObjects.push({ def: objDef, sprite });
        } catch {
          // Image failed to load — skip this object
        }
      }
    }
  }

  async _runScene(scene) {
    if (this._destroyed) return;

    // 0. Scene intro video (if defined) — pass narration for TTS
    if (scene.introVideo && this.options.onSceneVideo) {
      await this.options.onSceneVideo({ src: scene.introVideo, narration: scene.videoNarration || null });
      if (this._destroyed) return;
    }

    // 1. Intro animation (walk Speakli to position)
    if (scene.intro?.speakliWalkTo && this.engine.speakli) {
      await this.engine.speakli.walkToNorm(
        scene.intro.speakliWalkTo.x,
        scene.intro.speakliWalkTo.y
      );
      if (this._destroyed) return;
    }

    // Small pause
    await this._wait(400);
    if (this._destroyed) return;

    // 2. Dialogue
    if (scene.dialogue && this.dialogue) {
      this.isDialogueActive = true;
      await this.dialogue.play(scene.dialogue, this.npcs);
      this.isDialogueActive = false;
      if (this._destroyed) return;
    }

    // 3. Exercise
    if (scene.exercise) {
      this.isExerciseActive = true;
      await this._runExercise(scene.exercise);
      this.isExerciseActive = false;
      if (this._destroyed) return;

      // Swap scene objects to "after" state (e.g. gate opens, bridge repairs)
      await this._swapSceneObjects();
      if (this._destroyed) return;
    }

    // 4. Reward
    if (scene.reward) {
      await this._giveReward(scene.reward);
      if (this._destroyed) return;
    }

    // 5. Save progress
    this._saveProgress();

    // 6. Auto-advance to next scene after delay
    await this._wait(800);
    if (this._destroyed) return;
    await this._loadScene(this.sceneIndex + 1);
  }

  async _runExercise(exerciseDef) {
    // Dynamic import exercise type
    let ExerciseClass;
    switch (exerciseDef.type) {
      case 'wordDoor':
        ExerciseClass = (await import('../exercises/WordDoorExercise.js')).default;
        break;
      case 'spellBridge':
        ExerciseClass = (await import('../exercises/SpellBridgeExercise.js')).default;
        break;
      case 'multipleChoice':
        ExerciseClass = (await import('../exercises/MultipleChoiceExercise.js')).default;
        break;
      case 'listenFind':
        ExerciseClass = (await import('../exercises/ListenFindExercise.js')).default;
        break;
      case 'boss':
        // Boss = sequential mixed exercises
        for (const round of exerciseDef.config.rounds) {
          if (this._destroyed) return;
          await this._runExercise(round);
        }
        return;
      default:
        console.warn('Unknown exercise type:', exerciseDef.type);
        return;
    }

    return new Promise(resolve => {
      this._exerciseResolve = resolve;
      this.currentExercise = new ExerciseClass(this.engine, {
        ...exerciseDef.config,
        options: this.options,
        onComplete: (success) => {
          this._exerciseResolve = null;
          if (this.currentExercise) {
            this.currentExercise.destroy();
            this.currentExercise = null;
          }
          resolve(success);
        },
      });
    });
  }

  async _swapSceneObjects() {
    for (const obj of this.sceneObjects) {
      if (!obj.def.assetAfter) continue;
      try {
        const tex = await Assets.load(obj.def.assetAfter);
        obj.sprite.texture = tex;
      } catch {
        // Keep original texture
      }
    }
  }

  async _giveReward(reward) {
    // XP
    if (reward.xp && this.options.onXP) {
      this.options.onXP(reward.xp, 'adventure');
    }

    // Coins
    if (reward.coins && this.engine.hud) {
      this.engine.hud.addCoins(reward.coins);
      this.engine.coins += reward.coins;
    }

    // Speakli celebration
    if (reward.speakliAnimation && this.engine.speakli) {
      this.engine.speakli.setState(reward.speakliAnimation);
    }

    // Sound
    try { playComplete(); } catch {}

    // Wait for celebration
    await this._wait(1500);

    // Reset Speakli
    if (this.engine.speakli) this.engine.speakli.setState('idle');
  }

  _saveProgress() {
    if (!this.options.onProgress || !this.currentWorld) return;

    const existing = this.options.adventureProgress?.worldProgress || {};
    const worldProg = existing[this.currentWorld] || { scenesCompleted: 0, totalStars: 0 };

    // Only update if we've gone further
    const newCompleted = Math.max(worldProg.scenesCompleted, this.sceneIndex + 1);
    const isNewScene = this.sceneIndex + 1 > worldProg.scenesCompleted;

    const updatedWorldProgress = {
      ...existing,
      [this.currentWorld]: {
        scenesCompleted: newCompleted,
        totalStars: worldProg.totalStars + (isNewScene && this.currentScene?.reward?.xp ? 1 : 0),
      },
    };

    this.options.onProgress({
      currentWorld: this.currentWorld,
      worldProgress: updatedWorldProgress,
      totalCoins: this.engine.coins,
    });

    // Check adventure achievements
    this._checkAchievements(updatedWorldProgress);
  }

  _checkAchievements(worldProgress) {
    if (!this.options.onAchievement) return;

    // Count total scenes completed across all worlds
    const totalScenes = Object.values(worldProgress).reduce(
      (sum, wp) => sum + (wp.scenesCompleted || 0), 0
    );
    const totalCoins = this.engine.coins || 0;

    // adventure_start: 1 scene
    if (totalScenes >= 1) this.options.onAchievement('adventure_start');

    // scene_explorer: 12 scenes
    if (totalScenes >= 12) this.options.onAchievement('scene_explorer');

    // adventure_master: 24 scenes
    if (totalScenes >= 24) this.options.onAchievement('adventure_master');

    // Per-world hero badges
    const worldHeroes = { forest: 'forest_hero', ocean: 'ocean_hero', space: 'space_hero', castle: 'castle_hero' };
    for (const [wid, achId] of Object.entries(worldHeroes)) {
      if ((worldProgress[wid]?.scenesCompleted || 0) >= 6) {
        this.options.onAchievement(achId);
      }
    }

    // coin_collector: 100 coins
    if (totalCoins >= 100) this.options.onAchievement('coin_collector');
  }

  _worldComplete() {
    // Show completion message
    if (this.engine.speakli) {
      this.engine.speakli.setState('celebrate');
    }
    try { playComplete(); } catch {}

    // Return to world map
    this._worldCompleteTimer = setTimeout(() => {
      if (this._destroyed) return;
      if (this.options.onWorldMap) this.options.onWorldMap();
    }, 2500);
  }

  _wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  update(dt) {
    if (this._destroyed) return;
    // Update Speakli
    if (this.engine.speakli) this.engine.speakli.update(dt);

    // Update NPCs
    for (const npc of Object.values(this.npcs)) {
      if (npc.update) npc.update(dt);
    }

    // Update exercise
    if (this.currentExercise?.update) {
      this.currentExercise.update(dt);
    }
  }

  resize(w, h) {
    // Reposition elements on resize if needed
  }

  destroy() {
    this.stop();
    // Stop NPC intervals/timers — don't destroy display objects (app.destroy handles that)
    for (const npc of Object.values(this.npcs)) {
      try { npc.destroy(); } catch {}
    }
    this.npcs = {};
    this.sceneObjects = [];
    if (this.dialogue) { try { this.dialogue.destroy(); } catch {} this.dialogue = null; }
  }
}

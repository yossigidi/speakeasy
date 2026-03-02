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

    // State flags
    this.isDialogueActive = false;
    this.isExerciseActive = false;
    this.currentExercise = null;
  }

  /**
   * Start a world by loading its scenes.
   */
  async startWorld(worldId) {
    this.currentWorld = worldId;

    // Dynamic import of world scenes
    let scenesData;
    switch (worldId) {
      case 'forest':
        scenesData = (await import('../../../data/adventure/forest-scenes.js')).FOREST_SCENES;
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

  async _loadScene(index) {
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

    // Spawn NPCs
    if (scene.npcs) {
      const { createNPC } = await import('../characters/ForestNPCs.js');
      for (const npcDef of scene.npcs) {
        const npc = createNPC(this.engine, npcDef);
        this.npcs[npcDef.id] = npc;
      }
    }
  }

  async _runScene(scene) {
    // 1. Intro animation (walk Speakli to position)
    if (scene.intro?.speakliWalkTo && this.engine.speakli) {
      await this.engine.speakli.walkToNorm(
        scene.intro.speakliWalkTo.x,
        scene.intro.speakliWalkTo.y
      );
    }

    // Small pause
    await this._wait(400);

    // 2. Dialogue
    if (scene.dialogue && this.dialogue) {
      this.isDialogueActive = true;
      await this.dialogue.play(scene.dialogue, this.npcs);
      this.isDialogueActive = false;
    }

    // 3. Exercise
    if (scene.exercise) {
      this.isExerciseActive = true;
      await this._runExercise(scene.exercise);
      this.isExerciseActive = false;
    }

    // 4. Reward
    if (scene.reward) {
      await this._giveReward(scene.reward);
    }

    // 5. Save progress
    this._saveProgress();

    // 6. Auto-advance to next scene after delay
    await this._wait(800);
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
          await this._runExercise(round);
        }
        return;
      default:
        console.warn('Unknown exercise type:', exerciseDef.type);
        return;
    }

    return new Promise(resolve => {
      this.currentExercise = new ExerciseClass(this.engine, {
        ...exerciseDef.config,
        options: this.options,
        onComplete: (success) => {
          if (this.currentExercise) {
            this.currentExercise.destroy();
            this.currentExercise = null;
          }
          resolve(success);
        },
      });
    });
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

    this.options.onProgress({
      currentWorld: this.currentWorld,
      worldProgress: {
        ...existing,
        [this.currentWorld]: {
          scenesCompleted: newCompleted,
          totalStars: worldProg.totalStars + (this.currentScene?.reward?.xp ? 1 : 0),
        },
      },
      totalCoins: this.engine.coins,
    });
  }

  _worldComplete() {
    // Show completion message
    if (this.engine.speakli) {
      this.engine.speakli.setState('celebrate');
    }
    try { playComplete(); } catch {}

    // Return to world map
    setTimeout(() => {
      if (this.options.onWorldMap) this.options.onWorldMap();
    }, 2500);
  }

  _wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  update(dt) {
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
    for (const npc of Object.values(this.npcs)) {
      npc.destroy();
    }
    if (this.currentExercise) this.currentExercise.destroy();
    if (this.dialogue) this.dialogue.destroy();
  }
}

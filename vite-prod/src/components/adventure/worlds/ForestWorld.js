/**
 * Forest World loader.
 * Handles world-specific setup: background music, ambient sounds,
 * and loading the 6 forest scenes into the SceneManager.
 */
import { FOREST_SCENES } from '../../../data/adventure/forest-scenes.js';

export default class ForestWorld {
  constructor(engine, options) {
    this.engine = engine;
    this.options = options;
    this.scenes = FOREST_SCENES;
    this.totalScenes = FOREST_SCENES.length;
  }

  /**
   * Get scene data for a specific scene index.
   */
  getScene(index) {
    return this.scenes[index] || null;
  }

  /**
   * Get all scenes.
   */
  getScenes() {
    return this.scenes;
  }

  /**
   * Get completion info from saved progress.
   */
  getProgress(adventureProgress) {
    const wp = adventureProgress?.worldProgress?.forest;
    return {
      scenesCompleted: wp?.scenesCompleted || 0,
      totalStars: wp?.totalStars || 0,
      isComplete: (wp?.scenesCompleted || 0) >= this.totalScenes,
    };
  }

  destroy() {
    // Cleanup world-specific resources
  }
}

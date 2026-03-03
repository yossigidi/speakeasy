import NPC from './NPC.js';

/**
 * Space-specific NPC definitions.
 */
const SPACE_NPC_DEFS = {
  star: {
    displayName: 'Stella',
    emoji: '⭐',
    bodyColor: 0xFBBF24,
    headColor: 0xFDE68A,
    sprite: '/images/adventure/characters/star-stella.jpg',
  },
  comet: {
    displayName: 'Cosmo',
    emoji: '☄️',
    bodyColor: 0x3B82F6,
    headColor: 0x60A5FA,
    sprite: '/images/adventure/characters/comet-cosmo.jpg',
  },
  alien: {
    displayName: 'Luna',
    emoji: '👽',
    bodyColor: 0x10B981,
    headColor: 0x34D399,
    sprite: '/images/adventure/characters/alien-luna.jpg',
  },
  robot: {
    displayName: 'Buzz',
    emoji: '🤖',
    bodyColor: 0x6B7280,
    headColor: 0x9CA3AF,
    sprite: '/images/adventure/characters/robot-buzz.jpg',
  },
  spacecat: {
    displayName: 'Nova',
    emoji: '🐱',
    bodyColor: 0xA855F7,
    headColor: 0xC084FC,
    sprite: '/images/adventure/characters/spacecat-nova.jpg',
  },
  phoenix: {
    displayName: 'Galaxy',
    emoji: '🦅',
    bodyColor: 0xEF4444,
    headColor: 0xF97316,
    sprite: '/images/adventure/characters/phoenix-galaxy.jpg',
  },
};

/**
 * Factory function to create an NPC from a scene definition.
 * @param {PixiEngine} engine
 * @param {Object} npcDef - { id, type, position }
 */
export function createNPC(engine, npcDef) {
  const template = SPACE_NPC_DEFS[npcDef.type] || {};
  return new NPC(engine, {
    id: npcDef.id,
    position: npcDef.position,
    ...template,
  });
}

import NPC from './NPC.js';

/**
 * Castle-specific NPC definitions.
 */
const CASTLE_NPC_DEFS = {
  knight: {
    displayName: 'Kevin',
    emoji: '🛡️',
    bodyColor: 0x6B7280,
    headColor: 0x9CA3AF,
    sprite: '/images/adventure/characters/knight-kevin.jpg',
  },
  princess: {
    displayName: 'Penelope',
    emoji: '👑',
    bodyColor: 0xEC4899,
    headColor: 0xF9A8D4,
    sprite: '/images/adventure/characters/princess-penelope.jpg',
  },
  wizard: {
    displayName: 'Wally',
    emoji: '🧙',
    bodyColor: 0x6366F1,
    headColor: 0x818CF8,
    sprite: '/images/adventure/characters/wizard-wally.jpg',
  },
  fairy: {
    displayName: 'Fiona',
    emoji: '🧚',
    bodyColor: 0xA3E635,
    headColor: 0xD9F99D,
    sprite: '/images/adventure/characters/fairy-fiona.jpg',
  },
  unicorn: {
    displayName: 'Uma',
    emoji: '🦄',
    bodyColor: 0xE879F9,
    headColor: 0xF0ABFC,
    sprite: '/images/adventure/characters/unicorn-uma.jpg',
  },
  king: {
    displayName: 'Rex',
    emoji: '👑',
    bodyColor: 0xD97706,
    headColor: 0xFBBF24,
    sprite: '/images/adventure/characters/king-rex.jpg',
  },
};

/**
 * Factory function to create an NPC from a scene definition.
 * @param {PixiEngine} engine
 * @param {Object} npcDef - { id, type, position }
 */
export function createNPC(engine, npcDef) {
  const template = CASTLE_NPC_DEFS[npcDef.type] || {};
  return new NPC(engine, {
    id: npcDef.id,
    position: npcDef.position,
    ...template,
  });
}

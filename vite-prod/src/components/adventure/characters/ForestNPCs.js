import NPC from './NPC.js';

/**
 * Forest-specific NPC definitions.
 */
const FOREST_NPC_DEFS = {
  fox: {
    displayName: 'Felix',
    emoji: '🦊',
    bodyColor: 0xEA580C,
    headColor: 0xF97316,
    sprite: '/images/adventure/characters/fox-felix.jpg',
  },
  owl: {
    displayName: 'Oliver',
    emoji: '🦉',
    bodyColor: 0x78350F,
    headColor: 0x92400E,
    sprite: '/images/adventure/characters/owl-oliver.jpg',
  },
  bunny: {
    displayName: 'Bella',
    emoji: '🐰',
    bodyColor: 0xD1D5DB,
    headColor: 0xE5E7EB,
    sprite: '/images/adventure/characters/bunny-bella.jpg',
  },
  deer: {
    displayName: 'Danny',
    emoji: '🦌',
    bodyColor: 0x92400E,
    headColor: 0xB45309,
    sprite: '/images/adventure/characters/deer-danny.jpg',
  },
  firefly: {
    displayName: 'Glowy',
    emoji: '🪲',
    bodyColor: 0xFBBF24,
    headColor: 0xFDE68A,
    sprite: '/images/adventure/characters/firefly-glowy.jpg',
  },
  dragon: {
    displayName: 'Drago',
    emoji: '🐉',
    bodyColor: 0x16A34A,
    headColor: 0x22C55E,
    sprite: '/images/adventure/characters/dragon-drago.jpg',
  },
};

/**
 * Factory function to create an NPC from a scene definition.
 * @param {PixiEngine} engine
 * @param {Object} npcDef - { id, type, position }
 */
export function createNPC(engine, npcDef) {
  const template = FOREST_NPC_DEFS[npcDef.type] || {};
  return new NPC(engine, {
    id: npcDef.id,
    position: npcDef.position,
    ...template,
  });
}

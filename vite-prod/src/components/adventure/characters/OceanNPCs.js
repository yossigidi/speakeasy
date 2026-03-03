import NPC from './NPC.js';

/**
 * Ocean-specific NPC definitions.
 */
const OCEAN_NPC_DEFS = {
  dolphin: {
    displayName: 'Dina',
    emoji: '🐬',
    bodyColor: 0x0EA5E9,
    headColor: 0x38BDF8,
    sprite: '/images/adventure/characters/dolphin-dina.jpg',
  },
  turtle: {
    displayName: 'Tami',
    emoji: '🐢',
    bodyColor: 0x16A34A,
    headColor: 0x4ADE80,
    sprite: '/images/adventure/characters/turtle-tami.jpg',
  },
  octopus: {
    displayName: 'Oscar',
    emoji: '🐙',
    bodyColor: 0x7C3AED,
    headColor: 0xA78BFA,
    sprite: '/images/adventure/characters/octopus-oscar.jpg',
  },
  seahorse: {
    displayName: 'Sandy',
    emoji: '🐴',
    bodyColor: 0xEA580C,
    headColor: 0xFB923C,
    sprite: '/images/adventure/characters/seahorse-sandy.jpg',
  },
  crab: {
    displayName: 'Carlos',
    emoji: '🦀',
    bodyColor: 0xDC2626,
    headColor: 0xF87171,
    sprite: '/images/adventure/characters/crab-carlos.jpg',
  },
  whale: {
    displayName: 'Wendy',
    emoji: '🐋',
    bodyColor: 0x1E3A5F,
    headColor: 0x2563EB,
    sprite: '/images/adventure/characters/whale-wendy.jpg',
  },
};

/**
 * Factory function to create an NPC from a scene definition.
 * @param {PixiEngine} engine
 * @param {Object} npcDef - { id, type, position }
 */
export function createNPC(engine, npcDef) {
  const template = OCEAN_NPC_DEFS[npcDef.type] || {};
  return new NPC(engine, {
    id: npcDef.id,
    position: npcDef.position,
    ...template,
  });
}

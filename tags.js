/* ============================================================
   tags.js — Achievement Tag evaluation at Game Over.
   Pure function: takes game snapshot, returns array of tag objects.
   ============================================================ */

import { CONFIG } from './config.js';

// Tag definitions
export const TAG_DEFS = [
  {
    id:    'purist',
    label: '🧘 Purist',
    desc:  'Completed without using any powerups',
    css:   'tag-purist',
    test:  ({ powersUsed, powersEnabled }) =>
      powersEnabled && powersUsed.size === 0,
  },
  {
    id:    'fossil',
    label: '🎯 Fossil',
    desc:  `A tile survived ${CONFIG.FOSSIL_TURNS}+ moves unmoved`,
    css:   'tag-fossil',
    test:  ({ maxTileAge }) => maxTileAge >= CONFIG.FOSSIL_TURNS,
  },
  {
    id:    'summit',
    label: '🏔 Summit',
    desc:  'Reached the win tile',
    css:   'tag-summit',
    test:  ({ maxTile, winTile }) => maxTile >= winTile,
  },
  {
    id:    'overclock',
    label: '🌋 Overclock',
    desc:  'Reached double the win tile or higher',
    css:   'tag-overclock',
    test:  ({ maxTile, winTile }) => maxTile >= winTile * 2,
  },
  {
    id:    'tortoise',
    label: '🐢 Tortoise',
    desc:  `Made ${CONFIG.TORTOISE_MOVES}+ moves`,
    css:   'tag-tortoise',
    test:  ({ totalMoves }) => totalMoves >= CONFIG.TORTOISE_MOVES,
  },
  {
    id:    'speedrun',
    label: '⚡ Speedrun',
    desc:  `Hit the win tile in ${CONFIG.SPEEDRUN_MOVES} moves or fewer`,
    css:   'tag-speedrun',
    test:  ({ maxTile, totalMoves, winTile }) =>
      maxTile >= winTile && totalMoves <= CONFIG.SPEEDRUN_MOVES,
  },
  {
    id:    'cleansweep',
    label: '🧹 Clean Sweep',
    desc:  'Board was reduced to 2 or fewer tiles in one turn',
    css:   'tag-cleansweep',
    test:  ({ minOccupiedCells }) => minOccupiedCells <= 2,
  },
  {
    id:    'surgeon',
    label: '🔬 Surgeon',
    desc:  'Used only the Laser powerup',
    css:   'tag-surgeon',
    test:  ({ powersUsed }) =>
      powersUsed.size > 0 &&
      [...powersUsed].every(p => p === 'LASER'),
  },
];

/**
 * Evaluate all tags for a completed game.
 *
 * @param {Object} snap
 * @param {number}  snap.maxTile
 * @param {number}  snap.totalMoves
 * @param {Set}     snap.powersUsed
 * @param {boolean} snap.powersEnabled
 * @param {number}  snap.minOccupiedCells
 * @param {number}  snap.maxTileAge
 * @param {number}  snap.winTile — runtime win tile (baseTile × 1024)
 * @returns {Array} Matching TAG_DEF objects
 */
export function evaluateTags(snap) {
  const winTile = snap.winTile || CONFIG.WIN_TILE;
  return TAG_DEFS.filter(def => {
    try { return def.test({ ...snap, winTile }); } catch { return false; }
  });
}

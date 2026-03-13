# PRD: 2048 Web Game

**Version:** 3.0  
**Date:** 2026-03-13  
**Author:** Jeff Boss  
**Status:** Draft

---

## 1. Overview

A high-performance, browser-based implementation of the classic 2048 puzzle game. Built with vanilla HTML5 Canvas, zero external dependencies, fully responsive for desktop and mobile. Features a main menu, smooth animations, persistent day-grouped score history (matching Crystal Chaos's history architecture), behavior-based achievement tags, a config-driven settings menu with an admin-only unlock (code: `6673`), and an extensible powerup system.

---

## 2. Goals

- Pixel-perfect Canvas rendering with smooth tile animation
- Playable on desktop (keyboard) and mobile (swipe)
- Main menu as a proper game state
- Score and best-score persistence via localStorage
- Day-grouped history matching Crystal Chaos's architecture exactly
- Behavior-based achievement tags awarded at game end
- Extensible powerup system with first-class tag integration
- Config-driven: all game parameters exposed in a single `config.js` file and in the in-game settings menu
- Lightweight — no framework, no build step required

---

## 3. Non-Goals (v1)

- No server-side component
- No multiplayer or online leaderboard
- No React/Vue/framework (intentional)
- No native mobile app

---

## 4. Game States

```
MENU → PLAYING → GAME_OVER
         ↑            ↓
         └── (New Game / Replay)

MENU → SETTINGS (accessible from menu)
MENU → HISTORY  (accessible from menu)
```

| State | Description |
|---|---|
| `menu` | Main menu — title, best score, daily play count, nav buttons |
| `playing` | Active game — board, score, powerup bar |
| `game_over` | End screen — final score, tags earned, history entry, actions |
| `history` | Day-grouped score history view |
| `settings` | Full settings panel (public + admin-unlocked sections) |

---

## 5. Config System

### 5.1 Config File

All game parameters are defined in a single `config.js` file at the project root. This is the **single source of truth** — edit here to change any default without touching game logic.

```js
// config.js — edit this file to change game defaults
export const CONFIG = {

  // ── BOARD ──────────────────────────────────────────────
  GRID_SIZE:          4,        // Number of rows/columns (default: 4×4)
  TILE_GAP:           10,       // px gap between tiles
  BOARD_PADDING:      12,       // px padding inside the board container
  TILE_RADIUS:        12,       // px border-radius on each tile (matches Crystal Chaos rounded-xl)
  BOARD_RADIUS:       16,       // px border-radius on the board container
  MAX_TILE_FONT_SCALE: 1.0,     // Scale factor for tile number font size (1.0 = auto-fit)
  BOARD_BG:           '#bbada0',// Board background color
  EMPTY_CELL_COLOR:   '#cdc1b4',// Empty cell fill color

  // ── GAME RULES ─────────────────────────────────────────
  WIN_TILE:           2048,     // Tile value that triggers the win condition
  SPAWN_4_PROBABILITY: 0.10,    // Probability a spawned tile is a 4 (vs 2)

  // ── WIN SCREEN ─────────────────────────────────────────
  WIN_DISMISS_MS:     5000,     // Auto-dismiss win overlay after this many ms (0 = never)

  // ── ANIMATIONS ─────────────────────────────────────────
  ANIM_SLIDE_MS:      100,      // Tile slide duration
  ANIM_SPAWN_MS:      150,      // Tile spawn scale-in duration
  ANIM_MERGE_MS:      100,      // Tile merge pop duration
  ANIM_OVERLAY_MS:    200,      // Overlay fade duration
  ANIM_TAG_STAGGER_MS: 80,      // Stagger delay between tag reveals on game-over screen

  // ── TYPOGRAPHY ─────────────────────────────────────────
  FONT_FAMILY: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  // System font stack — no external dependency, renders natively on all platforms

  // ── SCORING ────────────────────────────────────────────
  // (Tile merge scoring is fixed by 2048 rules: +merged value per merge.
  //  These are hooks for future scoring modifiers.)
  SCORE_MULTIPLIER:   1.0,      // Global score multiplier (admin override for testing)

  // ── HISTORY ────────────────────────────────────────────
  HISTORY_MAX_ENTRIES: 50,      // Max game results stored in localStorage
  HISTORY_STORAGE_KEY: '2048_history',
  BEST_STORAGE_KEY:    '2048_best',
  SETTINGS_STORAGE_KEY:'2048_settings',
  DAILY_PLAYS_KEY_PREFIX: '2048_dailyPlays_', // + YYYY-MM-DD suffix

  // ── POWERUPS ───────────────────────────────────────────
  POWERUPS_ENABLED_DEFAULT: false, // Whether powerups are on by default
  POWERUP_LASER_CHARGES:    2,     // Charges per game: Laser
  POWERUP_BOMB_CHARGES:     1,     // Charges per game: Bomb
  POWERUP_REARRANGE_CHARGES:1,     // Charges per game: Rearrange

  // ── ACHIEVEMENT TAGS ───────────────────────────────────
  TAG_FOSSIL_TURNS:         11,    // Turns a tile must survive to earn Fossil tag
  TAG_TORTOISE_MOVES:       300,   // Moves to earn Tortoise tag
  TAG_SPEEDRUN_MOVES:       100,   // Max moves to earn Speedrun tag (must reach WIN_TILE)
  TAG_CLEAN_SWEEP_TILES:    2,     // Board must drop to ≤ this many tiles for Clean Sweep
  TAG_DEMOLISHER_POWERS:    3,     // Min powerups used to earn Demolisher tag
  TAG_LUCKY_DRAW_FOURS:     5,     // Min 4-tile spawns to earn Lucky Draw tag

  // ── INPUT ──────────────────────────────────────────────
  SWIPE_THRESHOLD_PX:       30,    // Minimum px for a touch swipe to register

  // ── ADMIN ──────────────────────────────────────────────
  ADMIN_CODE:               '6673',// Code to unlock admin settings section
};
```

### 5.2 Config Loading

- `config.js` is imported at the top of `main.js` — all modules receive `CONFIG` as a dependency
- localStorage-saved settings **override** config defaults at runtime (settings always win over config)
- Resetting to defaults restores `CONFIG` values

---

## 6. Settings Menu

### 6.1 Access

- Reachable from the main menu via a **Settings** button
- Settings are saved to localStorage immediately on every change (same as Crystal Chaos)

### 6.2 Public Settings

Always visible to all players:

| Setting | Control | Default (from CONFIG) | Description |
|---|---|---|---|
| Powerups Enabled | Toggle | `false` | Show/hide powerup bar during games |
| Laser Charges | Slider 1–5 | `2` | Charges per game |
| Bomb Charges | Slider 1–3 | `1` | Charges per game |
| Rearrange Charges | Slider 1–3 | `1` | Charges per game |
| Win Dismiss Time | Slider 0–10s | `5s` | 0 = manual dismiss only |

### 6.3 Admin Settings (code: `6673`)

Locked behind a 4-digit code entry. On unlock, additional section expands:

| Setting | Control | Default | Description |
|---|---|---|---|
| Grid Size | Slider 3–8 | `4` | Board dimensions |
| Win Tile | Select 256/512/1024/2048/4096 | `2048` | Target tile value |
| Spawn 4 Probability | Slider 0%–30% | `10%` | Chance of spawning a 4 vs 2 |
| Score Multiplier | Slider 0.1×–5× | `1×` | Global score multiplier |
| Tile Gap | Slider 4–20px | `10` | Gap between tiles |
| Board Padding | Slider 8–24px | `12` | Padding inside board |
| Tile Radius | Slider 0–24px | `12` | Tile corner rounding |
| Slide Animation | Slider 50–400ms | `100` | Tile slide speed |
| Spawn Animation | Slider 50–400ms | `150` | Tile spawn speed |
| Fossil Tag Turns | Slider 5–20 | `11` | Turns tile must survive |
| Tortoise Tag Moves | Slider 100–500 | `300` | Moves for Tortoise |
| Speedrun Tag Moves | Slider 50–200 | `100` | Max moves for Speedrun |
| Swipe Threshold | Slider 10–80px | `30` | Min swipe distance |

Admin unlock persists for the browser session (sessionStorage), same as Crystal Chaos.

### 6.4 Settings Persistence

- Key: `CONFIG.SETTINGS_STORAGE_KEY` (`"2048_settings"`)
- Saved as JSON object of all user-modified values
- On load: merge saved settings over CONFIG defaults (saved always wins)
- **Reset to Defaults** button restores all CONFIG values and clears the settings key

---

## 7. Main Menu

- Displays: game title "2048", current best score, daily play count (`X games today`)
- Buttons: **Play**, **History**, **Settings**
- Animated tile background (idle tiles drift/pulse subtly)
- Best score loaded from `CONFIG.BEST_STORAGE_KEY` on mount

---

## 8. Game Board

### 8.1 Visual Style — Matches Crystal Chaos

| Property | Value | Notes |
|---|---|---|
| Tile border-radius | `CONFIG.TILE_RADIUS` (default 12px) | `rounded-xl` equivalent |
| Board border-radius | `CONFIG.BOARD_RADIUS` (default 16px) | `rounded-xl` equivalent |
| Tile gap | `CONFIG.TILE_GAP` (default 10px) | |
| Board padding | `CONFIG.BOARD_PADDING` (default 12px) | |
| Board background | `CONFIG.BOARD_BG` (`#bbada0`) | Original 2048 color |
| Empty cell | `CONFIG.EMPTY_CELL_COLOR` (`#cdc1b4`) | |
| Tile shadow | `shadow-lg` equivalent | Subtle depth like Crystal Chaos gems |

### 8.2 Font

System font stack — no external dependencies, highest compatibility, native rendering on all platforms:
```
-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif
```
Defined in `CONFIG.FONT_FAMILY`. Tile numbers auto-size to fit the tile (smaller for 4+ digit values).

### 8.3 Tile Mechanics

- On each move: all tiles slide to the chosen direction as far as possible
- Equal tiles that collide merge once per move; score += merged value
- After every valid move: new tile spawns (2 @ `1 - SPAWN_4_PROBABILITY`, 4 @ `SPAWN_4_PROBABILITY`)
- Spawned tile animates in with scale-up effect

### 8.4 Input

- **Desktop:** Arrow keys (←↑→↓)
- **Mobile:** Touch swipe (min `CONFIG.SWIPE_THRESHOLD_PX`)
- Input debounced during active animations
- No diagonal moves

---

## 9. Win Screen

- Triggered when any tile reaches `CONFIG.WIN_TILE`
- Overlay fades in over the board (`CONFIG.ANIM_OVERLAY_MS`)
- **Auto-dismisses** after `CONFIG.WIN_DISMISS_MS` (default 5000ms) with a visible countdown timer
- **Tap/click anywhere** on the overlay to dismiss early
- On dismiss: "Keep Going" mode — game continues, win won't re-trigger for the same game
- Two explicit buttons: **Keep Going** (dismiss) and **New Game**
- Countdown timer renders as a thin progress bar at the bottom of the overlay

---

## 10. Game Over Screen

Displayed when board is full and no valid merge exists, or when player taps **Quit**.

Shows:
- Final score (large, prominent)
- Highest tile reached
- Total moves made
- Tags earned (pill badges, staggered reveal — see §11)
- Buttons: **Play Again**, **Main Menu**, **View History**

Game result committed to localStorage history on entry.

---

## 11. Score History (Crystal Chaos Architecture)

### 11.1 Data Structure

```ts
interface GameResult {
  id: string                    // `${Date.now()}_${Math.random().toString(36).slice(2)}`
  date: number                  // Unix ms timestamp at game end
  score: number                 // Final tile-merge score
  highTile: number              // Highest tile value reached
  moves: number                 // Total moves made
  tags: string[]                // Tag ids earned (e.g. ['purist', 'summit'])
  powersUsed: string[]          // Powerup ids used (e.g. ['laser', 'bomb'])
  settings: GameSettings        // Snapshot of settings at game start
}

interface GameSettings {
  powersEnabled: boolean
  winTile: number
  gridSize: number
  scoreMultiplier: number
}
```

### 11.2 Storage

- Key: `CONFIG.HISTORY_STORAGE_KEY` (`"2048_history"`)
- Capped at `CONFIG.HISTORY_MAX_ENTRIES` (50); oldest trimmed on overflow
- Saved immediately on game end, before transitioning to game-over screen
- Best score key: `CONFIG.BEST_STORAGE_KEY` (`"2048_best"`)

### 11.3 History View

Matches Crystal Chaos day-grouped display exactly:

- Games grouped by `YYYY-MM-DD` from `result.date`
- Within each day: sorted by `score` descending
- Days sorted most-recent-first
- Day labels: `"Today"` / `"Yesterday"` / `"MMM D, YYYY"`
- **Top score per day** → gold background + 🏆 icon (same as Crystal Chaos)
- Each entry shows: score, highest tile reached, move count, tags earned as small badges

### 11.4 Daily Play Counter

- Key: `CONFIG.DAILY_PLAYS_KEY_PREFIX + YYYY-MM-DD`
- Incremented at game start
- Displayed on main menu as "X games today"

---

## 12. Achievement Tags

Tags are awarded at game end based on tracked session stats. Shown as colored pill badges with staggered reveal on the game-over screen. Saved in `GameResult.tags[]`.

### 12.1 Tag Display

- Pill badges: emoji + short label, colored per tag (see §12.3)
- Stagger: `CONFIG.ANIM_TAG_STAGGER_MS` between each badge reveal
- Appear on game-over screen and in history entries

### 12.2 Session Trackers

Tracked throughout the game session for tag evaluation at end:

| Tracker | Purpose |
|---|---|
| `moveCount` | Tortoise, Speedrun |
| `powersUsed[]` | Purist, Demolisher, Surgeon |
| `fossilTileId` | Id of the turn-1 tile being tracked (Fossil) |
| `fossilTurnCount` | Turns it survived unmerged |
| `highTile` | Summit, Overclock |
| `minTilesOnBoard` | Clean Sweep |
| `fourTileSpawnCount` | Lucky Draw |
| `finalEmptyCells` | Last Stand |

All trackers evaluated once at game end — zero overhead during play.

### 12.3 Tag Definitions

| Emoji | Name | Condition | Color |
|---|---|---|---|
| 🧘 | Purist | Powerups enabled, zero used | Indigo |
| 🎯 | Fossil | Turn-1 `2` tile survived `TAG_FOSSIL_TURNS` turns unmerged | Amber |
| 🏔️ | Summit | Reached `WIN_TILE` | Gold |
| 🌋 | Overclock | Reached `WIN_TILE × 2` or higher | Red |
| 🐢 | Tortoise | `moveCount ≥ TAG_TORTOISE_MOVES` | Green |
| ⚡ | Speedrun | Reached `WIN_TILE` in `≤ TAG_SPEEDRUN_MOVES` moves | Cyan |
| 🧹 | Clean Sweep | Board reduced to `≤ TAG_CLEAN_SWEEP_TILES` tiles at any point | Sky |
| 💣 | Demolisher | `powersUsed.length ≥ TAG_DEMOLISHER_POWERS` | Orange |
| 🔬 | Surgeon | Used Laser exactly once, no other powerups | Purple |
| 😬 | Last Stand | `finalEmptyCells === 1` on final move | Rose |
| 🎲 | Lucky Draw | `fourTileSpawnCount ≥ TAG_LUCKY_DRAW_FOURS` | Lime |

---

> **[JEFF — ADD MORE TAGS HERE]**
>
> Format:
> ```
> | 🔥 | Name | Condition (reference CONFIG keys where applicable) | Color |
> ```
> Then add the corresponding CONFIG key(s) in §5.1 under the `ACHIEVEMENT TAGS` section.

---

## 13. Powerup System

Powerups are optional (default off, toggled in settings). When enabled, player starts with charges defined by CONFIG. Powerup bar rendered below board.

### 13.1 Activation Flow

```
Tap powerup icon in bar
  → Enter targeting mode (board dims, valid cells highlight)
  → Tap/click target cell(s)
  → Effect applies
  → Consume 1 charge
  → powersUsed[] updated
  → Exit targeting mode
  → Normal game continues
```

Pressing Escape or re-tapping the powerup icon cancels targeting.

### 13.2 Powerup Bar

- Shows icon + name + remaining charge count for each powerup
- Grayed out when charges = 0
- Hidden entirely when `POWERUPS_ENABLED_DEFAULT` is false and not overridden in settings

### 13.3 Defined Powerups

#### 🔴 Laser
- **Effect:** Removes a single tile from the board, leaving the cell empty
- **Charges:** `CONFIG.POWERUP_LASER_CHARGES` (default 2)
- **Targeting:** Single cell tap
- **Tag:** Using exactly once + no other powerups → Surgeon

#### 💥 Bomb
- **Effect:** Removes all tiles in a 2×2 square (clamped to board edges)
- **Charges:** `CONFIG.POWERUP_BOMB_CHARGES` (default 1)
- **Targeting:** Single cell tap (2×2 area previewed on hover)

#### 🔀 Rearrange
- **Effect:** Randomly shuffles all tiles into new positions (values + empty cells preserved)
- **Charges:** `CONFIG.POWERUP_REARRANGE_CHARGES` (default 1)
- **Targeting:** None — confirmation prompt on tap, then applies immediately

---

> **[JEFF — ADD MORE POWERUPS HERE]**
>
> Format for each:
> ```
> #### <emoji> <Name>
> - **Effect:** <what it does>
> - **Charges:** `CONFIG.POWERUP_<NAME>_CHARGES` (default X) — add key to config.js
> - **Targeting:** <single cell | area | no target>
> - **Tag Interaction:** <any tag interactions, or "none">
> ```
>
> **Powerup Ideas Backlog (not yet spec'd — add charges key to CONFIG when you pick one):**
> - 🧲 Magnet — pull all tiles of one value toward one edge
> - ❄️ Freeze — lock one tile in place for 3 turns (cannot merge)
> - ✨ Upgrade — doubles the value of one selected tile
> - 🔃 Flip — mirror the entire board horizontally or vertically
> - 🕳️ Void — permanently removes a cell from the board for the rest of the game
> - 🃏 Wild — spawns a player-chosen tile (value 2–64)

---

## 14. Architecture

### 14.1 File Structure

```
2048/
├── index.html
├── style.css
├── config.js              ← ALL game parameters live here — edit this first
└── src/
    ├── main.js            ← Entry point, rAF loop, state machine
    ├── state.js           ← Game state model (grid, trackers, status)
    ├── logic.js           ← Pure fns: slide, merge, spawn, win/loss check
    ├── renderer.js        ← Canvas router → sub-renderers
    ├── renderers/
    │   ├── menu.js        ← Main menu render
    │   ├── game.js        ← Board + powerup bar render
    │   ├── gameover.js    ← End screen + tag badges render
    │   ├── settings.js    ← Settings panel render
    │   └── history.js     ← Day-grouped history render
    ├── animation.js       ← Easing, tile interpolation, transitions
    ├── input.js           ← Keyboard + touch + powerup targeting
    ├── powerups.js        ← Powerup definitions + apply logic
    ├── tags.js            ← Tag definitions + end-of-game evaluation
    └── storage.js         ← All localStorage I/O (history, settings, best)
```

### 14.2 State Shape

```js
{
  // ── Config snapshot (applied at game start) ──
  cfg: { ...CONFIG, ...userSettings },

  // ── Board ──
  grid: [[0,0,0,0], ...],   // GRID_SIZE × GRID_SIZE
  tiles: [{
    id, value, row, col,
    prevRow, prevCol,
    mergedFrom,    // [id, id] | null
    birthMove      // move number when spawned (for Fossil tracking)
  }],

  // ── Scoring ──
  score: 0,
  best: 0,
  highTile: 0,

  // ── Session trackers ──
  moveCount: 0,
  fossilTileId: null,
  fossilTurnCount: 0,
  powersUsed: [],
  minTilesOnBoard: GRID_SIZE * GRID_SIZE,
  fourTileSpawnCount: 0,
  finalEmptyCells: 0,

  // ── Powerups ──
  charges: {
    laser: CONFIG.POWERUP_LASER_CHARGES,
    bomb: CONFIG.POWERUP_BOMB_CHARGES,
    rearrange: CONFIG.POWERUP_REARRANGE_CHARGES
  },
  targetingPowerup: null,

  // ── Win screen ──
  wonAndContinuing: false,   // true after "Keep Going" to suppress re-trigger
  winDismissTimer: null,     // countdown handle

  // ── Status ──
  appState: 'menu' | 'playing' | 'game_over' | 'history' | 'settings'
}
```

### 14.3 Logic Constraints

- All game logic: **pure functions** in `logic.js` — no side effects
- `tags.js` evaluates all tags from a completed state snapshot — no mid-game tracking overhead
- `storage.js` owns all localStorage I/O — other modules never touch storage directly
- Renderer reads state, never mutates it
- `config.js` is the only file most people ever need to edit

---

## 15. Visual Design

### 15.1 Tile Palette

| Value | Background | Text |
|---|---|---|
| 2 | #eee4da | #776e65 |
| 4 | #ede0c8 | #776e65 |
| 8 | #f2b179 | #f9f6f2 |
| 16 | #f59563 | #f9f6f2 |
| 32 | #f67c5f | #f9f6f2 |
| 64 | #f65e3b | #f9f6f2 |
| 128 | #edcf72 | #f9f6f2 |
| 256 | #edcc61 | #f9f6f2 |
| 512 | #edc850 | #f9f6f2 |
| 1024 | #edc53f | #f9f6f2 |
| 2048 | #edc22e | #f9f6f2 |
| 4096+ | #3c3a32 | #f9f6f2 |

### 15.2 Tag Badge Colors

| Tag | Color |
|---|---|
| Purist | Indigo |
| Fossil | Amber |
| Summit | Gold |
| Overclock | Red |
| Tortoise | Green |
| Speedrun | Cyan |
| Clean Sweep | Sky |
| Demolisher | Orange |
| Surgeon | Purple |
| Last Stand | Rose |
| Lucky Draw | Lime |

### 15.3 Animation Timings

| Event | Duration | Easing |
|---|---|---|
| Tile slide | `ANIM_SLIDE_MS` (100ms) | ease-out |
| Tile spawn | `ANIM_SPAWN_MS` (150ms) | scale 0→1 |
| Merge pop | `ANIM_MERGE_MS` (100ms) | scale 1.2→1.0 |
| Overlay fade | `ANIM_OVERLAY_MS` (200ms) | ease |
| Win countdown | `WIN_DISMISS_MS` (5000ms) | linear progress bar |
| Tag reveal | `ANIM_TAG_STAGGER_MS` (80ms) | staggered slide-up |

---

## 16. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Initial load | < 100ms |
| Frame rate | 60fps on modern hardware |
| Bundle size | < 40KB unminified |
| Browser support | Chrome, Firefox, Safari, Edge (last 2 major) |
| Mobile support | iOS Safari 15+, Android Chrome 100+ |

---

## 17. Open Questions

- [ ] Should Fossil tile have a subtle visual indicator (e.g. small dot) during play?
- [ ] Tag reveal order on game-over: earned first + unearned greyed-out, or earned only?
- [ ] Admin settings panel: persist unlock via sessionStorage (same as Crystal Chaos) or localStorage?
- [ ] Win screen countdown: progress bar color — gold, or match the board `#bbada0` theme?
- [ ] Should settings menu have a "Reset to Defaults" button that re-applies `config.js` values?

---

## 18. Roadmap

| Version | Features |
|---|---|
| v1.0 | Core game, main menu, history, tags, defined powerups, settings + admin code |
| v2.0 | Undo last move, dark/light theme, powerup backlog items |
| v3.0 | Online leaderboard, custom grid sizes |
| v4.0 | Multiplayer race mode |

# Gam3r 3072

A polished [2048](https://en.wikipedia.org/wiki/2048_(video_game)) mod by [@finalboss](https://channel3.gg/finalboss) and the Roberts.

🎮 **[Play it here](https://jeffdoka.github.io/3072-Webgame-Experiment/)**

---

## What's Different

This isn't a straight clone. It's a full arcade-style overhaul:

- **Target tile: 3072** — harder than 2048, more satisfying to hit
- **Powerups** — Laser, Bomb, and Rearrange charges to dig yourself out of bad spots
- **Achievement Tags** — unlock flavor tags as you hit tile milestones
- **Daily High Scores** — track your best score per day with a scrollable history
- **Channel 3 color palette** — Coffee · Lion · Almond · Reseda · Ebony
- **Adaptive UI scaling** — plays great on phone or desktop
- **Zero dependencies** — pure HTML5 Canvas, vanilla JS, no frameworks, no build step required

---

## How to Play

| Input | Action |
|---|---|
| Arrow keys / WASD | Slide tiles |
| Swipe | Slide tiles (mobile) |
| Tap tile (with powerup active) | Use powerup |

Merge tiles to reach **3072**. Use powerups strategically — they're limited.

---

## Run Locally

Just open `index.html` in any modern browser (must be served over HTTP, not `file://`):

```bash
npx serve .
# or
python3 -m http.server
```

---

## Tech

- HTML5 Canvas for all game rendering
- ES Modules (no bundler needed for local dev)
- `localStorage` for score persistence — no server, no accounts, no tracking
- `dist/` folder included for offline / `file://` use

---

*Built for [Channel 3](https://channel3.gg)*

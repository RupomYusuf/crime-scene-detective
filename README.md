# 🔍 Crime Scene Detective

A real-time multiplayer detective game for **2–4 players**. Every round, a set of
hidden clues is randomized across a themed crime scene — identical for all players
in that session. First detective to click a clue claims it and scores; find them
all before the clock runs out.

## Run it

```bash
npm install
npm start          # → http://localhost:3000
```

Open the URL in one tab per player (or share across machines on your LAN — use
`PORT=8080 npm start` to change the port).

## How a round works

1. **Create a room** → share the 4-letter code with friends (max 4 players).
2. **Ready up** → the host can start once everyone is ready (min 2 players).
3. **Investigate** → clues are scattered randomly across the scene, same layout
   for everyone. Click a clue to claim it.
4. **Results** → final scores, evidence timeline, play again.

## Rules & scoring

| Event | Points |
|---|---|
| First to find a clue | **100** |
| Second / third / fourth finder | **80 / 60 / 40** |
| Wrong click (empty scenery) | **−5** (host can disable) |
| Hint (reveals one clue, only to you, 6 s) | **−15**, 30 s cooldown (host can disable) |

All point values are scaled by the host's **point multiplier** (×0.5–×3).

## Host settings (lobby)

- **Scenario**: Ransacked Office · Hotel Room 204 · Vanwick Mansion · Crime Lab — or random
- **Difficulty presets**: Easy (5–8 clues) · Medium (10–15) · Hard (20+)
- **Hidden elements**: 5–25 (slider)
- **Time limit**: 2–10 minutes
- **Point multiplier**, **hints on/off**, **wrong-click penalty on/off**

## Features

- Live scoreboard, "X found the knife!" toasts, clues-remaining counter
- Per-room case chat during lobby and game
- Found clues gray out and get a name tag visible to everyone
- Game results persisted to `data/history.json`; home screen shows your personal
  record (cases played, wins, fastest find) based on your detective name
- Ended rooms linger ~5 minutes so players can review the evidence

## Testing

```bash
npm test    # 24-check end-to-end suite (simulates a full 3-player round)
```

## Tech

Node.js + Express + Socket.IO. Rooms, element generation and scoring all run
server-side so every client sees the same scene; the client is plain HTML/CSS/JS
with hand-drawn SVG scenes and clue icons (`public/js/scenarios.js`).

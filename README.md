# Wheels

A rebalanced reimagining of the Wheels minigame from *Sea of Stars*. 1v1 online multiplayer turn-based game played on spinning reels.

## Status

| Phase | Status | Description |
|-------|--------|-------------|
| 0 - Scaffold | Done | Vite + React + TS, Tailwind palette, fonts, 480x320 Stage canvas |
| 1 - Rule Engine | Done | Pure TS game logic: types, RNG, panels, figurines, XP, bulwark, energy, resolve |
| 2 - State Layer | Done | Zustand stores (game + log), XState FSM, debug panel |
| 3 - Board Layout | Done | Zone plates, platforms, crown boxes, midline, wheel strips, header/footer |
| 4 - Sprites | Done | Programmatic placeholder sprites (6 figurines x 5 frames), panel icons, Sprite component |
| 5 - 3D Wheels | Done | react-three-fiber drums, spin animation (anticipation/spin/settle cascade) |
| 6 - Figurine Activation | Skipped | Waiting for final sprite art |
| 7 - Juice | Done | Hit-stop, shake, number roll, pop, ink-bleed hooks + resolution log panel |
| 8 - Menus | Done | Main menu, lobby, hero select, match end, settings |
| 9 - Sound | Not started | Howler.js audio layer |
| 10 - Balance/Polish | Not started | Headless simulator, Playwright E2E, deploy |
| Multiplayer | Done | PartyKit server, simultaneous turns, lobby system, spectators |

## Architecture

### Simultaneous Turns

Both players spin their wheels at the same time. Each round:

1. **Spin phase** (60s timer): both players spin up to 3 times, locking wheels between spins. Each player only sees their own results.
2. **Reveal**: both players' final wheel results shown to everyone.
3. **Resolve**: Player 0's results resolved (steps 1-9), then Player 1's (steps 1-9), then simultaneous 0 HP check.

There is no "current player" -- every round is symmetric.

### Multiplayer (PartyKit)

- **Server-authoritative**: RNG seed lives on server, all mutations happen server-side
- **Lobby system**: create/join rooms with 4-letter codes, spectator support
- **Per-player privacy**: wheel results hidden from opponent during spin phase
- **60s timer**: auto-confirms unfinished players

### Tech Stack

- **Runtime**: React 18 + TypeScript + Vite
- **3D**: Three.js + react-three-fiber + @react-three/drei
- **State**: Zustand (game + log + lobby + settings stores)
- **Multiplayer**: PartyKit (WebSocket rooms)
- **Styling**: Tailwind CSS v4 with custom brutalist palette
- **Testing**: Vitest (156 tests, 95%+ coverage on rule engine)

## Development

```bash
# Install dependencies
pnpm install

# Start Vite dev server
pnpm dev

# Start PartyKit server (for multiplayer)
pnpm party:dev

# Run tests
pnpm test

# Build
pnpm build
```

For multiplayer testing, run both `pnpm dev` and `pnpm party:dev`, then open two browser tabs.

## Project Structure

```
wheels/
├── party/                  PartyKit server
│   └── wheels.ts           Lobby + game state management
├── src/
│   ├── game/               Pure rule engine (no React imports)
│   │   ├── types.ts        GameState, PlayerState, WheelState, etc.
│   │   ├── rng.ts          Seeded PRNG (mulberry32)
│   │   └── rules/
│   │       ├── actions.ts  startRound, spin, lockWheel, confirmSpins
│   │       ├── resolve.ts  10-step resolution (both players per round)
│   │       ├── figurines.ts 6 figurines with Bronze/Silver/Gold stats
│   │       ├── panels.ts   5 wheel distributions (8 panels each)
│   │       ├── xp.ts       XP, rank-ups, bombs
│   │       ├── bulwark.ts  Defense mechanics
│   │       └── energy.ts   Energy calculation
│   ├── store/              Zustand stores
│   │   ├── game.ts         Canonical game state
│   │   ├── log.ts          Resolution event log
│   │   ├── lobby.ts        Multiplayer lobby state
│   │   └── settings.ts     User preferences
│   ├── network/            Multiplayer
│   │   ├── protocol.ts     Client/server message types
│   │   └── usePartySocket.ts WebSocket hook
│   ├── components/
│   │   ├── board/          Game board (480x320 pixel canvas)
│   │   ├── wheels/         3D wheel drums + animation
│   │   ├── menu/           MainMenu, Lobby, HeroSelect, MatchEnd, Settings
│   │   ├── Stage.tsx       Scaled canvas container
│   │   └── Sprite.tsx      Pixel-art sprite renderer
│   ├── juice/              Animation primitives
│   ├── dev/                Debug panel
│   └── App.tsx             Screen routing
├── scripts/                Sprite generation scripts
├── public/sprites/         Generated sprite assets
├── __tests__/              Vitest test files
└── wheels-*.md             Game design docs
```

## Design

Brutalist-modern pixel art: paper-cream backgrounds, 1px ink borders, monospace typography, no gradients or shadows. The 3D spinning wheels are the only non-flat element. See `wheels-visual-design.md` for the full spec.

# Wheels: Implementation Plan

A phased plan for building the web game from the existing rules and visual design docs. Each phase is independently shippable and produces something you can look at or play with. Later phases depend only on earlier ones.

Companion docs:
- `wheels-rules-sea-of-stars.md` — the rebalanced rules.
- `wheels-visual-design.md` — visual + animation spec.

---

## Stack Decisions (Locked)

- **Runtime**: React 18 + TypeScript + Vite.
- **3D**: Three.js + react-three-fiber (@react-three/fiber) + @react-three/drei for helpers. `THREE.NearestFilter` everywhere on textures.
- **Game state**: Zustand for canonical state. XState for the turn-flow finite state machine.
- **Styling**: Tailwind CSS with a custom theme matching the palette tokens from the visual design doc. Grid overlay as a fixed-position SVG.
- **Sprite pipeline**: Aseprite CLI exports JSON atlases + PNG sprite sheets. Custom React `<Sprite>` component reads the atlas.
- **Audio**: Howler.js.
- **Testing**: Vitest for unit tests (rule engine), Playwright for end-to-end (one-turn flow), a dedicated headless simulator binary for balance.
- **Package manager**: pnpm. (If you prefer npm/yarn, substitute consistently.)
- **Lint / format**: ESLint + Prettier, strict TS config.

---

## Phase 0 — Repository Scaffold

**Goal**: empty repo boots to a blank paper-cream canvas with the visible 8px grid.

Tasks
- Initialize Vite + React + TS project.
- Install deps: `three @react-three/fiber @react-three/drei zustand xstate @xstate/react howler tailwindcss`.
- Install dev deps: `vitest @testing-library/react @playwright/test eslint prettier typescript @types/three @types/howler`.
- Configure strict `tsconfig.json` (noImplicitAny, exactOptionalPropertyTypes).
- Configure Tailwind with palette tokens from the design doc (`paper`, `ink`, `blue-ink`, etc.) as theme colors.
- Add Google Fonts or self-hosted woff2 for: IBM Plex Mono, Space Grotesk, Press Start 2P (or equivalents). Configure `font-feature-settings: "tnum"`.
- Create a `<Stage>` React component: full-viewport 480×270 base canvas, nearest-neighbor upscaled to fill. Paper background with a 1px grid SVG overlay at 3% ink opacity.
- Git init, first commit.

Exit criteria: `pnpm dev` shows a paper-cream page with the faint 8px grid visible, no layout shift on resize.

---

## Phase 1 — Game Model and Rule Engine

**Goal**: a pure, side-effect-free TypeScript module that implements the game rules. No UI yet. Testable with Vitest.

Tasks
- Define types in `src/game/types.ts`: `Figurine`, `Rank`, `Panel` (Square/Diamond/Hammer/XP/Bypass), `WheelState`, `PlayerState`, `GameState`.
- Implement `src/game/rules/`:
  - `panels.ts`: the per-wheel panel distribution tables (from rules doc).
  - `resolve.ts`: the 10-step resolution order. Takes current `GameState` + 5 landed panels, returns new `GameState` + an ordered list of `LogEvent`s.
  - `figurines.ts`: per-figurine stats and activation effects (Warrior, Mage, Priest, Archer, Engineer, Assassin).
  - `xp.ts`: XP accrual, threshold 10, rank promotion, carryover.
  - `bulwark.ts`: application, decay at turn start.
  - `actions.ts`: bomb, bulwark buy, spin, lock.
  - `rng.ts`: seeded PRNG (mulberry32 or similar). All randomness flows through here.
- Write Vitest tests for every rule in `__tests__/`:
  - Panel distribution probabilities.
  - Each figurine activation output (Bronze/Silver/Gold stat tables).
  - XP carryover on rank up.
  - Bulwark decay timing.
  - A couple of scripted end-to-end turns with fixed seeds producing expected state.

Exit criteria: `pnpm test` passes with >90% coverage on `src/game/rules/`. Given a seed and a sequence of spin/lock/bomb inputs, the engine produces deterministic state.

---

## Phase 2 — State Layer

**Goal**: wire the rule engine into Zustand and XState. Still no visual output.

Tasks
- `src/store/game.ts`: Zustand store holding canonical `GameState`. Actions: `spin`, `lockWheel`, `playBomb`, `nextTurn`.
- `src/machine/turn.ts`: XState FSM with states `idle → rolling → settling → resolving → acting → cleanup → next`. Events: `SPIN`, `SETTLE_DONE`, `RESOLVE_DONE`, `ACT_DONE`. The machine calls rule-engine functions on entry/exit actions.
- `src/store/log.ts`: a separate Zustand slice holding an append-only event log. Every rule-engine `LogEvent` pushes a line.
- A small debug view (`src/dev/Debug.tsx`): raw state + log as text, plus buttons to dispatch events. Ugly but functional.

Exit criteria: clicking "Spin" in the debug view steps through an FSM-driven turn, state updates are deterministic with a fixed seed, log lines appear in order.

---

## Phase 3 — Static Board Layout

**Goal**: the board chassis, with no wheels and no animations. Pure flat pixel-art layout at 480×270.

Tasks
- Implement the Tailwind theme colors + a custom CSS layer for `--paper`, `--ink`, etc.
- Build `<BoardChassis>` component with the dumbbell silhouette: two zone plates + central bridge + two midline rules + header/footer rows.
- Build `<ZonePlate side="player|opponent">`: pill outline with wash, wiring channels as 1px SVG rules, section label `// PLAYER` in mono.
- Build `<Platform figurine={...}>`: oval pedestal with 1px ellipse shadow + rank ring.
- Build `<CrownBox>`: double-ruled box with HP numeral (placeholder) + bulwark pips.
- Build `<Bridge>`: 48×32 pixel arch SVG centered on the midline.
- Build `<MidlineRules>`: two 1px violet rules with the `[ NEUTRAL STAGE ]` centered label.
- Build `<FigurineCard placeholder>`: the on-board resource readout under each platform.
- Wire to store: read player names, crown HP, bulwark segments from state.
- Header (`TURN 04 WHEELS ⚙ ?`) + footer `[ SPIN ]` button placeholder.

Exit criteria: page renders the full board architecture exactly matching the ASCII mockup in the design doc, data-driven from the Zustand store. Resizing preserves pixel crispness.

---

## Phase 4 — Sprite Pipeline

**Goal**: pixel art appearing on the board.

Tasks
- Decide on sprite source: author in Aseprite or commission; for scaffolding, use 32×32 placeholder sprites (single idle frame per figurine + simple palette swaps for rank).
- `scripts/sprites.sh`: Aseprite CLI export → `public/sprites/{figurine}.png` + `public/sprites/{figurine}.json`.
- `<Sprite name frame scale>` React component: loads atlas JSON, renders the correct sub-rect with `image-rendering: pixelated`.
- Author placeholder sprites for 6 figurines: idle, windup, release, hit, ko (5 frames each, 32×32).
- Author placeholder panel icons (16×16): square, diamond, hammer, xp-star, bypass.
- Integrate sprites into `<Platform>` (idle sprite on pedestal) and `<CrownBox>` (crown glyph).

Exit criteria: board shows six figurine sprites on their platforms, crown glyphs visible, panels designed for later wheel phase.

---

## Phase 5 — Wheels (3D)

**Goal**: the 5 drums spinning and settling with pixel-art faces.

Tasks
- `<WheelsCanvas>`: a react-three-fiber `<Canvas>` positioned over two rails (top + bottom zone plates). Two `<WheelStrip>` instances reading the same wheel state.
- `<WheelDrum panelState spinning settled>`:
  - 8-sided cylindrical geometry (or 8 flat quads arranged in a ring).
  - 8 materials using panel sprite textures with `THREE.NearestFilter`, `magFilter: NearestFilter`, `minFilter: NearestFilter`.
  - No shadows, no lights except an ambient + one hemisphere light. Flat-shaded.
- Spin animation pipeline (using r3f `useFrame`):
  - `anticipation` 150ms, `spin` 1.2-1.8s, `settle` 300ms. Easing as specified.
  - Drum rotation tied to `spinState` from the FSM; settles on the determined panel.
- Rail rendering: 1px SVG line + bracket glyphs, positioned with absolute CSS over the 3D canvas.
- Match-highlight rule: after settle, a 1px ink SVG rule draws across matched wheels in stepped 8px segments.
- Result chip (`[ SQ ]`) above each wheel after settle (absolute-positioned HTML + mono font).
- Locked state: 2px ring + `[ LOCKED ]` chip.

Exit criteria: click Spin → wheels do the full ceremony, settle on deterministic panels from the seeded RNG, match highlights draw in, log lines print. No juice yet beyond the spin itself.

---

## Phase 6 — Figurine Activation

**Goal**: figurines act, damage happens, the game actually plays.

Tasks
- `<FigurineAnimator>`: subscribes to FSM state `acting`. When a figurine activates, plays its sprite sequence (windup → release → hit) against the opposing platform.
- Projectile components:
  - `<Fireball>`, `<Arrow>`, `<Wrench>`, `<HealingBeam>`, `<DashStreak>` — each is an SVG or canvas element that steps across the midline in grid-aligned pixel steps.
  - Projectile passes through the bridge opening (the bridge gets a 1-frame violet ink-bleed when a projectile crosses it).
- Damage number spawn: `<FloatingNumber>` that spawns at impact, rises 8px over 300ms in mono pixel font, fades.
- Crown HP update: `<CrownBox>` number-rolls to the new value.
- Bulwark segment shatter: pixel fragment animation on segment loss.
- KO detection + KO sequence (sprite shatters, ink-bleed sweep).

Exit criteria: from a fresh match, spin → activate → damage → state correctly updates for 3-4 full turns end-to-end.

---

## Phase 7 — Juice Pass

**Goal**: apply the animation primitives from the design doc throughout.

Tasks
- Build a reusable `juice.ts` utility:
  - `useHitStop(durationMs)` — freezes a render loop.
  - `useShake(intensity, frames)` — returns an `(x,y)` offset in whole pixels.
  - `useNumberRoll(from, to, durationMs)` — stepped digit roll.
  - `usePop(elementRef)` — 120ms scale sequence with step easing.
  - `useInkBleed(elementRef, color)` — 1-frame border/bg flash.
  - `useRip(spriteRef)` — 1-frame chromatic offset.
- Apply to all the moments cataloged in §Animations:
  - Wheel settle sequence (tick cascade, last-wheel hit-stop, matched rule draw-in).
  - Hero activation (anticipation/release/hit-stop/impact/recovery).
  - Hit-stop + shake on every impact (full for crown, half for bulwark).
  - KO sequence (shake + hit-stop + rip + shatter + magenta sweep).
  - Rank-up card flash + number-roll.
  - Bomb sequence (1-frame magenta flash + crown border bleed + slowed log typing).
  - Ambient juice (idle sprite breathing, cursor blink, paper grain dither shift).
- Add the resolution log panel on the side: character-by-character type-on, mono tick SFX per character, auto-scroll.

Exit criteria: a full match plays start-to-finish with all the juice beats landing. Matches feel rhythmic — calm between beats, punchy on hits, heavy on KOs.

---

## Phase 8 — Menus, Match End, Accessibility

**Goal**: the game wraps around itself.

Tasks
- Main menu: wordmark type-on, "New Match" + "Specimen Catalog" + "Settings" buttons.
- Specimen Catalog: grid of all 6 figurines. Click → full specimen inspect view (from design doc).
- Settings panel: toggles for reduced motion, colorblind mode, high contrast, focus mode (hides log), palette swap (paper ↔ night print).
- Match-end screen: losing side fades to paper-dim, winner crown pops, mono banner types `> MATCH WON · PLAYER 01`, dev-log footnote with seed + duration + bomb count.
- Pause menu (space to pause during a match).
- Rules/help overlay.
- Keyboard + focus ring implementation (1px violet focus rectangles on all interactive elements).
- Reduced-motion mode: spins shorten to 400ms, hit-stops to 40ms, shake disabled; juice primitives check the `prefers-reduced-motion` media query and the in-game toggle.
- Colorblind mode: add mono letter overlays `S/D/H` to panels.

Exit criteria: end-to-end user flow works from main menu → match → victory → main menu without bugs. All settings functional.

---

## Phase 9 — Sound

**Goal**: audio layer.

Tasks
- Author or source a small sound palette: wheel tick, wheel settle, hit-stop stinger, bulwark hit, crown hit, bypass hit, KO, rank-up, bomb, match-win, mono-log character tick, button click, menu navigation. Chiptune + paper-rustle textures per the design doc.
- `src/audio/` with Howler setup. Volume categories (sfx, music, ui) with separate levers in settings.
- Wire SFX to the juice primitives (hit-stop triggers stinger, shake triggers hit, number-roll triggers ticks).
- Optional: one ambient music loop, quiet, mono-synthy. Mutable by default off for focus mode.

Exit criteria: all beats have sound, settings let the user turn categories on/off.

---

## Phase 10 — Balance Tooling + Polish

**Goal**: headless simulator and balance iteration.

Tasks
- `bin/simulate.ts`: Node entry point that imports the pure rule engine. Runs N matches with seeded RNG, records per-turn stats (crown damage dealt, figurine win rates, match length, priest-only stall rate, bypass rate).
- `bin/balance-report.ts`: parses simulator output, prints a mono table of imbalance flags (e.g., Mage win rate >55%).
- Small adjustments to figurine tables get re-run through the simulator.
- Performance: verify 60fps on mid-range laptop, profile any frame drops in the r3f canvas.
- Bug bash. Playwright E2E test covering main menu → match → win.
- README.md with how to run, test, simulate.
- Final: deploy to static host (Vercel/Netlify/Cloudflare Pages).

Exit criteria: simulator runs 10k matches in under a minute, flags imbalance, deploy URL is live.

---

## Dependency Graph

```
Phase 0 ──▶ Phase 1 ──▶ Phase 2 ──▶ Phase 3 ──▶ Phase 4 ──▶ Phase 5 ──▶ Phase 6 ──▶ Phase 7 ──▶ Phase 8 ──▶ Phase 9 ──▶ Phase 10
                                                                                               ▲                        │
                                                                                               └────────── feedback ────┘
```

Phase 10's simulator can begin right after Phase 1 (it only needs the rule engine), so in practice you can run balance iterations in parallel with Phases 3-7.

---

## Rough Timelines (solo developer, full-time equivalent)

- Phase 0: 0.5 day
- Phase 1: 3-4 days
- Phase 2: 1 day
- Phase 3: 2-3 days
- Phase 4: 1 day scaffolding + art time variable
- Phase 5: 3-4 days
- Phase 6: 3-4 days
- Phase 7: 4-5 days (juice is iterative)
- Phase 8: 2-3 days
- Phase 9: 1 day wiring + sound authoring time variable
- Phase 10: 2 days
- **Total**: ~25 development days plus art/audio authoring.

---

# Claude Code Handoff Prompt

Copy the block below into a fresh Claude Code session at the root of an empty directory. It builds Phase 0 through the end of Phase 1. Re-invoke Claude Code with the next phase's prompt when you're ready.

```
You are building a web game called "Wheels", a rebalanced reimagining of the Sea of Stars minigame. The authoritative specs are two markdown files which I will provide at the start of the session:

  - wheels-rules-sea-of-stars.md (game rules)
  - wheels-visual-design.md (visual + animation spec)

Before writing any code:
  1. Read both spec files completely.
  2. Produce a short written understanding of the rules and the visual design, and ask me about any ambiguities. Wait for my answers.

Then execute PHASE 0 and PHASE 1 of the implementation plan (wheels-implementation-plan.md, also provided):

PHASE 0 — Repo scaffold
  - Initialize a Vite + React + TypeScript project using pnpm.
  - Install runtime deps: three @react-three/fiber @react-three/drei zustand xstate @xstate/react howler tailwindcss postcss autoprefixer.
  - Install dev deps: vitest @testing-library/react @testing-library/jest-dom @playwright/test eslint prettier typescript @types/three @types/howler.
  - Configure tsconfig with strict + noImplicitAny + exactOptionalPropertyTypes.
  - Configure Tailwind with the exact palette tokens from the visual design doc as named theme colors.
  - Self-host IBM Plex Mono (or JetBrains Mono), Space Grotesk, and Press Start 2P via local woff2 files or @fontsource. Configure font-feature-settings: "tnum".
  - Build a <Stage> component: 480x270 base canvas, nearest-neighbor upscaled to fill viewport, paper-cream background, visible 8px grid rendered as a fixed-position SVG at 3% ink opacity.
  - Set up ESLint + Prettier + a simple pre-commit hook via husky (or skip husky if heavy).

PHASE 1 — Pure rule engine
  - Create src/game/types.ts with explicit types for Figurine, Rank, Panel, WheelState, PlayerState, GameState, LogEvent.
  - Build src/game/rng.ts (seeded PRNG; mulberry32 is fine).
  - Build src/game/rules/panels.ts with the wheel panel distribution tables from the rules doc.
  - Build src/game/rules/figurines.ts with every champion's Bronze/Silver/Gold stats and activation effects exactly as specified in the rules doc.
  - Build src/game/rules/xp.ts, bulwark.ts, actions.ts, resolve.ts. resolve.ts executes the 10-step resolution order and returns (new GameState, LogEvent[]).
  - Every function must be pure (no mutation, no side effects); state changes return new GameState.
  - Write Vitest tests in __tests__/ covering:
      • panel distribution counts per wheel
      • each figurine's Bronze/Silver/Gold activation output (crown dmg, bulwark dmg, special effects)
      • XP carryover on rank up
      • bulwark decay at turn start
      • at least 2 scripted multi-turn scenarios with fixed seeds producing expected final states
  - Achieve >90% coverage on src/game/rules/.

Constraints:
  - TypeScript strict mode, no `any`, no `as` casts outside of tests.
  - No UI work in Phase 1 beyond the empty <Stage>. Don't start on wheels, sprites, or components yet.
  - Keep src/game/ free of React imports — it must run in a plain Node simulator later.
  - Do not use em dashes in code comments or docs you write.
  - Use pnpm only.

At the end of Phase 1, run `pnpm test` and show me the output. If tests fail, iterate until they pass. Do not move on to Phase 2 without my approval.

Ask questions when requirements are ambiguous. Do not guess.
```

When you start Phase 2+, feed Claude Code an analogous prompt derived from the phase sections above plus the updated spec files.

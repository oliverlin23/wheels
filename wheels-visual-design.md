# Wheels: Visual Design Document

## Design Philosophy

The visual style is **brutalist-modern pixel art**: a marriage of three sensibilities that reinforce each other rather than compete.

1. **Brutalist web design**: raw, exposed structure. Flat colors with zero gradients. Restricted palette. Monospaced technical typography. Sharp 1px borders. No drop shadows, no glows except where they communicate a rule. The UI is honest about being software and doesn't pretend to be a physical object.
2. **Indie weird web**: the site-as-artifact feeling of Charcuterie, Are.na, design-engineer portfolios, and early-web specimen collections. Small, hand-crafted, opinionated, playful. Details that reward attention. UI patterns invented for this specific game rather than borrowed from off-the-shelf component libraries.
3. **Modern pixel art**: the sprite craft of *Celeste*, *Hyper Light Drifter*, and *Sea of Stars*, but sitting inside a brutalist frame rather than a cinematic one. The pixels are the art; the UI around them is unapologetic engineering.

The result should feel **modern yet retro**: paper-cream backgrounds and saturated ink-like accents evoking risograph prints and 1970s technical manuals, combined with crisp pixel sprites and the tactile 3D spin of the wheels. Looks like a piece of software that could exist today, but whose DNA includes punch cards, graph paper, and early arcade cabinets.

**The 3D spinning wheels remain the hero element.** Low-poly 3D meshes with pixel-art textures, rotating as real geometry. Everything else is flat 2D laid out on a visible grid.

---

## Color Theme

A four-identity palette. The base is the **paper/ink two-color brutalist scheme** (cream background, saturated ink accent), extended with player/opponent tinting and resource colors that sit outside both.

### Core Palette


| Token              | Hex       | Use                                                                 |
| ------------------ | --------- | ------------------------------------------------------------------- |
| `--paper`          | `#F5F1E8` | Primary background (warm cream, uncoated paper feel)                |
| `--paper-dim`      | `#EDE7D6` | Secondary surfaces, card fills, panel backgrounds                   |
| `--ink`            | `#0F172A` | Primary text, 1px borders, grid lines, technical labels             |
| `--ink-mid`        | `#334155` | Secondary text, muted labels                                        |
| `--blue-ink`       | `#1E40AF` | **Player accent** (saturated royal/IKB-adjacent blue)               |
| `--blue-wash`      | `#DBEAFE` | Player zone background tint (very soft blue on cream)               |
| `--red-ink`        | `#B91C1C` | **Opponent accent** (saturated oxblood/ink red)                     |
| `--red-wash`       | `#FEE2E2` | Opponent zone background tint                                       |
| `--square-gold`    | `#D97706` | Squares symbol (mustard/amber, not neon yellow)                     |
| `--diamond-teal`   | `#0F766E` | Diamonds symbol (deep teal)                                         |
| `--hammer-steel`   | `#475569` | Hammers symbol (cool graphite)                                      |
| `--midline-violet` | `#6D28D9` | Midline divider (deep saturated violet)                             |
| `--bypass-magenta` | `#BE185D` | Bombs, bypass damage, critical alerts                               |
| `--rank-bronze`    | `#92400E` | Bronze rank indicator                                               |
| `--rank-silver`    | `#64748B` | Silver rank indicator                                               |
| `--rank-gold`      | `#B45309` | Gold rank indicator (slightly darker than Squares to differentiate) |


### Color Rules

- **No gradients anywhere.** All fills are flat. Where depth is needed, use 1px borders or tonal stepping with the paper/ink palette, never gradients.
- **No drop shadows, no soft glows.** Exceptions: glow on an active hero about to act (mechanically meaningful), glow on a locked wheel (state indicator). Both rendered as solid rings/outlines, not soft blurs.
- **Zone tinting is subtle.** Player and opponent zones wash the paper background with a 5-10% blue or red tint. The paper shows through. Loud color only on accents, text, and critical indicators.
- **Resource colors are muted and deliberately off-trend.** Mustard amber, deep teal, graphite. Evokes printers' ink, not digital neon.
- **The only neon-ish colors are bypass magenta and midline violet.** These are reserved for things that should demand attention.

---

## Typography

Two typefaces only, used with discipline.

### Primary: Monospace

Everything technical: HP, energy counts, XP values, turn indicators, stats on figurine cards, floating damage numbers, button labels, tooltips. A slab-flavored monospace like **IBM Plex Mono**, **JetBrains Mono**, or **Berkeley Mono**. Weights 400 and 600 only.

Using mono everywhere signals "this is data." Numbers align in columns, matching the graph-paper / technical-manual vibe.

### Display: Geometric Sans-Serif

Only for the wordmark, victory/defeat screens, and large section headers. Space Grotesk, Neue Haas Grotesk Display, or a similar confident geometric face. Weight 700 for display sizes.

### Pixel Font (Contextual)

In-game elements that live "inside" the pixel-art world (floating damage numbers on the wheels, labels on the figurine sprites themselves) use a pixel font (*Press Start 2P*, *Pixel Operator*). This maintains the pixel-diegetic feel inside the game stage while the surrounding UI stays in mono.

### Typography Rules

- No italic. Emphasis via weight, color, or an underline rule.
- No kerning tricks. Tabular numerals on everything.
- All caps for technical labels and status words (e.g., `TURN 04`, `BULWARK 03/05`, `LOCKED`). Sentence case for descriptive text.
- Large size jumps. A small mono stat at 12px, the hero numeric at 48px+, nothing much in between. Brutalist typography loves strong hierarchy.

---

## Layout and Grid

The entire interface sits on a **visible 8px grid**. Not subtly implied; actually drawn as 1px hairlines on `--ink-mid` at very low opacity (3-5%) across the paper background. This is the weird-web / Charcuterie move: expose the structure. The grid tells the player "this is a designed system" instead of hiding behind skeuomorphism.

### Overall Structure

The Sea of Stars board is a **dumbbell silhouette**: two circular zones (each holding two figurine platforms + a crown) connected by a central bridge at the midline, with wheel strips running across each zone. We preserve that architecture, but draw every piece of it in flat paper-ink pixel art. No wood, no rivets, no fantasy flourishes; the chassis is a graph-paper diagram of the same board.

```
┌──────────────────────────────────────────────────────────────────┐
│ TURN 04                    WHEELS                      ⚙    ?   │
├──────────────────────────────────────────────────────────────────┤
│ // OPPONENT                                                      │
│                                                                  │
│   ╭──[W1]─[W2]─[W3]─[W4]─[W5]──╮    ← outer wheel strip (3D)    │
│   │         (shared state)      │      drawn on a 1px ink rail   │
│   │                              │                                │
│   ( o )─────╔═══════════╗─────( o )  ← figurine platforms wired  │
│   ARCHER    ║  CROWN    ║    MAGE     to central Crown via 1px   │
│  [sprite]   ║   ♛  07   ║  [sprite]   ink channels               │
│  ▓▓▓░░3/3   ║ █▓▓▓ 01/05║  ▓▓▓░░3/3                              │
│   XP 6/10   ╚═══════════╝    XP 5/10                              │
│                                                                   │
├── NEUTRAL STAGE ─────────────┨▓┠───────────────── [PLAYER 01] ─  │
│                            BRIDGE                                 │
│                         (pixel arch)                              │
├── NEUTRAL STAGE ─────────────┨▓┠─────────────────────────────── ─│
│                                                                   │
│   ( o )─────╔═══════════╗─────( o )                               │
│   MAGE      ║  CROWN    ║   WARRIOR ←  active: gold ring, 2px    │
│  [sprite]   ║   ♛  10   ║  [sprite]    border, subtle pop         │
│  ▓▓▓░░3/3   ║ █████ 05/05║  ▓▓▓░░3/3                              │
│   XP 5/10   ╚═══════════╝    XP 8/10                              │
│   │                              │                                │
│   ╰──[W1]─[W2]─[W3]─[W4]─[W5]──╯    ← mirrored strip, same state │
│                                                                   │
│                     [ SPIN ]    SPINS ▓▓░                        │
│                                                                   │
│ // PLAYER                                                        │
└──────────────────────────────────────────────────────────────────┘
```

Reading of this layout:

- Each zone is a **pill-shaped plate** (1px ink outline on paper-dim fill) that encloses the figurine platforms, the crown box, and the wheel strip for that side.
- **Figurine platforms** (`( o )`) are small oval pedestals drawn in pixel art: 1px ink outline, paper-dim fill, a 1px ellipse shadow below. The 32x32 figurine sprite sits on the platform.
- **Wiring channels** (`────`) are 1px ink rules drawn inside the zone plate, connecting each figurine platform to the Crown. They visually group the trio as one circuit. When that figurine acts, the channel between platform and Crown briefly ink-bleeds in the zone's accent color (blue or red). This is our minimalist substitute for the glowing wooden runways in the SoS board.
- **Wheel strip** runs across the outer edge of each zone plate (top edge for opponent, bottom for player), mounted on a 1px ink rail (`╭──...──╮`). Both strips are visual readouts of the same shared wheel state; they mirror each other every spin. This keeps the board-feel without inventing per-player wheels.
- **Central bridge** sits at the horizontal center of the midline gap, a small pixel-art arch (see §Central Bridge).
- **Resource chips** (energy pips, XP bar) sit directly below each figurine platform, not on the Crown, preserving the "resources belong to the champion" feel of the SoS board.

### Layout Rules

- Everything aligns to the 8px grid.
- Borders are 1px, always, in `--ink`. No 2px borders, no rounded corners beyond 2px, no pill buttons.
- Containers use double borders (`╔═══╗` style visually, achieved via two 1px rules with 2px gap) only for hero elements: Crown displays, victory states, the main SPIN button.
- Generous negative space. Cream paper around and between elements, not packed to the edges.
- Visible **section labels** at top-left of each zone: `// PLAYER`, `// OPPONENT`, `// STAGE`. Monospaced comment-style slashes reinforce the "software as honest software" feel.

---

## The Midline and Central Bridge

Two midlines bracket a narrow neutral band, and a **pixel-art bridge** sits dead-center across that band. The bridge is the visual payoff of the dumbbell silhouette: the thing that connects the two zone plates and tells the player "one board, two sides."

### Midline Treatment

- 1px `--midline-violet` horizontal rule across the full width (one above, one below the neutral band).
- Midline label sits on the rule itself at centered position: `[ NEUTRAL STAGE ]` in mono caps, paper background punching through the rule so the text appears to sit on top.
- When a player is active, a mono turn indicator appears on their side of the midline: `◀ PLAYER 01` (player's turn) or `OPPONENT 02 ▶` (opponent's turn). Slides along the midline during turn transitions.
- Cross-midline attacks draw a brief pixel-art trail in the attacker's ink color (blue or red). Trail steps across the midline and under the bridge in grid-aligned dots, fades in 400ms.

### Central Bridge

A small pixel-art arch centered on the midline. This is our homage to the SoS stone bridge, redrawn as a clean paper-ink glyph instead of a textured 3D prop.

- Dimensions: 48x32 pixels in the base canvas, dead-centered between the two midline rules.
- Construction: 1px ink outline, paper-dim interior, with a simple 5-step pixel arch silhouette (no wood grain, no shading). The arch reads as a schematic, like a blueprint line drawing.
- Underneath the arch, a 1px violet rule runs horizontally connecting the two zone plates through it; visually, the bridge is a tiny doorway that this rule passes through.
- The bridge is **also a turn-token surface**. When the active player changes, a small `◆` glyph slides across the bridge (opponent side → player side, or reverse) in the new active player's accent color. Takes 400ms, step-eased.
- On cross-midline attacks, the attacker's projectile passes **through** the bridge opening rather than over or around it. A 1-frame violet ink-bleed on the arch when a projectile passes, signalling "crossing the neutral boundary."
- When a match is won, the bridge ink-bleeds to the winner's color for 1 frame, then fades back to ink. Small beat, but ties the board to the outcome.

### Zone Plates

Each player's figurines, crown, and wheel strip all sit inside a single **pill-shaped zone plate**: a 1px ink outline filled with the zone wash (blue or red at 5-10% on paper). The plate has rounded caps (8-pixel radius, grid-aligned) at the left and right ends and flat long edges. This is the visual echo of the SoS circular island-platforms, flattened into one continuous plate per side.

- Plate outline: 1px `--ink`.
- Plate fill: `--blue-wash` (player) or `--red-wash` (opponent).
- Plate inner elements (figurine platforms, Crown box, wheel rail) are drawn on top with their own 1px ink outlines.
- Wiring channels inside the plate are 1px ink rules connecting the three anchors (left figurine → Crown → right figurine). They form a visible "Y" when combined with the vertical channel to the wheel rail.
- No gradient on the plate, no drop shadow beneath it. The zone plate is a flat diagram.

The midline + bridge + two zone plates together produce the dumbbell silhouette at a glance, even from across the room.

---

## Player and Opponent Zones

Mirrored **zone plates** (see §Zone Plates) in cream with zone wash (blue or red). Each plate contains, left to right: figurine platform, wiring → Crown → wiring, figurine platform. A wheel rail runs along the outer long edge of each plate.

### Figurine Platforms

Unlike the earlier spec where figurines lived inside rectangular specimen cards, on the board they live on **oval pedestal platforms** (the minimalist answer to the SoS ring-dais). The platform is the chassis element; the specimen card is a separate inspect view opened by clicking the platform.

- Platform footprint: 48x16 oval, 1px ink outline, paper-dim fill, a 1px ink ellipse 2px below the platform as its hard-edge shadow.
- Rank ring: a 1px ink ellipse inscribed inside the platform, colored by rank (`--rank-bronze`, `--rank-silver`, `--rank-gold`). This is how rank reads on the board at a glance.
- Sprite: 32x32 pixel figurine stands on the platform, bottom-aligned to the ellipse top.
- Figurine label: mono caps, 10px, directly below the platform shadow: `WARRIOR`.
- Resource readout: a 2-row mono block below the label:
  ```
  ENERGY  ▓▓░  3/3
  XP      ▓▓▓▓▓▓░░░░  6/10
  ```
  Bars rendered as 1px-tall filled rectangles or mono block characters, tabular nums on the values.
- Active state: the rank ring thickens to 2px and fills solid rank color; the wiring channel from platform to Crown ink-bleeds in zone accent; a small mono marker `▶` appears to the left of the label (pointing inward toward the Crown). All three changes together, no extra glow.
- Clicking an idle platform opens the **specimen inspect view** (the full-page detail pane described in §Weird-Web Details). The platform stays on the board; the view slides in over the paper as an overlay.

### Specimen Inspect View (Opens From Platform)

Clicking a figurine platform slides an overlay across the paper with a full specimen entry. Think of this as the Charcuterie Unicode detail pane applied to a board piece: a separate, larger view for study rather than the cramped on-board readout. The board behind the overlay dims 15% and pauses idle animations while the pane is open.

```
┌─────────────────────────┐
│ // WARRIOR        BRONZE│  <- label + rank in mono caps
│                         │
│    [64x64 PIXEL SPRITE] │  <- enlarged portrait (2x the board sprite)
│                         │
├─────────────────────────┤  <- 1px rule
│ ENERGY    ▓▓▓░░░   3/3  │  <- mono stat rows
│ XP        ▓▓▓▓▓▓░░░ 6/10│
├─────────────────────────┤
│ CROWN DMG          03   │  <- stats as data
│ BULWARK DMG        03   │
│ HEIGHT             00   │
├─────────────────────────┤
│ A disciplined blade who │  <- short mono description
│ trades steadily. Wins   │     block; sentence case.
│ grinds, not gambles.    │
└─────────────────────────┘
```

- Pane background: `--paper-dim` on top of a dimmed board.
- 1px border in `--ink`.
- Top-left label: `// FIGURINE_NAME` in mono.
- Top-right: rank chip, colored by rank token.
- Portrait: 64x64 pixel sprite (the board is 32x32; the inspect view shows it at 2x for detail).
- Stat rows: mono labels, mono values, small bar charts as 1px-tall rectangles. Data-as-UI.
- Footer description: 3-4 mono lines of sentence-case prose describing the champion's role. Short.
- Close: `Esc` or click outside. Slide-out 200ms, board returns to full brightness.

The **"about to act" state and rank-up animations belong to the platform on the board**, not to this pane. The pane is purely a reading surface.

### Crown Display

A **double-ruled box** containing the crown glyph and HP number. Uses 2 nested 1px rules with a 2px gap between them. This is the brutalist way to say "important" without using shadows or glows.

```
╔════════════════╗
║   CROWN        ║
║    ♛           ║  <- pixel crown sprite
║    10          ║  <- big mono numeral
║   █████ 05/05  ║  <- bulwark bar
╚════════════════╝
```

- Crown glyph: 24x24 pixel sprite.
- HP number: 48px mono, weight 600.
- Bulwark: 5 segments rendered as filled/empty rectangles, mono `05/05` counter to the right.
- At low HP (<4): HP number switches to `--red-ink`. Number gets a subtle 2-frame wobble animation. No glow, no pulse.

---

## The Wheels (Centerpiece)

The 5 wheels are the only 3D element in the interface. They appear as **two mirrored strips**, one mounted on the outer rail of each zone plate (top of opponent plate, bottom of player plate). Both strips show the same shared wheel state; every spin updates them together. This preserves the Sea of Stars board feel (wheels belong to each side of the board) without actually splitting the wheel pool into two halves.

### Rail Mounting

- Each strip sits on a **1px ink rail**: a horizontal 1-px-thick ink line with two tiny 4x4 ink "brackets" at each end, pinning the strip to the zone plate. Pure schematic, no volumetric chassis.
- Drums sit on the rail with their base ellipses touching the rail line. The rail is the ground the drums "rest" on.
- Between drums: 8-pixel gaps, grid-aligned.
- The rail continues past the last drum on each side by 8 pixels, terminating in a small bracket glyph (`┤`).

### Mirrored Behavior

- Both strips spin at the same moment, same panels, same settle timing. A spin on wheel 3 animates wheel 3 in both strips simultaneously.
- Locked state, match highlights, and the above-wheel result chip (`[ SQ ]`) all render on both strips.
- Cost: one extra set of meshes per spin, but all reading from one state source. Zustand store holds the canonical wheel state; both strips are views.

### Geometry

- Low-poly 8-sided cylindrical drums (one face per panel).
- Pixel-art textures applied to each face with `THREE.NearestFilter` for crisp pixels.
- Drum chassis: flat paper-dim color with a 1px ink outline at the rim. No metallic shading. The drum reads as "a drawn object" rather than "a simulated mechanical wheel" - consistent with the brutalist no-skeuomorphism rule.
- Lighting: minimal. A single soft key light. No rim lighting in base state. During spin, a brief 1-frame flash across the wheel when it settles.
- Base of each wheel: rendered as a 1px ink ellipse on the paper, the shadow of the drum. Not a soft shadow; a hard-edged vector outline.

### Panel Faces

16x16 pixel-art tiles.

- **Square**: mustard-amber filled rounded square, 12x12 in the 16x16 panel.
- **Diamond**: deep teal rotated square (rhombus).
- **Hammer**: graphite hammer silhouette with 1px highlight.
- **Starry-background (XP)**: symbol on a `--paper-dim` panel with small star sprites (tiny 2-3px pixel stars) scattered, plus a 1px outline ring in the symbol's color. Reads as "this panel is different" without glowing.
- **No blank panels** (removed in rebalance).

### Spin Animation

1. **Anticipation** (150ms): small 10° back-rotation.
2. **Spin** (1.2-1.8s): 3D rotation at real speed, with pixel textures blurring into motion lines (a 1-2 pixel streak effect on the panel faces during peak speed, rendered as added horizontal lines on the texture in the shader).
3. **Settle** (300ms): eases to final rest with a 1-frame bounce. A small **mono kanji-style text marker** appears briefly above the wheel showing what it landed on: `[ SS ]` in a 1px-bordered chip that fades in 400ms.

### Locked Wheels

- 2px ink ring around the drum.
- `[ LOCKED ]` mono label appears above the wheel in a 1px-bordered chip.
- Active glow is just a solid-color ring, no blur.

### Match Highlighting

After all wheels settle, matching symbols connect with a **1px ink rule** across the matched panels (not a glow, a drawn line). A mono counter pops up above the row: `SQUARES × 04 → +02 ENERGY`. The `→` and breakdown make the rule execution feel like you're reading software output.

---

## Animations and Feedback

### Juice Philosophy

This is a brutalist pixel-art game, not a candy-colored slot machine. **Juice is earned, not sprayed.** Every animation follows three rules:

1. **Precision over exuberance.** Short durations (most feedback 80–300ms). Exact timings. Things snap rather than drift. No overshoot bounces unless the moment is a hero beat.
2. **Grid-aligned juice.** Camera nudges, shake, and displacements move in whole pixel steps (1px, 2px, 4px) on the 480×270 base canvas. Motion never reveals sub-pixel rendering. The grid stays honest.
3. **Tiered intensity.** Tiny beat for tiny events (panel lands), medium beat for mid events (figurine acts), full hero beat for big events (KO, match point, rank up, bomb). Most of the time the game is calm so the big moments land.

A useful reference: the way a Teenage Engineering synth lights up a button. Snappy, confident, slightly more satisfying than it needs to be, never ostentatious.

### Core Principle: Show the Calculation

Every effect that resolves prints a mono line of "log output" at the side of the stage, like a technical readout. Example during resolution:

```
> ROLL FINALIZED
> PANEL XP:      SQ+1 → WARRIOR 5/10 (+1)
> HAMMERS × 03 → BULWARK +1 (04/05)
> SQUARES × 04 → WARRIOR +2 ENERGY (3/3)
> WARRIOR ACTS → CROWN DMG 03 (BLOCKED, BULWARK → 01)
> XP +2 → WARRIOR 7/10
```

This log scrolls in the margin during resolution. Each new line types in character-by-character over 80-120ms with a quiet mono tick SFX per character. Weird-web / Charcuterie move applied to gameplay: **expose the state transitions as readable output**. Default-on, toggleable to a "focus mode" that hides the log.

### Animation Primitives

These are the building blocks every effect is composed from. Keeping the vocabulary small keeps the language consistent.

- **Snap**: 80ms step-ease to target (1-2 frames of in-between, not smooth). Used for state changes (locked wheel ring appearing, border thickening).
- **Tick**: 40ms flash of accent color, then return. Used for small acknowledgements (panel click, button hover).
- **Pop**: 120ms scale from 100% → 108% → 100% with step easing (only 2 intermediate frames). Used sparingly on hero-relevant UI only (the active figurine card, the Crown HP number on heal).
- **Shake**: camera translates in 1-2px steps, 4-6 frames total, damped. Deployed for impact feedback. Full shake strength (2px, 6 frames) only for crown damage; half-strength (1px, 4 frames) for bulwark damage.
- **Hit-stop**: freeze all motion for 60-120ms on high-impact frames (the exact frame a Mage fireball connects, the frame the Assassin blade lands). The world holds its breath. Cheap, enormously satisfying.
- **Rip**: 1-frame chromatic aberration. The sprite offsets red/blue by 1px for a single frame, then snaps back. Used once per KO. Feels like a glitch in the print, consistent with the riso aesthetic.
- **Ink-bleed**: a 1-frame `--bypass-magenta` or `--midline-violet` fill pulse on a container edge, then gone. Replaces soft glow.
- **Number roll**: mono digits roll digit-by-digit to their new value over 200-300ms, each digit snapping through intermediate values (not smooth counting). Like a mechanical counter.
- **Settle-bounce**: only on the wheel drums and the SPIN button press. 1-frame overshoot (2px or 5° past target) then snap back. Nothing else in the interface bounces.

### The Dense Beat (Wheel Settle)

When wheels finish spinning, the moment is orchestrated frame-by-frame:

1. Each wheel settles in turn, 80ms apart, instead of simultaneously. Builds a rhythm `tick · tick · tick · tick · tick`.
2. Each settle = settle-bounce + tick flash on the landed panel + mono chip `[ SQ ]` fades in above.
3. On the last wheel, a **0.4s hit-stop** after it lands. Everything holds.
4. Matching panels connect with a 1px ink rule that **draws in** across matched wheels (left to right, 200ms, step-animated in 8px segments so the line appears to tick across the grid).
5. Log line types: `SQUARES × 04 → WARRIOR +2 ENERGY (3/3)`.
6. Warrior card pops (120ms).
7. Energy bar fills with a segment-by-segment snap-in, one segment per 60ms, mono counter rolls.

Total: ~2.5s of ceremony, but every beat is earned by meaningful state change. No filler frames.

### Hero Activation (Attack Sequences)

Pixel-art sprite animations (6-12 frames each). Structure is always:

1. **Anticipation** (2-3 frames, ~120ms): hero winds up. Opponent card dims 20%. Camera pulls 1px toward the attacker (hero framing move on a budget).
2. **Release** (1 frame, hit-stop 60ms): the frame of commitment. Everything else in the UI freezes.
3. **Travel** (variable): projectile crosses the midline in the attacker's ink color (blue or red). Pixel trail 2-3 pixels long. For instant-resolution attacks (Warrior sword, Assassin dash), replace travel with a 1-frame streak across the target zone.
4. **Impact** (1 frame, hit-stop 100-120ms): target sprite shows hit frame (stagger pose). Damage number spawns at impact point in mono pixel font, rises 8px over 300ms then fades. Shake and ink-bleed fire here.
5. **Recovery** (2-3 frames): everyone returns to idle.

**Attack routing**: every attack computes `attackHeight > opponentBulwarkHeight`. If true, the projectile's terminal point is the opponent Crown; if false, it's the top of the opponent Bulwark. The visual path is routed accordingly — a blocked attack literally stops at the bulwark bar and the bulwark takes the hit animation instead of the crown.

Per-hero specifics:

#### Warrior — Melee Arc (total ~300ms)
- **Anticipation** 120ms: sprite swaps to wind-up frame
- **Travel** — instant 1-frame ink streak from hero platform to target
- **Impact** 100ms: hit-stop + 2-pixel ink arc trail that flashes once, holds 120ms extra if killing blow
- **Recovery** 80ms
- Height: ground-level. Always hits bulwark first if one exists.

#### Mage — Dual Fireball (total ~1000ms)
- Launches **two fireballs in sequence**, separated by 200ms:
  1. **Ground fireball**: low arc, 4×4 pixel sprite with 3-pixel trail in attacker's ink color. Travel 500ms. Hits bulwark (if present) or crown at ground level.
  2. **High fireball**: launches 200ms after the first, arcs visibly higher — crossing **above the midline bridge**. Travel 500ms. Always hits crown (height 6 > max bulwark 5).
- Hit-stop 120ms only on the second impact — the two fireballs feel like separate beats, not one effect.
- Killing blow? The high fireball impacts with rip + full 2px shake.

#### Archer — Arrow Parabola (total ~700ms)
- **Draw** 200ms: hero pulls back bow, sprite frame swap
- **Travel** 400ms: arrow sprite (3 pixels long) traces a **parabola rendered as stepped dots** — 12-14 grid-aligned 2×2 pixel dots, never a smooth curve. Arc peaks at height 3.
- **Impact** 100ms: 1-frame feather burst (4 small pixel fragments spraying ±4px from impact point)
- If bulwark height ≥ 3: arrow terminates at the bulwark top; arc clips visibly. If bulwark < 3: arrow continues over and lands on crown.

#### Engineer — Wrench + Build (total ~500ms, concurrent beats)
- **Throw** 300ms: wrench sprite arcs forward to target, spinning (1-frame-per-30ms rotation)
- **Impact** 120ms: wrench sticks for 1 frame, then disappears
- **Build** (starts at t=0, parallel to throw): own bulwark bar fills two segments with snap-in animation — one segment per 150ms left-to-right, mono `+1` pixel text floats up and fades over 400ms per segment. Ends at t=300ms.
- Two simultaneous beats — offense + defense — which is the Engineer's whole personality.

#### Assassin — Dash Strike (total ~630ms)
- **Dash** 200ms: hero sprite **disappears** from own platform; a 1-frame streak (6px wide, ink-colored) crosses the midline to the opponent crown. Bypasses bulwark.
- **Strike** 80ms hit-stop: crown flashes magenta, HP rolls down, rip effect (1-frame chromatic offset)
- **Strip** 200ms (concurrent with strike): opponent's topmost bulwark segment shatters into 4 pixel fragments that fall 4px over 300ms with gravity ease, then fade
- **Delay** 150ms (concurrent): target hero's energy bar ticks down, red ink-bleed fires, mono text `-1 ENERGY` floats
- **Return** 150ms: hero sprite rematerializes on own platform (1-frame fade-in)

#### Priest — Heal + Charge (total ~500ms, concurrent beats)
- **Raise staff** 200ms: hero sprite raises arms, gold shimmer behind
- **Healing stream** 300ms: stepped-dot stream (2×2 gold pixels) flows from priest to own crown, one new dot every 40ms. Crown HP number pops (120ms) and rolls up when stream arrives.
- **Energy spark** 300ms (concurrent): tiny 4×4 gold spark arcs from priest toward partner platform, absorbed on contact — 1-frame tick on partner's NRG bar.
- No attack animation — this is explicitly non-offensive.

#### Bomb — Arcing Projectile (total ~900ms, biggest beat short of KO)
Triggered when a Gold-rank hero crosses 10 XP.
- **Spawn** 200ms: pulsing violet `◆` glyph appears above the hero platform
- **Arc** 500ms: large (8×8) violet-magenta sprite launches on a high grid-stepped parabola — arcs **over** the opponent zone plate, visibly above any bulwark. Trails 4 stepped dots in magenta.
- **Impact** 200ms: full hit-stop + rip effect + hard 2px shake (8 frames) + 1-frame full-width `--bypass-magenta` flash on the crown. HP rolls down by 2. Resolution log types the bomb line at 80ms per character (half speed) to draw out gravity.
- Always bypasses bulwark — the arc's visual path sells this.

### Hero Beats (The Big Moments)

These get the full juice treatment because they are rare and meaningful.

- **KO**: full 2px shake (8 frames), hit-stop 200ms, rip (1-frame chromatic offset), target sprite shatters into 6-8 pixel fragments that fall off-screen over 500ms, a full-width 1px `--bypass-magenta` rule sweeps across the screen once, log prints `> [HERO] KO`.
- **Match point (one hero remaining on a side)**: the surviving figurine's card border pulses between 1px and 2px once every 2 seconds until the match ends. Quiet, ominous, mono-accented.
- **Rank up**: card border flashes rank color, fills entire card for 200ms, then snaps back to 1px ink with the rank chip updated. Number-roll on the affected stat. Mono banner `[ RANK UP ]` pops in above the card (120ms pop) and lingers 600ms before sliding up and out.
- **XP threshold hit (10)**: the XP bar fills to exactly 10, ink-bleeds violet once, then the rank-up sequence fires.
- **Bomb**: pixel bomb sprite launches on a high arc (use grid-stepped parabola). Anticipation: 200ms pause at apex where the bomb hangs. Impact: 1-frame full-screen magenta flash (not a wash, a single frame of `--bypass-magenta` fill with scan-line pattern overlay), then immediate hit-stop 300ms. Crown box gets a 2px magenta border that ink-bleeds away over 400ms. Resolution log types the damage out slower than normal, one character per 80ms instead of 20ms, to draw out the gravity.
- **Victory**: the entire losing side fades to `--paper-dim` while the winning side's wash intensifies. Crown of the winner pops. Mono banner types out `> MATCH WON · PLAYER 01`. Dev-log footnote appears below.

### Resolution Playback Timing

Resolution is **played back**, not shown all at once. The server sends the complete event log in a single `RESOLVE_UPDATE`, then the client walks the events as a timeline, advancing visible state step-by-step. This transforms what could be a log dump into a genuine ceremonial moment.

#### Step Cadence

Each resolution step targets **~500ms** of screen time. Long enough to read, short enough to keep rhythm. Step durations vary within a narrow band:

| Step | Target duration |
|---|---|
| Panel XP tick | 500ms |
| Hammers → Bulwark | 500ms |
| Energy accumulation | 500ms |
| Hero activation (most) | 500-800ms (varies by figurine) |
| Bulwark shatter | 400ms |
| Crown damage | 500ms |
| Crown heal | 400ms |
| Bomb | 900ms (the hero beat) |
| Rank up | 600ms |
| Delay (Assassin) | 400ms |
| KO / game over | 1200ms |

Total resolution length scales with events. A minimum-event round (just two activations, no bombs or rank-ups) plays in ~2.5s. A maximum round (dual bombs, multiple activations, rank-ups, crown kills) can run ~8-10s. The ceiling is tolerable because every beat is earned.

#### Wheel Highlighting Contract

During every step, the wheel strips display a `highlightedPanels` set — which panels contributed to this step's effect. Both players' strips highlight simultaneously:

- **Panel XP step**: only the starry panels granting XP glow gold
- **Hammers step**: all hammer panels pulse steel; bulwark bar fills in sync
- **Energy step (sun)**: all sun panels pulse gold, the sun hero's NRG bar fills
- **Energy step (moon)**: all moon panels pulse teal, the moon hero's NRG bar fills
- **Activation/bomb/hit steps**: contributing panels fade to 50% to de-emphasize (attention is on the animation overlay), re-emerge afterward

**Visual highlighting treatments:**
1. Result chip below the drum pulses its symbol color (100ms flash)
2. The 3D drum face brightens by ~30% value via material tint for 80ms
3. A 1px ink rule **draws in** left-to-right across all highlighted wheels, stepped in 8px segments (200ms). This is the "matching connection" — the visible computation.

#### Skip / Accelerate UX

- **Click anywhere on the board during playback** — jumps to the next step boundary immediately
- **Double-click** — skips to the end of resolution (final state applied instantly, log shown in full)
- **Reduced-motion setting** in Settings menu — halves all step durations and disables shake/rip effects; final state still displays
- **Focus-mode setting** — hides the resolution log margin; keeps the animations

#### Spectator Playback

Spectators see identical playback to players — each spectator client runs the same timeline independently. No server-side streaming; timing is a client concern.

---

### Ambient Juice (Always-On, Very Quiet)

- **Idle sprites** breathe (1-2px vertical shift every 1.5s, step-animated).
- **Resolution log cursor** blinks at 60% opacity every 600ms when idle.
- **Midline label** (`[ NEUTRAL STAGE ]`) subtly ticks its bracket glyphs every 4s (the brackets shift 1px, almost unnoticeable).
- **Wheel drums** have the faintest idle spin-drift (under 2° per second, imperceptible until you notice it). Ready position, not dead.
- **Paper grain**: a 1-frame dither pattern shifts by 1px every 2s across the paper background. Evokes riso ink settling, adds life without motion.

These are the details that make the interface feel alive without ever calling attention to themselves.

### Impact Feedback (Quick Reference)

- Crown damage: full shake, 1-frame red ink-bleed on crown box, HP number roll, damage number floats mono pixel font in `--red-ink`.
- Bulwark damage: half shake, segments shatter one-by-one if multi-damage (60ms between shatters), mono `-0X` on the bar, bar ticks down.
- Bypass damage: same as Crown damage but magenta ink-bleed instead of red, hit-stop extended by 40ms, damage number in `--bypass-magenta`.
- Blocked damage: sharp tick flash on bulwark, no shake, mono log line `BLOCKED`.
- Heal: Crown number pop, mono `+0X` in `--blue-ink` or `--red-ink` depending on whose crown.
- Critical low HP (< 4): HP number switches to `--red-ink`, enters a 2-frame mono wobble loop (±1px, 400ms cycle). Persistent but subtle.

### Animation Budget

Every frame has a job. For any hero activation we allow at most:

- 1 hit-stop
- 1 camera nudge
- 1 ink-bleed OR rip (not both)
- 1 shake
- Multiple ticks/pops on distinct elements are fine.

If a beat wants more than this, it's wrong-sized for the moment. Scale it down or save the tools for a real hero beat.

### Motion Curves

- Default: **step easing** in 2-3 frames. Pixel-art honest.
- Settle-bounce only: **single-overshoot spring** (1 overshoot, <120ms duration).
- Log scroll: **linear**.
- Never: ease-in-out-expo, back-out, elastic, any multi-oscillation spring.

---

## Iconography

All in-game icons are pixel art. UI icons outside the play area (settings, help) are 1px-stroke line icons in ink, drawn custom to match the brutalist aesthetic. Think Lucide icons but reduced to a single color and exposed grid alignment.

No gradient icons. No filled-color icons in the chrome. Only the pixel-art symbols on wheels and figurines use multi-color fills.

---

## The Weird-Web Details

Small touches that reward attention, in the Charcuterie / indie-web spirit. These are what keep the brutalist shell from feeling cold:

- **Typed-out headers**: The "WHEELS" wordmark at top of screen fades in with a 400ms mono type-out animation the first time a player opens the game each session.
- **Dev-log footnotes**: A tiny mono line at the bottom of the victory screen reads something like `match_04 · seed 0x3F2A · duration 04:12 · bombs 02`. Technical exhaust as ornament.
- **Inspectable specimen cards**: Clicking a figurine card outside a match opens a full-page specimen view styled like a Unicode detail pane from Charcuterie: large portrait, full stat table, a short "entry description" in mono paragraph form, a list of related figurines. Treats the figurines as catalog entries.
- **ASCII-ish section dividers**: Horizontal rules between zones include mono characters at intervals (e.g., `─────────┼─────────┼─────────`). They're pure decoration but give the layout the graph-paper quality.
- **A visible `view source` link** in the footer of the main menu. A nod to the indie web, and actually links to a GitHub repo if applicable.
- **Palette toggle easter egg**: holding `P` swaps between the default warm-paper palette and a "night print" variant (black paper + cream ink) as a color inversion. Both are valid brutalist schemes.
- **Loading states as poetry**: instead of a spinner, brief mono status lines cycle: `> rolling dice`, `> consulting tables`, `> warming drums`, `> aligning stars`. One per loading tick.

These touches are what take the design from "functional brutalist" to "someone made this with love." They should feel discovered, not announced.

---

## Responsive

- **Desktop (>= 1280px)**: Full layout. Base canvas 480x270 upscaled 4-5x with nearest-neighbor.
- **Tablet (768-1279px)**: Same layout, scaled proportionally. Grid lines remain visible.
- **Mobile portrait (< 768px)**: Zones stack. Player on bottom, opponent on top, wheels in center. Resolution log moves to a collapsible drawer. Midline becomes two full-width rules.

---

## Accessibility

- All symbols are shape-distinct (square, rhombus, hammer) before any color is considered.
- Color-blind mode: adds mono letter annotations to every symbol (`S`, `D`, `H`) drawn as pixel overlay.
- High contrast mode: paper → pure white, ink → pure black. Maintains the aesthetic.
- Reduced motion: spin shortens to 400ms, no anticipation or bounce, particle effects disabled. Resolution log still plays.
- All interactive elements have a visible 1px focus rectangle in `--midline-violet`.
- Mono font maintains legibility at small sizes where some geometric sans fonts fail.

---

## Tech Recommendations

- **3D wheels**: Three.js + react-three-fiber. Low-poly cylinders, `THREE.NearestFilter` on textures. No shadows, no post-processing.
- **2D UI**: React + Tailwind for layout (with a custom theme matching the palette tokens above). Grid overlay implemented as a fixed-position SVG.
- **Sprite rendering**: Custom React sprite component reading from Aseprite-exported JSON + PNG atlases.
- **Typography**: Self-host the mono and display fonts via `@fontfamily` with `woff2`. Match tabular-nums feature on.
- **State**: Zustand for game state, XState for the FSM driving turn flow, a dedicated event stream for the resolution log.
- **Audio**: Howler.js. Sound palette matches the aesthetic: mechanical chiptune with paper-rustle / ink-scratch textures layered in.

---

## Mood and Reference Board

- **Charcuterie (elastiq.ch)**: paper + single-ink palette, mono typography, specimen-detail panels, the "data is the UI" ethos. Skip the fisheye grid; keep everything else.
- **Are.na**: warm cream backgrounds, editorial restraint, indie-web sensibility, content as the hero.
- **Rauno Freiberg's portfolio, Maxime Heckel's blog, Linear's early marketing pages**: design-engineer aesthetic. Type-forward, grid-conscious, playful but disciplined.
- **Risograph prints**: cream paper + 1-2 saturated inks, flat areas, no gradients, imperfect ink registration that adds character.
- **Teenage Engineering device manuals**: technical typography, exposed measurements and specs, monospace callouts, minimal color.
- **1970s Letraset catalogs and type specimens**: dense typographic blocks, mono numbering, clear hierarchy.
- **Celeste, Hyper Light Drifter, Sea of Stars sprites**: pixel art craft reference for figurine and symbol design.
- **Teardown's and Hypnospace Outlaw's UIs**: deliberately "software-like" game interfaces that don't pretend to be anything else.

### Avoid

- Parchment textures, medieval flourishes, ornate borders, fantasy serifs.
- Drop shadows on anything.
- Gradients on anything.
- Rounded pill buttons, soft-glow effects, glassmorphism.
- Animated backgrounds beyond the wheels.
- **Smooth continuous juice** (Balatro's perpetual card hovering/scaling, Hearthstone's multi-oscillation card flourishes, ease-in-out-expo everything). The juice here is punchy and intermittent, not ambient eye-candy. Snap, don't float.
- Squash-and-stretch beyond 1-frame overshoot. No cartoony deformation.
- Particle sprays with more than ~8 particles at once. Pixel fragments are always countable.
- Multi-oscillation springs. Everything settles in one beat.
- Juice on things that don't matter (hovering a settings icon should not shake the UI).
- Hiding the grid. Hiding the structure. Hiding the fact that this is software.

The aesthetic summary: **a piece of technical software that happens to also be a beautiful game**. Paper-cream and ink, mono-typed, pixel-crafted, grid-honest, weird-web warm.
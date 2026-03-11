# Missile Command Math — Game Design Document

**Version:** 1.0
**Source Brief:** `docs/briefs/missile-command-math.md` (v2.0)
**Curriculum Map:** None on file
**Status:** Draft

---

## Table of Contents

1. [Overview](#1-overview)
2. [Game Loop](#2-game-loop)
3. [Win / Lose Conditions](#3-win--lose-conditions)
4. [Scene List](#4-scene-list)
5. [Entity List](#5-entity-list)
6. [Scoring Model](#6-scoring-model)
7. [Difficulty Progression](#7-difficulty-progression)
8. [Curriculum Alignment](#8-curriculum-alignment)
9. [Accessibility Requirements](#9-accessibility-requirements)
10. [Open Questions](#10-open-questions)

---

## 1. Overview

**Title:** Missile Command Math
**Genre:** Retro arcade / educational hybrid
**Platform:** Web (desktop and mobile browsers), static hosting (GitHub Pages)
**Target Audience:** Grades 3–5 (ages 8–11); secondary audience includes teachers and older students needing fluency reinforcement
**Theme:** Cold War missile defense (1981–1987). Players defend six American cities by solving math problems to fire interceptor missiles. The aesthetic is pastel-retro CRT, inspired by the 1980 Atari classic *Missile Command*.

**Core Fantasy:** Empowerment through math — every correct answer triggers a satisfying explosion and saves a city. Every missed problem costs one.

**Narrative Arc:** Ten levels spanning 1981–1987, culminating in the Reykjavik Summit and the signing of the INF Treaty. Each level is introduced by a teletype-style interstitial card that provides both historical context and a tutorial for any new mechanic or math type introduced that level.

---

## 2. Game Loop

### 2.1 Macro Loop (Session Level)

```
Main Menu → Level Select → Interstitial Card → Wave → End-of-Level Results
                ↑                                          │
                └──────────────────────────────────────────┘
                          (next level or retry)
```

1. **Main Menu** — Start Game, Level Select, Settings (difficulty, sound, CRT scanlines).
2. **Level Select** — All 10 levels shown; completed levels display earned stars; uncompleted levels show a lock (except the next available level).
3. **Interstitial Card** — Full-screen narrative + mechanic tutorial card. Requires explicit "TAP TO LAUNCH →" press to dismiss. Never auto-advances.
4. **Wave** — Core gameplay (see Micro Loop below).
5. **End-of-Level Results** — Star rating reveal, cities surviving/destroyed, score summary. Options: Next Level, Retry, Level Select.
6. **Victory Sequence** (after Level 10) — INF Treaty narrative card, final score, total stars.

### 2.2 Micro Loop (In-Wave)

```
Problem Set Generated → Missiles Launched → Player Scans Queue →
Player Taps Target → Launcher Fires (or Rejects) → Explosion / Miss →
Feedback → Queue Advances → Repeat Until Wave Complete or All Cities Lost
```

**Step-by-step:**

1. **Pre-Wave Generation** — Before any missiles appear, the level's full problem set is generated. The answer queue is pre-loaded with exactly the answers needed to solve every problem in the wave, presented in shuffled order. The wave is always 100% solvable.
2. **Missiles Begin Descending** — Threats enter the screen according to the level's spawn schedule. Each standard missile displays a math problem on its body. Trajectory lines show which city each missile is targeting.
3. **Player Reads Queue** — The currently loaded round (leftmost in the queue strip) is highlighted with a pulsing glow. The player scans ahead to plan.
4. **Player Taps a Missile** — If the tapped missile's answer matches the loaded round, the launcher fires an interceptor. If it does not match, the launcher flashes red, plays a low buzz, and nothing else happens (no penalty, no queue advance).
5. **Interception** — Interceptor streaks toward the target. On contact: pastel explosion, score pop, chime. If within blast radius of other threats (paratroopers, nearby missiles), chain reaction triggers.
6. **City Save Feedback** — If the intercepted missile was targeting a specific city, that city's skyline flashes gold, a firework animates above it, and optionally a city-specific one-liner appears.
7. **Queue Advances** — The fired round is removed; next round slides into the loaded position.
8. **Repeat** — Until all threats are destroyed OR all six cities are destroyed.

### 2.3 Training Wave (Pre-Level-1)

Before Level 1 proper, a zero-stakes tutorial wave plays:
- One slow missile descends. The correct answer is already loaded.
- Blinking arrows guide the player: arrow to loaded answer → arrow to missile.
- On success: celebration, "YOU'VE GOT IT!", then Level 1 begins.
- On failure: no city damage. Gentle "Oops — try again!" prompt. New missile spawns. Loops until the player succeeds once.
- Cannot be failed. Exists purely to teach the tap-to-target interaction before live stakes begin.

---

## 3. Win / Lose Conditions

### 3.1 Level Win

- All incoming threats for the wave are destroyed (or the wave timer expires with at least one city standing — see Open Questions).
- At least one city must still be standing.
- Stars awarded (1–3) based on composite score of cities surviving, chain reactions, bomber interceptions, and accuracy percentage.

### 3.2 Level Loss

- All six cities are destroyed during the wave.
- Game Over screen displays: *"The missiles fell. But math can still save the world. Try again?"*
- Player may retry the current level or return to Level Select. No permanent penalty; no progress lost on other levels.

### 3.3 Partial Loss

- Losing 1–5 cities still completes the level, but with reduced star rating.
- Destroyed cities are shown in dark silhouette with a "rebuilding" crane animation on the results screen.
- All cities always rebuild before the next level (narrative: overnight reconstruction crews).

### 3.4 Session Victory

- Complete all 10 levels → full victory sequence.
- INF Treaty narrative card: Reagan and Gorbachev sign the treaty. *"Math won."*
- Final score summary with total stars earned across all levels.

---

## 4. Scene List

| # | Scene Name | Type | Description |
|---|-----------|------|-------------|
| 1 | **MainMenu** | UI | Title screen with Start Game, Level Select, Settings buttons. Pastel-retro CRT aesthetic. Background shows a stylized NORAD radar screen. |
| 2 | **Settings** | UI Overlay | Difficulty selector (Easy / Normal / Hard), Sound toggle, CRT scanline toggle, Queue Highlight Assist toggle. Accessible from Main Menu and in-game Pause. |
| 3 | **LevelSelect** | UI | Grid of 10 levels. Completed levels show 1–3 stars. Next available level pulses. Locked levels are greyed. |
| 4 | **Interstitial** | UI (Full-Screen) | Teletype-style card with date/headline, historical narrative, and THREAT BRIEFING or NEW MATH section. Always requires explicit "TAP TO LAUNCH →" press. One per level, shown before the wave begins. |
| 5 | **TrainingWave** | Gameplay | Zero-stakes tutorial before Level 1. Single slow missile, guided arrows, looping until success. Simplified HUD (no score, no star display). |
| 6 | **GameplayWave** | Gameplay | Core play scene for Levels 1–10. Contains: HUD bar (top), play field with cities and descending threats (middle), launcher (bottom center), answer queue strip (bottom). |
| 7 | **PauseOverlay** | UI Overlay | Triggered by Pause button. Freezes all gameplay. Options: Resume, Settings, Restart Level, Quit to Level Select. |
| 8 | **LevelResults** | UI | Post-wave results screen. Star rating animation, surviving cities lit up, destroyed cities in silhouette with crane animation, score breakdown, Next Level / Retry / Level Select buttons. |
| 9 | **GameOver** | UI | Shown when all 6 cities fall. Historical message prompt. Retry Level and Level Select buttons. |
| 10 | **VictorySequence** | UI | Shown after completing Level 10. INF Treaty narrative card, total score, total stars, celebratory animation. |

---

## 5. Entity List

### 5.1 Player-Controlled Entities

| Entity | Description |
|--------|-------------|
| **Launcher** | Single missile battery at bottom-center of screen. Fires the currently loaded answer round at the tapped target. Displays a pulsing glow ring around the loaded round. Flashes red + buzz on incorrect tap. Visually prominent; always on-screen. |
| **Answer Queue** | Horizontal strip below the launcher. Contains all answer rounds for the current wave in shuffled order. Leftmost = loaded round (highlighted). Already-fired rounds are removed/greyed. Horizontally scrollable if queue exceeds visible width. Optional color-match highlight for visible problems (Queue Highlight Assist). |
| **Interceptor Missile** | Projectile fired from the launcher toward a tapped target. Travels in a straight line from launcher to target. On arrival, triggers an explosion entity. |

### 5.2 Threat Entities

| Entity | Introduced | Description |
|--------|-----------|-------------|
| **Standard Missile** | Level 1 | Single warhead descending in a straight line toward a city. Displays a math problem on its body. Trajectory line connects it to its target city from the moment it appears. Destroyed by a matching interceptor. |
| **Strategic Bomber** | Level 6 | Pixel-art B-52 crossing the screen horizontally at high altitude. Drops 2–3 standard missiles in sequence during traversal. Displays a bonus problem on its fuselage. If destroyed before dropping payload, all payload missiles are also destroyed. Bonus problem answer is always within the next 3 queue rounds. |
| **Paratrooper Transport** | Level 7 | Mid-altitude plane crossing horizontally. Drops 2 paratrooper figures. The plane itself is not targetable. |
| **Paratrooper** | Level 7 | Slow-descending figure dropped from transport. Carries NO math problem. Cannot be directly targeted by the launcher. Destroyed only by being caught within the blast radius of a nearby explosion (chain reaction / spatial planning). Deals 1 point of city damage if it reaches a city. On destruction: pixel parachute floats off harmlessly. |
| **MIRV** | Level 8 | Descends like a standard missile until reaching 40% screen altitude, then splits into 2–3 child warheads. Parent carries a math problem. If parent is destroyed before split, all children are eliminated. Each child carries its own simpler math problem and targets a different city. |
| **MIRV Child** | Level 8 | Smaller warhead spawned by a MIRV split. Carries a simpler math problem than the parent. Fans out toward a different city after split. Treated as an independent standard missile once spawned. |

### 5.3 Environmental / Visual Entities

| Entity | Description |
|--------|-------------|
| **City** (×6) | Six iconic American cities arranged across the play field: New York, Chicago, Los Angeles, Houston, Washington D.C., Seattle. Each has a recognizable pixel skyline landmark. 3 hit points per city (configurable). Flashes gold + firework on save. Goes dark on destruction. Shows crane animation on rebuild. |
| **Trajectory Line** | Faint line from each descending missile to its target city. Always visible by default. Provides critical information about which city is at risk. |
| **Explosion** | Pastel radial burst (lavender, mint, warm gold palette). Player explosion radius: 80px. Chain reaction radius: 60px. Duration: 800ms. Can damage nearby threats within radius (chain reactions). |
| **Score Pop** | Floating number (`+10`, `+25`, etc.) rising from explosion point, chunky pixel font, fades after ~1 second. |
| **Streak Badge** | On-screen text badge: "SHARP SHOOTER!" (3-streak), "ON FIRE!" (5-streak), "MATH GENIUS!" (10-streak). Accompanied by escalating visual/audio effects. |
| **Chain Badge** | "CHAIN!", "CHAIN x2!", "CHAIN x3!" etc. Flashes on-screen when explosions trigger further destructions. |
| **Blast Radius Badge** | "BLAST RADIUS!" — appears when a paratrooper is caught in an explosion. |
| **City One-Liner** | Brief text in HUD corner on city save, e.g. *"Houston, no problem."* Toggleable. |

### 5.4 UI Entities

| Entity | Description |
|--------|-------------|
| **HUD Bar** | Top of screen. Displays: current score, live star rating indicator, Pause button, Sound toggle. |
| **Pause Button** | Persistent in HUD Bar. Freezes gameplay instantly. No penalty. |
| **Sound Toggle** | Persistent in HUD Bar. Mutes/unmutes all audio. |
| **Star Rating Indicator** | Live display during wave showing current star projection (1–3 stars). Updates as cities are saved/lost. |

---

## 6. Scoring Model

### 6.1 Base Points

| Action | Points |
|--------|--------|
| Standard missile intercepted | +10 |
| Bomber intercepted (before payload drop) | +50 |
| Bomber payload missile intercepted (after drop) | +10 each |
| MIRV intercepted before split | +40 |
| MIRV child intercepted after split | +10 each |
| Paratrooper caught in blast radius | +15 |

### 6.2 Multipliers and Bonuses

| Bonus | Points / Effect |
|-------|----------------|
| Chain Reaction (each additional link) | +15 per link after the first |
| Streak: 3 in a row ("SHARP SHOOTER!") | 1.5× multiplier on that intercept |
| Streak: 5 in a row ("ON FIRE!") | 2.0× multiplier on that intercept |
| Streak: 10 in a row ("MATH GENIUS!") | 3.0× multiplier on that intercept |
| Perfect wave (all cities intact) | +100 bonus |

**Streak Reset:** Any miss (missile reaches city) or wrong-tap resets the streak counter to 0.

### 6.3 Star Rating (Per Level)

Stars are the primary progression indicator and are calculated at the end of each wave:

| Stars | Criteria |
|-------|----------|
| ⭐ (1 star) | Level completed (at least 1 city surviving) |
| ⭐⭐ (2 stars) | 4+ cities surviving AND ≥70% accuracy |
| ⭐⭐⭐ (3 stars) | All 6 cities surviving AND ≥85% accuracy AND at least 1 chain reaction |

**Accuracy** = (correct taps) / (total taps). Wrong-order taps count against accuracy.

### 6.4 Score Storage

- High scores stored in `localStorage` only.
- No personally identifiable information (PII) is ever stored or transmitted.
- No backend / server component in v1.

---

## 7. Difficulty Progression

### 7.1 Level-by-Level Progression

| Level | Year | Math Types Active | Max Simultaneous Threats | Bomber | Paratrooper | MIRV | Base Speed | Problems in Wave |
|-------|------|------------------|-------------------------|--------|-------------|------|------------|-----------------|
| 1 | 1981 | Addition, Subtraction (single-digit) | 2 | No | No | No | 0.5× | 10 |
| 2 | 1982 | Add, Sub, ×2/×5/×10, Two-digit add (no regroup) | 3 | No | No | No | 0.6× | 12 |
| 3 | 1983 | Above + Full ×12, Two-digit add (regroup), Two-digit sub | 3 | No | No | No | 0.7× | 14 |
| 4 | 1983 | Above + Three-digit add/sub, Basic division | 4 | No | No | No | 0.8× | 16 |
| 5 | 1984 | Above + Division w/ remainders, Unit fractions | 4 | No | No | No | 0.9× | 18 |
| 6 | 1984 | Above + Equiv. fractions / comparison | 4 | Yes | No | No | 1.0× | 20 |
| 7 | 1984 | Above + Multi-step problems, Four-digit add/sub | 5 | Yes | Yes | No | 1.1× | 22 |
| 8 | 1985 | Above + Square roots (perfect squares ≤144) | 5 | Yes | Yes | Yes | 1.2× | 24 |
| 9 | 1985 | All types | 6 | Yes | Yes | Yes | 1.3× | 26 |
| 10 | 1986 | All types, mixed operations | 6 | Yes | Yes | Yes | 1.5× | 28 |

### 7.2 Difficulty Selector

A global difficulty setting chosen at game start applies a speed multiplier to all base speeds:

| Setting | Speed Multiplier | Notes |
|---------|-----------------|-------|
| Easy | 0.7× | Recommended for Grade 3 / younger players |
| Normal | 1.0× | Default. Recommended for Grade 4. |
| Hard | 1.3× | Recommended for Grade 5 / challenge seekers |

The difficulty selector affects missile descent speed only. It does **not** change which math types appear per level, preserving curriculum alignment for teachers.

### 7.3 Pacing Rules

- **New Math Type Pacing (Fractions Rule):** When a new math type is introduced, the threat count for that level is held at the minimum for that level tier. Kinetic pressure and cognitive load never increase simultaneously. New types always arrive slow and sparse first.
- **Bomber Queue Constraint:** The bomber's bonus problem answer is always within the next 3 rounds in the queue, enabling players to plan interception.
- **MIRV Child Simplicity:** Child warhead problems are always simpler than the parent problem, rewarding early interception while keeping the post-split scenario manageable.
- **City Hit Points:** Each city can absorb 3 hits before destruction (configurable), providing a buffer and preventing instant loss from a single mistake.

---

## 8. Curriculum Alignment

All math problems are validated against **Common Core State Standards for Mathematics (CCSS-M)**, Grades 2–5.

### 8.1 Standards Coverage by Level

| Level | Skill | CCSS Standard | Example Problem |
|-------|-------|---------------|-----------------|
| 1 | Single-digit addition | **2.OA.B.2** — Fluently add within 20 | `7 + 8 = ?` |
| 1 | Single-digit subtraction | **2.OA.B.2** — Fluently subtract within 20 | `15 - 6 = ?` |
| 2 | Multiplication facts (×2, ×5, ×10) | **3.OA.C.7** — Fluently multiply within 100 | `6 × 5 = ?` |
| 2 | Two-digit addition (no regrouping) | **2.NBT.B.5** — Fluently add within 100 | `34 + 25 = ?` |
| 3 | Full multiplication facts (12×12) | **3.OA.C.7** — Fluently multiply within 100 | `8 × 7 = ?` |
| 3 | Two-digit addition (with regrouping) | **3.NBT.A.2** — Fluently add within 1000 | `47 + 38 = ?` |
| 3 | Two-digit subtraction | **3.NBT.A.2** — Fluently subtract within 1000 | `82 - 47 = ?` |
| 4 | Three-digit addition | **4.NBT.B.4** — Fluently add multi-digit whole numbers | `256 + 178 = ?` |
| 4 | Three-digit subtraction | **4.NBT.B.4** — Fluently subtract multi-digit whole numbers | `504 - 238 = ?` |
| 4 | Division (basic facts) | **3.OA.C.7** — Fluently divide within 100 | `56 ÷ 7 = ?` |
| 5 | Division with remainders | **4.OA.A.3** — Solve multistep word problems; interpret remainders | `29 ÷ 4 = ?` |
| 5 | Unit fractions | **3.NF.A.1** — Understand a fraction 1/b as the quantity formed by 1 part | `½ of 16 = ?` |
| 6 | Equivalent fractions / fraction comparison | **4.NF.A.1** — Explain why a fraction a/b is equivalent to (n×a)/(n×b) | `¾ × 12 = ?` |
| 7 | Multi-step problems | **4.OA.A.3** — Solve multistep word problems with the four operations | `(6 × 4) - 9 = ?` |
| 7 | Four-digit addition/subtraction | **4.NBT.B.4** — Fluently add/subtract multi-digit whole numbers | `1,247 + 856 = ?` |
| 8 | Square roots (perfect squares ≤ 144) | **5.NBT** / enrichment (beyond standard scope) | `√81 = ?` |
| 9–10 | Mixed operation challenge | **5.OA.A.1** — Use parentheses, brackets, or braces in numerical expressions | `(√64) + (7 × 3) = ?` |

### 8.2 Design Constraints for Curriculum Integrity

- **Problem set is pre-generated** before each wave. The answer queue contains exactly the answers needed. The wave is always 100% solvable.
- **No written word problems.** All problems are single-expression format. Reading skill must never gate math skill.
- **No negative numbers or decimal operations.** Below / beside the Grade 3–5 CCSS scope.
- **Difficulty selector does not alter math content.** Speed changes only. A teacher observing a student on "Easy" sees the same curriculum progression as "Hard."

---

## 9. Accessibility Requirements

### 9.1 Input & Touch

- **Touch-first design** with minimum **60px touch targets** on all interactive elements (launcher, queue items, missiles, buttons). Increased from the standard 44px based on playtester feedback about mis-taps.
- **Single-tap interaction** only. No drag, long-press, or multi-touch required.
- **Portrait and landscape** orientations both supported with responsive layout.

### 9.2 Visual Accessibility

- **Trajectory lines** always shown by default — player always knows which city each missile threatens. Not toggleable off (essential gameplay information).
- **Queue Highlight Assist** (on by default, toggleable off in Settings): answer queue numbers that solve currently visible incoming problems receive a subtle color-match highlight. Acts as a teaching scaffold.
- **Launcher lock visual:** Loaded round displays a pulsing ring; visually distinct from all other queue items.
- **High-contrast math text:** Problems on missiles must be large, high-contrast, and legible on a phone screen held at arm's length.
- **CRT scanline effect off by default**, toggleable on in Settings. Must never reduce text legibility when active.
- **No critical information conveyed by color alone.** All color-coded feedback has a secondary shape, icon, or animation indicator.

### 9.3 Auditory Accessibility

- **Sound is fully optional.** Every audio cue (chimes, buzzes, chiptune riffs, crowd roars) has a corresponding visual equivalent (flashes, badges, animations).
- **Sound toggle** is persistent in the HUD bar, accessible with one tap at any time.

### 9.4 Cognitive Accessibility

- **No time penalty for reading.** Math problems are visible for the entire descent. Missile speed is the only pressure — and it is configurable via the difficulty selector.
- **No penalty for wrong-order taps.** Incorrect taps produce a soft warning (red flash + buzz) but do not advance the queue, damage cities, or penalize score. Teaches without punishing.
- **Interstitials never auto-dismiss.** Full-screen pause state; game never starts until the player explicitly taps "TAP TO LAUNCH →."
- **Pause at any time** via persistent Pause button. No penalty for pausing.
- **Training wave** is non-skippable on first play and loops until the player demonstrates understanding.
- **New mechanic pacing:** Every new threat type and math type gets a dedicated interstitial tutorial card before its first appearance.

### 9.5 Deferred Accessibility (Post-v1)

- VoiceOver / screen reader support on canvas
- Full keyboard-only play support

---

## 10. Open Questions

The following ambiguities or unresolved design decisions were identified in the brief. They are flagged here for resolution before or during development.

### From the Brief's Own Open Questions

| # | Question | Context |
|---|----------|---------|
| 1 | **Queue visible count:** How many rounds should be visible in the queue strip at once? Brief defaults to 6. Is this sufficient for planning without overcrowding small screens? | Config: `queueVisibleAheadCount: 6` — needs device testing |
| 2 | **Paratrooper math evolution:** Should paratroopers carry math problems at higher levels (making them directly targetable), or remain blast-radius-only throughout to preserve spatial reasoning distinction? | Brief leaves this unresolved. Current GDD assumes blast-radius-only for all levels. |
| 3 | **DEFCON DOGGO mascot:** Should a dog mascot character live in the launcher base, reacting to saves/losses? Design team consensus is "yes" but art direction is undecided. | No gameplay impact. Purely visual/charm. Would need entity and animation specs. |
| 4 | **Bomber queue highlight:** When a bomber appears, should the matching queue round be visually highlighted, or should finding it be part of the challenge? | Potential interaction with Queue Highlight Assist toggle — if Assist is ON, highlight the bomber match; if OFF, do not. |
| 5 | **City rebuild animation pacing:** Should the between-level rebuild animation play out in real time (5–10 seconds, skippable) or snap back instantly? | Affects session pacing. Recommendation: short animation (~3 seconds) that is skippable. |

### Additional Questions Identified by GDD Author

| # | Question | Context |
|---|----------|---------|
| 6 | **Division with remainders display:** How is the answer to `29 ÷ 4 = ?` displayed in the queue? As `7 R1`? As `7.25`? As just `7`? The brief references **4.OA.A.3** (interpret remainders) but does not specify the answer format. | Critical for problem generation and queue display. |
| 7 | **Wave completion when missiles are in-flight:** If all queue rounds are fired but some paratroopers are still descending, does the wave end immediately (win) or does the player wait? Paratroopers cannot be directly targeted. | Possible edge case: player has no remaining agency but must watch paratroopers descend. |
| 8 | **City arrangement:** The brief's screen layout diagram shows cities split into two rows (3 top, 3 bottom), but the original Missile Command has all cities along the bottom. Which layout is intended? The two-row layout affects trajectory line readability and missile pathing. | Need confirmation from Creative Director on spatial layout. |
| 9 | **Bomber traversal direction:** Does the bomber always cross left-to-right, or can it come from either side? Does its direction vary by level? | Affects spatial planning and queue scanning strategy. |
| 10 | **MIRV split altitude configurability:** The brief specifies 40% default. Can this vary per level for difficulty scaling, or is it fixed? | Config exists (`splitAltitudePercent: 40`) but no per-level override is specified. |
| 11 | **Queue scrolling interaction on mobile:** If the queue exceeds visible width (later levels have 20+ rounds), does the player scroll the queue manually, or does it auto-advance? Manual scrolling adds a touch interaction that could conflict with missile tapping. | UX design decision needed. |
| 12 | **Fraction display format:** For problems like `¾ × 12 = ?`, are fractions displayed as stacked numerator/denominator (traditional notation) or inline (3/4 × 12)? Stacked is more readable for Grade 3–5 but requires more vertical space on a missile body. | Visual design decision with educational implications. |
| 13 | **Level select — replay with different difficulty:** Can the player replay a completed level on a different difficulty setting? Do stars earned on Easy overwrite stars earned on Hard? | Brief does not address per-difficulty star tracking. |
| 14 | **Simultaneous threat maximum enforcement:** When the level specifies "max 4 simultaneous," does this count only missiles, or also bombers, paratroopers, and MIRVs? A MIRV that splits into 3 children could push the screen past the stated maximum. | Needs clarification for spawn scheduling logic. |

---

*End of Game Design Document — Missile Command Math v1.0*

# Missile Command Math — Game Design Document

**Version:** 1.0
**Game:** Missile Command Math
**Source Brief:** `docs/briefs/missile-command-math.md` (v2.0)
**Curriculum Map:** `docs/curriculum-maps/missile-command-math.md` (v1.0)
**Target Grades:** 3–5 (ages 8–11)
**Standards Framework:** Common Core State Standards for Mathematics (CCSS-M)

---

## Table of Contents

1. [Game Overview](#1-game-overview)
2. [Game Loop](#2-game-loop)
3. [Win / Lose Conditions](#3-win--lose-conditions)
4. [Scene List](#4-scene-list)
5. [Entity List](#5-entity-list)
6. [Scoring Model](#6-scoring-model)
7. [Difficulty Progression](#7-difficulty-progression)
8. [Curriculum Integration & Standards Alignment](#8-curriculum-integration--standards-alignment)
9. [Accessibility Requirements](#9-accessibility-requirements)
10. [Open Questions](#10-open-questions)

---

## 1. Game Overview

### 1.1 Concept

Missile Command Math is a retro arcade-style educational game inspired by Atari's 1980 *Missile Command*, reimagined as a Cold War math crisis set in 1981–1986. The player assumes the role of a defense commander at a single missile battery. Incoming missiles, bombers, MIRVs, and paratroopers threaten six iconic American cities. Each threat carries a math problem; the player's launcher is pre-loaded with an answer queue containing the exact solutions needed to neutralize every threat in the wave. The player must identify which incoming missile matches the currently loaded answer and tap it to fire.

The core fantasy is **empowerment through math**: every correct answer triggers a satisfying explosion that saves a city. Every missed problem costs a city. The player isn't just drilling facts — they're defending the homeland.

### 1.2 Target Audience

| Grade | Age | Math Focus | Pacing Notes |
|-------|-----|------------|--------------|
| 3rd | 8–9 | Addition, subtraction, intro multiplication (×2, ×5, ×10) | Slower missiles, 2 simultaneous max, extra-large touch targets |
| 4th | 9–10 | Full multiplication, long addition/subtraction, intro division | Moderate speed, 3–4 simultaneous missiles |
| 5th | 10–11 | Division, fractions, multi-digit, square roots | Faster speed, MIRV events, bombers, paratroopers |

Secondary audiences: teachers using the game as a classroom drill station; older students needing fluency reinforcement.

### 1.3 Narrative Thread

The 10 levels map to a chronological Cold War timeline (1981–1986), each introduced by a teletype-style interstitial card that provides historical context and a mechanics briefing for newly introduced threat or math types. The arc culminates in the 1986 Reykjavik Summit and the signing of the INF Treaty — math wins.

---

## 2. Game Loop

### 2.1 Macro Loop (Session Level)

```
Title Screen → Difficulty Select (Easy / Normal / Hard)
    → Level Select (unlocked levels shown with star ratings)
        → Interstitial Card (narrative + mechanic briefing)
            → Wave Play (core gameplay)
                → Level Complete (star rating, city status)
                    → Next Interstitial → Next Wave … 
                        → Level 10 Complete → Victory Sequence (INF Treaty card, final score)
```

- The player can access Level Select from the main menu at any time.
- Completed levels display their current star rating. Levels can be replayed.
- Cities always rebuild between levels (narrative: reconstruction crews overnight).

### 2.2 Micro Loop (Within a Single Wave)

```
1. WAVE GENERATION: Math engine pre-generates the full problem set and shuffled answer queue.
2. QUEUE LOADS: The answer queue is displayed below the launcher. The leftmost value is the loaded round.
3. MISSILES LAUNCH: Threats appear at the top of the screen and begin descending toward cities.
4. PLAYER SCANS: Player reads problems on incoming missiles, checks the loaded answer in the launcher.
5. PLAYER TAPS: Player taps the missile whose answer matches the currently loaded round.
   a. CORRECT MATCH → Launcher fires. Defensive missile streaks toward target. Explosion. Score pop. City celebration. Queue advances.
   b. INCORRECT MATCH → Soft warning buzz. Launcher flashes red briefly. Queue does NOT advance. No penalty beyond lost time.
6. QUEUE ADVANCES: Next round slides into the loaded position. Player repeats from step 4.
7. THREAT REACHES CITY: If a missile reaches its target city before interception, the city takes 1 hit (of 3 to destroy). Negative feedback plays.
8. WAVE ENDS: When all threats are resolved (intercepted or landed), the wave ends.
9. LEVEL COMPLETE: Star rating calculated and displayed. Cities celebrate or show damage. Proceed to next level or retry.
```

### 2.3 Core Mechanic: The Single Launcher Queue

There is **one launcher**, centered at the bottom of the screen. Beneath it sits a visible **answer queue** — a horizontal row of numbered "rounds" displayed left to right, like an ammunition belt.

```
  [ LAUNCHER ]
  ┌────────────────────────────────────┐
  │  [42▶] [15] [8] [24] [36] [11]   │  ← Answer Queue
  └────────────────────────────────────┘
         ↑ currently loaded (pulsing glow)
```

- The **leftmost number** is the currently loaded round — the one that fires next.
- The player taps an incoming missile to target it. If the missile's answer matches the loaded round, the launcher fires automatically.
- After firing, the queue advances: next number slides into the loaded position.
- Incorrect taps: soft buzz, red flash on launcher. Queue does NOT advance. No penalty.
- The player can **scan ahead** in the queue to see future rounds and plan targeting order. This builds sequencing and planning skills alongside math fluency.

### 2.4 Targeting Flow (Step by Step)

1. Incoming missile displays a problem on its body: `8 × 7`
2. Player sees `56` is loaded in the launcher (or scans ahead to find it in the queue).
3. A **faint trajectory line** shows the missile's target city.
4. Player taps the missile carrying `8 × 7`.
5. Launcher fires. Defensive missile streaks toward the target.
6. **Explosion.** Pastel burst. City is safe.
7. **City celebration feedback** triggers (gold skyline flash, firework, crowd cheer icon).
8. Queue advances. Next round loads.

### 2.5 Training Wave (Pre-Level 1)

Before Level 1 begins, a zero-stakes training wave runs:
- One slow missile descends.
- The correct answer is already loaded (no queue management yet).
- A blinking arrow points to the loaded answer, then to the missile.
- Text overlay: *"That missile's answer is [X]. It's loaded! Tap the missile to fire."*
- Correct: big celebration, "YOU'VE GOT IT!" — Level 1 begins.
- Incorrect: the missile hits (no penalty during training), gentle *"Oops — try again!"*, reset and repeat.
- The training wave cannot be failed. It loops until the player succeeds once.

---

## 3. Win / Lose Conditions

### 3.1 Winning a Level

- Destroy all incoming threats before all six cities are destroyed.
- Stars awarded based on: cities surviving (primary), chain reactions achieved, bomber interceptions, accuracy percentage.
- All surviving cities celebrate with a synchronized firework display before the next interstitial.

### 3.2 Losing a Level

- All six cities are destroyed → **Game Over** screen.
- Historical message: *"The missiles fell. But math can still save the world. Try again?"*
- Player can retry the current level or return to Level Select. No permanent penalty.

### 3.3 Partial Loss

- Losing 1–5 cities still completes the level with reduced star rating.
- Cities **always rebuild** between levels (narrative framing: reconstruction crews working overnight).

### 3.4 Star Rating Criteria

| Stars | Criteria |
|-------|----------|
| ★☆☆ | Level completed; 1–3 cities surviving |
| ★★☆ | Level completed; 4–5 cities surviving |
| ★★★ | Level completed; all 6 cities surviving |

Bonus factors (chain reactions, bomber interceptions, accuracy) may upgrade a star rating within the same city-survival tier (e.g., 5 cities + high chain reaction count can earn ★★★). Exact thresholds are configurable.

### 3.5 Session Victory

- Complete all 10 levels → full victory sequence.
- INF Treaty narrative card displayed.
- Final score summary with aggregate stats: total cities saved, total chain reactions, total accuracy, level-by-level star breakdown.

---

## 4. Scene List

### 4.1 Title Scene

- Game logo in pixel/retro style.
- Cold War aesthetic: dark background, CRT scanline effect (off by default, toggleable).
- Options: **Play**, **Level Select**, **Settings**.
- No reading required to navigate — icon-driven buttons.

### 4.2 Difficulty Select Scene

- Three large buttons: **Easy** (0.7× speed), **Normal** (1.0× speed), **Hard** (1.3× speed).
- Visual icons indicating speed (e.g., turtle / normal / rabbit or 1–3 chevrons).
- Difficulty affects missile descent speed multiplier only; does not change math content or problem count.
- Selecting difficulty proceeds to Level Select.

### 4.3 Level Select Scene

- Grid or horizontal scroll of 10 levels.
- Each level tile shows: level number, year (1981–1986), lock/unlock state, current star rating (0–3 stars).
- Completed levels clearly distinguished from locked levels.
- Tapping an unlocked level proceeds to its Interstitial.

### 4.4 Interstitial Scene

- Full-screen pause state. Game never auto-starts.
- Teletype-style date/headline at top (1–2 sentences of historical context).
- **THREAT BRIEFING** section: plain-language explanation of any new mechanic or math type for this level, with a small animated icon demonstrating it.
- Large **"TAP TO LAUNCH →"** button at bottom. Never auto-dismisses.
- See Section 7.6 for the full interstitial script per level.

### 4.5 Gameplay Scene (Wave Play)

Primary scene. Layout:

```
┌──────────────────────────────────────┐
│  SCORE: 4,750   ⭐⭐⭐  [PAUSE] [🔊] │  ← HUD Bar
│                                      │
│     [trajectory lines shown here]    │
│                                      │
│  🏙 NYC  🏙 CHI  🏙 LAX              │  ← Cities (upper arc)
│              ☁️                      │
│          ╲  ╲  ╲  (missiles)         │
│                                      │
│  🏙 HOU  🏙 DC   🏙 SEA              │  ← Cities (lower arc)
│                                      │
│           [ 🚀 LAUNCHER ]            │  ← Single launcher, center
│  ┌──────────────────────────────────┐│
│  │ [42▶] [15] [8] [24] [36] [11]  ││  ← Answer Queue strip
│  └──────────────────────────────────┘│
└──────────────────────────────────────┘
```

- **HUD bar** (top): score, live star rating, pause button, sound toggle.
- **Play field** (middle): six cities arranged in two rows (or arc), missiles descending with trajectory lines, bombers traversing horizontally, paratroopers floating down.
- **Launcher** (bottom center): large, always visible, loaded round has pulsing glow ring.
- **Queue strip** (below launcher): horizontal row, leftmost = loaded, scrollable if needed, fired rounds removed/greyed out. Queue highlight assist (toggleable) subtly color-matches numbers that solve visible missiles.

### 4.6 Pause Overlay

- Triggered by pause button. Full overlay on top of Gameplay Scene.
- Options: **Resume**, **Restart Level**, **Level Select**, **Settings**.
- No gameplay advances while paused. No penalty for pausing.

### 4.7 Level Complete Scene

- Star rating revealed with animation (stars fill in sequentially).
- Surviving cities shown with their landmark lit up and fireworks.
- Destroyed cities shown in dark silhouette with "rebuilding" crane animation.
- Stats displayed: missiles intercepted, chain reactions, accuracy %, cities saved.
- Buttons: **Next Level** (proceeds to next Interstitial), **Retry**, **Level Select**.

### 4.8 Game Over Scene

- Triggered when all 6 cities are destroyed mid-wave.
- Somber but not frightening aesthetic (pastel-dark, not harsh).
- Message: *"The missiles fell. But math can still save the world. Try again?"*
- Buttons: **Retry Level**, **Level Select**.

### 4.9 Victory Scene

- Triggered after completing Level 10.
- INF Treaty narrative card: *"December 8, 1987. Reagan and Gorbachev sign the INF Treaty... Math won."*
- Final score summary: total score, aggregate cities saved, total chain reactions, accuracy, level-by-level star breakdown.
- Buttons: **Play Again**, **Level Select**.

### 4.10 Settings Scene

- Accessible from Title, Pause, and Level Select.
- Toggles: Sound on/off, CRT scanlines on/off, Queue highlight assist on/off, City one-liners on/off.
- Difficulty selector (Easy / Normal / Hard).

---

## 5. Entity List

### 5.1 Launcher

- **Description:** Single defensive missile battery, centered at bottom of screen.
- **Behavior:** Fires automatically when the player taps a valid target (missile whose answer matches the loaded round). After firing, the queue advances. If the player taps an invalid target, the launcher flashes red and plays a buzz — no queue advancement.
- **Visual:** Retro pixel-art launcher with a pulsing glow ring on the currently loaded round. Lock animation during the brief `queueLockDurationMs` (800ms) after each shot.
- **Configuration:** `queueLockDurationMs: 800`, `queueHighlightAssist: true`, `queueVisibleAheadCount: 6`.

### 5.2 Answer Queue

- **Description:** Horizontal strip of numbered "rounds" displayed beneath the launcher, like an ammunition belt.
- **Behavior:** Leftmost round is loaded (highlighted, pulsing). After each successful shot, the queue shifts left. Fired rounds are removed. The full queue is always visible (horizontally scrollable if it exceeds visible count). Numbers matching visible incoming missiles get a subtle color highlight (when assist is on).
- **Answer Format:** Plain integers for most skill types. Numbers ≥ 1,000 display with comma separators. `division-with-remainders` answers display in `Q R_R` format (e.g., `7 R1`).
- **Pre-generation:** The entire queue is generated before the wave starts, shuffled once. The wave is always 100% solvable.

### 5.3 Standard Missile

- **Introduced:** Level 1.
- **Description:** Single warhead carrying a math problem on its body. Descends in a straight line toward a target city.
- **Visual:** Pixel-art ICBM with the math expression rendered in large, high-contrast text on the body. A faint trajectory line connects it to its target city from spawn.
- **Behavior:** Descends at the level's base speed × difficulty multiplier. If it reaches its target city, that city takes 1 hit. Destroyed by a correct launcher shot or caught in a chain reaction blast radius.
- **Configuration:** `baseSpeedMultiplier` (per-level, see Section 7), `showTrajectoryLines: true`.

### 5.4 Strategic Bomber

- **Introduced:** Level 6.
- **Description:** Pixel-art B-52 that crosses the screen horizontally at high altitude, dropping 2–3 standard missiles in sequence as it traverses.
- **Visual:** B-52 sprite with a bonus math problem displayed on its wing/fuselage.
- **Behavior:** Moves horizontally across the play field at `bomber.speed` (1.2×). Drops payload missiles at intervals. The bomber itself can be intercepted: its answer is always solvable by a round within the next 3 positions in the queue. Intercepting the bomber before it drops all payload destroys remaining payload automatically (significant bonus points). If the bomber exits the screen, any already-dropped missiles remain as independent threats.
- **Configuration:** `speed: 1.2`, `missileDropCount: 3`, `bonusProblemOnFuselage: true`.

### 5.5 MIRV (Multiple Independently Targetable Reentry Vehicle)

- **Introduced:** Level 8.
- **Description:** A missile that descends normally until reaching a configurable altitude threshold, then splits into 2–3 smaller child warheads, each carrying its own simpler math problem.
- **Visual:** Parent missile is slightly larger than standard. At the split point, an animated split effect fans out child warheads toward different cities.
- **Behavior:** If intercepted before the split altitude (40% down), all children are destroyed with a single shot (strongly rewarded). If the split occurs, each child becomes an independent threat that must be addressed individually or caught in a blast radius chain reaction. Child warhead problems are drawn from skill types introduced at least 2 levels earlier than the current level (per curriculum map rule 9.4).
- **Configuration:** `splitAltitudePercent: 40`, `childMissileCount: 3`.

### 5.6 Paratrooper

- **Introduced:** Level 7.
- **Description:** Slow-moving figures dropped by a transport plane at mid-altitude. They descend toward a city but do NOT carry math problems.
- **Visual:** Small pixel paratrooper figure with parachute, descending slowly. Transport plane crosses screen at mid-altitude before dropping.
- **Behavior:** Cannot be targeted directly by the launcher (no math problem to solve). Destroyed only by the **blast radius of a nearby explosion** — encouraging spatial thinking and chain reaction planning. If a paratrooper reaches a city, it deals 1 point of city damage. When destroyed by a blast, the parachute floats away harmlessly (non-violent resolution).
- **Configuration:** `descentSpeedMultiplier: 0.4`, `planeSpeed: 0.9`, `dropCount: 2`.

### 5.7 City (×6)

- **Description:** Six iconic American cities arranged across the play field: New York, Chicago, Los Angeles, Houston, Washington D.C., Seattle.
- **Visual:** Pixel-art skyline with a recognizable landmark per city (Statue of Liberty, Willis Tower, Hollywood sign, Space Center, Capitol dome, Space Needle). Cities have 3 states: undamaged (lit), damaged (partially dark, cracks), destroyed (dark silhouette).
- **Behavior:** Each city has 3 hit points (`cityHitsToDestroy: 3`). Each time a threat reaches it, it loses 1 HP and shows damage. At 0 HP, the city is destroyed (dark silhouette). Between levels, all cities rebuild to full HP (narrative: reconstruction crews).
- **City Save Feedback:** When a missile targeting a city is intercepted:
  - Skyline flashes warm gold for 1 second.
  - Tiny firework burst above tallest landmark.
  - Crowd cheer icon (🎉 or pixel people with arms up) briefly animates.
  - Optional city-specific one-liner: *"New York breathes easy!"* / *"Seattle's Space Needle still stands!"* / *"Chicago cheers!"* / *"Houston, no problem."* / *"D.C. is safe — for now."* / *"L.A. keeps the lights on!"*

### 5.8 Explosion

- **Description:** Visual and mechanical effect triggered when a defensive missile intercepts a threat.
- **Visual:** Pastel radial burst (lavender, mint, warm gold). Duration: 800ms.
- **Behavior:** Has a configurable blast radius (`playerExplosionRadius: 80`). Any threat within the blast radius is also destroyed, triggering a chain reaction with its own (smaller) explosion (`chainReactionRadius: 60`). Chain reactions can cascade.
- **Score pop:** Points float up from the explosion in chunky pixel font, then fade.

### 5.9 HUD Elements

- **Score display:** Top-left, chunky pixel font. Updates on every intercept.
- **Star rating (live):** Top-center, shows current projected star rating based on cities surviving so far.
- **Pause button:** Top-right, always accessible, large touch target.
- **Sound toggle:** Top-right (next to pause), toggles all audio.

### 5.10 Interstitial Card

- **Description:** Full-screen narrative/briefing overlay shown before each level.
- **Visual:** Teletype-style text on a dark background. Historical date/headline. Threat Briefing section with animated icon. Large "TAP TO LAUNCH →" button.
- **Behavior:** Blocks all gameplay. Cannot be skipped accidentally. Only dismissed by explicit tap on the launch button.

---

## 6. Scoring Model

### 6.1 Base Points

| Action | Points | Notes |
|--------|--------|-------|
| Standard missile intercept | +10 | Per missile destroyed |
| Bomber intercept (fuselage) | +50 | Bonus for destroying bomber before it drops full payload |
| Bomber payload missile intercept | +10 | Same as standard if dropped |
| MIRV parent intercept (pre-split) | +40 | Rewards early interception |
| MIRV child warhead intercept | +10 | Same as standard if split has occurred |
| Paratrooper caught in blast radius | +15 | Rewards spatial thinking |
| City save (missile heading for city destroyed) | +5 | Bonus on top of intercept points |

### 6.2 Chain Reaction Bonus

| Chain Length | Bonus per Link | Badge |
|--------------|----------------|-------|
| 2 (first chain) | +15 | "CHAIN!" |
| 3 | +20 | "CHAIN x2!" |
| 4+ | +25 per additional | "CHAIN x3!" etc. |

Accompanied by an escalating ascending chiptune riff.

### 6.3 Streak Bonus

| Streak | Badge | Visual Effect |
|--------|-------|---------------|
| 3 correct in a row | "SHARP SHOOTER!" | Badge flash |
| 5 correct in a row | "ON FIRE!" | Launcher briefly glows orange |
| 10 correct in a row | "MATH GENIUS!" | Brief full-screen pastel flash, crowd roar sound |

Streak resets on any miss (missile reaches city) or wrong-tap (tapping a missile that doesn't match the loaded round).

### 6.4 Level Complete Bonus

- **Cities surviving bonus:** +100 per surviving city.
- **Perfect wave (all 6 cities):** +500 additional bonus.
- **Accuracy bonus:** If accuracy ≥ 90%, +200 bonus. If 100%, +500.

### 6.5 Score Storage

- High scores stored in `localStorage` only. No server. No PII.
- Per-level high scores and star ratings persisted.

---

## 7. Difficulty Progression

### 7.1 Level Progression Table

| Level | Year | Math Types Active | Max Simultaneous Threats | Bomber | Paratrooper | MIRV | Base Speed | Problems in Wave |
|-------|------|-------------------|-------------------------|--------|-------------|------|------------|-----------------|
| 1 | 1981 | Add, Subtract | 2 | No | No | No | 0.5× | 10 |
| 2 | 1982 | + Two-digit add (no regroup), Multiply intro | 3 | No | No | No | 0.6× | 12 |
| 3 | 1982 | + Full multiply, Two-digit add (regroup), Two-digit subtract | 3 | No | No | No | 0.7× | 14 |
| 4 | 1983 | + Three-digit add/sub, Division basic | 4 | No | No | No | 0.8× | 16 |
| 5 | 1984 | + Division with remainders, Unit fractions | 4 | No | No | No | 0.9× | 18 |
| 6 | 1984 | + Equivalent fractions | 4 | Yes | No | No | 1.0× | 20 |
| 7 | 1984 | + Multi-step, Four-digit add/sub | 5 | Yes | Yes | No | 1.1× | 22 |
| 8 | 1985 | + Square roots | 5 | Yes | Yes | Yes | 1.2× | 24 |
| 9 | 1985 | + Mixed operation challenge | 6 | Yes | Yes | Yes | 1.3× | 26 |
| 10 | 1986 | All 18 skill types | 6 | Yes | Yes | Yes | 1.5× | 28 |

### 7.2 Difficulty Selector

Available at game start. Applied as a global multiplier to ALL base speeds.

| Setting | Speed Multiplier | Target Audience |
|---------|-----------------|-----------------|
| Easy | 0.7× | Grade 3, younger players, accessibility |
| Normal | 1.0× | Grade 4, standard experience |
| Hard | 1.3× | Grade 5, experienced players |

**Critical design rule:** Difficulty selector affects **missile descent speed only**. It does NOT change math content, problem count, operand ranges, or skill type availability per level. This preserves curriculum alignment regardless of difficulty, enabling teachers to observe consistent math content across all students.

### 7.3 Fractions Pacing Rule

When a level introduces a new `skillType`, the following constraints apply:
- Max simultaneous threat count is held at the **same value** as the previous level (never increased on the same level that introduces new math).
- The first 2–3 problems of the new type appear with the slowest missile speed for that level.
- New skill types appear **one at a time** in the early portion of the wave, not simultaneously with other new-type problems.

This directly addresses playtester feedback that new hard math and more missiles simultaneously was overwhelming.

### 7.4 Problem Distribution Rules

- **New skill types per level:** 25–40% of the wave's problems.
- **Previously mastered types:** 60–75% (reinforcement).
- **Level 10:** Distribute evenly across all 18 skill types with slight weighting toward most recently introduced types.
- **Answer uniqueness:** All answers within a single wave should be unique wherever possible. Duplicate answers must never appear for simultaneously visible missiles.

### 7.5 Pre-Generation Requirement

The entire problem set and answer queue for a wave is generated **before** the wave starts. The queue is shuffled once. No problems are generated mid-wave. The wave is always 100% solvable if the player fires in the correct sequence.

### 7.6 Interstitial Script

Each level is preceded by an interstitial card with narrative context and a mechanic briefing.

**Level 1 — Training Wave**
> *"January 1981. NORAD, Colorado Springs."*
> *"A new administration has taken office. For the first time in years, the threat boards are lighting up. You've been assigned to Missile Defense Command."*
> **🎮 HOW TO PLAY:** *"A missile will appear with a math problem on it. Look at the number loaded in your launcher (bottom of screen). If it matches the answer — tap the missile to fire!"*

**Level 2**
> *"1982. The nuclear freeze movement draws one million people to New York City."*
> **📦 YOUR QUEUE:** *"See the row of numbers under your launcher? Those are your loaded rounds, in order. Scan ahead to plan which missile to hit next!"*

**Level 3**
> *"1983. Multiplication enters the picture. Soviet planners know more warheads means more math."*
> **✖️ NEW MATH: MULTIPLICATION** *"You'll see problems like 6 × 7 on incoming missiles. The answer (42) will be somewhere in your queue."*

**Level 4**
> *"June 1983. The movie WarGames asks the world: what if a computer started a war by accident?"*
> **➗ NEW MATH: DIVISION** *"Division is multiplication in reverse. If 6 × 7 = 42, then 42 ÷ 6 = 7."*

**Level 5**
> *"1984. The Los Angeles Olympics open without Soviet athletes. The world is divided. So are the numbers."*
> **½ NEW MATH: FRACTIONS** *"You'll see problems like ½ of 12. That just means 12 ÷ 2 = 6. Start slow — these missiles come in small at first."*

**Level 6 — Bomber Briefing**
> *"1984. U.S. intelligence detects long-range bombers being repositioned."*
> **✈️ NEW THREAT: STRATEGIC BOMBER** *"A B-52 will cross the sky dropping missiles. Solve the problem on its wing before it drops its payload — take out everything at once!"*

**Level 7 — Paratrooper Briefing**
> *"1984. Airborne divisions are on alert. Some threats don't carry math."*
> **🪂 NEW THREAT: PARATROOPERS** *"Paratroopers float down slowly. You can't shoot them directly — but if your explosion is close enough, the blast will take them out."*

**Level 8 — MIRV Briefing**
> *"1985. President Reagan announces the Strategic Defense Initiative."*
> **💥 NEW THREAT: MIRV** *"Some missiles will SPLIT into smaller ones halfway down. Hit them BEFORE they split and one shot handles all of them."*

**Level 9**
> *"1985. The first Reagan-Gorbachev summit takes place in Geneva."*
> **√ NEW MATH: SQUARE ROOTS** *"√81 means: what number times itself equals 81? (9 × 9 = 81, so √81 = 9)."*

**Level 10 — Final Wave**
> *"October 1986. Reykjavik, Iceland. One last wave stands between you and the summit."*
> **⚡ EVERYTHING AT ONCE** *"All math types. All threat types. This is what you've trained for."*

**Victory Screen**
> *"December 8, 1987. Reagan and Gorbachev sign the INF Treaty — the first agreement in history to eliminate an entire class of nuclear weapons. You held the line long enough for the diplomats to do their work. Math won."*

---

## 8. Curriculum Integration & Standards Alignment

### 8.1 Standards Coverage

All math content is aligned to **Common Core State Standards for Mathematics (CCSS-M)**, grades 2–5. The 17 skill types (18 including mixed-operation-challenge) map to the following standards:

| CCSS Code | Standard Description | Skill Types | Levels |
|-----------|---------------------|-------------|--------|
| **2.OA.B.2** | Fluently add and subtract within 20 | `single-digit-addition`, `single-digit-subtraction` | 1–10 |
| **2.NBT.B.5** | Fluently add and subtract within 100 | `two-digit-addition-no-regroup` | 2–10 |
| **3.OA.C.7** | Fluently multiply and divide within 100 | `multiplication-intro`, `multiplication-full`, `division-basic` | 2–10 |
| **3.NBT.A.2** | Fluently add and subtract within 1000 | `two-digit-addition-regroup`, `two-digit-subtraction` | 3–10 |
| **3.NF.A.1** | Understand unit fractions | `unit-fractions` | 5–10 |
| **4.OA.A.3** | Solve multistep problems; interpret remainders | `division-with-remainders`, `multi-step-problems` | 5–10 |
| **4.NBT.B.4** | Fluently add and subtract multi-digit whole numbers | `three-digit-addition`, `three-digit-subtraction`, `four-digit-addition`, `four-digit-subtraction` | 4–10 |
| **4.NF.A.1** | Equivalent fractions | `equivalent-fractions` | 6–10 |
| **5.OA.A.1** | Evaluate expressions with parentheses | `mixed-operation-challenge` | 9–10 |
| **5.NBT (enrichment)** | Place value system (extension) | `square-roots` | 8–10 |

### 8.2 Skill Type Definitions

Full `skillType` identifiers (kebab-case), as defined in the curriculum map, for the math engine API:

| # | `skillType` | CCSS Code(s) | Answer Type | Level Introduced |
|---|-------------|-------------|-------------|-----------------|
| 1 | `single-digit-addition` | 2.OA.B.2 | Integer | 1 |
| 2 | `single-digit-subtraction` | 2.OA.B.2 | Integer | 1 |
| 3 | `two-digit-addition-no-regroup` | 2.NBT.B.5 | Integer | 2 |
| 4 | `multiplication-intro` | 3.OA.C.7 | Integer | 2 |
| 5 | `multiplication-full` | 3.OA.C.7 | Integer | 3 |
| 6 | `two-digit-addition-regroup` | 3.NBT.A.2 | Integer | 3 |
| 7 | `two-digit-subtraction` | 3.NBT.A.2 | Integer | 3 |
| 8 | `three-digit-addition` | 4.NBT.B.4 | Integer | 4 |
| 9 | `three-digit-subtraction` | 4.NBT.B.4 | Integer | 4 |
| 10 | `division-basic` | 3.OA.C.7 | Integer | 4 |
| 11 | `division-with-remainders` | 4.OA.A.3 | Remainder (`Q R_R`) | 5 |
| 12 | `unit-fractions` | 3.NF.A.1 | Integer | 5 |
| 13 | `equivalent-fractions` | 4.NF.A.1 | Integer | 6 |
| 14 | `multi-step-problems` | 4.OA.A.3 | Integer | 7 |
| 15 | `four-digit-addition` | 4.NBT.B.4 | Integer | 7 |
| 16 | `four-digit-subtraction` | 4.NBT.B.4 | Integer | 7 |
| 17 | `square-roots` | 5.NBT (enrichment) | Integer | 8 |
| 18 | `mixed-operation-challenge` | 5.OA.A.1 | Integer | 9 |

### 8.3 Problem Format

- All problems are **single-expression format** — no word problems, no text beyond mathematical notation.
- Reading skill must never gate math skill.
- Fractions rendered in stacked notation when space permits; inline (`3/4 × 12`) as fallback on missile bodies.
- Numbers ≥ 1,000 include comma separators in display.
- MIRV child problems drawn from skill types introduced at least 2 levels before the current level.
- Bomber fuselage problem answer must match one of the next 3 queue positions.

### 8.4 Operand Ranges

Per the curriculum map, each skill type has defined operand constraints:

| `skillType` | Operand A Range | Operand B Range | Answer Range | Key Constraints |
|-------------|----------------|----------------|--------------|-----------------|
| `single-digit-addition` | 1–12 | 1–12 | 2–20 | Sum ≤ 20 |
| `single-digit-subtraction` | 2–20 | 1–12 | 0–19 | Result ≥ 0; A > B |
| `two-digit-addition-no-regroup` | 10–59 | 10–49 | 20–99 | No carrying; sum ≤ 99 |
| `multiplication-intro` | 1–10 | {2, 5, 10} | 2–100 | B restricted to 2, 5, or 10 |
| `multiplication-full` | 2–12 | 2–12 | 4–144 | Full multiplication table |
| `two-digit-addition-regroup` | 15–89 | 15–89 | 30–178 | At least one column requires carrying |
| `two-digit-subtraction` | 20–99 | 10–89 | 1–89 | Result > 0; A > B |
| `three-digit-addition` | 100–599 | 100–499 | 200–999 | — |
| `three-digit-subtraction` | 200–999 | 100–499 | 1–899 | Result > 0; A > B |
| `division-basic` | 4–100 | 2–12 | 1–12 | Must divide evenly |
| `division-with-remainders` | 10–99 | 2–9 | Q: 2–49; R: 1–8 | Must have non-zero remainder |
| `unit-fractions` | {½, ⅓, ¼} | 4–24 | 1–12 | B divides evenly by denominator |
| `equivalent-fractions` | {⅔, ¾, ⅗, ⅘, ⅜} | 8–30 | 3–24 | Result is whole number |
| `multi-step-problems` | Varies | Varies | 1–100 | 2 operations, one pair of parentheses, positive integer answer |
| `four-digit-addition` | 1,000–5,000 | 500–4,999 | 1,500–9,999 | — |
| `four-digit-subtraction` | 1,500–9,999 | 500–4,999 | 1–9,499 | Result > 0; A > B |
| `square-roots` | {1,4,9,16,25,36,49,64,81,100,121,144} | n/a | 1–12 | Perfect squares only |
| `mixed-operation-challenge` | Varies | Varies | 1–100 | 2–3 operations, may include √, parentheses required, positive integer answer |

---

## 9. Accessibility Requirements

### 9.1 Touch & Interaction

- **60px minimum touch targets** on launcher, queue strip elements, and all interactive UI buttons (increased from 44px based on playtester feedback).
- **One-tap interaction:** Tap a missile to fire. No multi-step gestures required.
- **No time penalty for reading:** Math problems are visible for the missile's entire descent.
- **Pause at any time:** Persistent pause button, no penalty, no gameplay advancement while paused.

### 9.2 Visual

- **Trajectory lines** always shown by default — player always knows which city each missile threatens.
- **Queue highlight assist** (on by default, toggleable off): queue numbers matching visible incoming problems are subtly color-highlighted.
- **Launcher lock visual:** Loaded round displays a pulsing ring; cannot be confused with other queue items.
- **High-contrast math text:** Problems displayed in large, high-contrast text on missile bodies, legible on a phone screen held at arm's length.
- **CRT scanline effect off by default**, toggleable in settings.
- **No reliance on color alone:** All critical information (loaded round, trajectory targets) uses shape, position, and animation in addition to color.

### 9.3 Audio

- **Sound is optional:** Every audio feedback element has a visual equivalent. The game is fully playable with sound off.
- **Sound toggle** accessible from HUD bar during gameplay.

### 9.4 Cognitive

- **Icon-driven navigation:** Game does not require reading fluency to understand mechanics. All instructions use icons where possible.
- **Training wave** before Level 1 ensures the player understands the core mechanic before facing live stakes.
- **Interstitial mechanic briefings** with animated icons demonstrate each new threat type before it appears.
- **No permanent punishment:** Cities rebuild between levels. Levels can be retried. No progress is lost.

### 9.5 Platform

- **Portrait and landscape** orientations both supported.
- **Touch-first** design (mobile primary).
- **Web-first:** GitHub Pages static hosting. No native app required.
- **No login required:** No accounts, no PII collection.

### 9.6 Deferred Accessibility (Out of Scope for v1)

- VoiceOver / screen reader on canvas.
- Keyboard-only play.
- iOS/Android native apps.

---

## 10. Open Questions

The following ambiguities were identified in the brief and curriculum map. These require resolution before or during implementation.

### From the Brief

1. **Queue length visibility:** How many rounds should be visible in the queue strip at once? The brief defaults to 6. Is this sufficient for planning on smaller screens, or too crowded? Needs playtesting validation.

2. **Paratrooper evolution:** Should paratroopers ever carry math problems (making them directly targetable) at higher levels, or should they always remain blast-radius-only to maintain their spatial reasoning distinction?

3. **DEFCON DOGGO mascot:** A playtester-requested dog mascot living in the launcher base, reacting to saves and losses. The design team unanimously supports this but it needs art direction. Should the GDD account for mascot entity behavior, or is this purely cosmetic?

4. **Bomber queue highlighting:** The bomber's answer must be within the next 3 queue rounds. Should the matching queue round be visually highlighted when the bomber appears, or should finding it be part of the challenge?

5. **City rebuild animation pacing:** Between levels, destroyed cities show a "rebuilding" crane animation. Should this play out in real time (5–10 seconds, skippable) or snap back instantly with a brief flash?

### From the Curriculum Map

6. **Remainder display in queue:** The `division-with-remainders` skill type produces answers in `Q R_R` format (e.g., `7 R1`). This is the only non-integer answer type. Should the queue display the full remainder format, or only the quotient with a visual indicator? The `Q R_R` format may be visually crowded on small screens and harder to scan quickly under time pressure.

### From GDD Analysis

7. **Star rating exact thresholds:** The brief states bonus factors (chain reactions, bomber interceptions, accuracy) can upgrade a star rating within a city-survival tier. What are the exact point thresholds or criteria for this upgrade? Currently left as "configurable."

8. **Level Select lock behavior:** The brief implies levels unlock sequentially. Can a player skip ahead if they 3-star a level, or is progression strictly linear (Level N requires completing Level N-1)?

9. **Chain reaction cap:** Is there a maximum chain reaction depth? Theoretically, a well-placed explosion near many clustered threats could cascade indefinitely. Should chains be capped at a certain depth for performance/balance reasons?

10. **Wrong-tap streak penalty:** The brief states streaks reset on "any miss or wrong-tap." Should a wrong-tap (tapping a missile that doesn't match the loaded round) truly reset the streak, or only a miss (missile reaching a city)? Wrong-taps have no other penalty — adding streak reset may be too punishing for younger players who are still learning queue management.

---

*End of Game Design Document — Missile Command Math v1.0*

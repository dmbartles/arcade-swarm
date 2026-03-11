# 🚀 MISSILE COMMAND MATH
## Game Design Document — v2.0

> *"The only winning move is to solve the problem."*
> — Inspired by *WarGames* (1983)

**Changelog from v1.0:**
- Simplified from three launcher batteries to a **single launcher with an answer queue**
- Added **paratroopers** as a new threat type alongside bombers and MIRVs
- Interstitials now teach game mechanics (not just history) — each new threat type gets a dedicated tutorial card before its first appearance
- Integrated all Jordan (4th grade playtester) feedback: trajectory lines, practice wave, city celebration feedback, launcher lock, larger touch targets, level select, and fractions pacing fix
- Positive city-save feedback system added throughout

---

## CONCEPT — What is the game? What's the fantasy/theme?

**Missile Command Math** is a retro arcade-style educational game built on the bones of Atari's 1980 *Missile Command* — reimagined as a Cold War math crisis. The year is 1983. Tensions between the superpowers have reached a breaking point. Intercontinental ballistic missiles — each one carrying a math problem instead of a warhead — are screaming toward six iconic American cities. You are the defense commander at a single missile battery. Your launcher is pre-loaded with a queue of answer rounds. Fire them in the right order and the sky stays clear. Fire them wrong and a city pays the price.

The core fantasy is **empowerment through math**: every correct answer triggers a satisfying explosion. Every missed problem costs a city. The player isn't just drilling facts — they're *defending the homeland*. The stakes feel real because the aesthetic makes them feel real, wrapped in enough pastel nostalgia to stay playful rather than frightening.

The narrative thread connecting all levels is drawn directly from the historical Cold War context of the early 1980s:

- **Level 1 (1981):** President Reagan takes office. NORAD detects the first anomalous launches. Basic addition and subtraction — the computers are warm.
- **Level 2–3 (1982):** The nuclear freeze movement peaks. More warheads inbound. Subtraction and early multiplication enter the picture.
- **Level 4–5 (1983):** *WarGames* hits theaters. The WOPR computer nearly starts World War III. Multi-digit problems and division appear.
- **Level 6–7 (1984):** The Soviets boycott the Olympics. Strategic bombers enter the theater. Paratroopers appear for the first time. Fractions and multi-step problems.
- **Level 8–9 (1985):** Reagan proposes the Strategic Defense Initiative ("Star Wars"). MIRVs begin splitting mid-flight. Square roots introduced.
- **Level 10 (1986):** The Reykjavik Summit. Both sides come to the table — but not before one final, massive wave. All math types combined. Survive this and the MAD standoff ends.

---

## TARGET AUDIENCE

**Primary:** Students in grades 3–5 (ages 8–11)

| Grade | Age | Math Focus | Pacing Notes |
|-------|-----|------------|--------------|
| 3rd | 8–9 | Addition, subtraction, intro multiplication (×2, ×5, ×10) | Slower missiles, 2 simultaneous max, extra-large touch targets |
| 4th | 9–10 | Full multiplication, long addition/subtraction, intro division | Moderate speed, 3–4 simultaneous missiles |
| 5th | 10–11 | Division, fractions, multi-digit, square roots | Faster speed, MIRV events, bombers, paratroopers |

**Secondary audiences:** Teachers using the game as a classroom drill station; older students needing fluency reinforcement.

**Key design implication:** The game must not require reading fluency to understand mechanics. All instructions are icon-driven where possible. Math problems must be large, high-contrast, and legible on a phone screen held at arm's length.

---

## MATH SKILLS TO COVER

Problems are drawn from a skill pool that unlocks progressively by level, validated against **Common Core State Standards for Mathematics (CCSS-M)** grades 3–5.

| Skill | CCSS Alignment | Introduced | Example |
|-------|---------------|------------|---------|
| Single-digit addition | 2.OA.B.2 | Level 1 | `7 + 8 = ?` |
| Single-digit subtraction | 2.OA.B.2 | Level 1 | `15 - 6 = ?` |
| Multiplication facts (×2, ×5, ×10) | 3.OA.C.7 | Level 2 | `6 × 5 = ?` |
| Multiplication facts (full 12×12) | 3.OA.C.7 | Level 3 | `8 × 7 = ?` |
| Two-digit addition (no regroup) | 2.NBT.B.5 | Level 2 | `34 + 25 = ?` |
| Two-digit addition (with regroup) | 3.NBT.A.2 | Level 3 | `47 + 38 = ?` |
| Two-digit subtraction | 3.NBT.A.2 | Level 3 | `82 - 47 = ?` |
| Three-digit addition | 4.NBT.B.4 | Level 4 | `256 + 178 = ?` |
| Three-digit subtraction | 4.NBT.B.4 | Level 4 | `504 - 238 = ?` |
| Division (basic facts) | 3.OA.C.7 | Level 4 | `56 ÷ 7 = ?` |
| Division with remainders | 4.OA.A.3 | Level 5 | `29 ÷ 4 = ?` |
| Unit fractions | 3.NF.A.1 | Level 5 | `½ of 16 = ?` |
| Equivalent fractions / comparison | 4.NF.A.1 | Level 6 | `¾ × 12 = ?` |
| Multi-step problems | 4.OA.A.3 | Level 7 | `(6 × 4) - 9 = ?` |
| Four-digit addition/subtraction | 4.NBT.B.4 | Level 7 | `1,247 + 856 = ?` |
| Square roots (perfect squares ≤144) | 5.NBT / enrichment | Level 8 | `√81 = ?` |
| Mixed operation challenge | 5.OA.A.1 | Level 9–10 | `(√64) + (7 × 3) = ?` |

**Critical constraint:** The level's problem set is generated **before the wave starts**. The answer queue in the launcher is pre-loaded with exactly the answers needed to solve every problem in that wave, in a shuffled order. The game is always 100% solvable if the player fires in the correct sequence. No problem is ever unanswerable.

**Fractions pacing rule (from playtester feedback):** When a new math type is introduced, the missile count for that level is held at the *minimum* for that level tier — never simultaneously increasing kinetic pressure and cognitive load. New types always arrive slow and sparse first.

---

## GAMEPLAY VISION — The Single Launcher Queue

### The Core Mechanic

This is the fundamental change from v1. There is now **one launcher**, centered at the bottom of the screen. Beneath it sits a visible **answer queue** — a horizontal row of numbered "rounds" lined up like missiles in a magazine, displayed left to right. Think of it like a physical ammunition belt.

```
  [ LAUNCHER ]
  ┌────────────────────────────────────┐
  │  [42] [15] [8] [24] [36] [11] ... │  ← Answer Queue
  └────────────────────────────────────┘
         ↑ next to fire
```

- The **leftmost number** in the queue is the round currently loaded in the launcher — the one that will fire next.
- The player's job is to figure out which incoming missile that number solves, **tap that missile** to target it, and the launcher fires automatically.
- After firing, the queue advances: the next number slides into the launcher.
- If the player taps a missile whose answer does NOT match the loaded round, nothing happens — a soft warning sound and a brief red flash on the launcher. No penalty beyond wasted time.
- The player can **scan ahead** in the queue to see future rounds and plan their targeting order. This is intentional and rewarded — it builds sequencing and planning skills alongside math fluency.

### Why This Is Better

- **No ambiguity:** The player always knows exactly what answer is loaded. There's no "which launcher?" confusion.
- **Strategic depth:** Players who scan ahead can prioritize which missiles to hit first, setting up chain reactions and protecting the most vulnerable cities.
- **Simpler touch interaction:** One tap to target. No launcher-selection step. Removes the "I tapped the launcher then the number changed" frustration from v1 playtesting entirely.
- **Visual clarity on mobile:** One large launcher + a queue strip is far easier to read on a small screen than three separate launcher buttons.

### Targeting Flow (Step by Step)

1. Incoming missile displays a problem: `8 × 7`
2. Player sees `56` is loaded in the launcher (or scans ahead to find it in the queue).
3. A **faint trajectory line** shows where the missile is headed — which city is at risk.
4. Player taps the missile with `8 × 7` on its body.
5. Launcher fires. Defensive missile streaks toward the target.
6. **Explosion.** Pastel burst. City is safe.
7. **City celebration feedback** triggers (see Positive Feedback section below).
8. Queue advances. Next round loads.

### Wrong-Order Firing
If a player taps a missile whose answer is NOT the currently loaded round, the launcher flashes red and plays a low buzz. The queue does NOT advance. No penalty — just a redirect to look at what's loaded. This teaches without punishing.

### Queue Visibility
- The full queue is always visible, showing all remaining rounds for the wave.
- Already-fired rounds are greyed out / removed from the left.
- The currently loaded round is highlighted with a pulsing glow.
- Numbers in the queue that solve *visible incoming missiles* get a subtle color-match highlight — a teaching assist that can be toggled off for harder difficulty.

---

## THREAT TYPES

### 1. Standard Missiles
Single warhead, single math problem on the body. Descends in a straight line toward a city. Has a visible trajectory line connecting it to its target city from the moment it appears.

### 2. Strategic Bombers (introduced Level 6)
A pixel-art B-52 crosses the screen horizontally at high altitude. It drops 2–3 missiles in sequence as it traverses. The **bomber itself** displays a bonus problem — intercepting it before it drops its payload destroys all its payload missiles automatically and earns significant bonus points. The bomber's problem is always solvable by a round visible in the near-future queue (within the next 3 rounds), so players can plan ahead.

### 3. MIRVs — Multiple Independently Targetable Reentry Vehicles (introduced Level 8)
A missile descends normally until it reaches a configurable altitude threshold (default: 40% down the screen), then **splits into 2–3 smaller child warheads**, each carrying its own (simpler) math problem. Child warheads fan out toward different cities. Intercepting the parent missile before it splits destroys all children with a single shot — strongly rewarding players who act quickly. If the split happens, each child must be addressed independently or caught in a chain reaction.

### 4. Paratroopers (introduced Level 7)
A new threat type not in v1. A slow-moving transport plane crosses at mid-altitude and drops **paratrooper figures** that descend slowly toward a city. Paratroopers don't carry math problems — they represent a *time pressure* threat. They take longer to reach the city than missiles but there's no math to solve to stop them with the launcher. Instead, a paratrooper can be destroyed by the **blast radius of any nearby explosion** — encouraging players to intentionally aim nearby missile intercepts to catch them in the chain reaction. If a paratrooper reaches a city, it deals 1 point of city damage. This rewards spatial thinking and chain reaction planning beyond pure math recall.

---

## INTERSTITIALS — Teaching Through Story

Every interstitial card serves **two purposes** in v2: it advances the historical narrative AND it teaches or previews a new game mechanic. Cards appear before each level and cannot accidentally overlap with gameplay — a full-screen pause state with an explicit **"TAP TO LAUNCH →"** button is always required to dismiss them. The game never starts until the player actively chooses to proceed.

### Interstitial Structure

Each card has:
- **Date/headline** (teletype style): historical context, 1–2 sentences
- **THREAT BRIEFING** (new in v2): a plain-language explanation of any new mechanic introduced this level, with a small animated icon demonstrating it
- **"TAP TO LAUNCH →"** button (large, obvious, never auto-dismisses)

### Full Interstitial Script

**Level 1 — Before Play (Training Wave)**
> *Headline: "January 1981. NORAD, Colorado Springs."*
> *"A new administration has taken office. For the first time in years, the threat boards are lighting up. You've been assigned to Missile Defense Command. Your launcher is loaded and ready."*
>
> **🎮 HOW TO PLAY:** *"A missile will appear with a math problem on it. Look at the number loaded in your launcher (bottom of screen). If it matches the answer — tap the missile to fire! Try it now with this practice round."*

**Level 2**
> *"1982. The nuclear freeze movement draws one million people to New York City. Meanwhile, the launches keep coming — and they're getting faster."*
>
> **📦 YOUR QUEUE:** *"See the row of numbers under your launcher? Those are your loaded rounds, in order. Scan ahead to plan which missile to hit next!"*

**Level 3**
> *"1983. Multiplication enters the picture. Soviet planners know more warheads means more math. Can you keep up?"*
>
> **✖️ NEW MATH: MULTIPLICATION** *"You'll see problems like 6 × 7 on incoming missiles. The answer (42) will be somewhere in your queue. Find it, get ready, and tap that missile when it's loaded!"*

**Level 4**
> *"June 1983. The movie WarGames asks the world: what if a computer started a war by accident? The WOPR machine nearly found out."*
>
> **➗ NEW MATH: DIVISION** *"Division is multiplication in reverse. If 6 × 7 = 42, then 42 ÷ 6 = 7. Same family of facts — you already know these!"*

**Level 5**
> *"1984. The Los Angeles Olympics open without Soviet athletes. The world is divided. So are the numbers."*
>
> **½ NEW MATH: FRACTIONS** *"You'll see problems like ½ of 12. That just means 12 ÷ 2 = 6. Start slow — these missiles come in small at first."*

**Level 6 — Bomber Briefing**
> *"1984. U.S. intelligence detects long-range bombers being repositioned. A single bomber can carry multiple payloads."*
>
> **✈️ NEW THREAT: STRATEGIC BOMBER** *"A B-52 will cross the sky dropping missiles as it goes. It has a math problem on its wing — if you solve it before it drops its payload, you take out everything at once. Big bonus points!"*

**Level 7 — Paratrooper Briefing**
> *"1984. Airborne divisions are on alert. Some threats don't carry math — they just keep moving toward your cities, slow and steady."*
>
> **🪂 NEW THREAT: PARATROOPERS** *"Paratroopers float down slowly. You can't shoot them directly — but if your explosion is close enough, the blast will take them out. Use your chain reactions wisely!"*

**Level 8 — MIRV Briefing**
> *"1985. President Reagan announces the Strategic Defense Initiative. The Soviets respond with technology of their own: missiles that split mid-flight into multiple warheads."*
>
> **💥 NEW THREAT: MIRV** *"Some missiles will SPLIT into smaller ones halfway down. Hit them BEFORE they split and one shot handles all of them. Wait too long and you'll have 3 problems at once!"*

**Level 9**
> *"1985. The first Reagan-Gorbachev summit takes place in Geneva. They talk for hours. Meanwhile, both sides' missiles are still in the air."*
>
> **√ NEW MATH: SQUARE ROOTS** *"√81 means: what number times itself equals 81? (9 × 9 = 81, so √81 = 9). Perfect squares only — you've got this."*

**Level 10 — Final Wave**
> *"October 1986. Reykjavik, Iceland. Reagan and Gorbachev sit across a table and come closer to ending nuclear weapons than anyone ever has. One last wave stands between you and the summit."*
>
> **⚡ EVERYTHING AT ONCE** *"All math types. All threat types. This is what you've trained for. The queue is long. Plan ahead. Save every city you can."*

**Victory Screen**
> *"December 8, 1987. The White House, Washington D.C."*
> *"Reagan and Gorbachev sign the Intermediate-Range Nuclear Forces Treaty — the first agreement in history to eliminate an entire class of nuclear weapons. You held the line long enough for the diplomats to do their work."*
> *"Math won."*

---

## POSITIVE FEEDBACK — Saving a City

v1 only gave the player negative feedback (explosion, city damage). v2 adds a full positive feedback loop for every successful intercept, with escalating celebration for streaks and city-saves.

### Per-Intercept Feedback
- **Explosion:** Pastel radial burst (lavender, mint, warm gold) — always present
- **Score pop:** `+10`, `+25`, etc. floats up from the explosion in chunky pixel font, then fades
- **Chime:** ascending two-note chiptune tone (toggleable)

### City Save Feedback (missile destroyed before reaching its target city)
When the player destroys a missile that had a trajectory line aimed at a specific city:
- The targeted city's **skyline flashes warm gold** for 1 second
- A tiny **firework burst** appears above the city's tallest landmark pixel
- A small **crowd cheer icon** (🎉 or pixel people with arms up) briefly animates above the city
- Optional: a city-specific one-liner appears briefly in the HUD corner:
  - *"New York breathes easy!"*
  - *"Seattle's Space Needle still stands!"*
  - *"Chicago cheers!"*
  - *"Houston, no problem."*
  - *"D.C. is safe — for now."*
  - *"L.A. keeps the lights on!"*

### Chain Reaction Bonus
- When one explosion triggers a second, a **"CHAIN!"** badge flashes on screen
- Each additional link adds: `"CHAIN x2!"`, `"CHAIN x3!"` etc.
- Accompanied by an escalating ascending chiptune riff

### Streak Feedback
- 3 correct intercepts in a row: **"SHARP SHOOTER!"**
- 5 in a row: **"ON FIRE!"** (launcher briefly glows orange)
- 10 in a row: **"MATH GENIUS!"** (brief full-screen pastel flash, crowd roar sound)
- Streak resets on any miss or wrong-tap

### Paratrooper Chain Bonus
When a paratrooper is caught in a blast radius (player used spatial thinking):
- **"BLAST RADIUS!"** badge
- Extra `+15` points
- Small pixel parachute floats off screen harmlessly (non-violent resolution)

### Level Complete Feedback
- Star rating (1–3 stars) revealed with animation
- Cities still standing shown with their landmark lit up
- Any destroyed cities shown in dark silhouette with a small "rebuilding" animation (crane pixel art) — cities always rebuild before the next level

---

## TRAINING WAVE (Level 1 Pre-Game)

Before Level 1 begins properly, a **zero-stakes training wave** runs automatically:
- One slow missile descends
- The correct answer is already loaded in the launcher (no queue management needed yet)
- A blinking arrow points to the loaded answer, then points to the missile
- Text overlay: *"That missile's answer is [X]. It's loaded! Tap the missile to fire."*
- If the player gets it right: big celebration, "YOU'VE GOT IT!" and Level 1 begins
- If the player misses: the missile hits the city (no city damage penalty during training), gentle *"Oops — try again!"*, reset and repeat with a new missile
- Training wave cannot be failed. It loops until the player succeeds once.

This directly addresses the playtester feedback: *"I lost two cities before I figured out you had to tap the launcher FIRST and then the missile."* In v2, the player never faces live stakes before understanding the basic interaction.

---

## SCREEN LAYOUT

```
┌──────────────────────────────────────┐
│  SCORE: 4,750   ⭐⭐⭐  [PAUSE] [🔊] │  ← HUD Bar
│                                      │
│     [trajectory lines shown here]   │
│                                      │
│  🏙 NYC  🏙 CHI  🏙 LAX             │  ← Cities (top half)
│              ☁️                     │
│          ╲  ╲  ╲  (missiles)        │
│                                      │
│  🏙 HOU  🏙 DC   🏙 SEA             │  ← Cities (bottom half)
│                                      │
│           [ 🚀 LAUNCHER ]            │  ← Single launcher, center
│  ┌──────────────────────────────┐    │
│  │ [42▶] [15] [8] [24] [36]... │    │  ← Answer Queue strip
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

- **HUD bar** (top): score, star rating (live), pause, sound toggle
- **Play field** (middle): cities on left/right/top arc, missiles descending, trajectory lines
- **Launcher** (bottom center): large, always visible, pulsing glow on loaded round
- **Queue strip** (below launcher): horizontal scroll if needed, leftmost = next to fire, highlighted round = loaded

---

## WIN / LOSE CONDITIONS

### Winning a Level
- Destroy all incoming threats before all six cities are destroyed.
- Stars awarded based on: cities surviving (primary), chain reactions achieved, bomber interceptions, accuracy percentage.
- All surviving cities celebrate with a synchronized firework display before the interstitial.

### Losing a Level
- All six cities are destroyed → Game Over screen.
- Historical message: *"The missiles fell. But math can still save the world. Try again?"*
- Player can retry current level or return to level select. No permanent penalty.

### Partial Loss
- Losing 1–5 cities completes the level with reduced stars.
- Cities **always rebuild** between levels (narrative framing: reconstruction crews working overnight).

### Session Victory
- Complete all 10 levels → full victory sequence with INF Treaty narrative card and final score summary.

---

## DIFFICULTY RANGE

| Level | Math Types Active | Max Simultaneous | Bomber | Paratrooper | MIRV | Base Speed |
|-------|------------------|-----------------|--------|-------------|------|------------|
| 1 | Add, Subtract | 2 | No | No | No | 0.5× |
| 2 | Add, Subtract | 3 | No | No | No | 0.6× |
| 3 | Add, Sub, ×2/×5/×10 | 3 | No | No | No | 0.7× |
| 4 | Add, Sub, Multiply | 4 | No | No | No | 0.8× |
| 5 | All above + Division | 4 | No | No | No | 0.9× |
| 6 | All above + Fractions | 4 | Yes | No | No | 1.0× |
| 7 | All above + Multi-digit | 5 | Yes | Yes | No | 1.1× |
| 8 | All above + √ | 5 | Yes | Yes | Yes | 1.2× |
| 9 | All types | 6 | Yes | Yes | Yes | 1.3× |
| 10 | All types, mixed ops | 6 | Yes | Yes | Yes | 1.5× |

**Note:** Fractions moved to Level 6 (from Level 5 in v1) and missile count is held at 4 (not increased) when fractions are introduced — directly addressing Jordan's feedback that new hard math and more missiles simultaneously was too much.

**Difficulty selector at game start:** Easy (0.7×), Normal (1.0×), Hard (1.3×) applied as a multiplier to base speed. Does not change math types per level, keeping curriculum alignment predictable for teachers.

---

## ACCESSIBILITY PRIORITIES

- **Touch-first, 60px minimum touch targets** on launcher and queue strip (increased from 44px based on playtester feedback about mis-taps)
- **Trajectory lines** always shown by default — player always knows which city each missile threatens
- **Queue highlight assist** (on by default, toggleable off): queue numbers that match visible incoming problems are subtly color-highlighted
- **Launcher lock visual:** loaded round displays a pulsing ring; cannot be confused with other queue items
- **No time penalty for reading:** missiles descend at game speed but math is visible the entire descent
- **Sound is optional:** all feedback has a visual equivalent
- **Pause at any time:** persistent pause button, no penalty
- **CRT scanline off by default**, toggled in settings
- **Portrait and landscape** both supported
- **Level select** always accessible from main menu — completed levels clearly unlocked, current stars shown

---

## CONFIGURATION FILE

```json
{
  "missile": {
    "baseSpeedMultiplier": 1.0,
    "speedIncreasePerLevel": 0.1,
    "maxSimultaneous": 6,
    "showTrajectoryLines": true
  },
  "explosion": {
    "playerExplosionRadius": 80,
    "chainReactionRadius": 60,
    "explosionDurationMs": 800
  },
  "launcher": {
    "queueLockDurationMs": 800,
    "queueHighlightAssist": true,
    "queueVisibleAheadCount": 6
  },
  "level": {
    "problemsPerLevel": [10, 12, 14, 16, 18, 20, 22, 24, 26, 28],
    "cityHitsToDestroy": 3,
    "rebuildCitiesBetweenLevels": true
  },
  "bomber": {
    "speed": 1.2,
    "missileDropCount": 3,
    "bonusProblemOnFuselage": true
  },
  "paratrooper": {
    "descentSpeedMultiplier": 0.4,
    "planeSpeed": 0.9,
    "dropCount": 2
  },
  "mirv": {
    "splitAltitudePercent": 40,
    "childMissileCount": 3
  },
  "feedback": {
    "cityCelebrationEnabled": true,
    "cityOneLinerEnabled": true,
    "streakBadgesEnabled": true,
    "chainBadgeEnabled": true
  },
  "ui": {
    "showScanlinesDefault": false,
    "soundEnabledDefault": true,
    "showHistoricalCards": true,
    "showMechanicBriefings": true
  }
}
```

---

## OUT OF SCOPE — v1 Build

| Feature | Rationale |
|---------|-----------|
| User accounts / login | COPPA compliance, backend infrastructure — post-v1 |
| Student progress tracking / teacher dashboard | Backend dependency — post-v1 |
| Online leaderboards | Backend dependency; high scores localStorage only, never PII |
| Multiplayer / cooperative mode | Future scope |
| Animated cutscenes | Text-only teletype interstitials sufficient |
| In-app purchases or ads | Out of scope for educational use |
| VoiceOver / screen reader on canvas | Deferred to v2 |
| Keyboard-only play | Deferred to v2 |
| iOS/Android native apps | Web-first; native packaging is future step |
| Backend / server | GitHub Pages static hosting only |
| Negative numbers | Below grade 3–5 CCSS scope |
| Decimal operations | Fractions are sufficient for 5th grade scope |
| Written word problems | Single-expression only; reading skill must not block math skill |
| Dog mascot | Noted. Genuinely considering it for v2. |

---

## RESOLVED QUESTIONS (from v1 Open Questions)

| Question | Resolution |
|----------|-----------|
| Three launchers vs. one | **One launcher with answer queue.** Eliminates selection confusion entirely. |
| Launcher answer display | **Queue strip with numbers only.** Clean, scannable, no visual noise. |
| Chain reaction radius balance | **Default 60px (configurable).** Small enough to require intent, large enough to feel satisfying. |
| MIRV child problem difficulty | **Simpler than parent.** Rewards early interception; if split occurs, children are more manageable. |
| City identity on destruction | **City-specific one-liners on save AND on loss.** Positive AND stakes-setting. |
| Difficulty vs. grade-level selector | **Single "Easy / Normal / Hard" selector.** Grade-level is implied by the level curve, not a separate UI choice. |

## OPEN QUESTIONS FOR NEXT DESIGN SESSION

1. **Queue length:** How many rounds should be visible in the queue strip at once? Too few and the player can't plan ahead; too many and the strip is too crowded on a small screen. Default is 6 — is that right?
2. **Paratrooper non-math design:** Should paratroopers ever carry math problems (making them shootable directly) at higher levels, or should they always be blast-radius-only to maintain their spatial reasoning distinction?
3. **Dog mascot:** A 4th grade playtester requested a dog. Should DEFCON DOGGO be the game's mascot, living in the launcher base and reacting to saves and losses? Unanimous yes from the design team. Needs art direction decision.
4. **Bomber queue planning:** The bomber's answer must be within the next 3 queue rounds. Should the matching queue round be visually highlighted when the bomber appears, or should finding it be part of the challenge?
5. **City rebuild animation:** Between levels, cities that were destroyed show a "rebuilding" crane animation. Should this play out in real time (5–10 seconds, skippable) or just snap back instantly with a brief flash?

---

*Document version 2.0*
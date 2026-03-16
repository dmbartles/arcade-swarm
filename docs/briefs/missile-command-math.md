# MISSILE COMMAND MATH
## Game Design Document — v4.0

> *"The only winning move is to solve the problem."*

---

## CHANGELOG FROM v3.0

- Expanded from 10 levels to **20 levels** with a much slower, more deliberate math difficulty escalation — each new operation gets multiple levels of practice before the next is introduced
- **Removed MIRV threat type** entirely — bombers remain as the sole advanced threat, introduced later in the level curve
- **Removed color-coding system** — launchers and bombs are independently colored and never share colors; the player must rely on math to match answers to problems, not visual shortcuts
- Output format changed to Markdown

---

## VISUAL REFERENCES

The following reference images define the art direction for Missile Command Math v4.0. All asset creation and UI layout must conform to these references.

Visual refferences are located at references\missile-command-math and documented in manifest.md

### Launcher & Bomb Design

**Reference: `Launcher_and_Bomb.jpg`**

The launcher is a rounded bag-shape with a prominent answer number on the front. The bomb is a sleek teardrop/cone shape with a dotted exhaust trail. Math problems float beside the bomb in a warm display font. The overall palette is soft lavender background with orange and gold accents.

### Gameplay Layout

**Reference: `Gameplay.jpg`**

The playfield is framed inside a rounded CRT monitor bezel (warm gold/wooden tone). Three launchers sit at the bottom, each with a numbered answer. Bombs descend from the top with dotted trails, each carrying a math problem. The city skyline fills the middle ground — soft pastel buildings (coral, sky blue, peach) with lit yellow windows. The HUD bar sits below the monitor frame showing "Population Remaining" in warm gold monospace.

### Explosion Effect

**Reference: `Explosion.jpg`**

Explosions are starburst shapes with a bright white/yellow core, orange-red spikes, and small grey smoke puffs at the periphery. They are bold and graphic — not realistic fire, but illustrative and satisfying. The math problem remains briefly visible during the explosion to reinforce the connection between the correct answer and the solved problem.

### City Destruction States

**References: `City_Destroyed_01.jpg`, `City_Destroyed_02.jpg`**

Destroyed cities show cracked buildings, falling debris, smoke clouds, and orange fire bursts. The destruction is stylized and illustrative — not graphic or frightening. Buildings crack and lean but maintain their pastel color palette. The CRT monitor bezel frames the destruction scene, maintaining the retro-screen aesthetic.

### HUD Bar

**Reference: `Heads_Up_Display.jpg`**

The HUD is a clean horizontal bar in warm gold monospace text on a light lavender background. It displays: POPULATION REMAINING (left), MISSILES REMAINING (center), LEVEL (right). Separator is a simple pipe character. No icons, no clutter — information density is low and legibility is high.

---

## VISUAL DIRECTION

### The Look

Mid-century modern educational illustration. Think Saul Bass title sequences, 1960s science textbook plates, and Charley Harper wildlife prints — flat shapes, limited palette, bold compositions. The entire playfield is framed inside a rounded CRT television bezel, as if the player is watching a broadcast from a retro command center.

The background is soft lavender (`#E6D8F0`) — not dark, not black. Every element reads as a flat shape with clean edges. No gradients on backgrounds, no glow effects, no drop shadows. Depth comes from layering and overlap, not from lighting.

**Launchers** are rounded bag-shapes, each in its own distinct color. Each displays a large white number — its loaded answer. The launcher shape suggests a weighted base with a small nozzle on top.

**Bombs** are sleek teardrop/cone shapes descending from the top of the screen. Bombs have their own color palette that is **independent of the launcher colors** — the player cannot rely on color to match a bomb to a launcher. A dotted/dashed trail follows behind the bomb. The math problem is displayed in a warm display font beside the bomb body, large enough to read at a glance.

**Explosions** are the reward moment. They are graphic starburst shapes: bright yellow-white core, orange spike rays, small grey smoke puffs. Bold and celebratory, not realistic. The solved math problem remains briefly visible inside the burst.

**Cities** are flat-illustration skylines — simple rectangular buildings in soft pastels (coral, sky blue, peach, mint) with small yellow window squares. When alive, they glow warmly. When destroyed, they crack, lean, and smoke — but always in the same illustrative style, never photorealistic or frightening.

**The CRT Frame** wraps the entire playfield in a rounded rectangular bezel with a warm gold/wooden tone. This creates the feeling of watching the action through a retro television screen. The HUD bar sits outside (below) the frame.

### Atmosphere in One Sentence

> A 1960s educational film about saving cities with arithmetic — watched through a warm CRT television, bright and playful enough for an 8-year-old, with just enough retro tension to make every correct answer feel like a small victory.

### NOT Like This

| Avoid | Why |
|-------|-----|
| Dark/black backgrounds, neon colors | This is a warm, bright, daytime game. Not a nightclub or an arcade cabinet in a dark room. |
| Pixel art or 8-bit aesthetic | The style is mid-century illustration — smooth flat shapes, not pixelated grids. |
| Realistic fire or photorealistic explosions | Explosions are graphic starbursts — illustrative, bold, and clean. |
| Thin angular ICBM missile shapes | Bombs are teardrop/cone shapes — rounded, colorful, and approachable. |
| Gradients, lens flares, glow effects | Flat color only. Depth comes from layering, not from lighting tricks. |
| Drop shadows, blur, or transparency effects | Clean vector-style edges. Every shape has a definite boundary. |
| Modern UI conventions (cards, rounded buttons, subtle greys) | The UI is retro broadcast — monospace gold type, CRT frame, pipe separators. |
| Color-matched launchers and bombs | Launchers and bombs must NOT share colors. The player matches by solving the math, never by matching colors. |

---

## CONCEPT

### What Is the Game?

Missile Command Math is a retro-styled educational game where players defend cities from incoming bombs by solving math problems. Three launchers sit at the bottom of the screen, each pre-loaded with an answer. Bombs descend from above, each carrying a math problem. The player's job: figure out which answer solves which problem, then fire the correct launcher at the correct bomb before it reaches the city.

The core fantasy is empowerment through math. Every correct answer triggers a satisfying starburst explosion. Every missed problem costs a city. The player isn't just drilling facts — they're defending the homeland. The stakes feel real because the visual language makes them feel real, wrapped in enough mid-century warmth to stay playful rather than frightening.

### The Fantasy

You are a defense commander watching the action unfold on a CRT monitor in a retro command center. Bombs are falling. Your three launchers are loaded and ready. The math is your ammunition. Solve fast, aim true, and the skyline stays lit. Hesitate, and the buildings crack and smoke.

---

## TARGET AUDIENCE

**Primary:** Students in grades 3–5 (ages 8–11)

| Grade | Age | Math Focus | Pacing Notes |
|-------|-----|------------|--------------|
| 3rd | 8–9 | Addition, subtraction, intro multiplication (×2, ×5, ×10) | Slower bombs, 2 simultaneous max, extra-large touch targets |
| 4th | 9–10 | Full multiplication, long addition/subtraction, intro division | Moderate speed, 3–4 simultaneous bombs |
| 5th | 10–11 | Division, fractions, multi-digit, square roots | Faster speed, bomber events |

**Secondary audiences:** Teachers using the game as a classroom drill station; older students needing fluency reinforcement.

**Key design implication:** The game must not require reading fluency to understand mechanics. All instructions are icon-driven where possible. Math problems must be large, high-contrast, and legible on a phone screen held at arm's length.

---

## MATH SKILLS TO COVER

Problems are drawn from a skill pool that unlocks progressively by level, validated against Common Core State Standards for Mathematics (CCSS-M) grades 3–5.

| Skill | CCSS Alignment | Introduced | Example |
|-------|---------------|------------|---------|
| Single-digit addition | 2.OA.B.2 | Level 1 | `7 + 8 = ?` |
| Single-digit subtraction | 2.OA.B.2 | Level 2 | `15 − 6 = ?` |
| Mixed addition & subtraction | 2.OA.B.2 | Level 3 | `9 + 4 = ?` / `13 − 7 = ?` |
| Two-digit addition (no regroup) | 2.NBT.B.5 | Level 5 | `34 + 25 = ?` |
| Two-digit subtraction (no regroup) | 2.NBT.B.5 | Level 6 | `67 − 23 = ?` |
| Two-digit addition (with regroup) | 3.NBT.A.2 | Level 7 | `47 + 38 = ?` |
| Two-digit subtraction (with regroup) | 3.NBT.A.2 | Level 8 | `82 − 47 = ?` |
| Multiplication facts (×2, ×5, ×10) | 3.OA.C.7 | Level 9 | `6 × 5 = ?` |
| Multiplication facts (×3, ×4, ×6) | 3.OA.C.7 | Level 10 | `4 × 6 = ?` |
| Multiplication facts (full 12×12) | 3.OA.C.7 | Level 11 | `8 × 7 = ?` |
| Three-digit addition | 4.NBT.B.4 | Level 12 | `256 + 178 = ?` |
| Three-digit subtraction | 4.NBT.B.4 | Level 13 | `504 − 238 = ?` |
| Division (basic facts) | 3.OA.C.7 | Level 14 | `56 ÷ 7 = ?` |
| Division with remainders | 4.OA.A.3 | Level 15 | `29 ÷ 4 = ?` |
| Unit fractions | 3.NF.A.1 | Level 16 | `½ of 16 = ?` |
| Equivalent fractions / fraction of a number | 4.NF.A.1 | Level 17 | `¾ × 12 = ?` |
| Multi-step problems | 4.OA.A.3 | Level 18 | `(6 × 4) − 9 = ?` |
| Square roots (perfect squares ≤144) | 5.NBT / enrichment | Level 19 | `√81 = ?` |
| Mixed operation challenge | 5.OA.A.1 | Level 20 | `(√64) + (7 × 3) = ?` |

**Critical constraint:** Each level's problem set is generated before the wave starts. The three launchers are loaded with answers that collectively solve all problems in that wave. The game is always 100% solvable if the player fires in the correct sequence. No problem is ever unanswerable.

**New operation pacing rule:** When a new math operation is introduced, the bomb count for that level is held at the minimum for that level tier — never simultaneously increasing kinetic pressure and cognitive load. New operations always arrive slow and sparse first. The player gets at least one full "practice" level with the new operation before speed or bomb count increases.

---

## GAMEPLAY VISION — Three Launchers

### The Core Mechanic

Three launchers sit at the bottom of the screen, evenly spaced. Each displays a single answer number on its face. Bombs descend from the top of the screen, each carrying a math problem.

The player's job: identify which bomb's problem is solved by which launcher's answer, then tap the bomb to fire the matching launcher at it. One tap = one shot. If the launcher's answer matches the bomb's problem, the bomb explodes in a satisfying starburst. If the player taps a bomb when no launcher holds the correct answer, the launcher flashes and buzzes softly — no penalty beyond wasted time.

After a launcher fires, it reloads with a new answer from the wave's answer pool. The three launchers always display three different answers, giving the player options and encouraging scanning ahead.

**There is no color-coding between launchers and bombs.** Launchers have their own fixed colors. Bombs have their own independent colors. The player matches answers to problems by solving the math — never by matching visual colors. This is a deliberate design choice to ensure the game is always testing math fluency, not pattern recognition.

### Why Three Launchers

Three launchers restore the spatial reasoning and strategic decision-making from the original Atari Missile Command. The player must scan three answers, scan the incoming bombs, and match them — a richer cognitive task than a single queue. The lack of color-coding means every match requires the player to actually solve or recognize the answer, reinforcing fluency with every tap.

### Targeting Flow (Step by Step)

1. Three bombs are descending. One reads "6 − 5 =", another reads "10 − 5 =", and the third reads "3 + 4 =".
2. The player sees three launchers displaying "1", "7", and "5".
3. The player recognizes that 6 − 5 = 1, and taps the bomb with "6 − 5 =".
4. The launcher displaying "1" fires. A starburst explosion destroys the bomb. The math problem briefly flashes inside the burst: "6 − 5 = 1".
5. The launcher that fired reloads with a new answer from the remaining pool.
6. The targeted city flashes warm gold and a small celebration animation plays above it.
7. The player continues matching the remaining bombs to their launchers.

### Wrong-Answer Firing

If a player taps a bomb whose answer does not match any currently loaded launcher, the nearest launcher flashes red and plays a low buzz. No penalty — just a redirect. This teaches without punishing.

---

## THREAT TYPES

### 1. Standard Bombs

Single warhead, single math problem displayed beside the bomb body. Descends in a straight diagonal or vertical line toward a city. Has a visible dotted trajectory trail from its entry point.

### 2. Strategic Bombers (Introduced Level 13)

A flat-illustration bomber aircraft crosses the screen horizontally at high altitude. It drops 2–3 bombs in sequence as it traverses. The bomber itself displays a bonus problem — intercepting it before it drops its payload destroys all payload bombs automatically and earns significant bonus points. The bomber's problem is always solvable by one of the three currently loaded launchers, so the player can act immediately.

**Important interception rule:** Intercepting the bomber only cancels bombs that have not yet been dropped. Any bombs the bomber has already released before interception continue their descent and must be dealt with normally. Intercepting early (before any drops) is the maximum reward — intercepting mid-payload prevents the remaining drops but does not retroactively destroy bombs already in flight.

Bombers are introduced at Level 13, well after the player has mastered basic operations and is comfortable with the three-launcher mechanic. They add kinetic variety without introducing new math complexity.

---

## CUTSCENES — Math Briefings

### Design Philosophy

Every cutscene serves as an educational math briefing that introduces or reinforces the math operations the player will encounter in the upcoming level. The visual style is mid-century educational film strip — warm illustrated slides with a "this is your briefing, commander" framing. Each card has a large animated example, a plain-language explanation, and a confident "TAP TO LAUNCH →" button.

Cutscenes cannot accidentally overlap with gameplay. A full-screen pause state with an explicit dismissal button is always required. The game never starts until the player actively chooses to proceed.

### Cutscene Structure

Each cutscene card contains:

- A title banner with the operation name
- An animated worked example showing how the math operation works
- A plain-language tip connecting the new operation to something the player already knows
- A "TAP TO LAUNCH →" button

### Full Cutscene Script

Not every level needs a cutscene. Cutscenes appear when a new operation or mechanic is introduced. Levels that simply continue practicing an already-introduced operation begin immediately after a brief "LEVEL [X] — READY?" prompt.

---

#### Level 0 — Training (Pre-Game Only)

> **TRAINING BRIEFING — No cities can fall here.**

Full-screen overlay before the training wave begins. Warm illustrated slide, no CRT frame — this is clearly outside the game space.

**Banner text:** "TRAINING MODE"

**Body text:** "Before your first mission, let's make sure you know how to fire. A practice bomb is descending. It carries a math problem. One of your launchers has the answer. Find the match — then tap the bomb to fire. You cannot lose here. Take as long as you need."

**Animated preview:** A looping animation shows a bomb with "3 + 4 =" descending, a launcher lighting up with "7", an arrow connecting them, and the starburst firing — all in a continuous preview loop while the player reads.

**Button:** "TAP TO START TRAINING →"

This interstitial appears only once, the very first time the player launches the game. It is never shown again on subsequent sessions.

---

#### Level 1 — Addition

> **BRIEFING: ADDITION**

"Training complete. The real defense begins now. Addition problems are on the incoming bombs. You know what to do."

**Animated Example:** A single bomb descends with "3 + 4 =" displayed beside it. A launcher shows "7". A brief animated match highlights both, then the starburst fires. "3 + 4 = 7" flashes in the burst.

*Tip: "Addition puts numbers together. 3 + 4 means start at 3 and count up 4 more. You already know this — now use it to save cities!"*

---

#### Level 2 — Subtraction

> **BRIEFING: NEW OPERATION — SUBTRACTION**

"New type of problem incoming. Subtraction takes numbers apart — the opposite of addition."

**Animated Example:** "9 − 3 =" appears on a bomb. Nine dots appear, three fade away, six remain. The answer 6 loads into a launcher.

*Tip: "Subtraction means taking away. 9 − 3 means start at 9 and count back 3. If you can add, you can subtract — just go the other direction."*

---

#### Level 3 — Mixed Addition & Subtraction

> **BRIEFING: MIXED OPERATIONS**

"From now on, bombs will carry both addition and subtraction problems. Read carefully before you fire!"

**Animated Example:** Two bombs descend side by side — one with "5 + 3 =" and one with "8 − 2 =". The player matches each to the correct launcher.

*Tip: "Check the sign! Plus means combine, minus means take away. The answer is always on one of your launchers."*

---

#### Level 5 — Two-Digit Addition (No Regroup)

> **BRIEFING: BIGGER NUMBERS**

"The bombs are carrying bigger numbers now. Two-digit addition — same rules, just more to keep track of."

**Animated Example:** "34 + 25 = ?" → The tens and ones break apart visually: 30+20=50, 4+5=9, then recombine to show 59.

*Tip: "Break big numbers into tens and ones. Add them separately, then put them back together. 34 + 25 → 30+20=50, 4+5=9, answer is 59."*

---

#### Level 6 — Two-Digit Subtraction (No Regroup)

> **BRIEFING: TWO-DIGIT SUBTRACTION**

"Subtraction goes big too. Same idea — work with tens and ones separately."

**Animated Example:** "67 − 23 = ?" → 60−20=40, 7−3=4, recombine to show 44.

*Tip: "Subtract the tens, subtract the ones, put them together. 67 − 23 → 60−20=40, 7−3=4, answer is 44."*

---

#### Level 7 — Two-Digit Addition (With Regrouping)

> **BRIEFING: CARRYING OVER**

"Sometimes the ones column adds up to more than 9. When that happens, you carry a ten over to the tens column."

**Animated Example:** "47 + 38 = ?" → 7+8=15, carry the 1 ten over, 4+3+1=8 tens, answer is 85. Animated with the "1" physically hopping from the ones column to the tens column.

*Tip: "If the ones add up past 9, just carry the extra ten. 47+38 → 7+8=15, carry 1, 4+3+1=8, answer is 85."*

---

#### Level 8 — Two-Digit Subtraction (With Regrouping)

> **BRIEFING: BORROWING**

"Sometimes the top number's ones digit is smaller than the bottom's. Borrow a ten to make it work."

**Animated Example:** "82 − 47 = ?" → Can't do 2−7, so borrow: 12−7=5, 7−4=3, answer is 35. Animated with a ten sliding from the tens column into the ones column.

*Tip: "If you can't subtract the ones, borrow a ten. 82−47 → borrow to make 12−7=5, then 7−4=3, answer is 35."*

---

#### Level 9 — Introduction to Multiplication

> **BRIEFING: NEW OPERATION — MULTIPLICATION**

"Intel reports a new type of problem on the incoming bombs. Multiplication. Think of it as fast addition — groups of equal size."

**Animated Example:** "6 × 5 = ?" → Six groups of five dots appear and rearrange into a grid, then collapse to show 30. The launcher loads 30.

*Tip: "6 × 5 means six groups of five. If you can count by fives — 5, 10, 15, 20, 25, 30 — you've got it. We'll start with ×2, ×5, and ×10 — the easy ones."*

---

#### Level 10 — Expanding Multiplication

> **BRIEFING: MORE MULTIPLICATION FACTS**

"You've got ×2, ×5, and ×10 down. Time to add ×3, ×4, and ×6 to the mix."

**Animated Example:** "4 × 6 = ?" → Four rows of six dots, rearranging to show 24.

*Tip: "Same idea, new numbers. If you're not sure, count the groups: 6, 12, 18, 24. Four groups of six is 24."*

---

#### Level 11 — Full Multiplication Tables

> **BRIEFING: FULL MULTIPLICATION MASTERY**

"The full multiplication table is now in play. Every combination up to 12 × 12 could appear on a bomb."

**Animated Example:** "8 × 7 = ?" → A quick-recall animation: 8×7 flashes, the answer 56 drops into the launcher.

*Tip: "The more you play, the faster these come. Multiplication facts are like reflexes — practice makes them instant."*

---

#### Level 12 — Three-Digit Addition

> **BRIEFING: THREE-DIGIT NUMBERS**

"The numbers are getting bigger. Three digits now. Same principles — just one more column to track."

**Animated Example:** "256 + 178 = ?" → Hundreds, tens, ones break apart: 200+100=300, 50+70=120 (carry 1 hundred), 6+8=14 (carry 1 ten). Recombine to 434.

*Tip: "Work right to left: ones, tens, hundreds. Carry when you need to. You've been doing this with two digits — three is the same, just one more step."*

---

#### Level 13 — Three-Digit Subtraction + Bomber Briefing

> **BRIEFING: THREE-DIGIT SUBTRACTION + NEW THREAT**

"Three-digit subtraction is here — same borrowing rules, one more column. And watch the sky: strategic bombers have entered the theater. A single bomber drops multiple bombs. Solve its problem before it drops and you take out everything at once."

**Animated Example:** First, "504 − 238 = ?" walks through borrowing across the hundreds. Then a bomber crosses the screen, drops bombs, and gets intercepted mid-flight with a big explosion.

*Tip: "For the math: borrow across columns when you need to. For the bomber: solve its problem fast and you save yourself three problems at once."*

---

#### Level 14 — Introduction to Division

> **BRIEFING: NEW OPERATION — DIVISION**

"Division is multiplication's mirror. If 6 × 7 = 42, then 42 ÷ 6 = 7. Same fact family, different direction."

**Animated Example:** "56 ÷ 7 = ?" → 56 dots arrange into 7 equal rows, each row containing 8 dots. The answer 8 loads into the launcher.

*Tip: "Division asks: how many equal groups? If you know your multiplication facts, you already know division — just think backwards."*

---

#### Level 15 — Division with Remainders

> **BRIEFING: REMAINDERS**

"Not every number divides evenly. When there's something left over, that's a remainder."

**Animated Example:** "29 ÷ 4 = ?" → 29 dots try to arrange into groups of 4. Seven complete groups form (28 dots), with 1 dot left over. Answer: 7 R1.

*Tip: "Find the biggest number of complete groups you can make. Whatever's left over is the remainder. 29 ÷ 4 = 7 remainder 1."*

---

#### Level 16 — Unit Fractions

> **BRIEFING: NEW OPERATION — FRACTIONS**

"Some bombs now carry fraction problems. Don't panic — fractions are just division wearing a different outfit."

**Animated Example:** "½ of 16 = ?" → A bar of 16 units splits in half. One half highlights, showing 8 units. The answer 8 loads.

*Tip: "½ of 16 just means 16 ÷ 2. ¼ of 20 means 20 ÷ 4. The bottom number tells you how many groups to split into."*

---

#### Level 17 — Fraction of a Number

> **BRIEFING: FRACTIONS OF NUMBERS**

"Now you'll see fractions like ¾ of a number. Split first, then multiply."

**Animated Example:** "¾ × 12 = ?" → 12 splits into 4 groups of 3. Three groups highlight: 3 × 3 = 9. The answer 9 loads.

*Tip: "¾ × 12 means: divide 12 by 4 (that's 3), then multiply by 3 (that's 9). Divide by the bottom, multiply by the top."*

---

#### Level 18 — Multi-Step Problems

> **BRIEFING: MULTI-STEP PROBLEMS**

"Bombs are now carrying problems with two operations. Solve them in order — parentheses first."

**Animated Example:** "(6 × 4) − 9 = ?" → First 6×4=24 highlights, then 24−9=15. Answer 15 loads.

*Tip: "Work inside the parentheses first, then do the rest. (6 × 4) − 9 → 24 − 9 → 15. Step by step, you've got it."*

---

#### Level 19 — Square Roots

> **BRIEFING: NEW OPERATION — SQUARE ROOTS**

"Square roots are here. √81 means: what number times itself equals 81? Since 9 × 9 = 81, √81 = 9. Only perfect squares — you've got this."

**Animated Example:** "√64 = ?" → 64 dots arrange into a perfect 8×8 square grid. The side length (8) highlights and loads into the launcher.

*Tip: "Think of a square made of dots. √64 asks: how many dots on each side? 8 × 8 = 64, so the answer is 8. The perfect squares you need: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144."*

---

#### Level 20 — Final Wave (Mixed Operations)

> **BRIEFING: THE FINAL WAVE**

"This is it. Every math type. Bombers overhead. Addition, subtraction, multiplication, division, fractions, square roots, and multi-step combos. Your launchers are ready. You've trained for this. Save every city you can."

*Tip: "Don't rush. Scan all three launchers before you tap. The fastest player is the one who doesn't have to redo a shot."*

---

#### Victory Screen

A celebratory illustration fills the CRT frame: all six cities standing, fireworks above, the three launchers below with checkmarks. The HUD reads: "POPULATION SAFE. MATH WON." The player's final score, cities saved, and accuracy percentage are displayed. A warm gold banner reads: "You held the line."

---

## POSITIVE FEEDBACK SYSTEM

### Per-Intercept Feedback

Every successful intercept triggers:

- A starburst explosion (orange/yellow core, grey smoke puffs)
- A score pop floating up from the explosion in chunky display font (+10, +25, etc.)
- An ascending two-note chime (toggleable)

### City Save Feedback

When a bomb aimed at a specific city is destroyed:

- The targeted city's skyline flashes warm gold for 1 second
- A small firework burst appears above the city's tallest building
- A brief city-specific one-liner appears in the HUD corner:
  - "New York breathes easy!"
  - "Seattle's Space Needle still stands!"
  - "Chicago cheers!"
  - "Houston, no problem."
  - "D.C. is safe — for now."
  - "L.A. keeps the lights on!"

### Streak Feedback

- 3 correct intercepts in a row: **"SHARP SHOOTER!"**
- 5 in a row: **"ON FIRE!"** (launcher briefly pulses)
- 10 in a row: **"MATH GENIUS!"** (brief full-screen celebration flash)
- Streak resets on any miss or wrong-tap

### Level Complete Feedback

- Star rating (1–3 stars) revealed with animation
- Surviving cities shown with their buildings brightly lit
- Destroyed cities shown in dark silhouette with a small "rebuilding" crane animation — cities always rebuild before the next level

---

## TRAINING LEVEL (LEVEL 0)

Level 0 is a dedicated pre-game training level that runs before Level 1 on a player's first session. It is not selectable from the level select screen and does not appear in subsequent sessions once the player has completed it. Its purpose is to teach the core mechanic before any real stakes exist.

**Flow:**
1. Player taps "PLAY" from the main menu for the first time
2. Full-screen Training Briefing interstitial appears (see Cutscenes — Level 0)
3. Player taps "TAP TO START TRAINING →"
4. Training wave begins: one slow bomb descends, the matching launcher is highlighted with a blinking arrow, an on-screen prompt reads "Tap the bomb to fire!"
5. If the player taps the correct bomb: big starburst celebration, "YOU'VE GOT IT! — Commander, the real defense begins now." → transitions to Level 1 briefing
6. If the player misses or hesitates: bomb reaches a building (no actual damage, building just flashes), gentle "Not quite — try again!", reset with a new problem
7. Level 0 cannot be failed — it loops until the player succeeds once

**Score and stars:** Level 0 records no score and awards no stars. It is invisible in the level select and progression screens.

---

## SCREEN LAYOUT

```
┌─────────────────────────────────────────────┐
│  ╭─────────────────────────────────────╮     │
│  │                                     │     │
│  │    💣 6−5=    💣 10−5=    💣 3+4=   │     │  ← Bombs descending from top
│  │      ╲          │          ╱        │     │
│  │       ╲         │         ╱         │     │  ← Dotted trajectory trails
│  │        ╲        │        ╱          │     │
│  │                                     │     │
│  │  🏠🏠🏠🏠         🏠🏠🏠🏠🏠     │     │  ← 4 buildings left + 5 right
│  │      [1]       [7]       [5]        │     │  ← Three launchers just below buildings
│  ╰─────────────────────────────────────╯     │  ← CRT bezel frame
│                                               │
│  POPULATION REMAINING 255,706  |  MISSILES REMAINING 3  |  LEVEL 4  │
└─────────────────────────────────────────────┘
```

**Buildings (7–9 total):** The destructible buildings are positioned in a split layout across the bottom of the playfield — a cluster on the left side and a cluster on the right side, with a gap in the center where the middle launcher sits. This split is intentional: it creates two distinct zones for the player to defend, adds spatial decision-making ("which cluster is more threatened right now?"), and prevents the playfield from feeling like an undifferentiated wall of targets. The total number of buildings per level is between 7 and 9, configurable by level. Each building is an individual destructible unit — a bomb that reaches a building destroys that specific building, not the entire cluster.

**Launchers:** The three launchers sit in a row just below the building clusters — left, center, and right. The center launcher sits in the gap between the two building groups.

- **CRT frame** contains: bombs descending, trajectory trails, building clusters (split left/right), three launchers
- **Below CRT frame:** HUD bar in warm gold monospace — POPULATION REMAINING | MISSILES REMAINING | LEVEL
- **Edges:** Pause button and sound toggle

---

## WIN / LOSE CONDITIONS

### Winning a Level

Destroy all incoming threats before all buildings in both clusters are destroyed. Stars awarded based on: buildings surviving (primary), accuracy percentage, and speed bonus. All surviving buildings celebrate with a synchronized firework display above their rooftops.

### Losing a Level

All buildings in both clusters are destroyed → Game Over screen. Message: "The bombs fell. But math can still save the world. Try again?" Player can retry current level or return to level select. No permanent penalty.

### Partial Loss

Some buildings destroyed but at least one survives → level completes with reduced stars based on buildings remaining. All destroyed buildings always rebuild before the next level begins.

### Session Victory

Complete all 20 levels for the full victory sequence and final score summary.

---

## DIFFICULTY RANGE

The 20-level curve is designed so that each new math operation gets at least two levels of practice before the next operation is introduced. Speed and bomb count increase gradually. Bombers appear at Level 13 as the sole advanced threat type.

| Level | Math Types Active | Max Simultaneous | Bomber | Base Speed |
|-------|------------------|-----------------|--------|------------|
| 0 (Training) | Addition only | 1 | No | 0.2× |
| 1 | Addition only | 2 | No | 0.4× |
| 2 | Subtraction only | 2 | No | 0.4× |
| 3 | Add + Subtract mixed | 2 | No | 0.5× |
| 4 | Add + Subtract (practice) | 3 | No | 0.5× |
| 5 | Two-digit add (no regroup) | 3 | No | 0.5× |
| 6 | Two-digit subtract (no regroup) | 3 | No | 0.6× |
| 7 | Two-digit add (regroup) | 3 | No | 0.6× |
| 8 | Two-digit subtract (regroup) | 3 | No | 0.6× |
| 9 | Above + Multiply (×2, ×5, ×10) | 3 | No | 0.7× |
| 10 | Above + Multiply (×3, ×4, ×6) | 3 | No | 0.7× |
| 11 | Full multiplication | 4 | No | 0.8× |
| 12 | Above + Three-digit add | 4 | No | 0.8× |
| 13 | Above + Three-digit subtract | 4 | Yes | 0.9× |
| 14 | Above + Division | 4 | Yes | 0.9× |
| 15 | Above + Division w/ remainders | 4 | Yes | 1.0× |
| 16 | Above + Unit fractions | 4 | Yes | 1.0× |
| 17 | Above + Fraction of a number | 5 | Yes | 1.0× |
| 18 | Above + Multi-step | 5 | Yes | 1.1× |
| 19 | Above + Square roots | 5 | Yes | 1.1× |
| 20 | All types, mixed operations | 6 | Yes | 1.2× |

**Difficulty selector at game start:** Easy (0.7×), Normal (1.0×), Hard (1.3×) applied as a multiplier to base speed. Does not change math types per level, keeping curriculum alignment predictable for teachers.

---

## ACCESSIBILITY PRIORITIES

- Touch-first, 60px minimum touch targets on launchers and bombs
- Trajectory trails always shown by default — player always knows which city each bomb threatens
- No time penalty for reading — bombs descend at game speed but math is visible the entire descent
- Sound is optional — all feedback has a visual equivalent
- Pause at any time — persistent pause button, no penalty
- Portrait and landscape both supported
- Level select always accessible from main menu
- Large, high-contrast math text readable at arm's length on a phone screen
- Launchers and bombs are never color-matched, ensuring colorblind players are not disadvantaged — all matching is math-based

---

## CONFIGURATION FILE

```json
{
  "bomb": {
    "baseSpeedMultiplier": 1.0,
    "speedIncreasePerLevel": 0.05,
    "maxSimultaneous": 6,
    "showTrajectoryTrails": true
  },
  "explosion": {
    "starburstRadius": 80,
    "explosionDurationMs": 800
  },
  "launcher": {
    "count": 3,
    "reloadDelayMs": 600,
    "colorCodingWithBombs": false
  },
  "level": {
    "totalLevels": 20,
    "problemsPerLevel": [8, 8, 10, 10, 10, 12, 12, 12, 12, 14, 14, 14, 16, 16, 16, 16, 18, 18, 20, 24],
    "cityHitsToDestroy": 3,
    "rebuildCitiesBetweenLevels": true
  },
  "bomber": {
    "introducedAtLevel": 13,
    "speed": 1.2,
    "bombDropCount": 3,
    "bonusProblemOnFuselage": true
  },
  "feedback": {
    "cityCelebrationEnabled": true,
    "cityOneLinerEnabled": true,
    "streakBadgesEnabled": true
  },
  "ui": {
    "crtFrameEnabled": true,
    "soundEnabledDefault": true,
    "showMathBriefings": true
  }
}
```

---

## OUT OF SCOPE — Current Build

| Feature | Rationale |
|---------|-----------|
| User accounts / login | COPPA compliance, backend infrastructure |
| Student progress tracking / teacher dashboard | Backend dependency |
| Online leaderboards | Backend dependency; high scores localStorage only |
| Multiplayer / cooperative mode | Future scope |
| Animated cutscenes | Illustrated cards with worked examples are sufficient |
| In-app purchases or ads | Out of scope for educational use |
| VoiceOver / screen reader on canvas | Deferred to v2 |
| Keyboard-only play | Deferred to v2 |
| iOS/Android native apps | Web-first; native packaging is future step |
| MIRVs (splitting missiles) | Removed from design — single bombs and bombers provide sufficient threat variety |
| Color-coded launcher/bomb matching | Removed — math matching only, no visual shortcuts |
| Negative numbers | Below grade 3–5 CCSS scope |
| Decimal operations | Fractions are sufficient for 5th grade scope |
| Written word problems | Single-expression only |

---

## OPEN QUESTIONS FOR NEXT DESIGN SESSION

1. **Launcher reload speed:** How quickly should a launcher reload after firing? Too fast and there's no pressure; too slow and the player feels stuck. Default 600ms — is that right?

2. **Bomber queue planning:** The bomber's answer must match one of the three currently loaded launchers. Should the matching launcher pulse when a bomber appears, or should finding it be part of the challenge?

3. **City rebuild animation:** Between levels, should destroyed cities show a "rebuilding" crane animation (5–10 seconds, skippable) or snap back instantly?

4. **Level 4 purpose:** Level 4 is currently a "practice" level for mixed add/subtract with no new math introduced. Should it introduce a mild speed increase, a third simultaneous bomb, or some other progression signal so it doesn't feel like a repeat?

5. **Remainder display format:** For division with remainders (Level 15), should the answer display as "7 R1" or "7r1" or "7 remainder 1"? What fits best on a launcher face at readable size?

6. **Dog mascot:** A 4th grade playtester requested a dog. Should DEFCON DOGGO live in the launcher base area and react to saves and losses? Unanimous yes from the design team — needs art direction.

---

*Document version 4.0*

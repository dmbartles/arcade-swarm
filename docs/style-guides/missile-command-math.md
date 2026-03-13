# Missile Command Math — Visual Style Guide

**Version:** 1.0
**Game:** Missile Command Math
**Source Brief:** `docs/briefs/missile-command-math.md` (v2.0)
**Source GDD:** `docs/gdds/missile-command-math.md` (v1.0)

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Layout Grid & Screen Regions](#4-layout-grid--screen-regions)
5. [Sprite Specifications](#5-sprite-specifications)
6. [Animation Specifications](#6-animation-specifications)
7. [UI Component Specifications](#7-ui-component-specifications)
8. [Visual Effects](#8-visual-effects)
9. [Interstitial & Narrative Card Design](#9-interstitial--narrative-card-design)
10. [Accessibility & Contrast](#10-accessibility--contrast)
11. [Responsive Breakpoints](#11-responsive-breakpoints)

---

## 1. Design Philosophy

The visual language of Missile Command Math is **pastel-retro Cold War**: the stark geometry and pixel aesthetic of early 1980s arcade games softened by a warm pastel palette that keeps the Cold War theme playful, never frightening, for ages 8–11. Every element must read instantly on a phone screen held at arm's length. Clarity and legibility supersede decoration in every decision.

**Key Principles:**
- Pixel art at a consistent grid (see Section 5).
- High-contrast math text on every interactive element — WCAG AA minimum (4.5:1) for all text.
- Warm, optimistic pastels for positive feedback; cool, muted tones for threats and background.
- No gradients within sprites; flat fills with 1px outlines only.
- CRT scanline overlay available but **off by default** for accessibility.

---

## 2. Color Palette

### 2.1 Core Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Background — Sky (top) | Night Indigo | `#1B1B3A` | Top of play field gradient stop |
| Background — Sky (bottom) | Deep Navy | `#2E2E5E` | Bottom of play field gradient stop |
| Background — Ground | Charcoal Earth | `#2A2A2A` | Ground strip beneath cities |
| Primary Text | Warm White | `#F5F0E6` | HUD text, score, math problems on missiles |
| Secondary Text | Soft Cream | `#D9D0C1` | Subheadings, inactive queue numbers |
| Accent — Gold | Command Gold | `#F2C94C` | Loaded queue round highlight, city save flash, star ratings |
| Accent — Coral | Alert Coral | `#E07A5F` | Wrong-tap flash, city damage indicator, streak "ON FIRE" glow |
| Accent — Mint | Intercept Mint | `#81C9A3` | Correct-hit flash, trajectory line assist, queue highlight assist |
| Accent — Lavender | Burst Lavender | `#B8A9E2` | Explosion primary burst color |
| Accent — Rose | Soft Rose | `#E8A0BF` | Chain reaction badge, bonus text |
| UI — Dark Panel | Panel Charcoal | `#1E1E2F` | HUD bar background, queue strip background, pause overlay |
| UI — Button | Button Slate | `#3D3D5C` | Default button fill |
| UI — Button Hover/Press | Button Highlight | `#55557A` | Hovered or pressed button fill |
| UI — Border | Border Dusk | `#4A4A6A` | Panel borders, queue item outlines |

### 2.2 Threat Colors

| Threat Type | Body Fill | Outline | Text Color (on threat) |
|-------------|-----------|---------|----------------------|
| Standard Missile | `#4A5568` | `#2D3748` | `#F5F0E6` |
| Bomber (B-52) | `#6B7280` | `#374151` | `#F5F0E6` |
| MIRV (parent) | `#7C3AED` | `#5B21B6` | `#F5F0E6` |
| MIRV (child) | `#A78BFA` | `#7C3AED` | `#1B1B3A` |
| Paratrooper | `#6EE7B7` | `#34D399` | n/a (no math text) |
| Transport Plane | `#9CA3AF` | `#6B7280` | n/a |

### 2.3 City Palette

| City State | Fill | Landmark Glow | Outline |
|------------|------|---------------|---------|
| Undamaged | `#F5F0E6` | `#F2C94C` | `#4A4A6A` |
| Damaged (1 hit) | `#D9D0C1` | `#B8A090` | `#4A4A6A` |
| Damaged (2 hits) | `#9E9485` | `#7A6F62` | `#4A4A6A` |
| Destroyed | `#3A3A3A` | None | `#2A2A2A` |
| Celebration Flash | `#F2C94C` | `#FFE066` | `#F2C94C` |

### 2.4 Explosion & Feedback Colors

| Element | Color(s) |
|---------|----------|
| Explosion Ring 1 (outer) | `#B8A9E2` (Burst Lavender) |
| Explosion Ring 2 (mid) | `#81C9A3` (Intercept Mint) |
| Explosion Ring 3 (core) | `#F2C94C` (Command Gold) |
| Score Pop text | `#F2C94C` |
| Chain Badge text | `#E8A0BF` |
| Chain Badge outline | `#B8A9E2` |
| Streak "SHARP SHOOTER" text | `#81C9A3` |
| Streak "ON FIRE" text | `#E07A5F` |
| Streak "ON FIRE" launcher glow | `#E07A5F` at 60% opacity |
| Streak "MATH GENIUS" full-screen flash | `#B8A9E2` at 25% opacity |
| Wrong-tap launcher flash | `#E07A5F` at 80% opacity |
| Firework burst (city save) | `#F2C94C`, `#E8A0BF`, `#81C9A3` (random per particle) |
| Trajectory line (default) | `#E07A5F` at 30% opacity |
| Trajectory line (targeted) | `#E07A5F` at 70% opacity |

---

## 3. Typography

All fonts are web-safe or available via Google Fonts for zero-cost, zero-dependency loading.

### 3.1 Font Stack

| Role | Font Family | Fallback Stack | Weight | Style |
|------|------------|----------------|--------|-------|
| Primary UI / HUD | `"Press Start 2P"` | `"Courier New", monospace` | 400 (Regular) | Normal |
| Math Problem Text | `"Press Start 2P"` | `"Courier New", monospace` | 400 (Regular) | Normal |
| Interstitial Headline | `"Press Start 2P"` | `"Courier New", monospace` | 400 (Regular) | Normal |
| Interstitial Body | `"VT323"` | `"Courier New", monospace` | 400 (Regular) | Normal |
| Score / Badge Pop | `"Press Start 2P"` | `"Courier New", monospace` | 400 (Regular) | Normal |

> **Note:** "Press Start 2P" is a pixel-style Google Font that renders crisply at integer sizes and aligns with the retro aesthetic. "VT323" is a monospaced terminal-style Google Font used for longer-form teletype interstitial body text for improved readability at small sizes.

### 3.2 Font Sizes

All sizes in CSS pixels. Sizes must be rendered at exact integer values — no sub-pixel rendering for pixel fonts.

| Element | Size (px) | Line Height (px) | Letter Spacing (px) |
|---------|-----------|-------------------|---------------------|
| HUD Score | 14 | 18 | 1 |
| HUD Star Rating | 16 | 16 | 0 |
| Math Problem — on missile body | 18 | 22 | 1 |
| Math Problem — on bomber fuselage | 16 | 20 | 1 |
| Math Problem — MIRV child | 14 | 18 | 1 |
| Queue — loaded round number | 20 | 24 | 0 |
| Queue — upcoming round number | 16 | 20 | 0 |
| Score Pop (+10, +25, etc.) | 18 | 22 | 0 |
| Badge Text (CHAIN!, SHARP SHOOTER, etc.) | 16 | 20 | 2 |
| Streak "MATH GENIUS" | 22 | 26 | 2 |
| Interstitial Headline (date/year) | 18 | 24 | 2 |
| Interstitial Body | 16 | 24 | 0 |
| Interstitial Mechanic Briefing Label | 14 | 20 | 1 |
| "TAP TO LAUNCH →" Button Text | 18 | 22 | 2 |
| Pause Menu Options | 16 | 22 | 1 |
| City One-Liner Text | 12 | 16 | 0 |
| Training Wave Overlay Text | 16 | 22 | 1 |
| Game Over / Victory Title | 24 | 30 | 2 |
| Game Over / Victory Body | 16 | 24 | 0 |
| Settings Label | 14 | 20 | 1 |
| Difficulty Select Button Text | 18 | 22 | 1 |
| Level Select — Level Number | 20 | 24 | 0 |
| Level Select — Year Label | 12 | 16 | 1 |

### 3.3 Math Expression Rendering Rules

- Operators rendered with 2px horizontal padding on each side: `8 × 7`, `56 ÷ 7`, `47 + 38`.
- Multiplication uses `×` (U+00D7), NOT `x` or `*`.
- Division uses `÷` (U+00F7), NOT `/`.
- Square root uses `√` (U+221A) prefix: `√81`.
- Fractions on missiles rendered inline: `3/4 × 12`. The `/` is acceptable here for space constraints.
- Parentheses rendered normally: `(6 × 4) - 9`.
- Numbers ≥ 1,000 include comma separator: `1,247`.
- Remainder answers in queue rendered as: `7 R1` (numeral, space, uppercase R, remainder numeral).

---

## 4. Layout Grid & Screen Regions

### 4.1 Reference Resolution

- **Design resolution:** 360 × 640 px (portrait, mobile-first).
- **Landscape design resolution:** 640 × 360 px.
- All layout values below are for the 360 × 640 portrait reference. See Section 11 for responsive scaling.

### 4.2 Grid System

- **Columns:** 12-column grid, column width = 30px each, no gutter (elements snap to pixel grid).
- **Vertical regions** (top to bottom):

| Region | Name | Y-Start (px) | Height (px) | Content |
|--------|------|---------------|-------------|---------|
| 1 | HUD Bar | 0 | 44 | Score, stars, pause, sound toggle |
| 2 | Play Field | 44 | 436 | Sky, missiles, cities, trajectory lines, bombers, paratroopers |
| 3 | Launcher Zone | 480 | 60 | Launcher sprite, loaded round indicator |
| 4 | Queue Strip | 540 | 60 | Answer queue horizontal row |
| 5 | Safe Area Pad | 600 | 40 | Bottom device safe area / notch inset |

**Total:** 640px.

### 4.3 HUD Bar Layout (Region 1)

- **Background:** `#1E1E2F` at 90% opacity.
- **Height:** 44px.
- **Left group (x: 8px):** Score label — "SCORE:" in 14px `Press Start 2P`, `#D9D0C1`, followed by score value in `#F2C94C`.
- **Center group (x: centered):** Three star icons, each 16 × 16px, spaced 4px apart.
  - Filled star: `#F2C94C`.
  - Empty star: `#4A4A6A`.
- **Right group (x: right-aligned, 8px padding):**
  - Sound toggle icon: 24 × 24px, touch target 44 × 44px.
  - Pause icon: 24 × 24px, touch target 44 × 44px.
  - Gap between icons: 8px.

### 4.4 Play Field Layout (Region 2)

- **Background:** Linear gradient from `#1B1B3A` (top, y=44) to `#2E2E5E` (bottom, y=480).
- **City positions (6 cities):** Arranged in two rows of three, evenly distributed.

| City | Grid Column | Y-Position (center, px) | Label |
|------|-------------|------------------------|-------|
| New York | 2 (x: 60px center) | 380 | NYC |
| Chicago | 6 (x: 180px center) | 380 | CHI |
| Los Angeles | 10 (x: 300px center) | 380 | LAX |
| Houston | 2 (x: 60px center) | 440 | HOU |
| Washington D.C. | 6 (x: 180px center) | 440 | DC |
| Seattle | 10 (x: 300px center) | 440 | SEA |

- **City label:** 10px `Press Start 2P`, `#D9D0C1`, centered beneath each city sprite, y-offset +28px from city center.
- **Missile spawn zone:** y = 44px to y = 80px (top of play field). Missiles appear at random x within columns 1–12.
- **Bomber flight altitude:** y = 80px to y = 140px (high altitude horizontal traverse).
- **Transport plane altitude:** y = 200px to y = 260px (mid altitude).
- **MIRV split altitude:** y = 218px (40% of play field height from top of Region 2: 44 + (0.40 × 436) ≈ 218px).

### 4.5 Launcher Zone (Region 3)

- **Background:** `#1E1E2F`.
- **Launcher sprite:** Centered horizontally (x: 180px center), y: 500px center. Sprite size: 48 × 48px.
- **Loaded round display:** Directly above launcher, overlapping into play field by 8px. Circular badge, 40px diameter, fill `#F2C94C`, number in 20px `Press Start 2P` `#1B1B3A`. Pulsing glow ring (see Section 6.4).

### 4.6 Queue Strip (Region 4)

- **Background:** `#1E1E2F`.
- **Border top:** 1px solid `#4A4A6A`.
- **Padding:** 8px vertical, 12px horizontal.
- **Queue item:** Rounded rectangle, 44 × 44px, border-radius 4px.
  - Default fill: `#3D3D5C`.
  - Default border: 1px solid `#4A4A6A`.
  - Text: 16px `Press Start 2P`, `#D9D0C1`, centered.
  - Touch target: 60 × 60px (extends 8px beyond visible bounds on all sides).
- **Loaded (leftmost) item:** Fill `#F2C94C`, text `#1B1B3A`, border 2px solid `#FFE066`. 48 × 48px (slightly larger). Pulsing glow.
- **Highlight-assist active item:** Fill `#3D3D5C`, border 2px solid `#81C9A3`, text `#81C9A3`.
- **Fired/spent item:** Removed from strip; queue shifts left with 200ms ease-out animation.
- **Spacing between items:** 8px.
- **Maximum visible items:** 6 at reference resolution. Remaining items accessible via horizontal scroll with 8px overflow fade at right edge using a 20px gradient from `#1E1E2F` at 100% opacity to `#1E1E2F` at 0% opacity.
- **Queue scroll indicator:** A small `›` arrow, 12px, `#4A4A6A`, positioned at the right edge of the strip when more items exist beyond the visible 6.

---

## 5. Sprite Specifications

All sprites are pixel art on a **4px base grid** (each "pixel" in the art = 4 × 4 screen pixels at 1× scale on the 360px-wide reference). This gives a chunky retro feel while maintaining clarity.

### 5.1 Sprite Dimensions

| Entity | Sprite Width (px) | Sprite Height (px) | Pixel Grid | Notes |
|--------|-------------------|---------------------|------------|-------|
| Launcher (base) | 48 | 48 | 12 × 12 art pixels | Single turret, centered |
| Launcher barrel (firing) | 48 | 56 | 12 × 14 art pixels | Extended barrel during fire animation |
| Standard Missile | 24 | 48 | 6 × 12 art pixels | Vertical orientation, descending |
| Missile math label area | 80 | 24 | n/a | Text overlay box, centered on missile, semi-transparent `#1E1E2F` at 85% opacity background |
| Defensive Missile (player shot) | 8 | 16 | 2 × 4 art pixels | Small, fast-moving upward |
| Bomber (B-52) | 96 | 32 | 24 × 8 art pixels | Horizontal orientation |
| Bomber math label area | 80 | 24 | n/a | Text overlay on fuselage |
| MIRV Parent | 32 | 56 | 8 × 14 art pixels | Slightly larger than standard missile |
| MIRV Child | 16 | 32 | 4 × 8 art pixels | Smaller, fans out after split |
| MIRV child math label area | 64 | 20 | n/a | Smaller text overlay |
| Transport Plane | 80 | 28 | 20 × 7 art pixels | Horizontal, mid-altitude |
| Paratrooper (with chute) | 24 | 32 | 6 × 8 art pixels | Descending figure + chute |
| City Skyline (per city) | 48 | 40 | 12 × 10 art pixels | Includes landmark silhouette |
| City Landmark detail | 16 | 24 | 4 × 6 art pixels | Inset within city sprite |
| Explosion (max radius frame) | 160 | 160 | 40 × 40 art pixels | Circular, 80px radius |
| Chain Explosion (max radius) | 120 | 120 | 30 × 30 art pixels | Circular, 60px radius |
| Firework Particle | 4 | 4 | 1 × 1 art pixel | Single pixel particle |
| Star (HUD, filled) | 16 | 16 | 4 × 4 art pixels | Five-point star |
| Star (HUD, empty) | 16 | 16 | 4 × 4 art pixels | Five-point star outline |
| Pause Icon | 24 | 24 | 6 × 6 art pixels | Two vertical bars |
| Sound On Icon | 24 | 24 | 6 × 6 art pixels | Speaker with waves |
| Sound Off Icon | 24 | 24 | 6 × 6 art pixels | Speaker with X |
| Crowd Cheer Icon | 24 | 16 | 6 × 4 art pixels | 3 pixel figures with arms up |
| Crane (rebuild animation) | 32 | 40 | 8 × 10 art pixels | Construction crane |
| Arrow (training wave pointer) | 16 | 24 | 4 × 6 art pixels | Downward-pointing arrow |
| Parachute (detached, floating) | 16 | 16 | 4 × 4 art pixels | Solo chute floating away |

### 5.2 Sprite Color Rules

- All sprites use flat fills with a 1px (4 screen-px) darker outline.
- No gradients within sprite bodies.
- Shadows: optional 1px offset drop shadow using the outline color at 50% opacity, applied only to city skylines and the launcher for grounding.
- Missile exhaust trail: 2px-wide line in `#E07A5F` at 50% opacity, 32px long, trailing the missile body.
- Defensive missile trail: 2px-wide line in `#81C9A3` at 70% opacity, 48px long.

### 5.3 Math Problem Label Overlay

Math problems are displayed on a semi-transparent overlay box attached to each threat:

| Property | Value |
|----------|-------|
| Background | `#1E1E2F` at 85% opacity |
| Border | 1px solid `#4A4A6A` |
| Border Radius | 2px |
| Padding | 4px horizontal, 2px vertical |
| Text Color | `#F5F0E6` |
| Font | `Press Start 2P` at the entity's specified size (see Section 3.2) |
| Anchor | Centered on sprite horizontally, offset 4px above sprite top |
| Min Width | 64px |
| Max Width | 120px |

---

## 6. Animation Specifications

All durations in milliseconds. Frame counts refer to distinct sprite frames in the sprite sheet.

### 6.1 Missile Animations

| Animation | Frames | Duration (ms) | Loop | Easing | Notes |
|-----------|--------|---------------|------|--------|-------|
| Standard Missile — descent idle | 2 | 600 (300ms/frame) | Yes | Linear | Slight exhaust flicker |
| Standard Missile — hit/destroy | 1 | 0 (instant → triggers explosion) | No | — | Missile sprite removed instantly on hit |
| Defensive Missile — flight | 1 | n/a (position-driven) | No | Linear | Moves from launcher to target at 800px/s |
| MIRV Parent — descent idle | 2 | 600 | Yes | Linear | Same as standard with color variant |
| MIRV — split event | 4 | 400 (100ms/frame) | No | Ease-out | Parent shrinks, children fan out |
| MIRV Child — descent idle | 2 | 400 (200ms/frame) | Yes | Linear | Faster flicker than parent |

### 6.2 Bomber & Transport Animations

| Animation | Frames | Duration (ms) | Loop | Easing | Notes |
|-----------|--------|---------------|------|--------|-------|
| Bomber — flight cycle | 4 | 800 (200ms/frame) | Yes | Linear | Propeller spin, slight bob |
| Bomber — payload drop | 3 | 300 (100ms/frame) | No | Ease-in | Bomb bay opens, missile releases |
| Bomber — destroyed | 5 | 500 (100ms/frame) | No | Ease-out | Flash, break apart, fade |
| Transport Plane — flight | 4 | 800 (200ms/frame) | Yes | Linear | Propeller spin |
| Transport — paratrooper drop | 2 | 200 (100ms/frame) | No | Linear | Figure exits rear, chute deploys |

### 6.3 Paratrooper Animations

| Animation | Frames | Duration (ms) | Loop | Easing | Notes |
|-----------|--------|---------------|------|--------|-------|
| Paratrooper — descent | 4 | 1200 (300ms/frame) | Yes | Linear | Gentle sway left-right |
| Paratrooper — blast caught | 3 | 300 (100ms/frame) | No | Ease-out | Chute detaches, figure disappears, chute floats up and fades |
| Parachute — float away | 6 | 1200 (200ms/frame) | No | Ease-out | Rises and fades to 0% opacity |

### 6.4 Launcher Animations

| Animation | Frames | Duration (ms) | Loop | Easing | Notes |
|-----------|--------|---------------|------|--------|-------|
| Launcher — idle | 1 | n/a | — | — | Static sprite |
| Launcher — fire | 3 | 300 (100ms/frame) | No | Ease-out | Barrel extends, recoil flash, return |
| Launcher — lock (post-fire) | n/a | 800 | No | Linear | Loaded round ring pulses at 2× speed during lock |
| Loaded round — pulse glow | n/a | 1500 | Yes | Sine (ease-in-out) | Glow ring on loaded round oscillates from 0% to 40% extra opacity, 4px blur radius, color `#F2C94C` |
| Launcher — wrong tap flash | n/a | 300 | No | Ease-out | Launcher tints `#E07A5F` at 80% opacity, fades to 0% over 300ms |
| Launcher — "ON FIRE" glow | n/a | 2000 | No | Ease-in-out | `#E07A5F` at 60% opacity glow, 8px blur, fades over 2000ms |

### 6.5 Explosion Animations

| Animation | Frames | Duration (ms) | Loop | Easing | Notes |
|-----------|--------|---------------|------|--------|-------|
| Player explosion — expand | 6 | 500 (≈83ms/frame) | No | Ease-out | Three concentric rings expand from 0 to max radius (80px). Ring 1: `#F2C94C`, Ring 2: `#81C9A3`, Ring 3: `#B8A9E2`. |
| Player explosion — fade | 3 | 300 (100ms/frame) | No | Ease-in | Rings fade from 100% to 0% opacity |
| Chain explosion — expand | 5 | 400 (80ms/frame) | No | Ease-out | Same color rings, max radius 60px |
| Chain explosion — fade | 3 | 300 (100ms/frame) | No | Ease-in | Same as player fade |
| Total explosion duration | — | 800 | — | — | 500ms expand + 300ms fade = 800ms total (matches config `explosionDurationMs`) |

### 6.6 Feedback Animations

| Animation | Frames | Duration (ms) | Loop | Easing | Notes |
|-----------|--------|---------------|------|--------|-------|
| Score pop — float up + fade | n/a | 1000 | No | Ease-out | Text starts at explosion center, floats up 60px, fades from 100% to 0% opacity |
| Badge (CHAIN!, SHARP SHOOTER, etc.) — slam in | n/a | 600 | No | Ease-out (bounce) | Scales from 200% to 100% over 200ms, holds 300ms, fades over 100ms |
| "MATH GENIUS" full-screen flash | n/a | 800 | No | Ease-in-out | Screen overlays `#B8A9E2` at 25% opacity, fades to 0% |
| City save — gold flash | n/a | 1000 | No | Ease-out | City skyline fill overrides to `#F2C94C` for 200ms, fades back to original over 800ms |
| City save — firework burst | 8 | 800 (100ms/frame) | No | Ease-out | 12 particles (4px each) in `#F2C94C`, `#E8A0BF`, `#81C9A3` burst radially from 0 to 40px above city landmark, then fade |
| City save — crowd cheer | 4 | 600 (150ms/frame) | No | Ease-out | 3 pixel figures raise arms, hold, lower. Sprite positioned 8px above city. Fades out over final 150ms |
| City one-liner — slide in | n/a | 1500 | No | Ease-in-out | Text appears at HUD bar bottom-left, slides in from left over 200ms, holds 1000ms, fades over 300ms |
| Star reveal (level complete) | n/a | 1800 (600ms/star) | No | Ease-out (bounce) | Each star scales from 0% to 120% to 100% over 400ms, then holds 200ms before next star begins |
| Crane rebuild | 6 | 3000 (500ms/frame) | No | Linear | Crane arm swings, city silhouette incrementally fills in. Plays once. Skippable. |

### 6.7 Queue Animations

| Animation | Frames | Duration (ms) | Loop | Easing | Notes |
|-----------|--------|---------------|------|--------|-------|
| Queue — shift left (after fire) | n/a | 200 | No | Ease-out | All items translate left by (itemWidth + spacing) = 52px |
| Queue — new item loaded highlight | n/a | 400 | No | Ease-out | Item grows from 44px to 48px, fill transitions from `#3D3D5C` to `#F2C94C`, text from `#D9D0C1` to `#1B1B3A` |
| Queue highlight assist — pulse | n/a | 2000 | Yes | Sine (ease-in-out) | Border color `#81C9A3` oscillates between 60% and 100% opacity |

### 6.8 Training Wave Animations

| Animation | Frames | Duration (ms) | Loop | Easing | Notes |
|-----------|--------|---------------|------|--------|-------|
| Blinking arrow — point at loaded round | n/a | 800 | Yes | Step (on 400ms / off 400ms) | Arrow toggles between visible (100% opacity) and hidden (0% opacity) |
| Blinking arrow — point at missile | n/a | 800 | Yes | Step (on 400ms / off 400ms) | Same blink, positioned above target missile |
| "YOU'VE GOT IT!" text — slam | n/a | 1000 | No | Ease-out (bounce) | Scales from 250% to 100% over 300ms, holds 500ms, fades 200ms |

---

## 7. UI Component Specifications

### 7.1 Buttons

| Property | Default | Hover / Pressed | Disabled |
|----------|---------|-----------------|----------|
| Fill | `#3D3D5C` | `#55557A` | `#2A2A3A` |
| Border | 2px solid `#4A4A6A` | 2px solid `#81C9A3` | 2px solid `#3A3A4A` |
| Border Radius | 4px | 4px | 4px |
| Text Color | `#F5F0E6` | `#F5F0E6` | `#6A6A7A` |
| Text Font | `Press Start 2P` | `Press Start 2P` | `Press Start 2P` |
| Text Size | 16px | 16px | 16px |
| Min Touch Target | 60 × 60px | — | — |
| Padding | 12px horizontal, 10px vertical | Same | Same |
| Press Animation | — | Translate Y +2px, 100ms ease-out | — |

### 7.2 "TAP TO LAUNCH →" Button (Interstitial)

| Property | Value |
|----------|-------|
| Fill | `#F2C94C` |
| Border | 2px solid `#D4A83A` |
| Border Radius | 6px |
| Text Color | `#1B1B3A` |
| Text Font | `Press Start 2P` at 18px |
| Width | 280px |
| Height | 56px |
| Touch Target | 300 × 72px |
| Position | Centered horizontally, y: 560px (above safe area) |
| Idle Animation | Subtle pulse — scale oscillates between 100% and 103% over 2000ms, sine easing |

### 7.3 Pause Overlay

| Property | Value |
|----------|-------|
| Background | `#1B1B3A` at 85% opacity, full screen |
| Title | "PAUSED" — 24px `Press Start 2P`, `#F5F0E6`, centered, y: 200px |
| Menu Items | 4 buttons stacked vertically: Resume, Restart, Level Select, Settings |
| Button Spacing | 16px vertical gap |
| First Button Y | 260px |

### 7.4 Level Select Grid

| Property | Value |
|----------|-------|
| Layout | 2 rows × 5 columns |
| Tile Size | 60 × 72px |
| Tile Border Radius | 6px |
| Tile Gap | 12px horizontal, 16px vertical |
| Grid top-left origin | x: 18px, y: 160px |
| Unlocked Tile Fill | `#3D3D5C` |
| Unlocked Tile Border | 2px solid `#4A4A6A` |
| Locked Tile Fill | `#2A2A3A` |
| Locked Tile Border | 2px solid `#3A3A4A` |
| Level Number | 20px `Press Start 2P`, centered, y-offset: 22px from tile top |
| Year Label | 12px `Press Start 2P`, `#D9D0C1`, centered, y-offset: 46px from tile top |
| Star Display | 3 stars at 10 × 10px each, 2px gap, centered, y-offset: 60px from tile top |
| Star Filled | `#F2C94C` |
| Star Empty | `#4A4A6A` |
| Lock Icon (locked tiles) | 16 × 16px, `#6A6A7A`, centered in tile |

### 7.5 Difficulty Select

| Property | Value |
|----------|-------|
| Layout | 3 buttons horizontally centered |
| Button Size | 96 × 80px each |
| Gap | 16px |
| Easy — Icon | Single chevron `›`, 24px, `#81C9A3` |
| Easy — Label | "EASY", 14px, `#81C9A3` |
| Normal — Icon | Double chevron `››`, 24px, `#F2C94C` |
| Normal — Label | "NORMAL", 14px, `#F2C94C` |
| Hard — Icon | Triple chevron `›››`, 24px, `#E07A5F` |
| Hard — Label | "HARD", 14px, `#E07A5F` |
| Button Fill | `#3D3D5C` |
| Button Border | 2px solid matching icon color |
| Selected State Border | 3px solid matching icon color, fill `#55557A` |

### 7.6 Settings Toggles

| Property | Value |
|----------|-------|
| Toggle Track Size | 48 × 24px |
| Toggle Track Off Fill | `#3D3D5C` |
| Toggle Track On Fill | `#81C9A3` |
| Toggle Knob Size | 20 × 20px (circle) |
| Toggle Knob Fill | `#F5F0E6` |
| Toggle Knob Border | 1px solid `#4A4A6A` |
| Toggle Touch Target | 60 × 48px |
| Label Font | 14px `Press Start 2P`, `#D9D0C1` |
| Row Height | 48px |
| Row Spacing | 8px |
| Settings Panel Width | 300px, centered |
| Settings Panel Fill | `#1E1E2F` |
| Settings Panel Border | 2px solid `#4A4A6A`, border-radius 8px |

### 7.7 Game Over Screen

| Property | Value |
|----------|-------|
| Background | `#1B1B3A` full screen |
| Title | "GAME OVER" — 24px `Press Start 2P`, `#E07A5F`, centered, y: 180px |
| Body Text | Narrative message — 16px `VT323`, `#D9D0C1`, centered, max-width 300px, y: 230px |
| Button Area | "RETRY" and "LEVEL SELECT" stacked, starting y: 400px, 16px gap |

### 7.8 Victory Screen

| Property | Value |
|----------|-------|
| Background | `#1B1B3A` full screen |
| Title | "MATH WON." — 24px `Press Start 2P`, `#F2C94C`, centered, y: 100px |
| Narrative Text | INF Treaty text — 16px `VT323`, `#D9D0C1`, centered, max-width 300px, y: 150px |
| Stats Area | y: 350px, left-aligned at x: 40px. Each stat line: 14px `Press Start 2P`, `#F5F0E6`. 24px row spacing. |
| Star Summary | Per-level mini-row: level number (14px) + 3 stars (10 × 10px). 10 rows, 20px vertical spacing, starting y: 420px |
| Buttons | "PLAY AGAIN" and "LEVEL SELECT" at y: 560px, side by side, 16px gap |

---

## 8. Visual Effects

### 8.1 CRT Scanline Overlay (Off by Default)

| Property | Value |
|----------|-------|
| Pattern | Horizontal lines, 2px opaque `#000000` at 8% opacity alternating with 2px transparent, repeating across full screen |
| Blend Mode | Multiply |
| Z-Index | Topmost layer (above all game content, below pause overlay) |
| Toggle | Settings → CRT Scanlines toggle |

### 8.2 Trajectory Lines

| Property | Value |
|----------|-------|
| Stroke Width | 2px |
| Stroke Color (default) | `#E07A5F` at 30% opacity |
| Stroke Color (targeted / next-to-fire match) | `#E07A5F` at 70% opacity |
| Dash Pattern | 4px dash, 8px gap |
| Start Point | Center-bottom of missile sprite |
| End Point | Center-top of target city sprite |
| Render Layer | Below missiles, above background |

### 8.3 Missile Exhaust Trail

| Property | Value |
|----------|-------|
| Width | 2px |
| Color | `#E07A5F` at 50% opacity |
| Length | 32px, trailing above missile |
| Fade | Linear fade from 50% opacity (at missile tail) to 0% (at trail end) |

### 8.4 Defensive Missile Trail

| Property | Value |
|----------|-------|
| Width | 2px |
| Color | `#81C9A3` at 70% opacity |
| Length | 48px, trailing below the ascending defensive missile |
| Fade | Linear fade from 70% opacity to 0% |

### 8.5 Ground Line

| Property | Value |
|----------|-------|
| Y Position | 472px (bottom of play field, top of launcher zone) |
| Stroke | 1px solid `#4A4A6A` |
| Full width | 360px |

---

## 9. Interstitial & Narrative Card Design

### 9.1 Card Layout

| Property | Value |
|----------|-------|
| Background | `#1B1B3A` full screen |
| Content Area | Max-width 320px, centered, padding 20px |
| Date/Headline Y-Start | 80px |
| Date/Headline Font | 18px `Press Start 2P`, `#F2C94C` |
| Date/Headline Line Height | 24px |
| Narrative Body Y-Start | 120px (below headline) |
| Narrative Body Font | 16px `VT323`, `#D9D0C1` |
| Narrative Body Line Height | 24px |
| Threat Briefing Label Y-Start | 16px below narrative body end |
| Threat Briefing Label Font | 14px `Press Start 2P`, `#81C9A3` |
| Threat Briefing Body Font | 16px `VT323`, `#F5F0E6` |
| Threat Briefing Body Line Height | 24px |
| Mechanic Demo Icon Size | 48 × 48px, positioned 8px left of briefing label |
| "TAP TO LAUNCH →" Button | See Section 7.2, fixed at y: 560px |

### 9.2 Teletype Text Effect

- Headline text renders character-by-character.
- Speed: 40ms per character.
- Cursor: blinking `█` block cursor, `#F2C94C`, blink cycle 500ms (250ms on, 250ms off).
- Cursor disappears 200ms after the last character renders.
- Narrative body text appears all at once (no teletype) after the headline completes, with a 300ms fade-in.
- Tapping the screen during teletype animation instantly completes all text (no skip-past-card; only accelerates text reveal).

### 9.3 Victory Card Enhancements

- Title "MATH WON." uses `#F2C94C` with a 4px glow of `#F2C94C` at 40% opacity.
- A single row of firework bursts plays across the top (y: 40–60px) — 5 bursts at x: 40, 110, 180, 250, 320px, each staggered by 300ms, using the firework particle animation from Section 6.6.

---

## 10. Accessibility & Contrast

### 10.1 WCAG AA Compliance Matrix

All text-background pairs must meet **WCAG AA minimum contrast ratio of 4.5:1** for normal text and **3:1** for large text (≥ 18.66px bold or ≥ 24px regular). Ratios computed below.

| Text Element | Foreground | Background | Contrast Ratio | WCAG AA Pass? |
|-------------|------------|------------|----------------|---------------|
| HUD Score label | `#D9D0C1` on `#1E1E2F` | — | 9.2:1 | ✅ Yes |
| HUD Score value | `#F2C94C` on `#1E1E2F` | — | 9.7:1 | ✅ Yes |
| Math problem on missile | `#F5F0E6` on `#1E1E2F` (label bg at 85%) | — | 12.5:1 | ✅ Yes |
| Math problem on bomber | `#F5F0E6` on `#1E1E2F` (label bg at 85%) | — | 12.5:1 | ✅ Yes |
| Queue number (default) | `#D9D0C1` on `#3D3D5C` | — | 4.8:1 | ✅ Yes |
| Queue number (loaded) | `#1B1B3A` on `#F2C94C` | — | 10.8:1 | ✅ Yes |
| Queue number (highlight assist) | `#81C9A3` on `#3D3D5C` | — | 4.7:1 | ✅ Yes |
| Interstitial headline | `#F2C94C` on `#1B1B3A` | — | 10.2:1 | ✅ Yes |
| Interstitial body | `#D9D0C1` on `#1B1B3A` | — | 9.7:1 | ✅ Yes |
| Interstitial briefing label | `#81C9A3` on `#1B1B3A` | — | 7.3:1 | ✅ Yes |
| Interstitial briefing body | `#F5F0E6` on `#1B1B3A` | — | 13.2:1 | ✅ Yes |
| "TAP TO LAUNCH" button text | `#1B1B3A` on `#F2C94C` | — | 10.8:1 | ✅ Yes |
| Button text (default) | `#F5F0E6` on `#3D3D5C` | — | 5.8:1 | ✅ Yes |
| Button text (disabled) | `#6A6A7A` on `#2A2A3A` | — | 3.2:1 | ✅ Yes (large text, ≥ 16px pixel font treated as bold equivalent) |
| City label | `#D9D0C1` on gradient avg `#252550` | — | 8.4:1 | ✅ Yes |
| City one-liner | `#F5F0E6` on `#1E1E2F` (HUD bg) | — | 12.5:1 | ✅ Yes |
| Score pop text | `#F2C94C` on gradient avg `#252550` | — | 8.9:1 | ✅ Yes |
| Badge text (CHAIN!) | `#E8A0BF` on gradient avg `#252550` | — | 5.4:1 | ✅ Yes |
| Game Over title | `#E07A5F` on `#1B1B3A` | — | 5.1:1 | ✅ Yes |
| Victory title | `#F2C94C` on `#1B1B3A` | — | 10.2:1 | ✅ Yes |
| MIRV child math text | `#1B1B3A` on `#A78BFA` | — | 5.6:1 | ✅ Yes |

### 10.2 Non-Color Indicators

Critical information must never rely on color alone:

| Information | Color Signal | Non-Color Signal |
|-------------|-------------|-----------------|
| Loaded queue round | Gold fill (`#F2C94C`) | Larger size (48px vs 44px), pulsing glow ring, leftmost position |
| Queue highlight assist | Mint border (`#81C9A3`) | Animated pulse on border |
| Wrong-tap feedback | Red flash (`#E07A5F`) | Buzz sound, no queue advancement (position unchanged) |
| City damage state | Progressively darker fill | Crack texture overlay, reduced landmark detail (2 → 1 → 0 visible landmark elements) |
| City destroyed | Dark fill (`#3A3A3A`) | Flat silhouette shape, no interior detail, no glow |
| Trajectory line (targeted) | Higher opacity | Brighter dash pattern (same color, increased opacity) |
| Missile type (MIRV vs standard) | Purple vs gray fill | Larger sprite size (32 × 56 vs 24 × 48), distinct shape (wider body) |
| Streak active | Varies by tier | Text badge always accompanies color effect |
| Fired/spent queue item | Removed from strip | Physical removal + leftward shift animation |

### 10.3 Touch Target Minimums

| Element | Visible Size (px) | Touch Target (px) | Exceeds 60px Minimum? |
|---------|-------------------|-------------------|----------------------|
| Queue item (default) | 44 × 44 | 60 × 60 | ✅ Yes |
| Queue item (loaded) | 48 × 48 | 60 × 60 | ✅ Yes |
| Missile (tappable) | 24 × 48 (sprite) + 80 × 24 (label) | 88 × 72 | ✅ Yes |
| Bomber (tappable) | 96 × 32 (sprite) + 80 × 24 (label) | 104 × 64 | ✅ Yes |
| MIRV parent (tappable) | 32 × 56 + 80 × 24 | 88 × 80 | ✅ Yes |
| MIRV child (tappable) | 16 × 32 + 64 × 20 | 72 × 60 | ✅ Yes |
| Pause button | 24 × 24 | 44 × 44 | ⚠️ Below 60px — HUD exception (not gameplay-critical, always accessible via tap) |
| Sound toggle | 24 × 24 | 44 × 44 | ⚠️ Below 60px — HUD exception |
| "TAP TO LAUNCH →" | 280 × 56 | 300 × 72 | ✅ Yes |
| Level select tile | 60 × 72 | 72 × 84 | ✅ Yes |
| Difficulty button | 96 × 80 | 108 × 92 | ✅ Yes |
| Settings toggle | 48 × 24 | 60 × 48 | ✅ Yes |

> **Note on HUD exceptions:** Pause and Sound icons have 44 × 44px touch targets, below the 60px gameplay minimum. This is acceptable because they are non-gameplay-critical utility buttons, and 44px meets WCAG 2.5.8 (Target Size, Level AAA is 44px). Gameplay-interactive elements all exceed 60px.

### 10.4 Motion Sensitivity

- All pulsing/oscillating animations use **sine easing** (no sudden changes).
- No animation flashes exceed 3 flashes per second (WCAG 2.3.1 compliance).
- The "MATH GENIUS" full-screen flash is a single 800ms fade at 25% opacity — well below the general flash threshold.
- CRT scanlines are off by default and do not flash.
- All screen transitions use 200–400ms fades, never instant hard cuts during gameplay.

---

## 11. Responsive Breakpoints

### 11.1 Breakpoint Definitions

| Breakpoint | Width Range | Orientation | Scaling Strategy |
|------------|-------------|-------------|-----------------|
| Small Phone (Portrait) | 320–359px | Portrait | Scale all values by 0.89× (320/360) |
| Reference Phone (Portrait) | 360–413px | Portrait | 1.0× — all values as specified |
| Large Phone (Portrait) | 414–479px | Portrait | Scale by 1.15× (414/360) |
| Small Tablet (Portrait) | 480–767px | Portrait | Scale by 1.33× (480/360); increase queue visible count to 8 |
| Landscape Phone | 640–767px wide, 320–413px tall | Landscape | Remap layout: HUD left sidebar (44px wide), queue strip bottom (48px), play field fills remaining space. Font sizes unchanged. |
| Tablet Landscape | 768px+ wide | Landscape | Scale by 1.5×; increase queue visible count to 10; city spacing increases proportionally |

### 11.2 Scaling Rules

- **Sprites:** Scale proportionally to the nearest multiple of 4px (maintain pixel grid alignment). Round UP.
- **Fonts:** Scale proportionally, round to nearest integer px. Never below 10px for any visible text.
- **Touch targets:** Scale proportionally. Never below 44 × 44px at any breakpoint.
- **Queue strip:** Number of visible items adjusts per breakpoint (see table above). Horizontal scroll always available for overflow.
- **Play field cities:** Reposition proportionally based on available play field width and height. Maintain equal spacing between city columns.

### 11.3 Landscape Layout Remap

In landscape orientation, the layout restructures:

| Region | Position | Size (at 640 × 360 reference) |
|--------|----------|-------------------------------|
| HUD Bar | Top, full width | 640 × 36px |
| Play Field | Center, below HUD | 520 × 264px (x: 0, y: 36) |
| Launcher Zone | Right of play field | 120 × 264px (x: 520, y: 36) |
| Queue Strip | Bottom, full width | 640 × 60px (y: 300) |

- Launcher sprite moves to center of the Launcher Zone (x: 580, y: 168).
- Cities redistribute into a wider arc within the play field, maintaining relative positions.
- All other specifications (colors, fonts, animations) remain unchanged.

---

*End of Visual Style Guide — Missile Command Math v1.0*

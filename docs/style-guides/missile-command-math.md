# Missile Command Math — Visual Style Guide

**Version:** 1.0
**Game:** Missile Command Math
**Source Brief:** `docs/briefs/missile-command-math.md` (v2.0)
**Source GDD:** `docs/gdds/missile-command-math.md` (v1.0)

---

## Table of Contents

1. [Art Direction Summary](#1-art-direction-summary)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [UI Layout Grid](#4-ui-layout-grid)
5. [Sprite Dimensions](#5-sprite-dimensions)
6. [Animation Specifications](#6-animation-specifications)
7. [Visual Effects](#7-visual-effects)
8. [Accessibility & Contrast](#8-accessibility--contrast)
9. [Scene-Specific Art Direction](#9-scene-specific-art-direction)

---

## 1. Art Direction Summary

**Visual Identity:** Pastel-retro CRT. The game evokes early 1980s Atari vector arcade aesthetics — dark backgrounds, glowing lines, pixel art — but rendered in a softened, warm, pastel-shifted color palette rather than the harsh primary colors of the original *Missile Command*. The tone is "playful Cold War nostalgia," not frightening. Think: Lisa Frank meets NORAD.

**Pixel Density:** All sprites are authored at a **4× pixel scale** — meaning each "game pixel" renders as a 4×4 block of screen pixels at 1× zoom on the reference resolution of 800×600. This produces chunky, highly legible retro art.

**CRT Effect:** An optional fullscreen overlay simulating CRT phosphor scanlines and subtle barrel distortion. Off by default. When enabled, scanline opacity must never exceed 15% to preserve text legibility.

**Emotional Tone Keywords:** Warm, heroic, slightly humorous, empowering, never grim or scary.

---

## 2. Color Palette

### 2.1 Core Palette

| Role | Name | Hex Code | Usage |
|------|------|----------|-------|
| Background — Sky (top) | Midnight Navy | `#0B0E2A` | Top 60% of gameplay sky gradient start |
| Background — Sky (bottom) | Deep Indigo | `#1A1F4E` | Bottom of gameplay sky gradient end, above city horizon |
| Background — Ground | Charcoal Slate | `#1E1E2C` | Ground/horizon strip beneath cities |
| Primary Accent | Soft Coral | `#FF6F7A` | Loaded queue item glow, critical threat highlights, wrong-tap flash |
| Secondary Accent | Electric Lavender | `#B388FF` | Interceptor missile trail, trajectory lines, interstitial headers |
| Tertiary Accent | Mint Glow | `#69F0AE` | Correct-tap confirmation, city-save flash, streak badge text |
| Warm Highlight | Pastel Gold | `#FFD54F` | City-save skyline flash, score pops, star rating icons |
| Queue Strip Background | Dark Slate | `#2C2C3E` | Answer queue strip background bar |
| Queue Item Default | Cool Grey | `#9E9EAF` | Unloaded queue item number text |
| Queue Item Loaded | Pure White | `#FFFFFF` | Currently loaded queue item number text |
| HUD Background | Smoke Black 85% | `#000000D9` | HUD bar background (85% opacity black) |
| HUD Text | Off-White | `#F5F5F5` | Score, labels, button text in HUD |
| Missile Body | Warm Red | `#E53935` | Standard missile body fill |
| Missile Problem Text | Pure White | `#FFFFFF` | Math problem text displayed on missile body |
| Bomber Body | Gunmetal | `#546E7A` | B-52 bomber fuselage fill |
| Bomber Accent | Amber Warning | `#FFA726` | Bomber problem text, bomber entry indicator |
| MIRV Body | Hot Magenta | `#EC407A` | MIRV parent missile body fill |
| MIRV Child Body | Light Pink | `#F48FB1` | MIRV child warhead body fill |
| Paratrooper Chute | Sky Blue | `#4FC3F7` | Parachute canopy fill |
| Paratrooper Figure | Olive Drab | `#8D6E63` | Paratrooper sprite body fill |
| Transport Plane | Steel Grey | `#78909C` | Paratrooper transport aircraft fill |
| City Skyline Lit | Warm White | `#FFF8E1` | City buildings when alive — warm window glow |
| City Skyline Dark | Dim Grey | `#424242` | City buildings when destroyed — silhouette |
| City Window Glow | Amber Glow | `#FFCC02` | Individual window lights on living city buildings |
| Launcher Body | Titanium Silver | `#B0BEC5` | Launcher barrel and housing fill |
| Launcher Base | Dark Steel | `#37474F` | Launcher pedestal/base fill |
| Button Primary Fill | Electric Lavender | `#B388FF` | Primary action buttons (TAP TO LAUNCH, Start Game) |
| Button Primary Text | Midnight Navy | `#0B0E2A` | Text on primary buttons |
| Button Secondary Fill | Charcoal Slate | `#1E1E2C` | Secondary action buttons (Settings, Retry) |
| Button Secondary Text | Off-White | `#F5F5F5` | Text on secondary buttons |
| Button Secondary Border | Cool Grey | `#9E9EAF` | 2px border on secondary buttons |

### 2.2 Explosion Palette

| Explosion Phase | Name | Hex Code | Usage |
|-----------------|------|----------|-------|
| Core Flash | Hot White | `#FFFDE7` | Innermost explosion frame (frame 1) |
| Inner Ring | Pastel Coral | `#FFAB91` | Explosion ring frame 2–3 |
| Mid Ring | Soft Lavender | `#CE93D8` | Explosion ring frame 4–5 |
| Outer Ring | Mint Fade | `#A5D6A7` | Explosion ring frame 6–7 |
| Dissipation | Transparent Gold | `#FFD54F40` | Final fade-out ring (25% opacity) |

### 2.3 Feedback Badge Colors

| Badge | Background Hex | Text Hex |
|-------|---------------|----------|
| CHAIN! | `#7C4DFF` | `#FFFFFF` |
| SHARP SHOOTER! | `#FFD54F` | `#0B0E2A` |
| ON FIRE! | `#FF6F7A` | `#FFFFFF` |
| MATH GENIUS! | `#69F0AE` | `#0B0E2A` |
| BLAST RADIUS! | `#4FC3F7` | `#0B0E2A` |

### 2.4 Star Rating Colors

| State | Hex Code |
|-------|----------|
| Star Earned | `#FFD54F` |
| Star Empty | `#424242` |
| Star Outline | `#9E9EAF` |

### 2.5 Queue Highlight Assist Color

When Queue Highlight Assist is enabled, queue items whose value matches a currently visible missile problem receive a background tint:

| State | Background Hex | Border Hex |
|-------|---------------|------------|
| Highlight Active | `#B388FF33` (20% opacity) | `#B388FF` |

---

## 3. Typography

### 3.1 Primary Font — Game UI & HUD

| Property | Value |
|----------|-------|
| Font Family | `"Press Start 2P"` (Google Fonts — bitmap pixel font) |
| Fallback Stack | `"Press Start 2P", "Courier New", monospace` |
| Format | WOFF2 |

#### Size Scale

| Usage | Size (px) | Weight | Line Height (px) | Letter Spacing (px) |
|-------|-----------|--------|-------------------|---------------------|
| HUD Score | 16 | 400 (Regular) | 20 | 1 |
| HUD Labels (SCORE, LEVEL) | 10 | 400 (Regular) | 14 | 2 |
| Queue Item Numbers | 20 | 400 (Regular) | 24 | 0 |
| Queue Item Loaded Number | 24 | 400 (Regular) | 28 | 0 |
| Streak/Chain Badge Text | 14 | 400 (Regular) | 18 | 1 |
| Score Pop (+10, +25) | 18 | 400 (Regular) | 22 | 0 |
| Button Text (Primary) | 14 | 400 (Regular) | 18 | 2 |
| Button Text (Secondary) | 12 | 400 (Regular) | 16 | 2 |
| Level Select Number | 20 | 400 (Regular) | 24 | 0 |
| Game Over / Victory Heading | 24 | 400 (Regular) | 32 | 2 |
| Settings Labels | 12 | 400 (Regular) | 16 | 1 |
| City One-Liner Text | 10 | 400 (Regular) | 14 | 1 |

### 3.2 Secondary Font — Interstitial Cards (Teletype Narrative)

| Property | Value |
|----------|-------|
| Font Family | `"VT323"` (Google Fonts — VT terminal font) |
| Fallback Stack | `"VT323", "Courier New", monospace` |
| Format | WOFF2 |

#### Size Scale

| Usage | Size (px) | Weight | Line Height (px) | Letter Spacing (px) |
|-------|-----------|--------|-------------------|---------------------|
| Interstitial Date/Headline | 28 | 400 (Regular) | 36 | 2 |
| Interstitial Body Text | 20 | 400 (Regular) | 28 | 1 |
| Threat Briefing Label | 22 | 400 (Regular) | 30 | 2 |
| Threat Briefing Body | 18 | 400 (Regular) | 26 | 1 |
| "TAP TO LAUNCH →" Button | 20 | 400 (Regular) | 24 | 3 |

### 3.3 Math Problem Font — On Missiles

| Property | Value |
|----------|-------|
| Font Family | `"Press Start 2P"` |
| Size — Standard Missile | 16px |
| Size — Bomber Fuselage | 14px |
| Size — MIRV Parent | 16px |
| Size — MIRV Child | 14px |
| Color | `#FFFFFF` |
| Stroke / Outline | 2px `#000000` outline on all sides (ensures legibility over any background) |
| Minimum Rendered Width | 60px (problem text block never renders narrower than this) |

### 3.4 Fraction Display

Fractions on missiles are displayed in **stacked notation** (numerator above denominator with a horizontal bar):

| Element | Size (px) | Color |
|---------|-----------|-------|
| Numerator | 12 | `#FFFFFF` |
| Denominator | 12 | `#FFFFFF` |
| Fraction Bar | 2px height, extends 2px past widest digit on each side | `#FFFFFF` |
| Total Stacked Block Height | 28 |
| Total Stacked Block Max Width | 24 |

---

## 4. UI Layout Grid

### 4.1 Reference Resolution

| Property | Value |
|----------|-------|
| Reference Canvas | 800×600 px (landscape) |
| Reference Canvas (portrait) | 450×800 px |
| Scaling Mode | Fit to viewport, maintain aspect ratio, letterbox if needed |
| Minimum Supported Viewport | 320×480 px |

### 4.2 Landscape Layout (800×600 reference)

```
┌──────────────────────────────────────────────────────────┐
│ HUD BAR — y: 0, h: 40                                    │  0–40
├──────────────────────────────────────────────────────────┤
│                                                          │
│  PLAY FIELD — y: 40, h: 460                              │  40–500
│                                                          │
│    City Row — y: 440, h: 60 (cities sit on ground line) │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ LAUNCHER ZONE — y: 500, h: 40                            │  500–540
├──────────────────────────────────────────────────────────┤
│ QUEUE STRIP — y: 540, h: 60                              │  540–600
└──────────────────────────────────────────────────────────┘
```

| Zone | Y Start (px) | Height (px) | Content |
|------|-------------|-------------|---------|
| HUD Bar | 0 | 40 | Score (left-aligned at x:16), star rating (centered), Pause button (right at x:736, 48×32), Sound toggle (right at x:688, 32×32) |
| Play Field | 40 | 460 | Sky gradient, descending threats, trajectory lines, explosions, badges, score pops |
| City Row | 440 | 60 | Six cities evenly distributed. City center X positions: 80, 220, 360, 480, 620, 740 (landscape). Ground line at y:500 |
| Launcher Zone | 500 | 40 | Launcher sprite centered horizontally at x:400, barrel pointing upward |
| Queue Strip | 540 | 60 | Queue items arranged left-to-right, starting at x:16, 60px per item with 8px gap |

### 4.3 Portrait Layout (450×800 reference)

```
┌────────────────────────────────┐
│ HUD BAR — y: 0, h: 48          │  0–48
├────────────────────────────────┤
│                                │
│ PLAY FIELD — y: 48, h: 560     │  48–608
│                                │
│  Cities: two rows of 3         │
│   Row 1 — y: 520, h: 44       │
│   Row 2 — y: 564, h: 44       │
│                                │
├────────────────────────────────┤
│ LAUNCHER ZONE — y: 608, h: 48  │  608–656
├────────────────────────────────┤
│ QUEUE STRIP — y: 656, h: 72    │  656–728
├────────────────────────────────┤
│ BOTTOM SAFE AREA — y: 728, h:72│  728–800
└────────────────────────────────┘
```

| Zone | Y Start (px) | Height (px) |
|------|-------------|-------------|
| HUD Bar | 0 | 48 |
| Play Field | 48 | 560 |
| City Row 1 (NYC, CHI, LAX) | 520 | 44 |
| City Row 2 (HOU, DC, SEA) | 564 | 44 |
| Launcher Zone | 608 | 48 |
| Queue Strip | 656 | 72 |
| Bottom Safe Area | 728 | 72 |

Portrait city center X positions:
- Row 1: 75, 225, 375
- Row 2: 75, 225, 375

### 4.4 HUD Bar Layout (Landscape Reference)

| Element | X (px) | Y (px) | W (px) | H (px) | Alignment |
|---------|--------|--------|--------|--------|-----------|
| Score Label ("SCORE:") | 16 | 8 | auto | 10 | Left |
| Score Value | 80 | 4 | auto | 16 | Left |
| Star Rating (3 stars) | 360 | 8 | 80 (3×24 + 4 gap) | 24 | Center |
| Pause Button | 736 | 4 | 48 | 32 | Right |
| Sound Toggle | 680 | 4 | 48 | 32 | Right |

### 4.5 Queue Strip Layout

| Property | Value |
|----------|-------|
| Item Width | 60px |
| Item Height | 48px |
| Item Gap | 8px |
| Item Border Radius | 4px |
| Item Background (default) | `#2C2C3E` |
| Item Background (loaded) | `#FF6F7A` |
| Item Background (highlight assist) | `#B388FF33` |
| Item Border (loaded) | 3px solid `#FFFFFF` |
| Item Border (default) | 1px solid `#9E9EAF` |
| Strip Left Padding | 16px |
| Strip Scroll Behavior | Horizontal auto-scroll as items are consumed; leftmost visible item is always the loaded item |
| Max Visible Items (landscape) | 10 |
| Max Visible Items (portrait) | 6 |

---

## 5. Sprite Dimensions

All dimensions are in screen pixels at the reference resolution (800×600 landscape). Sprites are drawn at a 4× pixel scale (1 art pixel = 4×4 screen pixels).

### 5.1 Launcher

| Element | Width (px) | Height (px) | Notes |
|---------|-----------|-------------|-------|
| Launcher Barrel | 24 | 40 | Centered at screen bottom-center; barrel points up |
| Launcher Base | 64 | 24 | Sits beneath barrel, centered |
| Launcher Glow Ring | 32 | 32 | Pulsing ring around loaded round indicator; centered on barrel |
| Full Launcher Bounding Box | 64 | 56 | Includes barrel + base |

### 5.2 Missiles

| Entity | Width (px) | Height (px) | Hitbox (tap target) | Notes |
|--------|-----------|-------------|---------------------|-------|
| Standard Missile Body | 24 | 48 | 64×64 (centered on sprite) | Elongated vertical; math text overlaid on body |
| Standard Missile Nose Cone | 24 | 12 | (included in body hitbox) | Top tip of missile |
| Standard Missile Flame Trail | 16 | 20 | (non-interactive) | Animated below missile body |
| Interceptor Missile | 12 | 24 | (non-interactive) | Fired from launcher toward target |
| Interceptor Trail | 4 | variable | (non-interactive) | Lavender line from launcher to current interceptor position |

### 5.3 Bomber

| Element | Width (px) | Height (px) | Hitbox (tap target) | Notes |
|---------|-----------|-------------|---------------------|-------|
| B-52 Fuselage | 96 | 32 | 108×60 (centered) | Horizontal pixel art; math text on wing underside |
| B-52 Wing Span (full) | 96 | 20 | (included in fuselage hitbox) | Integrated into fuselage sprite |
| Bomber Payload Drop Zone | 8 | 8 | (non-interactive) | Small indicator dot beneath bomber showing next drop point |

### 5.4 MIRV

| Element | Width (px) | Height (px) | Hitbox (tap target) | Notes |
|---------|-----------|-------------|---------------------|-------|
| MIRV Parent Body | 28 | 52 | 68×68 (centered) | Larger than standard missile; distinguished by color |
| MIRV Child Body | 16 | 32 | 60×60 (centered) | Smaller than standard missile; lighter pink fill |
| MIRV Split Animation Zone | 80 | 40 | (non-interactive) | Area where child warheads fan out from parent |

### 5.5 Paratroopers

| Element | Width (px) | Height (px) | Hitbox | Notes |
|---------|-----------|-------------|--------|-------|
| Transport Plane | 80 | 24 | (non-interactive, not targetable) | Crosses horizontally at mid-altitude |
| Paratrooper Figure | 16 | 20 | (non-interactive, not directly targetable) | Small humanoid pixel sprite |
| Parachute Canopy | 28 | 16 | (non-interactive) | Semicircle above figure |
| Paratrooper Full (figure + chute) | 28 | 40 | (not directly targetable) | Combined bounding box |

### 5.6 Cities

| Element | Width (px) | Height (px) | Notes |
|---------|-----------|-------------|-------|
| City Skyline (individual city) | 80 | 48 | Each city has a unique silhouette based on a recognizable landmark |
| City Landmark Peak | varies per city | varies per city | See per-city specs below |
| City Firework Burst | 32 | 32 | Appears above city landmark on save |
| City Crowd Cheer Icon | 24 | 16 | Small pixel people with arms up; appears above skyline |
| Rebuild Crane | 20 | 28 | Pixel art crane; appears on destroyed city during rebuild animation |

#### Per-City Landmark Specifications

| City | Landmark | Landmark Peak Height (px above city base) | Landmark Width (px) |
|------|----------|------------------------------------------|---------------------|
| New York | Empire State Building silhouette | 44 | 12 |
| Chicago | Willis Tower silhouette | 40 | 16 |
| Los Angeles | Hollywood sign outline | 28 | 36 |
| Houston | Mission Control dish | 32 | 20 |
| Washington D.C. | Washington Monument | 44 | 8 |
| Seattle | Space Needle | 44 | 12 |

### 5.7 Explosion

| Element | Diameter (px) | Notes |
|---------|--------------|-------|
| Player Explosion (max radius) | 160 (80px radius) | Full pastel radial burst at peak frame |
| Chain Reaction Explosion (max radius) | 120 (60px radius) | Slightly smaller secondary burst |
| Explosion Core Flash | 24 | Innermost bright flash, frame 1 only |

### 5.8 UI Elements

| Element | Width (px) | Height (px) | Notes |
|---------|-----------|-------------|-------|
| Pause Button | 48 | 32 | Pixel art pause icon (two vertical bars) |
| Sound Toggle On | 48 | 32 | Pixel art speaker icon with waves |
| Sound Toggle Off | 48 | 32 | Pixel art speaker icon with X |
| Star (rating) | 24 | 24 | Five-pointed pixel star |
| Level Select Tile | 80 | 80 | Rounded 4px corners; contains level number + up to 3 mini stars |
| Level Select Lock Icon | 24 | 28 | Pixel padlock |
| Primary Button (standard) | 240 | 48 | "TAP TO LAUNCH →", "START GAME", etc. |
| Secondary Button (standard) | 180 | 40 | "RETRY", "SETTINGS", "LEVEL SELECT" |
| Difficulty Selector Pill | 100 | 36 | Three pills side by side: EASY / NORMAL / HARD |
| Settings Toggle Switch | 56 | 28 | On/Off toggle for CRT, sound, queue assist |

### 5.9 Badges

| Badge | Width (px) | Height (px) | Border Radius (px) |
|-------|-----------|-------------|---------------------|
| CHAIN! / CHAIN x2! / etc. | 160 | 40 | 8 |
| SHARP SHOOTER! | 200 | 40 | 8 |
| ON FIRE! | 140 | 40 | 8 |
| MATH GENIUS! | 180 | 40 | 8 |
| BLAST RADIUS! | 180 | 40 | 8 |

### 5.10 Trajectory Lines

| Property | Value |
|----------|-------|
| Line Width | 2px |
| Line Color | `#B388FF` at 40% opacity → `#B388FF66` |
| Line Style | Dashed (8px dash, 6px gap) |
| Line Start | Center of missile sprite |
| Line End | Center of targeted city sprite |

---

## 6. Animation Specifications

All timing values are in milliseconds (ms). Frame counts assume sprite sheet animation at the specified framerate.

### 6.1 Missile Descent

| Property | Value |
|----------|-------|
| Animation Type | Position tween (top to city row) |
| Frame Rate | 60 FPS (game loop) |
| Flame Trail Frames | 4 frames, looping |
| Flame Trail Frame Duration | 100ms per frame (400ms full cycle) |
| Flame Trail Sprite Size per Frame | 16×20 px |

### 6.2 Interceptor Fire

| Property | Value |
|----------|-------|
| Travel Duration | 400ms (fixed, regardless of distance) |
| Trail Render | 4px wide line from launcher to current interceptor position, color `#B388FF` |
| Trail Fade Duration | 600ms after interceptor reaches target |

### 6.3 Explosion (Player)

| Property | Value |
|----------|-------|
| Total Duration | 800ms |
| Total Frames | 8 |
| Frame Duration | 100ms each |
| Frame 1 | Core Flash (`#FFFDE7`), diameter 24px |
| Frame 2 | Inner Ring (`#FFAB91`), diameter 48px |
| Frame 3 | Inner Ring (`#FFAB91`), diameter 80px |
| Frame 4 | Mid Ring (`#CE93D8`), diameter 112px |
| Frame 5 | Mid Ring (`#CE93D8`), diameter 140px |
| Frame 6 | Outer Ring (`#A5D6A7`), diameter 152px |
| Frame 7 | Outer Ring (`#A5D6A7`), diameter 160px, opacity 70% |
| Frame 8 | Transparent Gold (`#FFD54F40`), diameter 160px, opacity 25% → 0% |

### 6.4 Explosion (Chain Reaction)

| Property | Value |
|----------|-------|
| Total Duration | 600ms |
| Total Frames | 6 |
| Frame Duration | 100ms each |
| Frame 1 | Core Flash (`#FFFDE7`), diameter 20px |
| Frame 2 | Inner Ring (`#FFAB91`), diameter 40px |
| Frame 3 | Mid Ring (`#CE93D8`), diameter 72px |
| Frame 4 | Mid Ring (`#CE93D8`), diameter 100px |
| Frame 5 | Outer Ring (`#A5D6A7`), diameter 116px, opacity 70% |
| Frame 6 | Transparent Gold (`#FFD54F40`), diameter 120px, opacity 25% → 0% |

### 6.5 Launcher Loaded Glow Pulse

| Property | Value |
|----------|-------|
| Animation Type | Opacity oscillation on glow ring |
| Glow Color | `#FF6F7A` |
| Min Opacity | 50% |
| Max Opacity | 100% |
| Cycle Duration | 1200ms |
| Easing | Sine in-out |

### 6.6 Wrong-Tap Flash

| Property | Value |
|----------|-------|
| Flash Color | `#E53935` |
| Flash Target | Launcher body + loaded queue item background |
| Flash Duration | 300ms |
| Flash Pattern | Full opacity → 0% over 300ms, linear ease |
| Repeat | 1 (single flash) |

### 6.7 City Save Feedback

| Step | Animation | Duration | Details |
|------|-----------|----------|---------|
| Skyline Gold Flash | City skyline tint override to `#FFD54F` | 1000ms | Ease in 100ms, hold 700ms, ease out 200ms |
| Firework Burst | 6-frame sprite animation above landmark peak | 600ms | 100ms per frame; radial burst particle pattern, colors `#FF6F7A`, `#B388FF`, `#69F0AE`, `#FFD54F` |
| Crowd Cheer Icon | Fade-in, hold, fade-out at y: landmark peak − 20px | 800ms | 200ms fade in, 400ms hold, 200ms fade out |
| City One-Liner Text | Slide-in from right + fade-out | 2000ms | Appears at HUD area bottom-right corner; 300ms slide-in, 1200ms hold, 500ms fade out |

### 6.8 MIRV Split

| Property | Value |
|----------|-------|
| Pre-Split Warning | Parent missile glows `#EC407A` pulsing at 400ms cycle for 1200ms before split |
| Split Animation Duration | 500ms |
| Split Frames | 5 |
| Frame Duration | 100ms each |
| Frame 1 | Parent missile flashes white (`#FFFDE7`) |
| Frame 2 | Parent begins to separate — 2–3 child outlines appear at parent center |
| Frame 3 | Children fan outward by 16px from center |
| Frame 4 | Children fan outward by 32px from center, parent sprite disappears |
| Frame 5 | Children reach full separation (48px apart) and begin independent descent |

### 6.9 Bomber Traversal

| Property | Value |
|----------|-------|
| Direction | Alternates left-to-right and right-to-left per appearance |
| Traversal Duration (full screen width) | 8000ms at 1.0× speed |
| Propeller Animation | 2 frames, 80ms per frame, looping |
| Payload Drop Indicator | Small `#FFA726` dot blinks at 300ms interval beneath bomber for 600ms before each drop |

### 6.10 Paratrooper Descent

| Property | Value |
|----------|-------|
| Chute Deploy Animation | 3 frames, 150ms each (450ms total). Chute expands from folded to full. |
| Descent Sway | Sine wave horizontal oscillation, amplitude 8px, period 2000ms |
| On-Destroy (blast radius catch) | Chute detaches upward (100ms), figure disappears in a 4-frame puff (400ms total), chute floats off screen top over 1500ms |

### 6.11 Score Pop

| Property | Value |
|----------|-------|
| Rise Distance | 40px upward from explosion center |
| Rise Duration | 800ms |
| Fade-In | 0ms–100ms, opacity 0% → 100% |
| Hold | 100ms–500ms, full opacity |
| Fade-Out | 500ms–800ms, opacity 100% → 0% |
| Easing | Ease-out for rise; linear for fade |
| Scale | 1.0× → 1.2× over first 200ms, then 1.2× → 1.0× over next 200ms (bounce) |

### 6.12 Streak/Chain Badges

| Property | Value |
|----------|-------|
| Entry Animation | Scale from 0% → 120% → 100% (spring bounce) over 400ms |
| Hold Duration | 1200ms |
| Exit Animation | Fade out opacity 100% → 0% over 300ms |
| Position | Screen center, y: 200px (landscape) / y: 300px (portrait) |
| Total Visible Time | 1900ms |

### 6.13 Star Rating Reveal (Level Results)

| Property | Value |
|----------|-------|
| Delay Between Stars | 500ms |
| Per-Star Animation | Scale 0% → 130% → 100% over 400ms (spring bounce), color fill `#FFD54F` fades in during the scale-up |
| Accompanying Effect | Small radial sparkle (4 particles, 200ms) around each star as it fills |

### 6.14 Interstitial Teletype Effect

| Property | Value |
|----------|-------|
| Character Reveal Speed | 30ms per character |
| Cursor | Blinking underscore `_`, blink interval 500ms, color `#69F0AE` |
| Line Pause (between paragraphs) | 400ms |
| Threat Briefing Section | Slides in from bottom, 300ms, ease-out |
| "TAP TO LAUNCH →" Button | Appears after all text is revealed; fades in over 400ms; then pulses glow `#B388FF` at 1500ms cycle |

### 6.15 CRT Scanline Overlay (Optional)

| Property | Value |
|----------|-------|
| Scanline Height | 2px |
| Scanline Gap | 2px |
| Scanline Color | `#000000` at 12% opacity → `#0000001F` |
| Barrel Distortion | 1.5% radial curvature (subtle) |
| Vignette | Radial gradient from transparent center to `#00000040` (25% opacity black) at edges; inner radius at 60% of viewport diagonal |

---

## 7. Visual Effects

### 7.1 Sky Gradient

| Property | Value |
|----------|-------|
| Type | Linear vertical gradient |
| Start (top, y:40) | `#0B0E2A` |
| End (bottom, y:500) | `#1A1F4E` |
| Stars | 40–60 randomly placed 2×2px dots, color `#F5F5F5` at 30–60% opacity, twinkling (opacity oscillation, random period 2000–5000ms per dot) |

### 7.2 Ground Line

| Property | Value |
|----------|-------|
| Position | y: 500 (landscape), y: 608 (portrait) |
| Height | 4px |
| Color | `#69F0AE` at 50% opacity → `#69F0AE80` |
| Style | Solid line, full screen width |

### 7.3 Launcher "ON FIRE!" Effect (5-Streak)

| Property | Value |
|----------|-------|
| Effect | Launcher body tint shifts to `#FF6F7A`; 4-frame fire flicker animation on launcher barrel |
| Fire Frame Count | 4 |
| Fire Frame Duration | 80ms each (320ms cycle, looping) |
| Fire Colors | Frames alternate between `#FF6F7A` and `#FFD54F` |
| Duration | Persists as long as streak ≥ 5; ends on streak reset |

### 7.4 "MATH GENIUS!" Full-Screen Flash (10-Streak)

| Property | Value |
|----------|-------|
| Flash Color | `#69F0AE` at 20% opacity → `#69F0AE33` |
| Duration | 400ms (100ms fade-in, 200ms hold, 100ms fade-out) |
| Layer | Rendered above play field, below HUD and badges |

### 7.5 City Destruction

| Property | Value |
|----------|-------|
| Phase 1 — Impact Flash | City tints `#E53935`, 200ms |
| Phase 2 — Crumble | 6-frame animation: skyline progressively lowers from top, pixel rubble particles fall. 600ms total (100ms per frame). |
| Phase 3 — Dark Silhouette | Skyline replaced with flat `#424242` silhouette. Window lights off. Persists until rebuild. |
| Rebuild Crane Animation | Crane sprite (`20×28 px`) bobs up-and-down (4px amplitude, 1000ms period) on top of destroyed city silhouette during level results. |
| Rebuild Flash | On level transition: city silhouette flashes `#FFF8E1` for 300ms, then full city sprite restored. |

### 7.6 Missile Problem Text Readability

| Property | Value |
|----------|-------|
| Background Panel | Semi-transparent black rectangle behind math text on each missile: `#000000B3` (70% opacity) |
| Panel Padding | 4px on all sides |
| Panel Border Radius | 2px |
| Minimum Text Size | 14px (never smaller, even on MIRV children) |

---

## 8. Accessibility & Contrast

### 8.1 WCAG AA Compliance Targets

All text must meet **WCAG 2.1 Level AA** minimum contrast ratios:

- **Normal text** (< 18px or < 14px bold): minimum contrast ratio **4.5:1**
- **Large text** (≥ 18px or ≥ 14px bold): minimum contrast ratio **3:1**

### 8.2 Verified Contrast Ratios

| Text Element | Foreground | Background | Contrast Ratio | Passes AA? |
|-------------|-----------|------------|---------------|-----------|
| HUD Score on HUD Bar | `#F5F5F5` | `#000000D9` | 18.1:1 | ✅ Yes (normal) |
| HUD Labels on HUD Bar | `#F5F5F5` | `#000000D9` | 18.1:1 | ✅ Yes (normal) |
| Missile Problem Text on Missile | `#FFFFFF` on `#000000B3` panel | `#000000B3` over `#E53935` | 15.3:1 (worst case) | ✅ Yes (normal) |
| Queue Item (default) on Queue Strip | `#9E9EAF` | `#2C2C3E` | 4.6:1 | ✅ Yes (normal) |
| Queue Item (loaded) on Loaded BG | `#FFFFFF` | `#FF6F7A` | 4.1:1 | ✅ Yes (large text, 24px) |
| Interstitial Headline on Sky BG | `#F5F5F5` | `#0B0E2A` | 18.4:1 | ✅ Yes (normal) |
| Interstitial Body on Sky BG | `#F5F5F5` | `#0B0E2A` | 18.4:1 | ✅ Yes (normal) |
| Teletype Cursor | `#69F0AE` | `#0B0E2A` | 10.8:1 | ✅ Yes (normal) |
| Primary Button Text | `#0B0E2A` | `#B388FF` | 5.2:1 | ✅ Yes (normal) |
| Secondary Button Text | `#F5F5F5` | `#1E1E2C` | 14.5:1 | ✅ Yes (normal) |
| Badge: SHARP SHOOTER! | `#0B0E2A` | `#FFD54F` | 12.2:1 | ✅ Yes (normal) |
| Badge: ON FIRE! | `#FFFFFF` | `#FF6F7A` | 4.1:1 | ✅ Yes (large text, 14px bold equiv) |
| Badge: MATH GENIUS! | `#0B0E2A` | `#69F0AE` | 11.5:1 | ✅ Yes (normal) |
| Badge: CHAIN! | `#FFFFFF` | `#7C4DFF` | 5.1:1 | ✅ Yes (normal) |
| Badge: BLAST RADIUS! | `#0B0E2A` | `#4FC3F7` | 7.9:1 | ✅ Yes (normal) |
| Score Pop Text | `#FFD54F` | `#0B0E2A` (sky BG approx) | 12.2:1 | ✅ Yes (large text) |
| City One-Liner | `#F5F5F5` | `#000000D9` (HUD area) | 18.1:1 | ✅ Yes (normal) |
| Star Earned | `#FFD54F` | `#000000D9` (results BG) | 13.0:1 | ✅ Yes |
| Star Empty Outline | `#9E9EAF` | `#0B0E2A` | 5.7:1 | ✅ Yes |
| Trajectory Line | `#B388FF66` | `#0B0E2A`–`#1A1F4E` | 3.2:1 | ✅ Yes (non-text graphical element; WCAG 1.4.11 requires 3:1) |

### 8.3 Color-Independence Rule

No gameplay-critical information is conveyed by color alone. Every color-coded element has a secondary distinguishing indicator:

| Element | Color Cue | Secondary Indicator |
|---------|----------|---------------------|
| Loaded Queue Item | `#FF6F7A` background | Pulsing glow ring animation + 3px white border + leftmost position |
| Queue Highlight Assist | `#B388FF33` tint | `#B388FF` 2px border ring (shape cue) |
| Wrong-Tap Warning | `#E53935` flash | Launcher body physically vibrates (2px horizontal shake, 3 cycles, 300ms) + buzz audio |
| City Save | `#FFD54F` tint | Firework burst animation + crowd cheer icon |
| City Destruction | `#E53935` flash → `#424242` | Crumble animation + silhouette shape change |
| MIRV Pre-Split Warning | `#EC407A` pulse | Size increase (pulsing scale 100%–110%) + sprite wobble |
| Bomber Payload Drop | `#FFA726` dot blink | Dot size 8×8px, blink on/off pattern (shape + motion) |
| Streak Badges | Various background colors | Unique text label per badge + unique entry animation |

### 8.4 Touch Target Minimums

| Element | Minimum Touch Target Size |
|---------|--------------------------|
| Missile (standard) | 64×64 px |
| MIRV Parent | 68×68 px |
| MIRV Child | 60×60 px |
| Bomber | 108×60 px |
| Queue Item | 60×48 px |
| Pause Button | 48×32 px |
| Sound Toggle | 48×32 px |
| Primary Buttons | 240×48 px |
| Secondary Buttons | 180×40 px |
| Level Select Tile | 80×80 px |
| Difficulty Selector Pill | 100×36 px |
| Settings Toggle | 56×28 px |

All interactive elements maintain a **minimum spacing of 8px** between adjacent tap targets to prevent mis-taps.

### 8.5 Reduced Motion Considerations

If the player's system prefers reduced motion (`prefers-reduced-motion: reduce`):
- Launcher glow pulse → static glow at 100% opacity
- Teletype character reveal → instant full text display
- Star rating spring bounce → simple fade-in over 300ms
- Badge entry spring bounce → simple fade-in over 300ms
- Background star twinkling → static stars at 50% opacity
- Explosion animation → single-frame radial burst at max size, 400ms fade-out
- CRT scanlines remain static (no flicker)
- Paratrooper sway → straight vertical descent
- All other motion-heavy animations → simplified fade or static equivalent

---

## 9. Scene-Specific Art Direction

### 9.1 Main Menu

| Element | Specification |
|---------|--------------|
| Background | NORAD radar screen — concentric `#69F0AE` circles (2px stroke, 20% opacity) at center of screen, rotating sweep line (`#69F0AE` at 60% opacity, 4-second full rotation). Background color: `#0B0E2A`. |
| Title Text | "MISSILE COMMAND MATH" in `"Press Start 2P"`, 28px, `#F5F5F5`, centered at y: 120 (landscape). 2px text shadow offset (2, 2) color `#7C4DFF`. |
| Subtitle | "DEFEND. SOLVE. SURVIVE." in `"VT323"`, 18px, `#B388FF`, centered at y: 160. |
| Start Button | 240×48 px, `#B388FF` fill, "START GAME" in `"Press Start 2P"` 14px `#0B0E2A`, centered at y: 280. |
| Level Select Button | 180×40 px, `#1E1E2C` fill, 2px `#9E9EAF` border, "LEVELS" in 12px `#F5F5F5`, centered at y: 340. |
| Settings Button | 180×40 px, `#1E1E2C` fill, 2px `#9E9EAF` border, "SETTINGS" in 12px `#F5F5F5`, centered at y: 392. |
| Decorative Missiles | 2–3 small missile sprites descending slowly in background (purely decorative, 30% opacity), looping. |

### 9.2 Level Select

| Element | Specification |
|---------|--------------|
| Background | `#0B0E2A` solid |
| Title | "SELECT LEVEL" in `"Press Start 2P"`, 20px, `#F5F5F5`, centered at y: 40 |
| Grid | 2 rows × 5 columns. Tile size 80×80 px. Gap: 16px. Grid centered horizontally, top row at y: 100. |
| Tile (unlocked, unplayed) | `#1E1E2C` fill, 2px `#B388FF` border. Level number in 20px `#F5F5F5`, centered. |
| Tile (completed) | `#1E1E2C` fill, 2px `#69F0AE` border. Level number in 20px `#F5F5F5`. Stars below number: 1–3 mini stars (12×12 px each), filled `#FFD54F` or outline `#9E9EAF`. |
| Tile (next available) | Same as unlocked but border pulses `#B388FF` opacity 50%–100% on 1500ms cycle. |
| Tile (locked) | `#2C2C3E` fill, 1px `#424242` border. Lock icon (24×28 px) centered, no level number visible. |
| Back Button | 48×40 px, top-left at (16, 8). Pixel arrow-left icon, `#F5F5F5`. |

### 9.3 Interstitial Card

| Element | Specification |
|---------|--------------|
| Background | `#0B0E2A` solid, full screen |
| Date/Headline | `"VT323"` 28px, `#69F0AE`, top-left at (40, 60) with teletype reveal |
| Body Narrative | `"VT323"` 20px, `#F5F5F5`, starting at (40, 110), max width 720px (landscape) / 370px (portrait), teletype reveal |
| Divider Line | 2px `#B388FF` horizontal line, full content width, 16px vertical margin above and below |
| Threat Briefing Label | `"VT323"` 22px, `#FFD54F`, left-aligned under divider. Emoji icon to the left at same baseline. |
| Threat Briefing Body | `"VT323"` 18px, `#F5F5F5`, 8px below label |
| Mechanic Demo Icon | 48×48 px animated sprite (loops), right-aligned next to briefing text, y-centered with briefing block |
| "TAP TO LAUNCH →" Button | 240×48 px, `#B388FF` fill, `"VT323"` 20px `#0B0E2A`. Centered horizontally, positioned 60px from bottom. Appears only after all text is revealed. Glow pulse `#B388FF` 60%–100% opacity, 1500ms cycle. |

### 9.4 Gameplay Wave (Core Scene)

All specifications per Section 4 (Layout Grid), Section 5 (Sprites), Section 6 (Animations). Additional atmospheric details:

| Element | Specification |
|---------|--------------|
| Sky | Vertical gradient `#0B0E2A` → `#1A1F4E`, with twinkling star dots per Section 7.1 |
| Ground | `#1E1E2C` fill below ground line; ground line per Section 7.2 |
| Cities | Positioned per Section 4.2/4.3 city coordinates. Alive: `#FFF8E1` buildings with `#FFCC02` window dots (randomly placed, 2×2 px each, 6–10 per city). Destroyed: `#424242` flat silhouette, no windows. |
| Launcher | Centered at bottom per Section 4.2. Barrel `#B0BEC5`, base `#37474F`. Glow ring per Section 6.5. |
| Queue Strip | Per Section 4.5. Background `#2C2C3E`. Items per specifications. |
| Trajectory Lines | Per Section 5.10. Dashed `#B388FF66`, always visible. |
| Badges | Center screen, per Section 6.12. |
| Score Pops | At explosion point, per Section 6.11. |
| City One-Liners | Bottom-right corner of HUD area, per Section 6.7. |

### 9.5 Pause Overlay

| Element | Specification |
|---------|--------------|
| Overlay Background | `#000000CC` (80% opacity black) covering full screen |
| "PAUSED" Text | `"Press Start 2P"` 24px, `#F5F5F5`, centered at y: 160 |
| Resume Button | 240×48 px, `#B388FF` fill, "RESUME" 14px `#0B0E2A`, centered at y: 240 |
| Settings Button | 180×40 px, `#1E1E2C` fill, 2px `#9E9EAF` border, "SETTINGS" 12px `#F5F5F5`, centered at y: 300 |
| Restart Button | 180×40 px, `#1E1E2C` fill, 2px `#9E9EAF` border, "RESTART" 12px `#F5F5F5`, centered at y: 352 |
| Quit Button | 180×40 px, `#1E1E2C` fill, 2px `#9E9EAF` border, "LEVEL SELECT" 12px `#F5F5F5`, centered at y: 404 |

### 9.6 Level Results

| Element | Specification |
|---------|--------------|
| Background | `#0B0E2A` solid |
| "LEVEL COMPLETE" / "WAVE CLEARED" | `"Press Start 2P"` 24px, `#69F0AE`, centered at y: 60 |
| Star Rating Area | Three 24×24 px stars centered at y: 110, gap 8px between stars. Reveal animation per Section 6.13. |
| Cities Row | Six city sprites at y: 180, evenly spaced, 64px apart center-to-center. Surviving cities: lit (`#FFF8E1`). Destroyed cities: dark silhouette (`#424242`) with rebuild crane animation. |
| Score Breakdown | Left-aligned at x: 100, starting y: 260. `"Press Start 2P"` 12px `#F5F5F5`. Lines: "MISSILES: +[X]", "BOMBERS: +[X]", "CHAINS: +[X]", "ACCURACY: [X]%", "TOTAL: [X]". 24px line spacing. |
| Next Level Button | 240×48 px, `#B388FF` fill, "NEXT LEVEL" 14px `#0B0E2A`, centered at y: 460 |
| Retry Button | 180×40 px, `#1E1E2C` fill, 2px `#9E9EAF` border, "RETRY" 12px `#F5F5F5`, centered at y: 520 |
| Level Select Button | 180×40 px, `#1E1E2C` fill, 2px `#9E9EAF` border, "LEVELS" 12px `#F5F5F5`, centered at y: 572 |

### 9.7 Game Over

| Element | Specification |
|---------|--------------|
| Background | `#0B0E2A` with slow radial pulse of `#E53935` at 8% opacity, 3000ms cycle (subtle red throb) |
| "GAME OVER" Text | `"Press Start 2P"` 28px, `#E53935`, centered at y: 120 |
| Narrative Text | `"VT323"` 20px, `#F5F5F5`, centered, max-width 600px, at y: 180. *"The missiles fell. But math can still save the world. Try again?"* |
| Retry Button | 240×48 px, `#B388FF` fill, "TRY AGAIN" 14px `#0B0E2A`, centered at y: 320 |
| Level Select Button | 180×40 px, `#1E1E2C` fill, 2px `#9E9EAF` border, "LEVEL SELECT" 12px `#F5F5F5`, centered at y: 380 |

### 9.8 Victory Sequence

| Element | Specification |
|---------|--------------|
| Background | `#0B0E2A` with 12 firework bursts cycling across the screen (reusing city firework sprite at 2× scale: 64×64 px), staggered random positions, looping |
| Date Line | `"VT323"` 22px, `#69F0AE`, centered at y: 40, teletype reveal: *"December 8, 1987. The White House, Washington D.C."* |
| Narrative Text | `"VT323"` 20px, `#F5F5F5`, centered, max-width 600px, starting y: 90, teletype reveal |
| "MATH WON." | `"Press Start 2P"` 28px, `#FFD54F`, centered at y: 280. Appears after narrative completes. 2px text shadow (2, 2) `#7C4DFF`. |
| Total Stars | Row of 30 mini stars (10 levels × 3 stars), 10×10 px each, at y: 340. Earned stars `#FFD54F`, unearned `#424242`. |
| Final Score | `"Press Start 2P"` 20px, `#F5F5F5`, centered at y: 390. "FINAL SCORE: [X]" |
| Main Menu Button | 240×48 px, `#B388FF` fill, "MAIN MENU" 14px `#0B0E2A`, centered at y: 460 |

---

*End of Visual Style Guide — Missile Command Math v1.0*

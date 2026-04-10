# Visual Style Guide — Missile Command Math

## Visual Anchors

| Reference File | Key Observations | Decisions Driven |
|----------------|-----------------|-----------------|
| Gameplay.jpg | Gold CRT bezel (rounded rect, ~12px stroke); lavender playfield interior (#D4C8E8); three bombs in distinct colors (orange, teal, magenta) with gold dashed trails; problems in serif font beside bombs; three bag-launchers at base with white circle answer badge; HUD below bezel | COLOR_BG, COLOR_CRT_BEZEL, COLOR_PLAYFIELD, bomb color palette, launcher color palette, trail style, HUD position |
| Launcher_and_Bomb.jpg | Launcher: rounded bell/bag silhouette, orange fill, small nozzle on top, white oval badge with gold answer number; Bomb: elongated teardrop, pointed nose, gold band near tip, dark brown outline; both have subtle drop shadows | SPRITE: launcher, SPRITE: bomb, launcher badge proportions, bomb body proportions |
| Missle.jpg | Counter-missile: red rounded-nose rocket, yellow band mid-body, flat teal fins at base; flat fill shapes, no outlines; travels up toward bomb | SPRITE: projectile, projectile color (red/yellow/teal) |
| Explosion.jpg | Starburst with bright white-yellow core, orange spike rays (8–10 spikes), small grey smoke puffs; math problem lingers in orange serif beside burst; gold dotted trail upper-left | SPRITE: explosion, COLOR_EXPLOSION_CORE, COLOR_EXPLOSION_RAY, smoke puff color, Visual Effects timing |
| City_Scape.jpg | Buildings: coral, sky-blue, peach flat rectangles with small gold/tan window squares; thin teal ground line; intact city is warm and clean | SPRITE: building_intact, COLOR_BUILDING_CORAL, COLOR_BUILDING_BLUE, COLOR_BUILDING_PEACH, COLOR_GROUND_LINE |
| City_Destroyed_01.jpg | Same pastel buildings cracking apart; orange starburst at crack points; grey smoke puffs; flying brick debris (coral-colored rectangles); lavender BG confirmed | SPRITE: building_damaged, SPRITE: building_destroyed, destruction particle colors |
| City_Destroyed_02.jpg | CRT bezel clearly gold (#C8952A approx), rounded corners ~40px radius; destroyed buildings still in pastel palette; orange ember sparks in smoke columns | COLOR_CRT_BEZEL exact value, bezel corner radius, COLOR_SMOKE |
| Heads_Up_Display.jpg | HUD: lavender bg, all-caps warm gold monospace text, pipe separators, no icons; "POPULATION REMAINING 255,706 \| MISSILES REMAINING 3 \| LEVEL 4" | COLOR_HUD_TEXT, TEXT_HUD font/size/weight, HUD layout |
| Bomber.jpg | Flat bomber: olive-green fuselage (#7A8C4A), tan/khaki wings (#C8A878), red tail fin (#D94040), pink engine nacelles (#E899A8), light blue cockpit glass (#A8D4E8); dark brown outline ~3px; travels left-to-right | SPRITE: bomber, all bomber sub-region colors |

---

## Color Palette

| Token | Hex | Usage | Source |
|-------|-----|-------|--------|
| COLOR_BG | #C8B8DC | Canvas background outside CRT frame | Gameplay.jpg — lavender surround |
| COLOR_PLAYFIELD | #E8E0F0 | Interior of CRT frame | City_Scape.jpg — pale lavender interior wash |
| COLOR_CRT_BEZEL | #C8952A | CRT rounded-rect border stroke | City_Destroyed_02.jpg — warm gold bezel |
| COLOR_GROUND_LINE | #4A8A9A | Thin horizon line at base of playfield | City_Scape.jpg — teal ground line |
| COLOR_BUILDING_CORAL | #E8766A | Building type A — left cluster | City_Scape.jpg |
| COLOR_BUILDING_BLUE | #8BBDD9 | Building type B — center cluster | City_Scape.jpg |
| COLOR_BUILDING_PEACH | #F2B89A | Building type C — right cluster | City_Scape.jpg |
| COLOR_WINDOW | #C8A84A | Window squares on buildings | City_Scape.jpg — gold/tan window fills |
| COLOR_SMOKE | #9A9A9A | Smoke puff particles (destruction, explosion) | City_Destroyed_01.jpg |
| COLOR_DEBRIS | #D96858 | Flying brick debris particles | City_Destroyed_01.jpg — coral brick pieces |
| COLOR_EXPLOSION_CORE | #FFFAAA | Explosion starburst center | Explosion.jpg — white-yellow hot core |
| COLOR_EXPLOSION_RAY | #F07020 | Explosion spike rays | Explosion.jpg — orange spike rays |
| COLOR_EXPLOSION_OUTER | #F0A000 | Mid-ring of starburst between core and rays | Explosion.jpg |
| COLOR_TRAIL | #C8A060 | Dashed trajectory trail behind bombs | Gameplay.jpg — gold dashes |
| COLOR_BOMB_ORANGE | #E8701A | Bomb variant 1 body | Gameplay.jpg / Launcher_and_Bomb.jpg |
| COLOR_BOMB_TEAL | #2D7A8C | Bomb variant 2 body | Gameplay.jpg |
| COLOR_BOMB_MAGENTA | #A0306A | Bomb variant 3 body | Gameplay.jpg |
| COLOR_BOMB_GOLD_BAND | #F0C030 | Nose band on all bomb variants | Launcher_and_Bomb.jpg |
| COLOR_BOMB_OUTLINE | #4A2808 | Dark brown outline on bombs | Launcher_and_Bomb.jpg |
| COLOR_LAUNCHER_ORANGE | #E8851A | Launcher 1 (left) body | Gameplay.jpg |
| COLOR_LAUNCHER_TEAL | #2D7A8C | Launcher 2 (center) body | Gameplay.jpg |
| COLOR_LAUNCHER_MAGENTA | #A0306A | Launcher 3 (right) body | Gameplay.jpg |
| COLOR_LAUNCHER_BADGE | #FFFFFF | White oval badge on launcher face | Launcher_and_Bomb.jpg |
| COLOR_LAUNCHER_NUMBER | #C8A040 | Gold answer number on launcher badge | Launcher_and_Bomb.jpg |
| COLOR_PROJECTILE_BODY | #E03030 | Counter-missile red body | Missle.jpg |
| COLOR_PROJECTILE_BAND | #F0D020 | Yellow band on counter-missile | Missle.jpg |
| COLOR_PROJECTILE_FIN | #3A90B0 | Teal fins on counter-missile | Missle.jpg |
| COLOR_BOMBER_FUSELAGE | #7A8C4A | Bomber main body green | Bomber.jpg |
| COLOR_BOMBER_WING | #C8A878 | Bomber wings tan/khaki | Bomber.jpg |
| COLOR_BOMBER_TAIL | #D94040 | Bomber tail fin red | Bomber.jpg |
| COLOR_BOMBER_NACELLE | #E899A8 | Bomber engine nacelles pink | Bomber.jpg |
| COLOR_BOMBER_COCKPIT | #A8D4E8 | Bomber cockpit glass blue | Bomber.jpg |
| COLOR_BOMBER_OUTLINE | #4A2808 | Bomber dark brown outline | Bomber.jpg — ~3px outline on all parts |
| COLOR_HUD_TEXT | #C8952A | HUD monospace text | Heads_Up_Display.jpg — warm gold type |
| COLOR_HUD_BG | #C8B8DC | HUD bar background | Heads_Up_Display.jpg — matches BG lavender |
| COLOR_MATH_TEXT | #E8701A | Math problem text beside bombs | Explosion.jpg / Gameplay.jpg — orange serif |
| COLOR_WRONG_FLASH | #E03030 | Launcher flash on wrong tap | Brief §Wrong-Answer Firing |
| COLOR_CITY_CELEBRATE | #F0C030 | City skyline gold flash on save | Brief §City Save Feedback |

---

## WCAG Contrast Checks

| Foreground | Background | Ratio | Pass AA? |
|-----------|-----------|-------|---------|
| #C8952A (HUD text) | #C8B8DC (HUD bg) | 3.1:1 | No — increase to bold 18px+ (AA Large passes at 3:1) |
| #FFFFFF (launcher badge) | #E8851A (launcher orange) | 4.6:1 | Yes |
| #FFFFFF (launcher badge) | #2D7A8C (launcher teal) | 5.2:1 | Yes |
| #FFFFFF (launcher badge) | #A0306A (launcher magenta) | 7.1:1 | Yes |
| #C8A040 (answer number) | #FFFFFF (badge) | 4.5:1 | Yes (borderline — minimum 32px bold required) |
| #E8701A (math text) | #E8E0F0 (playfield) | 3.4:1 | No — use bold weight + minimum 24px per GDD; large text AA passes |
| #4A2808 (bomb outline) | #E8701A (bomb orange) | 5.8:1 | Yes |
| #C8952A (star rating) | #E8E0F0 (playfield) | 3.1:1 | Large text (28px+) only |

> **Note:** Math text on bombs and HUD text both rely on large-text AA (≥ 18px bold or ≥ 24px regular per WCAG 1.4.3 large-text exception). All bomb math problems must be ≥ 24px bold and launcher answer numbers ≥ 32px bold to satisfy WCAG AA under the large-text rule.

---

## Typography

| Style Token | Font Family | Size (px) | Weight | Color Token | Usage |
|------------|------------|-----------|--------|------------|-------|
| TEXT_HUD | `'Courier New', Courier, monospace` | 18 | 700 | COLOR_HUD_TEXT | HUD bar — population, missiles, level |
| TEXT_MATH_PROBLEM | `Georgia, 'Times New Roman', serif` | 28 | 700 | COLOR_MATH_TEXT | Math problem beside bomb |
| TEXT_LAUNCHER_ANSWER | `Georgia, 'Times New Roman', serif` | 32 | 700 | COLOR_LAUNCHER_NUMBER | Answer number on launcher badge |
| TEXT_SCORE_POP | `Georgia, 'Times New Roman', serif` | 26 | 700 | COLOR_EXPLOSION_OUTER | Score pop (+10, +25) floating up from explosion |
| TEXT_STREAK_BADGE | `'Courier New', Courier, monospace` | 20 | 700 | #FFFFFF | "SHARP SHOOTER!", "ON FIRE!", "MATH GENIUS!" |
| TEXT_TITLE | `Georgia, 'Times New Roman', serif` | 48 | 700 | COLOR_CRT_BEZEL | Main menu game title |
| TEXT_BRIEFING_HEADER | `Georgia, 'Times New Roman', serif` | 32 | 700 | COLOR_CRT_BEZEL | Briefing card operation name banner |
| TEXT_BRIEFING_BODY | `Georgia, 'Times New Roman', serif` | 20 | 400 | #5A3A1A | Briefing card body text / tips |
| TEXT_BUTTON | `'Courier New', Courier, monospace` | 20 | 700 | COLOR_CRT_BEZEL | "TAP TO LAUNCH →", menu buttons |
| TEXT_LEVEL_READY | `'Courier New', Courier, monospace` | 28 | 700 | COLOR_CRT_BEZEL | "LEVEL X — READY?" prompt |
| TEXT_CITY_ONELINER | `'Courier New', Courier, monospace` | 16 | 400 | COLOR_HUD_TEXT | City save one-liner in HUD corner |

---

## Sprite Specifications

| Asset ID | Width (px) | Height (px) | Frames | Frame Duration (ms) | Visual Description |
|---------|-----------|------------|--------|-------------------|--------------------|
| launcher_orange | 80 | 90 | 1 | — | Rounded bell/bag silhouette, COLOR_LAUNCHER_ORANGE fill, dark brown outline 3px. Small cylindrical nozzle (12×14px) on top-center. White oval badge (48×44px) centered on front face. Gold answer number (TEXT_LAUNCHER_ANSWER) inside badge. Subtle cast shadow: ellipse beneath base, 60×12px, rgba(0,0,0,0.18). Flat vector style, no gradient. |
| launcher_teal | 80 | 90 | 1 | — | Identical silhouette to launcher_orange; fill COLOR_LAUNCHER_TEAL. White badge, gold number. |
| launcher_magenta | 80 | 90 | 1 | — | Identical silhouette to launcher_orange; fill COLOR_LAUNCHER_MAGENTA. White badge, gold number. |
| launcher_flash | 80 | 90 | 2 | 80 | Frame 0: launcher body filled COLOR_WRONG_FLASH. Frame 1: normal launcher color. Used for wrong-tap flash animation. |
| bomb_orange | 36 | 64 | 1 | — | Elongated teardrop: rounded nose top, tapers to blunt point at bottom. COLOR_BOMB_ORANGE fill. 3px COLOR_BOMB_OUTLINE stroke. Horizontal gold band (COLOR_BOMB_GOLD_BAND, 8px tall) 14px from top. Width 36px at widest, total height 64px. Flat fill, no gradient. |
| bomb_teal | 36 | 64 | 1 | — | Same shape as bomb_orange; fill COLOR_BOMB_TEAL, outline COLOR_BOMB_OUTLINE, gold band same. |
| bomb_magenta | 36 | 64 | 1 | — | Same shape as bomb_orange; fill COLOR_BOMB_MAGENTA, outline COLOR_BOMB_OUTLINE, gold band same. |
| projectile | 24 | 48 | 1 | — | Rocket: rounded nose top 24px wide, body tapers slightly to base. COLOR_PROJECTILE_BODY fill. COLOR_PROJECTILE_BAND horizontal stripe 8px tall at 60% height. Two flat delta fins at base: each fin 10px wide × 14px tall, COLOR_PROJECTILE_FIN. Flat fill shapes, no outlines. Total 24×48px. |
| explosion | 160 | 160 | 6 | 80 | Starburst centered in 160×160 canvas. Frame 0: 8-spike star, core radius 16px COLOR_EXPLOSION_CORE, ray length 56px COLOR_EXPLOSION_RAY, 3 grey smoke puffs (24px circles, COLOR_SMOKE) at 10/4/8 o'clock positions. Frames 1–4: starburst expands (core +6px/frame, rays +8px/frame), smoke puffs drift outward +6px/frame and fade opacity. Frame 5: all fades to transparent. Solved equation text overlaid externally by GameScene — not baked into sprite. |
| building_intact_a | 48 | 96 | 1 | — | Flat rectangle, COLOR_BUILDING_CORAL fill, no outline. 3×3 grid of window squares (8×8px each, COLOR_WINDOW, 6px gap) centered on face. Proportions: w48 × h96 (tall slab). |
| building_intact_b | 64 | 80 | 1 | — | Flat rectangle, COLOR_BUILDING_BLUE fill. 2×3 window grid (8×8px, COLOR_WINDOW). Wider shorter form: w64 × h80. |
| building_intact_c | 40 | 56 | 1 | — | Flat rectangle, COLOR_BUILDING_PEACH fill. 2×2 window grid (8×8px, COLOR_WINDOW). Small building: w40 × h56. |
| building_damaged | 64 | 96 | 3 | 120 | Frame 0: intact building (random a/b/c type). Frame 1: diagonal crack lines (3px, #2A1A0A) bisecting the face, 2–3 brick debris particles flying (8×5px rectangles, COLOR_DEBRIS) at edges. Frame 2: building leaning 8deg, crack wider, smoke puff (COLOR_SMOKE, 32px circle) rising from top. |
| building_destroyed | 48 | 40 | 1 | — | Crumbled rubble pile: irregular low silhouette ≤40px tall, COLOR_BUILDING_CORAL / COLOR_BUILDING_BLUE / COLOR_BUILDING_PEACH fragments. 2–3 small smoke wisp circles (20px, COLOR_SMOKE, 40% opacity) above pile. Flat illustrative style. |
| bomber | 128 | 56 | 4 | 120 | Side-view flat aircraft facing right. Fuselage: rounded rectangle 96×24px, COLOR_BOMBER_FUSELAGE, 3px COLOR_BOMBER_OUTLINE. Wings: tapered trapezoid above and below fuselage, 128px span, COLOR_BOMBER_WING. Tail fin: right-side vertical rectangle 20×28px, COLOR_BOMBER_TAIL. Two engine nacelles under each wing: pill shape 18×10px, COLOR_BOMBER_NACELLE. Cockpit: 3-pane rounded window 24×14px near nose, COLOR_BOMBER_COCKPIT. Propeller frames (4fr): 3-blade spinner on each nacelle rotates 0°/30°/60°/90° per frame. |
| crt_frame | 800 | 520 | 1 | — | Rounded rectangle border only (no fill — playfield shows through). Stroke 14px, COLOR_CRT_BEZEL. Corner radius 40px. Outer size 800×520px. Slight bevel: inner edge 2px lighter (#E0B050), outer edge 2px darker (#A07820). Represents the television screen bezel. |
| ground_line | 760 | 4 | 1 | — | Horizontal line, 4px tall, COLOR_GROUND_LINE fill, full playfield width 760px. Positioned at y=460 inside CRT frame. |
| hud_bar | 800 | 40 | 1 | — | Solid fill rectangle, COLOR_HUD_BG. No border. Houses TEXT_HUD. |
| score_pop | 60 | 30 | 1 | — | Text sprite generated at runtime; shows "+10" / "+25" / "+50" / "+100" in TEXT_SCORE_POP style. No background. |
| streak_badge | 200 | 36 | 1 | — | Pill-shaped banner: COLOR_CRT_BEZEL fill, 18px corner radius. TEXT_STREAK_BADGE white text centered. |
| trajectory_trail_dot | 6 | 10 | 1 | — | Single rounded rectangle dash: 6×10px, COLOR_TRAIL fill, corner radius 3px. Spawned as particles at fixed intervals behind bomb. |
| firework_burst | 80 | 80 | 5 | 60 | Celebratory firework above city. Frame 0: 6 lines radiating from center, 2px, COLOR_CITY_CELEBRATE. Frames 1–4: lines expand outward and fade. Used for city-save and level-complete events. |
| rebuild_crane | 32 | 48 | 4 | 200 | Simple yellow crane silhouette (#F0C030): vertical mast 4×40px, horizontal jib 28×4px at top, cable 2px dangling with small hook. Frame 0–3: hook bobs up 0/4/8/4 px simulating lifting. Plays during city rebuild between levels. |

---

## UI Layout

Canvas dimensions: **800 × 640px** (landscape). Playfield (inside CRT): **760 × 480px**.

| UI Element | X | Y | Width | Height | Anchor |
|-----------|---|---|-------|--------|--------|
| CRT frame (bezel) | 20 | 20 | 800 | 520 | top-left |
| Playfield area | 20 | 20 | 760 | 480 | top-left |
| Ground line | 20 | 476 | 760 | 4 | top-left |
| Left building cluster | 30 | 340 | 240 | 140 | top-left |
| Right building cluster | 510 | 340 | 270 | 140 | top-left |
| Launcher left | 100 | 460 | 80 | 90 | center-bottom |
| Launcher center | 400 | 460 | 80 | 90 | center-bottom |
| Launcher right | 700 | 460 | 80 | 90 | center-bottom |
| HUD bar | 0 | 600 | 800 | 40 | top-left |
| HUD text — population | 20 | 610 | 280 | 20 | top-left |
| HUD text — separator 1 | 305 | 610 | 10 | 20 | top-left |
| HUD text — missiles | 320 | 610 | 200 | 20 | top-left |
| HUD text — separator 2 | 525 | 610 | 10 | 20 | top-left |
| HUD text — level | 540 | 610 | 120 | 20 | top-left |
| Pause button | 760 | 560 | 32 | 32 | top-left |
| Sound toggle | 720 | 560 | 32 | 32 | top-left |

---

## Animations

| Anim Key | Sprite Key | Start Frame | End Frame | Frame Rate (fps) | Repeat | Yoyo | Notes |
|----------|-----------|-------------|-----------|-----------------|--------|------|-------|
| LAUNCHER_WRONG_FLASH | launcher_flash | 0 | 1 | 12 | 2 | false | Plays on wrong-tap; 2 repeats = 4 flashes total |
| EXPLOSION_BURST | explosion | 0 | 5 | 12 | 0 | false | Play once; GameScene overlays solved equation text |
| BUILDING_HIT | building_damaged | 0 | 2 | 8 | 0 | false | Plays when bomb reaches building |
| BOMBER_FLY | bomber | 0 | 3 | 8 | -1 | false | Propeller spin loop while bomber traverses screen |
| FIREWORK_POP | firework_burst | 0 | 4 | 16 | 0 | false | Single pop above saved city or at level complete |
| REBUILD_CRANE_LIFT | rebuild_crane | 0 | 3 | 5 | -1 | true | Yoyo loop — hook bobs up and down during rebuild |

---

## Visual Effects

| Effect | Trigger | Duration (ms) | Parameters |
|--------|---------|--------------|------------|
| Explosion starburst | Bomb intercepted | 480 | Runs EXPLOSION_BURST anim; solved equation fades out at 400ms; scale 1.0→1.4 tween over 480ms |
| Score pop float | Bomb intercepted | 700 | score_pop text: y moves up 60px over 700ms, opacity 1.0→0 over last 300ms; easing: Sine.easeOut |
| City gold flash | Bomb aimed at city is destroyed | 1000 | Building sprites tint COLOR_CITY_CELEBRATE; tint fades to #FFFFFF over 1000ms |
| Wrong-tap flash | Player taps un-matchable bomb | 320 | LAUNCHER_WRONG_FLASH anim on nearest launcher; low buzz audio |
| Streak badge slide-in | 3 / 5 / 10 consecutive intercepts | 1500 | streak_badge slides in from right edge 200px over 300ms; holds 900ms; slides out 300ms |
| Building destruction smoke | Building destroyed | 2000 | 4–6 smoke particles (COLOR_SMOKE, 20px) drift upward from rubble; opacity 0.8→0 over 2000ms |
| Bomb trajectory trail | Bomb spawns and descends | Continuous | trajectory_trail_dot spawned every 120ms at bomb origin position; each dot fades opacity 1.0→0 over 600ms |
| City rebuild | Between levels | 3000 | rebuild_crane appears over each destroyed building; REBUILD_CRANE_LIFT plays; at 3000ms building snaps back to building_intact sprite; crane fades out |
| Level-complete fireworks | All bombs destroyed | 2000 | firework_burst spawned above each surviving building with 150ms stagger; repeats 2× |
| Bomber engine trail | Bomber traverses screen | Continuous | Small smoke dots (6px, COLOR_SMOKE, 60% opacity) emitted from each nacelle every 80ms; fade over 400ms |

---

## Animation Timing

- Target frame rate: **60 fps** (Phaser `physics.arcade` default)
- Sprite sheet animations: 8–16 fps (see Animations table per asset)
- Easing convention: all UI tweens use `Phaser.Math.Easing.Sine.easeOut` unless noted
- Particle counts: explosion = max 12 smoke particles; building destruction = max 6 smoke particles; trajectory trail = max 8 active dots per bomb
- Reduced-motion preference: when `prefers-reduced-motion: reduce` detected, disable all particle effects and skip tween animations; keep only sprite frame changes
- Bomber traversal duration: 4000ms at Normal difficulty (traverses full 800px canvas width)
- Launcher reload visual: nozzle scales from 1.0→0.8→1.0 over 300ms (punch-down tween) on fire
```

# Visual Style Guide — Missile Command Math

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| COLOR_BG | #0A0A0F | Canvas background (near-black, slight blue tint) |
| COLOR_BG_HUD | #0D0D1A | HUD bar background |
| COLOR_BG_QUEUE | #0D1A0D | Answer queue strip background |
| COLOR_BG_INTERSTITIAL | #000814 | Interstitial card overlay background |
| COLOR_PRIMARY | #E8F4E8 | Primary UI text (off-white, low eye-strain) |
| COLOR_MATH_TEXT | #FFFFFF | Math problem text on missile bodies |
| COLOR_QUEUE_LOADED | #FFD700 | Currently loaded answer — queue highlight glow |
| COLOR_QUEUE_MATCH | #7FFFB2 | Queue items that match a visible incoming problem |
| COLOR_QUEUE_SPENT | #3A3A3A | Already-fired queue rounds (greyed out) |
| COLOR_QUEUE_PENDING | #B0C4B0 | Upcoming queue rounds (unmatched, unspent) |
| COLOR_MISSILE_BODY | #CC2200 | Incoming enemy missile body |
| COLOR_MISSILE_TRAIL | #FF6633 | Incoming missile exhaust trail |
| COLOR_DEFENDER | #00AAFF | Outgoing defensive missile |
| COLOR_TRAJECTORY | #FF4422 | Trajectory line from missile to city (semi-transparent at 40% alpha) |
| COLOR_EXPLOSION_CORE | #FFFFFF | Explosion core flash |
| COLOR_EXPLOSION_MID | #FFD700 | Explosion mid-ring (warm gold) |
| COLOR_EXPLOSION_OUTER | #C89BFF | Explosion outer ring (lavender pastel) |
| COLOR_EXPLOSION_ALT | #98FFD0 | Alternate explosion ring (mint pastel) |
| COLOR_CITY_ACTIVE | #FFD700 | City skyline — alive, gold-lit |
| COLOR_CITY_DESTROYED | #2A2A2A | City skyline — destroyed silhouette |
| COLOR_CITY_CELEBRATE | #FFF0A0 | City flash color on city-save event |
| COLOR_LAUNCHER | #00FF88 | Launcher base phosphor green |
| COLOR_LAUNCHER_LOCK | #FF3300 | Launcher flash on wrong-tap |
| COLOR_LAUNCHER_STREAK | #FF7700 | Launcher glow at 5-streak (orange) |
| COLOR_BOMBER | #AABBCC | Bomber fuselage (steel grey-blue) |
| COLOR_PARATROOPER | #FFCC44 | Paratrooper figure (warm amber) |
| COLOR_MIRV_CHILD | #FF88AA | MIRV child warhead (pink — distinct from parent) |
| COLOR_SCORE_POP | #FFD700 | Score pop-up float text |
| COLOR_BADGE_TEXT | #0A0A0F | Badge label text (dark on bright bg) |
| COLOR_BADGE_BG | #FFD700 | Streak / chain badge background |
| COLOR_STAR_FULL | #FFD700 | Filled star in rating display |
| COLOR_STAR_EMPTY | #3A3A3A | Empty star in rating display |
| COLOR_WARNING_RED | #FF2200 | Wrong-tap flash, city-loss flash |
| COLOR_SCANLINE | #000000 | CRT scanline overlay (8% alpha, off by default) |
| COLOR_TELETYPE | #00FF88 | Interstitial teletype text (phosphor green) |
| COLOR_BUTTON_BG | #1A3A1A | "TAP TO LAUNCH" button background |
| COLOR_BUTTON_TEXT | #00FF88 | "TAP TO LAUNCH" button label |
| COLOR_BUTTON_BORDER | #00FF88 | "TAP TO LAUNCH" button border |

## WCAG Contrast Checks

| Foreground | Background | Ratio | Pass AA? |
|------------|------------|-------|----------|
| #FFFFFF (COLOR_MATH_TEXT) | #CC2200 (COLOR_MISSILE_BODY) | 5.1:1 | Yes |
| #E8F4E8 (COLOR_PRIMARY) | #0D0D1A (COLOR_BG_HUD) | 14.2:1 | Yes |
| #FFFFFF (COLOR_MATH_TEXT) | #0A0A0F (COLOR_BG) | 20.8:1 | Yes |
| #FFD700 (COLOR_QUEUE_LOADED) | #0D1A0D (COLOR_BG_QUEUE) | 12.4:1 | Yes |
| #7FFFB2 (COLOR_QUEUE_MATCH) | #0D1A0D (COLOR_BG_QUEUE) | 14.9:1 | Yes |
| #B0C4B0 (COLOR_QUEUE_PENDING) | #0D1A0D (COLOR_BG_QUEUE) | 8.3:1 | Yes |
| #0A0A0F (COLOR_BADGE_TEXT) | #FFD700 (COLOR_BADGE_BG) | 14.8:1 | Yes |
| #00FF88 (COLOR_TELETYPE) | #000814 (COLOR_BG_INTERSTITIAL) | 14.3:1 | Yes |
| #00FF88 (COLOR_BUTTON_TEXT) | #1A3A1A (COLOR_BUTTON_BG) | 7.6:1 | Yes |
| #FFD700 (COLOR_SCORE_POP) | #0A0A0F (COLOR_BG) | 13.1:1 | Yes |
| #FFFFFF (COLOR_MATH_TEXT) | #000814 (COLOR_BG_INTERSTITIAL) | 21.0:1 | Yes |
| #FFD700 (COLOR_CITY_ACTIVE) | #0A0A0F (COLOR_BG) | 13.1:1 | Yes |
| #00AAFF (COLOR_DEFENDER) | #0A0A0F (COLOR_BG) | 5.7:1 | Yes |

## Typography

| Style Token | Font Family | Size (px) | Weight | Color Token | Usage |
|-------------|-------------|-----------|--------|-------------|-------|
| TEXT_HUD_SCORE | "Press Start 2P", monospace | 14 | 400 | COLOR_PRIMARY | Score display in HUD bar |
| TEXT_HUD_STARS | "Press Start 2P", monospace | 12 | 400 | COLOR_STAR_FULL | Live star rating in HUD |
| TEXT_MISSILE_PROBLEM | "Press Start 2P", monospace | 18 | 400 | COLOR_MATH_TEXT | Math problem on missile body |
| TEXT_QUEUE_NUMBER | "Press Start 2P", monospace | 16 | 400 | COLOR_QUEUE_PENDING | Answer numbers in queue strip |
| TEXT_QUEUE_LOADED | "Press Start 2P", monospace | 18 | 400 | COLOR_QUEUE_LOADED | Currently loaded queue answer |
| TEXT_SCORE_POP | "Press Start 2P", monospace | 16 | 400 | COLOR_SCORE_POP | Floating score pop-up (+10, +25…) |
| TEXT_BADGE | "Press Start 2P", monospace | 13 | 400 | COLOR_BADGE_TEXT | Streak/chain badge labels |
| TEXT_CITY_ONELINER | "Press Start 2P", monospace | 10 | 400 | COLOR_CITY_CELEBRATE | City save one-liner HUD corner |
| TEXT_INTERSTITIAL_DATE | "Press Start 2P", monospace | 11 | 400 | COLOR_TELETYPE | Teletype date/headline on cards |
| TEXT_INTERSTITIAL_BODY | "Press Start 2P", monospace | 10 | 400 | COLOR_PRIMARY | Interstitial narrative body text |
| TEXT_MECHANIC_LABEL | "Press Start 2P", monospace | 10 | 400 | COLOR_QUEUE_LOADED | "NEW THREAT:" / "NEW MATH:" label |
| TEXT_BUTTON | "Press Start 2P", monospace | 14 | 400 | COLOR_BUTTON_TEXT | "TAP TO LAUNCH →" button |
| TEXT_TITLE | "Press Start 2P", monospace | 22 | 400 | COLOR_LAUNCHER | Main menu game title |
| TEXT_MENU_ITEM | "Press Start 2P", monospace | 13 | 400 | COLOR_PRIMARY | Menu items (difficulty, level select) |
| TEXT_LEVEL_COMPLETE | "Press Start 2P", monospace | 18 | 400 | COLOR_QUEUE_LOADED | "LEVEL COMPLETE" header |
| TEXT_GAME_OVER | "Press Start 2P", monospace | 20 | 400 | COLOR_WARNING_RED | "GAME OVER" header |
| TEXT_TRAINING_GUIDE | "Press Start 2P", monospace | 12 | 400 | COLOR_QUEUE_MATCH | Training wave instruction overlay |
| TEXT_STREAK_LABEL | "Press Start 2P", monospace | 14 | 400 | COLOR_BADGE_TEXT | "SHARP SHOOTER!" / "ON FIRE!" etc. |

## Sprite Specifications

| Asset ID | Width (px) | Height (px) | Frames | Frame Duration (ms) | Notes |
|----------|-----------|------------|--------|---------------------|-------|
| SPRITE_MISSILE_STANDARD | 16 | 40 | 2 | 200 | Alternating flame frames on tail; COLOR_MISSILE_BODY body |
| SPRITE_MISSILE_MIRV_PARENT | 20 | 48 | 2 | 200 | Slightly wider than standard; same color scheme |
| SPRITE_MISSILE_MIRV_CHILD | 12 | 28 | 2 | 150 | COLOR_MIRV_CHILD; smaller/faster flicker |
| SPRITE_MISSILE_DEFENDER | 8 | 24 | 2 | 100 | COLOR_DEFENDER body; bright exhaust trail |
| SPRITE_BOMBER | 80 | 28 | 4 | 120 | B-52 silhouette; left/right variants (h-flip); engine shimmer |
| SPRITE_BOMBER_MISSILE | 10 | 28 | 2 | 200 | Smaller than standard; drops vertically from bomber |
| SPRITE_PARATROOPER_PLANE | 64 | 22 | 3 | 150 | Transport silhouette; left/right variants (h-flip) |
| SPRITE_PARATROOPER | 14 | 28 | 4 | 200 | Canopy open/sway loop; COLOR_PARATROOPER figure |
| SPRITE_PARATROOPER_EXIT | 14 | 28 | 1 | — | Static exit frame used at drop moment |
| SPRITE_LAUNCHER_BASE | 48 | 36 | 1 | — | Static; COLOR_LAUNCHER; center-bottom |
| SPRITE_LAUNCHER_BARREL | 12 | 28 | 1 | — | Rotates toward target before firing; separate layer |
| SPRITE_LAUNCHER_FLASH | 48 | 36 | 3 | 80 | Wrong-tap red flash; COLOR_LAUNCHER_LOCK tint |
| SPRITE_LAUNCHER_STREAK | 48 | 36 | 4 | 100 | Orange glow pulse at 5-streak; COLOR_LAUNCHER_STREAK |
| SPRITE_EXPLOSION_PLAYER | 96 | 96 | 8 | 80 | Radial burst; core→mid→outer color progression |
| SPRITE_EXPLOSION_CITY | 64 | 64 | 6 | 100 | City-hit explosion; COLOR_WARNING_RED tint |
| SPRITE_EXPLOSION_CHAIN | 80 | 80 | 8 | 70 | Faster, brighter; used for chain-reaction hits |
| SPRITE_CITY_NYC | 64 | 56 | 1 | — | New York skyline silhouette; COLOR_CITY_ACTIVE tint |
| SPRITE_CITY_CHI | 60 | 52 | 1 | — | Chicago skyline silhouette |
| SPRITE_CITY_LAX | 58 | 48 | 1 | — | Los Angeles skyline silhouette |
| SPRITE_CITY_HOU | 56 | 46 | 1 | — | Houston skyline silhouette |
| SPRITE_CITY_DC | 62 | 54 | 1 | — | DC skyline silhouette (Capitol dome) |
| SPRITE_CITY_SEA | 56 | 60 | 1 | — | Seattle skyline silhouette (Space Needle) |
| SPRITE_CITY_CELEBRATE | 64 | 64 | 6 | 100 | Firework burst above city; COLOR_CITY_CELEBRATE |
| SPRITE_CITY_DESTROYED | 64 | 40 | 1 | — | Dark silhouette; COLOR_CITY_DESTROYED |
| SPRITE_CITY_REBUILD | 64 | 56 | 8 | 250 | Crane animation for between-level rebuild |
| SPRITE_FIREWORK_SMALL | 32 | 32 | 6 | 80 | Per-city firework on level complete |
| SPRITE_TRAJECTORY_LINE | — | — | — | — | Rendered via Graphics (no sprite); COLOR_TRAJECTORY at 40% alpha, 1 px |
| SPRITE_QUEUE_SLOT | 60 | 60 | 1 | — | Queue item container; minimum 60×60 touch target |
| SPRITE_QUEUE_LOADED_RING | 60 | 60 | 4 | 150 | Pulsing glow ring around loaded slot |
| SPRITE_STAR_FULL | 24 | 24 | 1 | — | COLOR_STAR_FULL |
| SPRITE_STAR_EMPTY | 24 | 24 | 1 | — | COLOR_STAR_EMPTY |
| SPRITE_PAUSE_ICON | 32 | 32 | 1 | — | HUD pause button; 60×60 touch target |
| SPRITE_SOUND_ICON | 32 | 32 | 2 | — | HUD sound toggle (on/off frames) |
| SPRITE_TRAINING_ARROW | 24 | 32 | 4 | 200 | Blinking arrow used in training wave |

## UI Layout

Canvas: **480 × 854 px** (portrait primary). Landscape reflow targets **854 × 480 px** with HUD on left strip.
Safe area margins: **12 px** all sides.

| UI Element | X | Y | Width | Height | Anchor |
|------------|---|---|-------|--------|--------|
| HUD Bar | 0 | 0 | 480 | 48 | top-left |
| Score Label | 12 | 8 | 160 | 32 | top-left |
| Star Rating | 176 | 10 | 80 | 28 | top-center |
| Pause Button | 388 | 4 | 44 | 40 | top-right (60×60 touch zone) |
| Sound Toggle | 436 | 4 | 32 | 40 | top-right (60×60 touch zone) |
| Play Field | 0 | 48 | 480 | 660 | top-left |
| City Row Top (NYC, CHI, LAX) | 12 | 60 | 456 | 64 | top-left; evenly spaced at x=12,192,372 |
| City Row Bottom (HOU, DC, SEA) | 12 | 580 | 456 | 64 | top-left; evenly spaced at x=12,192,372 |
| Launcher Base | 216 | 730 | 48 | 36 | center (anchor x=240) |
| Queue Strip | 0 | 782 | 480 | 72 | bottom |
| Queue Slot 0 (loaded) | 30 | 787 | 60 | 60 | center of slot |
| Queue Slot 1–5 | 100–460 | 787 | 60 | 60 | spaced 76 px apart |
| Interstitial Overlay | 0 | 0 | 480 | 854 | full-screen |
| Interstitial Card | 24 | 120 | 432 | 560 | center |
| TAP TO LAUNCH Button | 90 | 720 | 300 | 60 | center-bottom of card |
| Badge Overlay | 140 | 380 | 200 | 48 | center-screen |
| Score Pop Origin | — | — | — | — | Spawns at explosion center, floats −60 px Y over 800 ms |
| City One-Liner | 12 | 52 | 280 | 24 | HUD lower-left (below score) — fades after 2000 ms |

## Visual Effects

| Effect | Trigger | Duration (ms) | Parameters |
|--------|---------|---------------|------------|
| Player Explosion Burst | Defensive missile reaches target | 640 | 8 frames × 80 ms; radii: core 16 px, mid 48 px, outer 96 px; colors: core #FFFFFF → mid #FFD700 → outer #C89BFF |
| Chain Explosion Burst | Second+ entity in chain radius | 560 | 8 frames × 70 ms; outer ring COLOR_EXPLOSION_ALT #98FFD0; 80 px radius |
| City Hit Explosion | Missile reaches city | 600 | 6 frames × 100 ms; COLOR_WARNING_RED tint; 64 px radius |
| Score Pop Float | Any points scored | 800 | TEXT_SCORE_POP rises 60 px; alpha 1.0 → 0.0 linear over 800 ms |
| City Gold Flash | City-threatening missile destroyed | 1000 | City sprite tint pulses COLOR_CITY_CELEBRATE; 2 pulses × 500 ms each |
| City Firework | Same trigger as city gold flash | 900 | SPRITE_CITY_CELEBRATE plays once at city top; 6 frames × 100 ms; offsets 0,−32 from city anchor |
| Wrong-Tap Launcher Flash | Loaded answer ≠ tapped missile | 400 | SPRITE_LAUNCHER_FLASH; 3 frames × 80 ms; COLOR_LAUNCHER_LOCK screen-flash at 15% alpha |
| Queue Loaded Pulse | Continuous while loaded | looping | SPRITE_QUEUE_LOADED_RING; 4 frames × 150 ms; scale 1.0→1.1→1.0 per loop |
| Queue Match Highlight | Incoming problem matches queue item | continuous until fired | COLOR_QUEUE_MATCH tint on matching slot; alpha oscillates 0.6→1.0 over 600 ms |
| Streak Glow (×2, 5-streak) | 5 consecutive correct intercepts | looping until break | SPRITE_LAUNCHER_STREAK; 4 frames × 100 ms; COLOR_LAUNCHER_STREAK |
| CHAIN Badge Flash | Chain reaction triggered | 700 | TEXT badge "CHAIN x N" at COLOR_BADGE_TEXT on COLOR_BADGE_BG; scale 0.5→1.2→1.0 over 300 ms; hold 400 ms; fade 0 ms |
| Streak Badge Flash | 3 / 5 / 10 correct streak | 700 | Same badge treatment as CHAIN; text per milestone |
| Math Genius Screen Flash | 10-streak | 500 | Full-canvas rect COLOR_EXPLOSION_OUTER #C89BFF at 20% alpha; fade out over 500 ms |
| MIRV Split Flash | MIRV reaches split altitude | 200 | Bright white ring at 20 px radius expanding to 48 px; alpha 1.0 → 0.0 over 200 ms |
| Trajectory Line Draw | Missile spawns | continuous | Graphics line from missile nose to target city center; COLOR_TRAJECTORY #FF4422 at 40% alpha; 1 px stroke; dashed: 6 px on / 4 px off |
| Paratrooper Neutralised | Caught in blast radius | 400 | SPRITE_PARATROOPER last frame floats up 40 px; alpha 1.0 → 0.0; "BLAST RADIUS!" badge |
| Level Complete Fireworks | All threats cleared | 3000 | 6× SPRITE_FIREWORK_SMALL, one per city position; staggered 200 ms apart |
| City Rebuild Animation | Between-level transition | 2000 | SPRITE_CITY_REBUILD; 8 frames × 250 ms; plays on each destroyed city slot |
| CRT Scanline Overlay | Enabled in settings | continuous | Horizontal lines every 4 px; COLOR_SCANLINE at 8% alpha; off by default |
| Teletype Text Reveal | Interstitial card opens | variable | Characters revealed at 40 ms per character; COLOR_TELETYPE; cursor blink 500 ms |
| Training Arrow Blink | Training wave active | looping | SPRITE_TRAINING_ARROW; 4 frames × 200 ms |

## Animation Timing

- **Target frame rate:** 60 fps (16 ms frame budget)
- **Physics timestep:** Phaser fixed step at 60 fps; missile positions updated each frame
- **Easing convention:** Score pop and badge scale-in use `Phaser.Math.Easing.Back.Out`; alpha fades use `Linear`; launcher barrel rotation uses `Phaser.Math.Easing.Cubic.Out` over 150 ms
- **Explosion particle count:** Player explosion — 12 particles; chain explosion — 16 particles; city hit — 8 particles
- **Queue advance animation:** Loaded slot slides left off-screen over 120 ms (`Cubic.Out`); remaining slots shift left 76 px over 120 ms; new slot enters from right over 120 ms
- **Missile spawn tween:** Scale 0 → 1 over 80 ms (`Back.Out`) at spawn position
- **Bomber entry/exit:** Slides in from screen edge; constant velocity; no easing
- **Paratrooper sway:** Horizontal sine oscillation ±6 px over 1200 ms cycle during descent
- **Reduced-motion mode:** When `prefers-reduced-motion` is detected, all scale tweens and flash effects are replaced with instant cuts; particle counts halved; oscillation disabled

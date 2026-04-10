# Sound Guide — Missile Command Math

## Audio Aesthetic

The sonic world is **1960s educational broadcast meets warm retro arcade** — think Eames-era
documentary stings, classroom filmstrip cues, and early-80s synthesizer bleeps filtered through
a warm CRT television speaker. Instruments lean on marimba-like sine tones, muted brass stabs,
and clean square-wave chiptune leads rather than harsh digital noise.

The emotional register is **bright, encouraging, and gently tense** — never frightening, always
rewarding. A correct answer feels like a small victory broadcast over the airwaves; a mistake is
a gentle nudge, not a punishment. The audio brief in one sentence: *"A friendly mid-century
command-center radio confirming every right answer with a warm chime and every near-miss with a
polite buzz."*

## Library & Implementation

| Decision | Choice | Rationale |
|----------|--------|-----------|
| npm package | `tone@14.x` | Full Web Audio synthesis in-browser; no sample files needed; keeps bundle ≤ 2 MB; excellent scheduling API for musical timing |
| synthesis vs samples | Synthesized only | Eliminates audio asset files; all sounds procedurally generated from oscillators and envelopes; warm retro character via waveform choice |
| AudioContext resume | On first user gesture (tap or click anywhere) | Browser autoplay policy requires user interaction; MenuScene tap triggers `Tone.start()` |
| Web Audio fallback | Silent fail if unsupported | Game is fully playable without audio; all feedback has a visual equivalent per GDD accessibility rules |

## Sound Events

| Event ID | Trigger | Character | Pitch / Notes | Duration (ms) | Volume | Priority | Polyphony |
|----------|---------|-----------|--------------|--------------|--------|----------|-----------|
| BOMB_INTERCEPT_LAUNCH | Player taps a bomb; matching launcher fires projectile | Short upward sine blip — "pew" | C5 → E5 (glide 80ms) | 120 | 0.7 | sfx | 3 |
| BOMB_INTERCEPT_HIT | Projectile reaches bomb; starburst explosion | Two-tone marimba strike: bright knock then warm ring | G5, E5 (8ms apart) | 400 | 0.85 | critical | 3 |
| BOMB_WRONG_TAP | Player taps bomb with no matching launcher loaded | Low buzzer pulse, flat and short | Bb2 square wave | 200 | 0.6 | sfx | 1 |
| LAUNCHER_RELOAD | Launcher finishes reloading after firing | Soft mechanical click-thunk | C3 sine thump | 80 | 0.45 | sfx | 3 |
| BOMB_REACHES_BUILDING | Bomb completes descent and hits a building | Low percussive thud with short rumble | D2 sine, fast decay | 350 | 0.8 | critical | 3 |
| BUILDING_DESTROYED | Building health reaches zero; destruction animation plays | Crumble crash: low thud + debris rattle | C2 noise burst, 3px decay | 600 | 0.8 | critical | 2 |
| CITY_SAVE_CHIME | A bomb aimed at a city is destroyed before impact | Bright ascending 3-note chime | C5, E5, G5 (60ms apart) | 500 | 0.7 | sfx | 2 |
| STREAK_3 | 3 consecutive correct intercepts | Punchy upward sting | E5, G5 (staccato sine) | 300 | 0.7 | sfx | 1 |
| STREAK_5 | 5 consecutive correct intercepts | Brighter two-octave leap sting | C5, C6 (square wave) | 400 | 0.75 | sfx | 1 |
| STREAK_10 | 10 consecutive correct intercepts | Full 4-note fanfare burst | C5, E5, G5, C6 (80ms apart) | 600 | 0.8 | critical | 1 |
| STREAK_RESET | Any miss or wrong-tap resets the streak | Muted downward blip | G4 → D4 (glide 100ms) | 150 | 0.4 | sfx | 1 |
| BOMBER_ALERT | Strategic bomber enters screen (Level 13+) | Rising two-tone alarm, mid-century siren feel | D4, A4 alternating ×3 | 800 | 0.75 | critical | 1 |
| BOMBER_INTERCEPT | Bomber destroyed before all bombs dropped | Big starburst crash + ascending ring | C3 noise burst + C5→G5 ring | 700 | 0.9 | critical | 1 |
| BOMBER_ESCAPED | Bomber crosses screen without being intercepted | Low descending warning tone | G3 → D3 (glide 300ms) | 500 | 0.65 | sfx | 1 |
| BOMB_DROP_FROM_BOMBER | Bomber releases a bomb payload | Short descending whistle | A4 → E4 (glide 150ms) | 200 | 0.6 | sfx | 3 |
| SCORE_POP_TICK | Score pop text spawns after intercept | Tiny bright tick | A5 sine, instant attack | 60 | 0.35 | ui | 6 |
| LEVEL_COMPLETE_FANFARE | All bombs in wave destroyed; star rating reveals | 4-bar marimba + brass stab sting | C4, G4, E5, C5 (arpeggiated, 90ms apart) | 1200 | 0.85 | critical | 1 |
| STAR_REVEAL | Each star pops in during level-complete sequence | Bright single ping per star | E5 / G5 / C6 (one per star) | 200 | 0.7 | ui | 3 |
| FIREWORK_POP | Firework burst above building at level complete | Soft pop fizz | D5 noise burst, fast decay | 180 | 0.5 | sfx | 6 |
| WAVE_START | Wave begins after briefing dismiss or READY prompt | Short low-to-high broadcast sting | F3 → C4 → F4 (100ms each) | 400 | 0.65 | sfx | 1 |
| LEVEL_READY_BEEP | "LEVEL X — READY?" prompt appears | Single broadcast beep | C5 square, 50ms on/off ×2 | 200 | 0.6 | ui | 1 |
| BRIEFING_ENTER | Briefing card slides in (new-op levels) | Soft educational film-strip click | E3 wood-block thump | 120 | 0.5 | ui | 1 |
| BRIEFING_DISMISS | Player taps "TAP TO LAUNCH →" to dismiss | Upward two-note confirm | C4, G4 (40ms apart) | 200 | 0.55 | ui | 1 |
| TRAINING_SUCCESS | First successful intercept in Level 0 | Extended celebratory chime cascade | C5, E5, G5, C6, E6 (80ms apart) | 900 | 0.85 | critical | 1 |
| TRAINING_MISS | Bomb reaches building in training (no damage) | Gentle low buzz, non-punishing | F3 sine, soft attack | 300 | 0.5 | sfx | 1 |
| CITY_REBUILD_TICK | Crane animation plays between levels | Rhythmic mechanical tick × loop | G3 wood-block click, 200ms interval | 80 | 0.35 | sfx | 1 |
| GAME_OVER_STING | All buildings destroyed | Descending minor arpeggio, broadcast sign-off feel | C5, A4, F4, C4 (120ms apart) | 900 | 0.8 | critical | 1 |
| VICTORY_FANFARE | All 20 levels complete; VictoryScene plays | Full ascending brass-style 6-note fanfare | C4, E4, G4, C5, E5, C6 (90ms apart) | 1500 | 0.9 | critical | 1 |
| MENU_BUTTON_CLICK | Any menu button tapped | Soft monophonic click | C4 sine, instant attack | 60 | 0.5 | ui | 2 |
| PAUSE_IN | Game paused | Mid-tone single beep | G4 square, short | 100 | 0.55 | ui | 1 |
| PAUSE_OUT | Game resumed | Two quick ascending beeps | G4, C5 (50ms apart) | 150 | 0.55 | ui | 1 |
| SOUND_TOGGLE | Sound toggled on/off | Short click (plays only on toggle-on) | A4 sine | 80 | 0.6 | ui | 1 |

## Music

| Track ID | Plays When | Style | BPM | Key | Loop? | Layers? | Notes |
|----------|-----------|-------|-----|-----|-------|---------|-------|
| MUSIC_MENU | MenuScene, LevelSelectScene, SettingsScene | Laid-back mid-century lounge; soft marimba melody over slow walking bass | 88 | C major | Yes | No | Light and unhurried; evokes 1960s educational film title card |
| MUSIC_GAMEPLAY_EARLY | GameScene levels 0–8 | Gently pulsing arpeggiated sine chords; sparse percussion | 100 | F major | Yes | Yes — add hi-hat layer at level 5+ | Calm but rhythmically present; gives time to think |
| MUSIC_GAMEPLAY_MID | GameScene levels 9–15 | Brighter square-wave melody with marimba counterpoint; moderate drive | 112 | G major | Yes | Yes — add bass stab layer at level 13 (bomber intro) | Increased urgency without becoming frantic |
| MUSIC_GAMEPLAY_LATE | GameScene levels 16–20 | Faster square-wave lead, punchy bass line, driving rhythm | 126 | A minor | Yes | Yes — full three-layer texture | Maximum tension; still warm-toned, not harsh or dark |
| MUSIC_BRIEFING | BriefingScene, TrainingBriefScene | Quiet single-voice marimba noodle; almost ambient | 76 | C major | Yes | No | Sits behind narration text; should not compete with reading |
| MUSIC_LEVEL_COMPLETE | LevelCompleteScene | Bright short jingle; 8-bar non-looping sting then fade to silence | 120 | C major | No | No | Plays once on entry; star reveal SFX play over it |
| MUSIC_GAME_OVER | GameOverScene | Slow minor-key descending theme; warm not harsh | 72 | A minor | No | No | 8 bars, non-looping; fades to silence; encourages retry |
| MUSIC_VICTORY | VictoryScene | Full multi-voice celebration march; triumphant and warm | 130 | C major | No | No | 16-bar non-looping fanfare; VICTORY_FANFARE SFX fires at bar 1 beat 1 |

## Volume Hierarchy

| Channel | Default Vol | Description |
|---------|------------|-------------|
| master | 1.0 | Global output; controlled by OS / device volume |
| music | 0.45 | Background tracks; kept low so math text stays primary focus |
| sfx | 0.8 | Gameplay sound effects (intercepts, explosions, building hits) |
| ui | 0.6 | Menu and HUD interactions; briefing sounds; score pops |

## Audio Polish Rules

1. **Music crossfade:** When transitioning between music tracks, fade out current track over 600ms and fade in next over 600ms. Never hard-cut between tracks.
2. **Gameplay music selection:** `DifficultyManager` selects MUSIC_GAMEPLAY_EARLY / MID / LATE by level number on wave start; crossfade only at level boundaries, not mid-wave.
3. **Ducking on critical SFX:** When a `critical`-priority event fires, duck the `music` channel to 0.2 volume over 80ms; restore to 0.45 over 400ms after the event ends.
4. **Streak escalation audio:** STREAK_3, STREAK_5, and STREAK_10 each play at a slightly higher pitch register (+2 semitones per tier) to reinforce escalating excitement.
5. **Polyphony enforcement:** If a sound's polyphony cap is reached, the oldest active instance is stopped before the new one plays. No silent drops.
6. **BOMB_INTERCEPT_HIT layering:** BOMB_INTERCEPT_HIT always plays simultaneously with BOMB_INTERCEPT_LAUNCH; they are not mutually exclusive — launch on tap, hit on collision.
7. **Mute on focus loss:** When the browser tab loses focus (`visibilitychange` hidden), set master volume to 0.0 immediately. Restore on focus return.
8. **Sound toggle persistence:** Sound enabled/disabled state is stored in `localStorage` under key `mcm_sound_enabled`; read in BootScene before AudioContext is created.
9. **Reduced-motion + audio:** When `prefers-reduced-motion: reduce` is active, also suppress looping ambient/particle SFX (CITY_REBUILD_TICK, FIREWORK_POP, BOMBER_ENGINE) to reduce sensory load.
10. **Wrong-tap anti-spam:** BOMB_WRONG_TAP has a 500ms cooldown per launcher — repeated wrong taps on the same bomb do not re-trigger the buzz within that window.
11. **Training mode volume:** In Level 0 (TrainingScene), MUSIC_BRIEFING plays throughout instead of any gameplay track; no ducking rules apply.
12. **Bomber alert timing:** BOMBER_ALERT plays at bomber spawn, before the first BOMB_DROP_FROM_BOMBER event; a 400ms gap is enforced between alert end and first drop sound.
13. **Level-complete sequence timing:** MUSIC_LEVEL_COMPLETE starts → 500ms pause → STAR_REVEAL fires once per star at 300ms intervals → FIREWORK_POP fires with each firework_burst sprite.
14. **All synthesis via Tone.js Transport:** All rhythmic/looping music and scheduled SFX use `Tone.Transport` for timing accuracy; one-shot SFX use `Tone.triggerAttackRelease` directly.

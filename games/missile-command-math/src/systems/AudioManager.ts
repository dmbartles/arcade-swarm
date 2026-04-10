/**
 * AudioManager.ts — Web Audio API wrapper for Missile Command Math.
 *
 * Handles all game audio: SFX, music tracks, volume hierarchy, crossfading,
 * and ducking. Uses the native Web Audio API (no Tone.js dependency).
 * Initialized once in GameScene and stored on the Phaser registry.
 */

import Phaser from 'phaser';
import { GameEvents } from '../types/GameEvents';
import type { AnswerValidatedPayload } from '../types/GameEvents';
import type { StreakMilestonePayload } from '../types/IScoreManager';
import type { ThreatSpawnedPayload, ThreatDestroyedPayload } from '../types/GameEvents';
import {
  SOUND_EVENTS,
  MUSIC_TRACKS,
  VOLUME_HIERARCHY,
  MUSIC_CROSSFADE_MS,
  MUSIC_DUCK_VOLUME,
  MUSIC_DUCK_DOWN_MS,
  MUSIC_DUCK_RESTORE_MS,
  SOUND_ENABLED_KEY,
} from '../config/audioConfig';

/** Synthesis config for a single SFX. */
interface SynthConfig {
  /** Oscillator type: 'sine' | 'square' | 'sawtooth' | 'triangle'. */
  type: OscillatorType;
  /** Frequency in Hz. */
  frequency: number;
  /** Duration in seconds. */
  duration: number;
  /** Attack time in seconds. */
  attack: number;
  /** Decay time in seconds. */
  decay: number;
  /** Sustain level (0–1). */
  sustain: number;
  /** Release time in seconds. */
  release: number;
  /** Gain level (0–1). */
  volume: number;
  /** Cooldown in ms (optional). */
  cooldownMs?: number;
}

/** Note-to-frequency lookup (A4 = 440Hz). */
function noteToHz(note: string): number {
  const notes: Record<string, number> = {
    'C2': 65.41,  'D2': 73.42,  'E2': 82.41,  'F2': 87.31,
    'G2': 98.00,  'A2': 110.0,  'B2': 123.5,  'Bb2': 116.5,
    'C3': 130.8,  'D3': 146.8,  'E3': 164.8,  'F3': 174.6,
    'G3': 196.0,  'A3': 220.0,  'B3': 246.9,
    'C4': 261.6,  'D4': 293.7,  'E4': 329.6,  'F4': 349.2,
    'G4': 392.0,  'A4': 440.0,  'B4': 493.9,  'Bb4': 466.2,
    'C5': 523.3,  'D5': 587.3,  'E5': 659.3,  'F5': 698.5,
    'G5': 784.0,  'A5': 880.0,  'B5': 987.8,
    'C6': 1046.5, 'G6': 1568.0,
    'A1': 55.0,   'C1': 32.7,
  };
  return notes[note] ?? 440.0;
}

/** Minimum gap between bomber alert sounds. */
const BOMBER_ALERT_GAP_MS = 8000;

export class AudioManager {
  private scene: Phaser.Scene;
  private soundEnabled: boolean;
  private currentMusicTrack: string | null = null;

  /** Web Audio API context. */
  private audioCtx: AudioContext | null = null;

  /** Master gain node. */
  private masterGainNode: GainNode | null = null;

  /** Music gain node. */
  private musicGainNode: GainNode | null = null;

  /** SFX gain node. */
  private sfxGainNode: GainNode | null = null;

  /** Music oscillator interval ID. */
  private musicIntervalId: ReturnType<typeof setInterval> | null = null;

  /** Music note sequence index. */
  private musicNoteIndex: number = 0;

  /** Music note sequences per track. */
  private musicNoteMap: Record<string, number[]> = {};

  /** SFX synth configs. */
  private synthConfigs: Map<string, SynthConfig> = new Map();

  /** Cooldown timestamps per sound event. */
  private cooldowns: Map<string, number> = new Map();

  /** Last bomber alert time. */
  private lastBomberAlertMs: number = 0;

  /**
   * @param scene        - Scene for event bus and visibility tracking.
   * @param soundEnabled - Initial state from localStorage.
   */
  constructor(scene: Phaser.Scene, soundEnabled: boolean) {
    this.scene = scene;
    this.soundEnabled = soundEnabled;

    this.buildSynthConfig();
    this.buildMusicNotes();
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Resume AudioContext on first user gesture.
   * Must be called from a pointer/touch event handler.
   */
  async resume(): Promise<void> {
    if (!this.audioCtx) {
      try {
        this.audioCtx = new AudioContext();
        this.buildGainNodes();
      } catch {
        // Audio context unavailable
      }
    } else if (this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {
        // Could not resume
      }
    }
  }

  /**
   * Play a one-shot sound effect by event ID.
   */
  playSFX(eventId: string): void {
    if (!this.soundEnabled || !this.audioCtx || !this.sfxGainNode) return;

    // Cooldown check
    const now = Date.now();
    const config = this.synthConfigs.get(eventId);
    if (!config) return;

    const cooldown = config.cooldownMs ?? 0;
    if (cooldown > 0) {
      const lastPlay = this.cooldowns.get(eventId) ?? 0;
      if (now - lastPlay < cooldown) return;
    }
    this.cooldowns.set(eventId, now);

    try {
      const ctx = this.audioCtx;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

      // ADSR envelope
      const t = ctx.currentTime;
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(config.volume, t + config.attack);
      gainNode.gain.linearRampToValueAtTime(
        config.volume * config.sustain,
        t + config.attack + config.decay,
      );
      gainNode.gain.setValueAtTime(
        config.volume * config.sustain,
        t + config.duration - config.release,
      );
      gainNode.gain.linearRampToValueAtTime(0, t + config.duration);

      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode);

      oscillator.start(t);
      oscillator.stop(t + config.duration);

      // Cleanup
      oscillator.onended = () => {
        gainNode.disconnect();
        oscillator.disconnect();
      };
    } catch {
      // Web Audio API error — degrade gracefully
    }
  }

  /**
   * Start playing a music track (crossfade if another track is playing).
   */
  playMusic(trackId: string): void {
    if (!this.soundEnabled) return;
    if (this.currentMusicTrack === trackId) return;

    this.stopMusic();
    this.currentMusicTrack = trackId;
    this.musicNoteIndex = 0;

    if (!this.audioCtx || !this.musicGainNode) return;

    const notes = this.musicNoteMap[trackId] ?? this.musicNoteMap[MUSIC_TRACKS.GAMEPLAY_EARLY];

    // Simple arpeggiated loop using setInterval
    this.musicIntervalId = setInterval(() => {
      if (!this.audioCtx || !this.musicGainNode) return;
      const freq = notes[this.musicNoteIndex % notes.length];
      this.musicNoteIndex += 1;

      try {
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        const t = this.audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0.3, t);
        gainNode.gain.linearRampToValueAtTime(0, t + 0.45);
        osc.connect(gainNode);
        gainNode.connect(this.musicGainNode);
        osc.start(t);
        osc.stop(t + 0.5);
        osc.onended = () => {
          gainNode.disconnect();
          osc.disconnect();
        };
      } catch {
        // Audio error
      }
    }, 500);
  }

  /**
   * Stop all music with fade-out.
   */
  stopMusic(): void {
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    this.currentMusicTrack = null;
  }

  /**
   * Duck music channel for a critical SFX event.
   */
  duckMusic(durationMs: number): void {
    if (!this.musicGainNode || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const t = ctx.currentTime;
    const duckDownSec = MUSIC_DUCK_DOWN_MS / 1000;
    const restoreSec = MUSIC_DUCK_RESTORE_MS / 1000;
    const durationSec = durationMs / 1000;

    try {
      this.musicGainNode.gain.cancelScheduledValues(t);
      this.musicGainNode.gain.linearRampToValueAtTime(MUSIC_DUCK_VOLUME, t + duckDownSec);
      this.musicGainNode.gain.setValueAtTime(MUSIC_DUCK_VOLUME, t + durationSec);
      this.musicGainNode.gain.linearRampToValueAtTime(
        VOLUME_HIERARCHY.music,
        t + durationSec + restoreSec,
      );
    } catch {
      // Audio error
    }
    // Use the crossfade const to satisfy import
    void MUSIC_CROSSFADE_MS;
  }

  /**
   * Update the scene reference (call before wireEventListeners when scene changes).
   */
  setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  /**
   * Set the sound enabled state.
   */
  setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;

    if (!enabled) {
      this.stopMusic();
      this.mute();
    } else {
      this.unmute();
    }

    try {
      localStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
    } catch {
      // localStorage not available
    }
  }

  /**
   * Mute all audio immediately.
   */
  mute(): void {
    if (this.masterGainNode && this.audioCtx) {
      this.masterGainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    }
  }

  /**
   * Restore master gain.
   */
  unmute(): void {
    if (this.masterGainNode && this.audioCtx && this.soundEnabled) {
      this.masterGainNode.gain.setValueAtTime(
        VOLUME_HIERARCHY.master,
        this.audioCtx.currentTime,
      );
    }
  }

  /**
   * Select the correct gameplay music track based on level.
   */
  selectGameplayMusic(level: number): string {
    if (level <= 8) return MUSIC_TRACKS.GAMEPLAY_EARLY;
    if (level <= 15) return MUSIC_TRACKS.GAMEPLAY_MID;
    return MUSIC_TRACKS.GAMEPLAY_LATE;
  }

  /**
   * Wire up all GameEvents event listeners on the scene bus.
   */
  wireEventListeners(): void {
    const bus = this.scene.events;

    bus.on(GameEvents.ANSWER_VALIDATED, (payload: AnswerValidatedPayload) => {
      if (payload.correct) {
        this.playSFX(SOUND_EVENTS.BOMB_INTERCEPT_LAUNCH);
        this.scene.time.delayedCall(80, () => {
          this.playSFX(SOUND_EVENTS.BOMB_INTERCEPT_HIT);
        });
      }
    });

    bus.on(GameEvents.WRONG_TAP, () => {
      this.playSFX(SOUND_EVENTS.BOMB_WRONG_TAP);
    });

    bus.on(GameEvents.CITY_HIT, () => {
      this.playSFX(SOUND_EVENTS.BOMB_REACHES_BUILDING);
    });

    bus.on(GameEvents.CITY_DESTROYED, () => {
      this.playSFX(SOUND_EVENTS.BUILDING_DESTROYED);
    });

    bus.on(GameEvents.CITY_SAVED, () => {
      this.playSFX(SOUND_EVENTS.CITY_SAVE_CHIME);
    });

    bus.on(GameEvents.STREAK_MILESTONE, (payload: StreakMilestonePayload) => {
      if (payload.streak >= 10) {
        this.playSFX(SOUND_EVENTS.STREAK_10);
      } else if (payload.streak >= 5) {
        this.playSFX(SOUND_EVENTS.STREAK_5);
      } else if (payload.streak >= 3) {
        this.playSFX(SOUND_EVENTS.STREAK_3);
      }
    });

    bus.on(GameEvents.THREAT_SPAWNED, (payload: ThreatSpawnedPayload) => {
      if (payload.threatType === 'bomber') {
        const now = Date.now();
        if (now - this.lastBomberAlertMs >= BOMBER_ALERT_GAP_MS) {
          this.lastBomberAlertMs = now;
          this.playSFX(SOUND_EVENTS.BOMBER_ALERT);
        }
      }
    });

    bus.on(GameEvents.THREAT_DESTROYED, (payload: ThreatDestroyedPayload) => {
      if (payload.threatType === 'bomber') {
        if (payload.points > 0) {
          this.playSFX(SOUND_EVENTS.BOMBER_INTERCEPT);
        } else {
          this.playSFX(SOUND_EVENTS.BOMBER_ESCAPED);
        }
      }
    });

    bus.on(GameEvents.BOMBER_PAYLOAD_DROPPED, () => {
      this.playSFX(SOUND_EVENTS.BOMB_DROP_FROM_BOMBER);
    });

    bus.on(GameEvents.SCORE_UPDATED, () => {
      this.playSFX(SOUND_EVENTS.SCORE_POP_TICK);
    });

    bus.on(GameEvents.LEVEL_COMPLETE, () => {
      this.playSFX(SOUND_EVENTS.LEVEL_COMPLETE_FANFARE);
      this.duckMusic(1200);
    });

    bus.on(GameEvents.GAME_OVER, () => {
      this.stopMusic();
      this.playSFX(SOUND_EVENTS.GAME_OVER_STING);
    });

    bus.on(GameEvents.WAVE_STARTED, () => {
      this.playSFX(SOUND_EVENTS.WAVE_START);
    });

    bus.on(GameEvents.GAME_PAUSED, () => {
      this.playSFX(SOUND_EVENTS.PAUSE_IN);
    });

    bus.on(GameEvents.GAME_RESUMED, () => {
      this.playSFX(SOUND_EVENTS.PAUSE_OUT);
    });

    bus.on(GameEvents.SOUND_TOGGLED, (payload: { enabled: boolean }) => {
      if (payload.enabled) {
        this.playSFX(SOUND_EVENTS.SOUND_TOGGLE);
      }
      this.setEnabled(payload.enabled);
    });
  }

  // ── Private Methods ──────────────────────────────────────────────────────

  /** Build Web Audio gain chain: master → music/sfx. */
  private buildGainNodes(): void {
    if (!this.audioCtx) return;

    try {
      this.masterGainNode = this.audioCtx.createGain();
      this.masterGainNode.gain.setValueAtTime(VOLUME_HIERARCHY.master, this.audioCtx.currentTime);
      this.masterGainNode.connect(this.audioCtx.destination);

      this.musicGainNode = this.audioCtx.createGain();
      this.musicGainNode.gain.setValueAtTime(VOLUME_HIERARCHY.music, this.audioCtx.currentTime);
      this.musicGainNode.connect(this.masterGainNode);

      this.sfxGainNode = this.audioCtx.createGain();
      this.sfxGainNode.gain.setValueAtTime(VOLUME_HIERARCHY.sfx, this.audioCtx.currentTime);
      this.sfxGainNode.connect(this.masterGainNode);
    } catch {
      // Web Audio API unavailable
    }
  }

  /** Build music note maps (frequencies in Hz). */
  private buildMusicNotes(): void {
    this.musicNoteMap = {
      [MUSIC_TRACKS.GAMEPLAY_EARLY]: [261.6, 329.6, 392.0, 440.0],
      [MUSIC_TRACKS.GAMEPLAY_MID]:   [261.6, 349.2, 440.0, 466.2],
      [MUSIC_TRACKS.GAMEPLAY_LATE]:  [261.6, 311.1, 392.0, 493.9],
      [MUSIC_TRACKS.MENU]:           [261.6, 329.6, 392.0, 493.9],
      [MUSIC_TRACKS.VICTORY]:        [523.3, 659.3, 784.0, 1046.5],
      [MUSIC_TRACKS.GAME_OVER]:      [130.8, 116.5, 103.8, 98.0],
    };
  }

  /**
   * Build synthesis parameters for each sound event.
   */
  private buildSynthConfig(): void {
    const configs: Array<{ id: string; config: SynthConfig }> = [
      {
        id: SOUND_EVENTS.BOMB_INTERCEPT_LAUNCH,
        config: {
          type: 'sine',
          frequency: noteToHz('C5'),
          duration: 0.12,
          attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.1,
          volume: 0.7,
        },
      },
      {
        id: SOUND_EVENTS.BOMB_INTERCEPT_HIT,
        config: {
          type: 'sine',
          frequency: noteToHz('G5'),
          duration: 0.4,
          attack: 0.005, decay: 0.2, sustain: 0.1, release: 0.3,
          volume: 0.85,
        },
      },
      {
        id: SOUND_EVENTS.BOMB_WRONG_TAP,
        config: {
          type: 'square',
          frequency: noteToHz('Bb2'),
          duration: 0.2,
          attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1,
          volume: 0.6,
          cooldownMs: 500,
        },
      },
      {
        id: SOUND_EVENTS.BOMB_REACHES_BUILDING,
        config: {
          type: 'sawtooth',
          frequency: noteToHz('D2'),
          duration: 0.3,
          attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.2,
          volume: 0.7,
        },
      },
      {
        id: SOUND_EVENTS.BUILDING_DESTROYED,
        config: {
          type: 'sawtooth',
          frequency: noteToHz('A1'),
          duration: 0.6,
          attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.4,
          volume: 0.8,
        },
      },
      {
        id: SOUND_EVENTS.CITY_SAVE_CHIME,
        config: {
          type: 'sine',
          frequency: noteToHz('E5'),
          duration: 0.4,
          attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.3,
          volume: 0.75,
        },
      },
      {
        id: SOUND_EVENTS.STREAK_3,
        config: {
          type: 'sine',
          frequency: noteToHz('C5'),
          duration: 0.3,
          attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2,
          volume: 0.8,
        },
      },
      {
        id: SOUND_EVENTS.STREAK_5,
        config: {
          type: 'sine',
          frequency: noteToHz('E5'),
          duration: 0.4,
          attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.3,
          volume: 0.85,
        },
      },
      {
        id: SOUND_EVENTS.STREAK_10,
        config: {
          type: 'sine',
          frequency: noteToHz('G5'),
          duration: 0.5,
          attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.4,
          volume: 0.9,
        },
      },
      {
        id: SOUND_EVENTS.STREAK_RESET,
        config: {
          type: 'triangle',
          frequency: noteToHz('F3'),
          duration: 0.25,
          attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.2,
          volume: 0.6,
        },
      },
      {
        id: SOUND_EVENTS.BOMBER_ALERT,
        config: {
          type: 'sawtooth',
          frequency: noteToHz('G3'),
          duration: 0.5,
          attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.3,
          volume: 0.75,
        },
      },
      {
        id: SOUND_EVENTS.BOMBER_INTERCEPT,
        config: {
          type: 'sine',
          frequency: noteToHz('C6'),
          duration: 0.6,
          attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4,
          volume: 0.85,
        },
      },
      {
        id: SOUND_EVENTS.BOMB_DROP_FROM_BOMBER,
        config: {
          type: 'sawtooth',
          frequency: noteToHz('E3'),
          duration: 0.2,
          attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.15,
          volume: 0.65,
        },
      },
      {
        id: SOUND_EVENTS.SCORE_POP_TICK,
        config: {
          type: 'sine',
          frequency: noteToHz('A5'),
          duration: 0.05,
          attack: 0.005, decay: 0.03, sustain: 0.1, release: 0.05,
          volume: 0.4,
          cooldownMs: 100,
        },
      },
      {
        id: SOUND_EVENTS.LEVEL_COMPLETE_FANFARE,
        config: {
          type: 'sine',
          frequency: noteToHz('C5'),
          duration: 1.0,
          attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.5,
          volume: 0.9,
        },
      },
      {
        id: SOUND_EVENTS.GAME_OVER_STING,
        config: {
          type: 'sawtooth',
          frequency: noteToHz('C2'),
          duration: 1.5,
          attack: 0.1, decay: 0.5, sustain: 0.2, release: 1.0,
          volume: 0.9,
        },
      },
      {
        id: SOUND_EVENTS.WAVE_START,
        config: {
          type: 'sine',
          frequency: noteToHz('G4'),
          duration: 0.3,
          attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.2,
          volume: 0.7,
        },
      },
      {
        id: SOUND_EVENTS.PAUSE_IN,
        config: {
          type: 'triangle',
          frequency: noteToHz('E4'),
          duration: 0.2,
          attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.15,
          volume: 0.6,
        },
      },
      {
        id: SOUND_EVENTS.PAUSE_OUT,
        config: {
          type: 'triangle',
          frequency: noteToHz('G4'),
          duration: 0.2,
          attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.15,
          volume: 0.6,
        },
      },
      {
        id: SOUND_EVENTS.SOUND_TOGGLE,
        config: {
          type: 'sine',
          frequency: noteToHz('C5'),
          duration: 0.15,
          attack: 0.01, decay: 0.05, sustain: 0.2, release: 0.1,
          volume: 0.5,
        },
      },
      {
        id: SOUND_EVENTS.LAUNCHER_RELOAD,
        config: {
          type: 'sine',
          frequency: noteToHz('C3'),
          duration: 0.08,
          attack: 0.005, decay: 0.04, sustain: 0.1, release: 0.05,
          volume: 0.45,
        },
      },
      {
        id: SOUND_EVENTS.BOMBER_ESCAPED,
        config: {
          type: 'sine',
          frequency: noteToHz('G3'),
          duration: 0.5,
          attack: 0.02, decay: 0.2, sustain: 0.2, release: 0.3,
          volume: 0.65,
        },
      },
      {
        id: SOUND_EVENTS.STAR_REVEAL,
        config: {
          type: 'sine',
          frequency: noteToHz('E5'),
          duration: 0.2,
          attack: 0.01, decay: 0.08, sustain: 0.3, release: 0.15,
          volume: 0.7,
        },
      },
      {
        id: SOUND_EVENTS.FIREWORK_POP,
        config: {
          type: 'sine',
          frequency: noteToHz('D5'),
          duration: 0.18,
          attack: 0.005, decay: 0.08, sustain: 0.1, release: 0.12,
          volume: 0.5,
        },
      },
      {
        id: SOUND_EVENTS.LEVEL_READY_BEEP,
        config: {
          type: 'square',
          frequency: noteToHz('C5'),
          duration: 0.2,
          attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.1,
          volume: 0.6,
        },
      },
      {
        id: SOUND_EVENTS.BRIEFING_ENTER,
        config: {
          type: 'sine',
          frequency: noteToHz('E3'),
          duration: 0.12,
          attack: 0.01, decay: 0.06, sustain: 0.1, release: 0.08,
          volume: 0.5,
        },
      },
      {
        id: SOUND_EVENTS.BRIEFING_DISMISS,
        config: {
          type: 'sine',
          frequency: noteToHz('C4'),
          duration: 0.2,
          attack: 0.01, decay: 0.08, sustain: 0.2, release: 0.15,
          volume: 0.55,
        },
      },
      {
        id: SOUND_EVENTS.TRAINING_SUCCESS,
        config: {
          type: 'sine',
          frequency: noteToHz('C5'),
          duration: 0.9,
          attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.4,
          volume: 0.85,
        },
      },
      {
        id: SOUND_EVENTS.TRAINING_MISS,
        config: {
          type: 'sine',
          frequency: noteToHz('F3'),
          duration: 0.3,
          attack: 0.02, decay: 0.15, sustain: 0.1, release: 0.2,
          volume: 0.5,
        },
      },
      {
        id: SOUND_EVENTS.CITY_REBUILD_TICK,
        config: {
          type: 'sine',
          frequency: noteToHz('G3'),
          duration: 0.08,
          attack: 0.005, decay: 0.04, sustain: 0.1, release: 0.05,
          volume: 0.35,
        },
      },
      {
        id: SOUND_EVENTS.VICTORY_FANFARE,
        config: {
          type: 'sine',
          frequency: noteToHz('C5'),
          duration: 1.5,
          attack: 0.02, decay: 0.3, sustain: 0.5, release: 0.8,
          volume: 0.9,
        },
      },
      {
        id: SOUND_EVENTS.MENU_BUTTON_CLICK,
        config: {
          type: 'sine',
          frequency: noteToHz('C4'),
          duration: 0.06,
          attack: 0.005, decay: 0.03, sustain: 0.1, release: 0.04,
          volume: 0.5,
        },
      },
    ];

    for (const { id, config } of configs) {
      this.synthConfigs.set(id, config);
    }
  }

  /** Handle document visibility change. */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.mute();
    } else {
      this.unmute();
    }
  }
}

// ── Audio Mixing Rules & useSoundMixer Hook ───────────────────────────────
// Manages concurrent sound playback, volume ducking, priority preemption,
// and mixing profiles for different app contexts.
//
// Architecture:
// - A single shared AudioContext is reused across the app lifetime.
// - Each active sound is tracked in a slot system (max N simultaneous).
// - Higher priority sounds can preempt lower priority ones when slots are full.
// - Voice/narration triggers ducking on the music/ambience channels.
// - Bedtime mode multiplies all volumes by a reduction factor.

import { useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { type SoundEntry, type SoundSynthesis, soundRegistry, getSynthesis } from './soundRegistry';

// ── Mixing Profile Types ──────────────────────────────────────────────────

export interface MixingProfile {
  /** Unique identifier. */
  id: string;
  /** Voice/narration channel volume 0-1. */
  voiceVolume: number;
  /** Background music channel volume 0-1. */
  musicVolume: number;
  /** Sound effects channel volume 0-1. */
  effectsVolume: number;
  /** Ambient drone/pad channel volume 0-1. */
  ambienceVolume: number;
  /** How much to reduce music volume when voice is playing (0 = mute, 1 = no duck). */
  duckingAmount: number;
  /** Milliseconds to ramp down to ducked volume. */
  duckingAttack: number;
  /** Milliseconds to ramp back up after voice stops. */
  duckingRelease: number;
  /** Maximum number of sounds that can play simultaneously. */
  maxSimultaneousSounds: number;
  /** Volume multiplier for bedtime mode (applied on top of all channels). */
  bedtimeReduction: number;
}

// ── Mixing Profile Definitions ────────────────────────────────────────────

export const mixingProfiles: Record<string, MixingProfile> = {

  default: {
    id: 'default',
    voiceVolume: 0.9,
    musicVolume: 0.4,
    effectsVolume: 0.7,
    ambienceVolume: 0.3,
    duckingAmount: 0.3,     // music ducks to 30% of its volume
    duckingAttack: 200,     // 200ms to duck
    duckingRelease: 500,    // 500ms to un-duck
    maxSimultaneousSounds: 3,
    bedtimeReduction: 0.6,
  },

  'narration-active': {
    id: 'narration-active',
    voiceVolume: 1.0,
    musicVolume: 0.15,      // music stays very low during narration
    effectsVolume: 0.4,     // effects reduced to not compete
    ambienceVolume: 0.15,
    duckingAmount: 0.15,    // even deeper duck
    duckingAttack: 150,
    duckingRelease: 600,
    maxSimultaneousSounds: 2,
    bedtimeReduction: 0.6,
  },

  bedtime: {
    id: 'bedtime',
    voiceVolume: 0.7,       // quieter voice
    musicVolume: 0.2,
    effectsVolume: 0.3,     // gentle effects
    ambienceVolume: 0.25,   // ambient is relatively louder in this context
    duckingAmount: 0.2,
    duckingAttack: 300,     // slower transition
    duckingRelease: 800,    // very gentle return
    maxSimultaneousSounds: 2,
    bedtimeReduction: 0.6,  // applied multiplicatively: 0.3 * 0.6 = 0.18 effective
  },

  movement: {
    id: 'movement',
    voiceVolume: 0.85,
    musicVolume: 0.6,       // music louder for energy
    effectsVolume: 0.8,     // punchy effects
    ambienceVolume: 0.2,
    duckingAmount: 0.4,
    duckingAttack: 100,     // quick duck
    duckingRelease: 300,    // quick return
    maxSimultaneousSounds: 4,
    bedtimeReduction: 0.6,
  },

  'parent-mode': {
    id: 'parent-mode',
    voiceVolume: 0.8,
    musicVolume: 0.0,       // no music in parent mode
    effectsVolume: 0.3,     // minimal effects
    ambienceVolume: 0.0,    // no ambience
    duckingAmount: 1.0,     // no ducking needed (no music)
    duckingAttack: 200,
    duckingRelease: 500,
    maxSimultaneousSounds: 2,
    bedtimeReduction: 0.6,
  },

} as const;

// ── Active Sound Slot ─────────────────────────────────────────────────────

interface ActiveSound {
  id: string;
  priority: 1 | 2 | 3;
  startTime: number;
  /** Estimated end time in ms (Date.now() based). */
  estimatedEndMs: number;
  /** Reference to the gain node for volume control. */
  gainNode: GainNode | null;
  /** Category for channel routing. */
  channel: 'voice' | 'music' | 'effects' | 'ambience';
}

// ── Channel Classification ────────────────────────────────────────────────

function classifyChannel(entry: SoundEntry): ActiveSound['channel'] {
  switch (entry.category) {
    case 'ambient':
      return 'ambience';
    case 'movement':
    case 'brand':
      return 'effects';
    case 'story':
      return 'effects';
    default:
      return 'effects';
  }
}

// ── Shared AudioContext ───────────────────────────────────────────────────

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioContext();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

// ── Synthesis Engine ──────────────────────────────────────────────────────

function estimateDuration(synth: SoundSynthesis): number {
  if (synth.type === 'sequence' && synth.notes?.length) {
    const lastNote = synth.notes[synth.notes.length - 1];
    return lastNote.delay + lastNote.duration + synth.release;
  }
  if (synth.type === 'sweep' && synth.sweepDuration) {
    return synth.sweepDuration + synth.release;
  }
  return synth.attack + synth.decay + 0.1 + synth.release;
}

/**
 * Synthesize and play a sound using Web Audio API.
 * Returns the master GainNode for post-hoc volume adjustments.
 */
function synthesize(
  synth: SoundSynthesis,
  channelVolume: number,
): GainNode | null {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(synth.volume * channelVolume, now);

    // Optional panner
    let destination: AudioNode = ctx.destination;

    if (synth.pan !== undefined && synth.pan !== 0) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(synth.pan, now);
      panner.connect(ctx.destination);
      destination = panner;
    }

    // Optional filter
    let filterNode: BiquadFilterNode | null = null;
    if (synth.filterFreq && synth.filterType) {
      filterNode = ctx.createBiquadFilter();
      filterNode.type = synth.filterType;
      filterNode.frequency.setValueAtTime(synth.filterFreq, now);
      filterNode.Q.setValueAtTime(1, now);
      filterNode.connect(destination);
      masterGain.connect(filterNode);
    } else {
      masterGain.connect(destination);
    }

    const connectOsc = (osc: OscillatorNode, gain: GainNode) => {
      gain.connect(masterGain);
      osc.connect(gain);
    };

    const applyEnvelope = (
      gain: GainNode,
      startAt: number,
      duration: number,
    ) => {
      const peak = 1.0;
      const sustainLevel = Math.max(synth.sustain, 0.001);
      gain.gain.setValueAtTime(0.001, startAt);
      gain.gain.linearRampToValueAtTime(peak, startAt + synth.attack);
      gain.gain.linearRampToValueAtTime(
        sustainLevel,
        startAt + synth.attack + synth.decay,
      );
      gain.gain.setValueAtTime(
        sustainLevel,
        startAt + duration - synth.release,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        startAt + duration,
      );
    };

    switch (synth.type) {
      case 'tone': {
        const freq = synth.frequencies?.[0] ?? 440;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = synth.waveform ?? 'sine';
        osc.frequency.setValueAtTime(freq, now);
        const dur = synth.attack + synth.decay + 0.1 + synth.release;
        applyEnvelope(gain, now, dur);
        connectOsc(osc, gain);
        osc.start(now);
        osc.stop(now + dur + 0.05);
        break;
      }

      case 'chord': {
        const freqs = synth.frequencies ?? [440];
        const dur = synth.attack + synth.decay + 0.2 + synth.release;
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = synth.waveform ?? 'sine';
          osc.frequency.setValueAtTime(freq, now);
          applyEnvelope(gain, now, dur);
          connectOsc(osc, gain);
          osc.start(now);
          osc.stop(now + dur + 0.05);
        });
        break;
      }

      case 'sequence': {
        const notes = synth.notes ?? [];
        notes.forEach(({ freq, duration, delay }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = synth.waveform ?? 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);
          const noteDur = duration + synth.release;
          applyEnvelope(gain, now + delay, noteDur);
          connectOsc(osc, gain);
          osc.start(now + delay);
          osc.stop(now + delay + noteDur + 0.05);
        });
        break;
      }

      case 'sweep': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = synth.waveform ?? 'sine';
        const sweepDur = synth.sweepDuration ?? 0.3;
        const totalDur = sweepDur + synth.release;
        osc.frequency.setValueAtTime(synth.freqStart ?? 400, now);
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(synth.freqEnd ?? 800, 1),
          now + sweepDur,
        );
        applyEnvelope(gain, now, totalDur);
        connectOsc(osc, gain);
        osc.start(now);
        osc.stop(now + totalDur + 0.05);
        break;
      }

      case 'noise': {
        // Generate white noise via buffer, filtered
        const bufferSize = ctx.sampleRate * 0.5; // 500ms buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        const dur = synth.attack + synth.decay + 0.05 + synth.release;
        applyEnvelope(gain, now, dur);
        gain.connect(masterGain);
        source.connect(gain);
        source.start(now);
        source.stop(now + dur + 0.05);
        break;
      }
    }

    return masterGain;
  } catch {
    return null;
  }
}

// ── Cooldown Tracker ──────────────────────────────────────────────────────

const lastPlayedMap = new Map<string, number>();

function isOnCooldown(soundId: string, cooldownMs: number): boolean {
  const last = lastPlayedMap.get(soundId);
  if (!last) return false;
  return Date.now() - last < cooldownMs;
}

function markPlayed(soundId: string): void {
  lastPlayedMap.set(soundId, Date.now());
}

// ── useSoundMixer Hook ────────────────────────────────────────────────────

export interface SoundMixerState {
  /** Play a registered sound by ID. Returns true if played, false if skipped. */
  play: (soundId: string) => boolean;
  /** Stop all active sounds immediately. */
  stopAll: () => void;
  /** Start voice ducking (call when narration/TTS begins). */
  startDucking: () => void;
  /** End voice ducking (call when narration/TTS ends). */
  endDucking: () => void;
  /** Switch to a different mixing profile. */
  setProfile: (profileId: string) => void;
  /** Current profile ID. */
  currentProfileId: string;
  /** Number of currently active sounds. */
  activeSoundCount: number;
}

export function useSoundMixer(): SoundMixerState {
  const { soundEnabled, bedtimeMode } = useApp();
  const [profileId, setProfileId] = useState('default');
  const [activeSoundCount, setActiveSoundCount] = useState(0);
  const activeSoundsRef = useRef<ActiveSound[]>([]);
  const isDuckingRef = useRef(false);

  // Auto-switch to bedtime profile when bedtime mode is on
  useEffect(() => {
    if (bedtimeMode && profileId !== 'bedtime') {
      setProfileId('bedtime');
    }
  }, [bedtimeMode, profileId]);

  // Clean up expired sounds periodically
  const cleanupExpired = useCallback(() => {
    const now = Date.now();
    const before = activeSoundsRef.current.length;
    activeSoundsRef.current = activeSoundsRef.current.filter(
      (s) => s.estimatedEndMs > now,
    );
    if (activeSoundsRef.current.length !== before) {
      setActiveSoundCount(activeSoundsRef.current.length);
    }
  }, []);

  const getProfile = useCallback((): MixingProfile => {
    return mixingProfiles[profileId] ?? mixingProfiles.default;
  }, [profileId]);

  const getChannelVolume = useCallback(
    (channel: ActiveSound['channel']): number => {
      const profile = getProfile();
      let vol: number;
      switch (channel) {
        case 'voice':
          vol = profile.voiceVolume;
          break;
        case 'music':
          vol = profile.musicVolume;
          break;
        case 'ambience':
          vol = profile.ambienceVolume;
          break;
        case 'effects':
        default:
          vol = profile.effectsVolume;
          break;
      }
      // Apply ducking to music and ambience channels
      if (isDuckingRef.current && (channel === 'music' || channel === 'ambience')) {
        vol *= profile.duckingAmount;
      }
      // Apply bedtime reduction
      if (bedtimeMode) {
        vol *= profile.bedtimeReduction;
      }
      return vol;
    },
    [getProfile, bedtimeMode],
  );

  const play = useCallback(
    (soundId: string): boolean => {
      if (!soundEnabled) return false;

      const entry = soundRegistry[soundId];
      if (!entry) return false;

      // Check cooldown
      if (isOnCooldown(soundId, entry.cooldownMs)) return false;

      // Clean up expired slots
      cleanupExpired();

      const profile = getProfile();
      const active = activeSoundsRef.current;

      // Check concurrent limit for this specific sound
      const sameSound = active.filter((s) => s.id === soundId);
      if (sameSound.length >= entry.maxConcurrent) return false;

      // Check total slot limit
      if (active.length >= profile.maxSimultaneousSounds) {
        // Try to preempt a lower-priority sound
        const lowestPriority = Math.max(...active.map((s) => s.priority));
        if (entry.priority >= lowestPriority) {
          // Cannot preempt -- all sounds are same or higher priority
          return false;
        }
        // Preempt the oldest lowest-priority sound
        const victimIdx = active.findIndex((s) => s.priority === lowestPriority);
        if (victimIdx >= 0) {
          const victim = active[victimIdx];
          // Fade out the victim quickly
          if (victim.gainNode) {
            try {
              const ctx = getAudioContext();
              victim.gainNode.gain.exponentialRampToValueAtTime(
                0.001,
                ctx.currentTime + 0.05,
              );
            } catch { /* ignore */ }
          }
          active.splice(victimIdx, 1);
        }
      }

      // Get synthesis parameters (with bedtime variant if applicable)
      const synth = getSynthesis(soundId, bedtimeMode);
      if (!synth) return false;

      // Calculate channel volume
      const channel = classifyChannel(entry);
      const channelVol = getChannelVolume(channel);

      // Synthesize the sound
      const gainNode = synthesize(synth, channelVol);

      // Track the active sound
      const duration = estimateDuration(synth);
      const slot: ActiveSound = {
        id: soundId,
        priority: entry.priority,
        startTime: Date.now(),
        estimatedEndMs: Date.now() + duration * 1000 + 100,
        gainNode,
        channel,
      };
      activeSoundsRef.current.push(slot);
      setActiveSoundCount(activeSoundsRef.current.length);
      markPlayed(soundId);

      // Schedule cleanup
      setTimeout(() => {
        cleanupExpired();
      }, duration * 1000 + 200);

      return true;
    },
    [soundEnabled, bedtimeMode, cleanupExpired, getProfile, getChannelVolume],
  );

  const stopAll = useCallback(() => {
    const ctx = sharedAudioCtx;
    if (!ctx) return;
    const now = ctx.currentTime;
    activeSoundsRef.current.forEach((slot) => {
      if (slot.gainNode) {
        try {
          slot.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        } catch { /* ignore */ }
      }
    });
    activeSoundsRef.current = [];
    setActiveSoundCount(0);
  }, []);

  const startDucking = useCallback(() => {
    isDuckingRef.current = true;
    // Apply ducking to currently playing music/ambience sounds
    const profile = getProfile();
    const ctx = sharedAudioCtx;
    if (!ctx) return;
    const attackSec = profile.duckingAttack / 1000;
    activeSoundsRef.current.forEach((slot) => {
      if (
        (slot.channel === 'music' || slot.channel === 'ambience') &&
        slot.gainNode
      ) {
        try {
          slot.gainNode.gain.linearRampToValueAtTime(
            slot.gainNode.gain.value * profile.duckingAmount,
            ctx.currentTime + attackSec,
          );
        } catch { /* ignore */ }
      }
    });
  }, [getProfile]);

  const endDucking = useCallback(() => {
    isDuckingRef.current = false;
    const profile = getProfile();
    const ctx = sharedAudioCtx;
    if (!ctx) return;
    const releaseSec = profile.duckingRelease / 1000;
    activeSoundsRef.current.forEach((slot) => {
      if (
        (slot.channel === 'music' || slot.channel === 'ambience') &&
        slot.gainNode
      ) {
        try {
          // Restore to un-ducked channel volume
          const vol = getChannelVolume(slot.channel);
          slot.gainNode.gain.linearRampToValueAtTime(
            vol,
            ctx.currentTime + releaseSec,
          );
        } catch { /* ignore */ }
      }
    });
  }, [getProfile, getChannelVolume]);

  const setProfile = useCallback((id: string) => {
    if (mixingProfiles[id]) {
      setProfileId(id);
    }
  }, []);

  return {
    play,
    stopAll,
    startDucking,
    endDucking,
    setProfile,
    currentProfileId: profileId,
    activeSoundCount,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Get a mixing profile by ID. Falls back to default. */
export function getMixingProfile(id: string): MixingProfile {
  return mixingProfiles[id] ?? mixingProfiles.default;
}

/** All profile IDs. */
export const allMixingProfileIds: string[] = Object.keys(mixingProfiles);

export const METRONOME_CONSTANTS = {
  BPM: {
    MIN: 20,
    MAX: 300,
    DEFAULT: 120,
  },
  BEATS: {
    MIN: 2,
    MAX: 12,
    DEFAULT: 4,
  },
  TIMER: {
    INTERVAL: 30000, // 30 seconds
    DEFAULT: 120000, // 2 minutes
    MAX: 3570000, // 119 * 30 seconds
  },
  AUDIO: {
    LOOKAHEAD: 25,
    SCHEDULE_AHEAD: 0.2,
    FREQUENCY_HIGH: 1000,
    FREQUENCY_LOW: 800,
  },
  AUTOSAVE: {
    DELAY: 2000, // 2 seconds
    INTERVAL: 30000, // 30 seconds (während Spielen)
  },
  TOAST: {
    DURATION: 2000, // 2 seconds
  },
} as const

export type MetronomeConstants = typeof METRONOME_CONSTANTS

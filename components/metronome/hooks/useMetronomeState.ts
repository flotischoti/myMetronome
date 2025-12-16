import { useMetronomeReducer } from './useMetronomeReducer'
import { METRONOME_CONSTANTS } from '@/constants/metronome'
import type {
  StoredMetronome,
  LocalMetronomeSettings,
  MetronomeFull,
} from '@/components/metronome/Metronome'

const defaultStoredMetronome: StoredMetronome = {
  name: '',
  bpm: METRONOME_CONSTANTS.BPM.DEFAULT,
  beats: METRONOME_CONSTANTS.BEATS.DEFAULT,
  stressFirst: false,
  timeUsed: 0,
  timerActive: false,
  timerValue: METRONOME_CONSTANTS.TIMER.DEFAULT,
  showStats: false,
  locked: false,
}

const defaultLocalMetronome: LocalMetronomeSettings = {
  isPlaying: false,
  currentUsed: 0,
  sessionUsed: 0,
  activeTimer: 0,
}

/**
 * Custom Hook für Metronome State Management with useReducer
 */
export const useMetronomeState = (dbMetronome: StoredMetronome | null) => {
  const initialState: MetronomeFull = {
    ...(dbMetronome || defaultStoredMetronome),
    ...defaultLocalMetronome,
    activeTimer: dbMetronome?.timerValue || defaultLocalMetronome.activeTimer,
  }

  const [metronome, dispatch] = useMetronomeReducer(initialState)

  return { metronome, dispatch }
}

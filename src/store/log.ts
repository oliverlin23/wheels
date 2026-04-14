import { create } from 'zustand'
import type { LogEvent } from '../game/types'

interface LogStore {
  events: LogEvent[]
  pushEvents: (newEvents: LogEvent[]) => void
  clear: () => void
}

export const useLogStore = create<LogStore>((set) => ({
  events: [],
  pushEvents: (newEvents) =>
    set((state) => ({ events: [...state.events, ...newEvents] })),
  clear: () => set({ events: [] }),
}))

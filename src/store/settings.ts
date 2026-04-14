import { create } from 'zustand'

interface SettingsStore {
  reducedMotion: boolean
  focusMode: boolean
  nightPrint: boolean
  toggle: (key: 'reducedMotion' | 'focusMode' | 'nightPrint') => void
}

function loadBool(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  reducedMotion: loadBool('wheels:reducedMotion'),
  focusMode: loadBool('wheels:focusMode'),
  nightPrint: loadBool('wheels:nightPrint'),
  toggle: (key) =>
    set((state) => {
      const next = !state[key]
      try {
        localStorage.setItem(`wheels:${key}`, String(next))
      } catch {
        // ignore
      }
      return { [key]: next }
    }),
}))

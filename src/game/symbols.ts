import type { PanelSymbol } from './types'

export const SYMBOL_LABEL: Record<PanelSymbol, string> = {
  sun: 'SUN',
  moon: 'MON',
  shield: 'SHD',
}

export const SYMBOL_COLOR: Record<PanelSymbol, string> = {
  sun: 'var(--color-sun-gold)',
  moon: 'var(--color-moon-teal)',
  shield: 'var(--color-shield-steel)',
}

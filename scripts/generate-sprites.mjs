import { createCanvas } from '@napi-rs/canvas'
import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('public/sprites', { recursive: true })

// ─── Helpers ────────────────────────────────────────────────────────────────

function px(ctx, x, y) {
  ctx.fillRect(x, y, 1, 1)
}

function rect(ctx, x, y, w, h) {
  ctx.fillRect(x, y, w, h)
}

function outline(ctx, color, fn) {
  ctx.fillStyle = color
  fn()
}

function fill(ctx, color, fn) {
  ctx.fillStyle = color
  fn()
}

// ─── WARRIOR ────────────────────────────────────────────────────────────────

function drawWarrior(ctx, fx) {
  const MAIN = '#D97706'
  const DARK = '#92400E'
  const LIGHT = '#FCD34D'

  function idle() {
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+12, 4, 10, 10))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 5, 8, 8))
    // Eyes
    fill(ctx, DARK, () => { px(ctx, fx+15, 8); px(ctx, fx+18, 8) })
    // Body (stocky)
    outline(ctx, DARK, () => rect(ctx, fx+10, 14, 14, 10))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 15, 12, 8))
    // Legs
    outline(ctx, DARK, () => { rect(ctx, fx+11, 24, 5, 6); rect(ctx, fx+18, 24, 5, 6) })
    fill(ctx, MAIN, () => { rect(ctx, fx+12, 25, 3, 4); rect(ctx, fx+19, 25, 3, 4) })
    // Sword (right side, down)
    fill(ctx, LIGHT, () => rect(ctx, fx+25, 16, 2, 12))
    fill(ctx, DARK, () => rect(ctx, fx+24, 14, 4, 2))
  }

  function windup() {
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+12, 4, 10, 10))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 5, 8, 8))
    fill(ctx, DARK, () => { px(ctx, fx+15, 8); px(ctx, fx+18, 8) })
    // Body
    outline(ctx, DARK, () => rect(ctx, fx+10, 14, 14, 10))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 15, 12, 8))
    // Legs
    outline(ctx, DARK, () => { rect(ctx, fx+11, 24, 5, 6); rect(ctx, fx+18, 24, 5, 6) })
    fill(ctx, MAIN, () => { rect(ctx, fx+12, 25, 3, 4); rect(ctx, fx+19, 25, 3, 4) })
    // Sword raised above head
    fill(ctx, LIGHT, () => rect(ctx, fx+24, 1, 2, 12))
    fill(ctx, DARK, () => rect(ctx, fx+23, 13, 4, 2))
  }

  function release() {
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+14, 4, 10, 10))
    fill(ctx, MAIN, () => rect(ctx, fx+15, 5, 8, 8))
    fill(ctx, DARK, () => { px(ctx, fx+17, 8); px(ctx, fx+20, 8) })
    // Body leaning forward
    outline(ctx, DARK, () => rect(ctx, fx+12, 14, 14, 10))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 15, 12, 8))
    // Legs
    outline(ctx, DARK, () => { rect(ctx, fx+12, 24, 5, 6); rect(ctx, fx+19, 24, 5, 6) })
    fill(ctx, MAIN, () => { rect(ctx, fx+13, 25, 3, 4); rect(ctx, fx+20, 25, 3, 4) })
    // Sword thrust forward
    fill(ctx, LIGHT, () => rect(ctx, fx+26, 16, 6, 2))
    fill(ctx, DARK, () => rect(ctx, fx+24, 15, 3, 4))
  }

  function hit() {
    // Head tilted back
    outline(ctx, DARK, () => rect(ctx, fx+10, 5, 10, 10))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 6, 8, 8))
    fill(ctx, DARK, () => { px(ctx, fx+13, 9); px(ctx, fx+16, 9) })
    // Body leaning back
    outline(ctx, DARK, () => rect(ctx, fx+8, 15, 14, 10))
    fill(ctx, MAIN, () => rect(ctx, fx+9, 16, 12, 8))
    // Legs
    outline(ctx, DARK, () => { rect(ctx, fx+9, 25, 5, 5); rect(ctx, fx+16, 25, 5, 5) })
    fill(ctx, MAIN, () => { rect(ctx, fx+10, 26, 3, 3); rect(ctx, fx+17, 26, 3, 3) })
    // Sword dropped
    fill(ctx, LIGHT, () => rect(ctx, fx+22, 22, 2, 8))
    fill(ctx, DARK, () => rect(ctx, fx+21, 20, 4, 2))
  }

  function ko() {
    // Fallen flat - horizontal body
    outline(ctx, DARK, () => rect(ctx, fx+2, 22, 10, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+3, 23, 8, 6))
    // Head on ground
    outline(ctx, DARK, () => rect(ctx, fx+12, 22, 8, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 23, 6, 6))
    // X eyes
    fill(ctx, DARK, () => { px(ctx, fx+15, 25); px(ctx, fx+17, 25) })
    // Sword on ground
    fill(ctx, LIGHT, () => rect(ctx, fx+21, 26, 8, 2))
  }

  ;[idle, windup, release, hit, ko][Math.floor(fx / 32)]()
}

// ─── MAGE ───────────────────────────────────────────────────────────────────

function drawMage(ctx, fx) {
  const MAIN = '#6D28D9'
  const DARK = '#4C1D95'
  const LIGHT = '#C4B5FD'

  function idle() {
    // Pointed hat
    fill(ctx, DARK, () => { px(ctx, fx+16, 1); rect(ctx, fx+15, 2, 3, 1); rect(ctx, fx+14, 3, 5, 1) })
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+13, 4, 8, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+14, 5, 6, 6))
    fill(ctx, DARK, () => { px(ctx, fx+15, 7); px(ctx, fx+18, 7) })
    // Thin body (robe)
    outline(ctx, DARK, () => rect(ctx, fx+12, 12, 10, 12))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 13, 8, 10))
    // Robe bottom flare
    outline(ctx, DARK, () => rect(ctx, fx+10, 24, 14, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 25, 12, 4))
    // Staff (left side)
    fill(ctx, LIGHT, () => rect(ctx, fx+7, 4, 2, 24))
    fill(ctx, LIGHT, () => rect(ctx, fx+6, 3, 4, 2)) // staff top
  }

  function windup() {
    // Hat
    fill(ctx, DARK, () => { px(ctx, fx+16, 1); rect(ctx, fx+15, 2, 3, 1); rect(ctx, fx+14, 3, 5, 1) })
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+13, 4, 8, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+14, 5, 6, 6))
    fill(ctx, DARK, () => { px(ctx, fx+15, 7); px(ctx, fx+18, 7) })
    // Body
    outline(ctx, DARK, () => rect(ctx, fx+12, 12, 10, 12))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 13, 8, 10))
    outline(ctx, DARK, () => rect(ctx, fx+10, 24, 14, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 25, 12, 4))
    // Staff raised
    fill(ctx, LIGHT, () => rect(ctx, fx+7, 0, 2, 20))
    fill(ctx, LIGHT, () => rect(ctx, fx+6, 0, 4, 2))
    // Sparkle at top
    fill(ctx, '#FBBF24', () => { px(ctx, fx+5, 0); px(ctx, fx+10, 0); px(ctx, fx+8, 0) })
  }

  function release() {
    // Hat
    fill(ctx, DARK, () => { px(ctx, fx+16, 1); rect(ctx, fx+15, 2, 3, 1); rect(ctx, fx+14, 3, 5, 1) })
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+13, 4, 8, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+14, 5, 6, 6))
    fill(ctx, DARK, () => { px(ctx, fx+15, 7); px(ctx, fx+18, 7) })
    // Body leaning forward
    outline(ctx, DARK, () => rect(ctx, fx+14, 12, 10, 12))
    fill(ctx, MAIN, () => rect(ctx, fx+15, 13, 8, 10))
    outline(ctx, DARK, () => rect(ctx, fx+12, 24, 14, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 25, 12, 4))
    // Staff forward
    fill(ctx, LIGHT, () => rect(ctx, fx+22, 10, 2, 18))
    fill(ctx, LIGHT, () => rect(ctx, fx+21, 8, 4, 3))
    // Magic bolt
    fill(ctx, '#FBBF24', () => { px(ctx, fx+26, 10); px(ctx, fx+28, 11); px(ctx, fx+30, 10) })
  }

  function hit() {
    // Hat tilted
    fill(ctx, DARK, () => { px(ctx, fx+13, 2); rect(ctx, fx+12, 3, 3, 1); rect(ctx, fx+11, 4, 5, 1) })
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+11, 5, 8, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+12, 6, 6, 6))
    fill(ctx, DARK, () => { px(ctx, fx+13, 8); px(ctx, fx+16, 8) })
    // Body staggering
    outline(ctx, DARK, () => rect(ctx, fx+10, 13, 10, 12))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 14, 8, 10))
    outline(ctx, DARK, () => rect(ctx, fx+8, 25, 14, 5))
    fill(ctx, MAIN, () => rect(ctx, fx+9, 26, 12, 3))
    // Staff tilted
    fill(ctx, LIGHT, () => rect(ctx, fx+5, 8, 2, 20))
  }

  function ko() {
    // Hat fallen off to side
    fill(ctx, DARK, () => { px(ctx, fx+4, 22); rect(ctx, fx+3, 23, 3, 1); rect(ctx, fx+2, 24, 5, 2) })
    // Body collapsed horizontal
    outline(ctx, DARK, () => rect(ctx, fx+8, 22, 16, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+9, 23, 14, 6))
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+24, 22, 6, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+25, 23, 4, 4))
    fill(ctx, DARK, () => { px(ctx, fx+26, 24); px(ctx, fx+28, 24) })
    // Staff on ground
    fill(ctx, LIGHT, () => rect(ctx, fx+6, 28, 18, 2))
  }

  ;[idle, windup, release, hit, ko][Math.floor(fx / 32)]()
}

// ─── ARCHER ─────────────────────────────────────────────────────────────────

function drawArcher(ctx, fx) {
  const MAIN = '#0F766E'
  const DARK = '#134E4A'
  const LIGHT = '#5EEAD4'

  function idle() {
    // Head with hood
    outline(ctx, DARK, () => rect(ctx, fx+13, 4, 8, 9))
    fill(ctx, MAIN, () => rect(ctx, fx+14, 5, 6, 7))
    fill(ctx, DARK, () => { px(ctx, fx+15, 7); px(ctx, fx+18, 7) })
    // Hood peak
    fill(ctx, DARK, () => rect(ctx, fx+13, 3, 8, 2))
    // Body
    outline(ctx, DARK, () => rect(ctx, fx+12, 13, 10, 9))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 14, 8, 7))
    // Legs
    outline(ctx, DARK, () => { rect(ctx, fx+12, 22, 4, 8); rect(ctx, fx+18, 22, 4, 8) })
    fill(ctx, MAIN, () => { rect(ctx, fx+13, 23, 2, 6); rect(ctx, fx+19, 23, 2, 6) })
    // Bow at rest (left side, vertical)
    fill(ctx, LIGHT, () => { rect(ctx, fx+8, 10, 1, 14); px(ctx, fx+7, 11); px(ctx, fx+7, 22) })
    // Quiver on back
    fill(ctx, DARK, () => rect(ctx, fx+22, 8, 2, 10))
  }

  function windup() {
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+13, 4, 8, 9))
    fill(ctx, MAIN, () => rect(ctx, fx+14, 5, 6, 7))
    fill(ctx, DARK, () => { px(ctx, fx+15, 7); px(ctx, fx+18, 7) })
    fill(ctx, DARK, () => rect(ctx, fx+13, 3, 8, 2))
    // Body
    outline(ctx, DARK, () => rect(ctx, fx+12, 13, 10, 9))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 14, 8, 7))
    // Legs
    outline(ctx, DARK, () => { rect(ctx, fx+12, 22, 4, 8); rect(ctx, fx+18, 22, 4, 8) })
    fill(ctx, MAIN, () => { rect(ctx, fx+13, 23, 2, 6); rect(ctx, fx+19, 23, 2, 6) })
    // Bow drawn back
    fill(ctx, LIGHT, () => { rect(ctx, fx+24, 10, 1, 14); px(ctx, fx+25, 11); px(ctx, fx+25, 22) })
    // String pulled
    fill(ctx, LIGHT, () => rect(ctx, fx+20, 16, 4, 1))
    // Arrow
    fill(ctx, '#FBBF24', () => rect(ctx, fx+18, 16, 6, 1))
  }

  function release() {
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+14, 4, 8, 9))
    fill(ctx, MAIN, () => rect(ctx, fx+15, 5, 6, 7))
    fill(ctx, DARK, () => { px(ctx, fx+16, 7); px(ctx, fx+19, 7) })
    fill(ctx, DARK, () => rect(ctx, fx+14, 3, 8, 2))
    // Body leaning forward
    outline(ctx, DARK, () => rect(ctx, fx+13, 13, 10, 9))
    fill(ctx, MAIN, () => rect(ctx, fx+14, 14, 8, 7))
    // Legs
    outline(ctx, DARK, () => { rect(ctx, fx+13, 22, 4, 8); rect(ctx, fx+19, 22, 4, 8) })
    fill(ctx, MAIN, () => { rect(ctx, fx+14, 23, 2, 6); rect(ctx, fx+20, 23, 2, 6) })
    // Bow released
    fill(ctx, LIGHT, () => { rect(ctx, fx+24, 10, 1, 14); px(ctx, fx+25, 11); px(ctx, fx+25, 22) })
    // Arrow flying
    fill(ctx, '#FBBF24', () => rect(ctx, fx+27, 16, 5, 1))
  }

  function hit() {
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+10, 5, 8, 9))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 6, 6, 7))
    fill(ctx, DARK, () => { px(ctx, fx+12, 8); px(ctx, fx+15, 8) })
    fill(ctx, DARK, () => rect(ctx, fx+10, 4, 8, 2))
    // Body stumbling
    outline(ctx, DARK, () => rect(ctx, fx+9, 14, 10, 9))
    fill(ctx, MAIN, () => rect(ctx, fx+10, 15, 8, 7))
    // Legs apart
    outline(ctx, DARK, () => { rect(ctx, fx+8, 23, 4, 7); rect(ctx, fx+16, 23, 4, 7) })
    fill(ctx, MAIN, () => { rect(ctx, fx+9, 24, 2, 5); rect(ctx, fx+17, 24, 2, 5) })
    // Bow dropped
    fill(ctx, LIGHT, () => rect(ctx, fx+18, 20, 1, 8))
  }

  function ko() {
    // Collapsed on ground
    outline(ctx, DARK, () => rect(ctx, fx+4, 23, 18, 7))
    fill(ctx, MAIN, () => rect(ctx, fx+5, 24, 16, 5))
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+22, 23, 6, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+23, 24, 4, 4))
    fill(ctx, DARK, () => { px(ctx, fx+24, 25); px(ctx, fx+26, 25) })
    // Bow on ground
    fill(ctx, LIGHT, () => rect(ctx, fx+2, 28, 10, 1))
  }

  ;[idle, windup, release, hit, ko][Math.floor(fx / 32)]()
}

// ─── ENGINEER ───────────────────────────────────────────────────────────────

function drawEngineer(ctx, fx) {
  const MAIN = '#475569'
  const DARK = '#1E293B'
  const LIGHT = '#CBD5E1'

  function idle() {
    // Helmet
    outline(ctx, DARK, () => rect(ctx, fx+11, 2, 12, 4))
    fill(ctx, LIGHT, () => rect(ctx, fx+12, 3, 10, 2))
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+12, 6, 10, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 7, 8, 6))
    fill(ctx, DARK, () => { px(ctx, fx+15, 9); px(ctx, fx+18, 9) })
    // Stocky body
    outline(ctx, DARK, () => rect(ctx, fx+10, 14, 14, 10))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 15, 12, 8))
    // Legs
    outline(ctx, DARK, () => { rect(ctx, fx+11, 24, 5, 6); rect(ctx, fx+18, 24, 5, 6) })
    fill(ctx, MAIN, () => { rect(ctx, fx+12, 25, 3, 4); rect(ctx, fx+19, 25, 3, 4) })
    // Wrench
    fill(ctx, LIGHT, () => rect(ctx, fx+25, 14, 2, 10))
    fill(ctx, LIGHT, () => { rect(ctx, fx+24, 12, 4, 3); px(ctx, fx+25, 13) }) // wrench head
  }

  function windup() {
    // Helmet
    outline(ctx, DARK, () => rect(ctx, fx+11, 2, 12, 4))
    fill(ctx, LIGHT, () => rect(ctx, fx+12, 3, 10, 2))
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+12, 6, 10, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 7, 8, 6))
    fill(ctx, DARK, () => { px(ctx, fx+15, 9); px(ctx, fx+18, 9) })
    // Body
    outline(ctx, DARK, () => rect(ctx, fx+10, 14, 14, 10))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 15, 12, 8))
    // Legs
    outline(ctx, DARK, () => { rect(ctx, fx+11, 24, 5, 6); rect(ctx, fx+18, 24, 5, 6) })
    fill(ctx, MAIN, () => { rect(ctx, fx+12, 25, 3, 4); rect(ctx, fx+19, 25, 3, 4) })
    // Wrench raised
    fill(ctx, LIGHT, () => rect(ctx, fx+25, 2, 2, 12))
    fill(ctx, LIGHT, () => { rect(ctx, fx+24, 0, 4, 3); px(ctx, fx+25, 1) })
  }

  function release() {
    // Helmet
    outline(ctx, DARK, () => rect(ctx, fx+13, 2, 12, 4))
    fill(ctx, LIGHT, () => rect(ctx, fx+14, 3, 10, 2))
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+14, 6, 10, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+15, 7, 8, 6))
    fill(ctx, DARK, () => { px(ctx, fx+17, 9); px(ctx, fx+20, 9) })
    // Body forward
    outline(ctx, DARK, () => rect(ctx, fx+12, 14, 14, 10))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 15, 12, 8))
    // Legs
    outline(ctx, DARK, () => { rect(ctx, fx+12, 24, 5, 6); rect(ctx, fx+19, 24, 5, 6) })
    fill(ctx, MAIN, () => { rect(ctx, fx+13, 25, 3, 4); rect(ctx, fx+20, 25, 3, 4) })
    // Wrench swung forward
    fill(ctx, LIGHT, () => rect(ctx, fx+26, 16, 6, 2))
    fill(ctx, LIGHT, () => { rect(ctx, fx+28, 15, 4, 4) })
  }

  function hit() {
    // Helmet
    outline(ctx, DARK, () => rect(ctx, fx+8, 3, 12, 4))
    fill(ctx, LIGHT, () => rect(ctx, fx+9, 4, 10, 2))
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+9, 7, 10, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+10, 8, 8, 6))
    fill(ctx, DARK, () => { px(ctx, fx+12, 10); px(ctx, fx+15, 10) })
    // Body pushed back
    outline(ctx, DARK, () => rect(ctx, fx+7, 15, 14, 10))
    fill(ctx, MAIN, () => rect(ctx, fx+8, 16, 12, 8))
    // Legs
    outline(ctx, DARK, () => { rect(ctx, fx+8, 25, 5, 5); rect(ctx, fx+15, 25, 5, 5) })
    fill(ctx, MAIN, () => { rect(ctx, fx+9, 26, 3, 3); rect(ctx, fx+16, 26, 3, 3) })
    // Wrench dropped
    fill(ctx, LIGHT, () => rect(ctx, fx+22, 24, 2, 6))
  }

  function ko() {
    // Slumped - body horizontal
    outline(ctx, DARK, () => rect(ctx, fx+4, 22, 16, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+5, 23, 14, 6))
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+20, 22, 8, 7))
    fill(ctx, MAIN, () => rect(ctx, fx+21, 23, 6, 5))
    fill(ctx, DARK, () => { px(ctx, fx+23, 24); px(ctx, fx+25, 24) })
    // Helmet on ground
    fill(ctx, LIGHT, () => rect(ctx, fx+20, 20, 8, 3))
    // Wrench on ground
    fill(ctx, LIGHT, () => rect(ctx, fx+2, 27, 8, 2))
  }

  ;[idle, windup, release, hit, ko][Math.floor(fx / 32)]()
}

// ─── ASSASSIN ───────────────────────────────────────────────────────────────

function drawAssassin(ctx, fx) {
  const MAIN = '#BE185D'
  const DARK = '#9D174D'
  const LIGHT = '#FDA4AF'

  function idle() {
    // Hood
    fill(ctx, DARK, () => { rect(ctx, fx+14, 5, 6, 3); px(ctx, fx+16, 4) })
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+13, 8, 7, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+14, 9, 5, 4))
    fill(ctx, DARK, () => { px(ctx, fx+15, 10); px(ctx, fx+17, 10) })
    // Thin body (crouched)
    outline(ctx, DARK, () => rect(ctx, fx+12, 14, 9, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 15, 7, 6))
    // Legs (crouched, bent)
    outline(ctx, DARK, () => { rect(ctx, fx+11, 22, 4, 8); rect(ctx, fx+17, 22, 4, 8) })
    fill(ctx, MAIN, () => { rect(ctx, fx+12, 23, 2, 6); rect(ctx, fx+18, 23, 2, 6) })
    // Dagger (small, right hand)
    fill(ctx, LIGHT, () => rect(ctx, fx+22, 16, 4, 1))
    fill(ctx, DARK, () => rect(ctx, fx+21, 15, 2, 3))
  }

  function windup() {
    // Hood
    fill(ctx, DARK, () => { rect(ctx, fx+14, 5, 6, 3); px(ctx, fx+16, 4) })
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+13, 8, 7, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+14, 9, 5, 4))
    fill(ctx, DARK, () => { px(ctx, fx+15, 10); px(ctx, fx+17, 10) })
    // Body
    outline(ctx, DARK, () => rect(ctx, fx+12, 14, 9, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+13, 15, 7, 6))
    // Legs
    outline(ctx, DARK, () => { rect(ctx, fx+11, 22, 4, 8); rect(ctx, fx+17, 22, 4, 8) })
    fill(ctx, MAIN, () => { rect(ctx, fx+12, 23, 2, 6); rect(ctx, fx+18, 23, 2, 6) })
    // Dagger pulled back
    fill(ctx, LIGHT, () => rect(ctx, fx+6, 14, 4, 1))
    fill(ctx, DARK, () => rect(ctx, fx+10, 13, 2, 3))
  }

  function release() {
    // Hood
    fill(ctx, DARK, () => { rect(ctx, fx+18, 5, 6, 3); px(ctx, fx+20, 4) })
    // Head lunging forward
    outline(ctx, DARK, () => rect(ctx, fx+17, 8, 7, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+18, 9, 5, 4))
    fill(ctx, DARK, () => { px(ctx, fx+19, 10); px(ctx, fx+21, 10) })
    // Body lunging
    outline(ctx, DARK, () => rect(ctx, fx+15, 14, 9, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+16, 15, 7, 6))
    // Legs extended
    outline(ctx, DARK, () => { rect(ctx, fx+10, 22, 4, 8); rect(ctx, fx+20, 22, 4, 8) })
    fill(ctx, MAIN, () => { rect(ctx, fx+11, 23, 2, 6); rect(ctx, fx+21, 23, 2, 6) })
    // Dagger thrust forward
    fill(ctx, LIGHT, () => rect(ctx, fx+25, 15, 5, 1))
    fill(ctx, DARK, () => rect(ctx, fx+24, 14, 2, 3))
  }

  function hit() {
    // Hood
    fill(ctx, DARK, () => { rect(ctx, fx+10, 5, 6, 3); px(ctx, fx+12, 4) })
    // Head recoiling
    outline(ctx, DARK, () => rect(ctx, fx+9, 8, 7, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+10, 9, 5, 4))
    fill(ctx, DARK, () => { px(ctx, fx+11, 10); px(ctx, fx+13, 10) })
    // Body
    outline(ctx, DARK, () => rect(ctx, fx+8, 14, 9, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+9, 15, 7, 6))
    // Legs
    outline(ctx, DARK, () => { rect(ctx, fx+8, 22, 4, 8); rect(ctx, fx+14, 22, 4, 8) })
    fill(ctx, MAIN, () => { rect(ctx, fx+9, 23, 2, 6); rect(ctx, fx+15, 23, 2, 6) })
    // Dagger loose
    fill(ctx, LIGHT, () => rect(ctx, fx+19, 20, 3, 1))
  }

  function ko() {
    // Face down on ground
    outline(ctx, DARK, () => rect(ctx, fx+4, 24, 18, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+5, 25, 16, 4))
    // Head face down
    outline(ctx, DARK, () => rect(ctx, fx+22, 24, 6, 5))
    fill(ctx, MAIN, () => rect(ctx, fx+23, 25, 4, 3))
    // Hood
    fill(ctx, DARK, () => rect(ctx, fx+22, 23, 6, 2))
    // Dagger on ground
    fill(ctx, LIGHT, () => rect(ctx, fx+2, 27, 4, 1))
  }

  ;[idle, windup, release, hit, ko][Math.floor(fx / 32)]()
}

// ─── PRIEST ─────────────────────────────────────────────────────────────────

function drawPriest(ctx, fx) {
  const MAIN = '#1E40AF'
  const DARK = '#1E3A8A'
  const LIGHT = '#93C5FD'

  function idle() {
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+13, 4, 8, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+14, 5, 6, 6))
    fill(ctx, DARK, () => { px(ctx, fx+15, 7); px(ctx, fx+18, 7) })
    // Robed body (wide)
    outline(ctx, DARK, () => rect(ctx, fx+10, 12, 14, 12))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 13, 12, 10))
    // Robe bottom
    outline(ctx, DARK, () => rect(ctx, fx+9, 24, 16, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+10, 25, 14, 4))
    // Staff with circle top (right side)
    fill(ctx, LIGHT, () => rect(ctx, fx+26, 6, 2, 22))
    // Circle on staff top
    fill(ctx, LIGHT, () => { rect(ctx, fx+25, 2, 4, 1); rect(ctx, fx+24, 3, 6, 3); rect(ctx, fx+25, 6, 4, 1) })
    fill(ctx, MAIN, () => rect(ctx, fx+26, 4, 2, 1)) // hollow center
  }

  function windup() {
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+13, 4, 8, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+14, 5, 6, 6))
    fill(ctx, DARK, () => { px(ctx, fx+15, 7); px(ctx, fx+18, 7) })
    // Body
    outline(ctx, DARK, () => rect(ctx, fx+10, 12, 14, 12))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 13, 12, 10))
    outline(ctx, DARK, () => rect(ctx, fx+9, 24, 16, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+10, 25, 14, 4))
    // Staff raised
    fill(ctx, LIGHT, () => rect(ctx, fx+26, 0, 2, 22))
    // Circle on staff top (glowing)
    fill(ctx, '#FBBF24', () => { rect(ctx, fx+25, 0, 4, 1); rect(ctx, fx+24, 0, 6, 1) })
    fill(ctx, LIGHT, () => { px(ctx, fx+23, 0); px(ctx, fx+30, 0) }) // glow
  }

  function release() {
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+13, 4, 8, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+14, 5, 6, 6))
    fill(ctx, DARK, () => { px(ctx, fx+15, 7); px(ctx, fx+18, 7) })
    // Body
    outline(ctx, DARK, () => rect(ctx, fx+10, 12, 14, 12))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 13, 12, 10))
    outline(ctx, DARK, () => rect(ctx, fx+9, 24, 16, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+10, 25, 14, 4))
    // Staff forward
    fill(ctx, LIGHT, () => rect(ctx, fx+26, 6, 2, 18))
    fill(ctx, LIGHT, () => { rect(ctx, fx+25, 2, 4, 1); rect(ctx, fx+24, 3, 6, 3); rect(ctx, fx+25, 6, 4, 1) })
    // Healing beam (dots going forward from staff)
    fill(ctx, '#FBBF24', () => { px(ctx, fx+28, 8); px(ctx, fx+30, 7); px(ctx, fx+29, 10) })
    fill(ctx, LIGHT, () => { px(ctx, fx+28, 6); px(ctx, fx+30, 5); px(ctx, fx+31, 8) })
  }

  function hit() {
    // Head
    outline(ctx, DARK, () => rect(ctx, fx+10, 5, 8, 8))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 6, 6, 6))
    fill(ctx, DARK, () => { px(ctx, fx+12, 8); px(ctx, fx+15, 8) })
    // Body stumbling
    outline(ctx, DARK, () => rect(ctx, fx+8, 13, 14, 12))
    fill(ctx, MAIN, () => rect(ctx, fx+9, 14, 12, 10))
    outline(ctx, DARK, () => rect(ctx, fx+7, 25, 16, 5))
    fill(ctx, MAIN, () => rect(ctx, fx+8, 26, 14, 3))
    // Staff tilted
    fill(ctx, LIGHT, () => rect(ctx, fx+22, 10, 2, 18))
  }

  function ko() {
    // Kneeling
    // Head bowed
    outline(ctx, DARK, () => rect(ctx, fx+13, 14, 8, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+14, 15, 6, 4))
    fill(ctx, DARK, () => { px(ctx, fx+15, 17); px(ctx, fx+18, 17) })
    // Body kneeling
    outline(ctx, DARK, () => rect(ctx, fx+11, 20, 12, 6))
    fill(ctx, MAIN, () => rect(ctx, fx+12, 21, 10, 4))
    // Knees on ground
    outline(ctx, DARK, () => rect(ctx, fx+10, 26, 14, 4))
    fill(ctx, MAIN, () => rect(ctx, fx+11, 27, 12, 2))
    // Staff fallen beside
    fill(ctx, LIGHT, () => rect(ctx, fx+2, 28, 8, 2))
  }

  ;[idle, windup, release, hit, ko][Math.floor(fx / 32)]()
}

// ─── CROWN ──────────────────────────────────────────────────────────────────

function drawCrown(ctx) {
  const GOLD = '#FBBF24'
  const DARK = '#92400E'
  const LIGHT = '#FDE68A'

  // Base
  fill(ctx, DARK, () => rect(ctx, 4, 16, 16, 4))
  fill(ctx, GOLD, () => rect(ctx, 5, 17, 14, 2))

  // Crown body
  fill(ctx, DARK, () => rect(ctx, 4, 8, 16, 9))
  fill(ctx, GOLD, () => rect(ctx, 5, 9, 14, 7))

  // Three points
  fill(ctx, DARK, () => {
    rect(ctx, 5, 4, 3, 5)   // left point
    rect(ctx, 10, 2, 4, 7)  // center point
    rect(ctx, 16, 4, 3, 5)  // right point
  })
  fill(ctx, GOLD, () => {
    rect(ctx, 6, 5, 1, 3)   // left point inner
    rect(ctx, 11, 3, 2, 5)  // center point inner
    rect(ctx, 17, 5, 1, 3)  // right point inner
  })

  // Gems
  fill(ctx, '#EF4444', () => { px(ctx, 8, 13); px(ctx, 12, 13); px(ctx, 16, 13) })

  // Highlights
  fill(ctx, LIGHT, () => { px(ctx, 6, 10); px(ctx, 11, 4); px(ctx, 17, 10) })
}

// ─── GENERATE ALL ───────────────────────────────────────────────────────────

const figurines = ['warrior', 'mage', 'archer', 'engineer', 'assassin', 'priest']
const drawFns = [drawWarrior, drawMage, drawArcher, drawEngineer, drawAssassin, drawPriest]

const atlas = {}

for (let i = 0; i < figurines.length; i++) {
  const canvas = createCanvas(160, 32)
  const ctx = canvas.getContext('2d')

  for (let f = 0; f < 5; f++) {
    drawFns[i](ctx, f * 32)
  }

  const path = `public/sprites/${figurines[i]}.png`
  writeFileSync(path, canvas.toBuffer('image/png'))
  console.log(`  ✓ ${path}`)

  const frames = ['idle', 'windup', 'release', 'hit', 'ko']
  atlas[figurines[i]] = {}
  for (let f = 0; f < 5; f++) {
    atlas[figurines[i]][frames[f]] = { x: f * 32, y: 0, w: 32, h: 32 }
  }
}

// Crown
const crownCanvas = createCanvas(24, 24)
const crownCtx = crownCanvas.getContext('2d')
drawCrown(crownCtx)
writeFileSync('public/sprites/crown.png', crownCanvas.toBuffer('image/png'))
console.log('  ✓ public/sprites/crown.png')

atlas['crown'] = { idle: { x: 0, y: 0, w: 24, h: 24 } }

writeFileSync('public/sprites/atlas.json', JSON.stringify(atlas, null, 2))
console.log('  ✓ public/sprites/atlas.json')

console.log('\nDone! Generated all sprite sheets.')

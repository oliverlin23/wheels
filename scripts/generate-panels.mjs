import { createCanvas } from '@napi-rs/canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'sprites')
mkdirSync(outDir, { recursive: true })

// Colors
const PAPER_CREAM = '#F5F1E8'
const PAPER_DIM = '#EDE7D6'
const MUSTARD = '#D97706'
const MUSTARD_DARK = '#92400E'
const TEAL = '#0F766E'
const TEAL_DARK = '#134E4A'
const GRAPHITE = '#475569'
const GRAPHITE_LIGHT = '#64748B'

function px(ctx, x, y, color) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, 1, 1)
}

function fillBg(ctx, color) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 16, 16)
}

// Draw a 1px outline ring around the entire 16x16 panel
function drawOutlineRing(ctx, color) {
  ctx.fillStyle = color
  for (let i = 0; i < 16; i++) {
    px(ctx, i, 0, color)   // top
    px(ctx, i, 15, color)  // bottom
    px(ctx, 0, i, color)   // left
    px(ctx, 15, i, color)  // right
  }
}

// Draw tiny 2px star (plus shape) at center (cx, cy)
function drawStar(ctx, cx, cy, color) {
  px(ctx, cx, cy, color)
  px(ctx, cx - 1, cy, color)
  px(ctx, cx + 1, cy, color)
  px(ctx, cx, cy - 1, color)
  px(ctx, cx, cy + 1, color)
}

// --- SQUARE ---
function drawSquare(ctx) {
  // Rounded square ~12x12 centered => from (2,2) to (13,13)
  // Outline first
  ctx.fillStyle = MUSTARD_DARK
  for (let y = 3; y <= 12; y++) {
    for (let x = 2; x <= 13; x++) {
      px(ctx, x, y, MUSTARD_DARK)
    }
  }
  // top/bottom rows narrower for rounding
  for (let x = 3; x <= 12; x++) {
    px(ctx, x, 2, MUSTARD_DARK)
    px(ctx, x, 13, MUSTARD_DARK)
  }

  // Fill interior
  ctx.fillStyle = MUSTARD
  for (let y = 4; y <= 11; y++) {
    for (let x = 3; x <= 12; x++) {
      px(ctx, x, y, MUSTARD)
    }
  }
  // top/bottom interior rows
  for (let x = 4; x <= 11; x++) {
    px(ctx, x, 3, MUSTARD)
    px(ctx, x, 12, MUSTARD)
  }
}

// --- DIAMOND ---
function drawDiamond(ctx) {
  // Diamond (rotated square) centered at (7.5, 7.5), ~12px diagonal
  // We draw a rhombus pixel by pixel
  const cx = 7.5
  const cy = 7.5
  const r = 6 // half-diagonal

  // Outline pass
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const dist = Math.abs(x + 0.5 - cx) + Math.abs(y + 0.5 - cy)
      if (dist <= r) {
        px(ctx, x, y, TEAL_DARK)
      }
    }
  }
  // Fill interior
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const dist = Math.abs(x + 0.5 - cx) + Math.abs(y + 0.5 - cy)
      if (dist <= r - 1) {
        px(ctx, x, y, TEAL)
      }
    }
  }
}

// --- HAMMER ---
function drawHammer(ctx) {
  // Hammer T-shape: head across top-center, handle going down
  // Head: rows 3-6, cols 4-11
  // Handle: rows 7-12, cols 7-8

  // Head outline
  for (let y = 3; y <= 6; y++) {
    for (let x = 4; x <= 11; x++) {
      px(ctx, x, y, GRAPHITE)
    }
  }
  // Handle
  for (let y = 7; y <= 12; y++) {
    for (let x = 7; x <= 8; x++) {
      px(ctx, x, y, GRAPHITE)
    }
  }

  // Highlight on left edge of head and top of handle
  for (let y = 3; y <= 6; y++) {
    px(ctx, 4, y, GRAPHITE_LIGHT)
  }
  px(ctx, 5, 3, GRAPHITE_LIGHT)
  px(ctx, 6, 3, GRAPHITE_LIGHT)
  px(ctx, 7, 3, GRAPHITE_LIGHT)
}

// --- Generate PNGs ---

function generate(name, bgColor, drawFn, xp, xpColor) {
  const canvas = createCanvas(16, 16)
  const ctx = canvas.getContext('2d')

  fillBg(ctx, bgColor)

  if (xp) {
    drawOutlineRing(ctx, xpColor)
  }

  drawFn(ctx)

  if (xp) {
    // Draw 3 tiny stars around the symbol
    drawStar(ctx, 3, 3, xpColor)
    drawStar(ctx, 12, 3, xpColor)
    drawStar(ctx, 12, 12, xpColor)
  }

  const buf = canvas.toBuffer('image/png')
  const outPath = join(outDir, name)
  writeFileSync(outPath, buf)
  console.log(`Wrote ${outPath}`)
}

// Regular panels
generate('panel-square.png', PAPER_CREAM, drawSquare, false)
generate('panel-diamond.png', PAPER_CREAM, drawDiamond, false)
generate('panel-hammer.png', PAPER_CREAM, drawHammer, false)

// XP variants
generate('panel-square-xp.png', PAPER_DIM, drawSquare, true, MUSTARD)
generate('panel-diamond-xp.png', PAPER_DIM, drawDiamond, true, TEAL)
generate('panel-hammer-xp.png', PAPER_DIM, drawHammer, true, GRAPHITE)

console.log('Done! Generated 6 panel PNGs.')

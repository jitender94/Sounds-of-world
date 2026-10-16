/**
 * Every tradition wears its own seal: an ivory medallion embossed in gold with
 * a motif taken from that music's defining instrument or ornament. The frame
 * is shared so the set reads as one collection; the centre is always specific.
 *
 * Shared by the globe markers and the detail page, so a tradition looks the
 * same wherever it appears.
 */

/** Paint a tradition's seal onto any 2D context, filling `size` × `size`. */
export function drawSeal(ctx, size, sealId) {
  const cx = size / 2
  const R = size * 0.4

  // Gold leaf: deep body with a champagne highlight, so it reads as embossed.
  const gold = ctx.createLinearGradient(size * 0.15, size * 0.1, size * 0.85, size * 0.9)
  gold.addColorStop(0, '#E7C463')
  gold.addColorStop(0.32, '#C79A3B')
  gold.addColorStop(0.55, '#9A7328')
  gold.addColorStop(0.8, '#D4A840')
  gold.addColorStop(1, '#A67E2E')

  // Soft halo so the seal never has a hard edge against land or sea.
  const glow = ctx.createRadialGradient(cx, cx, R * 0.9, cx, cx, R * 1.18)
  glow.addColorStop(0, 'rgba(122, 90, 30, 0.28)')
  glow.addColorStop(1, 'rgba(122, 90, 30, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, cx, R * 1.18, 0, Math.PI * 2)
  ctx.fill()

  // Warm ivory disc.
  const disc = ctx.createRadialGradient(cx, cx * 0.82, size * 0.04, cx, cx, R)
  disc.addColorStop(0, '#FDF6E4')
  disc.addColorStop(0.75, '#F1E1BB')
  disc.addColorStop(1, '#DDC58A')
  ctx.beginPath()
  ctx.arc(cx, cx, R, 0, Math.PI * 2)
  ctx.fillStyle = disc
  ctx.shadowColor = 'rgba(60, 40, 12, 0.42)'
  ctx.shadowBlur = size * 0.06
  ctx.shadowOffsetY = size * 0.02
  ctx.fill()
  ctx.shadowColor = 'transparent'

  ctx.strokeStyle = gold
  ctx.fillStyle = gold
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // Twin gold rims — the frame every seal shares.
  ring(ctx, cx, R * 0.98, size * 0.02)
  ring(ctx, cx, R * 0.86, size * 0.011)

  ;(SEALS[sealId] || SEALS.lotus)(ctx, cx, R, size)
}

/**
 * The same motif drawn large and unframed — a gold line illustration of the
 * instrument behind the music, for the now-playing card. No ivory disc, so it
 * sits directly on the dark glass.
 */
export function drawIllustration(ctx, size, sealId) {
  const cx = size / 2
  const R = size * 0.46

  const gold = ctx.createLinearGradient(size * 0.1, 0, size * 0.9, size)
  gold.addColorStop(0, '#F6E3A6')
  gold.addColorStop(0.4, '#E7C765')
  gold.addColorStop(0.7, '#C79A3B')
  gold.addColorStop(1, '#EBD08A')

  // A soft aura so the drawing has depth against the glass.
  const aura = ctx.createRadialGradient(cx, cx, R * 0.1, cx, cx, R * 1.25)
  aura.addColorStop(0, 'rgba(231, 199, 101, 0.16)')
  aura.addColorStop(1, 'rgba(231, 199, 101, 0)')
  ctx.fillStyle = aura
  ctx.beginPath()
  ctx.arc(cx, cx, R * 1.25, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = gold
  ctx.fillStyle = gold
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.shadowColor = 'rgba(231, 199, 101, 0.35)'
  ctx.shadowBlur = size * 0.03
  ;(SEALS[sealId] || SEALS.lotus)(ctx, cx, R, size * 1.16)
  ctx.shadowColor = 'transparent'
}

// ---------------------------------------------------------------- primitives

function ring(ctx, cx, r, w) {
  ctx.lineWidth = w
  ctx.beginPath()
  ctx.arc(cx, cx, r, 0, Math.PI * 2)
  ctx.stroke()
}

/** Teardrop petal pointing outward from the centre. */
function petal(ctx, cx, angle, dist, len) {
  ctx.save()
  ctx.translate(cx + Math.cos(angle) * dist, cx + Math.sin(angle) * dist)
  ctx.rotate(angle + Math.PI / 2)
  ctx.beginPath()
  ctx.moveTo(0, -len / 2)
  ctx.quadraticCurveTo(len * 0.42, 0, 0, len / 2)
  ctx.quadraticCurveTo(-len * 0.42, 0, 0, -len / 2)
  ctx.stroke()
  ctx.restore()
}

/** Radial spoke at `angle`, from r0 to r1. */
function spoke(ctx, cx, angle, r0, r1) {
  ctx.beginPath()
  ctx.moveTo(cx + Math.cos(angle) * r0, cx + Math.sin(angle) * r0)
  ctx.lineTo(cx + Math.cos(angle) * r1, cx + Math.sin(angle) * r1)
  ctx.stroke()
}

/** Small centre jewel. */
function hub(ctx, cx, R, size) {
  ring(ctx, cx, R * 0.13, size * 0.012)
  ctx.beginPath()
  ctx.arc(cx, cx, R * 0.05, 0, Math.PI * 2)
  ctx.fill()
}

/** A regular polygon outline. */
function polygon(ctx, cx, n, r, rot = -Math.PI / 2) {
  ctx.beginPath()
  for (let i = 0; i <= n; i++) {
    const a = rot + (i / n) * Math.PI * 2
    const x = cx + Math.cos(a) * r
    const y = cx + Math.sin(a) * r
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.stroke()
}

/** Vertical pipes in descending length — panpipe rafts, zither strings. */
function pipes(ctx, cx, R, size, n, longest, shortest, lw) {
  ctx.lineWidth = size * lw
  const span = R * 1.06
  const top = cx - R * 0.56
  for (let i = 0; i < n; i++) {
    const x = cx - span / 2 + (i / (n - 1)) * span
    const len = R * (longest - (i / (n - 1)) * (longest - shortest))
    ctx.beginPath()
    ctx.moveTo(x, top)
    ctx.lineTo(x, top + len)
    ctx.stroke()
  }
  return { top, span }
}

/** A drum body: tapered shell with rope lacing. */
function drumBody(ctx, cx, R, size, taper) {
  ctx.lineWidth = size * 0.012
  const topY = cx - R * 0.5
  const botY = cx + R * 0.56
  const topW = R * 0.66
  const botW = R * taper
  ctx.beginPath()
  ctx.moveTo(cx - topW, topY)
  ctx.lineTo(cx + topW, topY)
  ctx.lineTo(cx + botW, botY)
  ctx.lineTo(cx - botW, botY)
  ctx.closePath()
  ctx.stroke()
  // Zig-zag lacing between the heads.
  ctx.lineWidth = size * 0.006
  ctx.beginPath()
  const n = 8
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const x1 = cx - topW + t * topW * 2
    const x2 = cx - botW + ((i + 0.5) / n) * botW * 2
    ctx.moveTo(x1, topY + R * 0.08)
    ctx.lineTo(x2, botY - R * 0.08)
  }
  ctx.stroke()
}

// -------------------------------------------------------------------- motifs

const SEALS = {
  // South Asia --------------------------------------------------------------
  /** Hindustani — the lotus, emblem of Indian classical art. */
  lotus: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.01
    for (let i = 0; i < 8; i++) petal(ctx, cx, (i / 8) * Math.PI * 2 - Math.PI / 2, R * 0.72, R * 0.34)
    for (let i = 0; i < 8; i++) petal(ctx, cx, (i / 8) * Math.PI * 2 + Math.PI / 8, R * 0.5, R * 0.24)
    hub(ctx, cx, R, size)
  },
  /** Carnatic — the veena: gourd, fretted neck, and its seven strings. */
  veena: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.012
    ctx.beginPath() // resonating gourd
    ctx.arc(cx - R * 0.3, cx + R * 0.28, R * 0.34, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath() // neck
    ctx.moveTo(cx - R * 0.12, cx + R * 0.08)
    ctx.lineTo(cx + R * 0.62, cx - R * 0.6)
    ctx.stroke()
    ctx.lineWidth = size * 0.006
    for (let i = 0; i < 6; i++) { // frets
      const t = i / 5
      const x = cx - R * 0.06 + t * R * 0.62
      const y = cx + R * 0.02 - t * R * 0.58
      ctx.beginPath()
      ctx.moveTo(x - R * 0.07, y - R * 0.075)
      ctx.lineTo(x + R * 0.07, y + R * 0.075)
      ctx.stroke()
    }
  },
  /** Qawwali — harmonium bellows, opening and closing. */
  bellows: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.011
    const w = R * 0.66
    ctx.strokeRect(cx - w, cx - R * 0.46, w * 2, R * 0.92)
    ctx.lineWidth = size * 0.007
    ctx.beginPath() // pleats
    for (let i = 1; i < 7; i++) {
      const x = cx - w + (i / 7) * w * 2
      ctx.moveTo(x, cx - R * 0.46)
      ctx.lineTo(x + (i % 2 ? R * 0.07 : -R * 0.07), cx + R * 0.46)
    }
    ctx.stroke()
    ctx.lineWidth = size * 0.009
    ctx.beginPath() // keyboard strip
    ctx.moveTo(cx - w, cx + R * 0.2)
    ctx.lineTo(cx + w, cx + R * 0.2)
    ctx.stroke()
  },
  /** Bhangra — the dhol, roped and slung. */
  dhol: (ctx, cx, R, size) => {
    drumBody(ctx, cx, R, size, 0.66)
    ctx.lineWidth = size * 0.009
    ctx.beginPath() // two beaters crossed above
    ctx.moveTo(cx - R * 0.5, cx - R * 0.66)
    ctx.lineTo(cx + R * 0.5, cx - R * 0.72)
    ctx.stroke()
  },

  // West Africa -------------------------------------------------------------
  /** Griot — 21 kora strings fanning from the bridge. */
  kora: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.007
    for (let i = 0; i < 21; i++) spoke(ctx, cx, (i / 21) * Math.PI * 2 - Math.PI / 2, R * 0.18, R * 0.8)
    ring(ctx, cx, R * 0.46, size * 0.009)
    hub(ctx, cx, R, size)
  },
  /** Djembe — goblet drum seen head-on. */
  djembe: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.013
    ctx.beginPath()
    ctx.ellipse(cx, cx - R * 0.42, R * 0.6, R * 0.17, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath() // waisted body
    ctx.moveTo(cx - R * 0.6, cx - R * 0.42)
    ctx.quadraticCurveTo(cx - R * 0.16, cx + R * 0.1, cx - R * 0.3, cx + R * 0.66)
    ctx.moveTo(cx + R * 0.6, cx - R * 0.42)
    ctx.quadraticCurveTo(cx + R * 0.16, cx + R * 0.1, cx + R * 0.3, cx + R * 0.66)
    ctx.stroke()
    ctx.lineWidth = size * 0.006
    for (let i = 0; i < 6; i++) { // vertical rope tension lines
      const x = cx - R * 0.5 + (i / 5) * R
      ctx.beginPath()
      ctx.moveTo(x, cx - R * 0.3)
      ctx.lineTo(x * 0.5 + cx * 0.5, cx + R * 0.3)
      ctx.stroke()
    }
  },
  /** Afrobeat & Balkan brass — a flared horn bell with sound rings. */
  horn: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.013
    ctx.beginPath() // bell
    ctx.moveTo(cx - R * 0.62, cx - R * 0.5)
    ctx.quadraticCurveTo(cx - R * 0.1, cx - R * 0.06, cx - R * 0.12, cx + R * 0.62)
    ctx.lineTo(cx + R * 0.12, cx + R * 0.62)
    ctx.quadraticCurveTo(cx + R * 0.1, cx - R * 0.06, cx + R * 0.62, cx - R * 0.5)
    ctx.stroke()
    ctx.lineWidth = size * 0.007
    for (const r of [0.78, 0.9]) { // sound radiating from the bell
      ctx.beginPath()
      ctx.arc(cx, cx - R * 0.5, R * r, Math.PI * 1.12, Math.PI * 1.88)
      ctx.stroke()
    }
  },

  // Latin America -----------------------------------------------------------
  /** Andean — siku panpipes, twice bound. */
  panpipes: (ctx, cx, R, size) => {
    const { top, span } = pipes(ctx, cx, R, size, 7, 1.06, 0.4, 0.013)
    ctx.lineWidth = size * 0.008
    for (const y of [top + R * 0.18, top + R * 0.46]) {
      ctx.beginPath()
      ctx.moveTo(cx - span / 2 - R * 0.05, y)
      ctx.lineTo(cx + span / 2 + R * 0.05, y - R * 0.05)
      ctx.stroke()
    }
  },
  /** Son Cubano — crossed claves over the five-stroke pattern. */
  claves: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.028
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(cx - R * 0.56, cx - R * 0.34)
    ctx.lineTo(cx + R * 0.56, cx + R * 0.1)
    ctx.moveTo(cx - R * 0.56, cx + R * 0.1)
    ctx.lineTo(cx + R * 0.56, cx - R * 0.34)
    ctx.stroke()
    // The clave rhythm: 3 strokes then 2.
    ctx.lineWidth = size * 0.014
    const ys = cx + R * 0.5
    for (const x of [-0.5, -0.24, 0.02, 0.32, 0.56]) {
      ctx.beginPath()
      ctx.moveTo(cx + R * x, ys - R * 0.09)
      ctx.lineTo(cx + R * x, ys + R * 0.09)
      ctx.stroke()
    }
  },
  /** Tango — the bandoneón, drawn open with its pleats. */
  bandoneon: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.012
    for (const dir of [-1, 1]) { // end boxes
      ctx.strokeRect(cx + dir * R * 0.56 - R * 0.16, cx - R * 0.44, R * 0.32, R * 0.88)
    }
    ctx.lineWidth = size * 0.008
    ctx.beginPath() // concertina pleats
    for (let i = 0; i <= 8; i++) {
      const x = cx - R * 0.4 + (i / 8) * R * 0.8
      ctx.moveTo(x, cx - R * (i % 2 ? 0.3 : 0.4))
      ctx.lineTo(x, cx + R * (i % 2 ? 0.3 : 0.4))
    }
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx - R * 0.4, cx - R * 0.4)
    ctx.lineTo(cx + R * 0.4, cx - R * 0.4)
    ctx.moveTo(cx - R * 0.4, cx + R * 0.4)
    ctx.lineTo(cx + R * 0.4, cx + R * 0.4)
    ctx.stroke()
  },
  /** Samba — the pandeiro: a frame drum ringed with jingles. */
  tambourine: (ctx, cx, R, size) => {
    ring(ctx, cx, R * 0.66, size * 0.014)
    ring(ctx, cx, R * 0.52, size * 0.007)
    for (let i = 0; i < 8; i++) { // jingle pairs around the rim
      const a = (i / 8) * Math.PI * 2
      const px = cx + Math.cos(a) * R * 0.66
      const py = cx + Math.sin(a) * R * 0.66
      ctx.lineWidth = size * 0.007
      ctx.beginPath()
      ctx.ellipse(px, py, R * 0.11, R * 0.05, a, 0, Math.PI * 2)
      ctx.stroke()
    }
    hub(ctx, cx, R, size)
  },

  // East Asia ---------------------------------------------------------------
  /** Chinese classical — cloud-and-wave scrollwork. */
  cloud: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.009
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      ctx.beginPath()
      ctx.arc(cx + Math.cos(a) * R * 0.46, cx + Math.sin(a) * R * 0.46, R * 0.2, a + 0.6, a + Math.PI * 1.7)
      ctx.stroke()
    }
    ring(ctx, cx, R * 0.28, size * 0.01)
    hub(ctx, cx, R, size)
  },
  /** Koto — strings crossing the movable bridges. */
  koto: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.008
    for (let i = 0; i < 7; i++) { // strings
      const y = cx - R * 0.5 + (i / 6) * R
      ctx.beginPath()
      ctx.moveTo(cx - R * 0.76, y)
      ctx.lineTo(cx + R * 0.76, y)
      ctx.stroke()
    }
    ctx.lineWidth = size * 0.009
    for (let i = 0; i < 7; i++) { // ji bridges, staggered
      const y = cx - R * 0.5 + (i / 6) * R
      const x = cx + Math.sin(i * 1.1) * R * 0.36
      ctx.beginPath()
      ctx.moveTo(x - R * 0.07, y + R * 0.09)
      ctx.lineTo(x, y - R * 0.07)
      ctx.lineTo(x + R * 0.07, y + R * 0.09)
      ctx.stroke()
    }
  },
  /** Korean gugak — the janggu hourglass drum. */
  gayageum: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.013
    ctx.beginPath() // hourglass waist
    ctx.moveTo(cx - R * 0.62, cx - R * 0.5)
    ctx.quadraticCurveTo(cx - R * 0.1, cx, cx - R * 0.62, cx + R * 0.5)
    ctx.moveTo(cx + R * 0.62, cx - R * 0.5)
    ctx.quadraticCurveTo(cx + R * 0.1, cx, cx + R * 0.62, cx + R * 0.5)
    ctx.stroke()
    ctx.lineWidth = size * 0.011
    for (const dir of [-1, 1]) { // the two heads
      ctx.beginPath()
      ctx.ellipse(cx + dir * R * 0.62, cx, R * 0.1, R * 0.5, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.lineWidth = size * 0.006
    ctx.beginPath() // tension cords
    for (let i = 0; i < 5; i++) {
      const y = cx - R * 0.34 + (i / 4) * R * 0.68
      ctx.moveTo(cx - R * 0.5, y)
      ctx.lineTo(cx + R * 0.5, y)
    }
    ctx.stroke()
  },

  // Middle East -------------------------------------------------------------
  /** Maqam — the eight-point Islamic star of an oud rosette. */
  'islamic-star': (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.01
    polygon(ctx, cx, 4, R * 0.66, -Math.PI / 2)
    polygon(ctx, cx, 4, R * 0.66, -Math.PI / 2 + Math.PI / 4)
    ctx.lineWidth = size * 0.008
    polygon(ctx, cx, 4, R * 0.38, Math.PI / 8)
    polygon(ctx, cx, 4, R * 0.38, Math.PI / 8 + Math.PI / 4)
    hub(ctx, cx, R, size)
  },
  /** Persian — a shamsa medallion with radiating lobes. */
  'persian-medallion': (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.009
    const lobes = 12
    ctx.beginPath()
    for (let i = 0; i <= lobes * 4; i++) {
      const t = i / (lobes * 4)
      const a = t * Math.PI * 2 - Math.PI / 2
      const rr = R * (0.58 + 0.16 * Math.cos(t * Math.PI * 2 * lobes))
      const x = cx + Math.cos(a) * rr
      const y = cx + Math.sin(a) * rr
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
    ring(ctx, cx, R * 0.34, size * 0.008)
    for (let i = 0; i < 6; i++) petal(ctx, cx, (i / 6) * Math.PI * 2, R * 0.2, R * 0.2)
    hub(ctx, cx, R, size)
  },
  /** Mevlevi — the whirl of the sema, with the reed at its centre. */
  whirl: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.009
    for (const off of [0, Math.PI * 0.66, Math.PI * 1.33]) {
      ctx.beginPath()
      for (let i = 0; i <= 60; i++) {
        const t = i / 60
        const a = off + t * Math.PI * 2.2
        const rr = R * (0.12 + t * 0.66)
        const x = cx + Math.cos(a) * rr
        const y = cx + Math.sin(a) * rr
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.lineWidth = size * 0.012
    ctx.beginPath() // the ney, upright at the centre
    ctx.moveTo(cx, cx - R * 0.34)
    ctx.lineTo(cx, cx + R * 0.34)
    ctx.stroke()
  },

  // Europe ------------------------------------------------------------------
  /** Celtic — the triquetra knot flanked by f-holes. */
  triquetra: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.013
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2
      ctx.beginPath()
      ctx.arc(cx + Math.cos(a) * R * 0.2, cx + Math.sin(a) * R * 0.2, R * 0.3, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.lineWidth = size * 0.009
    for (const dir of [-1, 1]) {
      const x = cx + dir * R * 0.66
      ctx.beginPath()
      ctx.moveTo(x - dir * R * 0.07, cx - R * 0.4)
      ctx.bezierCurveTo(x + dir * R * 0.1, cx - R * 0.18, x - dir * R * 0.1, cx + R * 0.18, x + dir * R * 0.07, cx + R * 0.4)
      ctx.stroke()
    }
  },
  /** Flamenco — a guitar rosette over the twelve-count cycle. */
  'guitar-rosette': (ctx, cx, R, size) => {
    ring(ctx, cx, R * 0.44, size * 0.016)
    ring(ctx, cx, R * 0.32, size * 0.008)
    ctx.lineWidth = size * 0.007
    for (let i = 0; i < 24; i++) { // mosaic banding
      const a = (i / 24) * Math.PI * 2
      spoke(ctx, cx, a, R * 0.32, R * 0.44)
    }
    // The compás: twelve marks, five of them accented.
    const accents = new Set([0, 3, 6, 8, 10])
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2
      ctx.lineWidth = size * (accents.has(i) ? 0.016 : 0.007)
      spoke(ctx, cx, a, R * 0.62, R * (accents.has(i) ? 0.82 : 0.74))
    }
  },
  /** Fado — the teardrop soundhole of the Portuguese guitar. */
  teardrop: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.013
    ctx.beginPath() // teardrop
    ctx.moveTo(cx, cx - R * 0.62)
    ctx.bezierCurveTo(cx + R * 0.5, cx - R * 0.1, cx + R * 0.34, cx + R * 0.52, cx, cx + R * 0.52)
    ctx.bezierCurveTo(cx - R * 0.34, cx + R * 0.52, cx - R * 0.5, cx - R * 0.1, cx, cx - R * 0.62)
    ctx.stroke()
    ctx.lineWidth = size * 0.006
    for (let i = 0; i < 6; i++) { // six courses of strings
      const x = cx - R * 0.3 + (i / 5) * R * 0.6
      ctx.beginPath()
      ctx.moveTo(x, cx - R * 0.3)
      ctx.lineTo(x, cx + R * 0.44)
      ctx.stroke()
    }
  },

  // Oceania -----------------------------------------------------------------
  /** Songlines — concentric dot painting. */
  'dot-painting': (ctx, cx, R, size) => {
    for (const [rr, dots, dr] of [[R * 0.74, 22, 0.022], [R * 0.54, 16, 0.026], [R * 0.32, 10, 0.03]]) {
      for (let i = 0; i < dots; i++) {
        const a = (i / dots) * Math.PI * 2
        ctx.beginPath()
        ctx.arc(cx + Math.cos(a) * rr, cx + Math.sin(a) * rr, size * dr, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.beginPath()
    ctx.arc(cx, cx, R * 0.1, 0, Math.PI * 2)
    ctx.fill()
  },
  /** Taonga pūoro — the koru, an unfurling fern frond. */
  koru: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.016
    for (const dir of [1, -1]) {
      ctx.beginPath()
      for (let i = 0; i <= 90; i++) {
        const t = i / 90
        const a = dir * (t * Math.PI * 2.6) - Math.PI / 2
        const rr = R * 0.76 * Math.pow(1 - t, 1.25)
        const x = cx + Math.cos(a) * rr * dir
        const y = cx + Math.sin(a) * rr
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  },

  // East Africa -------------------------------------------------------------
  /** Ethiopian — the begena lyre: two arms, a yoke, strings between. */
  lyre: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.012
    ctx.beginPath()
    ctx.moveTo(cx - R * 0.5, cx + R * 0.56)
    ctx.quadraticCurveTo(cx - R * 0.72, cx - R * 0.3, cx - R * 0.34, cx - R * 0.6)
    ctx.lineTo(cx + R * 0.34, cx - R * 0.6)
    ctx.quadraticCurveTo(cx + R * 0.72, cx - R * 0.3, cx + R * 0.5, cx + R * 0.56)
    ctx.stroke()
    ctx.lineWidth = size * 0.006
    for (let i = 0; i < 6; i++) {
      const x = cx + (i / 5 - 0.5) * R * 0.62
      ctx.beginPath()
      ctx.moveTo(x, cx - R * 0.58)
      ctx.lineTo(x, cx + R * 0.5)
      ctx.stroke()
    }
  },
  /** Taarab — an oud body riding monsoon waves. */
  'wave-oud': (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.012
    ctx.beginPath() // pear-shaped body
    ctx.moveTo(cx, cx - R * 0.24)
    ctx.bezierCurveTo(cx + R * 0.5, cx - R * 0.2, cx + R * 0.38, cx + R * 0.56, cx, cx + R * 0.56)
    ctx.bezierCurveTo(cx - R * 0.38, cx + R * 0.56, cx - R * 0.5, cx - R * 0.2, cx, cx - R * 0.24)
    ctx.stroke()
    ctx.lineWidth = size * 0.009
    ctx.beginPath() // bent neck
    ctx.moveTo(cx, cx - R * 0.24)
    ctx.lineTo(cx, cx - R * 0.56)
    ctx.lineTo(cx + R * 0.16, cx - R * 0.68)
    ctx.stroke()
    ctx.lineWidth = size * 0.007
    for (let i = 0; i < 2; i++) { // waves beneath
      const y = cx + R * (0.72 + i * 0.12)
      ctx.beginPath()
      for (let j = 0; j <= 40; j++) {
        const x = cx - R * 0.62 + (j / 40) * R * 1.24
        const yy = y + Math.sin(j / 40 * Math.PI * 3) * R * 0.05
        j === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy)
      }
      ctx.stroke()
    }
  },

  // Central Asia ------------------------------------------------------------
  /** Khoomei — one voice splitting into an overtone series. */
  overtone: (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.012
    ctx.beginPath() // the fundamental: a slow wave
    for (let i = 0; i <= 60; i++) {
      const x = cx - R * 0.78 + (i / 60) * R * 1.56
      const y = cx + R * 0.34 + Math.sin((i / 60) * Math.PI * 2) * R * 0.16
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.lineWidth = size * 0.007
    ctx.beginPath() // the overtone: a fast wave above
    for (let i = 0; i <= 80; i++) {
      const x = cx - R * 0.78 + (i / 80) * R * 1.56
      const y = cx - R * 0.34 + Math.sin((i / 80) * Math.PI * 10) * R * 0.14
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.lineWidth = size * 0.008
    ctx.beginPath() // the throat they share
    ctx.arc(cx, cx, R * 0.12, 0, Math.PI * 2)
    ctx.stroke()
  },
  /** Küy — steppe diamonds with ram's-horn curls. */
  'steppe-diamond': (ctx, cx, R, size) => {
    ctx.lineWidth = size * 0.011
    polygon(ctx, cx, 4, R * 0.72)
    polygon(ctx, cx, 4, R * 0.44)
    ctx.lineWidth = size * 0.008
    for (const dir of [-1, 1]) {
      ctx.beginPath()
      ctx.arc(cx + dir * R * 0.2, cx, R * 0.16, dir > 0 ? -Math.PI / 2 : Math.PI / 2, dir > 0 ? Math.PI : 0, dir < 0)
      ctx.stroke()
    }
    hub(ctx, cx, R, size)
  },
}

/** A cluster marker: the shared frame with a count of traditions inside. */
export function drawClusterSeal(ctx, size, count) {
  const cx = size / 2
  const R = size * 0.4
  const gold = ctx.createLinearGradient(size * 0.15, size * 0.1, size * 0.85, size * 0.9)
  gold.addColorStop(0, '#E7C463')
  gold.addColorStop(0.35, '#C79A3B')
  gold.addColorStop(0.7, '#D4A840')
  gold.addColorStop(1, '#A67E2E')

  const glow = ctx.createRadialGradient(cx, cx, R * 0.9, cx, cx, R * 1.2)
  glow.addColorStop(0, 'rgba(122, 90, 30, 0.3)')
  glow.addColorStop(1, 'rgba(122, 90, 30, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, cx, R * 1.2, 0, Math.PI * 2)
  ctx.fill()

  const disc = ctx.createRadialGradient(cx, cx * 0.82, size * 0.04, cx, cx, R)
  disc.addColorStop(0, '#FDF6E4')
  disc.addColorStop(0.75, '#F1E1BB')
  disc.addColorStop(1, '#DDC58A')
  ctx.beginPath()
  ctx.arc(cx, cx, R, 0, Math.PI * 2)
  ctx.fillStyle = disc
  ctx.shadowColor = 'rgba(60, 40, 12, 0.45)'
  ctx.shadowBlur = size * 0.06
  ctx.shadowOffsetY = size * 0.02
  ctx.fill()
  ctx.shadowColor = 'transparent'

  ctx.strokeStyle = gold
  ctx.fillStyle = gold
  ring(ctx, cx, R * 0.98, size * 0.022)
  ring(ctx, cx, R * 0.86, size * 0.012)

  // A ring of small marks, one per tradition held inside.
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * R * 0.62, cx + Math.sin(a) * R * 0.62, size * 0.026, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.font = `600 ${size * 0.26}px "Cormorant Garamond", Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(count), cx, cx + size * 0.012)
}

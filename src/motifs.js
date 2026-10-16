/**
 * Sound-field overlay: concentric rings radiate from the globe when music
 * plays, beat-synced rings burst outward, sparkles drift, and resonance
 * lines ripple during card-hover auditions.
 */

const RING_SPACING = 46
const DRIFT_SPEED = 16
const BEAT_SPEED = 120
const GOLD = '196, 148, 58'
const CREAM = '243, 226, 200'
const WOOD_LIGHT = '140, 82, 40'

export function createMotifs(canvas) {
  const ctx = canvas.getContext('2d')
  let dpr = 1
  let W = 0
  let H = 0

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  window.addEventListener('resize', resize)

  let regionId = null
  let reduceMotion = false
  let fade = 0
  let phase = 0
  let elapsed = 0
  let cx = W / 2
  let cy = H * 0.57
  let innerR = Math.min(W, H) * 0.34

  const beatRings = []

  function setRegion(id) { regionId = id }
  function setDark() {}
  function setReduceMotion(v) { reduceMotion = v }

  function setCenter(x, y, r) {
    if (!isFinite(x) || !isFinite(y)) return
    cx = x
    cy = y
    if (r && isFinite(r) && r > 10) innerR = r
  }

  // ---- Page resonance (card audition) ------------------------------------
  let resonance = 0
  let resonanceOn = false
  let rx = 0
  let ry = 0
  let ripplePhase = 0

  function setResonance(on, x, y) {
    resonanceOn = on
    if (on) { rx = x; ry = y }
  }

  function drawResonance(dt, level) {
    const target = resonanceOn ? 1 : 0
    resonance += (target - resonance) * Math.min(1, dt * 3)
    if (resonance < 0.01) return
    if (!reduceMotion) ripplePhase += dt * 2.4

    const SPACING = 26
    const amp = (3 + level * 26) * resonance
    ctx.lineWidth = 1.25
    for (let y = SPACING; y < H; y += SPACING) {
      const dy = Math.abs(y - ry)
      const near = Math.exp(-((dy / (H * 0.42)) ** 2))
      const a = (0.12 + 0.4 * near) * resonance
      ctx.strokeStyle = `rgba(${WOOD_LIGHT}, ${a.toFixed(3)})`
      ctx.beginPath()
      for (let x = 0; x <= W; x += 14) {
        const d = Math.hypot(x - rx, (y - ry) * 0.55)
        const damp = Math.exp(-d / (Math.max(W, H) * 0.5))
        const off = Math.sin(d * 0.022 - ripplePhase) * amp * damp * near
        const yy = y + off
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy)
      }
      ctx.stroke()
    }
  }

  function burst() {
    if (reduceMotion) return
    if (beatRings.length < 7) beatRings.push({ r: innerR * 0.98, life: 1 })
    spawnSparkle(true)
    if (Math.random() < 0.7) spawnSparkle(true)
  }

  function update(dt, levels) {
    elapsed += dt
    const target = regionId ? 1 : 0
    fade += (target - fade) * Math.min(1, dt * 2.2)
    const level = reduceMotion ? 0 : levels?.overall || 0

    if (fade < 0.01) {
      const wantsResonance = resonanceOn || resonance > 0.01
      if (!wantsResonance) {
        ctx.clearRect(0, 0, W, H)
        return
      }
      canvas.__dirty = true
      ctx.clearRect(0, 0, W, H)
      drawResonance(dt, level)
      return
    }
    canvas.__dirty = true
    ctx.clearRect(0, 0, W, H)

    drawResonance(dt, level)
    if (!reduceMotion) phase = (phase + DRIFT_SPEED * dt) % RING_SPACING

    const maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy))

    // ---- Steady grooves (sound field) ----
    const glow = 0.55 + level * 0.75
    ctx.lineWidth = 1.1
    for (let r = innerR + phase; r < maxR; r += RING_SPACING) {
      const t = (r - innerR) / (maxR - innerR)
      const a = fade * glow * 0.16 * (1 - t) * (0.55 + 0.45 * Math.sin(t * 14 + phase * 0.05))
      if (a <= 0.004) continue
      const col = t < 0.35 ? GOLD : CREAM
      ctx.strokeStyle = `rgba(${col}, ${a})`
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.lineWidth = 0.6
    for (let r = innerR + phase + RING_SPACING / 2; r < maxR; r += RING_SPACING) {
      const t = (r - innerR) / (maxR - innerR)
      const a = fade * glow * 0.07 * (1 - t)
      if (a <= 0.004) continue
      ctx.strokeStyle = `rgba(${CREAM}, ${a})`
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
    }

    // ---- Beat rings ----
    for (let i = beatRings.length - 1; i >= 0; i--) {
      const b = beatRings[i]
      b.r += BEAT_SPEED * dt
      b.life -= dt * 0.55
      if (b.life <= 0 || b.r > maxR) {
        beatRings.splice(i, 1)
        continue
      }
      const a = fade * b.life * 0.45
      ctx.lineWidth = 2.2
      ctx.strokeStyle = `rgba(${GOLD}, ${a})`
      ctx.shadowColor = `rgba(${CREAM}, ${a * 0.9})`
      ctx.shadowBlur = 18
      ctx.beginPath()
      ctx.arc(cx, cy, b.r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    updateSparkles(dt, level)
  }

  const sparkles = []
  function updateSparkles(dt, level) {
    if (!reduceMotion && regionId && sparkles.length < 34 && Math.random() < dt * 8) {
      spawnSparkle()
    }
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i]
      s.t += dt
      s.y -= s.rise * dt
      if (s.t >= s.maxT) {
        sparkles.splice(i, 1)
        continue
      }
      const k = s.t / s.maxT
      const envelope = Math.min(1, k / 0.2) * Math.min(1, (1 - k) / 0.3)
      const twinkle = 0.35 + 0.65 * Math.pow(Math.sin(s.t * s.speed + s.phase) * 0.5 + 0.5, 2)
      const a = fade * envelope * twinkle * (0.35 + level * 0.5)
      const r = s.size * (0.8 + twinkle * 0.35)

      ctx.strokeStyle = `rgba(${s.warm ? GOLD : CREAM}, ${a})`
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(s.x - r, s.y)
      ctx.lineTo(s.x + r, s.y)
      ctx.moveTo(s.x, s.y - r)
      ctx.lineTo(s.x, s.y + r)
      ctx.stroke()
      ctx.fillStyle = `rgba(${CREAM}, ${a})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, 1.3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  function spawnSparkle(nearBeat = false) {
    sparkles.push({
      x: Math.random() * W,
      y: H * 0.08 + Math.random() * H * 0.88,
      rise: 4 + Math.random() * 7,
      size: nearBeat ? 5 + Math.random() * 4 : 3 + Math.random() * 3.5,
      t: 0,
      maxT: 3.5 + Math.random() * 3.5,
      speed: 2.2 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
      warm: Math.random() < 0.6,
    })
  }

  return { setRegion, setDark, setReduceMotion, setCenter, setResonance, burst, update }
}

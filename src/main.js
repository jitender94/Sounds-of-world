import * as THREE from 'three'
import { regions, clusters } from './data/regions.js'
import { latLonToVector3 } from './coords.js'
import { createWorld, updateNotes, updateStrings } from './globe.js'
import { createPins } from './pins.js'
import { createAudio } from './audio.js'
import { createCameraController } from './camera.js'
import { createUI } from './ui.js'
import { createMotifs } from './motifs.js'
import './style.css'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const canvas = document.getElementById('globe-canvas')
const world = createWorld(canvas, regions)
const { camera, globe, atmosUniforms, highlightUniforms } = world

const pins = createPins(globe, camera, regions, clusters)
pins.setReduceMotion(reduceMotion)
const clusterById = new Map(clusters.map((c) => [c.id, c]))

const audio = createAudio()

const controller = createCameraController(globe, camera)
controller.setReduceMotion(reduceMotion)

const motifs = createMotifs(document.getElementById('motif-canvas'))
motifs.setReduceMotion(reduceMotion)

const regionById = new Map(regions.map((r) => [r.id, r]))
let selected = null
let currentView = 'map'

// The dark stage belongs to the globe: it exists to spotlight a region on the
// map. In cards view the page keeps its light paper, so opening a card reads
// as expanding in place rather than navigating to another page.
function syncStage() {
  const onStage = !!selected && currentView === 'map'
  document.body.classList.toggle('region-active', onStage)
  motifs.setDark(onStage)
}

const ui = createUI({
  regions,
  clusters,
  reduceMotion,
  onMuteToggle: () => audio.toggleMute(),
  // Re-clicking the region that's already playing reopens its detail page
  // rather than doing nothing (selectRegion early-returns on the same region).
  onCardClick: (region) => {
    if (selected && selected.id === region.id) ui.openDetail()
    else selectRegion(region)
  },
  onClose: () => deselect(),
  // Hovering a card auditions it quietly; the ambient bed steps back.
  onPreview: (region, x, y) => {
    audio.playPreview(region)
    audio.duckAmbient(true)
    motifs.setResonance(true, x, y) // the whole page answers the sound
  },
  onPreviewEnd: () => {
    audio.stopPreview()
    motifs.setResonance(false)
    if (!selected) audio.duckAmbient(false)
  },
  onViewChange: (view) => {
    currentView = view
    document.body.classList.toggle('cards-mode', view === 'cards')
    syncStage()
    // Returning to the map finds the globe already facing the playing region.
    if (view === 'map' && selected) controller.flyToRegion(selected)
  },
})

// Beat onsets ripple out from the active pin and burst ambient motifs.
audio.onBeat(() => {
  if (selected) {
    pins.pulse()
    motifs.burst()
  }
})

// ---- Opening a cluster ----
// Clicking an area of the world flies there and opens it into the individual
// traditions it holds, the way a map reveals detail as you move in.
function openCluster(clusterId) {
  const c = clusterById.get(clusterId)
  if (!c) return
  pins.setExpanded(clusterId)
  controller.flyToRegion(c)
  controller.setFocus(true)
  // The globe stops turning while an area is open, so the traditions inside
  // stay put long enough to read and choose between.
  controller.setHold(true)
}

function collapseCluster() {
  pins.setExpanded(null)
  if (!selected) {
    controller.setFocus(false)
    controller.setHold(false)
    controller.resumeAuto()
  }
}

// ---- Selection ----
function selectRegion(region) {
  if (selected && selected.id === region.id) return
  selected = region
  pins.setExpanded(region.cluster) // keep its siblings on screen
  pins.setActive(region.id)
  controller.flyToRegion(region)
  audio.play(region)
  ui.showRegion(region)
  audio.duckAmbient(true) // the region's music takes the stage
  motifs.setRegion(region.id)
  controller.setHold(true) // the globe holds still while a region is in focus
  syncStage()
  highlightUniforms.uActiveDir.value
    .copy(latLonToVector3(region.lat, region.lon, 1))
    .normalize()
}

function deselect() {
  selected = null
  pins.setActive(null)
  audio.stop()
  audio.duckAmbient(false) // the lo-fi bed returns on the map
  ui.hideCard()
  motifs.setRegion(null)
  // Closing a tradition returns to its area, which is still open — so the
  // globe stays held and zoomed until the area itself is closed.
  if (pins.expanded) {
    controller.setFocus(true)
  } else {
    controller.setHold(false)
    controller.resumeAuto()
  }
  syncStage()
}

// ---- Pointer interaction (drag vs click) ----
const ndc = new THREE.Vector2()
let down = null

function toNdc(e) {
  ndc.x = (e.clientX / window.innerWidth) * 2 - 1
  ndc.y = -(e.clientY / window.innerHeight) * 2 + 1
  return ndc
}

canvas.addEventListener('pointerdown', (e) => {
  down = { x: e.clientX, y: e.clientY, t: performance.now() }
  controller.onPointerDown(e.clientX, e.clientY)
  canvas.setPointerCapture(e.pointerId)
})

canvas.addEventListener('pointermove', (e) => {
  controller.onPointerMove(e.clientX, e.clientY)
  if (!controller.isDragging || (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6)) {
    const hit = pins.updateHover(toNdc(e))
    canvas.style.cursor = hit ? 'pointer' : 'grab'
  } else {
    canvas.style.cursor = 'grabbing'
  }
})

canvas.addEventListener('pointerup', (e) => {
  controller.onPointerUp()
  canvas.style.cursor = 'grab'
  if (!down) return
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y)
  const dt = performance.now() - down.t
  down = null
  if (moved > 6 || dt > 500) return // was a drag, not a click

  const hit = pins.pick(toNdc(e))
  if (hit?.kind === 'cluster') {
    openCluster(hit.id)
  } else if (hit?.kind === 'tradition') {
    const region = regionById.get(hit.id)
    if (region) selectRegion(region)
  } else if (ui.isCardVisible) {
    deselect()
  } else if (pins.expanded) {
    collapseCluster() // clicking empty ocean closes the open area
  }
})

canvas.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault()
    // Two-finger trackpad pan: horizontal spins the globe, vertical zooms.
    controller.rotateBy(-e.deltaX * 0.0022)
    controller.zoom(e.deltaY)
  },
  { passive: false },
)

// ---- Render loop ----
const clock = new THREE.Clock()
// Vibrant brass halo — the Veena's golden ornaments catching light.
const baseHalo = new THREE.Color('#E8A010')
function applyPalette(name) {
  const p = world.setPalette(name)
  if (p) baseHalo.set(p.halo)
  return p?.label
}
// While music plays the halo warms toward bright gold.
const playingHalo = new THREE.Color('#F0B020')

// Project the globe's centre and rim so the sound field stays locked to it.
const projCenter = new THREE.Vector3()
const projRim = new THREE.Vector3()
function updateFieldCenter() {
  projCenter.set(0, -0.28, 0).project(camera)
  projRim.set(1.12, -0.28, 0).project(camera)
  if (!isFinite(projCenter.x) || !isFinite(projCenter.y)) return
  const x = ((projCenter.x + 1) / 2) * window.innerWidth
  const y = ((1 - projCenter.y) / 2) * window.innerHeight
  const rx = ((projRim.x + 1) / 2) * window.innerWidth
  motifs.setCenter(x, y, Math.abs(rx - x))
}

function animate() {
  requestAnimationFrame(animate)
  const dt = Math.min(clock.getDelta(), 0.05)
  const elapsed = clock.elapsedTime

  const levels = audio.sample(dt)
  controller.update(dt)
  pins.update(dt, elapsed, levels)
  // Gold notes ride the globe's staves, swelling with whatever is playing.
  updateNotes(world.noteField, dt, elapsed, reduceMotion ? 0 : levels.overall, camera, globe)
  // Brass strings shimmer and swell with the music.
  updateStrings(world.graticule, elapsed, reduceMotion ? 0 : levels.overall)
  updateFieldCenter()
  motifs.update(dt, levels)

  // The halo breathes with the music and warms toward terracotta while playing.
  const breathe = reduceMotion ? 0 : levels.overall
  // Subtle rim on the idle map; the halo only swells once music plays.
  atmosUniforms.uIntensity.value = (selected ? 0.16 : 0.12) + breathe * (selected ? 0.22 : 0.4)
  atmosUniforms.uColor.value.lerp(selected ? playingHalo : baseHalo, 0.04)

  // Selected-region highlight eases in/out and pulses gently with the music.
  const targetK = selected ? 0.85 + breathe * 0.15 : 0
  highlightUniforms.uActiveK.value += (targetK - highlightUniforms.uActiveK.value) * 0.08

  if (ui.isCardVisible) ui.drawMeter(audio.getFrequencyData())
  if (ui.isPreviewing) ui.drawHoverMeter(audio.getFrequencyData(), levels.overall)

  world.render()
}
animate()

// Fade the scene in on load. (setTimeout, not rAF — rAF never fires in
// background tabs, which would leave the page invisible.)
setTimeout(() => document.body.classList.add('loaded'), 50)

// Browsers block audio until the user interacts, so the ambient lo-fi bed
// starts on the first gesture anywhere on the page.
function unlockAmbient() {
  audio.startAmbient()
  window.removeEventListener('pointerdown', unlockAmbient)
  window.removeEventListener('keydown', unlockAmbient)
  window.removeEventListener('touchstart', unlockAmbient)
}
window.addEventListener('pointerdown', unlockAmbient)
window.addEventListener('keydown', unlockAmbient)
window.addEventListener('touchstart', unlockAmbient)

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('about-overlay').classList.add('hidden')
    if (ui.isCardVisible) deselect()
  }
})

// Dev-only handle for manual verification; stripped from production builds.
if (import.meta.env.DEV) {
  const { default: gsap } = await import('gsap')
  window.__soe = { selectRegion, deselect, regions, pins, controller, ui, gsap, motifs, audio, applyPalette }
}

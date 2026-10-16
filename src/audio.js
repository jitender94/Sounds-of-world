import { Howl, Howler } from 'howler'

const FADE_MS = 1500
const TARGET_VOL = 0.8

/**
 * Audio engine built on Howler (Web Audio mode) with a shared AnalyserNode
 * tapped off the master gain. Exposes live levels + beat onsets that drive the
 * globe's reactivity, plus crossfades, lazy loading, and a global mute.
 */
export function createAudio() {
  // Force Web Audio (required for analysis); Howler defaults to it, but be explicit.
  Howler.usingWebAudio = true

  const sounds = new Map() // region.id -> Howl
  let current = null
  let currentId = null
  let muted = false

  // Ambient lo-fi landing bed.
  const AMBIENT_VOL = 0.32
  let ambient = null
  let ambientStarted = false

  let analyser = null
  let freqData = null
  const bins = { bass: 0, mid: 0, treble: 0 }
  const levels = { overall: 0, bass: 0, mid: 0, treble: 0 }

  // Beat detection state (energy spike on the low bands)
  let bassAvg = 0
  let beatCooldown = 0
  const beatListeners = []

  function ensureAnalyser() {
    if (analyser || !Howler.ctx || !Howler.masterGain) return
    analyser = Howler.ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8
    freqData = new Uint8Array(analyser.frequencyBinCount)
    // Tap the master bus without altering the output path.
    Howler.masterGain.connect(analyser)
  }

  function load(region) {
    let howl = sounds.get(region.id)
    if (howl) return howl
    // Each tradition points at a file that exists. Traditions still awaiting
    // their own recording point at their cluster's clip in regions.js, so the
    // path always resolves — a dev server answers a missing file with HTML,
    // which would decode to silence rather than raising an error.
    howl = new Howl({
      src: [region.audio],
      loop: true,
      volume: 0,
      html5: false, // Web Audio, so the analyser can see it
      onloaderror: (_id, err) => console.warn('audio load error', region.id, region.audio, err),
      onplayerror: (_id, err) => console.warn('audio play error', region.id, err),
    })
    sounds.set(region.id, howl)
    return howl
  }

  // Start the ambient bed on the first user gesture (autoplay policy). Safe to
  // call repeatedly; only the first call takes effect.
  function startAmbient() {
    if (ambientStarted) return
    ambientStarted = true
    if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume()
    ensureAnalyser()
    ambient = new Howl({
      src: ['audio/ambient.mp3'],
      loop: true,
      volume: 0,
      html5: false,
      onloaderror: (_id, err) => console.warn('ambient load error', err),
    })
    ambient.play()
    // Only rise to the bed level if nothing else is playing and not muted.
    if (!current && !muted) ambient.fade(0, AMBIENT_VOL, 2500)
  }

  // Fade the bed down while a region plays, back up when we return to the map.
  function duckAmbient(down) {
    if (!ambient) return
    const to = down || muted ? 0 : AMBIENT_VOL
    ambient.fade(ambient.volume(), to, down ? 900 : 1600)
  }

  function play(region) {
    if (currentId === region.id) return
    // Fade out whatever is playing
    if (current) {
      const prev = current
      prev.fade(prev.volume(), 0, FADE_MS)
      prev.once('fade', () => prev.pause())
    }
    const howl = load(region)
    // Resume the audio context on the user gesture that triggered this.
    if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume()
    ensureAnalyser()

    howl.volume(0)
    howl.play()
    if (!muted) howl.fade(0, TARGET_VOL, FADE_MS)
    current = howl
    currentId = region.id
  }

  function stop() {
    stopPreview()
    if (current) {
      const prev = current
      prev.fade(prev.volume(), 0, FADE_MS)
      prev.once('fade', () => prev.pause())
    }
    current = null
    currentId = null
  }

  // ---- Hover preview -----------------------------------------------------
  // Browsing a card lets you hear a few quiet seconds of it, so the atlas can
  // be explored by ear rather than by reading labels.
  const PREVIEW_VOL = 0.3
  let preview = null
  let previewId = null

  function playPreview(region) {
    if (current || previewId === region.id) return // never clash with the stage
    stopPreview()
    const howl = load(region)
    if (Howler.ctx && Howler.ctx.state === 'suspended') Howler.ctx.resume()
    ensureAnalyser()
    howl.volume(0)
    howl.play()
    if (!muted) howl.fade(0, PREVIEW_VOL, 260)
    preview = howl
    previewId = region.id
  }

  function stopPreview() {
    if (!preview) return
    const p = preview
    p.fade(p.volume(), 0, 300)
    p.once('fade', () => {
      // Don't pause it if it has since been promoted to the main track.
      if (p !== current) p.pause()
    })
    preview = null
    previewId = null
  }

  function isPreviewing() {
    return !!preview
  }

  function toggleMute() {
    muted = !muted
    if (muted) {
      Howler.volume(0)
    } else {
      Howler.volume(1)
      if (current) current.fade(current.volume(), TARGET_VOL, 600)
    }
    return muted
  }

  function isMuted() {
    return muted
  }

  function onBeat(fn) {
    beatListeners.push(fn)
  }

  /** Sample the analyser; update levels and fire beat callbacks. Call each frame. */
  function sample(dt) {
    if (!analyser) {
      // Decay to zero when nothing is analysing yet.
      levels.overall *= 0.9
      return levels
    }
    analyser.getByteFrequencyData(freqData)
    const n = freqData.length
    const bassEnd = Math.floor(n * 0.12)
    const midEnd = Math.floor(n * 0.5)
    let bass = 0
    let mid = 0
    let treble = 0
    for (let i = 0; i < n; i++) {
      const v = freqData[i] / 255
      if (i < bassEnd) bass += v
      else if (i < midEnd) mid += v
      else treble += v
    }
    bins.bass = bass / bassEnd
    bins.mid = mid / (midEnd - bassEnd)
    bins.treble = treble / (n - midEnd)

    // Smooth for visuals
    levels.bass += (bins.bass - levels.bass) * 0.3
    levels.mid += (bins.mid - levels.mid) * 0.3
    levels.treble += (bins.treble - levels.treble) * 0.3
    levels.overall = Math.min(1, levels.bass * 0.6 + levels.mid * 0.5 + levels.treble * 0.3)

    // Beat: bass energy jumps above a decaying running average
    beatCooldown -= dt
    bassAvg += (bins.bass - bassAvg) * 0.08
    if (!muted && bins.bass > bassAvg * 1.35 && bins.bass > 0.35 && beatCooldown <= 0) {
      beatCooldown = 0.28
      for (const fn of beatListeners) fn()
    }
    return levels
  }

  function getFrequencyData() {
    if (analyser) analyser.getByteFrequencyData(freqData)
    return freqData
  }

  return {
    play,
    stop,
    playPreview,
    stopPreview,
    isPreviewing,
    startAmbient,
    duckAmbient,
    toggleMute,
    isMuted,
    onBeat,
    sample,
    getFrequencyData,
    get currentId() {
      return currentId
    },
  }
}

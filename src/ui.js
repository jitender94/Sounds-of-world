import gsap from 'gsap'
import { drawSeal, drawIllustration } from './seals.js'

// Instrument-family icons (string / wind / percussion / voice), simple stroke
// glyphs that read at 20px.
function buildInstruments(ul, region) {
  ul.innerHTML = ''
  for (const inst of region.instrumentDetails) {
    const li = document.createElement('li')
    const icon = document.createElement('span')
    icon.className = 'inst-icon'
    icon.innerHTML = INST_ICONS[inst.type] || INST_ICONS.string
    const body = document.createElement('div')
    const b = document.createElement('b')
    b.textContent = inst.name
    body.appendChild(b)
    body.appendChild(document.createTextNode(inst.desc))
    li.appendChild(icon)
    li.appendChild(body)
    ul.appendChild(li)
  }
}

const INST_ICONS = {
  string: `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <circle cx="8.2" cy="15.8" r="4.6"/>
    <line x1="11.6" y1="12.4" x2="19.5" y2="4.5"/>
    <line x1="17.4" y1="3.4" x2="20.6" y2="6.6"/>
    <line x1="6.8" y1="14.4" x2="9.6" y2="17.2"/>
  </svg>`,
  wind: `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M3.5 14.5 18 5.5"/>
    <path d="M5.5 17.5 20 8.5"/>
    <circle cx="10.6" cy="12.6" r="0.4" fill="currentColor"/>
    <circle cx="13.2" cy="11" r="0.4" fill="currentColor"/>
    <circle cx="15.8" cy="9.4" r="0.4" fill="currentColor"/>
  </svg>`,
  percussion: `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <ellipse cx="12" cy="8.5" rx="7" ry="2.6"/>
    <path d="M5 8.5v4.2c0 3.4 3.1 5.3 7 5.3s7-1.9 7-5.3V8.5"/>
  </svg>`,
  voice: `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M5 9.5a7.5 7.5 0 0 1 0 5"/>
    <path d="M9.5 7.5a11 11 0 0 1 0 9"/>
    <path d="M14 5.5a14.5 14.5 0 0 1 0 13"/>
  </svg>`,
}

/**
 * Owns all DOM: the now-playing card (with a real analyser-driven waveform),
 * the map/cards view toggle, the cards marquee, top-bar controls, and the
 * load hint.
 */
export function createUI({
  regions, clusters, onMuteToggle, onCardClick, onViewChange, onClose,
  onPreview, onPreviewEnd, reduceMotion,
}) {
  const card = document.getElementById('region-card')
  const genreEl = card.querySelector('.region-genre')
  const originEl = card.querySelector('.region-origin')
  const instrumentsEl = card.querySelector('.instruments')
  const factEl = card.querySelector('.fact-text')
  const waveCanvas = card.querySelector('.waveform')
  const waveCtx = waveCanvas.getContext('2d')

  const panelLeft = document.getElementById('panel-left')
  const panelRight = document.getElementById('panel-right')
  const heritageEl = panelLeft.querySelector('.panel-heritage')
  const soundEl = panelLeft.querySelector('.panel-sound')
  const panelInstrumentsEl = panelRight.querySelector('.panel-instruments')
  const listenEl = panelRight.querySelector('.panel-listen')

  // Cards-view detail panel (same content as the globe, laid out as a page).
  const cardsDetail = document.getElementById('cards-detail')
  const detailBack = document.getElementById('detail-back')
  const detailWave = cardsDetail.querySelector('.detail-wave')

  const cardClose = document.getElementById('card-close')
  const muteBtn = document.getElementById('mute-btn')
  const aboutBtn = document.getElementById('about-btn')
  const aboutOverlay = document.getElementById('about-overlay')
  const aboutClose = document.getElementById('about-close')
  const hint = document.getElementById('hint')

  const viewMapBtn = document.getElementById('view-map')
  const viewCardsBtn = document.getElementById('view-cards')
  const cardsView = document.getElementById('cards-view')
  const cardsTrack = document.getElementById('cards-track')

  let visible = false
  let view = 'map'
  let originTile = null // the tile the detail panel grows out of

  // Hover preview state. One meter canvas is moved into whichever card is
  // being previewed, rather than keeping 54 canvases alive.
  let dwellTimer = null
  let hoverTile = null
  let hoverRegion = null

  function endPreview() {
    clearTimeout(dwellTimer)
    if (hoverTile) {
      hoverTile.classList.remove('previewing')
      hoverTile.querySelector('.tile-emblem')?.style.removeProperty('transform')
    }
    hoverTile = null
    hoverRegion = null
    onPreviewEnd?.()
  }

  // Each seal is drawn once and reused as an image across both marquee copies,
  // rather than keeping 54 live canvases around.
  const sealUrls = new Map()
  function sealImage(sealId) {
    if (!sealUrls.has(sealId)) {
      const c = document.createElement('canvas')
      c.width = c.height = 256
      drawIllustration(c.getContext('2d'), 256, sealId)
      sealUrls.set(sealId, c.toDataURL())
    }
    return sealUrls.get(sealId)
  }

  // ---- Grouped gallery: one section per area of the world ----
  // With 27 traditions a scrolling row stops being browsable, so they are laid
  // out as a calm grid grouped by cluster — you can see the whole atlas at once
  // and read it region by region.
  const tiles = new Map() // region.id -> [tile]
  for (const cluster of clusters) {
    const members = regions.filter((r) => r.cluster === cluster.id)
    if (!members.length) continue

    const section = document.createElement('section')
    section.className = 'gallery-group'
    const head = document.createElement('div')
    head.className = 'group-head'
    head.innerHTML = `
      <h2 class="group-name">${cluster.name}</h2>
      <span class="group-rule"></span>
      <span class="group-count">${members.length} traditions</span>
    `
    section.appendChild(head)

    const grid = document.createElement('div')
    grid.className = 'group-grid'
    section.appendChild(grid)
    cardsTrack.appendChild(section)

    for (const region of members) {
      const tile = document.createElement('button')
      tile.className = 'region-tile'
      tile.setAttribute('aria-label', `Play ${region.genre} — ${region.name}`)
      tile.innerHTML = `
        <img class="tile-emblem" src="${sealImage(region.seal)}" alt="" aria-hidden="true" />
        <span class="tile-name">${region.name}</span>
        <span class="tile-genre">${region.genre}</span>
        <span class="tile-instruments">${region.instruments
          .map((i) => `<span>${i}</span>`)
          .join('')}</span>
        <span class="tile-listen">Listen&nbsp;&nbsp;♪</span>
      `
      tile.addEventListener('click', () => {
        originTile = tile // the card the detail should grow out of
        onCardClick(region)
      })

      // Hovering a card plays a few quiet seconds of it — the atlas is
      // browsable by ear, and the card comes alive to its own sound.
      tile.addEventListener('mouseenter', () => {
        clearTimeout(dwellTimer)
        dwellTimer = setTimeout(() => {
          hoverTile = tile
          hoverRegion = region
          tile.classList.add('previewing')
          const b = tile.getBoundingClientRect()
          onPreview?.(region, b.left + b.width / 2, b.top + b.height / 2)
        }, 200) // a short dwell, so sweeping the mouse stays silent
      })
      tile.addEventListener('mouseleave', () => {
        clearTimeout(dwellTimer)
        if (hoverTile !== tile) return
        endPreview()
      })
      grid.appendChild(tile)
      if (!tiles.has(region.id)) tiles.set(region.id, [])
      tiles.get(region.id).push(tile)
    }
  }

  function markPlaying(regionId) {
    for (const [id, list] of tiles) {
      for (const t of list) t.classList.toggle('playing', id === regionId)
    }
  }

  // ---- Cards-view detail: the chosen card expands in place ----
  const detailInner = cardsDetail.querySelector('.detail-inner')

  /**
   * Transform that maps the detail panel onto the tile's box (FLIP style).
   * Returns null when the tile isn't usefully on screen — the marquee scrolls,
   * so the card that was clicked may since have drifted far outside the
   * viewport, and flying in from there looks broken rather than delightful.
   */
  function tileTransform(tile) {
    if (!tile || !tile.isConnected) return null
    const from = tile.getBoundingClientRect()
    const to = detailInner.getBoundingClientRect()
    if (!to.width || !to.height || !from.width) return null
    const onScreen = from.right > 0 && from.left < window.innerWidth
    if (!onScreen) return null
    return {
      x: from.left + from.width / 2 - (to.left + to.width / 2),
      y: from.top + from.height / 2 - (to.top + to.height / 2),
      scaleX: from.width / to.width,
      scaleY: from.height / to.height,
    }
  }

  function openDetail() {
    if (document.body.classList.contains('detail-open')) return
    document.body.classList.add('detail-open')
    cardsDetail.classList.remove('hidden')

    if (reduceMotion) {
      gsap.set(detailInner, { clearProps: 'all' })
      return
    }
    // Grow the panel out of the card that was clicked, so the detail opens
    // on the same page rather than replacing it.
    const t = originTile && tileTransform(originTile)
    const contents = detailInner.children
    gsap.killTweensOf([detailInner, ...contents])
    gsap.fromTo(
      detailInner,
      t
        ? { ...t, opacity: 0.35, transformOrigin: 'center center' }
        : { x: 0, y: 24, scaleX: 0.94, scaleY: 0.94, opacity: 0 },
      {
        x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1,
        duration: 0.62,
        ease: 'power3.out',
        clearProps: 'transform',
      },
    )
    // The text settles in just after the shell has opened.
    gsap.fromTo(
      contents,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.07, delay: 0.16 },
    )
  }

  function closeDetail() {
    if (!document.body.classList.contains('detail-open')) return
    document.body.classList.remove('detail-open')

    if (reduceMotion) {
      cardsDetail.classList.add('hidden')
      return
    }
    // Shrink back into the card it came from.
    const t = originTile && tileTransform(originTile)
    gsap.killTweensOf(detailInner)
    gsap.to(detailInner, {
      ...(t || { x: 0, y: 16, scaleX: 0.96, scaleY: 0.96 }),
      opacity: 0,
      duration: 0.38,
      ease: 'power3.in',
      onComplete: () => {
        cardsDetail.classList.add('hidden')
        gsap.set(detailInner, { clearProps: 'all' })
      },
    })
  }
  detailBack.addEventListener('click', closeDetail)

  // Closing the card stops playback entirely (owner: main.js).
  cardClose.addEventListener('click', (e) => {
    e.stopPropagation()
    onClose?.()
  })

  // In cards view the compact card is a way back into the full detail page.
  card.addEventListener('click', () => {
    if (view === 'cards' && !document.body.classList.contains('detail-open')) openDetail()
  })

  // ---- View toggle ----
  function setView(next) {
    if (next === view) return
    view = next
    const isMap = view === 'map'
    viewMapBtn.classList.toggle('active', isMap)
    viewCardsBtn.classList.toggle('active', !isMap)
    viewMapBtn.setAttribute('aria-selected', String(isMap))
    viewCardsBtn.setAttribute('aria-selected', String(!isMap))
    cardsView.classList.toggle('hidden', isMap)
    cardsView.setAttribute('aria-hidden', String(isMap))
    if (isMap) closeDetail() // leaving cards view drops the detail page
    if (!isMap) hideHint()
    onViewChange(view)
  }
  viewMapBtn.addEventListener('click', () => setView('map'))
  viewCardsBtn.addEventListener('click', () => setView('cards'))

  // ---- Top-bar controls ----
  muteBtn.addEventListener('click', () => {
    const muted = onMuteToggle()
    muteBtn.classList.toggle('muted', muted)
    muteBtn.setAttribute('aria-pressed', String(muted))
  })
  aboutBtn.addEventListener('click', () => aboutOverlay.classList.remove('hidden'))
  aboutClose.addEventListener('click', () => aboutOverlay.classList.add('hidden'))
  aboutOverlay.addEventListener('click', (e) => {
    if (e.target === aboutOverlay) aboutOverlay.classList.add('hidden')
  })

  // ---- Now-playing card ----
  function showRegion(region) {
    genreEl.textContent = region.genre
    originEl.textContent = `${region.country} · ${region.name}`
    factEl.textContent = region.fact

    // The instrument illustration that identifies this music.
    const illus = card.querySelector('.card-illus')
    const ictx = illus.getContext('2d')
    ictx.clearRect(0, 0, illus.width, illus.height)
    drawIllustration(ictx, illus.width, region.seal)

    instrumentsEl.innerHTML = ''
    for (const name of region.instruments) {
      const tag = document.createElement('span')
      tag.className = 'tag'
      tag.textContent = name
      instrumentsEl.appendChild(tag)
    }

    // Educational content — side panels on desktop, folded into the bottom
    // sheet on narrow screens.
    heritageEl.textContent = region.heritage
    soundEl.textContent = region.sound
    panelLeft.querySelector('.panel-fact').textContent = region.fact
    buildInstruments(panelInstrumentsEl, region)
    listenEl.textContent = region.listenFor

    card.querySelector('.more-heritage').textContent = region.heritage
    card.querySelector('.more-sound').textContent = region.sound
    buildInstruments(card.querySelector('.more-instruments'), region)
    card.querySelector('.more-listen').textContent = region.listenFor

    // Cards-view detail panel — the same content laid out as a page.
    cardsDetail.querySelector('.detail-name').textContent = region.name
    cardsDetail.querySelector('.detail-genre').textContent = region.genre
    cardsDetail.querySelector('.detail-origin').textContent = `${region.country} · ${region.name}`
    cardsDetail.querySelector('.detail-heritage').textContent = region.heritage
    cardsDetail.querySelector('.detail-sound').textContent = region.sound
    cardsDetail.querySelector('.detail-listen').textContent = region.listenFor
    cardsDetail.querySelector('.detail-fact').textContent = region.fact
    buildInstruments(cardsDetail.querySelector('.detail-instruments'), region)
    const detailTags = cardsDetail.querySelector('.detail-tags')
    detailTags.innerHTML = ''
    for (const name of region.instruments) {
      const tag = document.createElement('span')
      tag.className = 'tag'
      tag.textContent = name
      detailTags.appendChild(tag)
    }
    cardsDetail.querySelector('.detail-glyph').textContent = region.glyph

    // The region's seal — the same emblem that marks it on the globe.
    const sealCanvas = cardsDetail.querySelector('.detail-seal')
    const sctx = sealCanvas.getContext('2d')
    sctx.clearRect(0, 0, sealCanvas.width, sealCanvas.height)
    drawSeal(sctx, sealCanvas.width, region.seal)

    // Regional watermark glyphs give each surface its identity.
    for (const el of document.querySelectorAll('.panel-glyph')) {
      el.textContent = region.glyph
    }

    // In cards view, open the full-page detail for the chosen region.
    if (view === 'cards') openDetail()

    markPlaying(region.id)
    hideHint()
    card.classList.remove('hidden')
    panelLeft.classList.remove('hidden')
    panelRight.classList.remove('hidden')

    const sections = [
      ...panelLeft.querySelectorAll('section'),
      ...panelRight.querySelectorAll('section'),
    ]
    gsap.killTweensOf([card, panelLeft, panelRight, ...sections])

    if (reduceMotion) {
      gsap.set(card, { y: 0, opacity: 1 })
      gsap.set([panelLeft, panelRight], { x: 0, opacity: 1 })
      gsap.set(sections, { y: 0, opacity: 1 })
    } else {
      // A staged entrance: the backdrop darkens (CSS), the card rises as the
      // globe arrives, then the panels land one after the other and their
      // sections cascade in.
      gsap.fromTo(
        card,
        { y: 140, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.45 },
      )
      gsap.fromTo(
        panelLeft,
        { x: -56, opacity: 0, rotation: -3.5 },
        { x: 0, opacity: 1, rotation: -1.1, duration: 0.6, ease: 'power3.out', delay: 0.75 },
      )
      gsap.fromTo(
        panelRight,
        { x: 56, opacity: 0, rotation: 3.5 },
        { x: 0, opacity: 1, rotation: 1.1, duration: 0.6, ease: 'power3.out', delay: 0.95 },
      )
      gsap.fromTo(
        sections,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', stagger: 0.1, delay: 0.95 },
      )
    }
    visible = true
  }

  function hideCard() {
    if (!visible) return
    visible = false
    markPlaying(null)
    closeDetail()
    if (reduceMotion) {
      gsap.set(card, { y: 120, opacity: 0 })
      card.classList.add('hidden')
      panelLeft.classList.add('hidden')
      panelRight.classList.add('hidden')
      return
    }
    gsap.to(card, {
      y: 120,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.in',
      onComplete: () => card.classList.add('hidden'),
    })
    gsap.to(panelLeft, {
      x: -48,
      opacity: 0,
      duration: 0.35,
      ease: 'power3.in',
      onComplete: () => panelLeft.classList.add('hidden'),
    })
    gsap.to(panelRight, {
      x: 48,
      opacity: 0,
      duration: 0.35,
      ease: 'power3.in',
      onComplete: () => panelRight.classList.add('hidden'),
    })
  }

  function hideHint() {
    hint.classList.add('gone')
  }

  // ---- Live spectrum ----
  // Slim bars mirrored around a centre line, each riding a real frequency band
  // — the highs and lows of the music rise and fall with the beat. Drawn to
  // whichever meter canvas is currently on screen (card or cards-detail).
  const GOLD = '#D9A441'
  const GOLD_LIGHT = '#F5C95E'
  const BARS = 14
  const levelsSmooth = new Array(BARS).fill(0)
  const meterCanvases = [waveCanvas, detailWave]

  /**
   * The previewing card responds to its own music: the emblem breathes on the
   * bass, and a row of bars rides the real spectrum along the card's foot.
   */
  function drawHoverMeter(_freqData, level) {
    if (!hoverTile || reduceMotion) return
    const emblem = hoverTile.querySelector('.tile-emblem')
    if (emblem) {
      emblem.style.transform = `scale(${(1.1 + level * 0.14).toFixed(3)}) rotate(-2deg)`
    }
  }

  function drawMeter(freqData) {
    if (!visible) return

    // Advance the smoothed spectrum once, then paint to every visible meter.
    const span = freqData ? Math.floor(freqData.length * 0.62) : 0
    for (let i = 0; i < BARS; i++) {
      let v = 0
      if (freqData) {
        const start = Math.floor((i / BARS) * span)
        const end = Math.floor(((i + 1) / BARS) * span)
        for (let j = start; j < end; j++) v += freqData[j]
        v = v / Math.max(1, end - start) / 255
      }
      // Attack fast, release slow — bars punch on the beat, settle gently.
      const target = Math.pow(v, 0.8)
      levelsSmooth[i] += (target - levelsSmooth[i]) * (target > levelsSmooth[i] ? 0.5 : 0.14)
    }

    for (const canvas of meterCanvases) {
      if (canvas.offsetParent === null) continue // not on screen
      paintMeter(canvas)
    }
  }

  function paintMeter(canvas) {
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)
    const mid = H / 2
    const gap = 3 * (W / 220)
    const bw = (W - gap * (BARS - 1)) / BARS
    for (let i = 0; i < BARS; i++) {
      const h = Math.max(2, levelsSmooth[i] * (H - 4))
      const x = i * (bw + gap)
      ctx.fillStyle = levelsSmooth[i] > 0.66 ? GOLD_LIGHT : GOLD
      ctx.globalAlpha = 0.5 + levelsSmooth[i] * 0.5
      roundBar(ctx, x, mid - h / 2, bw, h, Math.min(bw / 2, 2.2))
    }
    ctx.globalAlpha = 1
  }

  function roundBar(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.fill()
  }

  return {
    showRegion,
    hideCard,
    drawMeter,
    drawHoverMeter,
    endPreview,
    get isPreviewing() {
      return !!hoverTile
    },
    hideHint,
    setView,
    openDetail,
    get isCardVisible() {
      return visible
    },
    get view() {
      return view
    },
  }
}

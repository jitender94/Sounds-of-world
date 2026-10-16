# Sounds of Earth — Build Spec
> A delight-first interactive musical world globe. Desktop-first, shareable on LinkedIn, built to showcase vibe coding skills.

---

## Vision in one line
A 3D rotating globe where clicking any region plays traditional music from that part of the world — with ambient sound, glowing pins, cultural facts, and zero clutter.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| 3D Globe | Three.js (r155+) | Industry standard, great sphere + texture support |
| Animations | GSAP (v3) | Smooth camera arcs, card transitions |
| Audio | Howler.js | Cross-browser audio, fade in/out |
| Fonts | Google Fonts — Cormorant Garamond (display) + Inter (UI) | Cartographic old-world feel meets clean modern UI |
| Build | Vanilla HTML/CSS/JS (single file) OR Vite + vanilla JS | No framework needed — keep it simple and portable |
| Deployment | Vercel / Netlify (static) | One-click deploy for sharing |

---

## File Structure

```
sounds-of-earth/
├── index.html
├── style.css
├── main.js
├── data/
│   └── regions.js        # All region data (music, facts, coords)
├── audio/
│   └── [region].mp3      # One ~30s looping clip per region (see audio notes)
├── textures/
│   ├── earth-diffuse.jpg     # Blue marble NASA texture (public domain)
│   ├── earth-bump.jpg        # Bump map for terrain depth
│   └── earth-specular.jpg    # Specular map for ocean shine
└── assets/
    └── star-field.png        # Optional subtle star bg
```

---

## Visual Design

### Palette
| Name | Hex | Usage |
|---|---|---|
| Space black | `#050A15` | Page background |
| Globe ocean | `#0D2B45` | Ocean base on globe |
| Atlas gold | `#C8A96E` | Landmass tint, title typography |
| UI frost | `rgba(255,255,255,0.06)` | Card backgrounds (glassmorphism) |
| UI border | `rgba(255,255,255,0.12)` | Card borders |
| Text primary | `#F0EDE6` | All body text |
| Text muted | `rgba(240,237,230,0.5)` | Secondary labels |

### Region Pin Colors
| Region | Hex |
|---|---|
| South Asia | `#4A9EDB` |
| West Africa | `#2DBD8F` |
| Latin America | `#F5A623` |
| East Asia | `#E05C8A` |
| Middle East | `#E2714A` |
| Europe | `#8B7DD8` |
| Oceania | `#72B84A` |
| East Africa | `#E8C547` |
| Central Asia | `#D4845A` |

### Typography
- **Display / Title**: `Cormorant Garamond`, 600 weight — used only for "Sounds of Earth" hero title and region names in the card
- **UI**: `Inter`, 400/500 — used for instrument labels, facts, tags, all functional text
- **Scale**: Title 48px → Region name in card 22px → Instrument tags 13px → Fact body 15px

---

## Layout — Desktop (primary)

```
┌─────────────────────────────────────────────────────┐
│  Sounds of Earth           [muted] [•] [about]      │  ← minimal top bar, frosted
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│              [ 3D GLOBE — full viewport ]           │
│           glowing pins float above surface          │
│                auto-rotates on idle                 │
│                                                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐   │
│  │  [●] NOW PLAYING                  [waveform] │   │  ← rises from bottom on click
│  │  Hindustani Raga · India                     │   │
│  │  Sitar · Tabla · Bansuri                     │   │
│  │  ─────────────────────────────────────────   │   │
│  │  "The tabla and soloist improvise in         │   │
│  │   real time — no two performances alike."   │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Mobile layout
- Globe fills top 60vh
- Card is a bottom sheet that slides up
- Pins slightly larger tap targets (min 44px)
- Title scales to 28px

---

## Three.js Globe — Implementation Notes

### Setup
```js
// Scene
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 1000)
camera.position.z = 2.5

// Globe
const geometry = new THREE.SphereGeometry(1, 64, 64)
const material = new THREE.MeshPhongMaterial({
  map: earthTexture,         // NASA blue marble
  bumpMap: bumpTexture,
  bumpScale: 0.05,
  specularMap: specularTexture,
  specular: new THREE.Color(0x1a3a5c),  // subtle ocean shine
})
const globe = new THREE.Mesh(geometry, material)
```

### Lighting
```js
// Ambient — soft fill
const ambient = new THREE.AmbientLight(0x333355, 0.8)

// Sun — directional from slight upper-left
const sun = new THREE.DirectionalLight(0xffeedd, 1.2)
sun.position.set(-2, 1.5, 1)

// Rim light — subtle blue from opposite side
const rim = new THREE.DirectionalLight(0x2244aa, 0.4)
rim.position.set(2, -1, -1)
```

### Atmosphere glow (visual signature)
```js
// Additive blended outer sphere slightly larger than globe
const atmosGeo = new THREE.SphereGeometry(1.02, 64, 64)
const atmosMat = new THREE.MeshPhongMaterial({
  color: 0x1a4a8a,
  transparent: true,
  opacity: 0.15,
  side: THREE.FrontSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
})
```

### Auto-rotation
```js
// Idle rotation — slow, dreamy
let isDragging = false
let autoRotate = true

function animate() {
  requestAnimationFrame(animate)
  if (autoRotate && !isDragging) {
    globe.rotation.y += 0.0015
    pinsGroup.rotation.y += 0.0015  // pins rotate with globe
  }
  renderer.render(scene, camera)
}
```

### Drag to rotate (mouse + touch)
- Implement OrbitControls or manual drag delta on mousedown/mousemove
- Disable auto-rotate while dragging, resume after 3s idle
- Constrain vertical rotation: latitude -60 to +60 (don't flip globe upside down)

### Pins
- Each pin is a small `THREE.SphereGeometry(0.018)` placed at lat/long converted to 3D coords:
```js
function latLonToVector3(lat, lon, radius = 1.02) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  )
}
```
- Pin has a pulsing ring: a flat `RingGeometry` that scales up and fades out on loop
- Active pin: ring stays bright, scale 1.5x, emits a subtle point light matching its color
- Raycasting on click to detect which pin was hit

### Camera animation to region (GSAP)
```js
function flyToRegion(region) {
  autoRotate = false
  // Rotate globe so pin faces camera
  const targetY = -region.lon * (Math.PI / 180)
  gsap.to(globe.rotation, {
    y: targetY,
    duration: 1.4,
    ease: 'power2.inOut',
    onComplete: () => { autoRotate = true }
  })
  // Slight camera zoom in
  gsap.to(camera.position, {
    z: 2.1,
    duration: 1.2,
    ease: 'power2.inOut',
    yoyo: true,
    repeat: 1
  })
}
```

---

## Region Data (`data/regions.js`)

```js
export const regions = [
  {
    id: 'south-asia',
    name: 'South Asia',
    country: 'India',
    genre: 'Hindustani Raga',
    instruments: ['Sitar', 'Tabla', 'Bansuri'],
    lat: 20.5,
    lon: 78.9,
    color: '#4A9EDB',
    audio: 'audio/south-asia.mp3',
    fact: 'Indian classical music has no fixed tempo — the tabla player and soloist improvise together in real time, creating a conversation that\'s never played the same way twice.',
    emoji: '🎸'
  },
  {
    id: 'west-africa',
    name: 'West Africa',
    country: 'Senegal / Mali',
    genre: 'Griot tradition',
    instruments: ['Kora', 'Djembe', 'Balafon'],
    lat: 14.0,
    lon: -14.0,
    color: '#2DBD8F',
    audio: 'audio/west-africa.mp3',
    fact: 'Griots are hereditary musicians who serve as living libraries — oral historians who\'ve memorised centuries of lineage, battles, and stories in song.',
    emoji: '🥁'
  },
  {
    id: 'latin-america',
    name: 'Latin America',
    country: 'Peru / Bolivia',
    genre: 'Andean folk',
    instruments: ['Charango', 'Pan flute', 'Cajón'],
    lat: -13.5,
    lon: -72.0,
    color: '#F5A623',
    audio: 'audio/latin-america.mp3',
    fact: 'The Charango was traditionally made from the shell of an armadillo. Its bright sound was designed to carry across mountain valleys at altitude.',
    emoji: '🪘'
  },
  {
    id: 'east-asia',
    name: 'East Asia',
    country: 'China / Japan',
    genre: 'Classical zither',
    instruments: ['Guqin', 'Erhu', 'Shamisen'],
    lat: 35.8,
    lon: 104.0,
    color: '#E05C8A',
    audio: 'audio/east-asia.mp3',
    fact: 'The Guqin is over 3,000 years old. Confucius played it. It relies on harmonics as much as open strings — the silences between notes are considered part of the music.',
    emoji: '🎵'
  },
  {
    id: 'middle-east',
    name: 'Middle East',
    country: 'Egypt / Turkey',
    genre: 'Maqam tradition',
    instruments: ['Oud', 'Qanun', 'Darbuka'],
    lat: 26.0,
    lon: 30.0,
    color: '#E2714A',
    audio: 'audio/middle-east.mp3',
    fact: 'Arabic music uses microtones — pitches between the notes of a Western piano. The Maqam system has over 70 named scales, many impossible to play on standard keyboards.',
    emoji: '🎶'
  },
  {
    id: 'europe',
    name: 'Europe',
    country: 'Ireland / Scotland',
    genre: 'Celtic folk',
    instruments: ['Uilleann pipes', 'Fiddle', 'Bodhrán'],
    lat: 53.0,
    lon: -8.0,
    color: '#8B7DD8',
    audio: 'audio/europe.mp3',
    fact: 'The Uilleann pipes are unique to Ireland — played sitting down, using bellows under the arm instead of breath. They can play two octaves while adding drone harmonics.',
    emoji: '🎻'
  },
  {
    id: 'oceania',
    name: 'Oceania',
    country: 'Australia',
    genre: 'Aboriginal songlines',
    instruments: ['Didgeridoo', 'Bilma clap sticks'],
    lat: -25.0,
    lon: 133.0,
    color: '#72B84A',
    audio: 'audio/oceania.mp3',
    fact: 'Aboriginal songlines are musical maps — entire landscapes encoded as melodies. A person could navigate thousands of kilometres of outback using only a song.',
    emoji: '🎺'
  },
  {
    id: 'east-africa',
    name: 'East Africa',
    country: 'Ethiopia',
    genre: 'Ethiopian blues',
    instruments: ['Masenqo', 'Krar', 'Kebero'],
    lat: 9.0,
    lon: 40.0,
    color: '#E8C547',
    audio: 'audio/east-africa.mp3',
    fact: 'Ethiopian music uses the Pentatonic scale in a way that predates Western blues by centuries. Many ethnomusicologists believe it\'s one of the direct roots of American blues.',
    emoji: '🎼'
  },
  {
    id: 'central-asia',
    name: 'Central Asia',
    country: 'Kazakhstan / Kyrgyzstan',
    genre: 'Steppe folk',
    instruments: ['Dombyra', 'Komuz', 'Throat singing'],
    lat: 48.0,
    lon: 68.0,
    color: '#D4845A',
    audio: 'audio/central-asia.mp3',
    fact: 'Throat singing (Tuvan khoomei) lets a single vocalist produce two notes simultaneously — a drone and a melody — by shaping resonant chambers inside the body.',
    emoji: '🎤'
  }
]
```

---

## Audio Notes

### What to source
- Each clip: ~30–45 seconds, loops seamlessly
- Format: MP3 (128kbps is fine) + OGG fallback
- Fade in: 1.5s when region selected
- Fade out: 1.5s when switching regions
- Global mute toggle in top bar

### Where to get royalty-free traditional music
1. **Freesound.org** — search by instrument name, filter CC0 license
2. **Internet Archive** — ethnomusicology field recordings, many public domain
3. **Musopen.org** — classical recordings, public domain
4. **Wikimedia Commons** — traditional music uploads, CC licensed
5. **YouTube Audio Library** — "World" category, some traditional clips
6. **Incompetech (Kevin MacLeod)** — CC licensed, some world music

### Howler.js setup
```js
import { Howl } from 'howler'

let currentSound = null

function playRegion(region) {
  if (currentSound) currentSound.fade(1, 0, 1500)
  
  const sound = new Howl({
    src: [region.audio],
    loop: true,
    volume: 0,
  })
  sound.play()
  sound.fade(0, 0.8, 1500)
  currentSound = sound
}
```

---

## Interactions — Full List

| Trigger | Action |
|---|---|
| Page load | Globe fades in, auto-rotates slowly, star field in bg, title animates in |
| Hover on pin | Pin glows brighter, cursor changes to pointer, subtle scale up |
| Click on pin | Globe rotates to region, camera zooms slightly, card rises from bottom, music fades in |
| Click another pin | Previous music fades out, new music fades in, card updates, globe re-orients |
| Drag globe | Manual rotation, auto-rotate pauses, resumes after 3s |
| Scroll (on globe) | Zoom in/out within a constrained range (don't zoom past globe) |
| Mute button | All audio fades out immediately, icon toggles |
| Click anywhere off pin | Card slides down, auto-rotate resumes |
| Mobile tap on pin | Same as click, card is a bottom sheet |

---

## Card Component (Bottom panel)

```html
<div id="region-card" class="card hidden">
  <div class="card-header">
    <div class="now-playing-dot"></div>
    <span class="now-playing-label">Now playing</span>
    <div class="waveform">
      <span></span><span></span><span></span><span></span><span></span>
    </div>
  </div>
  <div class="card-body">
    <h2 class="region-genre">Hindustani Raga</h2>
    <p class="region-origin">India · South Asia</p>
    <div class="instruments">
      <span class="tag">Sitar</span>
      <span class="tag">Tabla</span>
      <span class="tag">Bansuri</span>
    </div>
    <div class="divider"></div>
    <p class="fact-text">
      "Indian classical music has no fixed tempo..."
    </p>
  </div>
</div>
```

**Card animation (GSAP):**
```js
// Show card
gsap.fromTo('#region-card',
  { y: 120, opacity: 0 },
  { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
)
```

---

## Performance Checklist
- [ ] Textures compressed — earth texture max 2048x1024px JPG
- [ ] `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` — cap at 2x
- [ ] Dispose old geometries/materials if re-rendering
- [ ] Lazy-load audio — don't preload all 9 clips at once
- [ ] `will-change: transform` on card for GPU composite
- [ ] Prefers-reduced-motion: disable auto-rotation and card animations

---

## Deployment
1. Run `npm create vite@latest sounds-of-earth -- --template vanilla`
2. Drop in files per structure above
3. `npm run build` → `dist/` folder
4. Deploy `dist/` to Vercel or Netlify (drag and drop)
5. Custom domain optional — `sounds-of-earth.jeet.design` would be perfect

---

## LinkedIn Post Hook (for when you ship)
> "I spent a weekend building a 3D musical globe. Click any region of the world and hear what people have been playing for thousands of years.
> 
> No framework. No backend. Just Three.js, some public domain recordings, and a lot of curiosity.
> 
> [link]
> 
> What surprised me most: Aboriginal songlines are literally musical maps of the landscape. A person could navigate the Australian outback using only a song. 🎵"

---

## What Claude Code should do first
1. `npm create vite@latest sounds-of-earth -- --template vanilla`
2. Install deps: `npm install three gsap howler`
3. Create `data/regions.js` with the full dataset above
4. Build `main.js` — globe scene, pins, raycasting, camera animation
5. Build `style.css` — dark bg, card, top bar, waveform animation
6. Wire up `index.html`
7. Source or placeholder audio files
8. Test on desktop Chrome, then mobile Safari

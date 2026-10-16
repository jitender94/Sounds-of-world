import * as THREE from 'three'
import { latLonToVector3 } from './coords.js'

// Veena palette — warm orange-amber body, vibrant saffron-gold ornaments.
const PAPER = new THREE.Color('#E8B468') // bright warm amber
const INK = new THREE.Color('#4A2008') // warm brown ink
const OCEAN = new THREE.Color('#8F5220') // warm polished wood (Veena resonator body)
const LAND = new THREE.Color('#F2AC1E') // vibrant saffron-gold (ornaments)
const REGION = new THREE.Color('#F0A010') // bright saffron music regions
const HALO = new THREE.Color('#E8A010') // saffron glow

const TEX = 'textures/'
const REGION_SIGMA = 0.24 // angular width of a region's colour bloom (radians)

/**
 * Builds the illustrative 3D world: a stylized raised-relief globe (real
 * geography from the NASA water mask, flat joyful colours, music regions
 * physically raised out of the land), a warm halo, a faint ink graticule.
 */
export function createWorld(canvas, regions) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 3.4

  // The globe sits slightly below centre so the title floats in clear sky.
  const globeGroup = new THREE.Group()
  globeGroup.position.y = -0.28
  scene.add(globeGroup)

  // Flat, evenly-lit — reads as a printed map, not a lit planet.
  const ambient = new THREE.AmbientLight(0xfff4e0, 1.02)
  const sun = new THREE.DirectionalLight(0xfff2d8, 0.42)
  sun.position.set(-1.2, 1.6, 2.0)
  const fill = new THREE.DirectionalLight(0xd8ecff, 0.16)
  fill.position.set(2, -1, -1)
  scene.add(ambient, sun, fill)

  // ---- Globe (built asynchronously once the water mask is sampled) ----
  const loader = new THREE.TextureLoader()
  const waterMaskTex = loader.load(TEX + 'earth-water-mask.jpg')
  const topoTex = loader.load(TEX + 'earth-bump.jpg') // elevation, for shaded relief

  // Selection-highlight uniforms shared with the render loop: the local-space
  // direction of the active region and an animated 0→1 strength.
  const highlightUniforms = {
    uActiveDir: { value: new THREE.Vector3(0, 0, 1) },
    uActiveK: { value: 0 },
  }

  const globeMat = new THREE.MeshPhongMaterial({
    specular: new THREE.Color(0x0c1a16), // near-matte: no glossy planet highlight
    shininess: 2,
  })
  const COAST = new THREE.Color('#3A1808') // warm brown coastline
  globeMat.onBeforeCompile = (shader) => {
    shader.uniforms.uOcean = { value: OCEAN }
    shader.uniforms.uLand = { value: LAND }
    shader.uniforms.uRegion = { value: REGION }
    shader.uniforms.uCoast = { value: COAST }
    shader.uniforms.uWaterMask = { value: waterMaskTex }
    shader.uniforms.uTopo = { value: topoTex }
    shader.uniforms.uActiveDir = highlightUniforms.uActiveDir
    shader.uniforms.uActiveK = highlightUniforms.uActiveK
    shader.vertexShader = shader.vertexShader
      .replace(
        'void main() {',
        `attribute float aRegion;
         varying float vRegion;
         varying vec2 vUvX;
         varying vec3 vDirX;
         varying float vFacing;
         void main() {
           vRegion = aRegion;
           vUvX = uv;
           // Radial displacement preserves direction, so this is the
           // undisplaced surface direction in local space.
           vDirX = normalize( position );
           vFacing = normalize( normalMatrix * normal ).z; // 1 toward camera, 0 at limb`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        'void main() {',
        `uniform vec3 uOcean;
         uniform vec3 uLand;
         uniform vec3 uRegion;
         uniform vec3 uCoast;
         uniform sampler2D uWaterMask;
         uniform sampler2D uTopo;
         uniform vec3 uActiveDir;
         uniform float uActiveK;
         varying float vRegion;
         varying vec2 vUvX;
         varying vec3 vDirX;
         varying float vFacing;
         float hash21( vec2 p ) {
           p = fract( p * vec2( 123.34, 456.21 ) );
           p += dot( p, p + 45.32 );
           return fract( p.x * p.y );
         }
         void main() {`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         {
           // Per-pixel land/ocean split from the NASA mask — crisp coastlines.
           float water = texture2D( uWaterMask, vUvX ).r;
           float land = 1.0 - smoothstep( 0.42, 0.55, water );
           float topo = texture2D( uTopo, vUvX ).r; // 0 lowland .. 1 highland

           // --- Shaded-relief land: warm, tonal, like a printed atlas ---
           vec3 lowland = uLand * 1.05;
           vec3 highland = uLand * 0.82 + vec3( 0.05, 0.025, 0.0 );
           vec3 landCol = mix( lowland, highland, smoothstep( 0.28, 0.9, topo ) );
           // faux hillshade from the topo gradient (screen-space derivatives)
           float hs = ( dFdx( topo ) - dFdy( topo ) ) * 6.0;
           landCol *= 1.0 + clamp( hs, -0.22, 0.22 );

           // --- Polished Veena wood body: fine grain + a lacquered sheen ---
           float lit = dot( normalize( vDirX ), normalize( vec3( -0.45, 0.55, 0.7 ) ) ) * 0.5 + 0.5;
           // Fine, mostly-straight wood grain with a gentle waver like real timber.
           float grainCoord = vUvX.y * 240.0 + sin( vUvX.x * 14.0 ) * 1.1
                            + sin( vUvX.y * 90.0 + vUvX.x * 4.0 ) * 0.35;
           float grain = pow( sin( grainCoord ) * 0.5 + 0.5, 2.0 );
           vec3 woodLo = uOcean * 0.90;
           vec3 woodHi = uOcean * 1.12 + vec3( 0.03, 0.015, 0.0 );
           vec3 seaCol = mix( woodLo, woodHi, grain );
           // Lacquered sheen: a broad soft highlight rolling toward the lit side.
           seaCol *= mix( 0.92, 1.24, pow( lit, 1.5 ) );
           float stip = hash21( floor( vUvX * 820.0 ) );
           seaCol *= 1.0 + ( stip - 0.5 ) * 0.03;

           vec3 illus = mix( seaCol, landCol, land );
           // Concentrate the terracotta on the mound cores so the land
           // around stays saffron.
           // A gentle amber warmth over each music region — a glow on the map,
           // not a heavy stain.
           float core = smoothstep( 0.15, 0.95, clamp( vRegion, 0.0, 1.0 ) );
           illus = mix( illus, uRegion, core * land * 0.34 );
           // Coastline: a soft dark line for definition, gilded with a fine
           // gold glint right at the water's edge.
           float coast = clamp( land * ( 1.0 - land ) * 4.0, 0.0, 1.0 );
           illus = mix( illus, uCoast, coast * 0.42 );
           float glint = pow( coast, 3.0 );
           illus = mix( illus, vec3( 0.97, 0.83, 0.45 ), glint * 0.55 );
           // Selected-region spotlight: the active mound brightens while the
           // rest of the globe falls into shadow, so the focus is unmistakable.
           float ang = acos( clamp( dot( normalize( vDirX ), uActiveDir ), -1.0, 1.0 ) );
           float prox = exp( -pow( ang / 0.3, 2.0 ) );
           float act = prox * uActiveK;
           illus = mix( illus, uRegion * 1.05 + vec3( 0.04, 0.02, 0.01 ), act * land * 0.7 );
           illus += act * land * core * vec3( 0.05, 0.025, 0.01 );
           // Peak at 1.0 rather than overshooting, and let everything outside
           // the focus fall well back so the card in front stays the subject.
           illus *= mix( 1.0, 0.20 + prox * 0.80, uActiveK );
           // Gentle limb shading — a dimensional globe, not a flat disc.
           illus *= mix( 0.82, 1.0, smoothstep( 0.0, 0.6, vFacing ) );
           diffuseColor.rgb = illus;
         }`,
      )
  }

  // Placeholder smooth sphere shown until the mask is sampled.
  const geometry = new THREE.SphereGeometry(1, 192, 128)
  seedAttributes(geometry)
  const globe = new THREE.Mesh(geometry, globeMat)
  globeGroup.add(globe)

  // Sculpt the relief once the mask image is available.
  new THREE.ImageLoader().load(TEX + 'earth-water-mask.jpg', (img) => {
    sculpt(globe.geometry, img, regions)
  })

  // ---- Staves: the globe wrapped in sheet music ----
  const graticule = buildGraticule(1.012)
  globe.add(graticule)

  // ---- Gold notes riding the staves ----
  const noteField = buildNotes(1.05)
  globe.add(noteField.group)

  // ---- Compass rosette: the cartographer's mark, anchoring the atlas ----
  const compass = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeCompassTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    }),
  )
  compass.scale.setScalar(0.46)
  compass.position.set(-1.16, -0.82, 0.35)
  globeGroup.add(compass) // sits with the globe, but doesn't spin with it

  // ---- Ornamental gold border: the Veena's carved brass frame ----
  // A decorative ring framing the globe's rim, like the instrument's gilded
  // fret-work and scroll. Sits with the globe but doesn't spin with it.
  const ornament = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeOrnamentRing(),
      transparent: true,
      depthWrite: false,
      depthTest: false,
      opacity: 0.9,
    }),
  )
  ornament.scale.setScalar(2.62)
  globeGroup.add(ornament)

  // ---- Warm halo (breathes with the music) ----
  const atmosUniforms = {
    uColor: { value: HALO.clone() },
    uIntensity: { value: 0.55 },
    uPower: { value: 3.5 },
  }
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.22, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: atmosUniforms,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vNormal = normalize( normalMatrix * normal );
          vec4 mv = modelViewMatrix * vec4( position, 1.0 );
          vView = normalize( -mv.xyz );
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uPower;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float fres = pow( 1.0 - abs( dot( vNormal, vView ) ), uPower );
          gl_FragColor = vec4( uColor, clamp( fres * uIntensity, 0.0, 1.0 ) );
        }`,
    }),
  )
  globeGroup.add(atmosphere)

  function resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', resize)

  return {
    renderer,
    scene,
    camera,
    globe,
    atmosphere,
    atmosUniforms,
    highlightUniforms,
    graticule,
    noteField,
    /** Recolour the whole world at runtime — used to audition palettes. */
    setPalette(name) {
      const p = PALETTES[name]
      if (!p) return null
      OCEAN.set(p.ocean)
      LAND.set(p.land)
      REGION.set(p.region)
      COAST.set(p.coast)
      graticule.traverse((o) => o.material && o.material.color?.set(p.graticule))
      for (const [k, v] of Object.entries(p.css)) {
        document.documentElement.style.setProperty(k, v)
      }
      return p
    },
    render: () => renderer.render(scene, camera),
  }
}

/** Zero-filled land/region attributes so the material compiles immediately. */
function seedAttributes(geometry) {
  const n = geometry.attributes.position.count
  geometry.setAttribute('aLand', new THREE.BufferAttribute(new Float32Array(n), 1))
  geometry.setAttribute('aRegion', new THREE.BufferAttribute(new Float32Array(n), 1))
}

/**
 * Sample the NASA water mask per-vertex and sculpt the sphere: all land gets
 * gentle relief, the nine music regions rise as soft mounds tinted terracotta.
 */
function sculpt(geometry, maskImg, regions) {
  const c = document.createElement('canvas')
  c.width = maskImg.width
  c.height = maskImg.height
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(maskImg, 0, 0)
  const px = ctx.getImageData(0, 0, c.width, c.height).data

  // Mask: white = water. Sample with the sphere's own UVs.
  function waterAt(u, v) {
    const x = Math.min(c.width - 1, Math.max(0, Math.round(u * (c.width - 1))))
    const y = Math.min(c.height - 1, Math.max(0, Math.round((1 - v) * (c.height - 1))))
    return px[(y * c.width + x) * 4] / 255
  }

  const centers = regions.map((r) => latLonToVector3(r.lat, r.lon, 1).normalize())
  const pos = geometry.attributes.position
  const uv = geometry.attributes.uv
  const aLand = geometry.attributes.aLand
  const aRegion = geometry.attributes.aRegion
  const p = new THREE.Vector3()

  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).normalize()
    const water = waterAt(uv.getX(i), uv.getY(i))
    const land = 1 - smoothstep(0.3, 0.62, water)

    // Proximity to the nearest music region — a soft gaussian mound.
    let region = 0
    for (const cdir of centers) {
      const ang = Math.acos(THREE.MathUtils.clamp(p.dot(cdir), -1, 1))
      region = Math.max(region, Math.exp(-((ang / REGION_SIGMA) ** 2)))
    }
    region *= land

    // The sphere stays a true sphere — no displacement. Raised mounds made the
    // silhouette bulge at the limb as the globe turned; the regions read
    // through colour, medallions and labels instead.
    pos.setXYZ(i, p.x, p.y, p.z)
    aLand.setX(i, land)
    aRegion.setX(i, region)
  }
  pos.needsUpdate = true
  aLand.needsUpdate = true
  aRegion.needsUpdate = true
  geometry.computeVertexNormals()
}

function smoothstep(a, b, x) {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/**
 * An ornamental gold ring framing the globe's rim — evokes the carved brass
 * fret-work and scroll of a Veena. All ornament sits outside canvas radius
 * 0.80 so nothing overlaps the globe (world radius 1).
 */
function makeOrnamentRing() {
  const size = 1024
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  const cx = size / 2
  const R = size / 2

  const gold = ctx.createLinearGradient(0, 0, size, size)
  gold.addColorStop(0, '#E7C765')
  gold.addColorStop(0.4, '#C99A38')
  gold.addColorStop(0.6, '#F3DE9A')
  gold.addColorStop(1, '#9A722A')
  ctx.strokeStyle = gold
  ctx.fillStyle = gold

  // Twin fine rings bounding the ornament band.
  const rOuter = R * 0.972
  const rInner = R * 0.828
  ctx.lineWidth = size * 0.006
  ctx.beginPath()
  ctx.arc(cx, cx, rOuter, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = size * 0.004
  ctx.beginPath()
  ctx.arc(cx, cx, rInner, 0, Math.PI * 2)
  ctx.stroke()

  // Repeated carved motifs between the rings — a beaded, petalled frieze.
  const rMid = (rOuter + rInner) / 2
  const bandH = (rOuter - rInner) * 0.5
  const COUNT = 72
  for (let i = 0; i < COUNT; i++) {
    const a = (i / COUNT) * Math.PI * 2
    const mx = cx + Math.cos(a) * rMid
    const my = cx + Math.sin(a) * rMid
    ctx.save()
    ctx.translate(mx, my)
    ctx.rotate(a + Math.PI / 2)
    // A little gold petal (lotus-like), alternating with a bead.
    if (i % 2 === 0) {
      ctx.beginPath()
      ctx.ellipse(0, 0, bandH * 0.42, bandH * 0.95, 0, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.arc(0, 0, bandH * 0.34, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** A gold compass rose — eight points, a ring, and an N mark. */
function makeCompassTexture() {
  const size = 320
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  const cx = size / 2
  const R = size * 0.42

  const gold = ctx.createLinearGradient(0, 0, size, size)
  gold.addColorStop(0, '#E7C765')
  gold.addColorStop(0.45, '#C79A3B')
  gold.addColorStop(0.7, '#F0D68C')
  gold.addColorStop(1, '#A67E2E')
  ctx.strokeStyle = gold
  ctx.fillStyle = gold
  ctx.lineJoin = 'round'

  // Outer rings + fine tick marks.
  ctx.lineWidth = size * 0.008
  ctx.beginPath()
  ctx.arc(cx, cx, R, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = size * 0.004
  ctx.beginPath()
  ctx.arc(cx, cx, R * 0.9, 0, Math.PI * 2)
  ctx.stroke()
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2
    const inner = i % 4 === 0 ? R * 0.78 : R * 0.85
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * inner, cx + Math.sin(a) * inner)
    ctx.lineTo(cx + Math.cos(a) * R * 0.9, cx + Math.sin(a) * R * 0.9)
    ctx.stroke()
  }

  // Eight-point star: long cardinal points, short diagonals.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2
    const len = i % 2 === 0 ? R * 0.74 : R * 0.42
    const w = R * 0.1
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * len, cx + Math.sin(a) * len)
    ctx.lineTo(cx + Math.cos(a + Math.PI / 2) * w, cx + Math.sin(a + Math.PI / 2) * w)
    ctx.lineTo(cx + Math.cos(a + Math.PI) * w * 0.5, cx + Math.sin(a + Math.PI) * w * 0.5)
    ctx.lineTo(cx + Math.cos(a - Math.PI / 2) * w, cx + Math.sin(a - Math.PI / 2) * w)
    ctx.closePath()
    i % 2 === 0 ? ctx.fill() : ctx.stroke()
  }

  // Hub + north letter.
  ctx.beginPath()
  ctx.arc(cx, cx, R * 0.08, 0, Math.PI * 2)
  ctx.fill()
  ctx.font = `600 ${size * 0.11}px "Cormorant Garamond", Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('N', cx, cx - R * 0.86)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** A latitude circle at `lat` degrees, on a sphere of the given radius. */
function latitudeRing(radius, lat, seg = 192) {
  const pts = []
  const phi = (90 - lat) * (Math.PI / 180)
  for (let i = 0; i <= seg; i++) {
    const theta = (i / seg) * Math.PI * 2
    pts.push(
      new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
      ),
    )
  }
  return new THREE.BufferGeometry().setFromPoints(pts)
}

/**
 * The globe is strung like a Veena: a few taut brass strings span the
 * resonator as evenly-spaced latitude lines, shimmering with the music.
 * Faint meridians keep the sphere legible as a globe underneath.
 */
function buildGraticule(radius) {
  const group = new THREE.Group()

  // The brass strings — bright, each with its own shimmer phase.
  const STRING_LATS = [56, 34, 12, -12, -34, -56]
  STRING_LATS.forEach((lat, i) => {
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#FBE08A'),
      transparent: true,
      opacity: 0.72,
    })
    const line = new THREE.Line(latitudeRing(radius, lat), mat)
    line.userData = { isString: true, phase: i * 1.15, baseOpacity: 0.66 }
    group.add(line)
  })

  // Faint meridians — the wood's binding, barely there.
  const barMat = new THREE.LineBasicMaterial({
    color: new THREE.Color('#C89840'),
    transparent: true,
    opacity: 0.07,
  })
  const seg = 128
  for (let lon = 0; lon < 360; lon += 45) {
    const pts = []
    const theta = lon * (Math.PI / 180)
    for (let i = 0; i <= seg; i++) {
      const phi = (i / seg) * Math.PI
      pts.push(
        new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta),
        ),
      )
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), barMat))
  }
  return group
}

/** Brass strings shimmer and swell with the music. */
export function updateStrings(graticule, elapsed, level) {
  graticule.children.forEach((o) => {
    const d = o.userData
    if (!d || !d.isString) return
    const shimmer = 0.5 + 0.5 * Math.sin(elapsed * 3.2 + d.phase)
    o.material.opacity = d.baseOpacity + level * 0.5 + shimmer * (0.05 + level * 0.14)
  })
}

const NOTE_GLYPHS = ['♪', '♫', '♩', '♬', '♭', '♮']

/** A small gold note sprite, drawn on canvas. */
function makeNoteTexture(glyph) {
  const size = 128
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, size, size)
  g.addColorStop(0, '#F6E3A6')
  g.addColorStop(0.5, '#E7C765')
  g.addColorStop(1, '#C79A3B')
  ctx.fillStyle = g
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${size * 0.66}px "Helvetica Neue", Arial, sans-serif`
  ctx.shadowColor = 'rgba(231,199,101,0.6)'
  ctx.shadowBlur = size * 0.12
  ctx.fillText(glyph, size / 2, size / 2)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Gold notes riding the staves — the globe's music made visible. Each note
 * travels along its stave and fades out near the limb.
 */
function buildNotes(radius) {
  const group = new THREE.Group()
  const notes = []
  const staves = [42, 0, -42]
  for (let i = 0; i < 14; i++) {
    const glyph = NOTE_GLYPHS[i % NOTE_GLYPHS.length]
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeNoteTexture(glyph),
        transparent: true,
        depthWrite: false,
        opacity: 0,
      }),
    )
    const scale = 0.07 + Math.random() * 0.03
    sprite.scale.setScalar(scale)
    group.add(sprite)
    notes.push({
      sprite,
      lat: staves[i % staves.length] + (Math.random() * 7 - 3.5),
      lon: Math.random() * 360,
      speed: 5 + Math.random() * 5, // degrees per second
      bob: Math.random() * Math.PI * 2,
      baseScale: scale,
    })
  }
  return { group, notes, radius }
}

export function updateNotes(noteField, dt, elapsed, level, camera, globe) {
  const camDir = new THREE.Vector3()
    .copy(camera.position)
    .sub(globe.getWorldPosition(new THREE.Vector3()))
    .normalize()
  const q = globe.getWorldQuaternion(new THREE.Quaternion())
  const v = new THREE.Vector3()

  for (const n of noteField.notes) {
    n.lon = (n.lon + n.speed * dt) % 360
    // Ride the stave with a gentle bob, and swell with the music.
    const bobLat = n.lat + Math.sin(elapsed * 1.1 + n.bob) * 1.6
    const phi = (90 - bobLat) * (Math.PI / 180)
    const theta = n.lon * (Math.PI / 180)
    const r = noteField.radius
    n.sprite.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta),
    )
    // Fade as the note rounds the far side.
    v.copy(n.sprite.position).applyQuaternion(q).normalize()
    const facing = v.dot(camDir)
    const vis = THREE.MathUtils.smoothstep(facing, 0.1, 0.55)
    n.sprite.material.opacity = vis * (0.5 + level * 0.5)
    n.sprite.scale.setScalar(n.baseScale * (1 + level * 0.3))
    n.sprite.visible = vis > 0.01
  }
}

/**
 * Candidate palettes. The globe's shader reads OCEAN / LAND / REGION by
 * reference, so mutating them re-colours the world without a rebuild; the UI
 * follows through CSS custom properties.
 */
export const PALETTES = {
  'veena': {
    label: 'Veena (warm amber & saffron)',
    ocean: '#8F5220', land: '#F2AC1E', region: '#F0A010', halo: '#E8A010',
    coast: '#3A1808', graticule: '#F2C24E',
    css: { '--ocean': '#8f5220', '--veena-wood': '#B06820', '--card-ink': '#3a1808' },
  },
}

export { PAPER, INK, OCEAN, LAND, REGION, HALO }

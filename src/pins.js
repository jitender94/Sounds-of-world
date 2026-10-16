import * as THREE from 'three'
import { latLonToVector3 } from './coords.js'
import { drawSeal, drawClusterSeal } from './seals.js'

const PIN_RADIUS = 1.085
const RIPPLE_POOL = 6
const FORWARD = new THREE.Vector3(0, 0, 1) // sprites face outward along +Z

/**
 * Two layers of markers, so a crowded atlas stays readable.
 *
 *  - Cluster seals: one per area of the world, shown while you're looking at
 *    the whole globe. Each carries a count of the traditions inside it.
 *  - Tradition seals: the individual musics. They appear when their cluster is
 *    opened, each with its own instrument-derived emblem.
 *
 * Clicking a cluster opens it; clicking a tradition plays it. Everything fades
 * out toward the limb so the globe never looks cluttered at the edges.
 */
export function createPins(globe, camera, regions, clusters) {
  const raycaster = new THREE.Raycaster()

  const pins = [] // individual traditions
  const clusterPins = [] // one per cluster
  const traditionTargets = []
  const clusterTargets = []

  // ---- Tradition markers -------------------------------------------------
  for (const region of regions) {
    const pos = latLonToVector3(region.lat, region.lon, PIN_RADIUS)
    const group = new THREE.Group()
    group.position.copy(pos)
    group.lookAt(pos.clone().multiplyScalar(2))

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: sealTexture(region.seal),
        transparent: true,
        depthWrite: false,
        opacity: 0,
      }),
    )
    sprite.scale.setScalar(0.105)
    group.add(sprite)

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.034, 0.04, 48),
      new THREE.MeshBasicMaterial({
        color: '#E7C765',
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    )
    ring.position.z = -0.05
    group.add(ring)

    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.062, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false }),
    )
    hit.userData = { kind: 'tradition', id: region.id }
    hit.visible = false
    group.add(hit)
    traditionTargets.push(hit)

    const labelTex = makeLabelTexture(region.name)
    const label = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthWrite: false, opacity: 0 }),
    )
    label.scale.set(0.046 * labelTex.userData.aspect, 0.046, 1)
    label.center.set(0.5, 2.3)
    label.userData = { name: region.name, upper: false } // music: natural case
    group.add(label)

    globe.add(group)
    pins.push({
      region,
      group,
      sprite,
      ring,
      label,
      hit,
      normal: pos.clone().normalize(),
      phase: Math.random() * Math.PI * 2,
      shown: 0,
    })
  }

  // ---- Cluster markers ---------------------------------------------------
  for (const cluster of clusters) {
    const count = regions.filter((r) => r.cluster === cluster.id).length
    const pos = latLonToVector3(cluster.lat, cluster.lon, PIN_RADIUS)
    const group = new THREE.Group()
    group.position.copy(pos)
    group.lookAt(pos.clone().multiplyScalar(2))

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: clusterTexture(count),
        transparent: true,
        depthWrite: false,
        opacity: 0,
      }),
    )
    sprite.scale.setScalar(0.135)
    group.add(sprite)

    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ visible: false }),
    )
    hit.userData = { kind: 'cluster', id: cluster.id }
    group.add(hit)
    clusterTargets.push(hit)

    const labelTex = makeLabelTexture(cluster.name, true) // area: caps
    const label = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthWrite: false, opacity: 0 }),
    )
    label.scale.set(0.05 * labelTex.userData.aspect, 0.05, 1)
    label.center.set(0.5, 2.3)
    label.userData = { name: cluster.name, upper: true } // area: caps
    group.add(label)

    globe.add(group)
    clusterPins.push({
      cluster,
      count,
      group,
      sprite,
      label,
      hit,
      normal: pos.clone().normalize(),
      phase: Math.random() * Math.PI * 2,
      shown: 1,
    })
  }

  // ---- Marker de-collision ------------------------------------------------
  // Traditions that sit close together (Qawwali and Bhangra are barely 4°
  // apart, and a seal spans about 5°) would bury each other when their area
  // opens. Nudge each one along the surface until every seal has room, then
  // draw a fine leader line back to where the music actually comes from, so
  // spreading them never misstates the geography.
  const MIN_SEP = 0.235 // radians (~13°) — a seal plus its label
  computeSpread(pins, MIN_SEP)

  for (const p of pins) {
    // A tether from the true location out to the displaced seal.
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(),
    ])
    const tether = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({
        color: '#E7C765',
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    )
    tether.visible = false
    globe.add(tether)
    p.tether = tether
    p.displayNormal = p.normal.clone()
  }

  // ---- Selection ring ----------------------------------------------------
  const SEL_ANGLE = 0.22
  const selRing = new THREE.Mesh(
    new THREE.RingGeometry(Math.sin(SEL_ANGLE) * 0.955, Math.sin(SEL_ANGLE), 96),
    new THREE.MeshBasicMaterial({
      color: '#E7C765',
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
  selRing.visible = false
  globe.add(selRing)

  function placeSelRing(regionId) {
    const p = pins.find((x) => x.region.id === regionId)
    if (!p) return
    // Follow the seal's displayed spot, which drifts while the area opens.
    const n = p.displayNormal
    selRing.position.copy(n).multiplyScalar(Math.cos(SEL_ANGLE) * 1.015)
    selRing.lookAt(selRing.position.clone().add(n))
    selRing.visible = true
  }

  // ---- Beat ripples ------------------------------------------------------
  const ripples = []
  for (let i = 0; i < RIPPLE_POOL; i++) {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.05, 0.058, 48),
      new THREE.MeshBasicMaterial({
        color: '#F5C95E',
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    )
    mesh.visible = false
    globe.add(mesh)
    ripples.push({ mesh, t: 0, active: false })
  }

  let activeId = null
  let hovered = null
  let expanded = null // the open cluster
  let reduceMotion = false

  function setActive(id) {
    activeId = id
    if (id) placeSelRing(id)
    else selRing.visible = false
  }
  function setExpanded(clusterId) {
    expanded = clusterId
  }
  function setReduceMotion(v) {
    reduceMotion = v
  }

  function pulse() {
    const active = pins.find((p) => p.region.id === activeId)
    if (!active) return
    const free = ripples.find((r) => !r.active)
    if (!free) return
    free.active = true
    free.t = 0
    free.mesh.visible = true
    free.mesh.position.copy(active.group.position).multiplyScalar(0.96)
    free.mesh.quaternion.copy(active.group.quaternion)
  }

  /** Hit-test whichever marker layer is currently live. */
  function pick(ndc) {
    raycaster.setFromCamera(ndc, camera)
    // Open traditions take priority — they sit on top of their cluster.
    const live = traditionTargets.filter((t) => t.visible)
    const hits = raycaster.intersectObjects([...live, ...clusterTargets], false)
    for (const h of hits) {
      const d = h.object.userData
      if (d.kind === 'cluster' && d.id === expanded) continue // opened; ignore
      return { kind: d.kind, id: d.id }
    }
    return null
  }

  function updateHover(ndc) {
    const hit = pick(ndc)
    hovered = hit ? hit.id : null
    return hit
  }

  const _n = new THREE.Vector3()
  const _camDir = new THREE.Vector3()
  const _q = new THREE.Quaternion()
  const _wp = new THREE.Vector3()
  const _tetherA = new THREE.Vector3()
  const _tetherB = new THREE.Vector3()

  function facingOf(normal) {
    _n.copy(normal).applyQuaternion(_q)
    return _n.dot(_camDir)
  }

  function update(dt, elapsed, levels) {
    _camDir.copy(camera.position).sub(globe.getWorldPosition(_wp)).normalize()
    globe.getWorldQuaternion(_q)
    const ease = Math.min(1, dt * 6)

    // Cluster markers: visible unless their cluster is open.
    for (const c of clusterPins) {
      const vis = THREE.MathUtils.smoothstep(facingOf(c.normal), 0.12, 0.5)
      const open = expanded === c.cluster.id
      const target = open ? 0 : 1
      c.shown += (target - c.shown) * ease
      const isHover = hovered === c.cluster.id
      const a = c.shown * vis
      c.sprite.material.opacity = a
      c.label.material.opacity = a * (isHover ? 1 : 0.5)
      c.sprite.scale.setScalar(0.135 * (isHover ? 1.12 : 1) * (0.7 + 0.3 * vis))
      const live = a > 0.02
      c.sprite.visible = live
      c.label.visible = live
      c.hit.visible = live
    }

    // Tradition markers: only while their cluster is open.
    for (const p of pins) {
      const open = expanded === p.region.cluster
      p.shown += ((open ? 1 : 0) - p.shown) * ease

      // Seals glide out to their de-collided spot as the area opens, and
      // settle back onto true geography as it closes.
      const spreadK = THREE.MathUtils.smoothstep(p.shown, 0, 1)
      p.displayNormal.copy(p.normal).lerp(p.spreadNormal, spreadK).normalize()
      const vis = THREE.MathUtils.smoothstep(facingOf(p.displayNormal), 0.12, 0.5)
      p.group.position.copy(p.displayNormal).multiplyScalar(PIN_RADIUS)
      p.group.quaternion.setFromUnitVectors(FORWARD, p.displayNormal)

      // Leader line back to where the music actually comes from.
      const drift = p.normal.angleTo(p.displayNormal)
      const tetherA = _tetherA.copy(p.normal).multiplyScalar(1.002)
      const tetherB = _tetherB.copy(p.displayNormal).multiplyScalar(PIN_RADIUS * 0.985)
      const tp = p.tether.geometry.attributes.position
      tp.setXYZ(0, tetherA.x, tetherA.y, tetherA.z)
      tp.setXYZ(1, tetherB.x, tetherB.y, tetherB.z)
      tp.needsUpdate = true

      const isActive = p.region.id === activeId
      const isHover = p.region.id === hovered
      const idle = reduceMotion ? 0 : Math.sin(elapsed * 1.4 + p.phase) * 0.5 + 0.5

      let scale = 1
      let ringOpacity = 0.28 + idle * 0.16
      let labelK = 0.55
      if (isActive) {
        const react = reduceMotion ? 0 : levels.overall
        scale = 1.3 + react * 0.14
        ringOpacity = 0.85
        labelK = 1
      } else if (isHover) {
        scale = 1.16
        ringOpacity = 0.7
        labelK = 1
      } else if (activeId) {
        ringOpacity *= 0.35
        labelK = 0.28
      }

      const a = p.shown * vis
      p.sprite.material.opacity = a * (activeId && !isActive ? 0.55 : 1)
      p.label.material.opacity = a * labelK
      p.ring.material.opacity = a * ringOpacity
      p.ring.scale.setScalar(isActive ? 1.4 + (reduceMotion ? 0 : levels.overall) * 0.6 : 1 + idle * 0.18)
      p.sprite.scale.setScalar(0.105 * scale * (0.7 + 0.3 * vis))

      const live = a > 0.02
      p.sprite.visible = live
      p.label.visible = live
      p.ring.visible = live
      p.hit.visible = live
      // Only worth drawing once the seal has actually travelled from home.
      const tetherOn = live && drift > 0.01
      p.tether.visible = tetherOn
      p.tether.material.opacity = tetherOn ? a * 0.28 : 0
    }

    if (selRing.visible) {
      if (activeId) placeSelRing(activeId) // track the seal as it settles
      const react = reduceMotion ? 0 : levels.overall
      selRing.material.opacity += (0.7 + react * 0.3 - selRing.material.opacity) * 0.1
      selRing.scale.setScalar(1 + react * 0.02 + (reduceMotion ? 0 : Math.sin(elapsed * 1.2) * 0.012))
    }

    for (const r of ripples) {
      if (!r.active) continue
      r.t += dt
      const k = r.t / 1.6
      if (k >= 1) {
        r.active = false
        r.mesh.visible = false
        continue
      }
      r.mesh.scale.setScalar(1 + k * 2.6)
      r.mesh.material.opacity = (1 - k) * 0.5
    }
  }

  // Labels are baked into textures at startup, but the Cormorant serif may
  // still be loading then — so rebuild them once the web font is ready.
  if (document.fonts?.ready) {
    document.fonts.load(LABEL_FONT).then(() => document.fonts.ready).then(() => {
      for (const p of pins) rebuildLabel(p.label)
      for (const c of clusterPins) rebuildLabel(c.label)
    })
  }
  function rebuildLabel(label) {
    const name = label.userData?.name
    if (!name) return
    const tex = makeLabelTexture(name, label.userData.upper)
    label.material.map?.dispose()
    label.material.map = tex
    label.material.needsUpdate = true
    label.scale.set(label.scale.y * tex.userData.aspect, label.scale.y, 1)
  }

  return {
    pins,
    clusterPins,
    setActive,
    setExpanded,
    setReduceMotion,
    pulse,
    updateHover,
    pick,
    update,
    get expanded() {
      return expanded
    },
  }
}

/**
 * Push apart any two traditions in the same area that sit closer than
 * `minSep` radians, by rotating each a little along the great circle between
 * them. Relaxing repeatedly settles a whole crowded area (South Asia's four)
 * into positions where every seal is readable, while keeping each marker as
 * near its true home as the spacing allows. Writes `spreadNormal` per pin.
 */
function computeSpread(pins, minSep) {
  const byCluster = new Map()
  for (const p of pins) {
    p.spreadNormal = p.normal.clone()
    if (!byCluster.has(p.region.cluster)) byCluster.set(p.region.cluster, [])
    byCluster.get(p.region.cluster).push(p)
  }

  const axis = new THREE.Vector3()
  const fallback = new THREE.Vector3()
  for (const group of byCluster.values()) {
    if (group.length < 2) continue
    for (let iter = 0; iter < 80; iter++) {
      let moved = false
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const a = group[i].spreadNormal
          const b = group[j].spreadNormal
          const ang = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1))
          if (ang >= minSep) continue
          axis.crossVectors(a, b)
          if (axis.lengthSq() < 1e-10) {
            // Effectively coincident — pick any perpendicular to separate them.
            fallback.set(0, 1, 0)
            if (Math.abs(a.dot(fallback)) > 0.9) fallback.set(1, 0, 0)
            axis.crossVectors(a, fallback)
          }
          axis.normalize()
          const push = (minSep - ang) * 0.5
          a.applyAxisAngle(axis, -push).normalize()
          b.applyAxisAngle(axis, push).normalize()
          moved = true
        }
      }
      if (!moved) break
    }
  }
}

// ------------------------------------------------------------------ textures

function sealTexture(sealId) {
  const size = 320
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  drawSeal(c.getContext('2d'), size, sealId)
  return finish(c)
}

function clusterTexture(count) {
  const size = 320
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  drawClusterSeal(c.getContext('2d'), size, count)
  return finish(c)
}

function finish(canvas) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/**
 * A map-style name label: warm gilt Marcellus serif on a soft dark pill.
 * Areas render in caps; music names keep their natural case.
 */
const LABEL_FONT = '400 60px "Marcellus", Georgia, "Times New Roman", serif'
function makeLabelTexture(name, upper = false) {
  const H = 108
  const text = upper ? name.toUpperCase() : name
  const spacing = upper ? '3px' : '1px'
  const measure = document.createElement('canvas').getContext('2d')
  measure.font = LABEL_FONT
  measure.letterSpacing = spacing
  const textW = Math.ceil(measure.measureText(text).width)
  const padX = 40
  const W = textW + padX * 2
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')

  const r = H * 0.42
  ctx.fillStyle = 'rgba(28, 14, 6, 0.66)'
  ctx.beginPath()
  ctx.moveTo(r, H * 0.26)
  ctx.arcTo(W, H * 0.26, W, H * 0.74, r)
  ctx.arcTo(W, H * 0.74, 0, H * 0.74, r)
  ctx.arcTo(0, H * 0.74, 0, H * 0.26, r)
  ctx.arcTo(0, H * 0.26, W, H * 0.26, r)
  ctx.fill()

  ctx.font = LABEL_FONT
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = spacing
  ctx.fillStyle = '#F6E4B4' // warm gilt cream
  ctx.fillText(text, W / 2, H / 2 + 2)

  const tex = finish(c)
  tex.userData = { aspect: W / H }
  return tex
}

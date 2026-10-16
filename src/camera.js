import * as THREE from 'three'
import gsap from 'gsap'
import { latLonToVector3 } from './coords.js'

const FRONT = new THREE.Vector3(0, 0, 1) // point that faces the camera
const WORLD_Y = new THREE.Vector3(0, 1, 0)

/**
 * Owns globe rotation: idle auto-rotation, pointer drag, wheel zoom, and the
 * GSAP fly-to that turns a region toward the camera. Fly-to uses a full
 * quaternion alignment (setFromUnitVectors) rather than the spec's
 * longitude-only tween, so high/low-latitude pins face front correctly.
 */
export function createCameraController(globe, camera, opts = {}) {
  const autoSpeed = opts.autoSpeed ?? 0.045 // rad/sec — slow, dreamy drift
  const minZ = 2.2
  const maxZ = 4.4

  let autoRotate = true
  let dragging = false
  let idleTimer = 0
  let reduceMotion = false
  let flying = false
  let hold = false // while a region is selected the globe stays still

  let last = { x: 0, y: 0 }
  let pitch = 0 // accumulated latitude tilt, clamped
  const baseZ = camera.position.z
  let userZ = baseZ // resting distance the user sets with the wheel
  let focusZoom = false // dolly the camera in on the focused region

  function setReduceMotion(v) {
    reduceMotion = v
    if (v) autoRotate = false
  }

  function setHold(v) {
    hold = v
    focusZoom = v // zoom in on select, back out on deselect
    if (v) autoRotate = false
  }
  /** Zoom in without holding the globe still — used when opening a cluster. */
  function setFocus(v) {
    focusZoom = v
  }

  function onPointerDown(x, y) {
    dragging = true
    autoRotate = false
    flying = false
    gsap.killTweensOf(globe.quaternion)
    last.x = x
    last.y = y
  }

  function onPointerMove(x, y) {
    if (!dragging) return
    const dx = (x - last.x) * 0.005
    const dy = (y - last.y) * 0.005
    last.x = x
    last.y = y
    globe.rotateOnWorldAxis(WORLD_Y, dx)
    // Clamp cumulative pitch so the globe never flips past the poles.
    const next = THREE.MathUtils.clamp(pitch + dy, -1.05, 1.05)
    const applied = next - pitch
    pitch = next
    globe.rotateOnWorldAxis(getRightAxis(), applied)
  }

  function onPointerUp() {
    dragging = false
    idleTimer = 0
  }

  /** Horizontal trackpad pan — spin the globe by hand. */
  function rotateBy(delta) {
    if (Math.abs(delta) < 0.0001) return
    autoRotate = false
    flying = false
    idleTimer = 0
    globe.rotateOnWorldAxis(WORLD_Y, delta)
  }

  // Wheel/trackpad zoom adjusts the resting distance; update() eases to it,
  // and a focused region temporarily overrides it (see FOCUS_Z).
  function zoom(deltaY) {
    userZ = THREE.MathUtils.clamp(userZ + deltaY * 0.001, minZ, maxZ)
  }

  const right = new THREE.Vector3()
  function getRightAxis() {
    // Camera's right vector in world space (for intuitive vertical drag).
    right.setFromMatrixColumn(camera.matrixWorld, 0).normalize()
    return right
  }

  function flyToRegion(region, onArrive) {
    autoRotate = false
    flying = true
    gsap.killTweensOf(globe.quaternion)

    const dir = latLonToVector3(region.lat, region.lon, 1).normalize()
    // Shortest-arc alignment of the region to the camera…
    const align = new THREE.Quaternion().setFromUnitVectors(dir, FRONT)
    // …then twist about the view axis so the globe's north stays up.
    const north = new THREE.Vector3(0, 1, 0).applyQuaternion(align)
    const northProj = north.sub(FRONT.clone().multiplyScalar(north.dot(FRONT)))
    const upProj = WORLD_Y.clone().sub(FRONT.clone().multiplyScalar(WORLD_Y.dot(FRONT)))
    let target = align
    if (northProj.lengthSq() > 1e-6 && upProj.lengthSq() > 1e-6) {
      northProj.normalize()
      upProj.normalize()
      const angle = Math.atan2(
        northProj.clone().cross(upProj).dot(FRONT),
        northProj.dot(upProj),
      )
      const twist = new THREE.Quaternion().setFromAxisAngle(FRONT, angle)
      target = twist.multiply(align)
    }
    const startQ = globe.quaternion.clone()
    const proxy = { t: 0 }

    gsap.to(proxy, {
      t: 1,
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        globe.quaternion.slerpQuaternions(startQ, target, proxy.t)
      },
      onComplete: () => {
        flying = false
        pitch = 0
        if (!reduceMotion && !hold) autoRotate = true
        onArrive?.()
      },
    })

    // The dolly-in is handled by the focus-zoom easing in update().
  }

  function resumeAuto() {
    if (!reduceMotion && !dragging && !flying && !hold) autoRotate = true
  }

  const FOCUS_Z = 2.55 // closer framing when a region is in focus
  function update(dt) {
    if (dragging) {
      idleTimer = 0
    } else if (!autoRotate && !flying && !reduceMotion && !hold) {
      idleTimer += dt
      if (idleTimer > 3) autoRotate = true // resume after 3s idle
    }
    if (autoRotate && !dragging && !reduceMotion) {
      globe.rotateOnWorldAxis(WORLD_Y, autoSpeed * dt)
    }
    // Dolly toward the focused region on select, back to the user's resting
    // distance on deselect.
    const targetZ = focusZoom ? FOCUS_Z : userZ
    if (Math.abs(camera.position.z - targetZ) > 0.001) {
      camera.position.z += (targetZ - camera.position.z) * Math.min(1, dt * 3.5)
    }
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    zoom,
    rotateBy,
    flyToRegion,
    resumeAuto,
    setHold,
    setFocus,
    setReduceMotion,
    update,
    get isDragging() {
      return dragging
    },
  }
}

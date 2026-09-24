import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const mount = document.querySelector("#brain-3d");
if (!mount) throw new Error("Missing #brain-3d element");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  32,
  mount.clientWidth / Math.max(mount.clientHeight, 1),
  0.1,
  100
);
camera.position.set(0, 0, 5.4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.style.cursor = "grab";
renderer.domElement.style.touchAction = "none";
mount.appendChild(renderer.domElement);

const brain = new THREE.Group();
scene.add(brain);

const random = mulberry32(7319);
function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/*
  Brain-like procedural surface.
  Each hemisphere is an elongated ellipsoid with many longitudinal
  folds. The central cleft is kept narrow so the two hemispheres
  read clearly as a brain rather than an oval particle cloud.
*/
const points = [];
const hemispherePoints = 2500;

function makeBrainPoint(side) {
  // Uniform-ish point on an ellipsoid surface.
  const z0 = random() * 2 - 1;
  const a = Math.sqrt(Math.max(0, 1 - z0 * z0));
  const phi = random() * Math.PI * 2;

  let x = a * Math.cos(phi);
  let y = z0;
  let z = a * Math.sin(phi);

  // Rotate the coordinate system slightly so the brain has a natural pose.
  const tilt = -0.08;
  const yy = y * Math.cos(tilt) - z * Math.sin(tilt);
  const zz = y * Math.sin(tilt) + z * Math.cos(tilt);
  y = yy;
  z = zz;

  // Main brain proportions.
  x *= 0.91;
  y *= 0.86;
  z *= 1.28;

  // Fold pattern: several overlapping waves create gyri-like ridges.
  const longitudinal =
    1 +
    0.075 * Math.sin(z * 11 + phi * 2.2) +
    0.045 * Math.sin(z * 23 - phi * 1.4) +
    0.025 * Math.sin(z * 37 + y * 8);

  const cross =
    1 +
    0.035 * Math.sin(phi * 15 + z * 7) +
    0.02 * Math.sin(phi * 29 - z * 13);

  x *= longitudinal * cross;
  y *= longitudinal * 0.98;
  z *= longitudinal;

  // Two distinct hemispheres.
  x = side * (0.22 + Math.abs(x) * 0.98);

  // Deep central fissure: pull the medial surfaces away from x=0.
  const medial = Math.exp(-Math.pow((Math.abs(x) - 0.25) / 0.18, 2));
  x += side * medial * 0.14;

  // Slight frontal widening and rear taper.
  const rear = Math.max(0, -z);
  const front = Math.max(0, z);
  x *= 1 + front * 0.045 - rear * 0.055;

  // Flatten lower edge a little.
  if (y < -0.25) y *= 0.93;

  return new THREE.Vector3(x, y, z);
}

for (const side of [-1, 1]) {
  for (let i = 0; i < hemispherePoints; i++) {
    const p = makeBrainPoint(side);
    points.push(p.x, p.y, p.z);
  }
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(points, 3)
);

const particleMaterial = new THREE.PointsMaterial({
  color: 0x9de7f7,
  size: 0.021,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const particles = new THREE.Points(geometry, particleMaterial);
brain.add(particles);

// Create neural connections from nearby points.
const pos = geometry.attributes.position.array;
const links = [];
const maxLinks = 650;

for (let i = 0; i < pos.length && links.length < maxLinks * 6; i += 3) {
  if (random() > 0.11) continue;

  let bestJ = -1;
  let bestD2 = 0.24;

  // Local search keeps the lines short and organic.
  for (
    let j = i + 3;
    j < Math.min(pos.length, i + 3 * 80);
    j += 3
  ) {
    if (random() > 0.12) continue;

    const dx = pos[i] - pos[j];
    const dy = pos[i + 1] - pos[j + 1];
    const dz = pos[i + 2] - pos[j + 2];
    const d2 = dx * dx + dy * dy + dz * dz;

    if (d2 < bestD2 && d2 > 0.006) {
      bestD2 = d2;
      bestJ = j;
    }
  }

  if (bestJ >= 0) {
    links.push(
      pos[i], pos[i + 1], pos[i + 2],
      pos[bestJ], pos[bestJ + 1], pos[bestJ + 2]
    );
  }
}

const linkGeometry = new THREE.BufferGeometry();
linkGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(links, 3)
);

const linkMaterial = new THREE.LineBasicMaterial({
  color: 0x68c8df,
  transparent: true,
  opacity: 0.12,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

brain.add(new THREE.LineSegments(linkGeometry, linkMaterial));

// Moving neural sparks.
const sparkCount = 120;
const sparkPositions = [];

for (let i = 0; i < sparkCount; i++) {
  const side = random() < 0.5 ? -1 : 1;
  const p = makeBrainPoint(side);
  p.multiplyScalar(1.006);
  sparkPositions.push(p.x, p.y, p.z);
}

const sparkGeometry = new THREE.BufferGeometry();
sparkGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(sparkPositions, 3)
);

const sparkMaterial = new THREE.PointsMaterial({
  color: 0xe2fbff,
  size: 0.032,
  transparent: true,
  opacity: 0.82,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

brain.add(new THREE.Points(sparkGeometry, sparkMaterial));

/* ---------- Mouse / touch controls ---------- */

let dragging = false;
let lastX = 0;
let lastY = 0;

let rotationTargetX = -0.04;
let rotationTargetY = 0.22;
let rotationX = rotationTargetX;
let rotationY = rotationTargetY;

let zoomTarget = 5.4;

function startDrag(x, y) {
  dragging = true;
  lastX = x;
  lastY = y;
  renderer.domElement.style.cursor = "grabbing";
}

function moveDrag(x, y) {
  if (!dragging) return;

  const dx = x - lastX;
  const dy = y - lastY;
  lastX = x;
  lastY = y;

  rotationTargetY += dx * 0.012;
  rotationTargetX += dy * 0.008;

  rotationTargetX = THREE.MathUtils.clamp(
    rotationTargetX,
    -1.0,
    1.0
  );
}

function endDrag() {
  dragging = false;
  renderer.domElement.style.cursor = "grab";
}

renderer.domElement.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  renderer.domElement.setPointerCapture?.(event.pointerId);
  startDrag(event.clientX, event.clientY);
});

renderer.domElement.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  event.preventDefault();
  moveDrag(event.clientX, event.clientY);
});

renderer.domElement.addEventListener("pointerup", (event) => {
  renderer.domElement.releasePointerCapture?.(event.pointerId);
  endDrag();
});

renderer.domElement.addEventListener("pointercancel", endDrag);
renderer.domElement.addEventListener("pointerleave", () => {
  if (dragging) return;
});

// Scroll wheel zoom.
renderer.domElement.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    zoomTarget += event.deltaY * 0.0025;
    zoomTarget = THREE.MathUtils.clamp(zoomTarget, 4.0, 7.0);
  },
  { passive: false }
);

// On touch, dragging works the same way as mouse dragging.
renderer.domElement.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length !== 1) return;
    const t = event.touches[0];
    startDrag(t.clientX, t.clientY);
  },
  { passive: true }
);

renderer.domElement.addEventListener(
  "touchmove",
  (event) => {
    if (!dragging || event.touches.length !== 1) return;
    const t = event.touches[0];
    moveDrag(t.clientX, t.clientY);
  },
  { passive: true }
);

renderer.domElement.addEventListener("touchend", endDrag);

/* ---------- Resize / animation ---------- */

function resize() {
  const width = mount.clientWidth;
  const height = Math.max(mount.clientHeight, 320);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener("resize", resize);
resize();

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // Slow idle motion when the user isn't dragging.
  if (!dragging) {
    rotationTargetY += 0.0017;
    rotationTargetX = THREE.MathUtils.lerp(
      rotationTargetX,
      -0.04 + Math.sin(t * 0.45) * 0.025,
      0.018
    );
  }

  rotationX = THREE.MathUtils.lerp(rotationX, rotationTargetX, 0.08);
  rotationY = THREE.MathUtils.lerp(rotationY, rotationTargetY, 0.08);

  brain.rotation.x = rotationX;
  brain.rotation.y = rotationY;

  camera.position.z = THREE.MathUtils.lerp(
    camera.position.z,
    zoomTarget,
    0.08
  );

  particleMaterial.opacity =
    0.84 + Math.sin(t * 1.7) * 0.07;

  sparkMaterial.opacity =
    0.7 + Math.sin(t * 2.4) * 0.18;

  linkMaterial.opacity =
    0.095 + Math.sin(t * 1.25) * 0.025;

  renderer.render(scene, camera);
}

animate();

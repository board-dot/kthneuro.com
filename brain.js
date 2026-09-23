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
camera.position.set(0, 0.1, 5.8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(mount.clientWidth, mount.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
mount.appendChild(renderer.domElement);

const brain = new THREE.Group();
scene.add(brain);

// A procedural brain-like point cloud: two hemispheres made from distorted
// ellipsoids, with a shallow central cleft.
const points = [];
const random = mulberry32(1207);

function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function brainSurfacePoint(side) {
  const u = random();
  const v = random();
  const theta = Math.acos(2 * u - 1);
  const phi = Math.PI * 2 * v;

  // Ellipsoid dimensions; narrow near the middle creates the brain cleft.
  let x = Math.sin(theta) * Math.cos(phi);
  let y = Math.cos(theta);
  let z = Math.sin(theta) * Math.sin(phi);

  const scaleX = 1.35;
  const scaleY = 1.05;
  const scaleZ = 1.62;

  // Organic folds/ripples.
  const ripple =
    1 +
    0.055 * Math.sin(9 * phi + 2.3 * y) +
    0.035 * Math.sin(17 * phi + 4 * y) +
    0.025 * Math.sin(23 * theta);

  x *= scaleX * ripple;
  y *= scaleY * ripple;
  z *= scaleZ * ripple;

  // Stronger separation around the longitudinal cleft.
  x += side * 0.34;
  const cleft = Math.exp(-Math.pow(x / 0.32, 2));
  x += side * cleft * 0.16;

  // Slightly flatten the underside.
  if (y < -0.55) y *= 0.88;

  return new THREE.Vector3(x, y, z);
}

const countPerHemisphere = 1150;
for (const side of [-1, 1]) {
  for (let i = 0; i < countPerHemisphere; i++) {
    const p = brainSurfacePoint(side);
    points.push(p.x, p.y, p.z);
  }
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(points, 3)
);

const material = new THREE.PointsMaterial({
  color: 0x74c0d9,
  size: 0.026,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const cloud = new THREE.Points(geometry, material);
brain.add(cloud);

// Neural links: connect nearby points with short glowing line segments.
const positions = geometry.attributes.position.array;
const linkPositions = [];
const linkLimit = 360;

for (let i = 0; i < positions.length; i += 3) {
  if (linkPositions.length / 6 >= linkLimit) break;

  const ax = positions[i], ay = positions[i + 1], az = positions[i + 2];

  // Look ahead locally to avoid expensive all-to-all connection testing.
  for (let j = i + 3; j < Math.min(i + 3 * 28, positions.length); j += 3) {
    if (random() > 0.045) continue;

    const bx = positions[j], by = positions[j + 1], bz = positions[j + 2];
    const dx = ax - bx, dy = ay - by, dz = az - bz;
    const d2 = dx * dx + dy * dy + dz * dz;

    if (d2 < 0.18 && d2 > 0.002) {
      linkPositions.push(ax, ay, az, bx, by, bz);
      break;
    }
  }
}

const linkGeometry = new THREE.BufferGeometry();
linkGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(linkPositions, 3)
);

const linkMaterial = new THREE.LineBasicMaterial({
  color: 0x5aafc9,
  transparent: true,
  opacity: 0.16,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

brain.add(new THREE.LineSegments(linkGeometry, linkMaterial));

// Small central neural sparks.
const sparkCount = 180;
const sparkPositions = [];
for (let i = 0; i < sparkCount; i++) {
  const p = new THREE.Vector3(
    (random() - 0.5) * 2.2,
    (random() - 0.5) * 1.65,
    (random() - 0.5) * 2.7
  );
  if (Math.abs(p.x) > 0.42) p.x *= 0.45;
  sparkPositions.push(p.x, p.y, p.z);
}

const sparkGeometry = new THREE.BufferGeometry();
sparkGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(sparkPositions, 3)
);

const sparkMaterial = new THREE.PointsMaterial({
  color: 0xb9f3ff,
  size: 0.018,
  transparent: true,
  opacity: 0.72,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

brain.add(new THREE.Points(sparkGeometry, sparkMaterial));

// Lighting is intentionally subtle because the main visual is emissive particles.
const ambient = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambient);

// Interaction
let targetX = 0;
let targetY = 0;

function pointerMove(event) {
  const rect = mount.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  targetY = (x - 0.5) * 0.75;
  targetX = (y - 0.5) * 0.42;
}

mount.addEventListener("pointermove", pointerMove);

mount.addEventListener("pointerleave", () => {
  targetX = 0;
  targetY = 0;
});

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

  brain.rotation.y += 0.0018;
  brain.rotation.x = THREE.MathUtils.lerp(
    brain.rotation.x,
    targetX + Math.sin(t * 0.35) * 0.035,
    0.035
  );
  brain.rotation.y = THREE.MathUtils.lerp(
    brain.rotation.y,
    brain.rotation.y + targetY * 0.015,
    0.01
  );

  const pulse = 0.92 + Math.sin(t * 1.5) * 0.055;
  material.opacity = pulse;
  sparkMaterial.opacity = 0.58 + Math.sin(t * 2.1) * 0.16;

  renderer.render(scene, camera);
}

animate();

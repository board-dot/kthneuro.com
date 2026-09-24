import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

const container = document.getElementById("brain-3d");

if (!container) {
  throw new Error("Brain container not found.");
}

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);

camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
renderer.domElement.style.display = "block";
renderer.domElement.style.cursor = "grab";
renderer.domElement.style.touchAction = "none";

container.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 1.4));

const keyLight = new THREE.DirectionalLight(0xffffff, 2);
keyLight.position.set(3, 4, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x8fdff0, 1.5);
fillLight.position.set(-4, 1, 3);
scene.add(fillLight);

// Brain
const brain = new THREE.Group();
scene.add(brain);

const loader = new GLTFLoader();

loader.load(
  "./models/brain.glb",
  (gltf) => {
    const model = gltf.scene;

    // Center and scale the model automatically
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);

    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = 3.1 / maxDimension;

    model.scale.setScalar(scale);

    // Give the brain a clean KTH Neuro appearance
    model.traverse((object) => {
      if (!object.isMesh) return;

      object.castShadow = false;
      object.receiveShadow = false;

      if (object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach((material) => {
          material.color.set("#8fd8e8");
          material.roughness = 0.7;
          material.metalness = 0.05;
        });
      }
    });

    brain.add(model);

    // Slight initial angle
    brain.rotation.x = -0.08;
    brain.rotation.y = 0.25;
  },
  undefined,
  (error) => {
    console.error("Could not load brain.glb:", error);
  }
);

// Mouse / touch rotation
let dragging = false;
let previousX = 0;
let previousY = 0;

let targetRotationX = -0.08;
let targetRotationY = 0.25;

let currentRotationX = targetRotationX;
let currentRotationY = targetRotationY;

renderer.domElement.addEventListener("pointerdown", (event) => {
  dragging = true;

  previousX = event.clientX;
  previousY = event.clientY;

  renderer.domElement.setPointerCapture(event.pointerId);
  renderer.domElement.style.cursor = "grabbing";
});

renderer.domElement.addEventListener("pointermove", (event) => {
  if (!dragging) return;

  const deltaX = event.clientX - previousX;
  const deltaY = event.clientY - previousY;

  previousX = event.clientX;
  previousY = event.clientY;

  targetRotationY += deltaX * 0.01;
  targetRotationX += deltaY * 0.01;

  targetRotationX = THREE.MathUtils.clamp(
    targetRotationX,
    -1.2,
    1.2
  );
});

function stopDragging() {
  dragging = false;
  renderer.domElement.style.cursor = "grab";
}

renderer.domElement.addEventListener("pointerup", stopDragging);
renderer.domElement.addEventListener("pointercancel", stopDragging);

// Slow automatic rotation when not being controlled
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  if (!dragging) {
    targetRotationY += 0.0015;
  }

  currentRotationX = THREE.MathUtils.lerp(
    currentRotationX,
    targetRotationX,
    0.08
  );

  currentRotationY = THREE.MathUtils.lerp(
    currentRotationY,
    targetRotationY,
    0.08
  );

  brain.rotation.x = currentRotationX;
  brain.rotation.y = currentRotationY;

  renderer.render(scene, camera);
}

animate();

// Responsive
function resize() {
  const width = container.clientWidth;
  const height = Math.max(container.clientHeight, 300);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

window.addEventListener("resize", resize);
resize();
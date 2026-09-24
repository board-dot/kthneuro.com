import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";

const container = document.getElementById("brain-3d");

if (!container) {
  console.error("KTH Neuro: #brain-3d was not found.");
} else {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / Math.max(container.clientHeight, 1),
    0.01,
    1000
  );

  camera.position.set(0, 0.15, 2.6);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  container.appendChild(renderer.domElement);

  // Lighting
  scene.add(
    new THREE.HemisphereLight(0xffffff, 0x223044, 2.2)
  );

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x9bbcff, 1.2);
  fillLight.position.set(-4, 1, 2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1);
  rimLight.position.set(0, -2, -5);
  scene.add(rimLight);

  const brainRoot = new THREE.Group();
  scene.add(brainRoot);

  // Mouse controls
  const controls = new OrbitControls(
    camera,
    renderer.domElement
  );

  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.minDistance = 0.35;
  controls.maxDistance = 8;

  controls.target.set(0, 0, 0);

  // Gentle automatic rotation
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.55;

  // Stop automatic rotation when the visitor interacts
  const stopAutoRotate = () => {
    controls.autoRotate = false;
  };

  renderer.domElement.addEventListener(
    "pointerdown",
    stopAutoRotate
  );

  renderer.domElement.addEventListener(
    "wheel",
    stopAutoRotate
  );

  renderer.domElement.addEventListener(
    "touchstart",
    stopAutoRotate
  );

  // Draco decoder
  const dracoLoader = new DRACOLoader();

  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
  );

  // GLB loader
  const loader = new GLTFLoader();

  loader.setDRACOLoader(dracoLoader);

  loader.load(
    "./models/brain.glb",

    (gltf) => {
      const model = gltf.scene;

      // Prepare all anatomical meshes
      model.traverse((object) => {
        if (!object.isMesh) return;

        object.frustumCulled = true;

        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            material.transparent = false;
            material.depthWrite = true;
            material.side = THREE.DoubleSide;

            if ("roughness" in material) {
              material.roughness = 0.72;
            }

            if ("metalness" in material) {
              material.metalness = 0;
            }
          });
        }
      });

      brainRoot.add(model);

      // Find the complete model bounds
      const box = new THREE.Box3().setFromObject(model);

      const center = box.getCenter(
        new THREE.Vector3()
      );

      const size = box.getSize(
        new THREE.Vector3()
      );

      // Center the brain
      model.position.sub(center);

      // Scale it to a good size
      const maxDimension = Math.max(
        size.x,
        size.y,
        size.z
      );

      if (maxDimension > 0) {
        const desiredSize = 1.65;
        const scale = desiredSize / maxDimension;

        model.scale.setScalar(scale);
      }

      // Frame the entire brain
      const framedBox = new THREE.Box3().setFromObject(model);

      const framedSize = framedBox.getSize(
        new THREE.Vector3()
      );

      const framedCenter = framedBox.getCenter(
        new THREE.Vector3()
      );

      controls.target.copy(framedCenter);

      const maxFramed = Math.max(
        framedSize.x,
        framedSize.y,
        framedSize.z
      );

      const distance = Math.max(
        maxFramed * 1.35,
        1.9
      );

      camera.position.set(
        distance * 0.78,
        distance * 0.18,
        distance * 0.78
      );

      camera.lookAt(framedCenter);

      // Slightly turn the brain toward the viewer
      model.rotation.y = -0.12;

      console.log(
        "KTH Neuro: 3D brain loaded successfully."
      );
    },

    undefined,

    (error) => {
      console.error(
        "KTH Neuro: could not load models/brain.glb",
        error
      );
    }
  );

  // Keep the brain correctly sized
  function resize() {
    const width = Math.max(
      container.clientWidth,
      1
    );

    const height = Math.max(
      container.clientHeight,
      1
    );

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      width,
      height,
      false
    );
  }

  const resizeObserver =
    new ResizeObserver(resize);

  resizeObserver.observe(container);

  resize();

  // Animation
  function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(
      scene,
      camera
    );
  }

  animate();
}
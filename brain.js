import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";

const container = document.getElementById("brain-3d");

if (!container) {
  console.error("KTH Neuro: brain container not found.");
} else {

  // --------------------------------------------------
  // Scene
  // --------------------------------------------------

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    38,
    container.clientWidth / Math.max(container.clientHeight, 1),
    0.01,
    200
  );

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(
    container.clientWidth,
    container.clientHeight
  );

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  container.appendChild(renderer.domElement);

  // --------------------------------------------------
  // Lighting
  // --------------------------------------------------

  scene.add(
    new THREE.HemisphereLight(
      0xc6d2ff,
      0x14171f,
      1.2
    )
  );

  const key = new THREE.DirectionalLight(
    0xffffff,
    2.0
  );

  key.position.set(4, 6.5, 7);
  scene.add(key);

  const fill = new THREE.DirectionalLight(
    0xaebfff,
    0.8
  );

  fill.position.set(-6, 1, 3);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(
    0x8ee0ff,
    1.3
  );

  rim.position.set(-3, 3, -8);
  scene.add(rim);

  const rim2 = new THREE.DirectionalLight(
    0xff9bb6,
    0.45
  );

  rim2.position.set(5, -2, -6);
  scene.add(rim2);

  // --------------------------------------------------
  // Brain root
  // --------------------------------------------------

  const root = new THREE.Group();

  root.rotation.y = -0.25;

  scene.add(root);

  const modelGroup = new THREE.Group();

  root.add(modelGroup);

  // --------------------------------------------------
  // Mouse controls
  // --------------------------------------------------

  const controls = new OrbitControls(
    camera,
    renderer.domElement
  );

  controls.enableDamping = true;
  controls.dampingFactor = 0.075;

  controls.enablePan = true;
  controls.enableZoom = true;

  controls.minDistance = 2.6;
  controls.maxDistance = 16;

  controls.target.set(
    0,
    -0.05,
    0
  );

  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.45;

  // Stop automatic rotation once the visitor interacts.
  function stopAutoRotate() {
    controls.autoRotate = false;
  }

  renderer.domElement.addEventListener(
    "pointerdown",
    stopAutoRotate
  );

  renderer.domElement.addEventListener(
    "wheel",
    stopAutoRotate,
    { passive: true }
  );

  renderer.domElement.addEventListener(
    "touchstart",
    stopAutoRotate,
    { passive: true }
  );

  // --------------------------------------------------
  // Draco
  // --------------------------------------------------

  const dracoLoader = new DRACOLoader();

  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
  );

  const loader = new GLTFLoader();

  loader.setDRACOLoader(dracoLoader);

  // --------------------------------------------------
  // Brain model
  // --------------------------------------------------

  loader.load(
    "./models/brain.glb",

    (gltf) => {

      const brain = gltf.scene;

      modelGroup.add(brain);

      const meshes = [];

      // ------------------------------------------------
      // IMPORTANT:
      // Replace the GLB's original materials.
      // This is what the original Brain Project does.
      // ------------------------------------------------

      brain.traverse((object) => {

        if (!object.isMesh) {
          return;
        }

        meshes.push(object);

        // Read anatomical category if available.
        const category =
          object.userData?.bx_cat || "cortex";

        // KTH Neuro palette
        let color = 0xd9e3f2;

        if (category === "cortex") {
          color = 0xd9e3f2;
        }

        if (category === "white_matter") {
          color = 0xc8d5e5;
        }

        if (category === "deep_grey") {
          color = 0x9c86c9;
        }

        if (category === "diencephalon") {
          color = 0x718bd1;
        }

        if (category === "brainstem") {
          color = 0xd7a34b;
        }

        if (category === "cerebellum") {
          color = 0xd98a70;
        }

        if (category === "ventricles") {
          color = 0x54c8d2;
        }

        if (category === "arteries") {
          color = 0xe75b6b;
        }

        if (category === "veins_sinuses") {
          color = 0x597bd4;
        }

        if (category === "cranial_nerves") {
          color = 0xd3ca4c;
        }

        if (category === "meninges_dura") {
          color = 0xc47ac1;
        }

        if (category === "tracts") {
          color = 0x55bda8;
        }

        // NEW SOLID MATERIAL
        object.material =
          new THREE.MeshStandardMaterial({

            color: color,

            roughness:
              category === "arteries" ||
              category === "veins_sinuses" ||
              category === "cranial_nerves"
                ? 0.5
                : 0.82,

            metalness: 0,

            transparent: true,

            opacity:
              category === "meninges_dura"
                ? 0.34
                : 1,

            depthWrite: true,

            side:
              category === "meninges_dura"
                ? THREE.DoubleSide
                : THREE.FrontSide,

            emissive: color,

            emissiveIntensity:
              category === "deep_grey" ||
              category === "diencephalon"
                ? 0.18
                : 0.04
          });

        object.castShadow = false;
        object.receiveShadow = false;
      });

      // ------------------------------------------------
      // Find the core brain
      // ------------------------------------------------

      const coreBox =
        new THREE.Box3();

      let hasCore = false;

      for (const mesh of meshes) {

        const core =
          mesh.userData?.bx_core;

        if (core === 1 || core === true) {

          coreBox.expandByObject(mesh);

          hasCore = true;
        }
      }

      if (!hasCore) {
        coreBox.setFromObject(brain);
      }

      // ------------------------------------------------
      // Center the brain
      // ------------------------------------------------

      const center =
        coreBox.getCenter(
          new THREE.Vector3()
        );

      brain.position.sub(center);

      // ------------------------------------------------
      // Scale the brain
      // ------------------------------------------------

      const sphere =
        coreBox.getBoundingSphere(
          new THREE.Sphere()
        );

      const radius =
        sphere.radius || 1;

      modelGroup.scale.setScalar(
        1.7 / radius
      );

      // ------------------------------------------------
      // Anatomical orientation
      // ------------------------------------------------

      brain.rotation.y = Math.PI;

      // ------------------------------------------------
      // Camera
      // ------------------------------------------------

      camera.position.set(
        0,
        -0.05,
        7.6
      );

      controls.target.set(
        0,
        -0.05,
        0
      );

      camera.lookAt(
        controls.target
      );

      console.log(
        "KTH Neuro: anatomical brain loaded."
      );
    },

    undefined,

    (error) => {

      console.error(
        "KTH Neuro: brain.glb failed to load.",
        error
      );

    }
  );

  // --------------------------------------------------
  // Resize
  // --------------------------------------------------

  function resize() {

    const width =
      Math.max(
        container.clientWidth,
        1
      );

    const height =
      Math.max(
        container.clientHeight,
        1
      );

    camera.aspect =
      width / height;

    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
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

  // --------------------------------------------------
  // Animation
  // --------------------------------------------------

  function animate() {

    requestAnimationFrame(
      animate
    );

    controls.update();

    renderer.render(
      scene,
      camera
    );
  }

  animate();
}
// KTH Neuro — original Brain Project renderer
// Uses the real anatomical brain.glb and the original Brain Project scene.

const container = document.getElementById("brain-3d");

if (!container) {
  console.error("KTH Neuro: #brain-3d not found.");
} else {

  // Brain Project's actual colour palette
  window.BRAIN = {
    palette: {
      cortex: "#E7DEC9",
      white_matter: "#D7DDE8",
      deep_grey: "#B57BE0",
      diencephalon: "#7E8CF2",
      brainstem: "#E8B24A",
      cerebellum: "#F0894E",
      ventricles: "#3FC8D6",
      arteries: "#F05068",
      veins_sinuses: "#5078E8",
      cranial_nerves: "#D9D24A",
      meninges_dura: "#CC63CC",
      tracts: "#5FB6C9"
    }
  };

  // Make a canvas for the original renderer.
  const canvas = document.createElement("canvas");

  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.cursor = "grab";

  container.innerHTML = "";
  container.appendChild(canvas);

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = src;

      script.onload = resolve;
      script.onerror = () => reject(
        new Error("Could not load " + src)
      );

      document.head.appendChild(script);
    });
  }

  async function startBrain() {

    try {

      // The original Brain Project uses Three.js r137.
      await loadScript(
        "https://unpkg.com/three@0.137.0/build/three.min.js"
      );

      await loadScript(
        "https://unpkg.com/three@0.137.0/examples/js/loaders/GLTFLoader.js"
      );

      await loadScript(
        "https://unpkg.com/three@0.137.0/examples/js/loaders/DRACOLoader.js"
      );

      // Load the original Brain Project scene implementation.
      await loadScript(
        "https://raw.githubusercontent.com/itayinbarr/brainproject/main/brain-atlas/scene.js"
      );

      if (!window.BrainScene) {
        throw new Error(
          "Brain Project renderer did not load."
        );
      }

      window.kthNeuroBrain =
        window.BrainScene.create(
          canvas,
          {
            url: "./models/brain.glb",

            dracoPath:
              "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",

            autorotate: true,

            exposure: 0.95
          }
        );

      console.log(
        "KTH Neuro: original Brain Project renderer loaded."
      );

    } catch (error) {

      console.error(
        "KTH Neuro: 3D brain failed to initialize.",
        error
      );

    }
  }

  startBrain();
}
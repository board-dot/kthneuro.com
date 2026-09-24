const container = document.getElementById("brain-3d");

if (!container) {
  console.error("KTH Neuro: #brain-3d not found.");
} else {

  const canvas = document.createElement("canvas");

  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";

  container.innerHTML = "";
  container.appendChild(canvas);

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;

      s.onload = resolve;

      s.onerror = () => {
        reject(new Error("Failed to load: " + src));
      };

      document.head.appendChild(s);
    });
  }

  async function start() {

    try {

      // EXACT Three.js version used by Brain Project
      await loadScript(
        "https://unpkg.com/three@0.137.0/build/three.min.js"
      );

      await loadScript(
        "https://unpkg.com/three@0.137.0/examples/js/loaders/GLTFLoader.js"
      );

      await loadScript(
        "https://unpkg.com/three@0.137.0/examples/js/loaders/DRACOLoader.js"
      );

      // Brain Project data / colour definitions
      await loadScript(
        "https://cdn.jsdelivr.net/gh/itayinbarr/brainproject@main/brain-atlas/data.js"
      );

      // IMPORTANT:
      // jsDelivr instead of raw.githubusercontent.com
      // so the browser receives this as JavaScript.
      await loadScript(
        "https://cdn.jsdelivr.net/gh/itayinbarr/brainproject@main/brain-atlas/scene.js"
      );

      if (!window.BrainScene) {
        throw new Error(
          "BrainScene was not created."
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
        "KTH Neuro: real anatomical brain loaded."
      );

    } catch (error) {

      console.error(
        "KTH Neuro brain error:",
        error
      );

    }
  }

  start();
}
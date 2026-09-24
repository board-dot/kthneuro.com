const container = document.getElementById("brain-3d");

if (!container) {
  console.error("KTH Neuro: #brain-3d not found.");
} else {

  // --------------------------------------------------
  // Preload the actual brain model immediately
  // --------------------------------------------------

  const preload = document.createElement("link");

  preload.rel = "preload";
  preload.as = "fetch";
  preload.href = "./models/brain.glb";
  preload.crossOrigin = "anonymous";
  preload.fetchPriority = "high";

  document.head.appendChild(preload);


  // --------------------------------------------------
  // Canvas
  // --------------------------------------------------

  const canvas = document.createElement("canvas");

  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.cursor = "grab";

  container.innerHTML = "";
  container.appendChild(canvas);


  // --------------------------------------------------
  // Load external JavaScript
  // --------------------------------------------------

  function loadScript(src) {

    return new Promise((resolve, reject) => {

      const script = document.createElement("script");

      script.src = src;

      script.onload = resolve;

      script.onerror = () => {
        reject(
          new Error("Failed to load " + src)
        );
      };

      document.head.appendChild(script);
    });
  }


  // --------------------------------------------------
  // KTH Neuro colour palette
  // --------------------------------------------------

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


  // --------------------------------------------------
  // Start
  // --------------------------------------------------

  async function start() {

    try {

      // Three.js MUST load first.
      await loadScript(
        "https://unpkg.com/three@0.137.0/build/three.min.js"
      );


      // These three can load simultaneously.
      await Promise.all([

        loadScript(
          "https://unpkg.com/three@0.137.0/examples/js/loaders/GLTFLoader.js"
        ),

        loadScript(
          "https://unpkg.com/three@0.137.0/examples/js/loaders/DRACOLoader.js"
        ),

        loadScript(
          "https://cdn.jsdelivr.net/gh/itayinbarr/brainproject@main/brain-atlas/scene.js"
        )

      ]);


      if (!window.BrainScene) {

        throw new Error(
          "Brain Project renderer did not load."
        );

      }


      // ------------------------------------------------
      // Create the real anatomical brain
      // ------------------------------------------------

      const brain = window.BrainScene.create(

        canvas,

        {

          url: "./models/brain.glb",

          dracoPath:
            "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",

          autorotate: true,

          exposure: 0.95

        }

      );


      // ------------------------------------------------
      // CLEAN HERO VIEW
      //
      // Keep the actual brain.
      // Remove distracting structures that extend
      // far below the brain.
      // ------------------------------------------------

      brain.setLayers({

        cortex: {
          visible: true,
          opacity: 1
        },

        white_matter: {
          visible: true,
          opacity: 1
        },

        deep_grey: {
          visible: true,
          opacity: 0.9
        },

        diencephalon: {
          visible: true,
          opacity: 0.9
        },

        brainstem: {
          visible: true,
          opacity: 1
        },

        cerebellum: {
          visible: true,
          opacity: 1
        },

        // Hide these for the clean KTH Neuro hero.
        arteries: {
          visible: false
        },

        veins_sinuses: {
          visible: false
        },

        cranial_nerves: {
          visible: false
        },

        tracts: {
          visible: false
        },

        meninges_dura: {
          visible: false
        },

        ventricles: {
          visible: false
        }

      });


      console.log(
        "KTH Neuro: clean anatomical brain loaded."
      );


    } catch (error) {

      console.error(
        "KTH Neuro: brain failed to initialize.",
        error
      );

    }

  }


  start();

}
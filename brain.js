const container = document.getElementById("brain-3d");

if (!container) {
  console.error("KTH Neuro: #brain-3d not found.");
} else {

  // --------------------------------------------------
  // Preload brain model
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
  // Load external scripts
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
  // KTH Neuro palette
  // --------------------------------------------------

  window.BRAIN = {

    palette: {

      cortex: "#DCEAF5",

      white_matter: "#C9D9E8",

      deep_grey: "#9E82D0",

      diencephalon: "#718BDD",

      brainstem: "#E8B24A",

      cerebellum: "#D98D72",

      ventricles: "#55D5DD",

      arteries: "#F05068",

      veins_sinuses: "#5078E8",

      cranial_nerves: "#83E8EA",

      meninges_dura: "#CC63CC",

      tracts: "#63D0D0"

    }

  };


  // --------------------------------------------------
  // Start
  // --------------------------------------------------

  async function start() {

    try {

      // Three.js
      await loadScript(
        "https://unpkg.com/three@0.137.0/build/three.min.js"
      );


      // Load dependencies
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
      // Create the brain
      // ------------------------------------------------

      const brain = window.BrainScene.create(

        canvas,

        {

          url: "./models/brain.glb",

          dracoPath:
            "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",

          autorotate: true,

          exposure: 0.90

        }

      );


      // ------------------------------------------------
      // CORE BRAIN ONLY
      // ------------------------------------------------

      brain.setLayers({

        // ----------------------------------------------
        // Translucent outer cortex
        // ----------------------------------------------

        cortex: {
          visible: true,
          opacity: 0.18
        },


        // ----------------------------------------------
        // Internal white matter
        // ----------------------------------------------

        white_matter: {
          visible: true,
          opacity: 0.25
        },


        // ----------------------------------------------
        // Deep grey matter
        // ----------------------------------------------

        deep_grey: {
          visible: true,
          opacity: 0.62
        },


        // ----------------------------------------------
        // Deep central structures
        // ----------------------------------------------

        diencephalon: {
          visible: true,
          opacity: 0.55
        },


        // ----------------------------------------------
        // Hide brainstem
        // ----------------------------------------------

        brainstem: {
          visible: false
        },


        // ----------------------------------------------
        // Cerebellum
        // ----------------------------------------------

        cerebellum: {
          visible: true,
          opacity: 0.20
        },


        // ----------------------------------------------
        // Internal neural pathways
        // ----------------------------------------------

        tracts: {
          visible: true,
          opacity: 0.70
        },


        // ----------------------------------------------
        // NO CRANIAL NERVES
        // ----------------------------------------------

        cranial_nerves: {
          visible: false
        },


        // ----------------------------------------------
        // NO ARTERIES
        // ----------------------------------------------

        arteries: {
          visible: false
        },


        // ----------------------------------------------
        // NO VEINS
        // ----------------------------------------------

        veins_sinuses: {
          visible: false
        },


        // ----------------------------------------------
        // No outer membrane
        // ----------------------------------------------

        meninges_dura: {
          visible: false
        },


        // ----------------------------------------------
        // Subtle internal ventricles
        // ----------------------------------------------

        ventricles: {
          visible: true,
          opacity: 0.30
        }

      });


      console.log(
        "KTH Neuro: core brain only loaded."
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
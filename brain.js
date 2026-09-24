const container = document.getElementById("brain-3d");

if (!container) {
  console.error("KTH Neuro: #brain-3d not found.");
} else {

  // --------------------------------------------------
  // Preload the brain model
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

      cortex: "#DDE9F5",

      white_matter: "#C9D8E8",

      deep_grey: "#A88BD4",

      diencephalon: "#718DE0",

      brainstem: "#E8B24A",

      cerebellum: "#D98C72",

      ventricles: "#55D5DD",

      arteries: "#F05068",

      veins_sinuses: "#5078E8",

      // Cyan instead of yellow
      cranial_nerves: "#8FE7E7",

      meninges_dura: "#CC63CC",

      tracts: "#62C7C7"
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


      // Load the remaining dependencies together
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
      // Create the anatomical brain
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
      // KTH NEURO HERO APPEARANCE
      // ------------------------------------------------
      //
      // Transparent cortex
      // Neural structures visible
      // Blood vessels hidden
      // Yellow brainstem hidden
      // ------------------------------------------------

      brain.setLayers({

        // Main cortex:
        // transparent enough to see inside
        cortex: {
          visible: true,
          opacity: 0.24
        },


        // White matter:
        // subtle internal layer
        white_matter: {
          visible: true,
          opacity: 0.30
        },


        // Deep grey matter:
        // visible through cortex
        deep_grey: {
          visible: true,
          opacity: 0.70
        },


        // Deep central structures
        diencephalon: {
          visible: true,
          opacity: 0.60
        },


        // Hide the large yellow brainstem
        brainstem: {
          visible: false
        },


        // Keep cerebellum subtle
        cerebellum: {
          visible: true,
          opacity: 0.25
        },


        // ------------------------------------------------
        // NEURAL STRUCTURES
        // ------------------------------------------------

        cranial_nerves: {
          visible: true,
          opacity: 0.95
        },


        // Internal white-matter pathways
        tracts: {
          visible: true,
          opacity: 0.60
        },


        // ------------------------------------------------
        // HIDE BLOOD VESSELS
        // ------------------------------------------------

        arteries: {
          visible: false
        },


        veins_sinuses: {
          visible: false
        },


        // ------------------------------------------------
        // OTHER STRUCTURES
        // ------------------------------------------------

        // Hide outer membrane
        meninges_dura: {
          visible: false
        },


        // Keep ventricles faint
        ventricles: {
          visible: true,
          opacity: 0.35
        }

      });


      console.log(
        "KTH Neuro: transparent neural brain loaded."
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
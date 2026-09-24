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

      // Cyan neural appearance
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
      // Create brain
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
      // KTH NEURO HERO
      // ------------------------------------------------

      brain.setLayers({

        // ----------------------------------------------
        // OUTER CORTEX
        // ----------------------------------------------

        cortex: {
          visible: true,
          opacity: 0.16
        },


        // ----------------------------------------------
        // WHITE MATTER
        // ----------------------------------------------

        white_matter: {
          visible: true,
          opacity: 0.22
        },


        // ----------------------------------------------
        // INTERNAL GREY MATTER
        // ----------------------------------------------

        deep_grey: {
          visible: true,
          opacity: 0.58
        },


        diencephalon: {
          visible: true,
          opacity: 0.50
        },


        // ----------------------------------------------
        // REMOVE LARGE YELLOW STRUCTURE
        // ----------------------------------------------

        brainstem: {
          visible: false
        },


        // ----------------------------------------------
        // CEREBELLUM
        // ----------------------------------------------

        cerebellum: {
          visible: true,
          opacity: 0.18
        },


        // ----------------------------------------------
        // INTERNAL NEURAL PATHWAYS
        // ----------------------------------------------

        tracts: {
          visible: true,
          opacity: 0.72
        },


        // ----------------------------------------------
        // CRANIAL NERVES
        //
        // Keep them, but much less dominant.
        // ----------------------------------------------

        cranial_nerves: {
          visible: true,
          opacity: 0.38
        },


        // ----------------------------------------------
        // HIDE BLOOD VESSELS
        // ----------------------------------------------

        arteries: {
          visible: false
        },


        veins_sinuses: {
          visible: false
        },


        // ----------------------------------------------
        // HIDE OUTER MEMBRANE
        // ----------------------------------------------

        meninges_dura: {
          visible: false
        },


        // ----------------------------------------------
        // VERY SUBTLE VENTRICLES
        // ----------------------------------------------

        ventricles: {
          visible: true,
          opacity: 0.28
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
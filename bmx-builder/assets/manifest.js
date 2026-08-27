/* ==========================================================================
   ASSET MANIFEST
   ==========================================================================
   Two ways to get a part image into the builder:

   A) FASTEST — load it in the browser (no files to place):
      In the builder, use the "📁 Load Assets" button (top bar) to pick your
      images at once, or the "Load" button next to any part dropdown. The image
      is used immediately and is saved inside the exported builder-config.json.

   B) Bundle it in the repo:
      Drop the image into the matching assets/<category>/ folder and register
      its filename in the array below, then reload.

   Nothing is bundled by default -- load your own authorized images.
   ========================================================================== */
window.ASSET_MANIFEST = {
  "frames":       [],
  "forks":        [],
  "bars":         [],
  "stems":        [],
  "grips":        [],
  "headsets":     [],
  "seatposts":    [],
  "seats":        [],
  "cranks":       [],
  "sprockets":    [],
  "chains":       [],
  "front-wheels": [],
  "rear-wheels":  [],
  "front-tires":  [],
  "rear-tires":   [],
  "pedals":       [],
  "front-pegs":   [],
  "rear-pegs":    []
};

/* ==========================================================================
   ASSET MANIFEST
   ==========================================================================
   Browsers cannot list a folder's contents over file://, so every image that
   lives under /assets/<category>/ must be registered here.

   HOW TO ADD A NEW BMX PART
   -------------------------
   1. Drop the side-view image into the matching folder, e.g.
        assets/frames/frame-sunday-black.webp
   2. Add its filename to the array below under the same folder key.
   3. Reload index.html -> it appears in the dropdown and in Random Build.
   4. Calibrate it once in Calibration Mode, then Export the config.

   The rendering engine never hardcodes any of this -- it only reads paths.
   ========================================================================== */
window.ASSET_MANIFEST = {
  "frames":       ["frames-black.svg", "frames-chrome.svg", "frames-red.svg"],
  "forks":        ["forks-black.svg", "forks-chrome.svg"],
  "bars":         ["bars-black.svg", "bars-chrome.svg", "bars-blue.svg"],
  "stems":        ["stems-black.svg", "stems-red.svg"],
  "grips":        ["grips-black.svg", "grips-gum.svg"],
  "headsets":     ["headsets-black.svg", "headsets-chrome.svg"],
  "seatposts":    ["seatposts-black.svg", "seatposts-chrome.svg"],
  "seats":        ["seats-black.svg", "seats-red.svg", "seats-white.svg"],
  "cranks":       ["cranks-black.svg", "cranks-chrome.svg"],
  "sprockets":    ["sprockets-black.svg", "sprockets-red.svg"],
  "chains":       ["chains-black.svg", "chains-chrome.svg"],
  "front-wheels": ["front-wheels-black.svg", "front-wheels-chrome.svg"],
  "rear-wheels":  ["rear-wheels-black.svg", "rear-wheels-chrome.svg"],
  "front-tires":  ["front-tires-black.svg", "front-tires-gum.svg"],
  "rear-tires":   ["rear-tires-black.svg", "rear-tires-gum.svg"],
  "pedals":       ["pedals-black.svg", "pedals-red.svg"],
  "front-pegs":   ["front-pegs-black.svg", "front-pegs-chrome.svg"],
  "rear-pegs":    ["rear-pegs-black.svg", "rear-pegs-chrome.svg"]
};

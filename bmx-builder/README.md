# BMX Builder · Asset Calibration Studio (PoC v0.1)

An internal development tool that proves you can assemble a BMX bike by
**layering ordinary side-view product images** and calibrating each layer's
position once. The calibration data (JSON) is what will later power a
customer-facing BMX configurator.

> This is a proof of concept, **not** ecommerce and **not** production. It is
> optimized for simplicity, readability, debugging and fast iteration.

## Run it

Just open `index.html` in any modern browser. No install, no npm, no build,
no dependencies. Everything (HTML + CSS + vanilla JS) lives in that one file.

## What it does

- **Image-layering engine** — every component is one absolutely-positioned
  `<img>`. The renderer only swaps image paths and applies calibration
  transforms; it never hardcodes a position.
- **Asset switching** — one dropdown per category swaps that layer instantly.
- **Calibration Mode** (press `C`) — click any part on the bike to select it,
  like layers in Photoshop/Figma. Selected layer shows a blue bounding box,
  center point, glow and live coordinates.
- **Isolation Mode** — double-click a part (all others fade to 20%). `Esc` exits.
- **Controls** — move / scale / rotate / bring-forward / send-backward /
  opacity / visibility / flip H / flip V. All update live.
- **Keyboard** — arrows move, `Shift`+arrows move faster, `+`/`-` scale, `R`
  rotate, `Delete` hide, `Esc` exit isolation, `C` calibration, `D` debug.
- **Snapping** — position 1/5/10 px, rotation 1°/5°/15°.
- **Visual guides** — center lines, ground line, BB / head-tube / seat-tube /
  front-axle / rear-axle markers, wheelbase line, safe area.
- **Reference image mode** — load a real BMX photo behind the build and fade
  the layers to match it.
- **Image inspector** — filename, resolution, scale, rotation, x, y, z,
  opacity, visibility for the selected layer.
- **Debug mode** (press `D`) — borders, bounding boxes, layer names,
  coordinates, center points and render order.
- **Export / Import** — save all calibration as `builder-config.json` (shown in
  a textarea and downloadable); import re-applies every value instantly.
- **Smoke Test** — arranges whatever images are loaded into the default bike
  geometry (verifies order, rendering, calibration, performance).
- **Random Build** — one random image per category (needs images registered in
  `manifest.js`).
- **Reset** — every layer, calibration and transform back to defaults.

## Loading your images

No images are bundled. Use your own side-view product photos (white background
is fine — they layer with a `multiply` blend so the white drops out; toggle
**Blend: Normal** to see the raw boxes).

Two ways:

- **📁 Load Assets** (top bar) — pick several images at once. Each is
  auto-assigned to a layer by a keyword in its filename (`frame`, `fork`,
  `crank`, `sprocket`, `wheel`, `tire`, `bar`, `seat`, `stem`, `chain`,
  `pedal`, `peg`, `grip`, `headset`, `post`).
- **Load** button next to any part dropdown — load one image into that layer.

Loaded images are embedded into the exported `builder-config.json`, so a build
is fully self-contained: export it, import it later, everything comes back.

## Folder structure

```
index.html
assets/
  manifest.js          <- optional registry, for images you bundle in the repo
  frames/  forks/  bars/  stems/  grips/  headsets/  seatposts/  seats/
  cranks/  sprockets/  chains/  front-wheels/  rear-wheels/
  front-tires/  rear-tires/  pedals/  front-pegs/  rear-pegs/
```

## Adding a bundled BMX product (optional)

1. Drop the side-view image into the correct `assets/<category>/` folder.
2. Register its filename in `assets/manifest.js` (browsers can't list folders
   over `file://`, so this one-line registry is how the engine discovers it).
3. Reload — it appears in the dropdown and in Random Build.
4. Enter Calibration Mode, select it, calibrate its position once.
5. Export the JSON. That asset is now reusable in any future build.

## Performance

The engine is path + JSON driven, so it supports 1000+ images without changing
the rendering code — only the manifest and calibration data grow. A small FPS
readout in the toolbar is there as a sanity check.

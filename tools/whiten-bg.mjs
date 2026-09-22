#!/usr/bin/env node
/* =========================================================================
   STIKE BIKE SHOP: normalizador de fondo blanco para fotos de producto

     node tools/whiten-bg.mjs <foto1.jpg> [foto2.jpg ...]
     node tools/whiten-bg.mjs assets/img/products/buzo-*.jpg
     node tools/whiten-bg.mjs --target=252 foto.jpg   (blanco mas/menos fuerte)
     node tools/whiten-bg.mjs --preview foto.jpg      (escribe foto.preview.jpg,
                                                        no pisa el original)

   Por que existe: el resto del catalogo son fotos de estudio con fondo
   blanco puro (assets/css/styles.css lo asume: las tarjetas y la ficha de
   producto pintan la plaqueta de blanco para que la foto "desaparezca"
   dentro del tile). Una foto de celular sobre papel -- como las de ropa --
   trae el papel gris/rosado, viñeteado (mas oscuro y a veces mas calido de
   color hacia las esquinas o detras de la prenda) y pliegues visibles, asi
   que se ve una "caja" en vez de fundirse.

   Como corrige: la prenda casi siempre llena el cuadro (flat-lay), asi que
   NO se puede adivinar el fondo mirando toda la foto -- cualquier brillo
   del cierre, una etiqueta blanca o un estampado se confunde con "fondo" y
   deja costuras o manchas de color falsas. En cambio, se mide el color
   real SOLO en el marco exterior de la foto (los ultimos 4-6% del borde),
   que es fondo garantizado, y se ajusta ahi una superficie suave (una
   cuadratica en x/y, por canal de color) que estima como varia la luz del
   papel de esquina a esquina. Esa superficie se usa para calcular, pixel a
   pixel, cuanto aclarar y neutralizar cada canal para que el fondo quede
   parejo y blanco -- sin tocar el contraste propio de la prenda, porque el
   ajuste nunca se calibro mirando la prenda.

   No recorta ni elimina el fondo (no es un "cutout" con IA): sube el tono
   del papel a blanco. Para prendas sobre fondos ya blancos el efecto es
   minimo (las ganancias quedan cerca de 1x).
   ========================================================================= */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
let targetWhite = 250;
let preview = false;
const files = [];
for (const a of args) {
  if (a.startsWith("--target=")) targetWhite = Number(a.slice("--target=".length));
  else if (a === "--preview") preview = true;
  else files.push(a);
}
if (!files.length) {
  console.log("Uso: node tools/whiten-bg.mjs <foto1.jpg> [foto2.jpg ...]");
  console.log("     node tools/whiten-bg.mjs --preview assets/img/products/buzo-x-1.jpg");
  process.exit(1);
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* Resuelve A x = b por eliminacion gaussiana con pivoteo parcial.
   A es n x n, b es n x 1 (arrays planos, mutados in place). */
function solveLinearSystem(A, b, n) {
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
    [A[col], A[pivot]] = [A[pivot], A[col]];
    [b[col], b[pivot]] = [b[pivot], b[col]];
    const div = A[col][col] || 1e-9;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = A[r][col] / div;
      if (!factor) continue;
      for (let c = col; c < n; c++) A[r][c] -= factor * A[col][c];
      b[r] -= factor * b[col];
    }
  }
  return b.map((v, i) => v / (A[i][i] || 1e-9));
}

/* Ajusta z(u,v) ~ a + b*u + c*v + d*u*v + e*u^2 + f*v^2 por minimos
   cuadrados a partir de puntos (u,v,z) del marco exterior. Devuelve los 6
   coeficientes. */
function fitQuadratic(points, zIndex) {
  const N = 6;
  const AtA = Array.from({ length: N }, () => new Array(N).fill(0));
  const Atb = new Array(N).fill(0);
  const basis = new Array(N);
  for (const p of points) {
    const u = p[0], v = p[1], z = p[zIndex];
    basis[0] = 1; basis[1] = u; basis[2] = v; basis[3] = u * v; basis[4] = u * u; basis[5] = v * v;
    for (let i = 0; i < N; i++) {
      Atb[i] += basis[i] * z;
      for (let j = 0; j < N; j++) AtA[i][j] += basis[i] * basis[j];
    }
  }
  return solveLinearSystem(AtA, Atb, N);
}
const evalQuadratic = (c, u, v) => c[0] + c[1] * u + c[2] * v + c[3] * u * v + c[4] * u * u + c[5] * v * v;

async function whitenOne(file) {
  const abs = path.isAbsolute(file) ? file : path.join(ROOT, file);
  const img = sharp(abs).rotate(); // aplica orientacion EXIF antes de leer crudo
  const { data, info } = await img.removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;

  /* ---- 1. Recolectar puntos del marco exterior (fondo garantizado) ---- */
  const marginX = Math.max(3, Math.round(w * 0.045));
  const marginY = Math.max(3, Math.round(h * 0.045));
  const points = []; // [u, v, R, G, B]
  const addPoint = (x, y) => {
    const idx = (y * w + x) * ch;
    points.push([x / w, y / h, data[idx], data[idx + 1], data[idx + 2]]);
  };
  const stepX = Math.max(1, Math.round(w / 60));
  const stepY = Math.max(1, Math.round(h / 60));
  for (let x = 0; x < w; x += stepX) {
    for (let y = 0; y < marginY; y += 2) addPoint(x, y);
    for (let y = h - marginY; y < h; y += 2) addPoint(x, y);
  }
  for (let y = 0; y < h; y += stepY) {
    for (let x = 0; x < marginX; x += 2) addPoint(x, y);
    for (let x = w - marginX; x < w; x += 2) addPoint(x, y);
  }

  /* ---- 2. Ajustar una superficie suave por canal a esos puntos ---- */
  const coefR = fitQuadratic(points, 2);
  const coefG = fitQuadratic(points, 3);
  const coefB = fitQuadratic(points, 4);

  /* Rango observado en el marco, para no dejar que la cuadratica
     extrapole de mas en las esquinas (puede pasar con pocos puntos). */
  const rangeOf = (idx) => {
    let lo = 255, hi = 0;
    for (const p of points) { if (p[idx] < lo) lo = p[idx]; if (p[idx] > hi) hi = p[idx]; }
    return [lo, hi];
  };
  const [rLo, rHi] = rangeOf(2), [gLo, gHi] = rangeOf(3), [bLo, bHi] = rangeOf(4);
  const pad = 12;

  /* ---- 3. Aplicar correccion pixel a pixel: aclara y neutraliza cada  ---
     canal segun lo que la superficie predice ahi, sin importar que haya
     debajo (prenda o papel). */
  for (let y = 0; y < h; y++) {
    const v = y / h;
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const idx = (y * w + x) * ch;
      const predR = clamp(evalQuadratic(coefR, u, v), rLo - pad, rHi + pad);
      const predG = clamp(evalQuadratic(coefG, u, v), gLo - pad, gHi + pad);
      const predB = clamp(evalQuadratic(coefB, u, v), bLo - pad, bHi + pad);
      const gR = clamp(targetWhite / Math.max(1, predR), 0.85, 1.6);
      const gG = clamp(targetWhite / Math.max(1, predG), 0.85, 1.6);
      const gB = clamp(targetWhite / Math.max(1, predB), 0.85, 1.6);
      data[idx] = Math.min(255, data[idx] * gR);
      data[idx + 1] = Math.min(255, data[idx + 1] * gG);
      data[idx + 2] = Math.min(255, data[idx + 2] * gB);
    }
  }

  const outPath = preview ? abs.replace(/(\.\w+)$/, ".preview$1") : abs;
  await sharp(data, { raw: { width: w, height: h, channels: ch } })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(outPath + ".tmp");
  await fs.rename(outPath + ".tmp", outPath);

  const beforeAvg = points.reduce((s, p) => s + (p[2] + p[3] + p[4]) / 3, 0) / points.length;
  console.log(
    `${path.relative(ROOT, abs)}  marco ${beforeAvg.toFixed(0)} -> ~${targetWhite} ${preview ? "(preview, no piso el original)" : ""}`
  );
}

for (const f of files) {
  try {
    await whitenOne(f);
  } catch (err) {
    console.error(`ERROR en ${f}: ${err.message}`);
  }
}

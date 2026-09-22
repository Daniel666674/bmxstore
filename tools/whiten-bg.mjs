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
   trae el papel gris/rosado, viñeteado, con pliegues y, a veces, el doblez
   del papel de fondo como una sombra dura -- asi que se ve una "caja" en
   vez de fundirse, y de foto a foto el tono de blanco no es el mismo.

   COMO CORRIGE (version 2 -- v1 solo aclaraba el fondo tal cual estaba,
   conservando su textura; no alcanzaba para un doblez de papel duro ni
   para que dos fotos quedaran exactamente iguales de tono):

   1. Ajuste ROBUSTO del fondo: la prenda casi siempre llena el cuadro
      (flat-lay), asi que el fondo real solo se puede medir en el marco
      exterior de la foto (el 4.5% del borde) -- y ese marco puede venir
      CONTAMINADO con pixeles de la prenda (un puño que toca el borde, una
      foto donde casi no queda fondo visible). Se ajusta una superficie
      suave por canal de color (R/G/B, cuadratica en x/y) a esos puntos, se
      descartan los que NO encajan con el consenso que emerge -- son
      prenda, no fondo -- y se reajusta 2 veces mas solo con los que
      sobreviven. Si ni asi el marco resulta creible (parece tela, no
      papel), la foto se deja INTACTA: mejor no tocarla que arruinarla.
   2. Clasificacion + morfologia: para cada pixel se mide que tan lejos
      esta de lo que esa superficie predice que deberia ser el fondo AHI
      (no del promedio de toda la foto -- eso confundiria una prenda clara
      con fondo). Lejos = prenda; cerca = fondo. Un doblez de papel da un
      residual ALTO (es una sombra dura), igual que la prenda, asi que el
      residual solo no alcanza para distinguirlos -- lo que los distingue
      es la FORMA: el doblez es una linea delgada, la prenda es un bloque
      solido. Se aplica cierre morfologico (rellena huecos chicos DENTRO de
      la prenda -- bordado claro, textura jaspeada) y despues apertura
      (borra lineas delgadas FUERA de la prenda -- el doblez), con un
      difuminado final para que el borde no quede dentado.
   3. Aplanado: los pixeles clasificados como fondo se funden a un blanco
      EXACTO e IDENTICO (mismo valor en todas las fotos, no solo "cerca" de
      blanco cada una a su manera); los de la prenda reciben la misma
      correccion de color suave de siempre (blanco de fondo corregido segun
      la superficie), sin aplanarse.

   No es un "cutout" con IA (no hay segmentacion real ni recorte del
   fondo): es una clasificacion pixel a pixel basada en que tan bien
   encaja cada uno con un modelo suave del papel de fondo.
   ========================================================================= */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const args = process.argv.slice(2);
let targetWhite = 253;
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

/* --------------------------- Superficie R/G/B --------------------------- */
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

/* ------------------- Filtro min/max separable (morfologia) -------------- */
function slideFilter(arr, n, radius, isMin) {
  const out = new Float32Array(n);
  const deque = new Int32Array(n);
  let head = 0, tail = 0;
  for (let i = 0; i < n; i++) {
    const v = arr[i];
    while (tail > head && (isMin ? arr[deque[tail - 1]] >= v : arr[deque[tail - 1]] <= v)) tail--;
    deque[tail++] = i;
    if (deque[head] <= i - (2 * radius + 1)) head++;
    if (i >= radius) out[i - radius] = arr[deque[head]];
  }
  for (let i = n; i < n + radius; i++) {
    while (tail > head && deque[head] <= i - (2 * radius + 1)) head++;
    if (i - radius < n) out[i - radius] = arr[deque[head]];
  }
  return out;
}
function erodeDilate2D(mask, w, h, radius, isMin) {
  const rowPass = new Float32Array(w * h);
  const rowBuf = new Float32Array(w);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) rowBuf[x] = mask[y * w + x];
    const filtered = slideFilter(rowBuf, w, radius, isMin);
    for (let x = 0; x < w; x++) rowPass[y * w + x] = filtered[x];
  }
  const out = new Float32Array(w * h);
  const colBuf = new Float32Array(h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) colBuf[y] = rowPass[y * w + x];
    const filtered = slideFilter(colBuf, h, radius, isMin);
    for (let y = 0; y < h; y++) out[y * w + x] = filtered[y];
  }
  return out;
}
const opening = (mask, w, h, r) => erodeDilate2D(erodeDilate2D(mask, w, h, r, true), w, h, r, false);
const closing = (mask, w, h, r) => erodeDilate2D(erodeDilate2D(mask, w, h, r, false), w, h, r, true);
function boxBlur(mask, w, h, radius) {
  const tmp = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = -radius; x <= radius; x++) sum += mask[y * w + clamp(x, 0, w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = sum / (2 * radius + 1);
      sum += mask[y * w + clamp(x + radius + 1, 0, w - 1)] - mask[y * w + clamp(x - radius, 0, w - 1)];
    }
  }
  const out = new Float32Array(w * h);
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) sum += tmp[clamp(y, 0, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / (2 * radius + 1);
      sum += tmp[clamp(y + radius + 1, 0, h - 1) * w + x] - tmp[clamp(y - radius, 0, h - 1) * w + x];
    }
  }
  return out;
}

/* ------------------------------ Nucleo -------------------------------- */
async function whitenOne(file) {
  const abs = path.isAbsolute(file) ? file : path.join(ROOT, file);
  const img = sharp(abs).rotate();
  const { data, info } = await img.removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;

  /* 1. Puntos candidatos del marco exterior (4.5% del borde). */
  const marginX = Math.max(3, Math.round(w * 0.045));
  const marginY = Math.max(3, Math.round(h * 0.045));
  const points = [];
  const addPoint = (x, y) => {
    const idx = (y * w + x) * ch;
    points.push([x / w, y / h, data[idx], data[idx + 1], data[idx + 2]]);
  };
  const stepX = Math.max(1, Math.round(w / 60)), stepY = Math.max(1, Math.round(h / 60));
  for (let x = 0; x < w; x += stepX) {
    for (let y = 0; y < marginY; y += 2) addPoint(x, y);
    for (let y = h - marginY; y < h; y += 2) addPoint(x, y);
  }
  for (let y = 0; y < h; y += stepY) {
    for (let x = 0; x < marginX; x += 2) addPoint(x, y);
    for (let x = w - marginX; x < w; x += 2) addPoint(x, y);
  }

  /* 2. Ajuste robusto: 3 vueltas, descartando el 40% que peor encaja en
     cada una (son prenda que llego hasta el marco, no fondo). */
  let survivors = points;
  let coefR, coefG, coefB;
  for (let iter = 0; iter < 3; iter++) {
    coefR = fitQuadratic(survivors, 2); coefG = fitQuadratic(survivors, 3); coefB = fitQuadratic(survivors, 4);
    if (iter === 2) break;
    const withResidual = points.map(p => {
      const pr = evalQuadratic(coefR, p[0], p[1]), pg = evalQuadratic(coefG, p[0], p[1]), pb = evalQuadratic(coefB, p[0], p[1]);
      return [p, Math.max(Math.abs(p[2] - pr), Math.abs(p[3] - pg), Math.abs(p[4] - pb))];
    });
    withResidual.sort((a, b) => a[1] - b[1]);
    const keepCount = Math.max(30, Math.round(withResidual.length * 0.6));
    survivors = withResidual.slice(0, keepCount).map(([p]) => p);
  }
  const rangeOf = idx => { let lo = 255, hi = 0; for (const p of survivors) { if (p[idx] < lo) lo = p[idx]; if (p[idx] > hi) hi = p[idx]; } return [lo, hi]; };
  const [rLo, rHi] = rangeOf(2), [gLo, gHi] = rangeOf(3), [bLo, bHi] = rangeOf(4);
  /* Para decidir si el fondo es CONFIABLE se usa un rango por percentiles
     (10-90), no el minimo/maximo real: un solo punto rezagado que el
     ajuste robusto no alcanzo a descartar (p.ej. una sombra puntual)
     dispara el minimo/maximo pero no representa al grueso del marco. */
  const percentileRangeOf = idx => {
    const vals = survivors.map(p => p[idx]).sort((a, b) => a - b);
    const lo = vals[Math.floor(vals.length * 0.1)], hi = vals[Math.ceil(vals.length * 0.9) - 1];
    return [lo, hi];
  };
  const [rLoP, rHiP] = percentileRangeOf(2), [gLoP, gHiP] = percentileRangeOf(3), [bLoP, bHiP] = percentileRangeOf(4);
  const spread = Math.max(rHiP - rLoP, gHiP - gLoP, bHiP - bLoP);

  /* Ni con outliers afuera el marco resulta creible (parece tela, no
     papel parejo): no hay fondo confiable, se deja la foto intacta. */
  if (!(spread < 70 && (rLoP + gLoP + bLoP) / 3 > 120)) {
    console.log(`${path.relative(ROOT, abs)}  SIN FONDO CONFIABLE -- se deja intacta (revisala a mano)`);
    return;
  }

  const pad = 12;
  const predAt = (x, y) => {
    const u = x / w, v = y / h;
    return [
      clamp(evalQuadratic(coefR, u, v), rLo - pad, rHi + pad),
      clamp(evalQuadratic(coefG, u, v), gLo - pad, gHi + pad),
      clamp(evalQuadratic(coefB, u, v), bLo - pad, bHi + pad),
    ];
  };

  /* 3. Clasificar cada pixel por que tan lejos esta de lo que la
     superficie predice ahi (fgThreshold), y limpiar la mascara con
     cierre+apertura (ver cabecera del archivo). */
  const fgThreshold = 22, morphRadius = 2, featherRadius = 3;
  const fgMask = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * ch;
      const [predR, predG, predB] = predAt(x, y);
      const residual = Math.max(Math.abs(data[idx] - predR), Math.abs(data[idx + 1] - predG), Math.abs(data[idx + 2] - predB));
      fgMask[y * w + x] = residual > fgThreshold ? 1 : 0;
    }
  }
  const closedMask = closing(fgMask, w, h, morphRadius);
  const openedMask = opening(closedMask, w, h, morphRadius);
  const softMask = boxBlur(openedMask, w, h, featherRadius);

  /* 4. Componer: fondo -> blanco exacto; prenda -> correccion de color
     suave (ganancia por canal segun la superficie), sin aplanar. */
  const out = Buffer.from(data);
  let flattenedCount = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * ch;
      const [predR, predG, predB] = predAt(x, y);
      const gR = clamp(targetWhite / Math.max(1, predR), 0.85, 1.6);
      const gG = clamp(targetWhite / Math.max(1, predG), 0.85, 1.6);
      const gB = clamp(targetWhite / Math.max(1, predB), 0.85, 1.6);
      const corrR = Math.min(255, data[idx] * gR), corrG = Math.min(255, data[idx + 1] * gG), corrB = Math.min(255, data[idx + 2] * gB);
      const fgScore = clamp(softMask[y * w + x], 0, 1);
      const bgScore = 1 - fgScore;
      if (bgScore > 0.98) flattenedCount++;
      out[idx] = corrR * fgScore + targetWhite * bgScore;
      out[idx + 1] = corrG * fgScore + targetWhite * bgScore;
      out[idx + 2] = corrB * fgScore + targetWhite * bgScore;
    }
  }

  const outPath = preview ? abs.replace(/(\.\w+)$/, ".preview$1") : abs;
  await sharp(out, { raw: { width: w, height: h, channels: ch } })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(outPath + ".tmp");
  await fs.rename(outPath + ".tmp", outPath);

  console.log(
    `${path.relative(ROOT, abs)}  fondo aplanado a blanco ${targetWhite} (${(100 * flattenedCount / (w * h)).toFixed(0)}% de la foto) ${preview ? "(preview, no piso el original)" : ""}`
  );
}

for (const f of files) {
  try {
    await whitenOne(f);
  } catch (err) {
    console.error(`ERROR en ${f}: ${err.message}`);
  }
}

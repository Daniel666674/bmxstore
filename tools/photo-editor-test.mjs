/* =========================================================================
   Prueba del editor de fotos (assets/js/photo-editor.js), en un navegador
   real: gira/voltea, recorta, "Auto" de brillo y "Emparejar fondo blanco"
   sobre imagenes sinteticas donde se conoce la respuesta correcta.

     npm install playwright
     cd .. && python3 -m http.server 8138
     node tools/photo-editor-test.mjs
   ========================================================================= */
import { chromium } from 'playwright';
const B = 'http://localhost:8138/bmxstore';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR', e.message));
await page.goto(`${B}/admin.html`, { waitUntil: 'networkidle' });

let fail = 0;
const t = (l, ok, extra = '') => { if (!ok) fail++; console.log(`  ${ok ? 'ok   ' : 'FALLA'} ${l}${extra}`); };

const r = await page.evaluate(async () => {
  const out = {};

  /* ---- imagen sintetica: 200x300 (mas alta que ancha), rectangulo   ----
     rojo en el centro, marco de 40px gris claro parejo -- para poder
     verificar rotacion, recorte y blanqueo con valores exactos. */
  function makeTestPng() {
    const c = document.createElement('canvas');
    c.width = 200; c.height = 300;
    const cx = c.getContext('2d');
    cx.fillStyle = 'rgb(210,205,200)'; // fondo gris tinturado, como el papel de las fotos de ropa
    cx.fillRect(0, 0, 200, 300);
    cx.fillStyle = 'rgb(20,20,20)';
    cx.fillRect(40, 40, 120, 220); // "prenda" oscura, casi llena el cuadro salvo un margen
    return new Promise(res => c.toBlob(b => res(URL.createObjectURL(b)), 'image/png'));
  }

  const src = await makeTestPng();

  // ---- 1) abrir, girar 90°, verificar que el lienzo cambia de orientacion ----
  await window.openPhotoEditor(src, { onSave() {} });
  await new Promise(r => setTimeout(r, 80)); // deja que openPhotoEditor termine de cargar (await interno)
  const stage = () => document.querySelector('[data-pe="stage"]');
  const canvas = () => document.querySelector('[data-pe="canvas"]');
  out.beforeRotate = { w: canvas().width, h: canvas().height };
  document.querySelector('[data-pe="rotate-r"]').click();
  await new Promise(r => setTimeout(r, 30));
  out.afterRotate = { w: canvas().width, h: canvas().height };

  document.querySelector('[data-pe="close"]').click();
  return out;
});

t('el lienzo carga con las dimensiones de la imagen (200x300)', r.beforeRotate.w === 200 && r.beforeRotate.h === 300, `  ${JSON.stringify(r.beforeRotate)}`);
t('girar 90° intercambia ancho/alto (300x200)', r.afterRotate.w === 300 && r.afterRotate.h === 200, `  ${JSON.stringify(r.afterRotate)}`);

/* ---- Segunda pasada: probar guardar con onSave real y medir el blob ---- */
const r2 = await page.evaluate(async () => {
  function makeTestPng() {
    const c = document.createElement('canvas');
    c.width = 200; c.height = 300;
    const cx = c.getContext('2d');
    cx.fillStyle = 'rgb(210,205,200)';
    cx.fillRect(0, 0, 200, 300);
    cx.fillStyle = 'rgb(20,20,20)';
    cx.fillRect(40, 40, 120, 220);
    return new Promise(res => c.toBlob(b => res(URL.createObjectURL(b)), 'image/png'));
  }
  const src = await makeTestPng();
  let saved = null;
  await window.openPhotoEditor(src, { onSave(file) { saved = file; } });
  await new Promise(r => setTimeout(r, 80));
  document.querySelector('[data-pe="crop-square"]').click();
  await new Promise(r => setTimeout(r, 30));
  document.querySelector('[data-pe="save"]').click();
  await new Promise(r => setTimeout(r, 100));
  const bmp = await createImageBitmap(saved);
  return { w: bmp.width, h: bmp.height, type: saved.type, size: saved.size };
});
t('recorte 1:1 exporta un archivo cuadrado', r2.w === r2.h, `  ${r2.w}x${r2.h}`);
t('exporta como JPEG', r2.type === 'image/jpeg', `  (${r2.type})`);
t('el archivo tiene contenido', r2.size > 500, `  ${r2.size} bytes`);

/* ---- Tercera pasada: "Emparejar fondo blanco" sube el marco a blanco ---- */
const r3 = await page.evaluate(async () => {
  function makeTintedPng() {
    const c = document.createElement('canvas');
    c.width = 240; c.height = 240;
    const cx = c.getContext('2d');
    // vinetado + tinte calido: mas oscuro y mas rosado hacia las esquinas, como una foto de celular sobre papel
    // (caida suave, no un foco radial cerrado -- asi vinetea una foto de celular real, no un spot muy marcado)
    const grad = cx.createRadialGradient(120, 120, 40, 120, 120, 260);
    grad.addColorStop(0, 'rgb(228,225,221)');
    grad.addColorStop(1, 'rgb(185,163,160)');
    cx.fillStyle = grad;
    cx.fillRect(0, 0, 240, 240);
    cx.fillStyle = 'rgb(15,15,15)';
    cx.fillRect(60, 60, 120, 120); // "prenda" central oscura
    return new Promise(res => c.toBlob(b => res(URL.createObjectURL(b)), 'image/png'));
  }
  const src = await makeTintedPng();
  let saved = null;
  await window.openPhotoEditor(src, { onSave(file) { saved = file; } });
  await new Promise(r => setTimeout(r, 80));
  document.querySelector('[data-pe="whiten"]').click();
  await new Promise(r => setTimeout(r, 150));
  document.querySelector('[data-pe="save"]').click();
  await new Promise(r => setTimeout(r, 100));
  const bmp = await createImageBitmap(saved);
  const c2 = document.createElement('canvas');
  c2.width = bmp.width; c2.height = bmp.height;
  const cx2 = c2.getContext('2d');
  cx2.drawImage(bmp, 0, 0);
  const px = (x, y) => Array.from(cx2.getImageData(x, y, 1, 1).data).slice(0, 3);
  return {
    esquina: px(3, 3),
    borde: px(bmp.width >> 1, 3),
    centroPrenda: px(bmp.width >> 1, bmp.height >> 1),
  };
});
const near = (a, b, tol) => a.every((v, i) => Math.abs(v - b[i]) <= tol);
const neutral = (a, tol) => Math.max(...a) - Math.min(...a) <= tol; // sin tinte de color: R~G~B
t('fondo blanco: la esquina (la mas tinturada) queda clara', r3.esquina.every(v => v > 200), `  rgb(${r3.esquina})`);
t('fondo blanco: la esquina queda neutra (sin tinte rosado)', neutral(r3.esquina, 14), `  rgb(${r3.esquina})`);
t('fondo blanco: el borde tambien queda claro', r3.borde.every(v => v > 210), `  rgb(${r3.borde})`);
t('fondo blanco: la prenda oscura del centro NO se aclara de mas', r3.centroPrenda.every(v => v < 90), `  rgb(${r3.centroPrenda})`);

/* ---- Cuarta pasada: "Auto" de brillo nivela dos fotos con distinta exposicion ---- */
const r4 = await page.evaluate(async () => {
  function makeExposurePng(bg) {
    const c = document.createElement('canvas');
    c.width = 200; c.height = 200;
    const cx = c.getContext('2d');
    cx.fillStyle = `rgb(${bg},${bg},${bg})`;
    cx.fillRect(0, 0, 200, 200);
    cx.fillStyle = 'rgb(30,30,30)';
    cx.fillRect(30, 30, 140, 140);
    return new Promise(res => c.toBlob(b => res(URL.createObjectURL(b)), 'image/png'));
  }
  async function autoBrightBorder(bg) {
    const src = await makeExposurePng(bg);
    let saved = null;
    await window.openPhotoEditor(src, { onSave(file) { saved = file; } });
    await new Promise(r => setTimeout(r, 80));
    document.querySelector('[data-pe="brightness-auto"]').click();
    await new Promise(r => setTimeout(r, 30));
    document.querySelector('[data-pe="save"]').click();
    await new Promise(r => setTimeout(r, 80));
    const bmp = await createImageBitmap(saved);
    const c2 = document.createElement('canvas');
    c2.width = bmp.width; c2.height = bmp.height;
    c2.getContext('2d').drawImage(bmp, 0, 0);
    return Array.from(c2.getContext('2d').getImageData(2, 2, 1, 1).data).slice(0, 3)[0];
  }
  const oscura = await autoBrightBorder(150); // foto subexpuesta
  const clara = await autoBrightBorder(240);  // foto casi bien
  return { oscura, clara };
});
t('Auto brillo nivela dos fotos con distinta exposición a un valor cercano', Math.abs(r4.oscura - r4.clara) <= 12, `  oscura->${r4.oscura}  clara->${r4.clara}`);

/* ---- Quinta pasada: un doblez de papel (sombra dura, delgada) en el fondo
   desaparece, pero una prenda solida y clara (color similar al fondo) NO
   se aplana -- lo que las distingue es la forma (linea vs bloque), no el
   color. Reproduce el caso real: buzo-nightmare-gris con el doblez del
   papel, y un cuerpo de tela crema como el de buzo-etnies-beige. ---- */
const r5 = await page.evaluate(async () => {
  function makeCreasePng() {
    const c = document.createElement('canvas');
    c.width = 300; c.height = 300;
    const cx = c.getContext('2d');
    cx.fillStyle = 'rgb(248,248,248)';
    cx.fillRect(0, 0, 300, 300);
    // doblez del papel: una linea horizontal oscura y delgada, FUERA de la prenda
    cx.fillStyle = 'rgb(150,150,150)';
    cx.fillRect(0, 60, 300, 3);
    // prenda: un bloque solido central, un tono PALIDO (parecido al fondo,
    // como una tela crema) -- debe seguir distinguiendose del fondo
    cx.fillStyle = 'rgb(225,215,195)';
    cx.fillRect(90, 100, 120, 150);
    return new Promise(res => c.toBlob(b => res(URL.createObjectURL(b)), 'image/png'));
  }
  const src = await makeCreasePng();
  let saved = null;
  await window.openPhotoEditor(src, { onSave(file) { saved = file; } });
  await new Promise(r => setTimeout(r, 80));
  document.querySelector('[data-pe="whiten"]').click();
  await new Promise(r => setTimeout(r, 200));
  document.querySelector('[data-pe="save"]').click();
  await new Promise(r => setTimeout(r, 100));
  const bmp = await createImageBitmap(saved);
  const c2 = document.createElement('canvas');
  c2.width = bmp.width; c2.height = bmp.height;
  c2.getContext('2d').drawImage(bmp, 0, 0);
  const px = (x, y) => Array.from(c2.getContext('2d').getImageData(x, y, 1, 1).data).slice(0, 3);
  return {
    sobreElDoblez: px(20, 61),       // fuera de la prenda, sobre la linea del doblez
    fondoLejos: px(20, 200),         // fondo limpio, lejos de todo
    centroPrenda: px(150, 175),      // dentro del bloque palido (la "prenda")
  };
});
t('doblez del papel (linea delgada en el fondo) desaparece', r5.sobreElDoblez.every(v => v > 235), `  rgb(${r5.sobreElDoblez})`);
t('el fondo limpio tambien queda blanco', r5.fondoLejos.every(v => v > 235), `  rgb(${r5.fondoLejos})`);
t('la prenda palida (bloque solido) NO se aplana con el fondo', r5.centroPrenda.every((v, i) => Math.abs(v - [225, 215, 195][i]) < 25), `  rgb(${r5.centroPrenda})`);

/* ---- Sexta pasada: si la prenda llega casi hasta el borde (sin fondo
   real que medir), "Emparejar fondo blanco" no debe inventar nada --
   avisa y deja la foto intacta. ---- */
const r6 = await page.evaluate(async () => {
  function makeNoBackgroundPng() {
    const c = document.createElement('canvas');
    c.width = 300; c.height = 300;
    const cx = c.getContext('2d');
    // "prenda" azul saturada que llena casi todo el cuadro, sin margen real de fondo
    cx.fillStyle = 'rgb(20,40,160)';
    cx.fillRect(0, 0, 300, 300);
    cx.fillStyle = 'rgb(230,225,255)';
    cx.fillRect(0, 0, 300, 8); // una tira minuscula, no representativa
    return new Promise(res => c.toBlob(b => res(URL.createObjectURL(b)), 'image/png'));
  }
  const src = await makeNoBackgroundPng();
  const before = await (await fetch(src)).blob();
  const beforeBmp = await createImageBitmap(before);
  const c0 = document.createElement('canvas');
  c0.width = beforeBmp.width; c0.height = beforeBmp.height;
  c0.getContext('2d').drawImage(beforeBmp, 0, 0);
  const beforePx = Array.from(c0.getContext('2d').getImageData(150, 150, 1, 1).data).slice(0, 3);

  let saved = null;
  const origAlert = window.alert; let alertCalled = false;
  window.alert = () => { alertCalled = true; };
  await window.openPhotoEditor(src, { onSave(file) { saved = file; } });
  await new Promise(r => setTimeout(r, 80));
  document.querySelector('[data-pe="whiten"]').click();
  await new Promise(r => setTimeout(r, 200));
  window.alert = origAlert;
  document.querySelector('[data-pe="save"]').click();
  await new Promise(r => setTimeout(r, 100));
  const bmp = await createImageBitmap(saved);
  const c2 = document.createElement('canvas');
  c2.width = bmp.width; c2.height = bmp.height;
  c2.getContext('2d').drawImage(bmp, 0, 0);
  const afterPx = Array.from(c2.getContext('2d').getImageData(150, 150, 1, 1).data).slice(0, 3);
  return { alertCalled, beforePx, afterPx };
});
t('sin fondo confiable: avisa en vez de fallar en silencio', r6.alertCalled === true);
t('sin fondo confiable: la foto queda intacta (no se inventa un blanco)', near(r6.beforePx, r6.afterPx, 3), `  antes rgb(${r6.beforePx}) despues rgb(${r6.afterPx})`);

await browser.close();
console.log(fail ? `\n  ${fail} FALLARON\n` : '\n  todo pasó\n');
process.exit(fail ? 1 : 0);

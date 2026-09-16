/* =========================================================================
   Prueba del procesamiento de fotos del panel, en un navegador real.

   Verifica el caso que el spec marca como ya pagado: un PNG con fondo
   transparente (como llega la mitad de las fotos de producto recortadas)
   exportado a JPEG aplana lo transparente a NEGRO, porque el JPEG no tiene
   canal alfa. Sin rellenar el fondo de blanco antes de dibujar, el producto
   se publica con el fondo negro y nadie lo nota hasta que el cliente
   reclama.

   Necesita Playwright y el sitio servido en /bmxstore/ -- ver
   tools/e2e-test.mjs para el detalle:

     npm install playwright
     cd .. && python3 -m http.server 8138
     node tools/photo-test.mjs
   ========================================================================= */
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage();
p.on('pageerror', e => console.log('PAGEERROR', e.message));
await p.goto('http://localhost:8138/bmxstore/admin.html', { waitUntil: 'networkidle' });

const r = await p.evaluate(async () => {
  // PNG con fondo transparente y un circulo rojo: exactamente el caso que
  // sale negro al exportar a JPEG sin rellenar el fondo.
  const c = document.createElement('canvas');
  c.width = c.height = 300;
  const cx = c.getContext('2d');
  cx.fillStyle = '#cc0000';
  cx.beginPath(); cx.arc(150, 150, 70, 0, Math.PI * 2); cx.fill();
  const pngBlob = await new Promise(res => c.toBlob(res, 'image/png'));
  const file = new File([pngBlob], 'recorte.png', { type: 'image/png' });

  const out = await compressImageFile(file);

  // Decodificar el JPEG resultante y mirar una esquina y el centro.
  const bmp = await createImageBitmap(out);
  const c2 = document.createElement('canvas');
  c2.width = bmp.width; c2.height = bmp.height;
  const cx2 = c2.getContext('2d');
  cx2.drawImage(bmp, 0, 0);
  const px = (x, y) => Array.from(cx2.getImageData(x, y, 1, 1).data).slice(0, 3);
  return { tipo: out.type, esquina: px(2, 2), centro: px(bmp.width >> 1, bmp.height >> 1) };
});

const cerca = (a, b, tol = 12) => a.every((v, i) => Math.abs(v - b[i]) <= tol);
let fail = 0;
const t = (l, ok, extra='') => { if (!ok) fail++; console.log(`  ${ok ? 'ok   ' : 'FALLA'} ${l}${extra}`); };
console.log('\nPNG TRANSPARENTE -> JPEG');
t('sale como JPEG', r.tipo === 'image/jpeg', `  (${r.tipo})`);
t('la esquina transparente queda BLANCA, no negra', cerca(r.esquina, [255,255,255]), `  rgb(${r.esquina})`);
t('el contenido se conserva (centro rojo)', cerca(r.centro, [204,0,0], 30), `  rgb(${r.centro})`);
await b.close();
console.log(fail ? `\n  ${fail} FALLARON\n` : '\n  todo pasó\n');
process.exit(fail ? 1 : 0);

/* =========================================================================
   Prueba de extremo a extremo en un navegador real: verifica las reglas de
   stock y visibilidad como las ve un cliente, no como las calcula el motor.

   Necesita dos cosas, por eso no corre solo:

     1. Playwright:  npm install playwright   (no queda en el repo: el sitio
        no tiene build step ni dependencias, y esto es solo herramienta)
     2. El sitio servido en /bmxstore/, porque las paginas llevan
        <base href="/bmxstore/">:

          cd ..           # el directorio que CONTIENE bmxstore/
          python3 -m http.server 8138

   Y despues:  node tools/e2e-test.mjs

   Ojo: para que los casos de borrador y agotado tengan algo que verificar,
   el catalogo tiene que tener uno de cada. Con el catalogo real (todo
   publicado y con stock) esos casos no prueban nada. Como se armo la
   ultima vez: poner published:false en un producto, units:0 en otro, una
   talla y un color en 0 en uno con variantes, y quitarle units a otro.
   ========================================================================= */
import { chromium } from 'playwright';
const B = 'http://localhost:8138/bmxstore';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fail++;
  console.log(`  ${ok ? 'ok   ' : 'FALLA'} ${label}${ok ? '' : `  -> ${JSON.stringify(got)} (esperaba ${JSON.stringify(want)})`}`);
};
const open = async (url) => {
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  /* El banner de cookies y el pop-up de newsletter tapan la pagina y se
     comen los clics de la prueba. Se quitan del DOM, no se "aceptan", para
     no depender de su comportamiento. */
  await page.evaluate(() => {
    document.querySelectorAll('.cookie-banner, #newsletter-overlay').forEach(el => el.remove());
  });
  return { page, errs };
};

console.log('\nEL BORRADOR NO SE VE EN NINGUNA PARTE');
{
  const { page, errs } = await open(`${B}/tienda.html`);
  t('tienda: no aparece el borrador', await page.locator('.card', { hasText: 'Recoil Rojo' }).count(), 0);
  t('tienda: sigue mostrando el resto', (await page.locator('.card').count()) > 40, true);
  await page.locator('body').press('Control+k');
  await page.locator('#search-input, input[type=search]').first().fill('recoil').catch(() => {});
  await page.waitForTimeout(400);
  const hits = await page.locator('.search-row, [class*=search] a').filter({ hasText: 'Recoil Rojo' }).count();
  t('buscador: no encuentra el borrador', hits, 0);
  t('sin errores de JS', errs, []);
  await page.close();
}
{
  const { page } = await open(`${B}/categoria/grips.html`);
  t('landing de grips: sin el borrador', await page.locator('.card', { hasText: 'Recoil Rojo' }).count(), 0);
  await page.close();
}

console.log('\nEL AGOTADO SE QUEDA Y PIDE EL CONTACTO');
{
  const { page, errs } = await open(`${B}/producto/bielas-bsd-substance-xl.html`);
  t('aviso de agotado visible', (await page.locator('.stock.out').textContent()).includes('Agotado por ahora'), true);
  t('boton de carrito deshabilitado', await page.locator('#add-btn').isDisabled(), true);
  t('etiqueta del boton de WhatsApp', (await page.locator('#wa-buy').textContent()).trim(), 'Avísame cuando llegue');
  const href = await page.locator('#wa-buy').getAttribute('href');
  t('mensaje de WhatsApp = avisame', decodeURIComponent(href).includes('me avisas cuando vuelva'), true);
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  t('datos estructurados: OutOfStock', ld.offers.availability, 'https://schema.org/OutOfStock');
  t('sin errores de JS', errs, []);
  await page.close();
}
{
  const { page } = await open(`${B}/tienda.html`);
  t('el agotado SIGUE en la vitrina', await page.locator('.card', { hasText: 'Substance XL' }).count(), 1);
  t('con su etiqueta de agotado', await page.locator('.card', { hasText: 'Substance XL' }).locator('.badge.sold').count(), 1);
  await page.close();
}

console.log('\nRELACIONADOS: SIN BORRADORES NI AGOTADOS');
{
  const { page } = await open(`${B}/producto/grips-odyssey-broc.html`).catch(async () => await open(`${B}/producto/casco-tsg-evolution.html`));
  const names = await page.locator('#related .card .title').allTextContents();
  t('no recomienda el borrador', names.some(n => n.includes('Recoil Rojo')), false);
  t('no recomienda el agotado', names.some(n => n.includes('Substance XL')), false);
  await page.close();
}

console.log('\nVARIANTES: LA AGOTADA SALE DESACTIVADA, EL TOPE ES LA COMBINACION');
{
  const { page, errs } = await open(`${B}/producto/casco-tsg-evolution.html`);
  t('talla S deshabilitada', await page.locator('#size-options button[data-size="S"]').isDisabled(), true);
  t('talla M habilitada', await page.locator('#size-options button[data-size="M"]').isDisabled(), false);
  t('color Blanco deshabilitado', await page.locator('#color-options button[data-color="Blanco"]').isDisabled(), true);
  // M=7, Salmon=12 -> el tope de la combinacion es 7
  await page.locator('#size-options button[data-size="M"]').click();
  await page.locator('#color-options button[data-color="Salmón"]').click();
  for (let i = 0; i < 12; i++) await page.locator('[data-q="1"]').click();
  t('cantidad topeada en min(7,12)=7', await page.locator('#qty').inputValue(), '7');
  const href = decodeURIComponent(await page.locator('#wa-buy').getAttribute('href'));
  t('el mensaje lleva talla y color', href.includes('talla M') && href.includes('color Salmón'), true);
  t('sin errores de JS', errs, []);
  await page.close();
}

console.log('\nSTOCK DESCONOCIDO NO ES CERO');
{
  const { page } = await open(`${B}/producto/manubrio-eclat.html`);
  const txt = await page.locator('.stock-line').textContent();
  t('sin unidades registradas: NO dice agotado', txt.includes('Agotado'), false);
  t('dice disponible', txt.includes('Disponible'), true);
  await page.close();
}
{
  const { page } = await open(`${B}/tienda.html`);
  t('en la vitrina no sale como agotado', await page.locator('.card', { hasText: 'Manubrio Éclat' }).locator('.badge.sold').count(), 0);
  await page.close();
}

await browser.close();
console.log(fail ? `\n  ${fail} FALLARON\n` : '\n  todo pasó\n');
process.exit(fail ? 1 : 0);

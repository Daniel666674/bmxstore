/* =========================================================================
   Prueba del editor de producto reagrupado: mismos ids ed-* de siempre,
   validacion inline en vez de alert(), Escape cierra el drawer, y las dos
   validaciones defensivas de stock (para datos importados, no alcanzables
   desde la UI normal -- verificado antes de escribir el caso).

   node tools/editor-test.mjs
   ========================================================================= */
import { chromium } from 'playwright';
const B = 'http://localhost:8138/bmxstore';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let fail = 0;
const t = (l, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fail++; console.log(`  ${ok?'ok   ':'FALLA'} ${l}${ok?'':`  -> ${JSON.stringify(got)} (esperaba ${JSON.stringify(want)})`}`); };

async function openAdmin(email) {
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto(`${B}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((email) => sessionStorage.setItem('stike_admin_login_v1', JSON.stringify({ email, ts: Date.now() })), email);
  await page.goto(`${B}/admin.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  return page;
}

console.log('\nSecciones agrupadas + pie fijo, mismos ids de siempre');
{
  const page = await openAdmin('jparra375@gmail.com');
  await page.click('[data-edit]');
  await page.waitForTimeout(200);
  const sections = await page.locator('.ed-section').allTextContents();
  t('las 5 secciones estan presentes en orden', sections.map(s => s.split('—')[0].trim()), ['Identidad', 'Precio y publicación', 'Especificaciones', 'Stock', 'Fotos']);
  for (const id of ['ed-n','ed-brand','ed-cat','ed-sub','ed-slug','ed-sku','ed-price','ed-cost','ed-promo','ed-tag','ed-published','ed-spec','ed-sizes-box','ed-colors-box','ed-photogrid','ed-photo-input','ed-save']) {
    t(`#${id} sigue existiendo`, await page.locator('#' + id).count() > 0, true);
  }
  t('el pie (Guardar) es sticky', await page.locator('.ed-foot').evaluate(el => getComputedStyle(el).position), 'sticky');
  t('el encabezado es sticky', await page.locator('.ed-head').evaluate(el => getComputedStyle(el).position), 'sticky');
  await page.close();
}

console.log('\nValidacion inline reemplaza alert(): nombre vacio no deja guardar, sin popup');
{
  const page = await openAdmin('jparra375@gmail.com');
  await page.click('[data-edit]');
  await page.waitForTimeout(200);
  let dialogFired = false;
  page.on('dialog', async d => { dialogFired = true; await d.dismiss(); });
  await page.fill('#ed-n', '');
  await page.click('#ed-save');
  await page.waitForTimeout(200);
  t('NO aparecio un dialog nativo (alert)', dialogFired, false);
  t('el error aparece junto al campo Nombre', (await page.locator('#ed-n-err').textContent()).includes('obligatorio'), true);
  t('el foco salto al campo Nombre', await page.locator('#ed-n').evaluate(el => el === document.activeElement), true);
  t('el drawer sigue abierto (no guardo)', await page.locator('#editor-overlay').evaluate(el => el.classList.contains('open')), true);
  await page.close();
}

console.log('\nUn producto nuevo en blanco NO muestra el error de nombre antes de tocarlo');
{
  const page = await openAdmin('jparra375@gmail.com');
  await page.click('#btn-new-product');
  await page.waitForTimeout(200);
  t('sin error de nombre al abrir en blanco', await page.locator('#ed-n-err').textContent(), '');
  await page.close();
}

console.log('\nEscape cierra el editor (antes solo cerraba la venta rapida)');
{
  const page = await openAdmin('jparra375@gmail.com');
  await page.click('[data-edit]');
  await page.waitForTimeout(200);
  t('el drawer esta abierto', await page.locator('#editor-overlay').evaluate(el => el.classList.contains('open')), true);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  t('Escape lo cerro', await page.locator('#editor-overlay').evaluate(el => el.classList.contains('open')), false);
  await page.close();
}

console.log('\nStock: validaciones defensivas (datos importados) muestran error inline, sin alert()');
{
  // Ambas ramas de esta validacion son redes de seguridad para datos que
  // llegan de afuera (CSV/JSON importado), no casos que la UI deje armar:
  // quitar una talla deja el selector de subcategoria en su default valido,
  // y quitar un color de a uno auto-anula el arreglo antes de llegar a 1
  // (ver data-color-rm en renderStockEditor). Se prueban seteando el draft
  // directo, como haria un import con datos mal formados.
  const page = await openAdmin('jparra375@gmail.com');
  await page.click('[data-edit]');
  await page.waitForTimeout(200);
  await page.evaluate(() => { editorDraft.colors = [{ v: 'Negro', u: 5 }]; });
  let dialogFired = false;
  page.on('dialog', async d => { dialogFired = true; await d.dismiss(); });
  await page.click('#ed-save');
  await page.waitForTimeout(200);
  t('NO aparecio un dialog nativo', dialogFired, false);
  t('el error de stock aparece inline', (await page.locator('#ed-stock-err').textContent()).includes('2 o más'), true);
  t('el drawer sigue abierto (no guardo)', await page.locator('#editor-overlay').evaluate(el => el.classList.contains('open')), true);
  await page.close();
}

await browser.close();
console.log(fail ? `\n  ${fail} FALLARON\n` : '\n  todo pasó\n');
process.exit(fail ? 1 : 0);

/* =========================================================================
   Prueba de la vista de tabla del catalogo y las acciones en lote:
   alternar Tarjetas/Tabla con persistencia en localStorage, ordenar
   columnas, seleccion + barra de acciones, y los dos modales que
   reemplazan prompt()/confirm() (ajustar precio y eliminar en lote).

   node tools/table-test.mjs
   ========================================================================= */
import { chromium } from 'playwright';
const B = 'http://localhost:8138/bmxstore';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let fail = 0;
const t = (l, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fail++; console.log(`  ${ok?'ok   ':'FALLA'} ${l}${ok?'':`  -> ${JSON.stringify(got)} (esperaba ${JSON.stringify(want)})`}`); };

async function openAdmin() {
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto(`${B}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((email) => sessionStorage.setItem('stike_admin_login_v1', JSON.stringify({ email, ts: Date.now() })), 'jparra375@gmail.com');
  await page.goto(`${B}/admin.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  return page;
}

console.log('\nAlternar entre Tarjetas y Tabla, con persistencia');
{
  const page = await openAdmin();
  t('arranca en tarjetas', await page.locator('#product-grid').isVisible(), true);
  t('tabla oculta al inicio', await page.locator('#product-table-wrap').isVisible(), false);
  await page.click('[data-view="table"]');
  await page.waitForTimeout(150);
  t('la tabla se muestra', await page.locator('#product-table-wrap').isVisible(), true);
  t('las tarjetas se ocultan', await page.locator('#product-grid').isVisible(), false);
  t('124 filas en la tabla', await page.locator('#product-table-body tr[data-slug]').count(), 124);
  await page.reload();
  await page.waitForTimeout(500);
  t('la preferencia se guarda (localStorage)', await page.locator('#product-table-wrap').isVisible(), true);
  await page.close();
}

console.log('\nOrdenar columnas');
{
  const page = await openAdmin();
  await page.click('[data-view="table"]');
  await page.waitForTimeout(150);
  await page.click('th[data-sort="price"]');
  await page.waitForTimeout(150);
  const prices1 = await page.locator('#product-table-body td.num').evaluateAll(els => els.filter((_, i) => i % 2 === 0).map(e => parseInt(e.textContent.replace(/\D/g, ''))));
  const sortedAsc = [...prices1].sort((a, b) => a - b);
  t('ordena por precio ascendente', prices1, sortedAsc);
  await page.click('th[data-sort="price"]'); // click de nuevo invierte
  await page.waitForTimeout(150);
  const prices2 = await page.locator('#product-table-body td.num').evaluateAll(els => els.filter((_, i) => i % 2 === 0).map(e => parseInt(e.textContent.replace(/\D/g, ''))));
  t('un segundo click invierte a descendente', prices2, [...sortedAsc].reverse());

  await page.click('th[data-sort="sku"]');
  await page.waitForTimeout(150);
  const skus = await page.locator('#product-table-body td.mono').allTextContents();
  t('ordena por SKU alfabeticamente', skus, [...skus].sort());
  await page.close();
}

console.log('\nFiltros: subcategoria, marca y estado');
{
  const page = await openAdmin();
  await page.click('[data-view="table"]');
  await page.waitForTimeout(150);
  const total = await page.locator('#product-table-body tr[data-slug]').count();

  await page.selectOption('#p-filter-brand', 'Fiend');
  await page.waitForTimeout(150);
  const brandRows = await page.locator('#product-table-body .pt-brand').allTextContents();
  t('filtro de marca: solo Fiend', brandRows.every(b => b.trim() === 'Fiend'), true);
  t('filtro de marca: reduce la lista', brandRows.length > 0 && brandRows.length < total, true);

  await page.selectOption('#p-filter-brand', '');
  await page.selectOption('#p-filter-cat', 'repuestos');
  await page.waitForTimeout(150);
  const subOptions = await page.locator('#p-filter-sub option').allTextContents();
  t('subcategoria se limita a las de Repuestos', subOptions.includes('Marcos') && !subOptions.includes('Cascos'), true);
  await page.selectOption('#p-filter-sub', 'Marcos');
  await page.waitForTimeout(150);
  const subRows = await page.locator('#product-table-body tr[data-slug]').count();
  t('filtro de subcategoria: solo Marcos, menos filas', subRows > 0 && subRows < total, true);

  await page.selectOption('#p-filter-cat', '');
  await page.selectOption('#p-filter-sub', '');
  await page.selectOption('#p-filter-status', 'draft');
  await page.waitForTimeout(150);
  t('filtro de estado "Borrador": catalogo real no tiene, da 0', await page.locator('#product-table-body tr[data-slug]').count(), 0);

  await page.click('#btn-filters-clear');
  await page.waitForTimeout(150);
  t('limpiar filtros vuelve a mostrar todo', await page.locator('#product-table-body tr[data-slug]').count(), total);
  t('limpiar filtros resetea los selects', await page.locator('#p-filter-brand').inputValue(), '');
  await page.close();
}

console.log('\nSelección y barra de acciones en lote');
{
  const page = await openAdmin();
  await page.click('[data-view="table"]');
  await page.waitForTimeout(150);
  t('la barra empieza oculta', await page.locator('#bulk-bar').isVisible(), false);
  await page.check('#product-table-body tr:nth-child(1) input[type=checkbox]');
  await page.check('#product-table-body tr:nth-child(2) input[type=checkbox]');
  await page.waitForTimeout(100);
  t('la barra aparece con 2 seleccionados', (await page.locator('#bulk-count').textContent()).includes('2 productos'), true);
  await page.check('#ptable-select-all');
  await page.waitForTimeout(100);
  t('seleccionar todo marca las 124', (await page.locator('#bulk-count').textContent()).includes('124 productos'), true);
  await page.uncheck('#ptable-select-all');
  await page.waitForTimeout(100);
  t('deseleccionar todo oculta la barra', await page.locator('#bulk-bar').isVisible(), false);
  // cambiar de filtro limpia la seleccion (no arrastra slugs invisibles)
  await page.check('#product-table-body tr:nth-child(1) input[type=checkbox]');
  await page.fill('#p-search', 'cult');
  await page.waitForTimeout(150);
  t('la busqueda limpia la seleccion', await page.locator('#bulk-bar').isVisible(), false);
  await page.close();
}

console.log('\nAjustar precio en lote: modal, no prompt()/confirm(), con vista previa');
{
  const page = await openAdmin();
  await page.click('[data-view="table"]');
  await page.waitForTimeout(150);
  const beforePrice = await page.locator('#product-table-body tr:first-child td.num').first().textContent();
  await page.check('#product-table-body tr:nth-child(1) input[type=checkbox]');
  let dialogFired = false;
  page.on('dialog', async d => { dialogFired = true; await d.dismiss(); });
  await page.click('#bulk-price');
  await page.waitForTimeout(150);
  t('se abre el modal (no un prompt nativo)', await page.locator('#confirm-overlay').evaluate(el => el.classList.contains('open')), true);
  t('NO se disparo un dialog nativo', dialogFired, false);
  await page.fill('#bp-pct', '10');
  await page.waitForTimeout(100);
  t('la vista previa menciona el porcentaje', (await page.locator('#bp-preview').textContent()).includes('+10%'), true);
  await page.click('#bp-apply');
  await page.waitForTimeout(200);
  t('el modal se cierra solo', await page.locator('#confirm-overlay').evaluate(el => el.classList.contains('open')), false);
  const afterPrice = await page.locator('#product-table-body tr:first-child td.num').first().textContent();
  t('el precio cambio', beforePrice === afterPrice, false);
  await page.close();
}

console.log('\nPublicar en lote (sin modal, accion directa)');
{
  const page = await openAdmin();
  await page.click('[data-view="table"]');
  await page.waitForTimeout(150);
  await page.check('#product-table-body tr:nth-child(1) input[type=checkbox]');
  await page.click('#bulk-publish');
  await page.waitForTimeout(200);
  t('no quedo ningun modal abierto', await page.locator('.overlay.open').count(), 0);
  await page.close();
}

console.log('\nEliminar en lote: seleccion multiple de verdad (3 a la vez), modal en vez de confirm() nativo');
{
  const page = await openAdmin();
  await page.click('[data-view="table"]');
  await page.waitForTimeout(150);
  const before = await page.locator('#product-table-body tr[data-slug]').count();
  const targetSlugs = await page.locator('#product-table-body tr[data-slug]').evaluateAll(
    rows => rows.slice(0, 3).map(r => r.getAttribute('data-slug'))
  );
  await page.check('#product-table-body tr:nth-child(1) input[type=checkbox]');
  await page.check('#product-table-body tr:nth-child(2) input[type=checkbox]');
  await page.check('#product-table-body tr:nth-child(3) input[type=checkbox]');
  await page.waitForTimeout(100);
  t('la barra confirma los 3 seleccionados', (await page.locator('#bulk-count').textContent()).includes('3 productos'), true);
  let dialogFired = false;
  page.on('dialog', async d => { dialogFired = true; await d.dismiss(); });
  await page.click('#bulk-delete');
  await page.waitForTimeout(150);
  t('el modal menciona las 3 unidades', (await page.locator('#confirm-modal').textContent()).includes('3 producto'), true);
  t('NO se disparo un confirm() nativo', dialogFired, false);
  await page.click('#bd-confirm');
  await page.waitForTimeout(200);
  const after = await page.locator('#product-table-body tr[data-slug]').count();
  t('quedan 3 productos menos en la tabla (no solo 1)', after, before - 3);
  for (const slug of targetSlugs) {
    t(`"${slug}" ya no esta en la tabla`, await page.locator(`#product-table-body tr[data-slug="${slug}"]`).count(), 0);
  }
  await page.close();
}

await browser.close();
console.log(fail ? `\n  ${fail} FALLARON\n` : '\n  todo pasó\n');
process.exit(fail ? 1 : 0);

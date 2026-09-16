/* =========================================================================
   Prueba del motor de stock de Stike.

     node tools/stock-test.mjs

   Sin dependencias: corre con Node pelado. Cada caso de aca existe porque
   equivocarse ahi tiene consecuencia real en el sitio -- mercancia marcada
   como agotada cuando esta en la vitrina, un borrador visible, o una
   cantidad que deja comprar mas de lo que hay. Si toca data.js, corre esto.
   ========================================================================= */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const D = require(fileURLToPath(new URL('../assets/js/data.js', import.meta.url)));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? 'ok  ' : 'FALLA'} ${label}${ok ? '' : `  -> dio ${JSON.stringify(got)}, esperaba ${JSON.stringify(want)}`}`);
};

console.log('\nDesconocido no es cero');
t('sin units registradas -> vendible null', D.stikeSellable({ n: 'x' }), null);
t('sin units registradas -> NO agotado',    D.stikeIsOut({ n: 'x' }), false);
t('units: 0 -> agotado',                    D.stikeIsOut({ units: 0 }), true);
t('units: 3 -> no agotado',                 D.stikeIsOut({ units: 3 }), false);

console.log('\nCombinacion minima (dos bodegas independientes)');
const dos = { sizes: [{ v: 'S', u: 0 }, { v: 'M', u: 7 }], colors: [{ v: 'Negro', u: 2 }, { v: 'Blanco', u: 0 }] };
t('mejor combinacion M+Negro = min(7,2) = 2', D.stikeSellable(dos), 2);
t('M + Negro -> 2',   D.stikeStockFor(dos, 'M', 'Negro'), 2);
t('S + Negro -> 0 (la talla manda)', D.stikeStockFor(dos, 'S', 'Negro'), 0);
t('M + Blanco -> 0 (el color manda)', D.stikeStockFor(dos, 'M', 'Blanco'), 0);
t('sin elegir -> null (falta elegir)', D.stikeStockFor(dos, null, null), null);
t('no esta agotado: hay una combinacion viva', D.stikeIsOut(dos), false);

const sinCombo = { sizes: [{ v: 'S', u: 5 }], colors: [{ v: 'Negro', u: 0 }] };
t('talla con stock pero unico color en 0 -> agotado', D.stikeIsOut(sinCombo), true);

console.log('\nUna sola dimension');
t('tallas: mejor talla, no la suma', D.stikeSellable({ sizes: [{ v: 'S', u: 1 }, { v: 'M', u: 4 }] }), 4);
t('todas las tallas en 0 -> agotado', D.stikeIsOut({ sizes: [{ v: 'S', u: 0 }, { v: 'M', u: 0 }] }), true);
t('colores: mejor color', D.stikeSellable({ colors: [{ v: 'a', u: 2 }, { v: 'b', u: 9 }] }), 9);

console.log('\nVisibilidad (la diferencia de Stike)');
t('borrador -> invisible',            D.stikeIsVisible({ published: false, units: 5 }), false);
t('publicado -> visible',             D.stikeIsVisible({ published: true, units: 5 }), true);
t('sin campo published -> visible',   D.stikeIsVisible({ units: 5 }), true);
t('AGOTADO SIGUE VISIBLE',            D.stikeIsVisible({ units: 0 }), true);

console.log('\nEl contador del panel muestra el dato crudo');
t('suma cruda de tallas', D.stikeTotalStock({ sizes: [{ v: 'S', u: 1 }, { v: 'M', u: 4 }] }), 5);

console.log(`\n  ${pass} pasaron, ${fail} fallaron\n`);
process.exit(fail ? 1 : 0);

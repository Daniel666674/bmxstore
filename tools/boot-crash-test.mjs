/* Verifica el fix del falso positivo: STIKE_ADMIN_BOOTED se pone al
   terminar la IIFE de init(), no al terminar de iniciar sesion, asi que
   el detector de fallas del <head> (revisa a los 4s) no debe dispararse
   ni con el gate de login todavia abierto (nadie hizo clic aun) ni con
   una sesion ya restaurada. Tambien confirma que la alarma real sigue
   funcionando si algo revienta antes de terminar init(). */
/* =========================================================================
   Prueba del detector de fallas del <head> de admin.html: que la alarma
   roja "el panel no cargó" no sea un falso positivo (STIKE_ADMIN_BOOTED
   con el login de por medio, o el SDK de Google bloqueado) y que la alarma
   real siga funcionando si admin.js de verdad no llega a inicializar.

   Reproduce el bug real reportado el primer día de uso: alguien inicio
   sesion bien, el panel funcionaba, y aun asi salia el banner rojo -- el
   watchdog de 4s revisaba STIKE_ADMIN_BOOTED antes de que la persona
   terminara de hacer clic en el boton de Google, que casi nunca pasa en
   4 segundos.

   node tools/boot-crash-test.mjs
   ========================================================================= */
import { chromium } from 'playwright';
const B = 'http://localhost:8138/bmxstore';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let fail = 0;
const t = (l, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fail++; console.log(`  ${ok?'ok   ':'FALLA'} ${l}${ok?'':`  -> ${JSON.stringify(got)} (esperaba ${JSON.stringify(want)})`}`); };

console.log('\nSin sesión, gate abierto, nadie hizo clic: NO debe salir la alarma a los 4s+');
{
  const page = await browser.newPage();
  await page.goto(`${B}/admin.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4700); // el watchdog original disparaba a los 4000ms
  t('el gate sigue abierto (nadie inició sesión)', await page.locator('#login-gate').isVisible(), true);
  t('NO aparece el banner de "el panel no cargó"', await page.locator('#boot-crash').count(), 0);
  t('STIKE_ADMIN_BOOTED quedó en true', await page.evaluate(() => window.STIKE_ADMIN_BOOTED), true);
  await page.close();
}

console.log('\nSesión ya restaurada (como el caso real de Daniel): tampoco sale la alarma');
{
  const page = await browser.newPage();
  await page.goto(`${B}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => sessionStorage.setItem('stike_admin_login_v1', JSON.stringify({ email: 'jparra375@gmail.com', ts: Date.now() })));
  await page.goto(`${B}/admin.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4700);
  t('el panel arrancó', await page.locator('#panel-title').isVisible(), true);
  t('NO aparece el banner', await page.locator('#boot-crash').count(), 0);
  await page.close();
}

console.log('\nLa alarma real sigue funcionando si admin.js de verdad no llega a inicializar');
{
  const page = await browser.newPage();
  // Simula el escenario real que el detector existe para atrapar: el
  // script no llega a cargar.
  await page.route('**/admin.js*', route => route.abort());
  await page.goto(`${B}/admin.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4700);
  t('SÍ aparece el banner cuando admin.js no carga', await page.locator('#boot-crash').count() > 0, true);
  await page.close();
}

console.log('\nEl SDK de Google bloqueado (ad-blocker, red restrictiva) NO dispara el banner genérico');
{
  // En esta sandbox accounts.google.com esta bloqueado por la red del
  // entorno -- mismo efecto de red que un ad-blocker real, sirve igual
  // para probar la exclusion.
  const page = await browser.newPage();
  await page.goto(`${B}/admin.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4700);
  t('NO aparece el banner genérico por el script de Google', await page.locator('#boot-crash').count(), 0);
  await page.waitForTimeout(6000); // deadline de whenGoogleReady son 10s en total
  const note = await page.locator('#login-gate-note').textContent();
  t('el aviso específico y accionable SÍ aparece, dentro del gate', note.includes('conexión'), true);
  await page.close();
}

console.log('\nGoogle Fonts bloqueado (ad-blocker, corte de red) NO dispara el banner: es cosmético, no una falla');
{
  // Mismo bug de fondo que el del SDK de Google, encontrado al agregar el
  // <link> de Inter: si la fuente no carga, el panel funciona perfecto en
  // la fuente del sistema -- no amerita el banner rojo de "no cargó".
  const page = await browser.newPage();
  await page.route('**/fonts.googleapis.com/**', route => route.abort());
  await page.route('**/fonts.gstatic.com/**', route => route.abort());
  await page.goto(`${B}/admin.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4700);
  t('el panel sigue funcionando sin la fuente', await page.locator('#login-gate').isVisible(), true);
  t('NO aparece el banner genérico por la fuente bloqueada', await page.locator('#boot-crash').count(), 0);
  await page.close();
}

await browser.close();
console.log(fail ? `\n  ${fail} FALLARON\n` : '\n  todo pasó\n');
process.exit(fail ? 1 : 0);

/* Prueba del gate de login del panel, sin credenciales reales de Google
   (esta sandbox no llega a accounts.google.com). Cubre todo lo que SÍ se
   puede probar sin ese handshake: el gate bloqueando, la revalidación
   contra ADMIN_EMAILS, los dos roles, el navegador embebido y cerrar
   sesión. El botón real de Google se prueba a mano una vez publicado. */
/* =========================================================================
   Prueba del gate de Google Sign-In del panel, en un navegador real.

   No usa credenciales reales de Google -- verifica cada rama de la logica
   sin necesitar el handshake completo: el gate bloqueando por defecto, la
   revalidacion contra ADMIN_EMAILS (si sacan a alguien de la lista, una
   sesion vieja guardada no lo deja pasar), los dos roles, el navegador
   embebido de WhatsApp/Instagram, cerrar sesion, y verifyGoogleCredential
   contra respuestas fabricadas de Google (aud equivocado, correo sin
   verificar). El boton real de Google Sign-In se prueba a mano, una vez
   publicado, con una cuenta de verdad.

   Necesita Playwright y el sitio servido en /bmxstore/ -- ver
   tools/e2e-test.mjs para el detalle de como levantarlo.

     node tools/login-test.mjs
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

async function openAdmin(opts = {}) {
  const context = await browser.newContext(opts.userAgent ? { userAgent: opts.userAgent } : {});
  const page = await context.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  if (opts.seedLogin) {
    // sessionStorage es por origen y persiste entre navegaciones de la MISMA
    // pestaña -- a diferencia de addInitScript, que se re-ejecutaria en cada
    // recarga y volveria a sembrar la sesion despues de "Cerrar sesión".
    // Por eso: una navegacion real primero, sembrar con evaluate(), y
    // recien ahi ir a admin.html.
    await page.goto(`${B}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((email) => {
      sessionStorage.setItem('stike_admin_login_v1', JSON.stringify({ email, ts: Date.now() }));
    }, opts.seedLogin);
  }
  await page.goto(`${B}/admin.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400); // deja correr el init() sincrono
  return { page, context, errs };
}

console.log('\nSIN SESIÓN GUARDADA: el gate bloquea el panel');
{
  const { page, context, errs } = await openAdmin();
  t('el gate está visible', await page.locator('#login-gate').isVisible(), true);
  t('el panel (#app) no es interactivo detrás', await page.locator('#app').isVisible(), true); // existe en el DOM
  t('no dice "Modo demo" (el login está activo)', (await page.locator('#session-info').textContent()).includes('Modo demo'), false);
  t('sin errores de JS', errs, []);
  await context.close();
}

console.log('\nNAVEGADOR EMBEBIDO (WhatsApp): mensaje en vez del botón');
{
  const waUA = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 WhatsApp/2.23.20.0';
  const { page, context, errs } = await openAdmin({ userAgent: waUA });
  t('el gate sigue visible', await page.locator('#login-gate').isVisible(), true);
  const note = await page.locator('#login-gate-note').textContent();
  t('avisa que abra Chrome/Safari', note.includes('Chrome o Safari'), true);
  t('sin errores de JS', errs, []);
  await context.close();
}

console.log('\nSESIÓN GUARDADA — DUEÑO: entra directo, ve costos');
{
  const { page, context, errs } = await openAdmin({ seedLogin: 'jparra375@gmail.com' });
  t('el gate se oculta', await page.locator('#login-gate').isVisible(), false);
  t('el panel arrancó', await page.locator('#panel-title').isVisible(), true);
  const info = await page.locator('#session-info').textContent();
  t('muestra el correo', info.includes('jparra375@gmail.com'), true);
  t('pill de Dueño', info.includes('Dueño'), true);
  await context.close();
}

console.log('\nSESIÓN GUARDADA — EMPLEADO: entra, sin costos');
{
  const { page, context, errs } = await openAdmin({ seedLogin: 'camilor9507@gmail.com' });
  t('el gate se oculta', await page.locator('#login-gate').isVisible(), false);
  const info = await page.locator('#session-info').textContent();
  t('muestra el correo', info.includes('camilor9507@gmail.com'), true);
  t('pill de Editor (no Dueño)', info.includes('Editor') && !info.includes('Dueño'), true);
  await context.close();
}

console.log('\nCORREO QUE NO ESTÁ EN LA LISTA: se revalida, no se confía en lo guardado');
{
  const { page, context, errs } = await openAdmin({ seedLogin: 'extrano@gmail.com' });
  t('el gate sigue bloqueando', await page.locator('#login-gate').isVisible(), true);
  await context.close();
}

console.log('\nCERRAR SESIÓN: limpia y vuelve a pedir login');
{
  const { page, context } = await openAdmin({ seedLogin: 'jparra375@gmail.com' });
  await page.waitForSelector('button:has-text("Cerrar sesión")');
  await page.click('button:has-text("Cerrar sesión")');
  await page.waitForTimeout(500);
  t('el gate vuelve a aparecer', await page.locator('#login-gate').isVisible(), true);
  const stored = await page.evaluate(() => sessionStorage.getItem('stike_admin_login_v1'));
  t('sessionStorage quedó limpio', stored, null);
  await context.close();
}

console.log('\nverifyGoogleCredential: rechaza un aud equivocado y un email no verificado');
{
  const { page, context } = await openAdmin();
  const r1 = await page.evaluate(async () => {
    window.fetch = async () => ({ ok: true, json: async () => ({ aud: 'OTRO_CLIENT_ID', email: 'x@gmail.com', email_verified: 'true' }) });
    try { await verifyGoogleCredential('fake'); return 'no lanzó error'; } catch (e) { return e.message; }
  });
  t('rechaza aud distinto', r1.includes('no corresponde'), true);
  const r2 = await page.evaluate(async () => {
    window.fetch = async () => ({ ok: true, json: async () => ({ aud: STIKE_SITE.oauthClientId, email: 'x@gmail.com', email_verified: 'false' }) });
    try { await verifyGoogleCredential('fake'); return 'no lanzó error'; } catch (e) { return e.message; }
  });
  t('rechaza correo no verificado', r2.includes('verificado'), true);
  const r3 = await page.evaluate(async () => {
    window.fetch = async () => ({ ok: true, json: async () => ({ aud: STIKE_SITE.oauthClientId, email: 'Jparra375@GMAIL.com', email_verified: true }) });
    return await verifyGoogleCredential('fake');
  });
  t('acepta un token válido y normaliza el correo a minúsculas', r3, 'jparra375@gmail.com');
  await context.close();
}

await browser.close();
console.log(fail ? `\n  ${fail} FALLARON\n` : '\n  todo pasó\n');
process.exit(fail ? 1 : 0);

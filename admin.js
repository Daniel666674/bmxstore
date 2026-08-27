/* =========================================================================
   STIKE BIKE SHOP: panel admin. Toda la logica vive aca (admin.html solo
   trae el shell). Habla DIRECTO con la API de contenidos de GitHub, sin
   servidor intermedio: GitHub es el backend. Reusa STIKE_CATEGORIES,
   STIKE_BRANDS, SIZE_CATEGORIES, SKU_CAT_CODES, skuBrandCode, stikeSizeRangeFor,
   stikeStockFor, etc. de assets/js/data.js (ya cargado antes que este script),
   y PdpRender de assets/js/pdp-render.js para regenerar producto/<slug>.html
   con la MISMA plantilla que uso el build inicial.
   ========================================================================= */

/* ============================== CONFIG ================================= */
const CONFIG = {
  owner: "Daniel666674",
  repo: "bmxstore",
  // Rama que despliega a GitHub Pages (ver .github/workflows/deploy.yml).
  branch: "main",
  paths: {
    catalog: "assets/js/products-data.js",
    costs: "data/costs.json",
    salesLog: "data/sales-log.json",
    auditLog: "data/audit-log.json",
    siteContent: "data/site-content.json",
    sitemap: "sitemap.xml",
    template: "_template.html",
  },
  // Demo: clave compartida en vez de Google OAuth real (ver nota en admin.html).
  passcode: "stike2026",
  // Correos con rol "owner": ven costo/margen, KPIs y auditoria completa.
  // Cualquier otro correo que conozca la clave entra como "editor" (CRUD +
  // ventas, sin datos financieros).
  ownerAllowlist: ["hola@stikebikeshop.com", "daniel.f.acosta96@gmail.com"],
};

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const backoffMs = attempt => [0, 400, 900, 1800, 3200][attempt] || 4000;
const money = n => "$" + Math.round(n || 0).toLocaleString("es-CO");

/* ============================== SESSION ================================= */
let session = null; // { name, email, role, pat }

function loadSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem("stike_admin_session") || "null");
    const pat = localStorage.getItem("stike_admin_pat") || "";
    if (s) return { ...s, pat };
  } catch {}
  return null;
}
function saveSession(s) {
  sessionStorage.setItem("stike_admin_session", JSON.stringify({ name: s.name, email: s.email, role: s.role }));
}

/* ============================== BASE64 (UTF-8 y binario safe) =========== */
function b64EncodeBytes(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function b64DecodeBytes(b64) {
  const bin = atob(b64.replace(/\n/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function b64EncodeText(str) { return b64EncodeBytes(new TextEncoder().encode(str)); }
function b64DecodeText(b64) { return new TextDecoder().decode(b64DecodeBytes(b64)); }

/* ============================== GITHUB CLIENT ============================
   Regla de oro: nunca se escribe a ciegas. Todo GET trae el sha actual;
   todo PUT/DELETE lo manda; un 409/422 por sha desactualizado se reintenta
   (hasta 4x, con backoff) volviendo a pedir el sha (y, para el catalogo,
   rehaciendo el merge completo -- ver writeCatalogWithMergeRetry).        */
async function ghRequest(path, opts = {}) {
  const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}` +
    (opts.method && opts.method !== "GET" ? "" : `?ref=${encodeURIComponent(CONFIG.branch)}`);
  const res = await fetch(url, {
    method: opts.method || "GET",
    headers: {
      Authorization: `Bearer ${session.pat}`,
      Accept: "application/vnd.github+json",
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res;
}

async function ghGetMeta(path) {
  const res = await ghRequest(path);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path} -> ${res.status}`);
  return await res.json();
}
async function ghGetFile(path) {
  const meta = await ghGetMeta(path);
  if (!meta) return null;
  return { sha: meta.sha, text: b64DecodeText(meta.content) };
}
async function ghPutOnce(path, contentB64, message, sha) {
  const res = await ghRequest(path, {
    method: "PUT",
    body: { message: `[${session.email}] ${message}`, content: contentB64, branch: CONFIG.branch, sha: sha || undefined },
  });
  if (res.ok) return await res.json();
  const bodyText = await res.text().catch(() => "");
  const err = new Error(`GitHub PUT ${path} -> ${res.status} ${bodyText}`);
  err.conflict = res.status === 409 || res.status === 422;
  err.status = res.status;
  throw err;
}
async function ghDeleteOnce(path, sha, message) {
  const res = await ghRequest(path, { method: "DELETE", body: { message: `[${session.email}] ${message}`, sha, branch: CONFIG.branch } });
  if (res.ok || res.status === 404) return;
  const bodyText = await res.text().catch(() => "");
  const err = new Error(`GitHub DELETE ${path} -> ${res.status} ${bodyText}`);
  err.conflict = res.status === 409;
  throw err;
}
async function ghDeleteIfExists(path, message) {
  const meta = await ghGetMeta(path);
  if (!meta) return;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try { return await ghDeleteOnce(path, meta.sha, message); }
    catch (e) {
      if (e.conflict && attempt < 4) { await sleep(backoffMs(attempt)); const fresh = await ghGetMeta(path); if (!fresh) return; meta.sha = fresh.sha; continue; }
      throw e;
    }
  }
}
/* Crear un archivo NUEVO en un path que se espera libre (fotos con nombre
   aleatorio). Si por una colision astronomicamente improbable ya existe,
   se reintenta con otro nombre aleatorio en vez de pisarlo (regla #2).    */
async function ghCreateWithRetryName(makePath, contentB64, message, maxTries = 5) {
  let lastErr;
  for (let i = 0; i < maxTries; i++) {
    const path = makePath();
    try { const r = await ghPutOnce(path, contentB64, message, undefined); return { path, result: r }; }
    catch (e) { lastErr = e; if (!e.conflict) throw e; }
  }
  throw lastErr;
}

/* ============================== CATALOG (parse/serialize) =============== */
const CATALOG_MARKER = "window.STIKE_PRODUCTS = ";
const CATALOG_HEADER = `/* =========================================================================
   STIKE BIKE SHOP: catalogo (fuente de la verdad)
   Generado y mantenido por el panel admin (admin.html) via GitHub Contents API.
   JS plano (no JSON) para poder incluirlo con <script src> sin fetch/CORS.
   Ver assets/js/data.js para SIZE_CATEGORIES, helpers de stock y variantes.
   ========================================================================= */\n`;
const CATALOG_KEY_ORDER = ["slug", "sku", "n", "brand", "cat", "sub", "spec", "price", "old", "promo", "tag",
  "units", "sizes", "colors", "imgs", "imgColorMap", "imgFit", "imgZoom", "imgPos", "published"];

function parseCatalogFile(text) {
  const i = text.indexOf(CATALOG_MARKER);
  if (i < 0) throw new Error("products-data.js: no se encontro window.STIKE_PRODUCTS");
  const body = text.slice(i + CATALOG_MARKER.length, text.lastIndexOf(";"));
  return JSON.parse(body);
}
function serializeCatalogFile(arr) {
  return CATALOG_HEADER + CATALOG_MARKER + JSON.stringify(arr, null, 2) + ";\n";
}
/* Lo que efectivamente se publica: quita campos internos (cost) y omite
   valores por defecto para que el archivo publicado quede liviano.        */
function toSiteProduct(p) {
  const out = {};
  for (const k of CATALOG_KEY_ORDER) {
    if (k === "tag" && !p.tag) continue;
    if (k === "old" && (!p.promo || !p.old)) continue;
    if (k === "imgFit" && (!p.imgFit || p.imgFit === "auto")) continue;
    if (k === "imgZoom" && (!p.imgZoom || p.imgZoom <= 100)) continue;
    if (k === "imgPos" && (!p.imgPos || p.imgPos === "center center")) continue;
    if (k === "imgColorMap" && (!p.imgColorMap || !Object.keys(p.imgColorMap).length)) continue;
    if (k === "sizes" && !(p.sizes && p.sizes.length)) continue;
    if (k === "colors" && !(p.colors && p.colors.length)) continue;
    if (k === "units" && (p.sizes && p.sizes.length || p.colors && p.colors.length)) continue;
    if (p[k] !== undefined) out[k] = p[k];
  }
  return out;
}

/* ============================== APP STATE ================================ */
let workingCatalog = [];           // copia de trabajo de esta sesion (incluye cost)
let baseline = new Map();          // slug remoto -> snapshot (site-shape) tal como estaba al cargar
let dirtySlugs = new Set();        // slugs (actuales) tocados esta sesion
let deletedSlugs = new Set();      // slugs remotos borrados esta sesion
let renamedFrom = new Map();       // slug nuevo -> slug remoto anterior
let costsMap = {};                 // slug -> costo (interno, nunca se publica en products-data.js)
let salesLog = [];
let auditLog = [];
let siteContent = {};
let pendingUploads = new Map();    // path reservado -> File original (sin comprimir)
let templateCache = null;
let catalogLoaded = false;

function findOwnBaselineSlug(currentSlug) {
  for (const [ns, os] of renamedFrom.entries()) if (ns === currentSlug) return os;
  return baseline.has(currentSlug) ? currentSlug : null;
}
function markDirty(slug) { dirtySlugs.add(slug); updateDirtyUI(); }
function updateDirtyUI() {
  const n = dirtySlugs.size + deletedSlugs.size;
  $("#btn-publish").disabled = n === 0;
  const pill = $("#dirty-pill");
  if (n > 0) { pill.style.display = ""; pill.textContent = `${n} cambio${n === 1 ? "" : "s"} sin publicar`; }
  else pill.style.display = "none";
}

/* ============================== LOAD ===================================== */
async function loadAll() {
  showStatus([{ text: "Cargando catálogo desde GitHub...", cls: "now" }]);
  const [catFile, costsFile, salesFile, auditFile, contentFile] = await Promise.all([
    ghGetFile(CONFIG.paths.catalog),
    ghGetFile(CONFIG.paths.costs),
    ghGetFile(CONFIG.paths.salesLog),
    ghGetFile(CONFIG.paths.auditLog),
    ghGetFile(CONFIG.paths.siteContent),
  ]);
  const arr = catFile ? parseCatalogFile(catFile.text) : [];
  costsMap = costsFile ? JSON.parse(costsFile.text) : {};
  salesLog = salesFile ? JSON.parse(salesFile.text) : [];
  auditLog = auditFile ? JSON.parse(auditFile.text) : [];
  siteContent = contentFile ? JSON.parse(contentFile.text) : {};

  baseline = new Map(arr.map(p => [p.slug, JSON.parse(JSON.stringify(p))]));
  workingCatalog = arr.map(p => ({ ...p, cost: costsMap[p.slug] || 0 }));
  dirtySlugs = new Set();
  deletedSlugs = new Set();
  renamedFrom = new Map();
  pendingUploads = new Map();
  window.STIKE_PRODUCTS = workingCatalog; // reusa helpers de data.js (stikeStockFor, stikeCategory, ...)
  catalogLoaded = true;

  renderProductTable();
  renderSalesTab();
  renderKpis();
  renderAudit();
  renderContentTab();
  updateDirtyUI();
  showStatus([{ text: `Listo: ${workingCatalog.length} productos.`, cls: "ok" }]);
}

/* ============================== VALIDATION =============================== */
function validateCatalog(catalog) {
  const errors = [];
  const bySlug = new Map(), bySku = new Map();
  catalog.forEach(p => {
    const label = p.n || p.slug || "(sin nombre)";
    if (!p.n) errors.push(`${label}: falta el nombre`);
    if (!p.brand) errors.push(`${label}: falta la marca`);
    if (!p.cat) errors.push(`${label}: falta la categoría`);
    if (!p.price || p.price <= 0) errors.push(`${label}: precio inválido`);
    if (!p.slug) errors.push(`${label}: falta el slug`);
    if (!p.sku) errors.push(`${label}: falta el SKU`);
    if (p.slug) { if (bySlug.has(p.slug)) errors.push(`Slug duplicado "${p.slug}": ${bySlug.get(p.slug)} y ${label}`); else bySlug.set(p.slug, label); }
    if (p.sku) { if (bySku.has(p.sku)) errors.push(`SKU duplicado "${p.sku}": ${bySku.get(p.sku)} y ${label}`); else bySku.set(p.sku, label); }
    if (SIZE_CATEGORIES.has(p.sub) && !(p.sizes && p.sizes.length)) errors.push(`${label}: la subcategoría "${p.sub}" requiere tabla de tallas con stock`);
    if (p.colors && p.colors.length === 1) errors.push(`${label}: colors[] necesita 2+ colores reales (o quítalo y deja solo unidades)`);
    (p.sizes || []).forEach(s => { if (s.u < 0) errors.push(`${label}: stock negativo en talla ${s.v}`); });
    (p.colors || []).forEach(c => { if (c.u < 0) errors.push(`${label}: stock negativo en color ${c.v}`); });
    if (!(p.sizes && p.sizes.length) && !(p.colors && p.colors.length) && typeof p.units !== "number") errors.push(`${label}: falta unidades en stock`);
  });
  return errors;
}
function checkRemoteUniqueness(freshArr, scopeSlugs) {
  const problems = [];
  for (const slug of (scopeSlugs || dirtySlugs)) {
    const d = workingCatalog.find(p => p.slug === slug);
    if (!d) continue;
    const ownSlug = findOwnBaselineSlug(d.slug);
    const slugHit = freshArr.find(r => r.slug === d.slug && r.slug !== ownSlug);
    if (slugHit) problems.push(`El slug "${d.slug}" (${d.n}) ya lo usa otro producto publicado por otra persona mientras editabas. Cambia el nombre/slug e intenta de nuevo.`);
    const ownRow = ownSlug ? freshArr.find(r => r.slug === ownSlug) : null;
    const skuHit = freshArr.find(r => r.sku === d.sku && r !== ownRow);
    if (skuHit) problems.push(`El SKU "${d.sku}" (${d.n}) ya lo usa otro producto publicado por otra persona mientras editabas. Genera un SKU nuevo e intenta de nuevo.`);
  }
  return problems;
}

/* ============================== 3-WAY MERGE ============================== */
function mergeProduct(draftSite, baselineSite, remoteRow) {
  if (!remoteRow) return draftSite; // producto nuevo, nada que fusionar
  const out = { ...remoteRow };
  const keys = new Set([...Object.keys(draftSite), ...Object.keys(remoteRow), ...Object.keys(baselineSite || {})]);
  keys.forEach(k => {
    const changed = JSON.stringify(draftSite[k]) !== JSON.stringify((baselineSite || {})[k]);
    if (changed) out[k] = draftSite[k];
  });
  Object.keys(out).forEach(k => { if (out[k] === undefined) delete out[k]; });
  return out;
}
function buildMergedCatalog(freshArr, scopeSlugs) {
  let merged = freshArr.map(r => ({ ...r }));
  for (const slug of deletedSlugs) if (!scopeSlugs || scopeSlugs.has(slug)) merged = merged.filter(r => r.slug !== slug);
  for (const [newSlug, oldSlug] of renamedFrom.entries()) {
    if (scopeSlugs && !scopeSlugs.has(newSlug)) continue;
    merged = merged.filter(r => r.slug !== oldSlug);
  }
  const slugsToApply = scopeSlugs || dirtySlugs;
  for (const slug of slugsToApply) {
    const d = workingCatalog.find(p => p.slug === slug);
    if (!d) continue;
    const draftSite = toSiteProduct(d);
    const ownSlug = findOwnBaselineSlug(slug);
    const baselineSite = ownSlug ? baseline.get(ownSlug) : null;
    const remoteRow = ownSlug ? merged.find(r => r.slug === ownSlug) : null;
    const mergedRow = mergeProduct(draftSite, baselineSite, remoteRow);
    const idx = ownSlug ? merged.findIndex(r => r.slug === ownSlug) : -1;
    if (idx >= 0) merged[idx] = mergedRow; else merged.push(mergedRow);
  }
  return merged;
}

/* ============================== PUBLISH PIPELINE ========================== */
async function writeCatalogWithMergeRetry(commitMessage, scopeSlugs) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const fresh = await ghGetFile(CONFIG.paths.catalog);
    const freshArr = fresh ? parseCatalogFile(fresh.text) : [];
    const problems = checkRemoteUniqueness(freshArr, scopeSlugs);
    if (problems.length) { const e = new Error(problems.join(" \n")); e.userFacing = true; throw e; }
    const merged = buildMergedCatalog(freshArr, scopeSlugs);
    try {
      await ghPutOnce(CONFIG.paths.catalog, b64EncodeText(serializeCatalogFile(merged)), commitMessage, fresh ? fresh.sha : undefined);
      return merged;
    } catch (e) {
      if (e.conflict && attempt < 4) { pushStatus(`Choque de versión (intento ${attempt}), reintentando...`); await sleep(backoffMs(attempt)); continue; }
      throw e;
    }
  }
}
async function appendJsonLog(path, newEntries, commitMessage) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const fresh = await ghGetFile(path);
    const arr = fresh ? JSON.parse(fresh.text) : [];
    const merged = arr.concat(newEntries);
    try { await ghPutOnce(path, b64EncodeText(JSON.stringify(merged, null, 2) + "\n"), commitMessage, fresh ? fresh.sha : undefined); return merged; }
    catch (e) { if (e.conflict && attempt < 4) { await sleep(backoffMs(attempt)); continue; } throw e; }
  }
}
async function mergeFlatMap(path, updates, deletions, commitMessage) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const fresh = await ghGetFile(path);
    const map = fresh ? JSON.parse(fresh.text) : {};
    Object.assign(map, updates);
    (deletions || []).forEach(k => delete map[k]);
    try { await ghPutOnce(path, b64EncodeText(JSON.stringify(map, null, 2) + "\n"), commitMessage, fresh ? fresh.sha : undefined); return map; }
    catch (e) { if (e.conflict && attempt < 4) { await sleep(backoffMs(attempt)); continue; } throw e; }
  }
}

async function uploadPendingPhotos(scopeSlugs, statusLines) {
  const slugs = scopeSlugs || dirtySlugs;
  for (const slug of slugs) {
    const d = workingCatalog.find(p => p.slug === slug);
    if (!d || !d.imgs) continue;
    for (const path of d.imgs) {
      if (!pendingUploads.has(path)) continue;
      pushStatus(`Subiendo foto ${path.split("/").pop()}...`);
      const file = pendingUploads.get(path);
      const blob = await compressImageFile(file);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      await ghPutOnce(path, b64EncodeBytes(bytes), `Foto para ${d.n}`, undefined);
      pendingUploads.delete(path);
    }
  }
}

async function regenerateProductPages(merged, scopeSlugs, commitMessage) {
  if (!templateCache) { const t = await ghGetFile(CONFIG.paths.template); templateCache = t ? t.text : null; }
  if (!templateCache) return; // sin plantilla no se puede regenerar (no debería pasar en este repo)
  const catIndex = new Map(STIKE_CATEGORIES.map(c => [c.slug, c]));
  const slugs = scopeSlugs || dirtySlugs;

  const toDelete = new Set();
  for (const slug of deletedSlugs) if (!scopeSlugs || scopeSlugs.has(slug)) toDelete.add(slug);
  for (const [newSlug, oldSlug] of renamedFrom.entries()) if ((!scopeSlugs || scopeSlugs.has(newSlug)) && newSlug !== oldSlug) toDelete.add(oldSlug);
  for (const slug of slugs) {
    const row = merged.find(r => r.slug === slug);
    const ownSlug = findOwnBaselineSlug(slug);
    if ((!row || row.published === false) && ownSlug && baseline.has(ownSlug)) toDelete.add(ownSlug);
  }
  for (const slug of toDelete) await ghDeleteIfExists(`producto/${slug}.html`, commitMessage);

  for (const slug of slugs) {
    const row = merged.find(r => r.slug === slug);
    if (!row || row.published === false) continue;
    const cat = catIndex.get(row.cat);
    const html = PdpRender.renderProductPage(row, templateCache, { categoryName: cat ? cat.name : row.cat });
    const path = `producto/${row.slug}.html`;
    const meta = await ghGetMeta(path);
    await ghPutOnce(path, b64EncodeText(html), commitMessage, meta ? meta.sha : undefined);
  }
}

async function regenerateSitemap(merged, commitMessage) {
  const base = "https://daniel666674.github.io/bmxstore";
  const staticPages = [
    ["", "1.0", "weekly"], ["tienda.html", "0.9", "weekly"], ["armar.html", "0.9", "monthly"],
    ["marcas.html", "0.6", "monthly"], ["nosotros.html", "0.6", "monthly"], ["contacto.html", "0.6", "monthly"],
    ["blog.html", "0.8", "weekly"], ["blog-historia-bmx.html", "0.7", "yearly"],
    ["blog-bmx-bogota.html", "0.7", "yearly"], ["blog-arma-tu-bmx.html", "0.7", "yearly"],
  ];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  staticPages.forEach(([p, pr, cf]) => { xml += `  <url><loc>${base}/${p}</loc><changefreq>${cf}</changefreq><priority>${pr}</priority></url>\n`; });
  merged.filter(p => p.published !== false).forEach(p => { xml += `  <url><loc>${base}/producto/${p.slug}.html</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>\n`; });
  xml += `</urlset>\n`;
  const meta = await ghGetMeta(CONFIG.paths.sitemap);
  await ghPutOnce(CONFIG.paths.sitemap, b64EncodeText(xml), commitMessage, meta ? meta.sha : undefined);
}

let publishing = false;
function setPublishing(v) { publishing = v; $("#btn-publish").disabled = v || (dirtySlugs.size + deletedSlugs.size === 0); $("#btn-refresh").disabled = v; }

/**
 * Publica los cambios pendientes (o, si se pasa scopeSlugs, solo ese subconjunto
 * -- lo usa "Registrar venta" para no arrastrar ediciones de catalogo a medio
 * terminar). Siempre valida el catalogo COMPLETO antes de escribir nada.
 */
async function publishCatalog(opts = {}) {
  const scopeSlugs = opts.scopeSlugs || null;
  if (!dirtySlugs.size && !deletedSlugs.size) { showStatus([{ text: "No hay cambios para publicar.", cls: "muted" }]); return; }
  const errors = validateCatalog(workingCatalog);
  if (errors.length) { renderValidationErrors(errors); return; }
  clearValidationErrors();

  setPublishing(true);
  const lines = [];
  const push = t => { lines.push({ text: t, cls: "now" }); showStatus(lines); };
  window.pushStatus = push; // usado por helpers internos (uploadPendingPhotos, retry loop)

  const touchedSlugs = scopeSlugs || new Set([...dirtySlugs, ...deletedSlugs]);
  const created = [...touchedSlugs].filter(s => !findOwnBaselineSlug(s) && !deletedSlugs.has(s)).length;
  const deleted = [...deletedSlugs].filter(s => !scopeSlugs || scopeSlugs.has(s)).length;
  const edited = touchedSlugs.size - created - deleted;
  const photosCount = [...pendingUploads.keys()].filter(p => {
    const owner = workingCatalog.find(x => x.imgs && x.imgs.includes(p));
    return owner && (!scopeSlugs || scopeSlugs.has(owner.slug));
  }).length;
  const summary = opts.auditNote || `${created} creado(s), ${edited} editado(s), ${deleted} eliminado(s), ${photosCount} foto(s)`;

  try {
    push("Subiendo fotos nuevas...");
    await uploadPendingPhotos(scopeSlugs, lines);

    push("Fusionando catálogo con la versión más reciente...");
    const merged = await writeCatalogWithMergeRetry(summary, scopeSlugs);

    push("Regenerando fichas de producto...");
    await regenerateProductPages(merged, scopeSlugs, summary);

    push("Actualizando sitemap...");
    await regenerateSitemap(merged, summary);

    push("Guardando costos internos...");
    const costUpdates = {}; const costDeletions = [];
    for (const slug of touchedSlugs) {
      const d = workingCatalog.find(p => p.slug === slug);
      if (deletedSlugs.has(slug) && (!scopeSlugs || scopeSlugs.has(slug))) costDeletions.push(slug);
      else if (d) {
        costUpdates[d.slug] = d.cost || 0;
        const oldSlug = renamedFrom.get(d.slug); // producto renombrado esta sesion: limpia la entrada del slug anterior
        if (oldSlug && oldSlug !== d.slug) costDeletions.push(oldSlug);
      }
    }
    costsMap = await mergeFlatMap(CONFIG.paths.costs, costUpdates, costDeletions, summary);

    push("Escribiendo auditoría...");
    auditLog = await appendJsonLog(CONFIG.paths.auditLog, [{
      ts: new Date().toISOString(), admin: session.email, summary,
      created, edited, deleted, photos: photosCount,
    }], summary);

    // limpiar estado de sesion solo para lo publicado en este scope
    const processedDeletions = scopeSlugs ? [...deletedSlugs].filter(s => scopeSlugs.has(s)) : [...deletedSlugs];
    for (const slug of touchedSlugs) { dirtySlugs.delete(slug); renamedFrom.delete(slug); }
    processedDeletions.forEach(s => deletedSlugs.delete(s));

    // refrescar baseline con el estado recien publicado; borra las entradas de
    // lo eliminado para que un producto NUEVO que reuse ese mismo slug mas
    // tarde en la sesion no herede por error el baseline del que ya no existe.
    merged.forEach(r => baseline.set(r.slug, JSON.parse(JSON.stringify(r))));
    processedDeletions.forEach(s => baseline.delete(s));

    push("✔ Publicado.");
    lines[lines.length - 1].cls = "ok";
    showStatus(lines);
    updateDirtyUI();
    renderProductTable();
    renderAudit();
  } catch (e) {
    lines.push({ text: (e.userFacing ? e.message : "Error: " + e.message), cls: "bad" });
    showStatus(lines);
    console.error(e);
  } finally {
    setPublishing(false);
  }
}

/* ============================== STATUS TOAST ============================== */
function showStatus(lines) {
  const box = $("#status-box");
  box.innerHTML = lines.map(l => `<div class="line ${l.cls || ""}">${l.text}</div>`).join("");
  box.classList.add("show");
  clearTimeout(showStatus._t);
  if (!publishing) showStatus._t = setTimeout(() => box.classList.remove("show"), 6000);
}
function pushStatus(text) { window.pushStatus ? window.pushStatus(text) : showStatus([{ text, cls: "now" }]); }

function renderValidationErrors(errors) {
  clearValidationErrors();
  const box = document.createElement("div");
  box.className = "errlist"; box.id = "validation-errors";
  box.innerHTML = `<h4>No se puede publicar (${errors.length})</h4><ul>${errors.map(e => `<li>${e}</li>`).join("")}</ul>`;
  $("main").insertBefore(box, $("main").children[1]);
}
function clearValidationErrors() { const el = $("#validation-errors"); if (el) el.remove(); }

/* ============================== SLUG / SKU ================================ */
function slugify(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function isSlugTaken(slug, excludeSlug) { return workingCatalog.some(p => p.slug === slug && p.slug !== excludeSlug); }
function isSkuTaken(sku, excludeSlug) { return workingCatalog.some(p => p.sku === sku && p.slug !== excludeSlug); }
function uniqueSlug(base, excludeSlug) {
  let candidate = base || "producto", n = 2;
  while (isSlugTaken(candidate, excludeSlug)) { candidate = `${base}-${n}`; n++; }
  return candidate;
}
function brandCodeFromCatalog(brand) {
  const existing = workingCatalog.find(p => p.brand === brand && p.sku && p.sku.split("-").length === 3);
  if (existing) return existing.sku.split("-")[1];
  const taken = new Set(workingCatalog.filter(p => p.brand !== brand && p.sku).map(p => p.sku.split("-")[1]));
  return skuBrandCode(brand, taken);
}
function nextSkuSeq(prefix) {
  let max = 0;
  workingCatalog.forEach(p => { if (p.sku && p.sku.startsWith(prefix)) { const n = parseInt(p.sku.slice(prefix.length), 10); if (!isNaN(n)) max = Math.max(max, n); } });
  return String(max + 1).padStart(3, "0");
}
function generateSku(cat, brand) {
  const catCode = SKU_CAT_CODES[cat] || "GEN";
  const brandCode = brandCodeFromCatalog(brand);
  const prefix = `${catCode}-${brandCode}-`;
  return prefix + nextSkuSeq(prefix);
}

/* ============================== PHOTOS ===================================== */
function randomFilename(ext) {
  const id = (crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)));
  return `${id}.${ext}`;
}
function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
function canvasLooksReal(ctx, w, h) {
  const pts = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1], [w >> 1, h >> 1], [w >> 2, h >> 2], [(3 * w / 4) | 0, (3 * h / 4) | 0], [(w / 3) | 0, (2 * h / 3) | 0]];
  let first = null;
  for (const [x, y] of pts) {
    const d = ctx.getImageData(Math.min(Math.max(x, 0), w - 1), Math.min(Math.max(y, 0), h - 1), 1, 1).data;
    const key = d[0] + "," + d[1] + "," + d[2];
    if (first === null) first = key; else if (key !== first) return true;
  }
  return false;
}
/**
 * Comprime SIEMPRE a partir del File original (nunca de un blob ya comprimido),
 * para que la calidad sea consistente sin importar cuanto tiempo lleve abierta
 * la pestaña. Guarda contra drawImage() fallando en silencio en moviles con
 * poca memoria (deja el canvas en blanco pero igual "codifica" un JPEG
 * valido): se muestrea una grilla de pixeles y, si salen todos iguales, se
 * reintenta el dibujo.
 */
async function compressImageFile(file, maxDim = 1600, quality = 0.82) {
  const bitmap = await createImageBitmap(file).catch(() => null);
  const img = bitmap || await loadImageElement(file);
  const srcW = bitmap ? bitmap.width : img.width, srcH = bitmap ? bitmap.height : img.height;
  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale)), h = Math.max(1, Math.round(srcH * scale));
  for (let attempt = 1; attempt <= 3; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap || img, 0, 0, w, h);
    if (!canvasLooksReal(ctx, w, h)) { await sleep(80); continue; }
    const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", quality));
    if (blob) return blob;
  }
  throw new Error("No se pudo procesar la foto (intenta de nuevo o con otra foto)");
}
function previewSrcFor(path) {
  if (pendingUploads.has(path)) {
    const file = pendingUploads.get(path);
    file.__previewUrl = file.__previewUrl || URL.createObjectURL(file);
    return file.__previewUrl;
  }
  return path; // ya publicada: ruta absoluta real (admin.html vive en la raiz del sitio)
}

/* ============================== PRODUCT TABLE ============================== */
function populateCategoryFilter() {
  const sel = $("#p-filter-cat");
  sel.innerHTML = `<option value="">Todas las categorías</option>` + STIKE_CATEGORIES.filter(c => c.slug !== "promo").map(c => `<option value="${c.slug}">${c.name}</option>`).join("");
}
function renderProductTable() {
  const q = ($("#p-search").value || "").toLowerCase().trim();
  const catFilter = $("#p-filter-cat").value;
  const lowOnly = $("#p-filter-low").checked;
  const rows = workingCatalog
    .filter(p => !q || `${p.n} ${p.brand} ${p.sku} ${p.sub || ""}`.toLowerCase().includes(q))
    .filter(p => !catFilter || p.cat === catFilter)
    .filter(p => !lowOnly || stikeTotalStock(p) <= STIKE_LOW_STOCK_ADMIN)
    .map(p => {
      const total = stikeTotalStock(p);
      const out = total <= 0;
      const low = !out && total <= STIKE_LOW_STOCK_ADMIN;
      const statusPill = !p.published ? `<span class="pill">Borrador</span>`
        : out ? `<span class="pill out dot">Agotado</span>`
        : low ? `<span class="pill low dot">Bajo (${total})</span>`
        : `<span class="pill dot" style="color:var(--good)">OK</span>`;
      const dirty = dirtySlugs.has(p.slug) ? `<span class="pill dirty">sin publicar</span>` : "";
      const img = (p.imgs && p.imgs[0]) ? previewSrcFor(p.imgs[0]) : stikeProductImage(p, 80);
      return `<tr data-slug="${p.slug}">
        <td><div class="imgcell"><img src="${img}" loading="lazy" alt=""></div></td>
        <td><b>${p.n}</b><div class="muted" style="font-size:11.5px">${p.brand}</div></td>
        <td>${p.cat}${p.sub ? " · " + p.sub : ""}</td>
        <td class="mono">${p.sku}</td>
        <td>${money(p.price)}</td>
        <td>${total}</td>
        <td>${statusPill} ${dirty}</td>
        <td><button class="btn ghost sm" data-edit="${p.slug}">Editar</button></td>
      </tr>`;
    }).join("");
  $("#product-tbody").innerHTML = rows || `<tr><td colspan="8" class="muted" style="padding:20px;text-align:center">Sin resultados.</td></tr>`;
  $$("#product-tbody [data-edit]").forEach(b => b.addEventListener("click", () => openEditor(b.getAttribute("data-edit"))));
  populateSaleProductSelect();
}
const STIKE_LOW_STOCK_ADMIN = 5;

/* ============================== PRODUCT EDITOR ============================== */
function blankProduct() {
  return { slug: "", sku: "", n: "", brand: STIKE_BRANDS[0], cat: STIKE_CATEGORIES[0].slug, sub: "",
    spec: [], price: 0, cost: 0, old: null, promo: false, tag: "", imgs: [], imgColorMap: {},
    imgFit: "auto", imgZoom: 100, imgPos: "center center", published: true, units: 0, sizes: null, colors: null };
}
let editorDraft = null;
let editorIsNew = false;
let editorSlugManual = false;
let editorSkuManual = false;
let editorOriginalSlug = null; // slug que este producto ocupa HOY en workingCatalog (null = nuevo)

function openEditor(slug) {
  const existing = slug ? workingCatalog.find(p => p.slug === slug) : null;
  editorDraft = existing ? JSON.parse(JSON.stringify(existing)) : blankProduct();
  editorIsNew = !existing;
  editorOriginalSlug = existing ? existing.slug : null;
  editorSlugManual = !editorIsNew;
  editorSkuManual = !editorIsNew;
  renderEditor();
  $("#editor-overlay").classList.add("open");
}
function closeEditor() { $("#editor-overlay").classList.remove("open"); editorDraft = null; editorOriginalSlug = null; }

function subsFor(cat) { const c = STIKE_CATEGORIES.find(x => x.slug === cat); return c ? c.subs : []; }

function renderEditor() {
  const d = editorDraft;
  const isOwner = session.role === "owner";
  const catSubs = subsFor(d.cat);
  const sizeCatActive = SIZE_CATEGORIES.has(d.sub);

  $("#editor-drawer").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <h3>${editorIsNew ? "Nuevo producto" : "Editar producto"}</h3>
      <button class="btn ghost sm" id="ed-close">Cerrar ✕</button>
    </div>
    <div class="field"><label>Nombre</label><input id="ed-n" value="${escAttr(d.n)}"></div>
    <div class="row2">
      <div class="field"><label>Marca</label>
        <select id="ed-brand">${STIKE_BRANDS.map(b => `<option ${b === d.brand ? "selected" : ""}>${b}</option>`).join("")}</select>
      </div>
      <div class="field"><label>Categoría</label>
        <select id="ed-cat">${STIKE_CATEGORIES.filter(c => c.slug !== "promo").map(c => `<option value="${c.slug}" ${c.slug === d.cat ? "selected" : ""}>${c.name}</option>`).join("")}</select>
      </div>
    </div>
    <div class="field"><label>Subcategoría</label>
      <select id="ed-sub"><option value="">— ninguna —</option>${catSubs.map(s => `<option ${s === d.sub ? "selected" : ""}>${s}</option>`).join("")}</select>
      <div class="hint" id="ed-sub-hint">${sizeCatActive ? "Esta subcategoría requiere tallas (ver abajo)." : ""}</div>
    </div>
    <div class="row2">
      <div class="field"><label>Slug (URL)</label><input id="ed-slug" value="${escAttr(d.slug)}" class="mono"><div class="err" id="ed-slug-err"></div></div>
      <div class="field"><label>SKU</label><input id="ed-sku" value="${escAttr(d.sku)}" class="mono"><div class="err" id="ed-sku-err"></div></div>
    </div>
    <div class="row2">
      <div class="field"><label>Precio (COP)</label><input id="ed-price" type="number" min="0" step="1000" value="${d.price || 0}"></div>
      ${isOwner ? `<div class="field"><label>Costo interno (COP) <span class="hint">— nunca se publica</span></label><input id="ed-cost" type="number" min="0" step="1000" value="${d.cost || 0}"></div>` : ""}
    </div>
    <div class="row3">
      <div class="field"><label><input type="checkbox" id="ed-promo" ${d.promo ? "checked" : ""}> En promo</label></div>
      <div class="field" id="ed-old-field" style="${d.promo ? "" : "display:none"}"><label>Precio anterior</label><input id="ed-old" type="number" min="0" step="1000" value="${d.old || ""}"></div>
      <div class="field"><label>Etiqueta</label><select id="ed-tag"><option value="">— ninguna —</option><option value="new" ${d.tag === "new" ? "selected" : ""}>Nuevo</option></select></div>
    </div>
    <div class="field"><label><input type="checkbox" id="ed-published" ${d.published !== false ? "checked" : ""}> Publicado (visible en la tienda)</label></div>

    <div class="field"><label>Especificaciones (una por línea, "Clave: valor")</label>
      <textarea id="ed-spec" rows="4">${(d.spec || []).join("\n")}</textarea>
    </div>

    <div class="card" style="padding:14px;margin:16px 0">
      <h4 style="font-size:14px;margin-bottom:8px">Stock</h4>
      <div id="ed-sizes-box"></div>
      <div id="ed-colors-box"></div>
    </div>

    <div class="card" style="padding:14px;margin:16px 0">
      <h4 style="font-size:14px;margin-bottom:8px">Fotos <span class="hint">(la primera es la portada)</span></h4>
      <div class="photogrid" id="ed-photogrid"></div>
      <label class="uploadbox" style="margin-top:10px;display:block">
        + Agregar fotos<input type="file" id="ed-photo-input" accept="image/*" multiple style="display:none">
      </label>
      <div id="ed-cover-crop"></div>
    </div>

    <div style="display:flex;gap:10px;margin-top:18px">
      <button class="btn cyan" id="ed-save">Guardar en el borrador</button>
      ${!editorIsNew ? `<button class="btn bad" id="ed-delete">Eliminar producto</button>` : ""}
    </div>
  `;

  $("#ed-close").addEventListener("click", closeEditor);
  $("#ed-n").addEventListener("input", e => { d.n = e.target.value; if (!editorSlugManual) { $("#ed-slug").value = d.slug = uniqueSlug(slugify(d.n), editorOriginalSlug); validateSlugField(); } });
  $("#ed-brand").addEventListener("change", e => { d.brand = e.target.value; if (editorIsNew && !editorSkuManual) { d.sku = generateSku(d.cat, d.brand); $("#ed-sku").value = d.sku; validateSkuField(); } });
  $("#ed-cat").addEventListener("change", e => { d.cat = e.target.value; d.sub = ""; if (editorIsNew && !editorSkuManual) d.sku = generateSku(d.cat, d.brand); renderEditor(); });
  $("#ed-sub").addEventListener("change", e => { d.sub = e.target.value; renderStockEditor(); $("#ed-sub-hint").textContent = SIZE_CATEGORIES.has(d.sub) ? "Esta subcategoría requiere tallas (ver abajo)." : ""; });
  $("#ed-slug").addEventListener("input", e => { editorSlugManual = true; d.slug = slugify(e.target.value); e.target.value = d.slug; validateSlugField(); });
  $("#ed-sku").addEventListener("input", e => { editorSkuManual = true; d.sku = e.target.value.toUpperCase(); e.target.value = d.sku; validateSkuField(); });
  $("#ed-price").addEventListener("input", e => { d.price = parseInt(e.target.value) || 0; });
  if (isOwner) $("#ed-cost").addEventListener("input", e => { d.cost = parseInt(e.target.value) || 0; });
  $("#ed-promo").addEventListener("change", e => { d.promo = e.target.checked; $("#ed-old-field").style.display = d.promo ? "" : "none"; });
  $("#ed-old").addEventListener("input", e => { d.old = parseInt(e.target.value) || null; });
  $("#ed-tag").addEventListener("change", e => { d.tag = e.target.value; });
  $("#ed-published").addEventListener("change", e => { d.published = e.target.checked; });
  $("#ed-spec").addEventListener("input", e => { d.spec = e.target.value.split("\n").map(s => s.trim()).filter(Boolean); });

  if (editorIsNew && !d.slug) { d.slug = uniqueSlug(slugify(d.n || "producto"), editorOriginalSlug); $("#ed-slug").value = d.slug; }
  if (editorIsNew && !d.sku) { d.sku = generateSku(d.cat, d.brand); $("#ed-sku").value = d.sku; }

  $("#ed-photo-input").addEventListener("change", e => { addPhotosToDraft(Array.from(e.target.files || [])); e.target.value = ""; });
  $("#ed-save").addEventListener("click", saveEditorDraft);
  const delBtn = $("#ed-delete"); if (delBtn) delBtn.addEventListener("click", deleteFromEditor);

  renderStockEditor();
  renderPhotoGrid();
  validateSlugField();
  validateSkuField();
}

function escAttr(s) { return String(s == null ? "" : s).replace(/"/g, "&quot;"); }
function validateSlugField() {
  const taken = editorDraft.slug && isSlugTaken(editorDraft.slug, editorOriginalSlug);
  $("#ed-slug-err").textContent = editorDraft.slug ? (taken ? "Ese slug ya lo usa otro producto en tu catálogo local." : "") : "El slug es obligatorio.";
  return !taken && !!editorDraft.slug;
}
function validateSkuField() {
  const taken = editorDraft.sku && isSkuTaken(editorDraft.sku, editorOriginalSlug);
  $("#ed-sku-err").textContent = editorDraft.sku ? (taken ? "Ese SKU ya lo usa otro producto en tu catálogo local." : "") : "El SKU es obligatorio.";
  return !taken && !!editorDraft.sku;
}

/* ---- Tallas y colores: pools de stock INDEPENDIENTES (ver stikeStockFor) ---- */
function renderStockEditor() {
  const d = editorDraft;
  const sizeRequired = SIZE_CATEGORIES.has(d.sub);

  // ---- tallas ----
  if (sizeRequired) {
    if (!d.sizes || !d.sizes.length) {
      const range = stikeSizeRangeFor(d.sub) || ["Única"];
      d.sizes = range.map(v => ({ v, u: 0 }));
    }
    $("#ed-sizes-box").innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:12.5px;text-transform:uppercase;color:var(--muted)">Tallas (obligatorio en "${d.sub}")</b>
      <button class="btn ghost sm" id="ed-size-add" type="button">+ talla</button></div>
      <table class="stockTable"><tbody>${d.sizes.map((s, i) => `
        <tr><td style="width:40%"><input data-size-v="${i}" value="${escAttr(s.v)}"></td>
        <td><input data-size-u="${i}" type="number" min="0" value="${s.u}"></td>
        <td style="width:30px"><button class="btn ghost sm" data-size-rm="${i}" type="button">✕</button></td></tr>`).join("")}</tbody></table>`;
    $("#ed-size-add").addEventListener("click", () => { d.sizes.push({ v: "Nueva", u: 0 }); renderStockEditor(); });
    $$("#ed-sizes-box [data-size-v]").forEach(inp => inp.addEventListener("input", e => { d.sizes[+e.target.getAttribute("data-size-v")].v = e.target.value; }));
    $$("#ed-sizes-box [data-size-u]").forEach(inp => inp.addEventListener("input", e => { d.sizes[+e.target.getAttribute("data-size-u")].u = Math.max(0, parseInt(e.target.value) || 0); }));
    $$("#ed-sizes-box [data-size-rm]").forEach(btn => btn.addEventListener("click", () => { d.sizes.splice(+btn.getAttribute("data-size-rm"), 1); renderStockEditor(); }));
  } else {
    d.sizes = null;
    $("#ed-sizes-box").innerHTML = "";
  }

  // ---- colores: disponibles en cualquier categoría cuando hay 2+ colores reales ----
  const hasColors = !!(d.colors && d.colors.length);
  $("#ed-colors-box").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:${sizeRequired ? "14px" : "0"}">
      <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="ed-has-colors" ${hasColors ? "checked" : ""}> Este producto viene en varios colores</label>
    </div>
    <div id="ed-colors-table" style="${hasColors ? "" : "display:none"}">
      <table class="stockTable"><tbody>${(d.colors || []).map((c, i) => `
        <tr><td style="width:40%"><input data-color-v="${i}" value="${escAttr(c.v)}"></td>
        <td><input data-color-u="${i}" type="number" min="0" value="${c.u}"></td>
        <td style="width:30px"><button class="btn ghost sm" data-color-rm="${i}" type="button">✕</button></td></tr>`).join("")}</tbody></table>
      <button class="btn ghost sm" id="ed-color-add" type="button">+ color</button>
    </div>
    ${!sizeRequired ? `<div class="field" id="ed-units-field" style="margin-top:12px;${hasColors ? "display:none" : ""}"><label>Unidades</label><input id="ed-units" type="number" min="0" value="${d.units || 0}"></div>` : ""}
  `;
  $("#ed-has-colors").addEventListener("change", e => {
    if (e.target.checked) { if (!d.colors || !d.colors.length) d.colors = [{ v: "Negro", u: 0 }, { v: "Color 2", u: 0 }]; }
    else { d.colors = null; }
    renderStockEditor();
  });
  const addColorBtn = $("#ed-color-add"); if (addColorBtn) addColorBtn.addEventListener("click", () => { d.colors.push({ v: "Nuevo color", u: 0 }); renderStockEditor(); renderPhotoGrid(); });
  $$("#ed-colors-table [data-color-v]").forEach(inp => inp.addEventListener("input", e => { d.colors[+e.target.getAttribute("data-color-v")].v = e.target.value; renderPhotoGrid(); }));
  $$("#ed-colors-table [data-color-u]").forEach(inp => inp.addEventListener("input", e => { d.colors[+e.target.getAttribute("data-color-u")].u = Math.max(0, parseInt(e.target.value) || 0); }));
  $$("#ed-colors-table [data-color-rm]").forEach(btn => btn.addEventListener("click", () => { d.colors.splice(+btn.getAttribute("data-color-rm"), 1); if (d.colors.length < 2) d.colors = null; renderStockEditor(); renderPhotoGrid(); }));
  const unitsInp = $("#ed-units"); if (unitsInp) unitsInp.addEventListener("input", e => { d.units = Math.max(0, parseInt(e.target.value) || 0); });
}

/* ---- Fotos: nombre aleatorio (nunca por posicion), reorden, portada, tag de color ---- */
function addPhotosToDraft(files) {
  const d = editorDraft;
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const ext = file.type === "image/png" ? "png" : "jpg";
    const path = `assets/img/products/${randomFilename(ext)}`;
    pendingUploads.set(path, file);
    d.imgs = d.imgs || [];
    d.imgs.push(path);
  }
  renderPhotoGrid();
}
function renderPhotoGrid() {
  const d = editorDraft;
  const imgs = d.imgs || [];
  const colorOpts = (d.colors || []).map(c => c.v);
  $("#ed-photogrid").innerHTML = imgs.map((path, i) => `
    <div class="pthumb ${i === 0 ? "cover" : ""}" draggable="true" data-idx="${i}">
      ${i === 0 ? `<span class="cov-badge">Portada</span>` : ""}
      <img src="${previewSrcFor(path)}" alt="">
      <button class="rm" type="button" data-rm-photo="${i}" title="Quitar">✕</button>
      ${colorOpts.length ? `<select data-photo-color="${i}">
        <option value="">— color —</option>
        ${colorOpts.map(c => `<option value="${escAttr(c)}" ${d.imgColorMap && d.imgColorMap[path] === c ? "selected" : ""}>${c}</option>`).join("")}
      </select>` : ""}
    </div>`).join("") || `<p class="muted" style="grid-column:1/-1;font-size:12.5px">Sin fotos todavía — se usará un placeholder genérico.</p>`;

  $$("#ed-photogrid [data-rm-photo]").forEach(b => b.addEventListener("click", () => {
    const i = +b.getAttribute("data-rm-photo");
    const [removed] = d.imgs.splice(i, 1);
    if (pendingUploads.has(removed)) pendingUploads.delete(removed); // nunca se llegó a subir, se libera el nombre reservado
    if (d.imgColorMap) delete d.imgColorMap[removed];
    renderPhotoGrid();
  }));
  $$("#ed-photogrid [data-photo-color]").forEach(sel => sel.addEventListener("change", e => {
    const i = +e.target.getAttribute("data-photo-color");
    const path = d.imgs[i];
    d.imgColorMap = d.imgColorMap || {};
    if (e.target.value) d.imgColorMap[path] = e.target.value; else delete d.imgColorMap[path];
  }));
  $$("#ed-photogrid .pthumb").forEach(el => {
    el.addEventListener("dragstart", e => { e.dataTransfer.setData("text/plain", el.getAttribute("data-idx")); });
    el.addEventListener("dragover", e => { e.preventDefault(); el.classList.add("dragover"); });
    el.addEventListener("dragleave", () => el.classList.remove("dragover"));
    el.addEventListener("drop", e => {
      e.preventDefault(); el.classList.remove("dragover");
      const from = +e.dataTransfer.getData("text/plain"), to = +el.getAttribute("data-idx");
      if (from === to || isNaN(from)) return;
      const [moved] = d.imgs.splice(from, 1);
      d.imgs.splice(to, 0, moved);
      renderPhotoGrid();
    });
  });

  renderCoverCrop();
}
const CROP_POSITIONS = ["top left", "top center", "top right", "center left", "center center", "center right", "bottom left", "bottom center", "bottom right"];
function renderCoverCrop() {
  const d = editorDraft;
  const box = $("#ed-cover-crop");
  if (!d.imgs || !d.imgs.length) { box.innerHTML = ""; return; }
  const cover = d.imgs[0];
  const zoom = d.imgZoom || 100, pos = d.imgPos || "center center";
  box.innerHTML = `
    <h4 style="font-size:12.5px;text-transform:uppercase;color:var(--muted);margin:14px 0 8px">Encuadre de portada</h4>
    <div class="cropbox">
      <div style="width:110px;height:110px;border-radius:10px;overflow:hidden;border:1px solid var(--line);background:#f3f3f3">
        <img id="crop-preview" src="${previewSrcFor(cover)}" style="width:100%;height:100%;object-fit:cover;object-position:${pos};transform:scale(${zoom / 100})">
      </div>
      <div>
        <label class="hint">Zoom ${zoom}%</label>
        <input type="range" id="crop-zoom" min="100" max="200" value="${zoom}" style="width:160px;display:block">
        <div class="crop-grid" id="crop-grid" style="margin-top:8px">
          ${CROP_POSITIONS.map(p => `<button type="button" data-pos="${p}" class="${p === pos ? "active" : ""}" title="${p}"></button>`).join("")}
        </div>
      </div>
    </div>`;
  $("#crop-zoom").addEventListener("input", e => { d.imgZoom = parseInt(e.target.value); const img = $("#crop-preview"); if (img) img.style.transform = `scale(${d.imgZoom / 100})`; box.querySelector("label.hint").textContent = `Zoom ${d.imgZoom}%`; });
  $$("#crop-grid button").forEach(b => b.addEventListener("click", () => {
    d.imgPos = b.getAttribute("data-pos");
    $$("#crop-grid button").forEach(o => o.classList.remove("active"));
    b.classList.add("active");
    const img = $("#crop-preview"); if (img) img.style.objectPosition = d.imgPos;
  }));
}

function saveEditorDraft() {
  const d = editorDraft;
  const slugOk = validateSlugField(), skuOk = validateSkuField();
  if (!d.n) { alert("Falta el nombre del producto."); return; }
  if (!slugOk || !skuOk) { alert("Revisa slug/SKU antes de guardar."); return; }
  if (SIZE_CATEGORIES.has(d.sub) && (!d.sizes || !d.sizes.length)) { alert(`"${d.sub}" requiere al menos una talla.`); return; }
  if (d.colors && d.colors.length === 1) { alert("Si activas colores necesitas 2 o más."); return; }

  const idx = editorOriginalSlug ? workingCatalog.findIndex(p => p.slug === editorOriginalSlug) : -1;
  if (idx >= 0) workingCatalog[idx] = d; else workingCatalog.push(d);
  if (editorOriginalSlug && editorOriginalSlug !== d.slug) {
    // renamedFrom siempre apunta directo al slug remoto real (nunca encadena
    // renombres dentro de la misma sesion) para que findOwnBaselineSlug sea
    // un solo salto.
    const trueBaseline = findOwnBaselineSlug(editorOriginalSlug);
    renamedFrom.delete(editorOriginalSlug);
    if (trueBaseline) renamedFrom.set(d.slug, trueBaseline);
    dirtySlugs.delete(editorOriginalSlug);
  }
  markDirty(d.slug);
  closeEditor();
  renderProductTable();
}
function deleteFromEditor() {
  const d = editorDraft;
  if (!confirm(`¿Eliminar "${d.n}"? Se quitará de la tienda al publicar.`)) return;
  // El slug remoto a borrar es el de la ULTIMA version publicada de este
  // producto, no necesariamente el que se ve ahora mismo si esta sesion ya
  // le habia cambiado el slug (ver renamedFrom).
  const ownSlug = findOwnBaselineSlug(editorOriginalSlug);
  workingCatalog = workingCatalog.filter(p => p.slug !== editorOriginalSlug);
  if (ownSlug) deletedSlugs.add(ownSlug); // si es null, era un producto nuevo de esta sesion: no llego a publicarse, no hay nada que borrar remoto
  dirtySlugs.delete(editorOriginalSlug);
  dirtySlugs.delete(d.slug);
  renamedFrom.delete(editorOriginalSlug);
  closeEditor();
  updateDirtyUI();
  renderProductTable();
}

/* ============================== VENTAS ===================================== */
function populateSaleProductSelect() {
  const sel = $("#sale-product");
  const prev = sel.value;
  sel.innerHTML = workingCatalog.filter(p => p.published !== false).map(p => `<option value="${p.slug}">${p.n} (${p.sku})</option>`).join("");
  if (prev && workingCatalog.some(p => p.slug === prev)) sel.value = prev;
  onSaleProductChange();
}
function onSaleProductChange() {
  const p = workingCatalog.find(x => x.slug === $("#sale-product").value);
  $("#sale-price").value = p ? p.price : "";
  const sizeField = $("#sale-size-field"), colorField = $("#sale-color-field");
  sizeField.style.display = p && p.sizes ? "" : "none";
  colorField.style.display = p && p.colors ? "" : "none";
  if (p && p.sizes) $("#sale-size").innerHTML = p.sizes.map(s => `<option value="${escAttr(s.v)}" ${s.u <= 0 ? "disabled" : ""}>${s.v} (${s.u} disp.)</option>`).join("");
  if (p && p.colors) $("#sale-color").innerHTML = p.colors.map(c => `<option value="${escAttr(c.v)}" ${c.u <= 0 ? "disabled" : ""}>${c.v} (${c.u} disp.)</option>`).join("");
  updateSaleStockHint();
}
function updateSaleStockHint() {
  const p = workingCatalog.find(x => x.slug === $("#sale-product").value);
  if (!p) { $("#sale-stock-hint").textContent = ""; return; }
  const size = p.sizes ? $("#sale-size").value : undefined;
  const color = p.colors ? $("#sale-color").value : undefined;
  const stock = stikeStockFor(p, size, color);
  $("#sale-stock-hint").textContent = stock == null ? "Elige talla/color para ver el stock disponible." : `Stock disponible para esa combinación: ${stock}`;
}
async function registrarVenta() {
  const p = workingCatalog.find(x => x.slug === $("#sale-product").value);
  if (!p) return;
  const size = p.sizes ? $("#sale-size").value : null;
  const color = p.colors ? $("#sale-color").value : null;
  const qty = Math.max(1, parseInt($("#sale-qty").value) || 1);
  const unitPrice = Math.max(0, parseInt($("#sale-price").value) || p.price);
  const stock = stikeStockFor(p, size, color);
  if (stock != null && qty > stock) { alert(`Solo hay ${stock} unidades disponibles para esa combinación.`); return; }

  if (p.sizes && size) { const row = p.sizes.find(s => s.v === size); row.u = Math.max(0, row.u - qty); }
  if (p.colors && color) { const row = p.colors.find(c => c.v === color); row.u = Math.max(0, row.u - qty); }
  if (!p.sizes && !p.colors) p.units = Math.max(0, (p.units || 0) - qty);
  markDirty(p.slug);

  const entry = { ts: new Date().toISOString(), slug: p.slug, name: p.n, size: size || null, color: color || null, qty, unitPrice, total: unitPrice * qty, admin: session.email };
  setPublishing(true);
  try {
    salesLog = await appendJsonLog(CONFIG.paths.salesLog, [entry], `Venta: ${qty}x ${p.n}`);
    // Publica SOLO el stock de este producto (no arrastra otras ediciones a medio terminar).
    await publishCatalog({ scopeSlugs: new Set([p.slug]), auditNote: `Venta registrada: ${qty}x ${p.n}` });
  } catch (e) {
    showStatus([{ text: "Error registrando venta: " + e.message, cls: "bad" }]);
    setPublishing(false);
  }
  renderSalesTab();
  renderKpis();
  renderProductTable();
}
function renderSalesTab() {
  populateSaleProductSelect();
  $("#sales-tbody").innerHTML = salesLog.slice().reverse().slice(0, 200).map(s => `
    <tr><td>${new Date(s.ts).toLocaleString("es-CO")}</td><td>${s.name || s.slug}</td>
    <td>${[s.size, s.color].filter(Boolean).join(" / ") || "—"}</td><td>${s.qty}</td><td>${money(s.total)}</td><td>${s.admin || ""}</td></tr>`).join("")
    || `<tr><td colspan="6" class="muted" style="padding:16px;text-align:center">Sin ventas registradas.</td></tr>`;
}

/* ============================== KPIs ======================================== */
function renderKpis() {
  const isOwner = session.role === "owner";
  const last30 = salesLog.filter(s => (Date.now() - new Date(s.ts).getTime()) <= 30 * 864e5);
  const revenue = last30.reduce((sum, s) => sum + s.total, 0);
  const units = last30.reduce((sum, s) => sum + s.qty, 0);
  const lowStock = workingCatalog.filter(p => { const t = stikeTotalStock(p); return t <= STIKE_LOW_STOCK_ADMIN; }).length;
  let margin = "—";
  if (isOwner) {
    const cogs = last30.reduce((sum, s) => { const p = workingCatalog.find(x => x.slug === s.slug); return sum + (p ? (p.cost || 0) * s.qty : 0); }, 0);
    margin = revenue > 0 ? Math.round(((revenue - cogs) / revenue) * 100) + "%" : "—";
  }
  $("#kpi-cards").innerHTML = `
    <div class="kpi"><div class="n">${money(revenue)}</div><div class="l">Ingresos (30d)</div></div>
    <div class="kpi"><div class="n">${units}</div><div class="l">Unidades vendidas (30d)</div></div>
    <div class="kpi"><div class="n">${lowStock}</div><div class="l">Bajo stock / agotados</div></div>
    <div class="kpi"><div class="n">${isOwner ? margin : "🔒"}</div><div class="l">Margen (30d)</div></div>`;

  // Serie diaria (30 dias)
  const days = [];
  for (let i = 29; i >= 0; i--) { const d = new Date(Date.now() - i * 864e5); days.push(d.toISOString().slice(0, 10)); }
  const byDay = Object.fromEntries(days.map(d => [d, 0]));
  last30.forEach(s => { const k = s.ts.slice(0, 10); if (k in byDay) byDay[k] += s.total; });
  const values = days.map(d => byDay[d]);
  const max = Math.max(1, ...values);
  const W = 600, H = 160, pad = 8;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2);
    const y = H - pad - (v / max) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const svg = $("#kpi-chart");
  svg.innerHTML = `
    <polyline points="${pts}" fill="none" stroke="#33e0ff" stroke-width="2"/>
    <polyline points="${pad},${H - pad} ${pts} ${W - pad},${H - pad}" fill="#33e0ff22" stroke="none"/>
    <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="#232327"/>`;

  // Top productos (por ingresos, ultimos 30d)
  const bySlug = {};
  last30.forEach(s => { bySlug[s.slug] = bySlug[s.slug] || { name: s.name || s.slug, units: 0, revenue: 0 }; bySlug[s.slug].units += s.qty; bySlug[s.slug].revenue += s.total; });
  const top = Object.values(bySlug).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  $("#top-products-tbody").innerHTML = top.map(t => `<tr><td>${t.name}</td><td>${t.units}</td><td>${money(t.revenue)}</td></tr>`).join("")
    || `<tr><td colspan="3" class="muted" style="padding:16px;text-align:center">Sin ventas en los últimos 30 días.</td></tr>`;
}

/* ============================== AUDITORÍA =================================== */
function renderAudit() {
  $("#audit-tbody").innerHTML = auditLog.slice().reverse().slice(0, 100).map(a => `
    <tr><td>${new Date(a.ts).toLocaleString("es-CO")}</td><td>${a.admin}</td><td>${a.summary}</td></tr>`).join("")
    || `<tr><td colspan="3" class="muted" style="padding:16px;text-align:center">Sin publicaciones todavía.</td></tr>`;
}

/* ============================== BULK PRICE ================================== */
function bulkPriceAdjust() {
  const catFilter = $("#p-filter-cat").value;
  const pct = prompt(`Ajustar precio ${catFilter ? "de " + catFilter : "de TODO el catálogo"} en % (ej: 10 para +10%, -5 para -5%):`);
  if (pct === null || pct.trim() === "") return;
  const factor = 1 + (parseFloat(pct) / 100 || 0);
  if (!confirm(`¿Aplicar ${pct}% a ${catFilter ? catFilter : "todos los productos"}? Esto se agrega a tus cambios sin publicar.`)) return;
  workingCatalog.forEach(p => {
    if (catFilter && p.cat !== catFilter) return;
    p.price = Math.max(0, Math.round((p.price * factor) / 100) * 100);
    markDirty(p.slug);
  });
  renderProductTable();
}

/* ============================== CSV / JSON =================================== */
function downloadFile(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function toCSV(rows) {
  const headers = ["slug", "sku", "n", "brand", "cat", "sub", "price", "cost", "units", "published"];
  const esc = v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
  return [headers.join(",")].concat(rows.map(p => headers.map(h => esc(p[h])).join(","))).join("\n");
}
function exportCSV() { downloadFile("stike-catalogo.csv", toCSV(workingCatalog), "text/csv"); }
function exportJSON() { downloadFile("stike-catalogo.json", JSON.stringify(workingCatalog.map(toSiteProduct), null, 2), "application/json"); }

function parseCSV(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map(h => h.replace(/^"|"$/g, ""));
  return lines.filter(Boolean).map(line => {
    const cells = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
    const row = {};
    headers.forEach((h, i) => { row[h] = (cells[i] || "").replace(/^"|"$/g, "").replace(/""/g, '"'); });
    return row;
  });
}
async function importFile(file) {
  const text = await file.text();
  let rows;
  try { rows = file.name.endsWith(".json") ? JSON.parse(text) : parseCSV(text); }
  catch (e) { alert("No se pudo leer el archivo: " + e.message); return; }
  let created = 0, updated = 0;
  rows.forEach(row => {
    const slug = row.slug || uniqueSlug(slugify(row.n || row.slug || "producto"), null);
    const existing = workingCatalog.find(p => p.slug === slug);
    const merged = existing ? { ...existing } : blankProduct();
    ["n", "brand", "cat", "sub"].forEach(k => { if (row[k] !== undefined && row[k] !== "") merged[k] = row[k]; });
    ["price", "cost", "units"].forEach(k => { if (row[k] !== undefined && row[k] !== "") merged[k] = parseInt(row[k]) || 0; });
    if (row.sku) merged.sku = row.sku;
    merged.slug = slug;
    if (row.published !== undefined) merged.published = String(row.published) !== "false" && row.published !== false;
    if (!merged.sku) merged.sku = generateSku(merged.cat, merged.brand);
    if (existing) { Object.assign(existing, merged); updated++; } else { workingCatalog.push(merged); created++; }
    markDirty(slug);
  });
  renderProductTable();
  showStatus([{ text: `Importados: ${created} nuevos, ${updated} actualizados (sin publicar aún).`, cls: "ok" }]);
}

/* ============================== CONTENIDO DEL SITIO =========================== */
const CONTENT_FIELDS = [
  { key: "home.heroTitle", label: "Home · Título del hero" },
  { key: "home.heroSubtitle", label: "Home · Subtítulo del hero" },
  { key: "home.featuredTitle", label: "Home · Título sección destacados" },
  { key: "home.promoTitle", label: "Home · Título sección promo" },
  { key: "cat.repuestos.title", label: "Repuestos · Título de categoría" },
  { key: "cat.repuestos.subtitle", label: "Repuestos · Subtítulo" },
  { key: "cat.protecciones.title", label: "Protecciones · Título de categoría" },
  { key: "cat.protecciones.subtitle", label: "Protecciones · Subtítulo" },
  { key: "cat.ropa.title", label: "Ropa · Título de categoría" },
  { key: "cat.ropa.subtitle", label: "Ropa · Subtítulo" },
  { key: "cat.accesorios.title", label: "Accesorios · Título de categoría" },
  { key: "cat.accesorios.subtitle", label: "Accesorios · Subtítulo" },
];
function renderContentTab() {
  // "Personalizar" es la señal explícita de intención: si está destildado, la
  // clave NO se escribe (o se borra) y el sitio usa su texto por defecto. Si
  // está tildado, se escribe el valor tal cual (incluso vacío = a propósito
  // en blanco). Sin esto, guardar el formulario sin tocar nada terminaría
  // publicando las 12 claves en blanco y tapando todos los textos por defecto.
  $("#content-fields").innerHTML = CONTENT_FIELDS.map(f => {
    const present = Object.prototype.hasOwnProperty.call(siteContent, f.key);
    return `<div class="field">
      <label><input type="checkbox" class="content-toggle" data-toggle-key="${f.key}" ${present ? "checked" : ""}> ${f.label} <span class="hint">— personalizar</span></label>
      <input data-content-key="${f.key}" value="${escAttr(siteContent[f.key] || "")}" placeholder="(usa el texto por defecto del sitio)" ${present ? "" : "disabled"}>
    </div>`;
  }).join("");
  $$(".content-toggle").forEach(cb => cb.addEventListener("change", () => {
    const inp = document.querySelector(`[data-content-key="${cb.getAttribute("data-toggle-key")}"]`);
    inp.disabled = !cb.checked;
  }));
}
async function saveSiteContent() {
  const updates = {}; const deletions = [];
  $$(".content-toggle").forEach(cb => {
    const key = cb.getAttribute("data-toggle-key");
    const inp = document.querySelector(`[data-content-key="${key}"]`);
    if (cb.checked) updates[key] = inp.value; else deletions.push(key);
  });
  setPublishing(true);
  try {
    siteContent = await mergeFlatMap(CONFIG.paths.siteContent, updates, deletions, "Actualiza textos del sitio");
    showStatus([{ text: "Textos publicados.", cls: "ok" }]);
    auditLog = await appendJsonLog(CONFIG.paths.auditLog, [{ ts: new Date().toISOString(), admin: session.email, summary: "Actualizó textos del sitio (contenido editable)", created: 0, edited: 0, deleted: 0, photos: 0 }], "Actualiza textos del sitio");
    renderAudit();
  } catch (e) { showStatus([{ text: "Error: " + e.message, cls: "bad" }]); }
  setPublishing(false);
}

/* ============================== AUTH GATE ==================================== */
function roleFor(email) { return CONFIG.ownerAllowlist.includes((email || "").toLowerCase().trim()) ? "owner" : "editor"; }

function showApp() {
  $("#gate").style.display = "none";
  $("#app").classList.add("show");
  $("#session-info").innerHTML = `<div>${session.name}</div><div class="mono" style="font-size:11px">${session.email}</div><span class="pill ${session.role}" style="margin-top:6px">${session.role === "owner" ? "Dueño" : "Editor"}</span>`;
  $$(".navbtn[data-panel=kpis], .navbtn[data-panel=auditoria]").forEach(b => b.style.display = session.role === "owner" ? "" : "none");
  $("#cfg-repo").textContent = `${CONFIG.owner}/${CONFIG.repo}`;
  $("#cfg-branch").textContent = CONFIG.branch;
  $("#pat-status").textContent = session.pat ? "Token guardado en este navegador." : "Falta guardar tu token de GitHub (pestaña Configuración) para poder cargar/publicar.";
  if (session.pat) loadAll().catch(e => showStatus([{ text: "Error cargando catálogo: " + e.message, cls: "bad" }]));
  else switchPanel("config");
}

$("#gate-form").addEventListener("submit", e => {
  e.preventDefault();
  const email = $("#g-email").value.trim(), pass = $("#g-pass").value;
  if (pass !== CONFIG.passcode) { $("#gate-err").textContent = "Clave incorrecta."; return; }
  if (!email) { $("#gate-err").textContent = "Falta tu correo."; return; }
  const name = email.split("@")[0];
  session = { name, email, role: roleFor(email), pat: localStorage.getItem("stike_admin_pat") || "" };
  saveSession(session);
  showApp();
});

$("#btn-save-pat").addEventListener("click", () => {
  const v = $("#pat-input").value.trim();
  if (!v) return;
  localStorage.setItem("stike_admin_pat", v);
  session.pat = v;
  $("#pat-input").value = "";
  $("#pat-status").textContent = "Token guardado en este navegador.";
  if (!catalogLoaded) {
    loadAll()
      .then(() => switchPanel("productos"))
      .catch(e => showStatus([{ text: "Error cargando catálogo: " + e.message, cls: "bad" }]));
  }
});
$("#btn-clear-pat").addEventListener("click", () => {
  localStorage.removeItem("stike_admin_pat");
  if (session) session.pat = "";
  $("#pat-status").textContent = "Token borrado.";
});
$("#btn-logout").addEventListener("click", () => {
  sessionStorage.removeItem("stike_admin_session");
  location.reload();
});

/* ============================== NAV / PANELES ================================ */
function switchPanel(name) {
  $$(".navbtn").forEach(b => b.classList.toggle("active", b.getAttribute("data-panel") === name));
  $$(".panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + name));
  const titles = { productos: "Productos", ventas: "Ventas", kpis: "KPIs", auditoria: "Auditoría", contenido: "Contenido del sitio", config: "Configuración" };
  $("#panel-title").textContent = titles[name] || name;
  if (name === "kpis") renderKpis();
  if (name === "auditoria") renderAudit();
}
$$(".navbtn").forEach(b => b.addEventListener("click", () => switchPanel(b.getAttribute("data-panel"))));

/* ============================== WIRING GENERAL ================================ */
$("#btn-refresh").addEventListener("click", () => loadAll().catch(e => showStatus([{ text: "Error: " + e.message, cls: "bad" }])));
$("#btn-publish").addEventListener("click", () => publishCatalog());
$("#btn-new-product").addEventListener("click", () => openEditor(null));
$("#p-search").addEventListener("input", renderProductTable);
$("#p-filter-cat").addEventListener("change", renderProductTable);
$("#p-filter-low").addEventListener("change", renderProductTable);
$("#btn-export-csv").addEventListener("click", exportCSV);
$("#btn-export-json").addEventListener("click", exportJSON);
$("#btn-bulk-price").addEventListener("click", bulkPriceAdjust);
$("#btn-import").addEventListener("click", () => $("#import-file").click());
$("#import-file").addEventListener("change", e => { const f = e.target.files[0]; if (f) importFile(f); e.target.value = ""; });
$("#sale-product").addEventListener("change", onSaleProductChange);
$("#sale-size").addEventListener("change", updateSaleStockHint);
$("#sale-color").addEventListener("change", updateSaleStockHint);
$("#btn-registrar-venta").addEventListener("click", registrarVenta);
$("#btn-save-content").addEventListener("click", saveSiteContent);
$("#editor-overlay").addEventListener("click", e => { if (e.target.id === "editor-overlay") closeEditor(); });

/* ============================== INIT =========================================== */
(function init() {
  populateCategoryFilter();
  session = loadSession();
  if (session && session.email) showApp();
})();

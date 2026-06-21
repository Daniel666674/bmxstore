/* =========================================================================
   STIKE BIKE SHOP — App / UI compartida
   ========================================================================= */

const STIKE_CONFIG = {
  name: "Stike",
  full: "Stike Bike Shop",
  tagline: "BMX · BOGOTÁ",
  whatsapp: "573118108848",
  whatsappPretty: "+57 311 810 8848",
  phone: "+57 311 810 8848",
  email: "hola@stikebikeshop.com",
  address: "Bogotá D.C., Colombia",
  hours: "Lun a Sáb · 10:00 a.m. – 7:00 p.m.",
  ig: "https://www.instagram.com/stikebikeshop?igsh=emVzZXc0NWVlNmcy",
  fb: "https://www.facebook.com/share/1Cz3ezfUvL/?mibextid=wwXIfr",
  tiktok: "https://tiktok.com/@stikebikeshop",
  igHandle: "@stikebikeshop",
  /* --- Datos legales: COMPLETAR con la información real de la empresa --- */
  legalName: "[Razón social — completar]",   // p. ej. "Stike Bike Shop S.A.S."
  nit: "[NIT — completar]",
  legalUpdated: "21 de junio de 2026",
  /* Endpoint para enviar formularios (p. ej. Formspree: https://formspree.io/f/xxxxxxx).
     Si se deja vacío, el formulario de contacto cae a WhatsApp y el boletín solo confirma. */
  formEndpoint: ""
};

const STIKE_BASE = "";

/* ----------------------------- SOCIAL ICONS ----------------------------- */
const SOCICO_IG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect x="2" y="2" width="20" height="20" rx="5" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="5" stroke="white" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="white"/></svg>`;
const SOCICO_FB = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M16 4h-2.5C11.6 4 10 5.6 10 7.5V10H8v3h2v9h3v-9h2.5l.5-3H13V7.5c0-.3.2-.5.5-.5H16V4z"/></svg>`;
const SOCICO_TT = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.49a4.85 4.85 0 01-1-.8z"/></svg>`;
const SOCICO_WA = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.08L2 22l4.92-1.36A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.97 13.47c-.21.59-.96 1.07-1.62 1.21-.43.09-.99.16-2.88-.62-2.43-1-3.96-3.47-4.08-3.63-.12-.17-.99-1.32-.99-2.51 0-1.2.63-1.78.85-2.03.22-.24.48-.3.64-.3h.46c.14 0 .33-.05.51.39.19.46.64 1.57.7 1.68.06.11.1.24.02.39l-.24.37c-.12.13-.25.29-.36.39-.12.1-.24.21-.1.41.14.2.62.91 1.33 1.47.92.73 1.69.96 1.93 1.07.24.1.38.09.52-.06.14-.14.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.38.65 1.62.77.24.12.4.18.46.28.06.1.06.57-.15 1.17z"/></svg>`;

/* ------------------------------ LOGO ----------------------------------- */
/* Real Stike emblem, vector-traced from the brand artwork (white on transparent) */
function stikeLogoSVG(size) {
  size = size || 46;
  return `<img class="logo" src="assets/img/logo-stike.svg" alt="Stike Bike Shop" style="height:${size}px;width:auto" />`;
}

/* ----------------------------- CARRITO --------------------------------- */
const CART_KEY = "stike_cart_v1";

function stikeGetCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function stikeSaveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  stikeUpdateCartBadge();
}
/* Clave única de línea: mismo producto en distinta talla = línea distinta */
function stikeLineKey(item) {
  return item.id + (item.size ? "::" + item.size : "");
}
function stikeAddToCart(id, qty, size) {
  qty = qty || 1;
  size = size || null;
  const cart = stikeGetCart();
  const row = cart.find(r => r.id === id && (r.size || null) === size);
  if (row) row.qty += qty;
  else cart.push(size ? { id, qty, size } : { id, qty });
  stikeSaveCart(cart);
  const p = stikeFindProduct(id);
  stikeToast((p ? p.name : "Producto") + (size ? " (" + size + ")" : "") + " agregado al carrito");
}
/* Actualizar / quitar operan por clave de línea (id o id::talla) */
function stikeUpdateQty(key, qty) {
  const cart = stikeGetCart();
  const row = cart.find(r => stikeLineKey(r) === key);
  if (!row) return;
  row.qty = Math.max(1, qty);
  stikeSaveCart(cart);
}
function stikeRemoveFromCart(key) {
  stikeSaveCart(stikeGetCart().filter(r => stikeLineKey(r) !== key));
}
function stikeCartCount() {
  return stikeGetCart().reduce((n, r) => n + r.qty, 0);
}
function stikeCartTotal() {
  return stikeGetCart().reduce((sum, r) => {
    const p = stikeFindProduct(r.id);
    return sum + (p ? p.price * r.qty : 0);
  }, 0);
}
function stikeUpdateCartBadge() {
  const n = stikeCartCount();
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = n;
    el.style.display = n > 0 ? "grid" : "none";
  });
}

/* ------------------------------ TOAST ---------------------------------- */
let stikeToastTimer;
function stikeToast(msg) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(stikeToastTimer);
  stikeToastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ------------------------- TARJETA DE PRODUCTO ------------------------- */
const STIKE_LOW_STOCK = 5;
function stikeProductCard(p) {
  const badge = p.badge === "promo" ? `<span class="badge promo">Oferta</span>`
              : p.badge === "new" ? `<span class="badge new">Nuevo</span>`
              : p.stock === 0 ? `<span class="badge sold">Agotado</span>` : "";
  const oldPrice = p.old ? `<span class="old">${stikePrice(p.old)}</span>` : "";
  const lowStock = (p.stock > 0 && p.stock <= STIKE_LOW_STOCK)
    ? `<span class="stock-low">Solo ${p.stock} ${p.stock === 1 ? "unidad" : "unidades"}</span>` : "";
  const hasSizes = !!stikeSizesFor(p);
  const cta = p.stock === 0
    ? `<a class="btn cyan sm block" href="producto.html?id=${p.id}">Ver producto</a>`
    : hasSizes
      ? `<a class="btn cyan sm block" href="producto.html?id=${p.id}">Elegir talla</a>`
      : `<button class="btn cyan sm add block" data-add="${p.id}">Agregar al carrito</button>`;
  return `
  <article class="card">
    <div class="thumb">
      ${badge}
      <button class="fav" title="Guardar" aria-label="Guardar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></button>
      <a href="producto.html?id=${p.id}">
        <img src="${stikeProductImage(p, 600)}" alt="${p.name}" loading="lazy">
      </a>
    </div>
    <div class="body">
      <span class="brandline">${p.brand}</span>
      <div class="title"><a href="producto.html?id=${p.id}">${p.name}</a></div>
      <div class="price">${stikePrice(p.price)} ${oldPrice}</div>
      ${lowStock}
      ${cta}
    </div>
  </article>`;
}

/* ----------------------- NAV: dropdown de categoría -------------------- */
function stikeNavDropdown(cat) {
  if (!cat.subs.length) return "";
  if (cat.slug === "repuestos") {
    const items = cat.subs.map(s =>
      `<a href="tienda.html?cat=${cat.slug}&sub=${encodeURIComponent(s)}">${s}</a>`).join("");
    return `<div class="dropdown mega">
      <a href="tienda.html?cat=${cat.slug}" style="grid-column:1/-1" class="col-title">Ver todos los repuestos →</a>
      ${items}
    </div>`;
  }
  const items = cat.subs.map(s =>
    `<a href="tienda.html?cat=${cat.slug}&sub=${encodeURIComponent(s)}">${s}</a>`).join("");
  return `<div class="dropdown">${items}</div>`;
}

/* ------------------------------ HEADER --------------------------------- */
function stikeRenderHeader(active) {
  const C = STIKE_CONFIG;
  const navItems = STIKE_CATEGORIES.map(cat => {
    const isActive = active === cat.slug ? " active" : "";
    const hasMega = cat.subs.length ? " has-mega" : "";
    const accent = cat.slug === "promo" ? ` data-accent="promo"` : "";
    const caret = cat.subs.length ? `<span class="caret"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></span>` : "";
    return `<li class="${isActive}${hasMega}">
      <a href="tienda.html?cat=${cat.slug}"${accent}>${cat.name}${caret}</a>
      ${stikeNavDropdown(cat)}
    </li>`;
  }).join("");

  const header = `
  <div class="topbar">
    <div class="wrap">
      <div class="ticker"><span>ENVÍOS A TODA COLOMBIA &nbsp; ✦ &nbsp; <b>3 CUOTAS SIN INTERÉS</b> &nbsp; ✦ &nbsp; RECOGE EN VENECIA &nbsp; ✦ &nbsp; ARMAMOS TU BMX GRATIS &nbsp; ✦ &nbsp; <b>COMUNIDAD STIKE BOGOTÁ</b></span></div>
      <div class="social">
        <a href="${C.ig}" target="_blank" rel="noopener" class="soc soc-ig soc-sm" title="Instagram" aria-label="Instagram">${SOCICO_IG}</a>
        <a href="${C.fb}" target="_blank" rel="noopener" class="soc soc-fb soc-sm" title="Facebook" aria-label="Facebook">${SOCICO_FB}</a>
        <a href="${C.tiktok}" target="_blank" rel="noopener" class="soc soc-tt soc-sm" title="TikTok" aria-label="TikTok">${SOCICO_TT}</a>
      </div>
    </div>
  </div>
  <header class="site-header">
    <div class="wrap">
      <div class="header-main">
        <a class="brand" href="index.html">
          ${stikeLogoSVG(52)}
          <span class="name">Stike<small>BIKE SHOP · BOGOTÁ</small></span>
        </a>
        <form class="search" onsubmit="stikeDoSearch(event)">
          <input type="search" id="site-search" placeholder="Busca marcos, llantas, cascos, marcas..." onfocus="stikeOpenSearch()" autocomplete="off">
          <button type="button" aria-label="Buscar" onclick="stikeOpenSearch()"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg></button>
        </form>
        <div class="header-actions">
          <button class="icon-btn search-trigger" onclick="stikeOpenSearch()" title="Buscar" aria-label="Buscar"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg></button>
          <a class="icon-btn" href="nosotros.html" title="Nosotros" aria-label="Nosotros"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg></a>
          <a class="icon-btn" href="contacto.html" title="Contacto" aria-label="Contacto"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg></a>
          <a class="icon-btn" href="carrito.html" title="Carrito" aria-label="Carrito">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <span class="cart-count">0</span>
          </a>
          <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="Menú"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg></button>
        </div>
      </div>
    </div>
    <nav class="site-nav" id="site-nav">
      <div class="wrap">
        <ul class="nav-list">
          <li class="${active === 'home' ? 'active' : ''}"><a href="index.html">Inicio</a></li>
          ${navItems}
          <li class="${active === 'marcas' ? 'active' : ''}"><a href="marcas.html">Marcas</a></li>
          <li class="${active === 'blog' ? 'active' : ''}"><a href="blog.html">Blog</a></li>
          <li class="nav-build ${active === 'armar' ? 'active' : ''}"><a href="armar.html"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Arma tu BMX</a></li>
        </ul>
      </div>
    </nav>
  </header>
  <div class="nav-backdrop" id="nav-backdrop"></div>`;

  const mount = document.getElementById("site-header");
  if (mount) mount.innerHTML = header;
  stikeBindHeader();
  stikeUpdateCartBadge();
}

function stikeBindHeader() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("site-nav");
  const backdrop = document.getElementById("nav-backdrop");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      if (backdrop) backdrop.classList.toggle("show");
      document.body.style.overflow = nav.classList.contains("open") ? "hidden" : "";
    });
  }
  if (backdrop) backdrop.addEventListener("click", () => {
    nav.classList.remove("open");
    backdrop.classList.remove("show");
    document.body.style.overflow = "";
  });
  nav && nav.querySelectorAll(".nav-list > li").forEach(li => {
    const caret = li.querySelector(".caret");
    if (!caret) return;
    li.querySelector("a").addEventListener("click", (e) => {
      if (window.innerWidth <= 760 && li.querySelector(".dropdown")) {
        e.preventDefault();
        li.classList.toggle("open-sub");
      }
    });
  });
}

function stikeDoSearch(e) {
  e.preventDefault();
  const q = document.getElementById("site-search").value.trim();
  window.location.href = "tienda.html?q=" + encodeURIComponent(q);
}

/* ------------------------ BUSCADOR EN VIVO (overlay) ------------------- */
function stikeRenderSearchOverlay() {
  if (document.getElementById("search-overlay")) return;
  const el = document.createElement("div");
  el.id = "search-overlay";
  el.className = "search-overlay";
  el.innerHTML = `
    <div class="search-modal" role="dialog" aria-modal="true" aria-label="Buscar en Stike">
      <div class="search-bar">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>
        <input type="search" id="overlay-search" placeholder="Busca productos, marcas, categorías..." autocomplete="off" aria-label="Buscar">
        <button class="search-esc" type="button" onclick="stikeCloseSearch()">ESC</button>
      </div>
      <div class="search-body" id="overlay-results"></div>
    </div>`;
  document.body.appendChild(el);
  el.addEventListener("click", (e) => { if (e.target === el) stikeCloseSearch(); });
  const inp = el.querySelector("#overlay-search");
  inp.addEventListener("input", () => stikeSearchRender(inp.value));
  inp.addEventListener("keydown", stikeSearchKeydown);
}
function stikeSearchRow(p) {
  return `<a class="sr-row" href="producto.html?id=${p.id}">
    <span class="sr-thumb"><img src="${stikeProductImage(p, 120)}" alt="" loading="lazy"></span>
    <span class="sr-meta"><span class="sr-name">${p.name}</span><span class="sr-brand">${p.brand}</span></span>
    <span class="sr-price">${stikePrice(p.price)}</span>
  </a>`;
}
function stikeSearchRender(q) {
  const box = document.getElementById("overlay-results");
  if (!box) return;
  q = (q || "").trim().toLowerCase();
  if (!q) {
    const cats = STIKE_CATEGORIES.map(c => `<a class="sr-chip" href="tienda.html?cat=${c.slug}">${c.name}</a>`).join("");
    const pop = STIKE_PRODUCTS.slice(0, 4).map(stikeSearchRow).join("");
    box.innerHTML = `<div class="sr-section"><div class="sr-head">Explora</div><div class="sr-chips">${cats}</div></div>
      <div class="sr-section"><div class="sr-head">Destacados</div>${pop}</div>`;
    return;
  }
  const prods = STIKE_PRODUCTS.filter(p =>
    (p.name + " " + p.brand + " " + (p.sub || "") + " " + p.cat).toLowerCase().includes(q)).slice(0, 7);
  const brands = STIKE_BRANDS.filter(b => b.toLowerCase().includes(q)).slice(0, 4);
  const cats = STIKE_CATEGORIES.filter(c => c.name.toLowerCase().includes(q));
  let html = "";
  if (cats.length || brands.length) {
    html += `<div class="sr-section"><div class="sr-head">Sugerencias</div><div class="sr-chips">` +
      cats.map(c => `<a class="sr-chip" href="tienda.html?cat=${c.slug}">${c.name}</a>`).join("") +
      brands.map(b => `<a class="sr-chip" href="tienda.html?brand=${encodeURIComponent(b)}">${b}</a>`).join("") +
      `</div></div>`;
  }
  if (prods.length) {
    html += `<div class="sr-section"><div class="sr-head">Productos</div>${prods.map(stikeSearchRow).join("")}</div>`;
    html += `<a class="sr-all" href="tienda.html?q=${encodeURIComponent(q)}">Ver todos los resultados de “${q}” →</a>`;
  } else if (!cats.length && !brands.length) {
    html = `<div class="sr-empty">Sin resultados para “${q}”.<br><a href="tienda.html?q=${encodeURIComponent(q)}">Buscar en toda la tienda →</a></div>`;
  }
  box.innerHTML = html;
}
function stikeSearchKeydown(e) {
  const rows = Array.prototype.slice.call(document.querySelectorAll("#overlay-results .sr-row"));
  let idx = rows.findIndex(r => r.classList.contains("active"));
  if (e.key === "ArrowDown") { e.preventDefault(); idx = Math.min(rows.length - 1, idx + 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); idx = Math.max(0, idx - 1); }
  else if (e.key === "Enter") {
    if (idx >= 0 && rows[idx]) { window.location.href = rows[idx].getAttribute("href"); }
    else { const q = document.getElementById("overlay-search").value.trim(); if (q) window.location.href = "tienda.html?q=" + encodeURIComponent(q); }
    return;
  } else if (e.key === "Escape") { stikeCloseSearch(); return; }
  else return;
  rows.forEach(r => r.classList.remove("active"));
  if (rows[idx]) { rows[idx].classList.add("active"); rows[idx].scrollIntoView({ block: "nearest" }); }
}
function stikeOpenSearch() {
  stikeRenderSearchOverlay();
  const ov = document.getElementById("search-overlay");
  if (!ov) return;
  ov.classList.add("open");
  document.body.style.overflow = "hidden";
  stikeSearchRender("");
  setTimeout(() => { const inp = document.getElementById("overlay-search"); if (inp) { inp.value = ""; inp.focus(); } }, 30);
}
function stikeCloseSearch() {
  const ov = document.getElementById("search-overlay");
  if (ov) ov.classList.remove("open");
  document.body.style.overflow = "";
  const hs = document.getElementById("site-search");
  if (hs) hs.blur();
}

/* ------------------------------ FOOTER --------------------------------- */
function stikeRenderFooter() {
  const C = STIKE_CONFIG;
  const catLinks = STIKE_CATEGORIES.map(c =>
    `<a href="tienda.html?cat=${c.slug}">${c.name}</a>`).join("");
  const footer = `
  <section class="cta-band">
    <div class="wrap">
      <div>
        <h2>¿Listo para rodar?</h2>
        <p>Escríbenos por WhatsApp y arma tu BMX con asesoría real de riders.</p>
      </div>
      <a class="btn wa" href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener">Hablar por WhatsApp</a>
    </div>
  </section>
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="brand">${stikeLogoSVG(40)} <span class="name">Stike<small>${C.tagline}</small></span></div>
          <p style="margin-top:14px">La tienda BMX de Bogotá. Repuestos, ropa, protecciones y la comunidad más activa de la ciudad. Te armamos la BMX a tu medida.</p>
          <div class="foot-social">
            <a href="${C.ig}" target="_blank" rel="noopener" class="soc soc-ig" title="Instagram" aria-label="Instagram">${SOCICO_IG}</a>
            <a href="${C.fb}" target="_blank" rel="noopener" class="soc soc-fb" title="Facebook" aria-label="Facebook">${SOCICO_FB}</a>
            <a href="${C.tiktok}" target="_blank" rel="noopener" class="soc soc-tt" title="TikTok" aria-label="TikTok">${SOCICO_TT}</a>
            <a href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener" class="soc soc-wa" title="WhatsApp" aria-label="WhatsApp">${SOCICO_WA}</a>
          </div>
        </div>
        <div>
          <h5>Tienda</h5>
          ${catLinks}
          <a href="marcas.html">Marcas</a>
          <a href="armar.html">Arma tu BMX</a>
          <a href="blog.html">Blog</a>
        </div>
        <div>
          <h5>Ayuda</h5>
          <a href="contacto.html">Contacto</a>
          <a href="nosotros.html">Nosotros</a>
          <a href="envios.html">Envíos y entregas</a>
          <a href="devoluciones.html">Cambios y devoluciones</a>
          <a href="contacto.html#faq">Preguntas frecuentes</a>
          <a href="carrito.html">Mi carrito</a>
        </div>
        <div>
          <h5>Newsletter</h5>
          <p>Recibe drops, ofertas y eventos de la comunidad.</p>
          <form class="newsletter" onsubmit="stikeNewsletter(event)">
            <input type="email" name="email" placeholder="Tu correo" required>
            <button class="btn sm" type="submit">Unirme</button>
            <label class="form-consent">
              <input type="checkbox" name="consent" required>
              <span>Acepto la <a href="privacidad.html">Política de Privacidad</a> y el tratamiento de mis datos.</span>
            </label>
          </form>
          <p style="margin-top:14px">${C.address}<br>${C.hours}<br>${C.whatsappPretty}</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${C.full} — Bogotá, Colombia.</span>
        <nav class="footer-legal" aria-label="Enlaces legales">
          <a href="privacidad.html">Privacidad</a>
          <a href="cookies.html">Cookies</a>
          <a href="terminos.html">Términos</a>
          <a href="envios.html">Envíos</a>
          <a href="devoluciones.html">Devoluciones</a>
        </nav>
        <div class="pay-icons">
          <span>VISA</span><span>MASTERCARD</span><span>PSE</span><span>NEQUI</span><span>EFECTY</span>
        </div>
      </div>
    </div>
  </footer>`;
  const mount = document.getElementById("site-footer");
  if (mount) mount.innerHTML = footer;
}

/* --------------------------- ENVÍO DE FORMULARIOS ---------------------- */
function stikeFormEndpoint() {
  const e = STIKE_CONFIG.formEndpoint;
  return (e && /^https?:\/\//.test(e)) ? e : null;
}
/* Envía `data` al endpoint configurado (Formspree, etc.). Si no hay endpoint,
   ejecuta `fallback` (o confirma con un toast). `submit` es el evento del form. */
function stikeSubmitForm(e, data, successMsg, fallback) {
  e.preventDefault();
  const form = e.target;
  const endpoint = stikeFormEndpoint();
  if (!endpoint) {
    if (typeof fallback === "function") fallback();
    else { form.reset(); stikeToast(successMsg); }
    return;
  }
  const btn = form.querySelector('[type="submit"]');
  const prev = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = "Enviando…"; }
  fetch(endpoint, {
    method: "POST",
    headers: { "Accept": "application/json" },
    body: new URLSearchParams(data)
  })
    .then(r => { if (!r.ok) throw new Error("bad status"); form.reset(); stikeToast(successMsg); })
    .catch(() => stikeToast("No pudimos enviar. Escríbenos por WhatsApp."))
    .finally(() => { if (btn) { btn.disabled = false; btn.textContent = prev; } });
}

function stikeNewsletter(e) {
  const email = (e.target.querySelector('input[type="email"]').value || "").trim();
  stikeSubmitForm(e,
    { email, _subject: "Nuevo suscriptor — boletín Stike", origen: "newsletter" },
    "¡Bienvenido a la comunidad Stike!");
}

function stikeContact(e) {
  const form = e.target;
  const val = sel => (form.querySelector(sel)?.value || "").trim();
  const nombre = val('input[type="text"]');
  const tel = val('input[type="tel"]');
  const tema = val('select');
  const mensaje = val('textarea');
  stikeSubmitForm(e,
    { nombre, telefono: tel, tema, mensaje, _subject: "Contacto web — " + tema },
    "Mensaje enviado, te contactamos pronto",
    () => {  // sin endpoint: abrimos WhatsApp con el mensaje ya escrito
      const text = `Hola Stike! Soy ${nombre}.\nTema: ${tema}\n${mensaje}\nMi WhatsApp/Tel: ${tel}`;
      window.open("https://wa.me/" + STIKE_CONFIG.whatsapp + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      form.reset();
      stikeToast("Te llevamos a WhatsApp para enviar tu mensaje");
    });
}

/* --------------------- Delegación global de eventos -------------------- */
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) { stikeAddToCart(add.getAttribute("data-add")); }
  const fav = e.target.closest(".fav");
  if (fav) { fav.classList.toggle("liked"); }
});

/* Atajo de teclado para el buscador (⌘K / Ctrl+K) */
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); stikeOpenSearch(); }
});

/* WhatsApp flotante */
function stikeFloatingWA() {
  const a = document.createElement("a");
  a.className = "wa-float";
  a.href = "https://wa.me/" + STIKE_CONFIG.whatsapp;
  a.target = "_blank"; a.rel = "noopener";
  a.title = "Escríbenos por WhatsApp";
  a.setAttribute("aria-label", "Escríbenos por WhatsApp");
  a.innerHTML = SOCICO_WA;
  document.body.appendChild(a);
}

/* ------------------------- COOKIES / CONSENTIMIENTO -------------------- */
const STIKE_COOKIE_KEY = "stike_cookie_consent_v1";
function stikeCookieConsent() {
  try { return JSON.parse(localStorage.getItem(STIKE_COOKIE_KEY)); } catch (e) { return null; }
}
function stikeSetCookieConsent(choice) {
  try { localStorage.setItem(STIKE_COOKIE_KEY, JSON.stringify({ choice, ts: Date.now() })); } catch (e) {}
  /* Las analíticas/marketing deben escuchar este evento antes de cargar (consent mode) */
  document.dispatchEvent(new CustomEvent("stike:consent", { detail: { choice } }));
}
function stikeCookieBanner() {
  if (stikeCookieConsent()) return;            // el usuario ya decidió
  const el = document.createElement("div");
  el.className = "cookie-banner";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", "Aviso de cookies");
  el.innerHTML = `
    <div class="cookie-inner">
      <div class="cookie-text">
        <strong>Cookies en Stike</strong>
        <p>Usamos cookies propias y de terceros para que la tienda funcione, recordar tu carrito y entender el tráfico del sitio. Acepta o rechaza las opcionales. Lee nuestra <a href="cookies.html">Política de Cookies</a> y de <a href="privacidad.html">Privacidad</a>.</p>
      </div>
      <div class="cookie-actions">
        <button class="btn ghost sm" data-cookie="reject" type="button">Rechazar opcionales</button>
        <button class="btn sm" data-cookie="accept" type="button">Aceptar todas</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  el.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cookie]");
    if (!btn) return;
    stikeSetCookieConsent(btn.getAttribute("data-cookie"));
    el.classList.remove("show");
    setTimeout(() => { if (el.parentNode) el.remove(); }, 350);
  });
}

/* Rellena elementos con [data-cfg] desde STIKE_CONFIG (páginas legales) */
function stikeFillConfig(root) {
  const C = STIKE_CONFIG;
  const map = {
    site: C.full, legalName: C.legalName, nit: C.nit,
    email: C.email, whatsapp: C.whatsappPretty, phone: C.phone,
    address: C.address, hours: C.hours, updated: C.legalUpdated, igHandle: C.igHandle
  };
  (root || document).querySelectorAll("[data-cfg]").forEach(el => {
    const k = el.getAttribute("data-cfg");
    if (map[k] != null) el.textContent = map[k];
  });
}

/* Init común para todas las páginas */
function stikeInit(active) {
  stikeRenderHeader(active);
  stikeRenderFooter();
  stikeFloatingWA();
  stikeRenderSearchOverlay();
  stikeFillConfig();
  stikeCookieBanner();
}

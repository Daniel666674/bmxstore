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
  igHandle: "@stikebikeshop"
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
function stikeAddToCart(id, qty) {
  qty = qty || 1;
  const cart = stikeGetCart();
  const row = cart.find(r => r.id === id);
  if (row) row.qty += qty; else cart.push({ id, qty });
  stikeSaveCart(cart);
  const p = stikeFindProduct(id);
  stikeToast((p ? p.name : "Producto") + " agregado al carrito");
}
function stikeUpdateQty(id, qty) {
  const cart = stikeGetCart();
  const row = cart.find(r => r.id === id);
  if (!row) return;
  row.qty = Math.max(1, qty);
  stikeSaveCart(cart);
}
function stikeRemoveFromCart(id) {
  stikeSaveCart(stikeGetCart().filter(r => r.id !== id));
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
function stikeProductCard(p) {
  const badge = p.badge === "promo" ? `<span class="badge promo">Oferta</span>`
              : p.badge === "new" ? `<span class="badge new">Nuevo</span>`
              : p.stock === 0 ? `<span class="badge sold">Agotado</span>` : "";
  const oldPrice = p.old ? `<span class="old">${stikePrice(p.old)}</span>` : "";
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
      <button class="btn cyan sm add block" data-add="${p.id}">Agregar al carrito</button>
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
      <div class="ticker"><span>ENVÍOS A TODA COLOMBIA &nbsp; ✦ &nbsp; <b>3 CUOTAS SIN INTERÉS</b> &nbsp; ✦ &nbsp; RECOGE EN CHAPINERO &nbsp; ✦ &nbsp; ARMAMOS TU BMX GRATIS &nbsp; ✦ &nbsp; <b>COMUNIDAD STIKE BOGOTÁ</b></span></div>
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
          <input type="search" id="site-search" placeholder="Busca marcos, llantas, cascos, marcas...">
          <button type="submit" aria-label="Buscar"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg></button>
        </form>
        <div class="header-actions">
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
    });
  }
  if (backdrop) backdrop.addEventListener("click", () => {
    nav.classList.remove("open");
    backdrop.classList.remove("show");
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
          <p style="margin-top:14px">La tienda BMX de Bogotá. Bicicletas, repuestos, ropa y la comunidad más activa de la ciudad.</p>
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
        </div>
        <div>
          <h5>Ayuda</h5>
          <a href="contacto.html">Contacto</a>
          <a href="nosotros.html">Nosotros</a>
          <a href="contacto.html#envios">Envíos y entregas</a>
          <a href="contacto.html#faq">Preguntas frecuentes</a>
          <a href="carrito.html">Mi carrito</a>
        </div>
        <div>
          <h5>Newsletter</h5>
          <p>Recibe drops, ofertas y eventos de la comunidad.</p>
          <form class="newsletter" onsubmit="stikeNewsletter(event)">
            <input type="email" placeholder="Tu correo" required>
            <button class="btn sm" type="submit">Unirme</button>
          </form>
          <p style="margin-top:14px">${C.address}<br>${C.hours}<br>${C.whatsappPretty}</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${C.full} — Bogotá, Colombia. Mockup de demostración.</span>
        <div class="pay-icons">
          <span>VISA</span><span>MASTERCARD</span><span>PSE</span><span>NEQUI</span><span>EFECTY</span>
        </div>
      </div>
    </div>
  </footer>`;
  const mount = document.getElementById("site-footer");
  if (mount) mount.innerHTML = footer;
}

function stikeNewsletter(e) {
  e.preventDefault();
  e.target.reset();
  stikeToast("Bienvenido a la comunidad Stike");
}

/* --------------------- Delegación global de eventos -------------------- */
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) { stikeAddToCart(add.getAttribute("data-add")); }
  const fav = e.target.closest(".fav");
  if (fav) { fav.classList.toggle("liked"); }
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

/* Init común para todas las páginas */
function stikeInit(active) {
  stikeRenderHeader(active);
  stikeRenderFooter();
  stikeFloatingWA();
}

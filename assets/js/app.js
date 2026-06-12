/* =========================================================================
   STIKE BIKE SHOP — App / UI compartida
   Header, navegación, carrito (localStorage), render de productos, toasts.
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

/* Detecta prefijo de ruta (todas las páginas viven en la raíz) */
const STIKE_BASE = "";

/* ----------------------------- LOGO SVG -------------------------------- */
function stikeLogoSVG(size) {
  size = size || 46;
  return `
<svg class="logo" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="3" y="3" width="58" height="58" rx="12" fill="#0b0b0d" stroke="#ff2e88" stroke-width="3"/>
  <path d="M40 12 L20 34 H32 L24 52 L46 28 H33 L40 12 Z" fill="#1fe0ff" stroke="#ff2e88" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="15" cy="50" r="3" fill="#b4ff1a"/>
  <circle cx="50" cy="16" r="3" fill="#ffe11a"/>
</svg>`;
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
  stikeToast(`✔ ${p ? p.name : "Producto"} agregado`);
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
      <button class="fav" title="Guardar" aria-label="Guardar">♡</button>
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
    // Mega menú en columnas
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
    const caret = cat.subs.length ? `<span class="caret">▾</span>` : "";
    return `<li class="${isActive}${hasMega}">
      <a href="tienda.html?cat=${cat.slug}"${accent}>${cat.name}${caret}</a>
      ${stikeNavDropdown(cat)}
    </li>`;
  }).join("");

  const header = `
  <div class="topbar">
    <div class="wrap">
      <div class="ticker"><span>🔥 ENVÍOS A TODA COLOMBIA &nbsp; • &nbsp; <b>3 CUOTAS SIN INTERÉS</b> &nbsp; • &nbsp; RECOGE EN TIENDA EN CHAPINERO &nbsp; • &nbsp; ARMAMOS TU BMX GRATIS &nbsp; • &nbsp; <b>COMUNIDAD STIKE BOGOTÁ</b> 🛹</span></div>
      <div class="social">
        <a href="${C.ig}" target="_blank" rel="noopener">IG</a>
        <a href="${C.fb}" target="_blank" rel="noopener">FB</a>
        <a href="${C.tiktok}" target="_blank" rel="noopener">TikTok</a>
      </div>
    </div>
  </div>
  <header class="site-header">
    <div class="wrap">
      <div class="header-main">
        <a class="brand" href="index.html">
          ${stikeLogoSVG(46)}
          <span class="name">Stike<small>${C.tagline}</small></span>
        </a>
        <form class="search" onsubmit="stikeDoSearch(event)">
          <input type="search" id="site-search" placeholder="Busca marcos, llantas, cascos, marcas...">
          <button type="submit" aria-label="Buscar">⌕</button>
        </form>
        <div class="header-actions">
          <a class="icon-btn" href="nosotros.html" title="Nosotros" aria-label="Nosotros">★</a>
          <a class="icon-btn" href="contacto.html" title="Contacto" aria-label="Contacto">✆</a>
          <a class="icon-btn" href="carrito.html" title="Carrito" aria-label="Carrito">
            🛒<span class="cart-count">0</span>
          </a>
          <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="Menú">☰</button>
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
  // En móvil, abrir submenús al tocar el caret
  nav && nav.querySelectorAll(".has-mega > a, li > a > .caret").forEach(() => {});
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
      <a class="btn wa" href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener">⟶ Hablar por WhatsApp</a>
    </div>
  </section>
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="brand">${stikeLogoSVG(40)} <span class="name">Stike<small>${C.tagline}</small></span></div>
          <p style="margin-top:14px">La tienda BMX de Bogotá. Bicicletas, repuestos, ropa y la comunidad más activa de la ciudad.</p>
          <div class="foot-social">
            <a href="${C.ig}" target="_blank" rel="noopener" title="Instagram">IG</a>
            <a href="${C.fb}" target="_blank" rel="noopener" title="Facebook">FB</a>
            <a href="${C.tiktok}" target="_blank" rel="noopener" title="TikTok">TT</a>
            <a href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener" title="WhatsApp">WA</a>
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
          <p style="margin-top:14px">📍 ${C.address}<br>🕒 ${C.hours}<br>📞 ${C.whatsappPretty}</p>
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
  stikeToast("✔ ¡Bienvenido a la comunidad Stike!");
}

/* --------------------- Delegación global de eventos -------------------- */
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) { stikeAddToCart(add.getAttribute("data-add")); }
  const fav = e.target.closest(".fav");
  if (fav) { fav.textContent = fav.textContent === "♡" ? "♥" : "♡"; fav.style.color = fav.textContent === "♥" ? "#ff2e88" : "#fff"; }
});

/* WhatsApp flotante */
function stikeFloatingWA() {
  const a = document.createElement("a");
  a.className = "wa-float";
  a.href = "https://wa.me/" + STIKE_CONFIG.whatsapp;
  a.target = "_blank"; a.rel = "noopener";
  a.title = "Escríbenos por WhatsApp";
  a.innerHTML = "💬";
  document.body.appendChild(a);
}

/* Init común para todas las páginas */
function stikeInit(active) {
  stikeRenderHeader(active);
  stikeRenderFooter();
  stikeFloatingWA();
}

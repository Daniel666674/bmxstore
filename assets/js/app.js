/* =========================================================================
   STIKE BIKE SHOP: App / UI compartida
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
  /* Envío de formularios (contacto + boletín) por correo real al dueño.
     Para activarlo (gratis, sin tarjeta, sin contraseña):
       1. Entra a https://web3forms.com
       2. Escribe el correo donde quieres recibir los mensajes (hola@stikebikeshop.com)
       3. Click en "Create Access Key" -- te llega una llave (access key) al correo
       4. Pega esa llave abajo en formAccessKey
     Mientras formAccessKey esté vacío, el contacto y el boletín se envían por
     WhatsApp en su lugar (nada se pierde, solo no llega como correo). */
  formEndpoint: "https://api.web3forms.com/submit",
  formAccessKey: ""
};

const STIKE_BASE = "";

/* Vista previa de las dos propuestas de diseño: ?look=a (Taller) o ?look=b
   (Vitrina); se recuerda en este navegador. TEMPORAL: al elegir una, este
   bloque y el CSS del otro look se eliminan. */
(function () {
  let look = "a";
  try {
    const q = new URLSearchParams(location.search).get("look");
    if (q === "a" || q === "b") localStorage.setItem("stike_look", q);
    look = q || localStorage.getItem("stike_look") || "a";
  } catch (e) {}
  document.documentElement.dataset.look = look === "b" ? "b" : "a";
})();

/* ----------------------------- SOCIAL ICONS ----------------------------- */
const SOCICO_IG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect x="2" y="2" width="20" height="20" rx="5" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="5" stroke="white" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="white"/></svg>`;
const SOCICO_FB = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M16 4h-2.5C11.6 4 10 5.6 10 7.5V10H8v3h2v9h3v-9h2.5l.5-3H13V7.5c0-.3.2-.5.5-.5H16V4z"/></svg>`;
const SOCICO_TT = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.41a8.16 8.16 0 004.77 1.52V7.49a4.85 4.85 0 01-1-.8z"/></svg>`;
const SOCICO_WA = `<svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.08L2 22l4.92-1.36A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.97 13.47c-.21.59-.96 1.07-1.62 1.21-.43.09-.99.16-2.88-.62-2.43-1-3.96-3.47-4.08-3.63-.12-.17-.99-1.32-.99-2.51 0-1.2.63-1.78.85-2.03.22-.24.48-.3.64-.3h.46c.14 0 .33-.05.51.39.19.46.64 1.57.7 1.68.06.11.1.24.02.39l-.24.37c-.12.13-.25.29-.36.39-.12.1-.24.21-.1.41.14.2.62.91 1.33 1.47.92.73 1.69.96 1.93 1.07.24.1.38.09.52-.06.14-.14.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.38.65 1.62.77.24.12.4.18.46.28.06.1.06.57-.15 1.17z"/></svg>`;

/* ------------------------------ LOGO ----------------------------------- */
/* Logo oficial Stike (script blanco + "BIKE SHOP" en menta), recortado del
   arte de marca a PNG/WebP transparente. Se ve bien sobre claro y oscuro
   porque el propio sticker trae su contorno. */
function stikeLogoSVG(size) {
  size = size || 46;
  return `<picture><source srcset="assets/img/logo-stike.webp" type="image/webp"><img class="logo" src="assets/img/logo-stike.png" alt="Stike Bike Shop" style="height:${size}px;width:auto" /></picture>`;
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
/* Clave única de línea: mismo producto en distinta talla/color = línea distinta */
function stikeLineKey(item) {
  return item.slug + (item.size ? "::s:" + item.size : "") + (item.color ? "::c:" + item.color : "");
}
function stikeAddToCart(slug, qty, size, color) {
  qty = qty || 1;
  size = size || null;
  color = color || null;
  const cart = stikeGetCart();
  const row = cart.find(r => r.slug === slug && (r.size || null) === size && (r.color || null) === color);
  if (row) row.qty += qty;
  else {
    const item = { slug, qty };
    if (size) item.size = size;
    if (color) item.color = color;
    cart.push(item);
  }
  stikeSaveCart(cart);
  const p = stikeFindProduct(slug);
  const variant = [size, color].filter(Boolean).join(" / ");
  stikeToast((p ? p.n : "Producto") + (variant ? " (" + variant + ")" : "") + " agregado al carrito");
}
/* Actualizar / quitar operan por clave de línea (slug + talla + color) */
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
    const p = stikeFindProduct(r.slug);
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
function stikeProductUrl(p) { return `producto/${p.slug}.html`; }
const ICO_HEART = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`;
const ICO_BAG = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>`;
const ICO_ARROW = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

/* Una sola tarjeta para todas las vitrinas (tienda, landings de parte, home,
   Fate, carrito, relacionados). Jerarquia: foto > marca > nombre > precio.
   La segunda foto aparece al pasar el mouse, como en las tiendas grandes:
   el cliente ve el producto desde otro angulo sin abrir la ficha.
   El boton rapido existe dos veces a proposito: sobre la foto para mouse
   (.card-quick) y debajo del precio para pantallas tactiles (.card-cta);
   CSS muestra solo uno segun (hover: hover). */
function stikeProductCard(p) {
  const out = stikeIsOutOfStock(p);
  const url = stikeProductUrl(p);
  const imgs = (p.imgs && p.imgs.length) ? p.imgs : [stikeProductImage(p, 600)];
  const onSale = !!(p.old && p.old > p.price);
  const badges = [];
  if (out) badges.push(`<span class="badge sold">Agotado</span>`);
  else if (onSale) badges.push(`<span class="badge promo">-${Math.round((1 - p.price / p.old) * 100)}%</span>`);
  else if (p.promo) badges.push(`<span class="badge promo">Oferta</span>`);
  if (!out && p.tag === "new") badges.push(`<span class="badge new">Nuevo</span>`);
  const hasVariants = !!(p.sizes || p.colors);
  const label = out ? "Avísame cuando llegue" : hasVariants ? (p.sizes ? "Elegir talla" : "Elegir color") : "Agregar al carrito";
  /* En tactil la tarjeta es angosta (2 columnas): etiqueta corta. */
  const short = out ? "Avísame" : hasVariants ? (p.sizes ? "Elegir talla" : "Elegir color") : "Agregar";
  const cta = (cls, txt) => (out || hasVariants)
    ? `<a class="btn ${cls}" href="${url}">${txt}</a>`
    : `<button class="btn ${cls}" type="button" data-add="${p.slug}" aria-label="Agregar ${p.n} al carrito">${ICO_BAG}<span>${txt}</span></button>`;
  const img2 = imgs[1] ? `<img class="img-2" src="${imgs[1]}" alt="" loading="lazy">` : "";
  const sizes = p.sizes && p.sizes.length
    ? `<p class="card-sizes" aria-label="Tallas">${p.sizes.map(s => `<span${s.u <= 0 ? ' class="out"' : ""}>${s.v}</span>`).join("")}</p>` : "";
  return `
  <article class="card${out ? " is-out" : ""}">
    <div class="card-media">
      <a class="card-img${img2 ? " has-2" : ""}" href="${url}" tabindex="-1" aria-hidden="true">
        <img class="img-1" src="${imgs[0]}" alt="${p.n}" loading="lazy">${img2}
      </a>
      ${badges.length ? `<div class="card-badges">${badges.join("")}</div>` : ""}
      <button class="card-fav fav" type="button" aria-label="Guardar ${p.n}">${ICO_HEART}</button>
      <div class="card-quick">${cta("sm block", label)}</div>
    </div>
    <div class="card-body">
      <p class="card-brand brand-line"><span class="bl-brand">${p.brand || ""}</span><span class="bl-sub">${p.sub || p.cat || ""}</span></p>
      <h3 class="card-title title"><a href="${url}">${p.n}</a></h3>
      ${sizes}
      <p class="card-price price">${stikePrice(p.price)}${onSale ? ` <s class="old">${stikePrice(p.old)}</s>` : ""}</p>
      <div class="card-cta">${cta("secondary sm block", short)}</div>
    </div>
  </article>`;
}

/* ----------------------- NAV: dropdown de categoría -------------------- */
/* Each part type has its own page (categoria/<slug>.html) rather than only a
   ?sub= filter, so the nav links straight to it. Falls back to the filtered
   storefront for any sub that doesn't have a page yet. */
function stikeSubSlug(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
          .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}
function stikeSubUrl(cat, sub) {
  const known = (window.STIKE_PART_PAGES || []).indexOf(stikeSubSlug(sub)) !== -1;
  return known ? `categoria/${stikeSubSlug(sub)}.html`
               : `tienda.html?cat=${cat}&sub=${encodeURIComponent(sub)}`;
}
/* Subcategorias con stock real. La taxonomia en data.js incluye tipos que la
   tienda todavia no surte; ofrecerlos en el menu o en los filtros manda al
   visitante a una pagina vacia, asi que la navegacion se deriva del catalogo. */
function stikeSubCounts(catSlug) {
  const counts = {};
  (window.STIKE_PRODUCTS || []).forEach(p => {
    if (p.cat === catSlug && p.sub) counts[p.sub] = (counts[p.sub] || 0) + 1;
  });
  return counts;
}
function stikeStockedSubs(cat) {
  if (!cat || !cat.subs) return [];
  const counts = stikeSubCounts(cat.slug);
  return cat.subs.filter(s => counts[s]);
}

/* Grupos del mega menu de Repuestos: como se piensa una BMX (cuadro,
   direccion, transmision, ruedas), no en orden alfabetico. Solo aparecen los
   tipos con stock; uno nuevo que no este en la lista cae en "Otros". */
const STIKE_PART_GROUPS = [
  ["Cuadro", ["Marcos", "Tenedores"]],
  ["Dirección", ["Timones", "Espigas", "Manubrios"]],
  ["Transmisión", ["Bielas", "Platos", "Cadenas", "Pedales"]],
  ["Ruedas", ["Rines", "Manzanas", "Llantas"]],
  ["Complementos", ["Sillas y Postes", "Tacos y Protectores de Maza", "Frenos"]],
];
function stikeNavDropdown(cat) {
  const subs = stikeStockedSubs(cat);
  if (!subs.length) return "";
  const counts = stikeSubCounts(cat.slug);
  const link = s => `<a href="${stikeSubUrl(cat.slug, s)}"><span>${s}</span><i>${counts[s]}</i></a>`;
  const total = subs.reduce((n, s) => n + counts[s], 0);
  if (cat.slug !== "repuestos") {
    return `<div class="drop"><a class="drop-all" href="tienda.html?cat=${cat.slug}">Ver todo ${cat.name} <i>${total}</i></a>${subs.map(link).join("")}</div>`;
  }
  const used = new Set();
  const cols = STIKE_PART_GROUPS.map(([title, list]) => {
    const items = list.filter(s => counts[s]);
    items.forEach(s => used.add(s));
    return items.length ? `<div class="mega-col"><p class="mega-h">${title}</p>${items.map(link).join("")}</div>` : "";
  }).filter(Boolean);
  const rest = subs.filter(s => !used.has(s));
  if (rest.length) cols.push(`<div class="mega-col"><p class="mega-h">Otros</p>${rest.map(link).join("")}</div>`);
  return `<div class="mega"><div class="mega-in wrap">
      <div class="mega-cols">${cols.join("")}</div>
      <a class="mega-feature" href="armar.html">
        <img src="assets/img/hero/bike-r.jpg" alt="" loading="lazy">
        <span class="mega-feature-txt"><b>Arma tu BMX</b><span>Elige cada pieza y te la armamos gratis en el taller</span><em>Empezar ${ICO_ARROW}</em></span>
      </a>
    </div>
    <div class="mega-foot"><div class="wrap"><a href="tienda.html?cat=repuestos">Ver todos los repuestos (${total}) ${ICO_ARROW}</a></div></div>
  </div>`;
}

/* ------------------------------ HEADER --------------------------------- */
/* Franja de anuncios + header pegado que se esconde al bajar y vuelve al
   subir (el cliente siempre tiene carrito y buscador a un gesto, sin que
   el header le robe pantalla mientras lee). Un solo DOM plano para los dos
   looks: CSS lo acomoda en dos filas (look A: buscador | logo | acciones,
   menu debajo) o en una sola (look B: logo | menu | buscador | acciones). */
const ICO_SEARCH = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>`;
const ICO_MENU = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`;
const ICO_CLOSE = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
const ICO_PIN = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.1 7-12a7 7 0 0 0-14 0c0 5.9 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>`;
const ICO_CARET = `<svg class="caret" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;
const STIKE_ANNOUNCEMENTS = ["Envíos a toda Colombia", "Ensamble de tu BMX gratis", "Paga en 3 cuotas sin interés", "Asesoría real de riders"];

function stikeRenderHeader(active) {
  const C = STIKE_CONFIG;
  const catItem = cat => {
    const drop = stikeNavDropdown(cat);
    const cls = [
      active === cat.slug ? "active" : "",
      drop ? (cat.slug === "repuestos" ? "has-mega" : "has-drop") : "",
      cat.slug === "promo" ? "is-promo" : ""
    ].filter(Boolean).join(" ");
    return `<li class="${cls}"><a href="tienda.html?cat=${cat.slug}"${drop ? ' aria-haspopup="true"' : ""}>${cat.name}${drop ? ICO_CARET : ""}</a>${drop}</li>`;
  };
  const promo = STIKE_CATEGORIES.find(c => c.slug === "promo");
  const navItems = STIKE_CATEGORIES.filter(c => c.slug !== "promo").map(catItem).join("") +
    `<li class="${active === "marcas" ? "active" : ""}"><a href="marcas.html">Marcas</a></li>` +
    `<li><a href="fate/">Fate BMX</a></li>` +
    `<li class="${active === "blog" ? "active" : ""}"><a href="blog.html">Blog</a></li>` +
    (promo ? catItem(promo) : "");

  /* Menu movil: las categorias con subtipos se abren en acordeon. */
  const drawerCats = STIKE_CATEGORIES.map(cat => {
    const subs = stikeStockedSubs(cat);
    const counts = stikeSubCounts(cat.slug);
    if (!subs.length) return `<a class="dr-link${cat.slug === "promo" ? " is-promo" : ""}" href="tienda.html?cat=${cat.slug}">${cat.name}</a>`;
    return `<details class="dr-acc"${active === cat.slug ? " open" : ""}>
      <summary>${cat.name}${ICO_CARET}</summary>
      <div class="dr-sub"><a href="tienda.html?cat=${cat.slug}">Ver todo ${cat.name}</a>${subs.map(s => `<a href="${stikeSubUrl(cat.slug, s)}">${s}<i>${counts[s]}</i></a>`).join("")}</div>
    </details>`;
  }).join("");

  const header = `
  <div class="annc" role="region" aria-label="Beneficios">
    <div class="annc-in wrap">
      <p class="annc-loc">${ICO_PIN}<span>Venecia, Bogotá · ${C.hours.replace("Lun a Sáb · ", "Lun–Sáb ")}</span></p>
      <div class="annc-rot" aria-live="polite">${STIKE_ANNOUNCEMENTS.map((t, i) => `<span${i === 0 ? ' class="on"' : ""}>${t}</span>`).join("")}</div>
      <div class="annc-soc">
        <a href="${C.ig}" target="_blank" rel="noopener" aria-label="Instagram">${SOCICO_IG}</a>
        <a href="${C.fb}" target="_blank" rel="noopener" aria-label="Facebook">${SOCICO_FB}</a>
        <a href="${C.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${SOCICO_TT}</a>
      </div>
    </div>
  </div>
  <header class="sh" id="sh">
    <div class="sh-in wrap">
      <button class="sh-ico sh-menu" id="sh-menu" type="button" aria-label="Abrir menú" aria-controls="sh-drawer" aria-expanded="false">${ICO_MENU}</button>
      <button class="sh-search" type="button" onclick="stikeOpenSearch()" aria-label="Buscar productos">
        ${ICO_SEARCH}<span class="sh-search-t">Buscar repuestos, marcas…</span><kbd>Ctrl K</kbd>
      </button>
      <a class="sh-logo" href="index.html" aria-label="Stike Bike Shop, inicio">${stikeLogoSVG(64)}</a>
      <nav class="sh-nav" aria-label="Principal"><ul>${navItems}</ul></nav>
      <div class="sh-actions">
        <button class="sh-ico sh-search-m" type="button" onclick="stikeOpenSearch()" aria-label="Buscar">${ICO_SEARCH}</button>
        <a class="sh-ico sh-wa" href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${SOCICO_WA}</a>
        <a class="sh-build btn sm" href="armar.html">Arma tu BMX</a>
        <a class="sh-cart" href="carrito.html" aria-label="Carrito">${ICO_BAG}<span class="sh-cart-t">Carrito</span><span class="cart-count">0</span></a>
      </div>
    </div>
  </header>
  <div class="dr-backdrop" id="sh-backdrop" hidden></div>
  <aside class="drawer" id="sh-drawer" aria-label="Menú" aria-hidden="true">
    <div class="dr-head">
      <a href="index.html" class="dr-logo" aria-label="Inicio">${stikeLogoSVG(44)}</a>
      <button class="sh-ico" type="button" id="sh-close" aria-label="Cerrar menú">${ICO_CLOSE}</button>
    </div>
    <button class="dr-search" type="button" onclick="stikeCloseDrawer();stikeOpenSearch()">${ICO_SEARCH}<span>Buscar repuestos, marcas…</span></button>
    <nav class="dr-nav" aria-label="Menú móvil">
      ${drawerCats}
      <a class="dr-link" href="marcas.html">Marcas</a>
      <a class="dr-link" href="fate/">Fate BMX</a>
      <a class="dr-link" href="blog.html">Blog</a>
      <a class="dr-link" href="nosotros.html">Nosotros</a>
      <a class="dr-link" href="contacto.html">Contacto</a>
    </nav>
    <a class="btn block" href="armar.html">Arma tu BMX ${ICO_ARROW}</a>
    <a class="dr-help" href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener">
      <span class="dr-help-ico">${SOCICO_WA}</span>
      <span><b>¿Dudas con una pieza?</b><span>Escríbenos: ${C.whatsappPretty}</span></span>
    </a>
  </aside>`;

  const mount = document.getElementById("site-header");
  if (mount) mount.innerHTML = header;
  stikeBindHeader();
  stikeUpdateCartBadge();
}

function stikeOpenDrawer() {
  const d = document.getElementById("sh-drawer"), b = document.getElementById("sh-backdrop");
  if (!d) return;
  d.classList.add("open"); d.setAttribute("aria-hidden", "false");
  if (b) { b.hidden = false; requestAnimationFrame(() => b.classList.add("show")); }
  const btn = document.getElementById("sh-menu"); if (btn) btn.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
  const close = document.getElementById("sh-close"); if (close) close.focus();
}
function stikeCloseDrawer() {
  const d = document.getElementById("sh-drawer"), b = document.getElementById("sh-backdrop");
  if (!d || !d.classList.contains("open")) return;
  d.classList.remove("open"); d.setAttribute("aria-hidden", "true");
  if (b) { b.classList.remove("show"); setTimeout(() => { b.hidden = true; }, 250); }
  const btn = document.getElementById("sh-menu"); if (btn) { btn.setAttribute("aria-expanded", "false"); btn.focus(); }
  document.body.style.overflow = "";
}
/* Nombre viejo: lo siguen llamando paginas que no se tocaron. */
function stikeCloseNav() { stikeCloseDrawer(); }

function stikeBindHeader() {
  /* Las paginas de Fate traen su propio header (el de antes). Para ellas se
     conserva el comportamiento anterior del boton de menu. */
  const legacyToggle = document.getElementById("menu-toggle");
  const legacyNav = document.getElementById("site-nav");
  if (legacyToggle && legacyNav && !document.getElementById("sh")) {
    const backdrop = document.getElementById("nav-backdrop");
    legacyToggle.addEventListener("click", () => {
      const open = !legacyNav.classList.contains("open");
      legacyNav.classList.toggle("open", open);
      if (backdrop) backdrop.classList.toggle("show", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    if (backdrop) backdrop.addEventListener("click", () => {
      legacyNav.classList.remove("open"); backdrop.classList.remove("show"); document.body.style.overflow = "";
    });
    return;
  }
  const menu = document.getElementById("sh-menu");
  if (menu) menu.addEventListener("click", stikeOpenDrawer);
  const close = document.getElementById("sh-close");
  if (close) close.addEventListener("click", stikeCloseDrawer);
  const backdrop = document.getElementById("sh-backdrop");
  if (backdrop) backdrop.addEventListener("click", stikeCloseDrawer);
  document.addEventListener("keydown", e => { if (e.key === "Escape") stikeCloseDrawer(); });

  /* Menus desplegables accesibles por teclado: se abren con foco, no solo
     con hover, y se cierran al salir. */
  document.querySelectorAll(".sh-nav li.has-mega, .sh-nav li.has-drop").forEach(li => {
    li.addEventListener("focusin", () => li.classList.add("open"));
    li.addEventListener("focusout", e => { if (!li.contains(e.relatedTarget)) li.classList.remove("open"); });
    li.addEventListener("mouseleave", () => li.classList.remove("open"));
  });

  /* Anuncios rotando cada 4 s (en escritorio se ven todos a la vez). */
  const rot = document.querySelector(".annc-rot");
  if (rot && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const items = rot.querySelectorAll("span");
    let i = 0;
    setInterval(() => { items[i].classList.remove("on"); i = (i + 1) % items.length; items[i].classList.add("on"); }, 4000);
  }

  /* Header que se esconde al bajar y reaparece al subir. Su altura queda en
     --sh-h y el estado en html.sh-hidden, para que lo que va pegado debajo
     (filtros, galeria de la ficha, resumen del carrito) se acomode. */
  const sh = document.getElementById("sh");
  if (sh) {
    const root = document.documentElement;
    const setH = () => root.style.setProperty("--sh-h", sh.offsetHeight + "px");
    setH();
    if ("ResizeObserver" in window) new ResizeObserver(setH).observe(sh);
    else window.addEventListener("resize", setH);
    let lastY = window.scrollY, ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 200 || y < lastY - 6) sh.classList.remove("is-hidden");
      else if (y > lastY + 6 && !sh.matches(":focus-within") && !document.body.style.overflow) sh.classList.add("is-hidden");
      root.classList.toggle("sh-hidden", sh.classList.contains("is-hidden"));
      sh.classList.toggle("is-scrolled", y > 10);
      lastY = y; ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  }
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
  return `<a class="sr-row" href="${stikeProductUrl(p)}">
    <span class="sr-thumb"><img src="${stikeProductImage(p, 120)}" alt=""></span>
    <span class="sr-meta"><span class="sr-name">${p.n}</span><span class="sr-brand">${p.brand}</span></span>
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
    (p.n + " " + p.brand + " " + (p.sub || "") + " " + p.cat).toLowerCase().includes(q)).slice(0, 7);
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
/* Franja de beneficios: la misma promesa en todas las paginas, justo antes
   del pie. El home la pone arriba (bajo el hero), asi que aqui se omite. */
function stikeValueProps() {
  const I = d => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const items = [
    [I('<rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>'), "Envíos a toda Colombia", "Despacho en 24 h en Bogotá"],
    [I('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'), "Ensamble gratis", "Armamos y ajustamos tu BMX"],
    [I('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>'), "3 cuotas sin interés", "Paga fácil con tarjeta"],
    [I('<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"/>'), "Asesoría de riders", "Te ayudamos a elegir cada pieza"],
  ];
  return `<section class="vp" aria-label="Por qué comprar en Stike"><div class="wrap vp-grid">${items.map(([ico, t, sub]) =>
    `<div class="vp-item"><span class="vp-ico">${ico}</span><p><b>${t}</b><span>${sub}</span></p></div>`).join("")}</div></section>`;
}

function stikeSubscribeFooter(e) {
  const form = e.target;
  const email = (form.querySelector('input[type="email"]').value || "").trim();
  stikeSubmitForm(e,
    { email, _subject: "Nuevo suscriptor — pie de página Stike", origen: "footer" },
    "¡Listo! Ya eres parte de la comunidad Stike.",
    stikeNewsletterFallback(form, email, "footer"));
  try { localStorage.setItem(NEWSLETTER_KEY, "subscribed"); } catch (err) {}
}

function stikeRenderFooter() {
  const C = STIKE_CONFIG;
  const vp = document.querySelector(".vp") ? "" : stikeValueProps();
  const catLinks = STIKE_CATEGORIES.map(c => `<a href="tienda.html?cat=${c.slug}">${c.name}</a>`).join("");
  const footer = `${vp}
  <section class="help">
    <div class="wrap help-in">
      <div class="help-txt">
        <p class="kicker">Asesoría real</p>
        <h2>¿No sabes qué medida o pieza elegir?</h2>
        <p>Escríbenos y un rider del taller te ayuda a escoger. Si la armas con nosotros, el ensamble es gratis.</p>
      </div>
      <div class="help-act">
        <a class="btn lg" href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener">${SOCICO_WA}<span>Escribir por WhatsApp</span></a>
        <p class="help-hours">${C.hours}</p>
      </div>
    </div>
  </section>
  <footer class="ft">
    <div class="wrap ft-grid">
      <div class="ft-brand">
        <a href="index.html" class="ft-logo" aria-label="Stike Bike Shop">${stikeLogoSVG(72)}</a>
        <p>La casa de todo el que rueda. Repuestos, ropa y protecciones BMX, armado a tu medida y asesoría real de riders en Venecia, Bogotá.</p>
        <div class="ft-soc">
          <a href="${C.ig}" target="_blank" rel="noopener" class="soc" aria-label="Instagram">${SOCICO_IG}</a>
          <a href="${C.fb}" target="_blank" rel="noopener" class="soc" aria-label="Facebook">${SOCICO_FB}</a>
          <a href="${C.tiktok}" target="_blank" rel="noopener" class="soc" aria-label="TikTok">${SOCICO_TT}</a>
          <a href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener" class="soc" aria-label="WhatsApp">${SOCICO_WA}</a>
        </div>
      </div>
      <nav class="ft-col" aria-label="Tienda"><h5>Tienda</h5>${catLinks}<a href="marcas.html">Marcas</a><a href="fate/">Fate BMX</a></nav>
      <nav class="ft-col" aria-label="Stike"><h5>Stike</h5><a href="armar.html">Arma tu BMX</a><a href="nosotros.html">Nosotros</a><a href="blog.html">Blog</a><a href="contacto.html">Contacto</a></nav>
      <nav class="ft-col" aria-label="Ayuda"><h5>Ayuda</h5><a href="envios.html">Envíos y entregas</a><a href="devoluciones.html">Cambios y devoluciones</a><a href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener">${C.whatsappPretty}</a><a href="mailto:${C.email}">${C.email}</a></nav>
      <div class="ft-news">
        <h5>Boletín</h5>
        <p>Lanzamientos, ofertas y eventos de la comunidad, primero en tu correo.</p>
        <form class="ft-form" onsubmit="stikeSubscribeFooter(event)">
          <input type="email" required placeholder="Tu correo" autocomplete="email" aria-label="Tu correo">
          <button class="btn sm" type="submit">Suscribirme</button>
        </form>
        <p class="ft-legal-note">Al suscribirte aceptas la <a href="privacidad.html">política de privacidad</a>.</p>
      </div>
    </div>
    <div class="wrap ft-bottom">
      <span>© ${new Date().getFullYear()} ${C.full} · Bogotá, Colombia</span>
      <nav class="footer-legal" aria-label="Legal"><a href="privacidad.html">Privacidad</a><a href="cookies.html">Cookies</a><a href="terminos.html">Términos</a></nav>
      <div class="pay-icons" aria-label="Medios de pago"><span>Visa</span><span>Mastercard</span><span>PSE</span><span>Nequi</span><span>Efecty</span></div>
    </div>
  </footer>`;
  const mount = document.getElementById("site-footer");
  if (mount) mount.innerHTML = footer;
}

/* --------------------------- ENVÍO DE FORMULARIOS ---------------------- */
/* Solo hay endpoint real si además hay llave -- sin llave, Web3Forms
   siempre responde 400 (access_key inválido), así que ni se intenta. */
function stikeFormEndpoint() {
  const e = STIKE_CONFIG.formEndpoint, k = STIKE_CONFIG.formAccessKey;
  return (e && /^https?:\/\//.test(e) && k) ? e : null;
}
/* No hay servidor propio que limite cuántas veces se puede enviar un
   formulario, así que el único freno posible vive aquí: un mismo formulario
   no puede reenviarse antes de este tiempo. No detiene a alguien decidido
   a saltárselo (podría llamar la función a mano), pero sí el caso real —
   doble click o alguien manteniendo apretado enviar. */
const FORM_COOLDOWN_MS = 8000;
const formLastSubmit = new WeakMap();

/* Envía `data` al endpoint configurado. Si no hay llave configurada todavía,
   o si el envío falla, ejecuta `fallback` (o confirma con un toast) en vez
   de dejar el mensaje perdido en silencio. `submit` es el evento del form. */
function stikeSubmitForm(e, data, successMsg, fallback) {
  e.preventDefault();
  const form = e.target;
  const last = formLastSubmit.get(form) || 0;
  if (Date.now() - last < FORM_COOLDOWN_MS) return;
  formLastSubmit.set(form, Date.now());
  const endpoint = stikeFormEndpoint();
  const runFallback = () => {
    if (typeof fallback === "function") fallback();
    else { form.reset(); stikeToast(successMsg); }
  };
  if (!endpoint) { runFallback(); return; }
  const btn = form.querySelector('[type="submit"]');
  const prev = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = "Enviando…"; }
  fetch(endpoint, {
    method: "POST",
    headers: { "Accept": "application/json" },
    body: new URLSearchParams({ ...data, access_key: STIKE_CONFIG.formAccessKey })
  })
    .then(r => r.json().catch(() => ({})).then(body => {
      // Web3Forms (y servicios similares) pueden responder 200 con
      // success:false -- el status HTTP solo no alcanza para confiar.
      if (!r.ok || body.success === false) throw new Error(body.message || "bad status");
      form.reset();
      stikeToast(successMsg);
    }))
    .catch(() => runFallback())
    .finally(() => { if (btn) { btn.disabled = false; btn.textContent = prev; } });
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

/* ------------------------- Boletín (popup) ---------------------- */
const NEWSLETTER_KEY = "stike_newsletter_v1";

function stikeMarkNewsletterSubscribed() {
  localStorage.setItem(NEWSLETTER_KEY, "subscribed");
  const overlay = document.getElementById("newsletter-overlay");
  if (overlay) overlay.classList.remove("open");
}

/* Sin correo configurado (o si el envío falla), un suscriptor perdido en
   silencio es peor que uno confirmado por WhatsApp: al menos el dueño se
   entera y puede sumarlo a la lista a mano. */
function stikeNewsletterFallback(form, email, origen) {
  return () => {
    const text = `Nuevo suscriptor al boletín (${origen}): ${email}`;
    window.open("https://wa.me/" + STIKE_CONFIG.whatsapp + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    form.reset();
    stikeToast("¡Gracias! Te sumamos por WhatsApp.");
  };
}

function stikeDismissNewsletter(e) {
  if (e && e.preventDefault) e.preventDefault();
  localStorage.setItem(NEWSLETTER_KEY, "dismissed");
  const overlay = document.getElementById("newsletter-overlay");
  if (overlay) overlay.classList.remove("open");
}

function stikeSubscribeFromPopup(e) {
  const form = e.target;
  const email = (form.querySelector('input[type="email"]').value || "").trim();
  stikeSubmitForm(e,
    { email, _subject: "Nuevo suscriptor — popup Stike", origen: "popup" },
    "¡Bienvenido a la comunidad Stike!",
    stikeNewsletterFallback(form, email, "popup"));
  stikeMarkNewsletterSubscribed();
}

function stikeRenderNewsletterPopup() {
  if (localStorage.getItem(NEWSLETTER_KEY)) return;
  if (document.getElementById("newsletter-overlay")) return;
  const el = document.createElement("div");
  el.id = "newsletter-overlay";
  el.className = "newsletter-overlay";
  el.innerHTML = `
    <div class="newsletter-modal" role="dialog" aria-modal="true" aria-label="Únete a la comunidad Stike">
      <button type="button" class="nl-close" aria-label="Cerrar" onclick="stikeDismissNewsletter()">✕</button>
      ${stikeLogoSVG(44)}
      <h3>Únete a la comunidad Stike</h3>
      <p>Entérate primero de lanzamientos, ofertas y eventos de la comunidad BMX en Bogotá.</p>
      <form onsubmit="stikeSubscribeFromPopup(event)">
        <input type="email" placeholder="Tu correo" required autocomplete="email">
        <button class="btn block" type="submit">Quiero unirme</button>
      </form>
      <a href="#" class="nl-skip" onclick="stikeDismissNewsletter(event)">Ahora no</a>
    </div>`;
  document.body.appendChild(el);
  el.addEventListener("click", (e) => { if (e.target === el) stikeDismissNewsletter(); });
  /* Nunca apenas se abre la pagina: el popup inmediato es lo que mas
     espanta en una tienda. Aparece a los 40 s o al pasar el 60% de la
     pagina, lo que ocurra primero, y una sola vez. */
  let shown = false;
  const show = () => {
    if (shown || localStorage.getItem(NEWSLETTER_KEY)) return;
    if (document.body.style.overflow === "hidden") return;
    shown = true; el.classList.add("open");
    window.removeEventListener("scroll", onScroll);
  };
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0 && window.scrollY / h > 0.6) show();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  setTimeout(show, 40000);
}

/* --------------------- Delegación global de eventos -------------------- */
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) { stikeAddToCart(add.getAttribute("data-add")); }
  const fav = e.target.closest(".fav");
  if (fav) { fav.setAttribute("aria-pressed", String(fav.classList.toggle("liked"))); }
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

/* ------------------------- CONTENIDO EDITABLE --------------------------
   Manifest plano (data/site-content.json) que el admin edita en la pestaña
   "Contenido del sitio". Se aplica por PRESENCIA de clave: una clave que el
   admin nunca toco no aparece en el archivo y el elemento se queda con su
   texto por defecto (el que ya trae el HTML); una clave guardada en blanco
   a proposito SI aparece (valor "") y el elemento se vacia. */
function stikeApplyContent() {
  const els = document.querySelectorAll("[data-content-key]");
  if (!els.length) return;
  fetch("data/site-content.json", { cache: "no-store" })
    .then(r => r.ok ? r.json() : {})
    .catch(() => ({}))
    .then(content => {
      els.forEach(el => {
        const key = el.getAttribute("data-content-key");
        if (Object.prototype.hasOwnProperty.call(content, key)) el.textContent = content[key];
      });
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
  stikeRenderNewsletterPopup();
  stikeApplyContent();
}

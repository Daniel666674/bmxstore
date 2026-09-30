/* =========================================================================
   STIKE BIKE SHOP: catalogo con filtros
   Un solo componente para tienda.html y las landings categoria/*.html.

   Orden de los filtros (el de las tiendas BMX grandes -- Dan's Comp, Albe's,
   Source BMX -- y lo que recomienda Baymard: primero lo que mas acota):
     1. Tipo de producto   categoria > subtipo (solo en tienda.html)
     2. Marca              varias a la vez, con conteo y buscador
     3. Precio             rango libre + atajos
     4. Color              sale del renglon "Color:" de cada ficha
     5. Talla              solo si hay productos con talla
     6. Disponibilidad     solo si cambia algo (hay agotados u ofertas)

   Conteos "facetados": cada opcion dice cuantos productos quedarian si la
   eliges, con el resto de filtros ya aplicados, y las opciones que dejarian
   la pagina vacia no se ofrecen. El estado vive en la URL
   (?brand=Fiend,Shadow&min=200000) para que el boton atras y un link
   compartido conserven los filtros.

   Dos presentaciones con la misma logica: "side" (columna lateral, look A)
   y "bar" (barra superior con desplegables, look B). En pantallas chicas
   las dos se vuelven un panel lateral con "Ver N productos".
   ========================================================================= */
(function () {
  "use strict";

  const PAGE = 24;
  const COLORS = [
    ["negro", "Negro", "#141516", ["negro"]],
    ["cromado", "Cromado", "linear-gradient(135deg,#f7f9fa 0%,#9aa3a6 45%,#eef2f3 55%,#7c8487 100%)", ["cromad"]],
    ["plata", "Plata", "#c4c9cb", ["plata", "platead"]],
    ["dorado", "Dorado", "#d3a93c", ["dorad", "gold"]],
    ["blanco", "Blanco", "#f5f5f5", ["blanc", "perla"]],
    ["gris", "Gris", "#8b9193", ["gris"]],
    ["azul", "Azul", "#2f62d8", ["azul"]],
    ["rojo", "Rojo", "#c83a3a", ["rojo", "oxblood", "vinotinto", "corsa"]],
    ["verde", "Verde", "#2f9e5a", ["verde"]],
    ["aqua", "Aqua", "#52f0d8", ["aqua", "aguamarina"]],
    ["morado", "Morado", "#7b3fd4", ["purpura", "morado"]],
    ["naranja", "Naranja", "#f08a24", ["naranja"]],
    ["beige", "Beige", "#d8c6a1", ["beige", "crema", "camel"]],
  ];
  const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const PRESETS = [[0, 150000, "Hasta $150 mil"], [150000, 500000, "$150 – 500 mil"], [500000, 1000000, "$500 mil – 1 millón"], [1000000, null, "Más de 1 millón"]];
  const SORTS = [["featured", "Destacados"], ["price-asc", "Precio: menor a mayor"], ["price-desc", "Precio: mayor a menor"], ["name", "Nombre: A – Z"], ["brand", "Marca: A – Z"]];
  const BRAND_LIMIT = 8;

  const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = n => "$" + Number(n).toLocaleString("es-CO");
  const isSale = p => !!(p.promo || (p.old && p.old > p.price));

  const colorCache = new Map();
  function colorKeys(p) {
    if (colorCache.has(p.slug)) return colorCache.get(p.slug);
    const line = (p.spec || []).find(s => /^colou?r\s*:/i.test(s));
    const txt = line ? norm(line.split(":").slice(1).join(":")) : "";
    const keys = txt ? COLORS.filter(c => c[3].some(w => txt.includes(w))).map(c => c[0]) : [];
    colorCache.set(p.slug, keys);
    return keys;
  }
  const colorLabel = k => (COLORS.find(c => c[0] === k) || [k, k])[1];
  const sizeRank = z => { const i = SIZE_ORDER.indexOf(z); return i === -1 ? 100 + (parseFloat(z) || 0) : i; };

  const ICO = {
    chev: `<svg class="chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`,
    x: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
    close: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
    sliders: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/></svg>`,
    wa: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.08L2 22l4.92-1.36A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.97 13.47c-.21.59-.96 1.07-1.62 1.21-.43.09-.99.16-2.88-.62-2.43-1-3.96-3.47-4.08-3.63-.12-.17-.99-1.32-.99-2.51 0-1.2.63-1.78.85-2.03.22-.24.48-.3.64-.3h.46c.14 0 .33-.05.51.39.19.46.64 1.57.7 1.68.06.11.1.24.02.39l-.24.37c-.12.13-.25.29-.36.39-.12.1-.24.21-.1.41.14.2.62.91 1.33 1.47.92.73 1.69.96 1.93 1.07.24.1.38.09.52-.06.14-.14.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.38.65 1.62.77.24.12.4.18.46.28.06.1.06.57-.15 1.17z"/></svg>`,
  };

  let uidSeq = 0;

  window.stikeCatalog = function (opts) {
    opts = opts || {};
    const root = document.querySelector(opts.mount);
    if (!root) return null;
    const uid = "c" + (++uidSeq);
    const lockCat = opts.lockCat || null;
    const lockSub = opts.lockSub || null;
    const layout = opts.layout || (document.documentElement.dataset.look === "b" ? "bar" : "side");
    const scope = STIKE_PRODUCTS.filter(p => (!lockCat || p.cat === lockCat) && (!lockSub || p.sub === lockSub));
    const drawerMQ = window.matchMedia("(max-width: 900px)");

    /* ------------------------------------------------ estado (desde la URL) */
    const qs = new URLSearchParams(location.search);
    const list = k => (qs.get(k) || "").split(",").map(s => s.trim()).filter(Boolean);
    const num = k => { const v = parseInt(qs.get(k), 10); return isNaN(v) ? null : v; };
    const S = {
      cat: lockCat || lockSub ? null : (qs.get("cat") || null),
      subs: lockSub ? [] : list("sub"),
      brands: list("brand"), colors: list("color"), sizes: list("size"),
      min: num("min"), max: num("max"),
      stock: qs.get("stock") === "1", sale: qs.get("sale") === "1",
      qRaw: (qs.get("q") || "").trim(),
      sort: SORTS.some(s => s[0] === qs.get("sort")) ? qs.get("sort") : "featured",
      shown: PAGE,
      fromPromo: false,
    };
    if (S.cat === "promo") { S.cat = null; S.sale = true; S.fromPromo = true; }
    if (S.cat && !STIKE_CATEGORIES.some(c => c.slug === S.cat)) S.cat = null;
    S.q = norm(S.qRaw);

    /* Que grupos estan abiertos, por presentacion: la columna lateral los
       abre todos; la barra y el panel movil empiezan cerrados (en el panel
       se abren solos los que ya tienen algo marcado). */
    const openMap = { side: {}, bar: {}, drawer: {} };
    let brandQuery = "";
    const mode = () => drawerMQ.matches ? "drawer" : layout;
    function isOpen(id, n) {
      const m = mode(), v = openMap[m][id];
      if (v !== undefined) return v;
      if (m === "side") return true;
      if (m === "drawer") return n > 0 || id === "cat";
      return false;
    }

    /* --------------------------------------------------------- filtrado */
    const hayCache = new Map();
    function hay(p) {
      if (!hayCache.has(p.slug)) hayCache.set(p.slug, norm(`${p.n} ${p.brand} ${p.sub} ${p.cat} ${(p.spec || []).join(" ")}`));
      return hayCache.get(p.slug);
    }
    function match(p, skip) {
      if (skip !== "cat") {
        if (S.cat && p.cat !== S.cat) return false;
        if (skip !== "sub" && S.subs.length && !S.subs.includes(p.sub)) return false;
      }
      if (skip !== "brand" && S.brands.length && !S.brands.includes(p.brand)) return false;
      if (skip !== "price") {
        if (S.min != null && p.price < S.min) return false;
        if (S.max != null && p.price > S.max) return false;
      }
      if (skip !== "color" && S.colors.length && !colorKeys(p).some(c => S.colors.includes(c))) return false;
      if (skip !== "size" && S.sizes.length && !(p.sizes || []).some(z => z.u > 0 && S.sizes.includes(z.v))) return false;
      if (skip !== "stock" && S.stock && stikeIsOutOfStock(p)) return false;
      if (skip !== "sale" && S.sale && !isSale(p)) return false;
      if (S.q && !hay(p).includes(S.q)) return false;
      return true;
    }
    const pool = skip => scope.filter(p => match(p, skip));
    function countBy(items, keyFn) {
      const m = new Map();
      items.forEach(p => [].concat(keyFn(p)).forEach(k => { if (k) m.set(k, (m.get(k) || 0) + 1); }));
      return m;
    }
    function results() {
      const r = pool(null);
      const by = {
        "price-asc": (a, b) => a.price - b.price,
        "price-desc": (a, b) => b.price - a.price,
        "name": (a, b) => a.n.localeCompare(b.n, "es"),
        "brand": (a, b) => (a.brand || "").localeCompare(b.brand || "", "es") || a.n.localeCompare(b.n, "es"),
      }[S.sort];
      /* Destacados: lo disponible primero, sin tocar el orden del catalogo. */
      return by ? r.sort(by) : r.map((p, i) => [p, i]).sort((a, b) => (stikeIsOutOfStock(a[0]) - stikeIsOutOfStock(b[0])) || a[1] - b[1]).map(x => x[0]);
    }
    const priceActive = () => S.min != null || S.max != null;
    const activeCount = () => (S.cat ? 1 : 0) + S.subs.length + S.brands.length + S.colors.length + S.sizes.length +
      (priceActive() ? 1 : 0) + (S.stock ? 1 : 0) + (S.sale ? 1 : 0) + (S.q ? 1 : 0);
    function priceLabel() {
      if (S.min != null && S.max != null) return `${money(S.min)} – ${money(S.max)}`;
      if (S.min != null) return `Desde ${money(S.min)}`;
      return `Hasta ${money(S.max)}`;
    }
    const catName = slug => (STIKE_CATEGORIES.find(c => c.slug === slug) || { name: slug }).name;

    /* ------------------------------------------------------ bloques HTML */
    function group(id, title, body, n, summary) {
      const open = isOpen(id, n);
      return `<section class="fg${open ? " open" : ""}${n ? " has-val" : ""}" data-g="${id}">
        <h3 class="fg-h"><button type="button" class="fg-t" aria-expanded="${open}" aria-controls="fg-${uid}-${id}">
          <span class="fg-l">${title}</span>${summary ? `<span class="fg-sum">${esc(summary)}</span>` : ""}${n ? `<b class="fg-n">${n}</b>` : ""}${ICO.chev}
        </button></h3>
        <div class="fg-b" id="fg-${uid}-${id}">${body}</div>
      </section>`;
    }
    const check = (f, value, label, count, on, pre, hidden) =>
      `<label class="fo${on ? " on" : ""}"${hidden ? " hidden" : ""}${f === "brand" ? ` data-name="${esc(norm(label))}"` : ""}><input type="checkbox" data-f="${f}" value="${esc(value)}"${on ? " checked" : ""}><span class="fo-box" aria-hidden="true"></span>${pre || ""}<span class="fo-l">${esc(label)}</span><span class="fo-c">${count}</span></label>`;
    const toggle = (f, label, count, on) =>
      `<label class="fo fo-sw${on ? " on" : ""}"><input type="checkbox" data-f="${f}" value="1"${on ? " checked" : ""}><span class="fo-track" aria-hidden="true"></span><span class="fo-l">${label}</span><span class="fo-c">${count}</span></label>`;

    function sortGroup() {
      const body = SORTS.map(([v, l]) => `<label class="fo fo-r${S.sort === v ? " on" : ""}"><input type="radio" name="sort-${uid}" data-sortopt value="${v}"${S.sort === v ? " checked" : ""}><span class="fo-dot" aria-hidden="true"></span><span class="fo-l">${l}</span></label>`).join("");
      return group("sort", "Ordenar por", body, 0, SORTS.find(s => s[0] === S.sort)[1]).replace('class="fg', 'class="fg fg-sort');
    }
    function catGroup() {
      const base = pool("cat");
      const byCat = countBy(base, p => p.cat);
      const cats = STIKE_CATEGORIES.filter(c => c.slug !== "promo" && (byCat.get(c.slug) || S.cat === c.slug));
      let html = `<label class="fo fo-r${!S.cat ? " on" : ""}"><input type="radio" name="cat-${uid}" data-f="cat" value=""${!S.cat ? " checked" : ""}><span class="fo-dot" aria-hidden="true"></span><span class="fo-l">Todos los productos</span><span class="fo-c">${base.length}</span></label>`;
      cats.forEach(c => {
        const on = S.cat === c.slug;
        html += `<label class="fo fo-r${on ? " on" : ""}"><input type="radio" name="cat-${uid}" data-f="cat" value="${c.slug}"${on ? " checked" : ""}><span class="fo-dot" aria-hidden="true"></span><span class="fo-l">${c.name}</span><span class="fo-c">${byCat.get(c.slug) || 0}</span></label>`;
        if (on) {
          const bySub = countBy(pool("sub"), p => p.sub);
          const subs = (c.subs || []).filter(s => bySub.get(s) || S.subs.includes(s)).sort((a, b) => (bySub.get(b) || 0) - (bySub.get(a) || 0));
          if (subs.length > 1 || S.subs.length) html += `<div class="fo-nest">${subs.map(s => check("sub", s, s, bySub.get(s) || 0, S.subs.includes(s))).join("")}</div>`;
        }
      });
      const n = (S.cat ? 1 : 0) + S.subs.length;
      const sum = S.subs.length ? S.subs.join(", ") : (S.cat ? catName(S.cat) : "");
      return group("cat", "Tipo de producto", `<div class="fo-list">${html}</div>`, n, sum);
    }
    function brandGroup() {
      const counts = countBy(pool("brand"), p => p.brand);
      const brands = [...new Set([...counts.keys(), ...S.brands])]
        .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0) || a.localeCompare(b, "es"));
      if (brands.length < 2 && !S.brands.length) return "";
      const all = !!openMap[mode()]["brand-all"] || !!brandQuery;
      const rows = brands.map((b, i) => {
        const hideByLimit = !all && i >= BRAND_LIMIT && !S.brands.includes(b);
        const hideByQuery = brandQuery && !norm(b).includes(brandQuery);
        return check("brand", b, b, counts.get(b) || 0, S.brands.includes(b), "", hideByLimit || hideByQuery);
      }).join("");
      const search = brands.length > 10 ? `<div class="fg-search"><input type="search" placeholder="Buscar marca" aria-label="Buscar marca" data-bsearch value="${esc(brandQuery)}"></div>` : "";
      const more = brands.length > BRAND_LIMIT && !brandQuery ? `<button type="button" class="fg-more" data-bmore>${all ? "Ver menos" : `Ver las ${brands.length} marcas`}</button>` : "";
      return group("brand", "Marca", search + `<div class="fo-list">${rows}</div>` + more, S.brands.length, S.brands.join(", "));
    }
    function priceGroup() {
      const prices = pool("price").map(p => p.price);
      if (!prices.length && !priceActive()) return "";
      const lo = prices.length ? Math.min(...prices) : 0, hi = prices.length ? Math.max(...prices) : 0;
      const presets = PRESETS.map(([a, b, label]) => {
        const n = prices.filter(v => v >= a && (b == null || v <= b)).length;
        const on = (S.min || 0) === a && S.max === b;
        if (!n && !on) return "";
        return `<button type="button" class="fp-p${on ? " on" : ""}" data-preset="${a}-${b == null ? "" : b}" aria-pressed="${on}">${label}<i>${n}</i></button>`;
      }).join("");
      const body = `<div class="fp">
          <label class="fp-f"><span>Mínimo</span><input type="text" inputmode="numeric" data-price="min" placeholder="${money(lo)}" value="${S.min != null ? money(S.min) : ""}" autocomplete="off"></label>
          <span class="fp-sep" aria-hidden="true">–</span>
          <label class="fp-f"><span>Máximo</span><input type="text" inputmode="numeric" data-price="max" placeholder="${money(hi)}" value="${S.max != null ? money(S.max) : ""}" autocomplete="off"></label>
        </div>
        ${presets ? `<div class="fp-pre">${presets}</div>` : ""}`;
      return group("price", "Precio", body, priceActive() ? 1 : 0, priceActive() ? priceLabel() : "");
    }
    function colorGroup() {
      const counts = countBy(pool("color"), colorKeys);
      const items = COLORS.filter(c => counts.get(c[0]) || S.colors.includes(c[0]));
      if (items.length < 2 && !S.colors.length) return "";
      const html = items.map(([k, label, sw]) => check("color", k, label, counts.get(k) || 0, S.colors.includes(k), `<span class="sw" style="background:${sw}" aria-hidden="true"></span>`)).join("");
      return group("color", "Color", `<div class="fo-list fo-colors">${html}</div>`, S.colors.length, S.colors.map(colorLabel).join(", "));
    }
    function sizeGroup() {
      const counts = countBy(pool("size"), p => (p.sizes || []).filter(z => z.u > 0).map(z => z.v));
      const sizes = [...new Set([...counts.keys(), ...S.sizes])].sort((a, b) => sizeRank(a) - sizeRank(b));
      if (!sizes.length) return "";
      const html = sizes.map(z => {
        const on = S.sizes.includes(z), n = counts.get(z) || 0;
        return `<label class="fz${on ? " on" : ""}"><input type="checkbox" data-f="size" value="${esc(z)}"${on ? " checked" : ""}><span>${esc(z)}</span><i>${n}</i></label>`;
      }).join("");
      return group("size", "Talla", `<div class="fz-grid">${html}</div>`, S.sizes.length, S.sizes.join(", "));
    }
    function availGroup() {
      const base = pool("stock");
      const inStock = base.filter(p => !stikeIsOutOfStock(p)).length;
      const onSale = pool("sale").filter(isSale).length;
      const rows = [];
      if (inStock < base.length || S.stock) rows.push(toggle("stock", "Solo disponibles", inStock, S.stock));
      if (onSale > 0 || S.sale) rows.push(toggle("sale", "En oferta", onSale, S.sale));
      if (!rows.length) return "";
      const n = (S.stock ? 1 : 0) + (S.sale ? 1 : 0);
      return group("avail", "Disponibilidad", rows.join(""), n, [S.stock && "Disponibles", S.sale && "Oferta"].filter(Boolean).join(", "));
    }
    function chips() {
      const c = [];
      const add = (key, label) => c.push(`<button type="button" class="chip-x" data-rm="${esc(key)}" aria-label="Quitar filtro ${esc(label)}">${esc(label)}${ICO.x}</button>`);
      if (S.q) add("q", `“${S.qRaw}”`);
      if (S.cat) add("cat", catName(S.cat));
      S.subs.forEach(v => add("sub:" + v, v));
      S.brands.forEach(v => add("brand:" + v, v));
      if (priceActive()) add("price", priceLabel());
      S.colors.forEach(v => add("color:" + v, colorLabel(v)));
      S.sizes.forEach(v => add("size:" + v, "Talla " + v));
      if (S.stock) add("stock", "Solo disponibles");
      if (S.sale) add("sale", "En oferta");
      return c.length ? c.join("") + (c.length > 1 ? `<button type="button" class="chip-clear" data-rm="all">Limpiar todo</button>` : "") : "";
    }
    /* Atajos visibles arriba de la grilla: el filtro mas usado a un clic. */
    function quick() {
      if (lockSub) {
        const cat = STIKE_CATEGORIES.find(c => c.slug === lockCat);
        const subs = stikeStockedSubs(cat);
        const counts = stikeSubCounts(lockCat);
        if (subs.length < 2) return "";
        const items = subs.slice();
        if (!items.includes(lockSub)) items.unshift(lockSub);
        return items.map(s => `<a class="qc${s === lockSub ? " on" : ""}" href="${stikeSubUrl(lockCat, s)}"${s === lockSub ? ' aria-current="page"' : ""}>${esc(s)}<i>${counts[s] || 0}</i></a>`).join("");
      }
      if (!S.cat) {
        const counts = countBy(pool("cat"), p => p.cat);
        const items = STIKE_CATEGORIES.filter(c => c.slug !== "promo" && counts.get(c.slug));
        if (items.length < 2) return "";
        return items.map(c => `<button type="button" class="qc" data-qcat="${c.slug}">${c.name}<i>${counts.get(c.slug)}</i></button>`).join("");
      }
      const bySub = countBy(pool("sub"), p => p.sub);
      const cat = STIKE_CATEGORIES.find(c => c.slug === S.cat);
      const subs = ((cat && cat.subs) || []).filter(s => bySub.get(s)).sort((a, b) => bySub.get(b) - bySub.get(a));
      if (subs.length < 2) return "";
      return subs.map(s => { const on = S.subs.includes(s); return `<button type="button" class="qc${on ? " on" : ""}" data-qsub="${esc(s)}" aria-pressed="${on}">${esc(s)}<i>${bySub.get(s)}</i></button>`; }).join("");
    }
    function emptyState() {
      if (!scope.length) {
        const name = lockSub || (lockCat ? catName(lockCat) : "este catálogo");
        return `<div class="ce-ico">${ICO.wa}</div><h3>Estamos surtiendo ${esc(name)}</h3>
          <p>Todavía no hay productos publicados aquí. Escríbenos por WhatsApp: te conseguimos la pieza o te avisamos cuando llegue.</p>
          <div class="ce-act"><a class="btn" href="https://wa.me/${STIKE_CONFIG.whatsapp}?text=${encodeURIComponent("Hola Stike! Busco " + name + ", ¿me ayudan?")}" target="_blank" rel="noopener">Preguntar por WhatsApp</a><a class="btn secondary" href="tienda.html">Ver todo el catálogo</a></div>`;
      }
      return `<h3>Ningún producto coincide con estos filtros</h3>
        <p>Prueba quitando alguno de los filtros de arriba, o mira todo el catálogo.</p>
        <div class="ce-act"><button type="button" class="btn" data-rm="all">Limpiar filtros</button><a class="btn secondary" href="tienda.html">Ver todo el catálogo</a></div>`;
    }

    /* ---------------------------------------------------------- esqueleto */
    root.classList.add("cat-root");
    root.innerHTML = `
      <div class="cat-quick" data-slot="quick"></div>
      <div class="catalog is-${layout}">
        <aside class="flt" id="flt-${uid}" aria-label="Filtros" tabindex="-1">
          <div class="flt-head"><p>Filtrar y ordenar</p><button type="button" class="flt-x" data-close aria-label="Cerrar filtros">${ICO.close}</button></div>
          <div class="flt-body" data-slot="groups"></div>
          <div class="flt-foot"><button type="button" class="btn secondary" data-rm="all">Limpiar</button><button type="button" class="btn" data-close data-slot="see">Ver productos</button></div>
        </aside>
        <div class="cat-main">
          <div class="cat-bar">
            <button type="button" class="btn secondary sm cat-open" aria-controls="flt-${uid}" aria-expanded="false">${ICO.sliders}<span>Filtrar</span><b data-slot="opn"></b></button>
            <p class="cat-count" data-slot="count" aria-live="polite"></p>
            <label class="cat-sort"><span>Ordenar por</span><span class="cat-sel"><select data-sort aria-label="Ordenar productos">${SORTS.map(([v, l]) => `<option value="${v}"${S.sort === v ? " selected" : ""}>${l}</option>`).join("")}</select>${ICO.chev}</span></label>
          </div>
          <div class="cat-active" data-slot="chips"></div>
          <div class="product-grid" data-slot="grid"></div>
          <div class="cat-more" data-slot="more"></div>
          <div class="cat-empty" data-slot="empty" hidden></div>
        </div>
      </div>
      <div class="flt-backdrop" data-close hidden></div>`;
    /* Sin productos en este tipo todavia: nada que filtrar, el aviso va a
       todo el ancho. */
    if (!scope.length) root.querySelector(".catalog").classList.add("is-empty");
    const slot = n => root.querySelector(`[data-slot="${n}"]`);
    const flt = root.querySelector(".flt");
    const backdrop = root.querySelector(".flt-backdrop");

    /* ------------------------------------------------------------ render */
    let current = [];
    function renderGroups() {
      const html = [
        sortGroup(),
        lockCat || lockSub ? "" : catGroup(),
        brandGroup(), priceGroup(), colorGroup(), sizeGroup(), availGroup(),
      ].join("");
      slot("groups").innerHTML = html || `<p class="flt-none">No hay filtros para esta selección.</p>`;
    }
    function renderMore() {
      const total = current.length, shown = Math.min(S.shown, total);
      if (total <= PAGE) { slot("more").innerHTML = ""; return; }
      const pct = Math.round(shown / total * 100);
      slot("more").innerHTML = `<p>Has visto <b>${shown}</b> de <b>${total}</b> productos</p>
        <div class="cm-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${shown}"><i style="width:${pct}%"></i></div>
        ${shown < total ? `<button type="button" class="btn secondary" data-loadmore>Ver ${Math.min(PAGE, total - shown)} productos más</button>` : ""}`;
    }
    function update(focusSel) {
      current = results();
      renderGroups();
      slot("quick").innerHTML = quick();
      slot("quick").hidden = !slot("quick").innerHTML;
      slot("chips").innerHTML = chips();
      slot("chips").hidden = !slot("chips").innerHTML;
      const n = current.length;
      slot("count").innerHTML = `<b>${n}</b> ${n === 1 ? "producto" : "productos"}`;
      slot("opn").textContent = activeCount() || "";
      slot("see").textContent = n ? `Ver ${n} ${n === 1 ? "producto" : "productos"}` : "Sin resultados";
      const grid = slot("grid");
      grid.innerHTML = current.slice(0, S.shown).map(stikeProductCard).join("");
      grid.hidden = !n;
      slot("empty").hidden = !!n;
      slot("empty").innerHTML = n ? "" : emptyState();
      renderMore();
      if (opts.countEl) {
        const el = document.querySelector(opts.countEl);
        if (el) el.textContent = `${scope.length} ${scope.length === 1 ? "producto" : "productos"}`;
      }
      syncUrl();
      if (typeof opts.onChange === "function") opts.onChange(S, current);
      if (focusSel) { const el = root.querySelector(focusSel); if (el) el.focus({ preventScroll: true }); }
    }
    function syncUrl() {
      if (opts.urlState === false) return;
      const p = new URLSearchParams();
      if (S.qRaw) p.set("q", S.qRaw);
      if (S.cat) p.set("cat", S.cat);
      else if (S.fromPromo && S.sale) p.set("cat", "promo");
      if (S.subs.length) p.set("sub", S.subs.join(","));
      if (S.brands.length) p.set("brand", S.brands.join(","));
      if (S.min != null) p.set("min", S.min);
      if (S.max != null) p.set("max", S.max);
      if (S.colors.length) p.set("color", S.colors.join(","));
      if (S.sizes.length) p.set("size", S.sizes.join(","));
      if (S.stock) p.set("stock", "1");
      if (S.sale && !(S.fromPromo && !S.cat)) p.set("sale", "1");
      if (S.sort !== "featured") p.set("sort", S.sort);
      const str = p.toString().replace(/%2C/g, ",");
      history.replaceState(history.state, "", location.pathname + (str ? "?" + str : "") + location.hash);
    }
    /* Selector para devolver el foco al mismo control tras redibujar. */
    function focusKey(el) {
      if (!el || !root.contains(el)) return null;
      if (el.dataset.f) return `[data-f="${el.dataset.f}"][value="${CSS.escape(el.value)}"]`;
      if (el.matches("[data-sortopt]")) return `[data-sortopt][value="${CSS.escape(el.value)}"]`;
      if (el.matches(".fg-t")) return `.fg[data-g="${el.closest(".fg").dataset.g}"] .fg-t`;
      if (el.dataset.preset !== undefined) return `[data-preset="${CSS.escape(el.dataset.preset)}"]`;
      if (el.matches("[data-bmore]")) return "[data-bmore]";
      return null;
    }
    function changed(el) { S.shown = PAGE; update(focusKey(el)); }

    /* ------------------------------------------------------------ eventos */
    root.addEventListener("change", e => {
      const t = e.target;
      if (t.matches("[data-sort]")) { S.sort = t.value; changed(); return; }
      if (t.matches("[data-sortopt]")) { S.sort = t.value; const sel = root.querySelector("[data-sort]"); if (sel) sel.value = S.sort; changed(t); return; }
      if (t.matches("[data-price]")) {
        const v = parseInt(String(t.value).replace(/\D/g, ""), 10);
        S[t.dataset.price] = isNaN(v) ? null : v;
        if (S.min != null && S.max != null && S.min > S.max) { const m = S.min; S.min = S.max; S.max = m; }
        changed();
        return;
      }
      const f = t.dataset.f;
      if (!f) return;
      if (f === "cat") { S.cat = t.value || null; S.subs = []; S.fromPromo = false; }
      else if (f === "stock" || f === "sale") { S[f] = t.checked; if (f === "sale" && !t.checked) S.fromPromo = false; }
      else {
        const key = { sub: "subs", brand: "brands", color: "colors", size: "sizes" }[f];
        const arr = S[key];
        const i = arr.indexOf(t.value);
        if (t.checked && i === -1) arr.push(t.value);
        if (!t.checked && i !== -1) arr.splice(i, 1);
      }
      changed(t);
    });
    root.addEventListener("keydown", e => {
      if (e.key === "Enter" && e.target.matches("[data-price]")) { e.preventDefault(); e.target.blur(); }
    });
    root.addEventListener("input", e => {
      if (!e.target.matches("[data-bsearch]")) return;
      brandQuery = norm(e.target.value).trim();
      root.querySelectorAll('.fg[data-g="brand"] .fo[data-name]').forEach(l => {
        l.hidden = brandQuery ? !l.dataset.name.includes(brandQuery) : false;
      });
      const more = root.querySelector("[data-bmore]");
      if (more) more.hidden = !!brandQuery;
    });
    root.addEventListener("click", e => {
      const t = e.target.closest("button, a");
      if (!t || !root.contains(t)) return;
      if (t.matches(".fg-t")) {
        const g = t.closest(".fg"), id = g.dataset.g, m = mode();
        const willOpen = !g.classList.contains("open");
        if (m === "bar") root.querySelectorAll(".fg.open").forEach(o => { if (o !== g) { o.classList.remove("open"); o.querySelector(".fg-t").setAttribute("aria-expanded", "false"); openMap.bar[o.dataset.g] = false; } });
        openMap[m][id] = willOpen;
        g.classList.toggle("open", willOpen);
        t.setAttribute("aria-expanded", String(willOpen));
        if (willOpen && m === "bar") { const first = g.querySelector("input, button:not(.fg-t)"); if (first) first.focus({ preventScroll: true }); }
        return;
      }
      if (t.matches("[data-bmore]")) { openMap[mode()]["brand-all"] = !openMap[mode()]["brand-all"]; renderGroups(); const b = root.querySelector("[data-bmore]"); if (b) b.focus(); return; }
      if (t.dataset.preset !== undefined) {
        const [a, b] = t.dataset.preset.split("-");
        const lo = parseInt(a, 10) || null, hi = b ? parseInt(b, 10) : null;
        const on = (S.min || 0) === (lo || 0) && S.max === hi;
        S.min = on ? null : lo; S.max = on ? null : hi;
        changed(t);
        return;
      }
      if (t.dataset.rm !== undefined) {
        const rm = t.dataset.rm, i = rm.indexOf(":"), k = i === -1 ? rm : rm.slice(0, i), v = i === -1 ? "" : rm.slice(i + 1);
        if (k === "all") {
          Object.assign(S, { cat: null, subs: [], brands: [], colors: [], sizes: [], min: null, max: null, stock: false, sale: false, q: "", qRaw: "", fromPromo: false });
        } else if (k === "q") { S.q = ""; S.qRaw = ""; }
        else if (k === "cat") { S.cat = null; S.subs = []; }
        else if (k === "price") { S.min = null; S.max = null; }
        else if (k === "stock" || k === "sale") { S[k] = false; if (k === "sale") S.fromPromo = false; }
        else { const key = { sub: "subs", brand: "brands", color: "colors", size: "sizes" }[k]; S[key] = S[key].filter(x => x !== v); }
        changed();
        return;
      }
      if (t.dataset.qcat) { S.cat = t.dataset.qcat; S.subs = []; changed(); return; }
      if (t.dataset.qsub) {
        const v = t.dataset.qsub, i = S.subs.indexOf(v);
        if (i === -1) S.subs.push(v); else S.subs.splice(i, 1);
        changed(root.querySelector(`[data-qsub="${CSS.escape(v)}"]`));
        return;
      }
      if (t.matches("[data-loadmore]")) {
        const from = S.shown;
        S.shown += PAGE;
        slot("grid").insertAdjacentHTML("beforeend", current.slice(from, S.shown).map(stikeProductCard).join(""));
        renderMore();
        const next = slot("grid").children[from];
        if (next) { const a = next.querySelector(".card-title a"); if (a) a.focus({ preventScroll: true }); }
        return;
      }
      if (t.matches(".cat-open")) { openDrawer(); return; }
      if (t.hasAttribute("data-close")) { closeDrawer(); return; }
    });
    backdrop.addEventListener("click", closeDrawer);

    /* Barra (look B): un clic fuera o Escape cierra el desplegable abierto. */
    document.addEventListener("click", e => {
      if (mode() !== "bar" || root.contains(e.target) && e.target.closest(".fg")) return;
      root.querySelectorAll(".fg.open").forEach(o => { o.classList.remove("open"); o.querySelector(".fg-t").setAttribute("aria-expanded", "false"); openMap.bar[o.dataset.g] = false; });
    });
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      if (flt.classList.contains("open")) { closeDrawer(); return; }
      const g = root.querySelector(".fg.open");
      if (g && mode() === "bar") { g.classList.remove("open"); openMap.bar[g.dataset.g] = false; const b = g.querySelector(".fg-t"); b.setAttribute("aria-expanded", "false"); b.focus(); }
    });

    function openDrawer() {
      flt.classList.add("open");
      backdrop.hidden = false;
      requestAnimationFrame(() => backdrop.classList.add("show"));
      document.body.style.overflow = "hidden";
      root.querySelector(".cat-open").setAttribute("aria-expanded", "true");
      flt.focus({ preventScroll: true });
    }
    function closeDrawer() {
      if (!flt.classList.contains("open")) return;
      flt.classList.remove("open");
      backdrop.classList.remove("show");
      setTimeout(() => { backdrop.hidden = true; }, 250);
      document.body.style.overflow = "";
      const btn = root.querySelector(".cat-open");
      btn.setAttribute("aria-expanded", "false");
      if (drawerMQ.matches) root.querySelector(".cat-bar").scrollIntoView({ block: "nearest" });
      btn.focus({ preventScroll: true });
    }
    const onMQ = () => { if (!drawerMQ.matches) closeDrawer(); renderGroups(); };
    if (drawerMQ.addEventListener) drawerMQ.addEventListener("change", onMQ); else drawerMQ.addListener(onMQ);

    update();

    /* Landings de parte: los links "Mas repuestos" del pie traian conteos
       escritos a mano que ya no cuadraban. Se recalculan en vivo y se
       ocultan los tipos sin productos. */
    if (lockSub) {
      document.querySelectorAll(".sibling-links .sib").forEach(a => {
        const name = (a.childNodes[0] && a.childNodes[0].nodeValue || "").trim();
        const n = STIKE_PRODUCTS.filter(p => p.sub === name).length;
        const b = a.querySelector("b");
        if (b) b.textContent = n;
        a.hidden = !n;
      });
    }
    return { state: S, refresh: update };
  };
})();

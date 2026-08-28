/* =========================================================================
   STIKE BIKE SHOP: generador de fichas de producto estaticas.
   Funcion PURA de string-replacement: toma un producto + el texto de
   _template.html y devuelve el HTML final de producto/<slug>.html.

   Se usa en DOS lugares que NUNCA deben divergir:
     1) El build inicial (Node, una sola vez) que genero /producto/*.html.
     2) admin.html, en el navegador, que regenera la pagina de un producto
        cada vez que se publica un cambio (ver publishCatalog en admin.html).
   Por eso vive en su propio archivo con doble export (browser + Node) en
   vez de estar copiada/pegada en los dos sitios.
   ========================================================================= */
(function (root) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
  function money(n) { return "$" + Number(n).toLocaleString("es-CO"); }

  var SITE_URL = "https://daniel666674.github.io/bmxstore";

  function poolTotal(pool) { return pool ? pool.reduce((s, r) => s + r.u, 0) : null; }

  function totalStock(p) {
    var sizeTotal = p.sizes ? poolTotal(p.sizes) : null;
    var colorTotal = p.colors ? poolTotal(p.colors) : null;
    if (sizeTotal != null && colorTotal != null) return Math.min(sizeTotal, colorTotal);
    if (sizeTotal != null) return sizeTotal;
    if (colorTotal != null) return colorTotal;
    return typeof p.units === "number" ? p.units : 0;
  }

  function renderGallery(p, coverUrl) {
    var imgs = (p.imgs && p.imgs.length) ? p.imgs : [coverUrl];
    var main = `<div class="main"><img id="main-img" src="${esc(imgs[0])}" alt="${esc(p.n)}"></div>`;
    var thumbs = imgs.map((src, i) =>
      `<button class="${i === 0 ? "active" : ""}" data-thumb data-src="${esc(src)}" aria-label="Vista ${i + 1}"><img src="${esc(src)}" alt="${esc(p.n)} vista ${i + 1}"></button>`
    ).join("");
    return `<div class="pdp-gallery">${main}<div class="pdp-thumbs">${thumbs}</div></div>`;
  }

  function renderSizeBlock(p) {
    if (!p.sizes) return "";
    var opts = p.sizes.map(s =>
      `<button type="button" class="size-opt${s.u <= 0 ? " out" : ""}" data-size="${esc(s.v)}" data-stock="${s.u}" ${s.u <= 0 ? "disabled" : ""}>${esc(s.v)}</button>`
    ).join("");
    return `<div class="size-select" data-variant="size">
      <div class="size-label">Talla <span class="size-req" id="size-req"></span></div>
      <div class="size-options" id="size-options">${opts}</div>
    </div>`;
  }
  function renderColorBlock(p) {
    if (!p.colors) return "";
    var opts = p.colors.map(c =>
      `<button type="button" class="size-opt${c.u <= 0 ? " out" : ""}" data-color="${esc(c.v)}" data-stock="${c.u}" ${c.u <= 0 ? "disabled" : ""}>${esc(c.v)}</button>`
    ).join("");
    return `<div class="size-select" data-variant="color">
      <div class="size-label">Color <span class="size-req" id="color-req"></span></div>
      <div class="size-options" id="color-options">${opts}</div>
    </div>`;
  }

  function renderSpecs(p) {
    return (p.spec || []).map(s => {
      var idx = s.indexOf(":");
      if (idx === -1) return `<div class="spec-row plain"><span class="v">${esc(s)}</span></div>`;
      return `<div class="spec-row"><span class="k">${esc(s.slice(0, idx))}</span><span class="v">${esc(s.slice(idx + 1).trim())}</span></div>`;
    }).join("");
  }

  function replaceAll(template, tokens) {
    var out = template;
    Object.keys(tokens).forEach(function (key) {
      out = out.split("__" + key + "__").join(tokens[key]);
    });
    return out;
  }

  /* categoryName/subLink son resueltos por el caller (que tiene STIKE_CATEGORIES
     disponible); esta funcion no depende de otros globals para poder correr
     igual en Node (build) y en el navegador (admin.html).                    */
  function renderProductPage(p, template, ctx) {
    ctx = ctx || {};
    var categoryName = ctx.categoryName || p.cat;
    var coverUrl = (p.imgs && p.imgs[0]) || ctx.placeholderImg || "";
    var out = totalStock(p);
    var low = out > 0 && out <= 5;
    var stockHtml = out > 0
      ? `<span class="stock${low ? " low" : ""}">● ${low ? `¡Solo ${out} disponible${out === 1 ? "" : "s"}!` : `En stock (${out} disponibles)`}</span>`
      : `<span class="stock out">● Agotado. Consúltanos por WhatsApp</span>`;
    var oldPrice = p.old ? `<span class="old">${money(p.old)}</span>` : "";
    var discount = p.old ? `<span class="tag-pill" style="background:var(--yellow);color:#0b0b0d;margin-left:10px">-${Math.round((1 - p.price / p.old) * 100)}%</span>` : "";
    var waMsg = encodeURIComponent(`Hola Stike! Me interesa: ${p.n} (${money(p.price)}). ¿Está disponible?`);
    var canonical = `${SITE_URL}/producto/${p.slug}.html`;
    var shareMsg = encodeURIComponent(`Mira este producto de Stike Bike Shop: ${p.n}, ${money(p.price)}\n${canonical}`);
    var ogImage = coverUrl ? (coverUrl.indexOf("http") === 0 ? coverUrl : `${SITE_URL}/${coverUrl.replace(/^\//, "")}`) : `${SITE_URL}/assets/img/og-stike.jpg`;
    var catLink = `tienda.html?cat=${esc(p.cat)}`;
    var subLink = p.sub ? `tienda.html?cat=${esc(p.cat)}&sub=${encodeURIComponent(p.sub)}` : null;
    var subCrumb = subLink ? `<span class="sep">/</span><a href="${subLink}" style="color:inherit">${esc(p.sub)}</a>` : "";

    return replaceAll(template, {
      TITLE: esc(p.n) + ": Stike Bike Shop",
      META_DESC: esc(ctx.metaDesc || `${p.n} de ${p.brand} en Stike Bike Shop, tu tienda BMX en Bogotá.`),
      CANONICAL: canonical,
      OG_IMAGE: ogImage,
      BREADCRUMB: `<a href="index.html">Inicio</a><span class="sep">/</span><a href="${catLink}">${esc(categoryName)}</a>${subCrumb}<span class="sep">/</span><span>${esc(p.n)}</span>`,
      GALLERY: renderGallery(p, coverUrl),
      BRAND: esc(p.brand),
      NAME: esc(p.n),
      PRICE_BLOCK: `${money(p.price)} ${oldPrice}${discount}`,
      STOCK_BLOCK: stockHtml,
      SIZE_BLOCK: renderSizeBlock(p),
      COLOR_BLOCK: renderColorBlock(p),
      ADD_DISABLED: out === 0 ? "disabled style=opacity:.5" : "",
      WA_HREF: `https://wa.me/${(ctx.whatsapp || "573118108848")}?text=${waMsg}`,
      SHARE_WA_HREF: `https://wa.me/?text=${shareMsg}`,
      DESC: esc(ctx.desc || p.desc || `${p.n} de ${p.brand}, disponible en Stike Bike Shop.`),
      SPECS: renderSpecs(p),
      CATEGORY_NAME: esc(categoryName),
      CATEGORY_LINK: catLink,
      SUB_BLOCK: subLink ? ` · <a href="${subLink}" style="color:var(--ink)">${esc(p.sub)}</a>` : "",
      SKU: esc(p.sku),
      SLUG: esc(p.slug),
    });
  }

  var api = { renderProductPage: renderProductPage, totalStock: totalStock };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PdpRender = api;
})(typeof window !== "undefined" ? window : globalThis);

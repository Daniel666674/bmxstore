/* =========================================================================
   STIKE BIKE SHOP: hidratacion de la ficha de producto estatica.
   El HTML de producto/<slug>.html ya viene pre-renderizado (SEO, precio,
   specs, opciones de talla/color con su stock en data-stock). Este script
   solo agrega interactividad: stepper de cantidad, seleccion de
   talla/color, agregar al carrito, galeria y "tambien te puede gustar".
   ========================================================================= */
function stikePdpInit(slug) {
  const p = stikeFindProduct(slug);
  const mount = document.querySelector(".pdp");
  if (!p) {
    if (mount) mount.innerHTML = `<div class="empty"><h3 style="font-size:30px">Producto no encontrado</h3><p>Es posible que ya no esté disponible.</p><a class="btn cyan" href="../tienda.html">Volver a la tienda</a></div>`;
    return;
  }

  let selectedSize = null;
  let selectedColor = null;
  // Con un solo valor real, la variante no tiene nada que elegir: se
  // autoselecciona (sigue mostrandose, es informativa, pero no bloquea el carrito).
  if (p.sizes && p.sizes.length === 1) selectedSize = p.sizes[0].v;
  if (p.colors && p.colors.length === 1) selectedColor = p.colors[0].v;

  const qtyEl = document.getElementById("qty");
  const addBtn = document.getElementById("add-btn");
  const waBuy = document.getElementById("wa-buy");
  const mainImg = document.getElementById("main-img");
  const thumbsBox = document.querySelector(".pdp-thumbs");
  const mainBox = document.querySelector(".pdp-gallery .main");

  // Cart icon on the add-to-cart button
  if (addBtn && !addBtn.querySelector("svg")) {
    addBtn.innerHTML = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>` + addBtn.textContent;
  }

  // Magnifier + lightbox: click the main photo (or the zoom button) to see it full-size
  if (mainBox && mainImg) {
    let lightbox = document.querySelector(".pdp-lightbox");
    if (!lightbox) {
      lightbox = document.createElement("div");
      lightbox.className = "pdp-lightbox";
      lightbox.innerHTML = `<button class="lb-close" aria-label="Cerrar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button><img alt="">`;
      document.body.appendChild(lightbox);
      const lbImg = lightbox.querySelector("img");
      const close = () => lightbox.classList.remove("open");
      lightbox.querySelector(".lb-close").addEventListener("click", close);
      lightbox.addEventListener("click", e => { if (e.target === lightbox) close(); });
      document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
      lightbox._open = src => { lbImg.src = src; lightbox.classList.add("open"); };
    }
    const zoomBtn = document.createElement("button");
    zoomBtn.className = "pdp-zoom";
    zoomBtn.type = "button";
    zoomBtn.setAttribute("aria-label", "Ver imagen completa");
    zoomBtn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>`;
    mainBox.appendChild(zoomBtn);
    const openLightbox = () => document.querySelector(".pdp-lightbox")._open(mainImg.src);
    zoomBtn.addEventListener("click", openLightbox);
    mainImg.addEventListener("click", openLightbox);
  }

  function currentStock() {
    return stikeStockFor(p, p.sizes ? selectedSize : undefined, p.colors ? selectedColor : undefined);
  }

  /* El texto lo redacta stikeWaText (assets/js/data.js), el mismo que usa el
     generador al hornear la ficha, para que el mensaje no dependa de si el
     cliente eligio variante o no. Si el producto esta agotado, el mensaje y
     la etiqueta del boton cambian a "avisame cuando llegue". */
  function updateWaBuy() {
    if (!waBuy) return;
    const msg = stikeWaText(p, { size: selectedSize, color: selectedColor, shortName: STIKE_CONFIG.name });
    waBuy.href = `https://wa.me/${STIKE_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    const label = stikeWaLabel(p);
    const labelEl = waBuy.querySelector(".wa-l") || waBuy;
    if (labelEl.textContent.trim() !== label) labelEl.textContent = label;
  }

  function applyColorGallery() {
    if (!selectedColor || !p.imgColorMap || !thumbsBox) return;
    const matches = (p.imgs || []).filter(u => p.imgColorMap[u] === selectedColor);
    if (!matches.length) return;
    if (mainImg) mainImg.src = matches[0];
    thumbsBox.querySelectorAll("[data-thumb]").forEach(btn => {
      const src = btn.getAttribute("data-src");
      const show = matches.includes(src);
      btn.style.display = show ? "" : "none";
      btn.classList.toggle("active", src === matches[0]);
    });
  }

  // Cantidad
  if (qtyEl) {
    document.querySelectorAll("[data-q]").forEach(b => b.addEventListener("click", () => {
      const stock = currentStock();
      let v = parseInt(qtyEl.value) || 1;
      v = Math.max(1, v + parseInt(b.getAttribute("data-q")));
      if (stock != null && stock > 0) v = Math.min(v, stock);
      qtyEl.value = v;
    }));
    qtyEl.addEventListener("input", () => { qtyEl.value = qtyEl.value.replace(/[^0-9]/g, ""); });
  }

  // Talla / color: los botones ya estan en el HTML (server-rendered) con su data-stock
  document.querySelectorAll("#size-options .size-opt").forEach(b => b.addEventListener("click", () => {
    if (b.disabled) return;
    document.querySelectorAll("#size-options .size-opt").forEach(o => o.classList.remove("active"));
    b.classList.add("active");
    selectedSize = b.getAttribute("data-size");
    const req = document.getElementById("size-req"); if (req) req.textContent = "";
    updateWaBuy();
  }));
  document.querySelectorAll("#color-options .size-opt").forEach(b => b.addEventListener("click", () => {
    if (b.disabled) return;
    document.querySelectorAll("#color-options .size-opt").forEach(o => o.classList.remove("active"));
    b.classList.add("active");
    selectedColor = b.getAttribute("data-color");
    const req = document.getElementById("color-req"); if (req) req.textContent = "";
    updateWaBuy();
    applyColorGallery();
  }));

  if (addBtn && !addBtn.disabled) addBtn.addEventListener("click", () => {
    if (p.sizes && !selectedSize) {
      const req = document.getElementById("size-req"); if (req) req.textContent = "(elige una talla)";
      const opts = document.getElementById("size-options");
      if (opts) { opts.classList.add("shake"); setTimeout(() => opts.classList.remove("shake"), 450); }
      stikeToast("Elige una talla primero");
      return;
    }
    if (p.colors && !selectedColor) {
      const req = document.getElementById("color-req"); if (req) req.textContent = "(elige un color)";
      const opts = document.getElementById("color-options");
      if (opts) { opts.classList.add("shake"); setTimeout(() => opts.classList.remove("shake"), 450); }
      stikeToast("Elige un color primero");
      return;
    }
    const stock = currentStock();
    if (stock != null && stock <= 0) { stikeToast("Sin stock para esa combinación"); return; }
    stikeAddToCart(p.slug, Math.max(1, parseInt(qtyEl.value) || 1), selectedSize, selectedColor);
  });

  // Compartir: copiar enlace
  const copyBtn = document.getElementById("share-copy");
  if (copyBtn) copyBtn.addEventListener("click", () => {
    const shareUrl = location.href;
    if (navigator.clipboard) navigator.clipboard.writeText(shareUrl).then(() => stikeToast("Enlace copiado")).catch(() => stikeToast("Copia: " + shareUrl));
    else stikeToast("Copia: " + shareUrl);
  });

  // Miniaturas: cambiar imagen principal
  if (thumbsBox) thumbsBox.querySelectorAll("[data-thumb]").forEach(t => t.addEventListener("click", () => {
    thumbsBox.querySelectorAll("[data-thumb]").forEach(o => o.classList.remove("active"));
    t.classList.add("active");
    const src = t.getAttribute("data-src");
    if (src && mainImg) mainImg.src = src;
  }));

  updateWaBuy();

  // Marca: enlace a todo lo de esa marca (el HTML horneado la trae como texto)
  const brandEl = document.querySelector(".pdp-brand");
  if (brandEl && p.brand && !brandEl.querySelector("a")) {
    brandEl.innerHTML = `<a href="tienda.html?brand=${encodeURIComponent(p.brand)}">${brandEl.textContent}</a>`;
  }

  // Cuotas: el mismo mensaje del banner ("3 cuotas sin interes"), con la cifra
  const inst = document.querySelector(".pdp-installments");
  if (inst && !stikeIsOut(p)) {
    const cuota = Math.ceil(p.price / 3 / 100) * 100;
    inst.innerHTML = `o <b>3 cuotas sin interés</b> de ${stikePrice(cuota)}`;
  }

  /* Barra de compra fija en el celular: aparece cuando el boton principal
     sale de la pantalla (leyendo specs o bajando a relacionados), para que
     comprar nunca quede a mas de un toque. */
  if (addBtn && "IntersectionObserver" in window) {
    const bar = document.createElement("div");
    bar.className = "pdp-bar";
    bar.setAttribute("aria-hidden", "true");
    const thumb = (p.imgs && p.imgs[0]) || "";
    const out = stikeIsOut(p);
    bar.innerHTML = `
      <img src="${thumb}" alt="">
      <div class="pdp-bar-t"><b>${p.n}</b><span>${stikePrice(p.price)}</span></div>
      <button type="button" class="btn sm" tabindex="-1">${out ? "Avísame" : (p.sizes && !selectedSize ? "Elegir talla" : "Agregar")}</button>`;
    document.body.appendChild(bar);
    bar.querySelector("button").addEventListener("click", () => {
      if (out) { if (waBuy) waBuy.click(); return; }
      if ((p.sizes && !selectedSize) || (p.colors && !selectedColor)) {
        const opts = document.querySelector(".size-select");
        if (opts) opts.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      addBtn.click();
    });
    new IntersectionObserver(([e]) => {
      const show = !e.isIntersecting && e.boundingClientRect.top < 0;
      bar.classList.toggle("show", show);
    }).observe(addBtn);
  }

  // Relacionados
  /* Relacionados en vivo, no horneados en el HTML: se calculan del catalogo
     que acaba de cargar, asi que no envejecen. Primero el mismo tipo de parte
     (quien mira un marco compara marcos), despues la misma categoria. Se
     excluye lo agotado: recomendar algo que no se puede comprar gasta el
     espacio de algo que si. STIKE_PRODUCTS ya viene sin borradores. */
  const vendible = x => x.slug !== p.slug && !stikeIsOut(x);
  const sameSub = STIKE_PRODUCTS.filter(x => p.sub && x.sub === p.sub && vendible(x));
  const sameCat = STIKE_PRODUCTS.filter(x => x.cat === p.cat && x.sub !== p.sub && vendible(x));
  let related = sameSub.concat(sameCat).slice(0, 4);
  if (!related.length) related = STIKE_PRODUCTS.filter(vendible).slice(0, 4);
  const relatedMount = document.getElementById("related");
  if (relatedMount) relatedMount.innerHTML = related.map(stikeProductCard).join("");
}

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

  function currentStock() {
    return stikeStockFor(p, p.sizes ? selectedSize : undefined, p.colors ? selectedColor : undefined);
  }

  function updateWaBuy() {
    const bits = [];
    if (selectedSize) bits.push("talla " + selectedSize);
    if (selectedColor) bits.push("color " + selectedColor);
    const variant = bits.length ? " (" + bits.join(", ") + ")" : "";
    const msg = encodeURIComponent(`Hola Stike! Me interesa: ${p.n}${variant} (${stikePrice(p.price)}). ¿Está disponible?`);
    if (waBuy) waBuy.href = `https://wa.me/${STIKE_CONFIG.whatsapp}?text=${msg}`;
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

  // Relacionados
  const related = STIKE_PRODUCTS.filter(x => x.cat === p.cat && x.slug !== p.slug).slice(0, 4);
  const fallback = STIKE_PRODUCTS.filter(x => x.slug !== p.slug).slice(0, 4);
  const relatedMount = document.getElementById("related");
  if (relatedMount) relatedMount.innerHTML = (related.length ? related : fallback).map(stikeProductCard).join("");
}

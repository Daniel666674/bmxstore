/* =========================================================================
   STIKE BIKE SHOP: Categorias, marcas y helpers de catalogo.
   El catalogo en si (window.STIKE_PRODUCTS) vive en products-data.js, que se
   carga ANTES de este archivo y es lo que el panel admin reescribe via la
   API de contenidos de GitHub. Todo en espanol. Precios en COP.
   ========================================================================= */

/* ----------------------- Categorias y subcategorias --------------------- */
const STIKE_CATEGORIES = [
  {
    slug: "repuestos",
    name: "Repuestos",
    blurb: "Cada parte de tu BMX",
    color: "c2",
    subs: [
      "Marcos", "Tenedores", "Timones", "Manubrios", "Bielas", "Platos",
      "Cadenas", "Frenos", "Manzanas", "Rines", "Llantas", "Pedales",
      "Sillas y Postes", "Tacos y Protectores de Maza", "Espigas"
    ]
  },
  {
    slug: "protecciones",
    name: "Protecciones",
    blurb: "Cascos, rodilleras y mas",
    color: "c3",
    subs: ["Cascos", "Rodilleras", "Coderas", "Guantes", "Espinilleras"]
  },
  {
    slug: "ropa",
    name: "Ropa",
    blurb: "Street wear con actitud",
    color: "c4",
    subs: ["Camisetas", "Busos y Chaquetas", "Gorras", "Gafas", "Tenis", "Jeans"]
  },
  {
    slug: "accesorios",
    name: "Accesorios",
    blurb: "Detalles que marcan",
    color: "c5",
    subs: ["Herramientas", "Grips", "Pegatinas", "Maletas", "Bombas", "Luces"]
  },
  {
    slug: "promo",
    name: "Promo",
    blurb: "Ofertas que vuelan",
    color: "c6",
    subs: []
  }
];

/* ------------------------------- Marcas -------------------------------- */
const STIKE_BRANDS = [
  "Total BMX", "Odyssey", "Shadow", "Cult", "Sunday", "Wethepeople",
  "Éclat", "Federal", "Kink", "BSD", "Fly Bikes", "Demolition",
  "SaltPlus", "Stranger", "Mutanty", "Trueno", "Fate BMX Colombia",
  "TSG", "KMC", "Cinema", "GW", "Fade", "Stike", "Smith"
];

/* ------------------- Categorias/subcategorias con talla obligatoria -----
   Estas subcategorias muestran en el admin una tabla "talla + stock por
   talla" en vez de un campo de unidades plano. El color (cuando el
   producto tiene 2+ colores reales) es SIEMPRE una segunda tabla
   independiente, sin importar la categoria; ver stikeStockFor().        */
const SIZE_CATEGORIES = new Set([
  "Cascos", "Rodilleras", "Coderas", "Guantes", "Espinilleras", // protecciones
  "Camisetas", "Busos y Chaquetas", "Jeans", "Tenis"            // ropa
]);

/* Rango de tallas sugerido al crear un producto en una SIZE_CATEGORIES sub */
function stikeSizeRangeFor(sub) {
  if (sub === "Tenis") return ["38", "39", "40", "41", "42", "43", "44"];
  if (sub === "Camisetas" || sub === "Busos y Chaquetas" || sub === "Jeans") return ["S", "M", "L", "XL", "XXL"];
  if (sub === "Cascos" || sub === "Rodilleras" || sub === "Coderas" || sub === "Guantes" || sub === "Espinilleras") return ["S", "M", "L", "XL"];
  return null;
}

/* --------------------- Codigos para generar SKU ------------------------- */
const SKU_CAT_CODES = { repuestos: "REP", protecciones: "PRO", ropa: "ROP", accesorios: "ACC" };
function skuBrandCode(brand, taken) {
  taken = taken || new Set();
  const letters = (brand || "GEN").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]/g, "") || "GEN";
  let code = letters.slice(0, 3).padEnd(3, "X");
  let i = 3;
  while (taken.has(code) && i < letters.length + 3) { code = (letters[0] + (letters[i - 2] || "X") + (letters[i - 1] || "X")).slice(0, 3); i++; }
  let n = 2;
  while (taken.has(code)) { code = (letters.slice(0, 2) + n).slice(0, 3); n++; }
  return code;
}

/* --------------------- Generador de imagen SVG (placeholder) ------------ */
/* Solo se usa cuando un producto no tiene foto real. Tratamiento premium
   monocromo: marco, marca de oso al agua y nombre. El acento de color se
   deriva del slug (determinista) en vez de guardarse como campo aparte. */
const STIKE_PALETTE = {
  pink:   ["#ffffff", "#18181b"],
  cyan:   ["#ffffff", "#161619"],
  yellow: ["#ffffff", "#1a1a1d"],
  lime:   ["#ffffff", "#141417"],
  orange: ["#ffffff", "#1c1c20"],
  purple: ["#ffffff", "#121215"]
};
const STIKE_PALETTE_KEYS = Object.keys(STIKE_PALETTE);
function stikeAccentFor(p) {
  const s = (p && (p.slug || p.n)) || "stike";
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return STIKE_PALETTE_KEYS[h % STIKE_PALETTE_KEYS.length];
}

function stikeProductImage(product, size) {
  if (product && product.imgs && product.imgs.length) return product.imgs[0];
  size = size || 600;
  const pal = STIKE_PALETTE[stikeAccentFor(product)];
  const label = (product.brand || "STIKE").toUpperCase();
  const name = (product.n || "").toUpperCase();
  const words = name.split(" ");
  const mid = Math.ceil(words.length / 2);
  const l1 = words.slice(0, mid).join(" ");
  const l2 = words.slice(mid).join(" ");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${pal[1]}"/>
      <stop offset="1" stop-color="#0a0a0b"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <rect x="22" y="22" width="556" height="556" rx="18" fill="none" stroke="#ffffff" stroke-opacity="0.10"/>
  <!-- marca de oso al agua -->
  <g transform="translate(300,266)" fill="#ffffff" opacity="0.05">
    <circle cx="-86" cy="-78" r="50"/>
    <circle cx="86" cy="-78" r="50"/>
    <ellipse cx="0" cy="8" rx="132" ry="120"/>
  </g>
  <!-- gafas (pista del oso) -->
  <g transform="translate(300,260)" fill="#0a0a0b" opacity="0.45">
    <rect x="-92" y="-8" width="74" height="40" rx="18"/>
    <rect x="18" y="-8" width="74" height="40" rx="18"/>
    <rect x="-22" y="2" width="44" height="14" rx="7"/>
  </g>
  <!-- marca -->
  <text x="46" y="70" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" letter-spacing="4" font-size="24" fill="#ffffff" opacity="0.92">${label}</text>
  <line x1="46" y1="84" x2="150" y2="84" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2"/>
  <!-- nombre -->
  <text x="300" y="500" text-anchor="middle" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" letter-spacing="1" font-size="34" fill="#ffffff" opacity="0.95">${l1}</text>
  <text x="300" y="540" text-anchor="middle" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" letter-spacing="1" font-size="34" fill="#ffffff" opacity="0.6">${l2}</text>
</svg>`.trim();
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/* Imagen a mostrar para un color concreto (si hay fotos etiquetadas), si no cae al cover */
function stikeImageForColor(p, colorValue) {
  if (colorValue && p.imgColorMap) {
    const hit = (p.imgs || []).find(u => p.imgColorMap[u] === colorValue);
    if (hit) return hit;
  }
  return stikeProductImage(p);
}

/* Helpers de busqueda usados por las paginas */
function stikeFindProduct(slug) { return STIKE_PRODUCTS.find(p => p.slug === slug); }
function stikeByCategory(slug) {
  if (slug === "promo") return STIKE_PRODUCTS.filter(p => p.promo);
  return STIKE_PRODUCTS.filter(p => p.cat === slug);
}
function stikeCategory(slug) { return STIKE_CATEGORIES.find(c => c.slug === slug); }

/* Formato de precio COP */
function stikePrice(n) {
  return "$" + n.toLocaleString("es-CO");
}

/* --------------------------- Tallas y colores ----------------------------
   Tallas y colores son pools de stock INDEPENDIENTES (no una matriz por
   combinacion). Si el producto tiene ambos, la cantidad vendible para una
   combinacion (talla, color) elegida es el minimo de las dos.            */
function stikeSizesFor(p) { return (p && p.sizes) || null; }
function stikeColorsFor(p) { return (p && p.colors) || null; }

function stikePoolStock(pool, value) {
  if (!pool) return null;
  const row = pool.find(r => r.v === value);
  return row ? row.u : 0;
}
function stikePoolTotal(pool) {
  if (!pool) return null;
  return pool.reduce((sum, r) => sum + r.u, 0);
}

/* Stock vendible real para la seleccion actual (talla y/o color elegidos) */
function stikeStockFor(p, size, color) {
  const sizeStock = p.sizes ? stikePoolStock(p.sizes, size) : null;
  const colorStock = p.colors ? stikePoolStock(p.colors, color) : null;
  if (p.sizes && p.colors) {
    if (size == null || color == null) return null; // falta elegir una de las dos
    return Math.min(sizeStock, colorStock);
  }
  if (p.sizes) return size == null ? null : sizeStock;
  if (p.colors) return color == null ? null : colorStock;
  return typeof p.units === "number" ? p.units : 0;
}

/* Total aproximado para la grilla (badge "Agotado" / "solo N") sin variante elegida.
   Ver nota en stikeIsOutOfStock: agotado real = alguna de las pools presentes suma 0. */
function stikeTotalStock(p) {
  const sizeTotal = p.sizes ? stikePoolTotal(p.sizes) : null;
  const colorTotal = p.colors ? stikePoolTotal(p.colors) : null;
  if (sizeTotal != null && colorTotal != null) return Math.min(sizeTotal, colorTotal);
  if (sizeTotal != null) return sizeTotal;
  if (colorTotal != null) return colorTotal;
  return typeof p.units === "number" ? p.units : 0;
}
function stikeIsOutOfStock(p) { return stikeTotalStock(p) <= 0; }

/* Etiqueta corta para tarjetas: chips de talla/color, tachados si agotados */
function stikeVariantChips(p) {
  const parts = [];
  if (p.sizes) parts.push(`<div class="swatch-row">${p.sizes.map(s => `<span class="swatch${s.u <= 0 ? " out" : ""}">${s.v}</span>`).join("")}</div>`);
  if (p.colors) parts.push(`<div class="swatch-row">${p.colors.map(c => `<span class="swatch${c.u <= 0 ? " out" : ""}">${c.v}</span>`).join("")}</div>`);
  return parts.join("");
}

# Stike Bike Shop — tienda BMX (Bogotá) + panel admin

Sitio para **Stike Bike Shop**, tienda BMX de Bogotá, con estética propia
**grafiti bogotano**: base oscura + acentos multicolor de arte callejero.
100% estático (HTML/CSS/JS sin frameworks ni build step) y con un panel
admin (`admin.html`) que habla directo con GitHub — **GitHub es el
backend**, no hay servidor ni base de datos.

> Vende por WhatsApp: no hay pasarela de pago. El carrito funciona con
> `localStorage` y el checkout arma un mensaje de WhatsApp con el pedido.

## ✨ Qué incluye

- **Multi-página**, 100% estático:
  - `index.html` — Home (hero, categorías, destacados, promo, marcas, comunidad)
  - `tienda.html` — Catálogo con **filtros** (categoría, marca, precio),
    **subcategorías**, **ordenamiento** y **búsqueda** (`?cat=`, `?sub=`, `?brand=`, `?q=`)
  - `producto/<slug>.html` — Una página **generada** por producto (galería,
    talla/color con stock real, cantidad, specs); `producto.html?id=` viejo
    redirige a la nueva URL
  - `carrito.html` — Carrito con cantidades, envío gratis y checkout por WhatsApp
  - `marcas.html`, `contacto.html`, `nosotros.html`, `armar.html` (configurador), `blog*.html`
  - `admin.html` — Panel de inventario (ver abajo)
- **Catálogo** en `assets/js/products-data.js` (`window.STIKE_PRODUCTS`, JS
  plano no JSON, para poder incluirlo con `<script src>` sin fetch/CORS).
  Cada producto puede tener **tallas y/o colores como pools de stock
  independientes** (ver `SIZE_CATEGORIES` en `assets/js/data.js`); si tiene
  ambos, la cantidad vendible de una combinación es el mínimo de las dos.
- **Textos editables** (hero de home + título/subtítulo de cada categoría)
  en `data/site-content.json`, editables desde el panel admin, aplicados por
  presencia de clave (ver pestaña "Contenido del sitio").

## 🔐 Panel admin (`admin.html`)

App de una sola página, sin build, que lee y escribe directo la API de
contenidos de GitHub (`assets/js/products-data.js`, `producto/*.html`,
`sitemap.xml`, y los archivos internos en `data/`).

- **Acceso**: clave compartida (demo — no es Google OAuth real, ver
  `CONFIG.passcode` en `admin.js`) + tu nombre/correo, que queda como firma
  en cada commit (`[tu correo] mensaje`). Correos en `CONFIG.ownerAllowlist`
  entran como **dueño** (ven costo/margen, KPIs y auditoría); cualquier otro
  correo con la clave entra como **editor** (CRUD + ventas, sin datos
  financieros). Esto es intencionalmente simple para una demo; si se quiere
  Google Sign-In real hay que registrar un OAuth Client ID en Google Cloud
  y reemplazar el gate en `admin.js`.
- **Token de GitHub**: cada admin pega su propio Personal Access Token
  (fine-grained, permiso *Contents: Read and write* sobre este repo) en la
  pestaña "Configuración". Se guarda solo en `localStorage` de ese
  navegador, nunca se publica.
- **Rama de publicación**: `CONFIG.branch` en `admin.js` (hoy
  `claude/sweet-albattani-ti0w0e`, la misma que dispara el deploy a GitHub
  Pages — ver `.github/workflows/deploy.yml`).
- **Costos internos**: `data/costs.json` (nunca se publica en
  `products-data.js` ni aparece en la ficha de ningún producto).
- **Reglas de correctitud** (uniqueness de slug/SKU en dos pasadas, nombres
  de foto aleatorios, merge de 3 vías campo por campo al publicar,
  reintento con backoff en conflictos 409, validación completa antes de
  publicar) están documentadas como comentarios en `admin.js`.

## ▶️ Cómo verlo

```bash
cd bmxstore
python3 -m http.server 8000
# abre http://localhost:8000
```

`admin.html` funciona igual en local, pero para cargar o publicar necesita
un token de GitHub real con acceso de escritura a este repo.

## 🛠️ Personalizar

- **Datos de contacto / redes:** `STIKE_CONFIG` al inicio de `assets/js/app.js`.
- **Categorías, marcas, tallas obligatorias, códigos de SKU:**
  `assets/js/data.js` (`STIKE_CATEGORIES`, `STIKE_BRANDS`, `SIZE_CATEGORIES`,
  `SKU_CAT_CODES`).
- **Catálogo:** editable a mano en `assets/js/products-data.js`, pero el
  flujo real es el panel admin (mantiene slugs/SKUs únicos, sube fotos,
  regenera las páginas de producto y el sitemap).
- **Colores / tipografía / estilos:** variables CSS en `assets/css/styles.css` (`:root`).
- **Textos del hero/categorías:** pestaña "Contenido del sitio" en el admin,
  o directo en `data/site-content.json`.

## 🚀 Deploy

Esto es una demo sin hosting propio: **GitHub Pages es el único deploy
real**. `.github/workflows/deploy.yml` publica todo el repo en cada push a
la rama configurada (hoy `claude/sweet-albattani-ti0w0e`) usando
`actions/deploy-pages`; no hace falta ningún secret, solo que "GitHub
Actions" esté seleccionado como fuente en Settings → Pages del repo (ya
lo estaba, porque el sitio ya vivía en
`https://daniel666674.github.io/bmxstore/` antes de este cambio).

`.htaccess` queda en el repo como referencia de la configuración
(cacheo de 1 año immutable en JS/CSS/imágenes/video, HTML sin cache, CSP)
que aplicaría si algún día esto se muda a un hosting real tipo Apache —
GitHub Pages no lee `.htaccess` ni permite headers custom, así que hoy no
está activo. El cache-busting real que SÍ aplica en Pages es el query
string `?v=N` en cada referencia a un archivo compartido; si editás el
CONTENIDO de `styles.css`/`data.js`/`app.js`/etc. acordate de subir ese
número en todos los HTML que lo referencian, si no los visitantes con
cache del navegador siguen viendo la versión vieja.

## 🗂️ Estructura

```
bmxstore/
├── index.html  tienda.html  carrito.html  marcas.html
├── contacto.html  nosotros.html  armar.html  blog*.html
├── admin.html  admin.js  admin-sw.js       ← panel de inventario
├── _template.html                          ← plantilla de producto/<slug>.html
├── producto/<slug>.html                    ← una página generada por producto
├── data/
│   ├── costs.json          (interno, nunca se publica al sitio)
│   ├── sales-log.json      (ventas, append-only)
│   ├── audit-log.json      (auditoría de publicaciones, append-only)
│   └── site-content.json   (textos editables del sitio)
└── assets/
    ├── css/styles.css
    └── js/{products-data.js, data.js, app.js, pdp.js, pdp-render.js, animations.js}
```

---
Sitio de demostración: reemplaza costos placeholder, la clave del panel y
los datos de contacto por los reales antes de operar con el negocio.

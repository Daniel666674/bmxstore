# Stike Bike Shop — tienda BMX (Bogotá) + panel admin

Sitio para **Stike Bike Shop**, tienda BMX de Bogotá, con estética propia
**monocroma en blanco y negro** (tipografía Archivo para títulos, Inter para
texto corrido; los acentos de color de la paleta original quedaron como una
rampa de grises, ver `:root` en `assets/css/styles.css`).
100% estático (HTML/CSS/JS sin frameworks ni build step) y con un panel
admin (`admin.html`) que habla directo con GitHub — **GitHub es el
backend**, no hay servidor ni base de datos.

> **Las reglas del motor** (qué se puede vender, qué se ve, cómo se publica)
> están en **[MOTOR.md](MOTOR.md)**, incluida la lista de en qué se aparta
> del motor de catálogo del que salió esta arquitectura. Si vas a tocar
> stock, visibilidad o la generación de fichas, ese es el documento.

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
  - `fate/` — Micro-sitio de **Fate BMX Colombia**, marca local que se vende
    acá: landing propia (`fate/index.html`) con header/nav/footer propios
    (no el header/footer compartido del resto del sitio), catálogo propio
    filtrable (`fate/tienda.html`) y un mini-blog editorial propio
    (`fate/blog.html` + `fate/historia-fate.html`, `fate/taller-fate.html`,
    `fate/riders-fate.html`, con el mismo sistema `.blog-grid`/`.article`
    que usa el blog principal), enlazados desde el nav principal y desde
    `marcas.html`/home con una banda destacada. Carrito y checkout por
    WhatsApp siguen siendo los de Stike; `marca-fate.html` viejo redirige acá.
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

- **Acceso**: ⚠️ **pendiente** — hoy entra directo, sin login, y las firmas
  de commit/ventas/auditoría usan un `session.email` fijo en `admin.js`. Lo
  único que realmente controla quién puede *publicar* es el token de GitHub
  (siguiente punto), y sin token el panel muestra datos de ejemplo, no los
  reales. Falta conectar Google Sign-In contra lista blanca: los campos ya
  están en `assets/js/site.js` (`OAUTH_CLIENT_ID`, `ADMIN_EMAILS`,
  `OWNER_EMAILS`) y mientras `ADMIN_EMAILS` esté vacío el panel se comporta
  como hasta hoy. `OWNER_EMAILS` es el segundo nivel: quién ve costos y
  márgenes (el código de roles ya existe, hoy todos entran como dueño).
- **Token de GitHub**: cada admin pega su propio Personal Access Token
  (fine-grained, permiso *Contents: Read and write* sobre este repo) en la
  pestaña "Configuración". Se guarda solo en `localStorage` de ese
  navegador, nunca se publica.
- **Rama de publicación**: `CONFIG.branch` en `admin.js` (hoy
  `main`, la misma que dispara el deploy a GitHub
  Pages — ver `.github/workflows/deploy.yml`).
- **Costos internos**: `data/costs.json` (nunca se publica en
  `products-data.js` ni aparece en la ficha de ningún producto). Desde el
  workflow de deploy, ese archivo y `data/sales-log.json` y
  `data/audit-log.json` **se excluyen del sitio publicado**, y un paso del
  workflow falla el deploy si alguna de esas rutas responde 200 en vivo.
  `data/site-content.json` sí queda público a propósito: el sitio lo
  consulta en vivo para los textos editables.
  Ojo: el repositorio es **público**, así que esos archivos siguen siendo
  legibles en github.com. Excluirlos del deploy cierra una puerta, no las
  dos — ver la nota al final de [MOTOR.md](MOTOR.md#5-publicar).
- **Reglas de correctitud** (uniqueness de slug/SKU en dos pasadas, nombres
  de foto aleatorios, merge de 3 vías campo por campo al publicar,
  reintento con backoff en conflictos 409, validación completa antes de
  publicar) están documentadas como comentarios en `admin.js`.
- **Editor de fotos**: el ✎ en cada miniatura del grid de fotos (dentro del
  editor de un producto) abre `assets/js/photo-editor.js` — girar 90°,
  voltear, recortar (arrastrando el cuadro), brillo/contraste/saturación,
  "Auto" de brillo (nivela la exposición de esta foto contra un valor
  estándar, para que varias fotos con distinta luz queden parejas) y
  "Emparejar fondo blanco" (mismo algoritmo que `tools/whiten-bg.mjs`,
  corrido en el navegador). Funciona igual para una foto recién agregada
  que para una ya publicada: al guardar, queda en el mismo lugar que
  ocupaba una foto nueva (`pendingUploads`) y se sube al publicar, como
  cualquier otro cambio sin guardar todavía.

## ▶️ Cómo verlo

```bash
# desde el directorio que CONTIENE bmxstore/, no desde adentro:
python3 -m http.server 8000
# abre http://localhost:8000/bmxstore/
```

Tiene que ser así porque las páginas llevan `<base href="/bmxstore/">` (el
sitio vive en un subdirectorio en GitHub Pages). Servido desde adentro, los
`assets/` dan 404 y la página carga sin JavaScript ni estilos. Cuando el
sitio pase a su dominio propio, `BASE_PATH` en `assets/js/site.js` pasa a
`"/"` y se sirve desde adentro con normalidad.

`admin.html` funciona igual en local, pero para cargar o publicar necesita
un token de GitHub real con acceso de escritura a este repo.

## 🛠️ Personalizar

- **Dominio y URL del sitio:** `assets/js/site.js`. Cambiar `DOMAIN` y
  `BASE_PATH` y correr `node tools/build-pages.mjs` reescribe las 52 fichas,
  el sitemap, el robots.txt y el `<base href>` de todas las páginas. Es el
  único lugar donde vive el dominio; no lo escribas a mano en ningún HTML.
- **Datos de contacto / redes:** `STIKE_CONFIG` al inicio de `assets/js/app.js`.
  (El número de WhatsApp está también en `site.js`, porque lo usan las fichas
  generadas; `tools/build-pages.mjs` se niega a generar si los dos no
  coinciden.)
- **Reglas de stock y visibilidad:** bloque `MOTOR DE STOCK` en
  `assets/js/data.js`. Después de tocarlo, `node tools/stock-test.mjs`.
- **Categorías, marcas, tallas obligatorias, códigos de SKU:**
  `assets/js/data.js` (`STIKE_CATEGORIES`, `STIKE_BRANDS`, `SIZE_CATEGORIES`,
  `SKU_CAT_CODES`).
- **Catálogo:** editable a mano en `assets/js/products-data.js`, pero el
  flujo real es el panel admin (mantiene slugs/SKUs únicos, sube fotos,
  regenera las páginas de producto y el sitemap).
- **Fondo blanco parejo en fotos de producto:** las tarjetas y la ficha
  pintan la plaqueta de blanco puro (`assets/css/styles.css`) porque las
  fotos de repuestos son cutouts de estudio con fondo blanco. Una foto de
  celular sobre papel (como las de ropa) trae el papel gris/tinturado y
  viñeteado, y se ve como una caja en vez de fundirse. `npm install` (una
  sola vez, instala `sharp`) y despues `node tools/whiten-bg.mjs
  <foto.jpg>...` la empareja: mide el color real en el marco exterior de
  la foto (fondo garantizado) y aclara/neutraliza el resto a partir de ahí,
  sin tocar el contraste propio de la prenda. `--preview` escribe
  `foto.preview.jpg` en vez de pisar el original.
- **Colores / tipografía / estilos:** variables CSS en `assets/css/styles.css` (`:root`).
- **Textos del hero/categorías:** pestaña "Contenido del sitio" en el admin,
  o directo en `data/site-content.json`.

## 🚀 Deploy

Esto es una demo sin hosting propio: **GitHub Pages es el único deploy
real**. `.github/workflows/deploy.yml` publica todo el repo en cada push a
la rama configurada (hoy `main`) usando
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

> Esto sigue siendo **a mano** y es el footgun que queda en pie:
> `tools/build-pages.mjs` no toca esos números. Automatizarlo (sellar el
> `?v=` con un hash del contenido del archivo, en el momento del deploy) es
> un cambio chico y pendiente; hoy la mitigación es acordarse, y que un
> visitante nuevo nunca ve el problema.

## 🗂️ Estructura

```
bmxstore/
├── index.html  tienda.html  carrito.html  marcas.html
├── contacto.html  nosotros.html  armar.html  blog*.html
├── admin.html  admin.js  admin-sw.js       ← panel de inventario
├── _template.html                          ← plantilla de producto/<slug>.html
├── producto/<slug>.html                    ← una página generada por producto
├── MOTOR.md                                ← las reglas del motor
├── tools/                                  ← build y pruebas (Node, no van al sitio)
│   ├── build-pages.mjs      regenera fichas/sitemap/robots/<base href>
│   ├── stock-test.mjs       19 casos del motor de stock, sin dependencias
│   ├── e2e-test.mjs         24 casos en navegador real (Playwright)
│   └── photo-test.mjs       el PNG transparente (Playwright)
├── data/
│   ├── costs.json          (interno, nunca se publica al sitio)
│   ├── sales-log.json      (ventas, append-only)
│   ├── audit-log.json      (auditoría de publicaciones, append-only)
│   └── site-content.json   (textos editables del sitio)
└── assets/
    ├── css/styles.css
    └── js/{site.js, products-data.js, data.js, app.js, pdp.js, pdp-render.js, animations.js}
```

---
**Antes de operar con el negocio:** conectar el acceso al panel (Google
Sign-In, ver arriba), completar los datos legales (`legalName` y `nit` en
`STIKE_CONFIG`, hoy con placeholders visibles en las páginas de términos y
privacidad) y revisar que los costos de `data/costs.json` sean los reales.

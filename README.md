# Stike Bike Shop — Mockup de tienda BMX (Bogotá)

Mockup de sitio web para **Stike Bike Shop**, una tienda BMX de Bogotá con
fuerte comunidad en Facebook e Instagram. La estructura (categorías, navegación,
fichas de producto, carrito) está inspirada en tiendas BMX como
[sabotageshop.com](https://sabotageshop.com/), con una estética propia
**grafiti bogotano**: base oscura + acentos multicolor de arte callejero.

> Es un **mockup de demostración**: sin backend ni pasarela de pago real.
> El carrito funciona con `localStorage` y el checkout abre WhatsApp.

## ✨ Qué incluye

- **Multi-página** y 100% funcional como sitio estático:
  - `index.html` — Home (hero, categorías, destacados, promo, marcas, comunidad)
  - `tienda.html` — Catálogo con **filtros** (categoría, marca, precio),
    **subcategorías**, **ordenamiento** y **búsqueda** (`?cat=`, `?sub=`, `?brand=`, `?q=`)
  - `producto.html?id=` — Ficha de producto con galería, cantidad y specs
  - `carrito.html` — Carrito con cantidades, envío gratis y checkout por WhatsApp
  - `marcas.html` — Listado de marcas
  - `contacto.html` — Contacto, FAQ, mapa (placeholder)
  - `nosotros.html` — Historia y comunidad
- **Navegación funcional** con mega-menú de repuestos y menú móvil.
- **Carrito persistente** (localStorage) con badge de cantidad en todo el sitio.
- **Categorías**: Repuestos (Marcos, Tenedores,
  Timones, Manubrios, Bielas, Platos, Cadenas, Frenos, Manzanas, Rines, Llantas,
  Pedales, Sillas y Postes, Tacos y Hubguards…), Protecciones, Ropa, Accesorios,
  Promo y Marcas. Las BMX se arman a medida (sin completas en catálogo).
- **Imágenes generadas** con SVG (sin dependencias externas ni imágenes rotas).
- **Responsive** y sin frameworks (HTML + CSS + JS puro).

## ▶️ Cómo verlo

Cualquier servidor estático sirve. Por ejemplo:

```bash
cd bmxstore
python3 -m http.server 8000
# abre http://localhost:8000
```

(También funciona abriendo `index.html` directamente en el navegador.)

## 🛠️ Personalizar

- **Datos de contacto / redes:** edita `STIKE_CONFIG` al inicio de
  `assets/js/app.js` (WhatsApp, dirección, IG/FB/TikTok, correo). Los números
  y direcciones actuales son **placeholders**.
- **Productos y categorías:** `assets/js/data.js`.
- **Colores / tipografía / estilos:** variables CSS en `assets/css/styles.css`
  (`:root`).

## 🗂️ Estructura

```
bmxstore/
├── index.html  tienda.html  producto.html  carrito.html
├── marcas.html  contacto.html  nosotros.html
└── assets/
    ├── css/styles.css
    └── js/{data.js, app.js}
```

---
Mockup creado como demostración. Reemplaza textos, precios e imágenes por los
reales antes de publicar.

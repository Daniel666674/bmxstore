# Propuesta — De mockup a tienda en línea real: Stike Bike Shop

**Preparado para:** Stike Bike Shop (Bogotá, D.C.)
**Estado del proyecto:** Mockup funcional desplegado en GitHub Pages
**Fecha:** Julio 2026

---

## 1. Resumen ejecutivo

Hoy Stike Bike Shop tiene un sitio web **estático, multi-página y completamente
navegable** que replica la experiencia de una tienda BMX en línea: catálogo
filtrable, fichas de producto, carrito, un configurador de bicicletas a medida,
contenido de blog con SEO, y una identidad visual propia (grafiti bogotano,
blanco y negro). Todo esto ya está en línea y es demostrable.

Lo que **no** tiene todavía es lo que convierte un mockup en un negocio: pagos
reales, inventario que se actualice solo, y las piezas legales que exige vender
en Colombia. Esta propuesta resume qué existe, qué falta, y en qué orden
recomendamos cerrar esa brecha.

---

## 2. Qué está implementado hoy

### 2.1 Catálogo y navegación
- **10 páginas funcionales**: Home, Tienda, Producto, Carrito, Marcas,
  Contacto, Nosotros, Armar tu BMX, Blog (+3 artículos).
- **50+ productos** organizados en 5 categorías y ~30 subcategorías
  (Repuestos, Protecciones, Ropa, Accesorios, Promo), con **22 marcas**
  incluyendo Fate BMX Colombia como marca local.
- **33+ fotos reales de producto** entregadas por la tienda, ya integradas.
- Filtros por categoría/subcategoría/marca/precio, orden y **búsqueda en vivo**
  (overlay con `⌘K`/`Ctrl+K`), con parámetros de URL (`?cat=`, `?sub=`, `?brand=`, `?q=`).
- Selector de talla en ropa, tenis y protecciones, con carrito que distingue
  variantes por talla.

### 2.2 Experiencia de compra (simulada)
- **Carrito persistente** (`localStorage`) con badge de cantidad en todo el sitio.
- **Checkout vía WhatsApp**: el pedido arma un mensaje pre-llenado y abre
  WhatsApp Business de la tienda — no hay pasarela de pago real.
- **"Arma tu BMX"**: configurador guiado de 5 pasos (marco, tenedor,
  transmisión, ruedas, timón) con vista previa SVG en vivo, precio y peso
  estimado, presupuesto con feedback, build compartible por link, y cotización
  directa por WhatsApp.
- Indicadores de urgencia de stock ("solo N unidades"), testimonios de riders,
  y botones de compartir producto (WhatsApp / copiar link).

### 2.3 Contenido y adquisición
- **Blog con 3 artículos** (historia del BMX, BMX en Bogotá, guía para armar tu
  bici) pensado para tráfico orgánico.
- **SEO/GEO sitewide**: datos estructurados (schema.org), Open Graph, sitemap
  y `robots.txt`.
- Redes reales conectadas: Instagram, Facebook, WhatsApp Business.

### 2.4 Infraestructura
- Sitio 100% estático (HTML/CSS/JS sin frameworks ni dependencias), fácil de
  auditar y económico de alojar.
- **Despliegue automático** a GitHub Pages en cada push a `main`
  (`.github/workflows/deploy.yml`).
- Personalización centralizada: datos de contacto en `STIKE_CONFIG`
  (`assets/js/app.js`), catálogo en `assets/js/data.js`, estilos en variables
  CSS de `assets/css/styles.css`.

> En una frase: **la vitrina y la experiencia de usuario ya están resueltas.**
> Lo que falta es lo transaccional, lo legal y lo operativo detrás de bambalinas.

---

## 3. Brecha entre el mockup y una tienda real

| Área | Hoy | Lo que falta para producción |
|---|---|---|
| **Pagos** | Ninguno — el "checkout" abre WhatsApp | Pasarela real (ej. Wompi, PayU, Mercado Pago) con confirmación automática de pago |
| **Inventario** | Catálogo fijo en un archivo JS, editado a mano | Panel/CMS donde la tienda agregue, edite y dé de baja productos sin tocar código |
| **Pedidos** | No quedan registrados en ningún lado | Registro de órdenes (base de datos), notificación al dueño, historial para el cliente |
| **Legal (Colombia)** | No hay políticas publicadas | Política de privacidad (Ley 1581/2012), términos y condiciones (Ley 1480/2011), política de cookies, y aviso de datos en formularios |
| **Dominio propio** | `daniel666674.github.io/bmxstore` | Dominio propio (ej. `stikebikeshop.com`) + correo corporativo |
| **Analítica** | Ninguna | Medición de visitas/conversión (ej. GA4 o Plausible) para decisiones de marketing |
| **Envíos** | Mencionado en texto, sin lógica real | Reglas de tarifas/zonas de envío o integración con transportadora |

Nada de esto invalida el trabajo hecho — es exactamente el flujo esperado: primero
se valida la experiencia (lo que ya se hizo y se puede mostrar hoy), después se
construye el motor transaccional detrás.

---

## 4. Propuesta de fases

### Fase 1 — Confianza y cumplimiento legal (fundación antes de vender)
- Publicar política de privacidad, términos y condiciones, y política de cookies
  ajustadas a Colombia (Ley 1581/2012, Ley 1480/2011).
- Banner de consentimiento de cookies y checkbox de datos en formularios.
- Dominio propio + correo corporativo.
- **Por qué primero:** es la base legal para poder cobrar y para que Google/Meta
  confíen en el sitio para anuncios pagados.

### Fase 2 — Pagos y pedidos reales
- Integración de pasarela de pago colombiana (tarjeta, PSE, Nequi).
- Registro de pedidos y notificación automática a la tienda (WhatsApp/correo/panel).
- Confirmación de compra al cliente (correo o WhatsApp automatizado).
- **Por qué segundo:** convierte el sitio de "vitrina" a "tienda que cobra sola".

### Fase 3 — Gestión de catálogo (CMS)
- Panel simple para que el equipo de Stike suba productos, fotos, precios y
  stock sin depender de un desarrollador.
- Sincronización de stock entre catálogo web y lo que hay físicamente en tienda.
- **Por qué tercero:** reduce dependencia técnica y permite escalar el catálogo.

### Fase 4 — Crecimiento
- Analítica de visitas/conversión y embudo de compra.
- Expansión del blog y SEO local (Bogotá, BMX Colombia) apalancando lo ya construido.
- Programa de fidelidad / newsletter, ya que la base de comunidad en Instagram/Facebook es fuerte.

---

## 5. Próximos pasos

Para avanzar necesitamos que la tienda defina:
1. **Pasarela de pago preferida** (Wompi, PayU, Mercado Pago, u otra) y si ya
   tienen cuenta comercial con alguna.
2. **Presupuesto y plazo** objetivo para pasar a producción, para dimensionar
   qué fases entran en la primera entrega.
3. **Datos legales del negocio** (razón social, NIT) requeridos para los
   documentos de términos y política de privacidad.
4. **Prioridad**: ¿lo más urgente es cobrar en línea (Fase 2) o primero
   publicar con respaldo legal y dominio propio (Fase 1)?

Con esas respuestas se puede convertir esta propuesta en un plan de trabajo
con fechas y entregables concretos.

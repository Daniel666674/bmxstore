# Propuesta — De mockup a tienda en línea real: Stike Bike Shop

**Preparado para:** Stike Bike Shop (Bogotá, D.C.)
**Estado del proyecto:** Mockup funcional desplegado en GitHub Pages
**Fecha:** 1 de julio de 2026

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

## 4. Oportunidad: BMX Day Bogotá — 19 de julio

El **19 de julio** se realiza el **BMX Day** en Bogotá: un jam grande donde
riders de toda la ciudad se reúnen y ruedan juntos por varios puntos. Es
tráfico real, concentrado, ya interesado en BMX — exactamente la audiencia de
Stike — y una oportunidad puntual que no se repite todos los meses.

Usarlo bien significa dos cosas:

- **Flujo real el día del evento**: códigos QR en stickers/volantes que
  lleven directo al sitio (a la tienda, o a una página del evento), para
  convertir gente que ya está en la calle con su bici en visitas medibles.
- **Señal para Google**: un pico real de visitas + una página nueva optimizada
  para "BMX Day Bogotá" + el sitemap ya enviado a Search Console **antes** del
  evento ayuda a que Google indexe y asocie el sitio con búsquedas locales de
  BMX en Bogotá — algo que normalmente toma meses de SEO orgánico lento.

Para aprovecharlo, el sitio necesita estar **públicamente listo (dominio
propio, sin errores, con analítica activa) antes del 19 de julio**, no
después. Eso fija la fecha límite realista para la Fase 1 del trabajo,
sin importar qué paquete se elija.

---

## 5. Oferta — 3 paquetes

Precios en pesos colombianos, mercado Bogotá. Cada paquete **incluye todo lo
del paquete anterior**. Lo ya construido (catálogo, carrito, "Arma tu BMX",
blog, SEO base, deploy automático) es la base de los tres — no se vuelve a
cobrar, se termina de pulir y se pone a producción.

### 🔹 Básico — $1.500.000 COP — *"Listo para el Jam"*
Deja el sitio público, legal y medible a tiempo para el 19 de julio.
- Auditoría y pulido final de contenido, fotos y precios reales
- Dominio propio conectado (ej. `stikebikeshop.com`) + 1 correo corporativo
- Páginas legales Colombia: privacidad (Ley 1581/2012), términos (Ley 1480/2011),
  cookies, con banner de consentimiento
- Google Analytics 4 + Search Console conectados y sitemap enviado
- Página/sección **"BMX Day Bogotá 19 de julio"** con SEO local, enlazada
  desde el home y el blog
- Set de códigos QR listos para imprimir en stickers/volantes para repartir en el evento
- Revisión de rendimiento y mobile antes del lanzamiento
- 1 semana de soporte post-lanzamiento

### 🔸 Premium — $2.500.000 COP — *"Pedidos organizados"*
Todo lo del Básico, más una operación más ordenada. El pago se sigue
coordinando por WhatsApp/transferencia manual — **todavía no hay pasarela**.
- Reglas de envío (zonas Bogotá / resto del país, tarifas y umbral de envío gratis)
- Registro estructurado de pedidos (el pedido queda guardado, no solo vive en
  un chat de WhatsApp) con notificación automática a la tienda
- Confirmación automática al cliente de que su pedido fue recibido
- Cobertura de blog/redes post-evento ("así vivimos el BMX Day") para SEO fresco
  y contenido reutilizable en Instagram/Facebook
- 2 semanas de soporte post-lanzamiento

### 🔺 Avanzado — $3.500.000 COP — *"Autónomo y cobrando solo"*
Todo lo del Premium, más el motor transaccional real y la independencia operativa.
- **Pasarela de pago colombiana real** (Wompi o equivalente: tarjeta, PSE,
  Nequi) con confirmación automática de pago — el checkout deja de depender
  de WhatsApp para cobrar
- Panel/CMS básico para que el equipo de Stike administre productos, precios
  y stock sin tocar código
- Captura de leads del evento: formulario/pop-up de newsletter + lista de
  WhatsApp, para convertir el flujo del BMX Day en clientes recurrentes
- Dashboard de conversión (embudo carrito → checkout/pago)
- 1 mes de soporte + una ronda de iteración basada en datos reales del evento
  (qué productos se vieron más, de dónde vino el tráfico)

> **No incluido en ningún paquete** (van por cuenta de la tienda):
> costo de registro/renovación del dominio, comisiones por transacción de la
> pasarela de pago (solo aplica en Avanzado), y presupuesto de pauta paga si
> se decide invertir en anuncios.

---

## 6. Mantenimiento mensual (opcional, después del lanzamiento)

Un sitio publicado necesita mantenerse: productos nuevos, precios que cambian,
respaldos, y — sobre todo después del BMX Day — aprovechar el impulso en vez
de dejar el sitio quieto otra vez. Esto es un servicio aparte, mes a mes, sin
permanencia mínima obligatoria.

### 🔹 Esencial — $180.000 COP/mes — *"Que no se caiga"*
- Monitoreo de disponibilidad y respaldo del código/contenido
- Hasta 2 cambios pequeños al mes (precios, textos, fotos)
- Revisión mensual de que enlaces, formularios y WhatsApp funcionen
- Soporte por WhatsApp/correo, respuesta en 48 h

### 🔸 Crecimiento — $380.000 COP/mes — *"Que siga vendiendo"*
Todo lo de Esencial, más:
- Hasta 6 actualizaciones al mes (productos nuevos, stock, precios, promos)
- Reporte mensual de analítica (visitas, productos más vistos, origen del tráfico)
- Revisión SEO mensual (sitemap, metadatos, velocidad)
- Soporte con respuesta en 24 h

### 🔺 Pro — $650.000 COP/mes — *"Que crezca cada mes"*
Todo lo de Crecimiento, más:
- Actualizaciones ilimitadas (dentro de uso razonable)
- 1 pieza de contenido nueva al mes (artículo de blog o campaña estacional) para SEO
- Si se tiene pasarela de pago (plan Avanzado): monitoreo y conciliación de pagos
- Llamada mensual de estrategia (qué está funcionando, qué mejorar)
- Soporte prioritario, respuesta el mismo día

---

## 7. Cronograma hacia el 19 de julio

Hoy es **1 de julio** — quedan **18 días**. El alcance de Básico y Premium
(dominio, legal, analítica, página del evento, QR, envíos, registro de
pedidos) no depende de terceros, así que es realista tenerlo listo para esa
fecha sin riesgo. El único riesgo fuera de nuestro control está en
**Avanzado**: la aprobación de cuenta comercial con la pasarela de pago (KYC)
la hace el proveedor externo y puede tardar días o semanas. Recomendación:

- **Semana 1–2 (1–14 jul):** trabajo de Básico/Premium +, si se eligió
  Avanzado, inicio inmediato en paralelo del trámite de cuenta comercial con
  la pasarela elegida (para no perder tiempo con el KYC).
- **15–18 jul:** publicación en dominio propio, pruebas finales, impresión de QR.
- **19 jul:** BMX Day — sitio en vivo, QR circulando, analítica capturando.
- **Después del evento:** si se eligió Avanzado, la pasarela de pago y el CMS
  se activan/afinan apenas el proveedor aprueba la cuenta, con datos reales
  de lo que trajo el evento.

---

## 8. Próximos pasos

Para arrancar necesitamos que la tienda defina:
1. **Qué paquete** (Básico, Premium o Avanzado).
2. **Si quieren mantenimiento mensual** (Esencial, Crecimiento o Pro) desde el lanzamiento o más adelante.
3. **Pasarela de pago preferida** (Wompi, PayU, Mercado Pago, u otra) y si ya
   tienen cuenta comercial con alguna — esto es lo más sensible al tiempo.
4. **Datos legales del negocio** (razón social, NIT) requeridos para los
   documentos de términos y política de privacidad.
5. **Dominio deseado** (o confirmar si ya tienen uno comprado).

Con esas respuestas arrancamos de inmediato, dado lo ajustado del plazo hasta
el 19 de julio.

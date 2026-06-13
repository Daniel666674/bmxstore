/* =========================================================================
   STIKE BIKE SHOP — Catálogo de datos (mock)
   Todo en español. Precios en COP (pesos colombianos).
   ========================================================================= */

/* ----------------------- Categorías y subcategorías --------------------- */
const STIKE_CATEGORIES = [
  {
    slug: "bicicletas",
    name: "Bicicletas",
    blurb: "Completas listas para rodar",
    color: "c1",
    subs: ["Pro / Expert", "Street", "Park", "Principiantes", "Niños"]
  },
  {
    slug: "repuestos",
    name: "Repuestos",
    blurb: "Cada parte de tu BMX",
    color: "c2",
    subs: [
      "Marcos", "Tenedores", "Timones", "Manubrios", "Bielas", "Platos",
      "Cadenas", "Frenos", "Manzanas", "Rines", "Llantas", "Pedales",
      "Sillas y Postes", "Tacos y Hubguards", "Espigas"
    ]
  },
  {
    slug: "protecciones",
    name: "Protecciones",
    blurb: "Cascos, rodilleras y más",
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
  "SaltPlus", "Stranger", "Mutanty", "Trueno", "Fate BMX Colombia"
];

/* ----------------------------- Productos -------------------------------- */
/* color = paleta del placeholder grafiti (pink|cyan|yellow|lime|orange|purple) */
const STIKE_PRODUCTS = [
  // ---- Bicicletas completas ----
  { id: "stk-pro20", name: "Stike Pro 20\" Completa", brand: "Stike", cat: "bicicletas", sub: "Pro / Expert", price: 1890000, old: 2150000, color: "pink", badge: "promo", stock: 6,
    desc: "Bicicleta BMX completa nivel pro. Marco cromoly 4130, ideal para street y park. Armada y revisada en nuestro taller en Bogotá.",
    specs: ["Marco: Cromoly 4130 full", "Rin: 20\"", "Sistema: Freecoaster", "Peso: 11.2 kg", "Frenos: U-brake trasero"] },
  { id: "stk-street20", name: "Cult Gateway Street 20\"", brand: "Cult", cat: "bicicletas", sub: "Street", price: 1650000, old: null, color: "cyan", badge: "new", stock: 4,
    desc: "Completa Cult Gateway, perfecta para empezar en el street con componentes de calidad y geometría versátil.",
    specs: ["Marco: Hi-Ten / Cromoly", "Rin: 20\"", "Top tube: 20.5\"", "Llantas: 2.4\"", "Tacos incluidos"] },
  { id: "stk-park20", name: "Sunday Primer Park 20\"", brand: "Sunday", cat: "bicicletas", sub: "Park", price: 1780000, old: null, color: "lime", badge: null, stock: 3,
    desc: "Sunday Primer, ágil y ligera para rampas y bowls. Respuesta inmediata y mucho estilo.",
    specs: ["Marco: Cromoly downtube", "Rin: 20\"", "Geometría park", "Manzana sellada", "Sprocket 25T"] },
  { id: "stk-kids16", name: "Stike Mini 16\" Niños", brand: "Stike", cat: "bicicletas", sub: "Niños", price: 720000, old: 850000, color: "yellow", badge: "promo", stock: 8,
    desc: "La primera BMX ideal para los más pequeños riders. Resistente, segura y lista para el parque.",
    specs: ["Rin: 16\"", "Edad: 5-8 años", "Freno trasero", "Ruedas de apoyo opcionales"] },
  { id: "stk-begin20", name: "Wethepeople Nova 20\"", brand: "Wethepeople", cat: "bicicletas", sub: "Principiantes", price: 1290000, old: null, color: "orange", badge: null, stock: 5,
    desc: "Completa accesible y confiable para arrancar en el BMX sin complicaciones.",
    specs: ["Marco: Hi-Ten", "Rin: 20\"", "Top tube: 20\"", "Freno U-brake"] },

  // ---- Repuestos: Marcos ----
  { id: "frame-total", name: "Marco Total Killabee K4", brand: "Total BMX", cat: "repuestos", sub: "Marcos", price: 980000, old: null, color: "cyan", badge: "new", stock: 4,
    desc: "Marco insignia de Total BMX, full cromoly con butados y geometría afinada para street/park.",
    specs: ["Material: Cromoly 4130 full", "Top tube: 20.8\"", "Ángulo dirección: 75°", "Peso: 2.1 kg"] },
  { id: "frame-fly", name: "Marco Fly Bikes Proton", brand: "Fly Bikes", cat: "repuestos", sub: "Marcos", price: 910000, old: 1040000, color: "purple", badge: "promo", stock: 2,
    desc: "Marco Fly Bikes Proton, ligero y reactivo. Tubería butada y dropouts integrados.",
    specs: ["Material: Cromoly", "Top tube: 21\"", "Chainstay: 13\"", "Made in Spain"] },

  // ---- Repuestos: Tenedores ----
  { id: "fork-odyssey", name: "Tenedor Odyssey R32", brand: "Odyssey", cat: "repuestos", sub: "Tenedores", price: 360000, old: null, color: "pink", badge: null, stock: 7,
    img: "assets/img/products/IMG_7181.jpeg",
    desc: "Tenedor Odyssey R32, el estándar de la industria. Cromoly butado y peg-friendly.",
    specs: ["Material: Cromoly 4130", "Offset: 32mm", "Eje: 10mm / 14mm", "Steerer butado"] },
  { id: "fork-shadow", name: "Tenedor Shadow Vultus", brand: "Shadow", cat: "repuestos", sub: "Tenedores", price: 330000, old: null, color: "lime", badge: null, stock: 5,
    img: "assets/img/products/IMG_7179.jpeg",
    desc: "Shadow Vultus, ultraligero con tecnología SST para máxima resistencia y poco peso.",
    specs: ["Material: SST Cromoly", "Offset: 30mm", "Peso: 0.85 kg"] },

  // ---- Repuestos: Timones / Manubrios ----
  { id: "bar-cult", name: "Manubrio Cult Crew 4pc", brand: "Cult", cat: "repuestos", sub: "Manubrios", price: 240000, old: null, color: "orange", badge: null, stock: 9,
    img: "assets/img/products/IMG_7175.jpeg",
    desc: "Manubrio 4 piezas Cult Crew, altura 9\", curva clásica y sensación sólida.",
    specs: ["Altura: 9.5\"", "Ancho: 29\"", "Material: Cromoly", "Backsweep: 12°"] },
  { id: "stem-eclat", name: "Timón Éclat Dynamic", brand: "Éclat", cat: "repuestos", sub: "Timones", price: 210000, old: 260000, color: "yellow", badge: "promo", stock: 6,
    img: "assets/img/products/IMG_7185.jpeg",
    desc: "Timón frontal Éclat Dynamic, mecanizado CNC y perfil bajo para mejor control.",
    specs: ["Tipo: Front load", "Material: 6061-T6", "Reach: 50mm", "Peso: 285g"] },

  // ---- Repuestos: Bielas / Platos ----
  { id: "crank-bsd", name: "Bielas BSD Substance XL", brand: "BSD", cat: "repuestos", sub: "Bielas", price: 540000, old: null, color: "cyan", badge: null, stock: 4,
    desc: "Bielas tubulares BSD Substance XL, eje de 24mm y resistencia comprobada en street.",
    specs: ["Largo: 175mm", "Eje: 24mm", "Material: Cromoly tubular", "Spline 48"] },
  { id: "sprk-shadow", name: "Plato Fate Garuda 25T Negro", brand: "Fate BMX Colombia", cat: "repuestos", sub: "Platos", price: 150000, old: null, color: "pink", badge: "new", stock: 12,
    img: "assets/img/products/F45D508E-ADC2-472F-AAFA-0ED417BD1C15.jpeg",
    desc: "Plato Fate Garuda 25T en negro, diseñado en Colombia. Guard integrado y mecanizado CNC.",
    specs: ["Dientes: 25T / 28T", "Material: 7075 alloy CNC", "Guard integrado", "Hecho en Colombia"] },

  // ---- Repuestos: Cadenas / Frenos ----
  { id: "chain-kmc", name: "Cadena Shadow Interlock V2", brand: "Shadow", cat: "repuestos", sub: "Cadenas", price: 95000, old: null, color: "lime", badge: null, stock: 15,
    img: "assets/img/products/IMG_7166.jpeg",
    desc: "Cadena media-link Shadow Interlock V2, súper resistente y fácil de reparar.",
    specs: ["Tipo: Half-link", "1/8\"", "Color: negro", "Pin reforzado"] },
  { id: "brake-odyssey", name: "Freno Odyssey Springfield", brand: "Odyssey", cat: "repuestos", sub: "Frenos", price: 180000, old: null, color: "purple", badge: null, stock: 6,
    desc: "Kit de freno U-brake Odyssey Springfield con palanca Monolever. Frenadas precisas.",
    specs: ["Tipo: U-brake", "Incluye palanca", "Pads M2", "Cable incluido"] },

  // ---- Repuestos: Manzanas / Rines / Llantas ----
  { id: "hub-fed", name: "Manzana Federal Stance FC", brand: "Federal", cat: "repuestos", sub: "Manzanas", price: 620000, old: 720000, color: "orange", badge: "promo", stock: 3,
    desc: "Manzana freecoaster Federal Stance FC, slack ajustable y rodamientos sellados.",
    specs: ["Tipo: Freecoaster", "Hueco: 9T", "Slack ajustable", "Eje 14mm"] },
  { id: "rim-eclat", name: "Rin Éclat Bondi 36H", brand: "Éclat", cat: "repuestos", sub: "Rines", price: 210000, old: null, color: "cyan", badge: null, stock: 8,
    img: "assets/img/products/IMG_7171.jpeg",
    desc: "Rin doble pared Éclat Bondi, 36 huecos, ligero y resistente para impactos fuertes.",
    specs: ["Huecos: 36", "Doble pared", "Material: 6061", "Pinned joint"] },
  { id: "tire-total", name: "Llanta Total Killabee 2.4\"", brand: "Total BMX", cat: "repuestos", sub: "Llantas", price: 120000, old: null, color: "yellow", badge: null, stock: 20,
    img: "assets/img/products/IMG_7170.jpeg",
    desc: "Llanta Total Killabee 2.4\", buen agarre y baja resistencia para rodar rápido.",
    specs: ["Medida: 20\" x 2.4\"", "100 PSI", "Dual compound", "Folding bead"] },

  // ---- Repuestos: Pedales / Sillas / Tacos ----
  { id: "pedal-odyssey", name: "Pedales Plataforma BMX Negro", brand: "Odyssey", cat: "repuestos", sub: "Pedales", price: 85000, old: null, color: "pink", badge: null, stock: 25,
    img: "assets/img/products/IMG_7143.jpeg",
    desc: "Pedales plataforma de nylon/fibra reforzada, excelente grip y eje sellado de acero.",
    specs: ["Material: Nylon/Fibra", "Eje: sellado acero", "Plataforma ancha", "9/16\""] },
  { id: "seat-cult", name: "Silla Fate Pivotal Pana Negro", brand: "Fate BMX Colombia", cat: "repuestos", sub: "Sillas y Postes", price: 130000, old: null, color: "lime", badge: "new", stock: 10,
    img: "assets/img/products/3A06D926-2987-4488-AA12-28567FE35426.jpeg",
    desc: "Silla pivotal Fate BMX Colombia en pana negra. Diseño original corte clásico, muy cómoda.",
    specs: ["Tipo: Pivotal", "Material: Pana negro", "Corte original", "Hecha en Colombia"] },
  { id: "peg-shadow", name: "Tacos Fate BMX (par)", brand: "Fate BMX Colombia", cat: "repuestos", sub: "Tacos y Hubguards", price: 90000, old: null, color: "purple", badge: null, stock: 14,
    img: "assets/img/products/IMG_7145.jpeg",
    desc: "Par de tacos Fate BMX de aluminio anodizado, deslizamiento fluido en mármol, cemento y acero.",
    specs: ["Material: Aluminio 6061", "Largo: 4.5\"", "Eje: 10/14mm", "Incluye par"] },

  // ---- Protecciones ----
  { id: "helmet-tsg", name: "Casco TSG Evolution Salmón", brand: "Stike", cat: "protecciones", sub: "Cascos", price: 230000, old: null, color: "pink", badge: "new", stock: 12,
    img: "assets/img/products/IMG_7130.jpeg",
    desc: "Casco TSG Evolution, certificado CE para street y park. Forro extraíble y ajuste de carraca.",
    specs: ["Certificación: CE EN1078", "Tallas: S/M/L/XL", "10 ventilaciones", "Forro lavable"] },
  { id: "knee-fuse", name: "Rodilleras Fuse Echo", brand: "Stike", cat: "protecciones", sub: "Rodilleras", price: 175000, old: 210000, color: "cyan", badge: "promo", stock: 9,
    desc: "Rodilleras ligeras con buena movilidad y protección sólida para caídas duras.",
    specs: ["Tallas: S-XL", "Ventiladas", "Lavables", "Ajuste con velcro"] },
  { id: "gloves-stike", name: "Guantes Stike Grip", brand: "Stike", cat: "protecciones", sub: "Guantes", price: 65000, old: null, color: "lime", badge: null, stock: 18,
    desc: "Guantes de palma reforzada con buen tacto en el manubrio. Compatibles con pantalla táctil.",
    specs: ["Tallas: S-XL", "Palma reforzada", "Transpirables"] },

  // ---- Ropa ----
  { id: "tee-stike", name: "Camiseta Stike Graffiti Tee", brand: "Stike", cat: "ropa", sub: "Camisetas", price: 79000, old: null, color: "pink", badge: "new", stock: 30,
    desc: "Camiseta 100% algodón con estampado grafiti exclusivo de Stike Bogotá. Edición de la comunidad.",
    specs: ["Material: 100% algodón", "Tallas: S-XXL", "Estampado serigrafía", "Fit regular"] },
  { id: "hoodie-stike", name: "Buso Stike Box Logo", brand: "Stike", cat: "ropa", sub: "Busos y Chaquetas", price: 165000, old: 199000, color: "orange", badge: "promo", stock: 16,
    desc: "Hoodie pesado con box logo bordado. El favorito para rodar en las noches frías de Bogotá.",
    specs: ["Material: Algodón/poly 320g", "Tallas: S-XXL", "Logo bordado", "Bolsillo canguro"] },
  { id: "cap-stike", name: "Gorra Fate BMX Colombia", brand: "Fate BMX Colombia", cat: "ropa", sub: "Gorras", price: 69000, old: null, color: "yellow", badge: "new", stock: 22,
    img: "assets/img/products/IMG_7138.jpeg",
    desc: "Gorra negra Fate BMX Colombia, logo bordado en hilo blanco. Orgullosamente colombiana.",
    specs: ["Tipo: Dad hat", "Ajuste con hebilla", "Logo bordado", "Hecha en Colombia"] },
  { id: "sunnies-stike", name: "Gafas Stike UV400", brand: "Stike", cat: "ropa", sub: "Gafas", price: 95000, old: null, color: "cyan", badge: null, stock: 14,
    desc: "Gafas con protección UV400 y lentes resistentes a impactos. Para rodar bajo el sol bogotano.",
    specs: ["Protección: UV400", "Lente policarbonato", "Montura flexible"] },
  { id: "shoes-vans", name: "Tenis Stike x Street", brand: "Stike", cat: "ropa", sub: "Tenis", price: 245000, old: null, color: "purple", badge: null, stock: 11,
    desc: "Tenis de suela vulcanizada con buen grip en los pedales. Diseño resistente al desgaste.",
    specs: ["Suela: vulcanizada", "Tallas: 38-44", "Refuerzo en empeine"] },

  // ---- Accesorios ----
  { id: "tool-stike", name: "Multiherramienta Stike 18-en-1", brand: "Stike", cat: "accesorios", sub: "Herramientas", price: 89000, old: null, color: "lime", badge: "new", stock: 20,
    desc: "Multiherramienta compacta con todo lo necesario para ajustes rápidos en la calle.",
    specs: ["18 funciones", "Acero cromo-vanadio", "Estuche incluido"] },
  { id: "grip-odi", name: "Grips Wethepeople Flow XL", brand: "Wethepeople", cat: "accesorios", sub: "Grips", price: 55000, old: null, color: "pink", badge: null, stock: 28,
    img: "assets/img/products/IMG_7182.jpeg",
    desc: "Grips Wethepeople Flow XL, textura acanalada y compound firme para máximo control.",
    specs: ["Largo: 160mm", "Sin flange", "Compound firm", "Tapones incluidos"] },
  { id: "pump-stike", name: "Bomba de piso Stike Pro", brand: "Stike", cat: "accesorios", sub: "Bombas", price: 110000, old: 135000, color: "orange", badge: "promo", stock: 13,
    desc: "Bomba de piso con manómetro, válvula Presta/Schrader. Infla rápido y preciso.",
    specs: ["Presión: 160 PSI", "Manómetro análogo", "Doble válvula"] },
  { id: "stickers-stike", name: "Sticker Pack Stike Graffiti", brand: "Stike", cat: "accesorios", sub: "Pegatinas", price: 25000, old: null, color: "yellow", badge: null, stock: 50,
    desc: "Pack de 12 calcomanías resistentes al agua con los diseños grafiti de la marca.",
    specs: ["12 stickers", "Vinilo resistente", "Anti-agua / anti-UV"] },

  // ---- Nuevos productos (imágenes reales) ----
  { id: "chain-silver", name: "Cadena KMC Z410 Plata", brand: "Kink", cat: "repuestos", sub: "Cadenas", price: 75000, old: null, color: "cyan", badge: "new", stock: 18,
    img: "assets/img/products/IMG_7165.jpeg",
    desc: "Cadena KMC Z410 niquelada, resistente y de fácil mantenimiento. Ideal para armar o reponer.",
    specs: ["Tipo: 1/8\"", "Color: plateado", "Eslabón estándar", "Compatible BMX"] },

  { id: "tire-street", name: "Llanta BMX Street 2.25\"", brand: "Federal", cat: "repuestos", sub: "Llantas", price: 95000, old: null, color: "lime", badge: null, stock: 12,
    img: "assets/img/products/IMG_7167.jpeg",
    desc: "Llanta de perfil bajo para street y skatepark, con buen grip en concreto y asfalto.",
    specs: ["Medida: 20\" x 2.25\"", "Perfil bajo", "Wire bead", "90 PSI max"] },

  { id: "rim-eclat-2", name: "Rin Éclat Cortex 20H Negro", brand: "Éclat", cat: "repuestos", sub: "Rines", price: 195000, old: null, color: "purple", badge: null, stock: 5,
    img: "assets/img/products/IMG_7172.jpeg",
    desc: "Versión 20 huecos del Éclat Cortex, para riders que priorizan peso sin sacrificar resistencia.",
    specs: ["Huecos: 20", "Doble pared", "Material: 6061", "Pinned joint"] },

  { id: "rim-fly", name: "Rin Fly Bikes Neutron 36H", brand: "Fly Bikes", cat: "repuestos", sub: "Rines", price: 205000, old: 240000, color: "orange", badge: "promo", stock: 4,
    img: "assets/img/products/IMG_7173.jpeg",
    desc: "Rin Fly Bikes Neutron ultra reforzado con pinned joint y acabado anodizado negro.",
    specs: ["Huecos: 36", "Doble pared", "Anodizado negro", "Pinned joint"] },

  { id: "bar-saltplus", name: "Manubrio SaltPlus Race 4pc", brand: "SaltPlus", cat: "repuestos", sub: "Manubrios", price: 235000, old: null, color: "cyan", badge: null, stock: 6,
    img: "assets/img/products/IMG_7176.jpeg",
    desc: "Manubrio SaltPlus Race de 4 piezas en cromoly, altura 9.5\" y buen backsweep.",
    specs: ["Altura: 9.5\"", "Ancho: 28.5\"", "Material: Cromoly", "Backsweep: 10°"] },

  { id: "bar-stranger", name: "Manubrio Stranger Highrise 9.5\"", brand: "Stranger", cat: "repuestos", sub: "Manubrios", price: 260000, old: null, color: "lime", badge: "new", stock: 5,
    img: "assets/img/products/IMG_7177.jpeg",
    desc: "Manubrio Stranger Highrise, cromoly full con crossbar. Sensación rígida y gran control.",
    specs: ["Altura: 9.5\"", "Ancho: 29\"", "Material: Cromoly full", "Crossbar incluido"] },

  { id: "fork-cruiser", name: "Tenedor Cruiser 26\" Negro", brand: "Federal", cat: "repuestos", sub: "Tenedores", price: 280000, old: null, color: "orange", badge: null, stock: 3,
    img: "assets/img/products/IMG_7178.jpeg",
    desc: "Tenedor cromoly para BMX cruiser 26\", pintado negro con acabado brillante.",
    specs: ["Rueda: 26\"", "Material: Cromoly", "Eje: 10mm", "Offset: 28mm"] },

  { id: "expander-mutanty", name: "Expander Mutanty M24", brand: "Mutanty", cat: "accesorios", sub: "Herramientas", price: 35000, old: null, color: "purple", badge: null, stock: 25,
    img: "assets/img/products/IMG_7180.jpeg",
    desc: "Expander de aluminio anodizado M24 para horquillas sin rosca. Fácil instalación.",
    specs: ["Tamaño: M24", "Material: Aluminio 6061", "Llave Allen 6mm"] },

  { id: "grip-kink", name: "Grips Kink Form Flangeless", brand: "Kink", cat: "accesorios", sub: "Grips", price: 48000, old: null, color: "cyan", badge: null, stock: 22,
    img: "assets/img/products/IMG_7183.jpeg",
    desc: "Grips Kink Form sin flange, compound suave y agarre consistente en toda condición.",
    specs: ["Sin flange", "Largo: 155mm", "Compound suave", "Tapones incluidos"] },

  { id: "grip-eclat-red", name: "Grips Éclat Recoil Rojo", brand: "Éclat", cat: "accesorios", sub: "Grips", price: 62000, old: null, color: "pink", badge: "new", stock: 15,
    img: "assets/img/products/IMG_7184.jpeg",
    desc: "Grips Éclat Recoil en rojo vivo con tapones a juego. Doble compound para máximo grip.",
    specs: ["Color: rojo", "Flange incluido", "Doble compound", "Tapones a juego"] },

  { id: "stem-trueno", name: "Timón Trueno Front Load", brand: "Trueno", cat: "repuestos", sub: "Timones", price: 195000, old: null, color: "orange", badge: "new", stock: 7,
    img: "assets/img/products/IMG_7186.jpeg",
    desc: "Timón Trueno mecanizado CNC, carga frontal con clamp dentado para mayor agarre.",
    specs: ["Tipo: Front load", "Material: 6061 CNC", "Reach: 53mm", "Clamp dentado"] },

  // ---- Nuevos productos ZIPs 2 & 3 (Fate BMX Colombia + otros) ----
  { id: "stem-kink", name: "Timón Kink Williams Front Load", brand: "Kink", cat: "repuestos", sub: "Timones", price: 225000, old: null, color: "yellow", badge: null, stock: 8,
    img: "assets/img/products/IMG_7122.jpeg",
    desc: "Timón Kink Williams de 4 tornillos, mecanizado CNC, robusto y perfectamente equilibrado.",
    specs: ["Tipo: Front load", "Material: 6061 CNC", "4 tornillos", "Reach: 52mm"] },

  { id: "helmet-tsg-white", name: "Casco TSG Evolution Blanco", brand: "Stike", cat: "protecciones", sub: "Cascos", price: 230000, old: null, color: "cyan", badge: null, stock: 9,
    img: "assets/img/products/IMG_7131.jpeg",
    desc: "Casco TSG Evolution en blanco mate, ligero y certificado. El favorito de los riders urbanos.",
    specs: ["Certificación: CE EN1078", "Tallas: S/M/L/XL", "10 ventilaciones", "Forro lavable"] },

  { id: "cap-federal", name: "Gorra Federal Script Cap", brand: "Federal", cat: "ropa", sub: "Gorras", price: 65000, old: null, color: "orange", badge: null, stock: 18,
    img: "assets/img/products/IMG_7137.jpeg",
    desc: "Gorra Federal con logo bordado en rojo y blanco. Clásica snapback estructurada.",
    specs: ["Tipo: Snapback", "6 paneles", "Ajuste universal", "Logo bordado"] },

  { id: "frame-fate", name: "Marco Fate BMX Colombia", brand: "Fate BMX Colombia", cat: "repuestos", sub: "Marcos", price: 890000, old: null, color: "cyan", badge: "new", stock: 4,
    img: "assets/img/products/IMG_7139.jpeg",
    desc: "Marco Fate BMX Colombia. Diseñado y fabricado en Colombia por riders para riders. Cromoly full.",
    specs: ["Material: Cromoly 4130", "Top tube: 20.75\"", "Chainstay: 13\"", "Hecho en Colombia"] },

  { id: "sprk-fate-chrome", name: "Plato Fate Garuda 25T Cromado", brand: "Fate BMX Colombia", cat: "repuestos", sub: "Platos", price: 160000, old: null, color: "lime", badge: null, stock: 8,
    img: "assets/img/products/EA19B12C-1FBD-4387-A361-7A4AED292633.jpeg",
    desc: "Versión cromada del Plato Fate Garuda. Guard integrado, mecanizado CNC y brillo impecable.",
    specs: ["Dientes: 25T / 28T", "Material: 7075 alloy CNC", "Guard integrado", "Color: cromado"] },

  { id: "seat-fate-leather", name: "Silla Fate Pivotal Cuero Negro", brand: "Fate BMX Colombia", cat: "repuestos", sub: "Sillas y Postes", price: 140000, old: null, color: "purple", badge: null, stock: 7,
    img: "assets/img/products/3B54281B-6080-4074-A754-4142F71ADBC2.jpeg",
    desc: "Silla pivotal Fate BMX Colombia en cuero negro. Diseño firme y cómodo, corte original.",
    specs: ["Tipo: Pivotal", "Material: Cuero negro", "Corte original", "Hecha en Colombia"] },

  // ---- Lote nuevo: marcos, mazas y pedales (fotos reales) ----
  { id: "frame-cult-wb", name: "Marco Cult Control 20.75\" Blanco/Azul", brand: "Cult", cat: "repuestos", sub: "Marcos", price: 1050000, old: 1180000, color: "cyan", badge: "promo", stock: 3,
    img: "assets/img/products/IMG_7258.jpeg",
    desc: "Marco Cult Control en cromoly 4130 con acabado fade blanco a azul y detalles rojos. Geometría street/park versátil.",
    specs: ["Material: Cromoly 4130 full", "Top tube: 20.75\"", "Trasero: 13.2\" - 13.6\"", "Mounts: removibles", "Color: Blanco/Azul"] },

  { id: "frame-federal-white", name: "Marco Federal Bruno LT Blanco", brand: "Federal", cat: "repuestos", sub: "Marcos", price: 980000, old: null, color: "lime", badge: "new", stock: 4,
    img: "assets/img/products/IMG_7259.jpeg",
    desc: "Marco Federal Bruno LT en blanco mate. Liviano, rígido y pensado para street técnico.",
    specs: ["Material: 13-Cromoly", "Top tube: 21\"", "Investment cast", "Mounts: removibles", "Color: Blanco mate"] },

  { id: "frame-wtp-green", name: "Marco Wethepeople Battleship Verde", brand: "Wethepeople", cat: "repuestos", sub: "Marcos", price: 1020000, old: null, color: "lime", badge: "new", stock: 3,
    img: "assets/img/products/IMG_7260.jpeg",
    desc: "Marco Wethepeople Battleship en verde lima. Tubería cromoly full con geometría para park y trails.",
    specs: ["Material: Cromoly 4130 full", "Top tube: 20.85\"", "Mid BB", "Verde lima", "Made for park/dirt"] },

  { id: "hub-cassette-black", name: "Maza Trasera Cassette Shadow Negra", brand: "Shadow", cat: "repuestos", sub: "Manzanas", price: 560000, old: null, color: "pink", badge: null, stock: 5,
    img: "assets/img/products/IMG_7264.jpeg",
    desc: "Maza trasera cassette Shadow en negro, engrane rápido y sellado para uso intensivo.",
    specs: ["Tipo: Cassette", "Driver: 9T", "Engrane: 60 puntos", "Eje: 14mm", "Color: Negro"] },

  { id: "hub-rear-eclat", name: "Maza Trasera Éclat Negra", brand: "Éclat", cat: "repuestos", sub: "Manzanas", price: 540000, old: 620000, color: "cyan", badge: "promo", stock: 4,
    img: "assets/img/products/IMG_7265.jpeg",
    desc: "Maza trasera Éclat sellada en negro mate. Confiable, suave y de fácil mantenimiento.",
    specs: ["Tipo: Cassette", "Driver: 9T", "Rodamientos sellados", "Eje: 14mm", "Color: Negro"] },

  { id: "hub-chrome", name: "Maza Trasera Cassette Cromada", brand: "Éclat", cat: "repuestos", sub: "Manzanas", price: 600000, old: null, color: "yellow", badge: "new", stock: 3,
    img: "assets/img/products/IMG_7266.jpeg",
    desc: "Maza trasera cassette en acabado cromado pulido. Brillo impecable y rendimiento de gama alta.",
    specs: ["Tipo: Cassette", "Driver: 9T", "Acabado: Cromado", "Eje: 14mm", "Rodamientos sellados"] },

  { id: "hub-front-fed", name: "Maza Delantera Federal Negra", brand: "Federal", cat: "repuestos", sub: "Manzanas", price: 280000, old: null, color: "purple", badge: null, stock: 8,
    img: "assets/img/products/IMG_7267.jpeg",
    desc: "Maza delantera Federal sellada en negro. Ligera y resistente para cualquier setup.",
    specs: ["Tipo: Delantera", "Eje: 3/8\"", "Rodamientos sellados", "Female axle", "Color: Negro"] },

  { id: "pedal-plastic-blk", name: "Pedales Plástico Platform Negros", brand: "Odyssey", cat: "repuestos", sub: "Pedales", price: 90000, old: null, color: "lime", badge: null, stock: 22,
    img: "assets/img/products/IMG_7268.jpeg",
    desc: "Pedales de plástico reforzado con buen agarre y cuerpo ancho. Livianos y económicos.",
    specs: ["Material: Nylon reforzado", "Eje: 9/16\"", "Pines moldeados", "Cuerpo ancho", "Color: Negro"] },

  { id: "pedal-alloy-blk", name: "Pedales Aluminio Pro Negros", brand: "Stranger", cat: "repuestos", sub: "Pedales", price: 130000, old: null, color: "orange", badge: "new", stock: 12,
    img: "assets/img/products/IMG_7269.jpeg",
    desc: "Pedales de aluminio CNC con pines reemplazables y plataforma sólida para street agresivo.",
    specs: ["Material: Aluminio CNC", "Eje: 9/16\" cromoly", "Pines reemplazables", "Sellados", "Color: Negro"] },

  { id: "pedal-grip-blk", name: "Pedales SaltPlus AM Negros", brand: "SaltPlus", cat: "repuestos", sub: "Pedales", price: 78000, old: null, color: "cyan", badge: null, stock: 20,
    img: "assets/img/products/IMG_7270.jpeg",
    desc: "Pedales SaltPlus AM de plataforma plana con excelente grip. Perfectos para el día a día.",
    specs: ["Material: Compuesto", "Eje: 9/16\"", "Pines integrados", "Plataforma plana", "Color: Negro"] }
];

/* --------- Generador de imagen SVG (data-URI) — placeholder B&W --------- */
/* Solo se usa cuando un producto no tiene foto real, y para la grilla IG.
   Tratamiento premium monocromo: marco, marca de oso al agua y nombre. */
const STIKE_PALETTE = {
  pink:   ["#ffffff", "#18181b"],
  cyan:   ["#ffffff", "#161619"],
  yellow: ["#ffffff", "#1a1a1d"],
  lime:   ["#ffffff", "#141417"],
  orange: ["#ffffff", "#1c1c20"],
  purple: ["#ffffff", "#121215"]
};

function stikeProductImage(product, size) {
  if (product && product.img) return product.img;
  size = size || 600;
  const pal = STIKE_PALETTE[product.color] || STIKE_PALETTE.pink;
  const label = (product.brand || "STIKE").toUpperCase();
  const name = (product.name || "").toUpperCase();
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

/* Helpers de búsqueda usados por las páginas */
function stikeFindProduct(id) { return STIKE_PRODUCTS.find(p => p.id === id); }
function stikeByCategory(slug) {
  if (slug === "promo") return STIKE_PRODUCTS.filter(p => p.old);
  return STIKE_PRODUCTS.filter(p => p.cat === slug);
}
function stikeCategory(slug) { return STIKE_CATEGORIES.find(c => c.slug === slug); }

/* Formato de precio COP */
function stikePrice(n) {
  return "$" + n.toLocaleString("es-CO");
}

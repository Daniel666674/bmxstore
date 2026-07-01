/* =========================================================================
   STIKE BIKE SHOP: Catálogo de datos (mock)
   Todo en español. Precios en COP (pesos colombianos).
   ========================================================================= */

/* ----------------------- Categorías y subcategorías --------------------- */
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
  "SaltPlus", "Stranger", "Mutanty", "Trueno", "Fate BMX Colombia",
  "TSG", "KMC", "Cinema", "GW", "Fade"
];

/* ----------------------------- Productos -------------------------------- */
/* color = paleta del placeholder grafiti (pink|cyan|yellow|lime|orange|purple) */
const STIKE_PRODUCTS = [
  // ---- Repuestos: Marcos ----
  { id: "frame-total", name: "Marco Cult Americano", brand: "Cult", cat: "repuestos", sub: "Marcos", price: 980000, old: null, color: "cyan", badge: "new", stock: 4,
    img: "assets/img/products/IMG_7282.jpeg",
    desc: "Marco Cult Americano, full cromoly con butados y geometría afinada para street/park.",
    specs: ["Material: Cromoly 4130 full", "Tubo superior: 20.8\"", "Ángulo dirección: 75°", "Peso: 2.1 kg"] },
  { id: "frame-fly", name: "Marco Sunday Cromoly", brand: "Sunday", cat: "repuestos", sub: "Marcos", price: 910000, old: 1040000, color: "purple", badge: "promo", stock: 2,
    img: "assets/img/products/IMG_7283.jpeg",
    desc: "Marco Sunday en cromoly, ligero y reactivo. Tubería butada y punteras integradas.",
    specs: ["Material: Cromoly", "Tubo superior: 21\"", "Vainas: 13\"", "Geometría street"] },

  // ---- Repuestos: Tenedores ----
  { id: "fork-odyssey", name: "Tenedor Federal", brand: "Federal", cat: "repuestos", sub: "Tenedores", price: 360000, old: null, color: "pink", badge: null, stock: 7,
    img: "assets/img/products/IMG_7181.jpeg",
    desc: "Tenedor Federal en cromoly butado, compatible con tacos y resistente para street y park.",
    specs: ["Material: Cromoly 4130", "Avance: 32mm", "Eje: 10mm / 14mm", "Tubo de dirección butado"] },
  { id: "fork-shadow", name: "Tenedor Shadow Vultus", brand: "Shadow", cat: "repuestos", sub: "Tenedores", price: 330000, old: null, color: "lime", badge: null, stock: 5,
    img: "assets/img/products/prod-fork-shadow.png",
    desc: "Shadow Vultus, ultraligero con tecnología SST para máxima resistencia y poco peso.",
    specs: ["Material: SST Cromoly", "Avance: 30mm", "Peso: 0.85 kg"] },

  // ---- Repuestos: Timones / Manubrios ----
  { id: "bar-cult", name: "Manubrio Cult Crew 4pc", brand: "Cult", cat: "repuestos", sub: "Manubrios", price: 240000, old: null, color: "orange", badge: null, stock: 9,
    img: "assets/img/products/prod-bar-cult.png",
    desc: "Manubrio 4 piezas Cult Crew, altura 9\", curva clásica y sensación sólida.",
    specs: ["Altura: 9.5\"", "Ancho: 29\"", "Material: Cromoly", "Retroceso: 12°"] },
  { id: "stem-eclat", name: "Manubrio Éclat", brand: "Éclat", cat: "repuestos", sub: "Manubrios", price: 210000, old: 260000, color: "yellow", badge: "promo", stock: 6,
    img: "assets/img/products/prod-bar-eclat.png",
    desc: "Manubrio Éclat en cromoly con barra transversal, geometría equilibrada para buen control.",
    specs: ["Altura: 9.5\"", "Ancho: 29\"", "Material: Cromoly", "Retroceso: 11°"] },

  // ---- Repuestos: Bielas / Platos ----
  { id: "crank-bsd", name: "Bielas BSD Substance XL", brand: "BSD", cat: "repuestos", sub: "Bielas", price: 540000, old: null, color: "cyan", badge: null, stock: 4,
    img: "assets/img/products/IMG_7284.jpeg",
    desc: "Bielas tubulares BSD Substance XL, eje de 24mm y resistencia comprobada en street.",
    specs: ["Largo: 175mm", "Eje: 24mm", "Material: Cromoly tubular", "Estriado 48"] },
  { id: "sprk-shadow", name: "Plato Fate Garuda 25T Negro", brand: "Fate BMX Colombia", cat: "repuestos", sub: "Platos", price: 150000, old: null, color: "pink", badge: "new", stock: 12,
    img: "assets/img/products/F45D508E-ADC2-472F-AAFA-0ED417BD1C15.jpeg",
    desc: "Plato Fate Garuda 25T en negro, diseñado en Colombia. Protector integrado y mecanizado CNC.",
    specs: ["Dientes: 25T / 28T", "Material: aleación 7075 CNC", "Protector integrado", "Hecho en Colombia"] },

  // ---- Repuestos: Cadenas / Frenos ----
  { id: "chain-kmc", name: "Cadena Shadow Interlock V2", brand: "Shadow", cat: "repuestos", sub: "Cadenas", price: 95000, old: null, color: "lime", badge: null, stock: 15,
    img: "assets/img/products/IMG_7166.jpeg",
    desc: "Cadena de media eslabón Shadow Interlock V2, súper resistente y fácil de reparar.",
    specs: ["Tipo: Media eslabón", "1/8\"", "Color: negro", "Pasador reforzado"] },
  { id: "brake-odyssey", name: "Freno Odyssey Springfield", brand: "Odyssey", cat: "repuestos", sub: "Frenos", price: 180000, old: null, color: "purple", badge: null, stock: 6,
    img: "assets/img/products/IMG_7285.jpeg",
    desc: "Kit de freno U-brake Odyssey Springfield con palanca Monolever. Frenadas precisas.",
    specs: ["Tipo: U-brake", "Incluye palanca", "Pastillas M2", "Cable incluido"] },

  // ---- Repuestos: Manzanas / Rines / Llantas ----
  { id: "hub-fed", name: "Manzana Federal Stance FC", brand: "Federal", cat: "repuestos", sub: "Manzanas", price: 620000, old: 720000, color: "orange", badge: "promo", stock: 3,
    img: "assets/img/products/IMG_7286.jpeg",
    desc: "Manzana freecoaster Federal Stance FC, holgura ajustable y rodamientos sellados.",
    specs: ["Tipo: Freecoaster", "Hueco: 9T", "Holgura ajustable", "Eje 14mm"] },
  { id: "rim-eclat", name: "Rin Éclat Bondi 36H", brand: "Éclat", cat: "repuestos", sub: "Rines", price: 210000, old: null, color: "cyan", badge: null, stock: 8,
    img: "assets/img/products/IMG_7171.jpeg",
    desc: "Rin doble pared Éclat Bondi, 36 huecos, ligero y resistente para impactos fuertes.",
    specs: ["Huecos: 36", "Doble pared", "Material: 6061", "Unión remachada"] },
  { id: "tire-total", name: "Llanta Total Killabee 2.4\"", brand: "Total BMX", cat: "repuestos", sub: "Llantas", price: 120000, old: null, color: "yellow", badge: null, stock: 20,
    img: "assets/img/products/prod-tire-total.png",
    desc: "Llanta Total Killabee 2.4\", buen agarre y baja resistencia para rodar rápido.",
    specs: ["Medida: 20\" x 2.4\"", "100 PSI", "Compuesto dual", "Talón plegable"] },

  // ---- Repuestos: Pedales / Sillas / Tacos ----
  { id: "pedal-odyssey", name: "Pedales Plataforma BMX Negro", brand: "Odyssey", cat: "repuestos", sub: "Pedales", price: 85000, old: null, color: "pink", badge: null, stock: 25,
    img: "assets/img/products/prod-pedals-odyssey.webp",
    desc: "Pedales plataforma de nylon/fibra reforzada, excelente agarre y eje sellado de acero.",
    specs: ["Material: Nylon/Fibra", "Eje: sellado acero", "Plataforma ancha", "9/16\""] },
  { id: "seat-cult", name: "Silla Fate Pivotal Pana Negro", brand: "Fate BMX Colombia", cat: "repuestos", sub: "Sillas y Postes", price: 130000, old: null, color: "lime", badge: "new", stock: 10,
    img: "assets/img/products/3A06D926-2987-4488-AA12-28567FE35426.jpeg",
    desc: "Silla pivotal Fate BMX Colombia en pana negra. Diseño original corte clásico, muy cómoda.",
    specs: ["Tipo: Pivotal", "Material: Pana negro", "Corte original", "Hecha en Colombia"] },
  { id: "peg-shadow", name: "Tacos Fate BMX (par)", brand: "Fate BMX Colombia", cat: "repuestos", sub: "Tacos y Protectores de Maza", price: 90000, old: null, color: "purple", badge: null, stock: 14,
    img: "assets/img/products/IMG_7145.jpeg",
    desc: "Par de tacos Fate BMX de aluminio anodizado, deslizamiento fluido en mármol, cemento y acero.",
    specs: ["Material: Aluminio 6061", "Largo: 4.5\"", "Eje: 10/14mm", "Incluye par"] },

  // ---- Protecciones ----
  { id: "helmet-tsg", name: "Casco TSG Evolution Salmón", brand: "TSG", cat: "protecciones", sub: "Cascos", price: 230000, old: null, color: "pink", badge: "new", stock: 12,
    img: "assets/img/products/IMG_7130.jpeg",
    desc: "Casco TSG Evolution, certificado CE para street y park. Forro extraíble y ajuste de carraca.",
    specs: ["Certificación: CE EN1078", "Tallas: S/M/L/XL", "10 ventilaciones", "Forro lavable"] },
  { id: "helmet-black", name: "Casco Stike Pro Negro", brand: "Stike", cat: "protecciones", sub: "Cascos", price: 215000, old: null, color: "purple", badge: null, stock: 10,
    img: "assets/img/products/IMG_7273.jpeg",
    desc: "Casco BMX negro mate, certificado para street y park. Calce firme y ventilación amplia.",
    specs: ["Certificación: CE EN1078", "Tallas: S/M/L/XL", "Negro mate", "Forro lavable"] },
  { id: "knee-fuse", name: "Rodilleras Shadow Riding Gear", brand: "Shadow", cat: "protecciones", sub: "Rodilleras", price: 175000, old: 210000, color: "cyan", badge: "promo", stock: 9,
    img: "assets/img/products/IMG_7272.jpeg",
    desc: "Rodilleras Shadow Riding Gear, ligeras con buena movilidad y protección sólida para caídas duras.",
    specs: ["Tallas: S-XL", "Ventiladas", "Lavables", "Ajuste con velcro"] },
  { id: "gloves-stike", name: "Guantes Stike Grip", brand: "Stike", cat: "protecciones", sub: "Guantes", price: 65000, old: null, color: "lime", badge: null, stock: 18,
    img: "assets/img/products/IMG_7271.jpeg",
    desc: "Guantes de palma reforzada con buen tacto en el manubrio. Compatibles con pantalla táctil.",
    specs: ["Tallas: S-XL", "Palma reforzada", "Transpirables"] },

  // ---- Ropa ----
  { id: "tee-stike", name: "Camiseta Stike Graffiti Tee", brand: "Stike", cat: "ropa", sub: "Camisetas", price: 79000, old: null, color: "pink", badge: "new", stock: 30,
    desc: "Camiseta 100% algodón con estampado grafiti exclusivo de Stike Bogotá. Edición de la comunidad.",
    specs: ["Material: 100% algodón", "Tallas: S-XXL", "Estampado serigrafía", "Corte regular"] },
  { id: "hoodie-stike", name: "Buso Stike Box Logo", brand: "Stike", cat: "ropa", sub: "Busos y Chaquetas", price: 165000, old: 199000, color: "orange", badge: "promo", stock: 16,
    desc: "Buso pesado con box logo bordado. El favorito para rodar en las noches frías de Bogotá.",
    specs: ["Material: Algodón/poly 320g", "Tallas: S-XXL", "Logo bordado", "Bolsillo canguro"] },
  { id: "cap-stike", name: "Gorra Fate BMX Colombia", brand: "Fate BMX Colombia", cat: "ropa", sub: "Gorras", price: 69000, old: null, color: "yellow", badge: "new", stock: 22,
    img: "assets/img/products/IMG_7138.jpeg",
    desc: "Gorra negra Fate BMX Colombia, logo bordado en hilo blanco. Orgullosamente colombiana.",
    specs: ["Tipo: Dad hat", "Ajuste con hebilla", "Logo bordado", "Hecha en Colombia"] },
  { id: "sunnies-stike", name: "Gafas Smith Street", brand: "Smith", cat: "ropa", sub: "Gafas", price: 165000, old: null, color: "cyan", badge: "new", stock: 9,
    img: "assets/img/products/IMG_7275.jpeg",
    desc: "Gafas Smith con lente anti-empañante y banda ajustable. Visión clara para dirt y trails.",
    specs: ["Lente: anti-empañante", "Protección UV", "Banda ajustable", "Espuma triple densidad"] },
  { id: "shoes-vans", name: "Tenis Stike x Street Rojo", brand: "Stike", cat: "ropa", sub: "Tenis", price: 245000, old: null, color: "purple", badge: null, stock: 11,
    img: "assets/img/products/IMG_7152.jpeg",
    desc: "Tenis de suela vulcanizada con buen agarre en los pedales. Combinación blanco/rojo/azul resistente al desgaste.",
    specs: ["Suela: vulcanizada", "Tallas: 38-44", "Refuerzo en empeine"] },
  { id: "shoes-black", name: "Tenis Fade Negro", brand: "Fade", cat: "ropa", sub: "Tenis", price: 235000, old: null, color: "cyan", badge: null, stock: 13,
    img: "assets/img/products/prod-shoes-fade.webp",
    desc: "Tenis Fade negros de caña media, suela vulcanizada con agarre fuerte en el pedal.",
    specs: ["Suela: vulcanizada", "Caña: media", "Tallas: 38-44", "Refuerzo lateral"] },

  // ---- Accesorios ----
  { id: "tool-stike", name: "Multiherramienta Stike 18-en-1", brand: "Stike", cat: "accesorios", sub: "Herramientas", price: 89000, old: null, color: "lime", badge: "new", stock: 20,
    desc: "Multiherramienta compacta con todo lo necesario para ajustes rápidos en la calle.",
    specs: ["18 funciones", "Acero cromo-vanadio", "Estuche incluido"] },
  { id: "tool-cult", name: "Llave de Pedal / Hexagonal Cult", brand: "Cult", cat: "accesorios", sub: "Herramientas", price: 95000, old: null, color: "purple", badge: null, stock: 10,
    img: "assets/img/products/IMG_7276.webp",
    desc: "Herramienta Cult para pedales y eje, con extensión hexagonal. Imprescindible en el taller.",
    specs: ["Llave de pedal", "Extensión hex", "Acero tratado", "Marca: Cult"] },
  { id: "grip-odi", name: "Grips Wethepeople Flow XL", brand: "Wethepeople", cat: "accesorios", sub: "Grips", price: 55000, old: null, color: "pink", badge: null, stock: 28,
    img: "assets/img/products/IMG_7182.jpeg",
    desc: "Grips Wethepeople Flow XL, textura acanalada y compuesto firme para máximo control.",
    specs: ["Largo: 160mm", "Sin reborde", "Compuesto firme", "Tapones incluidos"] },
  { id: "pump-stike", name: "Bomba de piso GW", brand: "GW", cat: "accesorios", sub: "Bombas", price: 110000, old: 135000, color: "orange", badge: "promo", stock: 13,
    img: "assets/img/products/prod-pump-gw.png",
    desc: "Bomba de piso GW, compacta y resistente. Válvula compatible Presta/Schrader. Infla rápido.",
    specs: ["Compacta", "Válvula doble", "Base plegable", "Manguera flexible"] },
  { id: "stickers-stike", name: "Pack de Calcomanías Stike Graffiti", brand: "Stike", cat: "accesorios", sub: "Pegatinas", price: 25000, old: null, color: "yellow", badge: null, stock: 50,
    desc: "Pack de 12 calcomanías resistentes al agua con los diseños grafiti de la marca.",
    specs: ["12 stickers", "Vinilo resistente", "Anti-agua / anti-UV"] },

  // ---- Nuevos productos (imágenes reales) ----
  { id: "chain-silver", name: "Cadena KMC Z410 Plata", brand: "KMC", cat: "repuestos", sub: "Cadenas", price: 75000, old: null, color: "cyan", badge: "new", stock: 18,
    img: "assets/img/products/IMG_7165.jpeg",
    desc: "Cadena KMC Z410 niquelada, resistente y de fácil mantenimiento. Ideal para armar o reponer.",
    specs: ["Tipo: 1/8\"", "Color: plateado", "Eslabón estándar", "Compatible BMX"] },

  { id: "tire-street", name: "Llanta Wethepeople 2.25\"", brand: "Wethepeople", cat: "repuestos", sub: "Llantas", price: 95000, old: null, color: "lime", badge: null, stock: 12,
    img: "assets/img/products/IMG_7167.jpeg",
    desc: "Llanta Wethepeople de perfil bajo para street y parque de patinaje, con buen agarre en concreto y asfalto.",
    specs: ["Medida: 20\" x 2.25\"", "Perfil bajo", "Talón de alambre", "90 PSI max"] },

  { id: "rim-eclat-2", name: "Rin Éclat Cortex 20H Negro", brand: "Éclat", cat: "repuestos", sub: "Rines", price: 195000, old: null, color: "purple", badge: null, stock: 5,
    img: "assets/img/products/IMG_7172.jpeg",
    desc: "Versión 20 huecos del Éclat Cortex, para riders que priorizan peso sin sacrificar resistencia.",
    specs: ["Huecos: 20", "Doble pared", "Material: 6061", "Unión remachada"] },

  { id: "rim-fly", name: "Rin Shadow 36H", brand: "Shadow", cat: "repuestos", sub: "Rines", price: 205000, old: 240000, color: "orange", badge: "promo", stock: 4,
    img: "assets/img/products/IMG_7173.jpeg",
    desc: "Rin Shadow ultra reforzado con unión remachada y acabado anodizado negro.",
    specs: ["Huecos: 36", "Doble pared", "Anodizado negro", "Unión remachada"] },

  { id: "bar-saltplus", name: "Manubrio SaltPlus Race 4pc", brand: "SaltPlus", cat: "repuestos", sub: "Manubrios", price: 235000, old: null, color: "cyan", badge: null, stock: 6,
    img: "assets/img/products/IMG_7176.jpeg",
    desc: "Manubrio SaltPlus Race de 4 piezas en cromoly, altura 9.5\" y buen retroceso.",
    specs: ["Altura: 9.5\"", "Ancho: 28.5\"", "Material: Cromoly", "Retroceso: 10°"] },

  { id: "bar-stranger", name: "Manubrio Stranger Highrise 9.5\"", brand: "Stranger", cat: "repuestos", sub: "Manubrios", price: 260000, old: null, color: "lime", badge: "new", stock: 5,
    img: "assets/img/products/IMG_7177.jpeg",
    desc: "Manubrio Stranger Highrise, cromoly full con barra transversal. Sensación rígida y gran control.",
    specs: ["Altura: 9.5\"", "Ancho: 29\"", "Material: Cromoly full", "Barra transversal incluida"] },

  { id: "fork-cruiser", name: "Tenedor BSD Cruiser 26\" Negro", brand: "BSD", cat: "repuestos", sub: "Tenedores", price: 280000, old: null, color: "orange", badge: null, stock: 3,
    img: "assets/img/products/IMG_7178.jpeg",
    desc: "Tenedor BSD en cromoly para BMX cruiser 26\", pintado negro con acabado brillante.",
    specs: ["Rueda: 26\"", "Material: Cromoly", "Eje: 10mm", "Avance: 28mm"] },

  { id: "expander-mutanty", name: "Expander Mutanty M24", brand: "Mutanty", cat: "accesorios", sub: "Herramientas", price: 35000, old: null, color: "purple", badge: null, stock: 25,
    img: "assets/img/products/IMG_7180.jpeg",
    desc: "Expander de aluminio anodizado M24 para horquillas sin rosca. Fácil instalación.",
    specs: ["Tamaño: M24", "Material: Aluminio 6061", "Llave Allen 6mm"] },

  { id: "grip-kink", name: "Grips Kink Form Flangeless", brand: "Kink", cat: "accesorios", sub: "Grips", price: 48000, old: null, color: "cyan", badge: null, stock: 22,
    img: "assets/img/products/IMG_7183.jpeg",
    desc: "Grips Kink Form sin reborde, compuesto suave y agarre consistente en toda condición.",
    specs: ["Sin reborde", "Largo: 155mm", "Compuesto suave", "Tapones incluidos"] },

  { id: "grip-eclat-red", name: "Grips Éclat Recoil Rojo", brand: "Éclat", cat: "accesorios", sub: "Grips", price: 62000, old: null, color: "pink", badge: "new", stock: 15,
    img: "assets/img/products/IMG_7184.jpeg",
    desc: "Grips Éclat Recoil en rojo vivo con tapones a juego. Compuesto doble para máximo agarre.",
    specs: ["Color: rojo", "Reborde incluido", "Compuesto doble", "Tapones a juego"] },

  { id: "stem-trueno", name: "Timón Trueno Carga Frontal", brand: "Trueno", cat: "repuestos", sub: "Timones", price: 195000, old: null, color: "orange", badge: "new", stock: 7,
    img: "assets/img/products/IMG_7186.jpeg",
    desc: "Timón Trueno mecanizado CNC, carga frontal con abrazadera dentada para mayor agarre.",
    specs: ["Tipo: Carga frontal", "Material: 6061 CNC", "Alcance: 53mm", "Abrazadera dentada"] },

  // ---- Nuevos productos ZIPs 2 & 3 (Fate BMX Colombia + otros) ----
  { id: "stem-kink", name: "Timón Kink Williams Carga Frontal", brand: "Kink", cat: "repuestos", sub: "Timones", price: 225000, old: null, color: "yellow", badge: null, stock: 8,
    img: "assets/img/products/IMG_7122.jpeg",
    desc: "Timón Kink Williams de 4 tornillos, mecanizado CNC, robusto y perfectamente equilibrado.",
    specs: ["Tipo: Carga frontal", "Material: 6061 CNC", "4 tornillos", "Alcance: 52mm"] },

  { id: "helmet-tsg-white", name: "Casco TSG Evolution Blanco", brand: "TSG", cat: "protecciones", sub: "Cascos", price: 230000, old: null, color: "cyan", badge: null, stock: 9,
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
    specs: ["Material: Cromoly 4130", "Tubo superior: 20.75\"", "Vainas: 13\"", "Hecho en Colombia"] },

  { id: "sprk-fate-chrome", name: "Plato Fate Garuda 25T Cromado", brand: "Fate BMX Colombia", cat: "repuestos", sub: "Platos", price: 160000, old: null, color: "lime", badge: null, stock: 8,
    img: "assets/img/products/EA19B12C-1FBD-4387-A361-7A4AED292633.jpeg",
    desc: "Versión cromada del Plato Fate Garuda. Protector integrado, mecanizado CNC y brillo impecable.",
    specs: ["Dientes: 25T / 28T", "Material: aleación 7075 CNC", "Protector integrado", "Color: cromado"] },

  { id: "seat-fate-leather", name: "Silla Fate Pivotal Cuero Negro", brand: "Fate BMX Colombia", cat: "repuestos", sub: "Sillas y Postes", price: 140000, old: null, color: "purple", badge: null, stock: 7,
    img: "assets/img/products/3B54281B-6080-4074-A754-4142F71ADBC2.jpeg",
    desc: "Silla pivotal Fate BMX Colombia en cuero negro. Diseño firme y cómodo, corte original.",
    specs: ["Tipo: Pivotal", "Material: Cuero negro", "Corte original", "Hecha en Colombia"] },

  // ---- Lote nuevo: marcos, mazas y pedales (fotos reales) ----
  { id: "frame-cult-wb", name: "Marco Total BMX 20.75\" Blanco/Azul", brand: "Total BMX", cat: "repuestos", sub: "Marcos", price: 1050000, old: 1180000, color: "cyan", badge: "promo", stock: 3,
    img: "assets/img/products/IMG_7258.jpeg",
    desc: "Marco Total BMX en cromoly 4130 con acabado fade blanco a azul y detalles rojos. Geometría street/park versátil.",
    specs: ["Material: Cromoly 4130 full", "Tubo superior: 20.75\"", "Trasero: 13.2\" - 13.6\"", "Soportes: removibles", "Color: Blanco/Azul"] },

  { id: "frame-federal-white", name: "Marco Federal Bruno LT Blanco", brand: "Federal", cat: "repuestos", sub: "Marcos", price: 980000, old: null, color: "lime", badge: "new", stock: 4,
    img: "assets/img/products/IMG_7259.jpeg",
    desc: "Marco Federal Bruno LT en blanco mate. Liviano, rígido y pensado para street técnico.",
    specs: ["Material: 13-Cromoly", "Tubo superior: 21\"", "Fundición de precisión", "Soportes: removibles", "Color: Blanco mate"] },

  { id: "frame-wtp-green", name: "Marco Wethepeople Battleship Verde", brand: "Wethepeople", cat: "repuestos", sub: "Marcos", price: 1020000, old: null, color: "lime", badge: "new", stock: 3,
    img: "assets/img/products/IMG_7260.jpeg",
    desc: "Marco Wethepeople Battleship en verde lima. Tubería cromoly full con geometría para park y trails.",
    specs: ["Material: Cromoly 4130 full", "Tubo superior: 20.85\"", "Eje medio", "Verde lima", "Hecho para park/dirt"] },

  { id: "hub-cassette-black", name: "Maza Trasera Cassette Shadow Negra", brand: "Shadow", cat: "repuestos", sub: "Manzanas", price: 560000, old: null, color: "pink", badge: null, stock: 5,
    img: "assets/img/products/prod-hub-shadow.png",
    desc: "Maza trasera cassette Shadow en negro, engrane rápido y sellado para uso intensivo.",
    specs: ["Tipo: Cassette", "Piñonera: 9T", "Engrane: 60 puntos", "Eje: 14mm", "Color: Negro"] },

  { id: "hub-rear-eclat", name: "Maza Trasera Odyssey Negra", brand: "Odyssey", cat: "repuestos", sub: "Manzanas", price: 540000, old: 620000, color: "cyan", badge: "promo", stock: 4,
    img: "assets/img/products/IMG_7265.jpeg",
    desc: "Maza trasera Odyssey sellada en negro mate. Confiable, suave y de fácil mantenimiento.",
    specs: ["Tipo: Cassette", "Piñonera: 9T", "Rodamientos sellados", "Eje: 14mm", "Color: Negro"] },

  { id: "hub-chrome", name: "Maza Trasera Cassette Cromada", brand: "Éclat", cat: "repuestos", sub: "Manzanas", price: 600000, old: null, color: "yellow", badge: "new", stock: 3,
    img: "assets/img/products/IMG_7266.jpeg",
    desc: "Maza trasera cassette en acabado cromado pulido. Brillo impecable y rendimiento de gama alta.",
    specs: ["Tipo: Cassette", "Piñonera: 9T", "Acabado: Cromado", "Eje: 14mm", "Rodamientos sellados"] },

  { id: "hub-front-fed", name: "Maza Cassette Federal Negra", brand: "Federal", cat: "repuestos", sub: "Manzanas", price: 480000, old: null, color: "purple", badge: null, stock: 8,
    img: "assets/img/products/prod-hub-federal.png",
    desc: "Maza trasera cassette Federal sellada en negro. Engrane rápido y resistente para uso intensivo.",
    specs: ["Tipo: Cassette", "Piñonera: 9T", "Rodamientos sellados", "Eje: 14mm", "Color: Negro"] },

  { id: "pedal-plastic-blk", name: "Pedales Cinema Negros", brand: "Cinema", cat: "repuestos", sub: "Pedales", price: 90000, old: null, color: "lime", badge: null, stock: 22,
    img: "assets/img/products/prod-pedals-cinema.png",
    desc: "Pedales Cinema de plástico reforzado con buen agarre y cuerpo ancho. Livianos y resistentes.",
    specs: ["Material: Nylon reforzado", "Eje: 9/16\"", "Pines moldeados", "Cuerpo ancho", "Color: Negro"] },

  { id: "pedal-alloy-blk", name: "Pedales Federal Negros", brand: "Federal", cat: "repuestos", sub: "Pedales", price: 130000, old: null, color: "orange", badge: "new", stock: 12,
    img: "assets/img/products/IMG_7269.jpeg",
    desc: "Pedales Federal con cuerpo de nylon reforzado, pines moldeados y buen agarre. Livianos y resistentes.",
    specs: ["Material: Nylon reforzado", "Eje: 9/16\"", "Pines moldeados", "Plataforma ancha", "Color: Negro"] },

  { id: "pedal-grip-blk", name: "Pedales Wethepeople Negros", brand: "Wethepeople", cat: "repuestos", sub: "Pedales", price: 78000, old: null, color: "cyan", badge: null, stock: 20,
    img: "assets/img/products/IMG_7270.jpeg",
    desc: "Pedales Wethepeople de plataforma plana con excelente agarre. Perfectos para el día a día.",
    specs: ["Material: Compuesto", "Eje: 9/16\"", "Pines integrados", "Plataforma plana", "Color: Negro"] }
];

/* --------- Generador de imagen SVG (data-URI): placeholder B&W --------- */
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

/* --------- Tallas seleccionables por producto -----------------------------
   Devuelve un array de tallas si el producto las requiere (ropa, tenis,
   protecciones que se usan en el cuerpo). Permite override por p.sizes.   */
function stikeSizesFor(p) {
  if (!p) return null;
  if (p.sizes) return p.sizes;
  const sub = (p.sub || "").toLowerCase();
  if (sub.includes("tenis")) return ["38", "39", "40", "41", "42", "43", "44"];
  if (p.cat === "ropa" && (sub.includes("camiseta") || sub.includes("buso") || sub.includes("chaqueta")))
    return ["S", "M", "L", "XL", "XXL"];
  if (p.cat === "protecciones" && (sub.includes("casco") || sub.includes("rodiller") || sub.includes("coder") || sub.includes("guante") || sub.includes("espiniller")))
    return ["S", "M", "L", "XL"];
  return null;
}

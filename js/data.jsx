/* ============================================================
   data.jsx — negocio, menú, reseñas, logo, íconos, helpers
   Carta de Dr. Empanada (jul 2026) — precios editables a mano.
   ============================================================ */

const BIZ = {
  name: "DR. EMPANADA",
  suffix: "",
  tagline: "El especialista en sabor",
  since: 1989,
  address: "Melincué 4399",
  city: "Villa Devoto · CABA",
  mapsQuery: "Melincué 4399, Villa Devoto, CABA",
  phoneDisplay: "11 4639-5578",
  phoneE164: "541146395578",           // +54 11 4639-5578
  rating: 4.4,
  reviewsCount: 230,
  ig: "drempanada.arg",
  hours: [
    { d: "Lunes", h: "Cerrado", closed: true },
    { d: "Mar – Jue", h: "12:00 – 14:30 · 20:00 – 23:00" },
    { d: "Vie – Sáb", h: "12:00 – 14:30 · 20:00 – 23:30" },
    { d: "Domingo", h: "20:00 – 23:00" },
  ],
  // datos de pago (editables a mano)
  pay: {
    alias: "dr.empanada",
    cbu: "0000003100010000000001",
    titular: "Dr. Empanada",
    mp: "dr.empanada",
  },
};

/* ============================================================
   Ambiente. PROD es el dominio de producción (rama PROD en Cloudflare
   Pages); cualquier preview de rama (*.dr-empanada.pages.dev, que es donde
   cae TEST) o un server local se marcan como no productivos y muestran el
   badge de ambiente para no confundir una preview con el sitio real.
   ============================================================ */
const PROD_HOST = "dr-empanada.pages.dev";
const ENV = (function () {
  const h = location.hostname;
  if (h === PROD_HOST) return "PROD";
  if (h === "localhost" || h === "127.0.0.1" || h === "") return "LOCAL";
  return "TEST";
})();

const money = (n) =>
  "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 0 });

/* ---- Fotos (helper legado; hoy todas las fotos son propias en /assets) ---- */
const IMG = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

/* ---- Horarios en vivo ----
   Dos turnos por día (mediodía y noche), en minutos desde las 00:00.
   dom=0 · lun=1 (cerrado) · mar–jue 12–14:30 y 20–23 · vie–sáb 12–14:30 y
   20–23:30 · dom sólo noche 20–23. */
const SHIFTS = {
  0: [[20 * 60, 23 * 60]],                                  // domingo
  1: [],                                                    // lunes cerrado
  2: [[12 * 60, 14 * 60 + 30], [20 * 60, 23 * 60]],
  3: [[12 * 60, 14 * 60 + 30], [20 * 60, 23 * 60]],
  4: [[12 * 60, 14 * 60 + 30], [20 * 60, 23 * 60]],
  5: [[12 * 60, 14 * 60 + 30], [20 * 60, 23 * 60 + 30]],    // viernes
  6: [[12 * 60, 14 * 60 + 30], [20 * 60, 23 * 60 + 30]],    // sábado
};
const minutesOf = (now) => now.getHours() * 60 + now.getMinutes();

function isOpenNow(now = new Date()) {
  const m = minutesOf(now);
  return (SHIFTS[now.getDay()] || []).some(([a, b]) => m >= a && m < b);
}
// promo mediodía: acompaña el turno del mediodía, martes a sábado
function isHappyNow(now = new Date()) {
  const d = now.getDay(), m = minutesOf(now);
  return d >= 2 && d <= 6 && m >= 12 * 60 && m < 14 * 60 + 30;
}

/* ============================================================
   Envío, seña y cupones — editables a mano, como los precios
   ============================================================ */
const SHIPPING = {
  price: 4000,        // dentro del radio; más lejos se coordina por WhatsApp
  radiusKm: 2.5,
  note: "Envío dentro de 2,5 km. Si estás más lejos lo coordinamos por WhatsApp.",
};
// "Seña + efectivo": se abona online este % del total y el resto en efectivo.
const SENA_PCT = 50;

/* Cupones de descuento. type: "percent" (value = %) | "amount" (value = $) */
const COUPONS = [
  { code: "DREMPANADA10", type: "percent", value: 10 },
];
const findCoupon = (code) => {
  const c = String(code || "").trim().toUpperCase();
  return COUPONS.find((x) => x.code === c) || null;
};
const couponDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;
  return coupon.type === "percent"
    ? Math.round((subtotal * coupon.value) / 100)
    : Math.min(coupon.value, subtotal);
};
const couponLabel = (c) => (c.type === "percent" ? c.value + "% off" : money(c.value) + " off");

/* ============================================================
   Agregados / upgrades (carta real)
   ============================================================ */
const EXTRAS = [
  { id: "cheddar-extra", name: "Cheddar fundido aparte", price: 1200 },
];

const MEDALLONES = ["Al horno", "Frita"];
const PROTEINAS = ["Carne", "Pollo"];

const HAPPY = {
  where: "Sucursal Villa Devoto · Melincué 4399",
  when: "Martes a sábado · 12 a 14:30 hs",
  deals: [
    { name: "Docena clásica", price: 24000 },
    { name: "Media docena clásica", price: 12500 },
    { name: "Docena surtida", price: 25000 },
    { name: "Docena de pastelitos", price: 15000 },
    { name: "Gaseosa 1,5 L", price: 4500 },
  ],
};

/* ============================================================
   Menú — layout: "cards" (foto grande) · "list" (compacto)
   price = unidad · priceDouble = docena
   ============================================================ */
const MENU = [
  {
    id: "empanadas",
    name: "Empanadas",
    kicker: "Al horno o fritas · por unidad o docena",
    layout: "cards",
    note: "Todas se pueden pedir al horno o fritas, al mismo precio. La docena puede ser surtida.",
    items: [
      { id: "carne-cuchillo", name: "Carne Cuchillo", desc: "Carne cortada a cuchillo, cebolla y morrón. La insignia de la casa.", price: 2700, priceDouble: 29000, tags: ["TOP"], custom: true, color: "#8a5a2b", pop: 96, img: "assets/empanadas/carne-cuchillo.jpg" },
      { id: "carne-suave", name: "Carne Suave", desc: "Carne molida bien condimentada, jugosa y pareja.", price: 2400, priceDouble: 26000, tags: [], custom: true, color: "#9c6b33", pop: 78, img: "assets/empanadas/carne-suave.jpg" },
      { id: "vacio", name: "Vacío", desc: "Vacío braseado y desmechado, cocido a fuego lento.", price: 2700, priceDouble: 29000, tags: [], custom: true, color: "#7a4a22", pop: 82, img: "assets/empanadas/vacio.jpg" },
      { id: "bondiola-bbq", name: "Bondiola BBQ", desc: "Bondiola desmechada con salsa barbacoa.", price: 2700, priceDouble: 29000, tags: [], custom: true, color: "#a3541e", pop: 80, img: "assets/empanadas/bondiola-bbq.jpg" },
      { id: "pollo", name: "Pollo", desc: "Pollo desmenuzado con verduritas salteadas.", price: 2400, priceDouble: 26000, tags: [], custom: true, color: "#d9a441", pop: 77, img: "assets/empanadas/pollo.jpg" },
      { id: "cheese", name: "Cheese", desc: "Estilo cheeseburger: carne y cheddar fundido.", price: 2700, priceDouble: 29000, tags: ["TOP"], custom: true, color: "#e8a51e", pop: 88, img: "assets/empanadas/cheese.jpg" },
      { id: "matambre-pizza", name: "Matambre a la Pizza", desc: "Matambre tiernizado, salsa de tomate, muzza y orégano.", price: 2700, priceDouble: 29000, tags: ["TOP"], custom: true, color: "#c74a2e", pop: 90, img: "assets/empanadas/matambre-pizza.jpg" },
      { id: "cebolla-queso", name: "Cebolla y Queso", desc: "Cebolla dorada lenta con muzzarella cremosa.", price: 2400, priceDouble: 26000, tags: [], custom: true, color: "#e8c96a", pop: 74, img: "assets/empanadas/cebolla-queso.jpg" },
      { id: "provolone", name: "Provolone", desc: "Provolone fundido que se estira, con un toque de orégano.", price: 2700, priceDouble: 29000, tags: [], custom: true, color: "#f0d9a8", pop: 75, img: "assets/empanadas/provolone.jpg" },
      { id: "roque", name: "Roque", desc: "Roquefort, muzzarella y jamón. Para los que saben.", price: 2700, priceDouble: 29000, tags: [], custom: true, color: "#b9c69a", pop: 72, img: "assets/empanadas/roque.jpg" },
      { id: "humita", name: "Humita", desc: "Choclo cremoso con salsa blanca casera. Un clásico eterno.", price: 2400, priceDouble: 26000, tags: ["TOP"], custom: true, color: "#f2cf5b", pop: 85, img: "assets/empanadas/humita.jpg" },
      { id: "caprese", name: "Caprese", desc: "Muzzarella, tomate y albahaca fresca.", price: 2400, priceDouble: 26000, tags: [], custom: true, color: "#d94f3d", pop: 73, img: "assets/empanadas/caprese.jpg" },
      { id: "verdura", name: "Verdura", desc: "Acelga, salsa blanca y muzzarella. Verde y cremosa.", price: 2400, priceDouble: 26000, tags: [], custom: true, color: "#6faa3c", pop: 66, img: "assets/empanadas/verdura.jpg" },
    ],
  },
  {
    id: "pastelitos",
    name: "Pastelitos",
    kicker: "Dulces, fritos y crocantes · por unidad o docena",
    layout: "cards",
    items: [
      { id: "pastelito-membrillo", name: "Pastelito de membrillo", desc: "Hojaldre frito y crocante relleno de membrillo.", price: 1600, priceDouble: 17000, tags: ["TOP"], img: "assets/pastelitos-membrillo.jpg" },
      { id: "pastelito-batata", name: "Pastelito de batata", desc: "El clásico de las fechas patrias, todo el año.", price: 1600, priceDouble: 17000, tags: [], img: "assets/pastelitos-batata.jpg" },
      { id: "pastelito-dulce", name: "Pastelito de dulce de leche", desc: "Hojaldre crocante con dulce de leche bien argentino.", price: 1700, priceDouble: 18000, tags: [], img: "assets/pastelitos-dulce.jpg" },
    ],
  },
  {
    id: "promos",
    name: "Promos & docenas",
    kicker: "Para compartir (o no)",
    layout: "cards",
    items: [
      { id: "media-docena", name: "Media docena surtida", desc: "6 empanadas a elección, al horno o fritas.", price: 14000, tags: [], img: "assets/media-docena.jpg" },
      { id: "docena-surtida", name: "Docena surtida", desc: "12 empanadas a elección. La que va siempre.", price: 27000, tags: ["TOP"], img: "assets/promo-docena.jpg" },
      { id: "promo-peya", name: "Promo Nueva Peya", desc: "Docena frita + salsas de la casa. Los viernes, en promo.", price: 30000, tags: ["PROMO VIERNES"], img: "assets/promo-bandeja.jpg" },
      { id: "docena-pastelitos", name: "Docena de pastelitos", desc: "12 pastelitos surtidos para la merienda.", price: 17000, tags: [], img: "assets/pastelitos-enteros.jpg" },
    ],
  },
  {
    id: "drinks",
    name: "Bebidas",
    kicker: "Para acompañar",
    layout: "list",
    items: [
      { id: "gaseosa", name: "Gaseosa línea Coca", desc: "Lata 354 ml.", price: 2800, tags: [] },
      { id: "gaseosa-15", name: "Gaseosa 1,5 L", desc: "Para la mesa completa.", price: 5500, hh: 4500, tags: [] },
      { id: "agua", name: "Agua / saborizada", desc: "500 ml.", price: 2500, tags: [] },
      { id: "limonada", name: "Limonada de la casa", desc: "Jengibre y menta.", price: 6500, tags: [] },
    ],
  },
];

/* Promo docena (viernes) */
const PROMO_VIERNES = { price: 27000 };

/* ---- Fotos de productos editables desde el panel ----
   El dueño puede cambiar la foto de cualquier producto desde el admin
   ("Fotos del menú"). Las fotos nuevas viven en Cloudflare R2 y la API
   /api/menu-images devuelve { idProducto: url }. Si la API no responde
   (por ejemplo en local sin Functions) quedan las fotos de assets/. */
const IMG_OVERRIDES = {};
const menuImg = (item) => (item && (IMG_OVERRIDES[item.id] || item.img)) || null;
const itemImg = (item) => menuImg(item) || "assets/horno-tabla.jpg";
function loadMenuImages() {
  return fetch("/api/menu-images", { cache: "no-store" })
    .then((r) => (r.ok && (r.headers.get("content-type") || "").includes("json") ? r.json() : {}))
    .then((map) => {
      Object.keys(IMG_OVERRIDES).forEach((k) => { delete IMG_OVERRIDES[k]; });
      Object.assign(IMG_OVERRIDES, map || {});
      window.dispatchEvent(new Event("bf-menu-images"));
    })
    .catch(() => {});
}
loadMenuImages();

const FLAT_ITEMS = MENU.flatMap((c) => c.items.map((i) => ({ ...i, cat: c.id, catName: c.name, draft: !!c.draft })));
const findItem = (id) => FLAT_ITEMS.find((i) => i.id === id);
const findExtra = (id) => EXTRAS.find((e) => e.id === id);

/* ---- Reseñas de Google (reales en espíritu, editables) ---- */
const REVIEWS = [
  { name: "Martín G.", stars: 5, when: "hace 2 semanas", text: "Las mejores empanadas de Villa Devoto. La de carne cuchillo es un escándalo y la masa se nota casera. Atención de 10." },
  { name: "Caro P.", stars: 5, when: "hace 1 mes", text: "Pedí por delivery propio y llegaron calentitas y rapidísimo. La de matambre a la pizza es otra cosa." },
  { name: "Lucas D.", stars: 4, when: "hace 1 mes", text: "Muy ricas, el repulgue se nota hecho a mano. Pedimos la docena surtida entre amigos. Volvería." },
  { name: "Sofía R.", stars: 5, when: "hace 3 semanas", text: "La de humita es la mejor que probé en CABA. Encima los viernes la docena está en promo. Recomendadísimo." },
  { name: "Nico V.", stars: 5, when: "hace 2 meses", text: "Somos clientes hace rato. Siempre la misma calidad. Los pastelitos de membrillo, tremendos." },
  { name: "Aldana M.", stars: 4, when: "hace 1 semana", text: "Buen lugar, porciones generosas y precio justo. La promo del mediodía es un golazo." },
];

/* ============================================================
   Logo — sello oficial de Dr. Empanada (assets/logo.webp, 512px — el png de 100px se veía borroso).
   Viene de la cuenta de la marca, ya recortado en círculo con alfa.
   ============================================================ */
const LOGO_SRC = "assets/logo.webp";

function Empanada({ size = 34 }) {
  return (
    <img src={LOGO_SRC} alt="" aria-hidden="true" width={size} height={size}
      style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0 }} />
  );
}
const Cloche = Empanada; // alias legado

/* Sello circular de marca. El tamaño se controla con font-size
   (el ancho usa em en fx.css). */
function LogoBadge({ fontSize = 8, rot = 0, className = "", style, ...rest }) {
  return (
    <span className={"bfx-logobadge " + className} {...rest}
      style={{ fontSize, "--rot": rot + "deg", transform: rot ? `rotate(${rot}deg)` : undefined, ...style }}>
      <img src={LOGO_SRC} alt="Dr. Empanada" width="512" height="512" decoding="async" />
    </span>
  );
}

function Logo({ size = 1, light = false, stacked = false, showTagline = false }) {
  const color = light ? "#0d0b07" : "#fffdf2";
  const accent = "var(--orange)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 * size }}>
      <Empanada size={38 * size} />
      <div style={{ lineHeight: 0.82 }}>
        <div className="display" style={{ fontSize: 20 * size, color, letterSpacing: ".02em" }}>
          <span style={{ color: accent }}>DR.</span>
          {stacked ? <br /> : " "}EMPANADA
        </div>
        {showTagline && (
          <div className="mono" style={{ fontSize: 9 * size, letterSpacing: ".24em", color: light ? "var(--muted-d)" : "var(--muted)", marginTop: 4 * size, textTransform: "uppercase" }}>
            El especialista en sabor
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Íconos (stroke, 24 viewBox)
   ============================================================ */
const Ic = {
  cart: (p) => (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.4 12.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L21 7H6"/></svg>),
  wa: (p) => (<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" {...p}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>),
  star: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...p}><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"/></svg>),
  pin: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.6"/></svg>),
  clock: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>),
  phone: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>),
  plus: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>),
  minus: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" {...p}><path d="M5 12h14"/></svg>),
  x: (p) => (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>),
  arrow: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>),
  bag: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>),
  truck: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>),
  check: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6 9 17l-5-5"/></svg>),
  fire: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 .5-2S6 9 6 13a6 6 0 0 0 12 0c0-5-6-11-6-11z"/></svg>),
  beer: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 11h11v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M17 13h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/><path d="M6 11s-1-5 3-5c1 0 1.5.5 2.5.5S13 6 14 6c2.5 0 3 2.5 3 2.5"/></svg>),
  user: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>),
  lock: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>),
  bell: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/></svg>),
  chart: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>),
  box: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 8 12 3 3 8l9 5 9-5zM3 8v8l9 5 9-5V8"/></svg>),
  list: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>),
  ig: (p) => (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>),
  menu: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M3 6h18M3 12h18M3 18h18"/></svg>),
  logout: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>),
  help: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M9.2 9a2.9 2.9 0 0 1 5.6.9c0 1.8-2.5 2.2-2.9 3.6"/><path d="M12 17h.01"/></svg>),
  copy: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>),
  search: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>),
  leaf: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 20A7 7 0 0 1 4 13c0-6 6-10 16-11-1 10-5 16-11 11z"/><path d="M4 21c4-6 8-9 13-11"/></svg>),
  sliders: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/></svg>),
  glass: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 3h14l-1.5 9a5.5 5.5 0 0 1-11 0z"/><path d="M12 17v4M8 21h8"/></svg>),
};

Object.assign(window, {
  ENV, PROD_HOST, IMG_OVERRIDES, menuImg, itemImg, loadMenuImages,
  BIZ, MENU, FLAT_ITEMS, findItem, REVIEWS, money, Empanada, Cloche, Logo, LogoBadge, Ic, IMG,
  EXTRAS, MEDALLONES, PROTEINAS, HAPPY, PROMO_VIERNES,
  SHIPPING, SENA_PCT, COUPONS, findCoupon, couponDiscount, couponLabel,
  findExtra, isOpenNow, isHappyNow,
});

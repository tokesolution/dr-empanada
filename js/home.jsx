/* ============================================================
   home.jsx — HOME "cartoon poster" de Dr. Empanada
   Secciones: hero gigante · marquee · las más pedidas · nuestro menú
   · delivery (mostaza) + mapa · las más vendidas · CTA final.
   Animado por fx.js vía data-attrs.
   ============================================================ */

/* ---------- helpers ---------- */
function useFX() {
  const ref = React.useRef(null);
  React.useEffect(() => (window.FX ? FX.bind(ref.current) : undefined), []);
  return ref;
}

function Sticker({ name, size = 90, style, className = "", ...rest }) {
  return (
    <div className={"bfx-ing " + className} aria-hidden="true"
      style={{ width: size, height: size, ...style }}
      dangerouslySetInnerHTML={{ __html: (window.FX && FX.STICKERS[name]) || "" }} {...rest} />
  );
}

function Wave({ fill, flip = false, style }) {
  return (
    <div className="bfx-wave" aria-hidden="true" style={{ transform: flip ? "scaleY(-1)" : undefined, marginBottom: -1, marginTop: -1, ...style }}>
      <svg viewBox="0 0 1440 140" preserveAspectRatio="none">
        <path fill={fill} d="M0,86 C220,132 420,36 720,62 C1020,88 1240,28 1440,72 L1440,141 L0,141 Z" />
      </svg>
      {/* el svg "respira" con un scaleY y su borde recortado deja un hilo de
          fondo a la vista: esta franja del mismo color lo tapa. */}
      <span className="bfx-wave-seal" style={{ background: fill }} />
    </div>
  );
}

function GooglyEyes({ style }) {
  return (
    <div className="bfx-eyes" data-eyes style={style} aria-hidden="true">
      <svg viewBox="0 0 200 90" style={{ width: "100%", display: "block", overflow: "visible" }}>
        <path d="M28 12 Q52 -6 76 10" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M124 10 Q148 -6 172 12" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" />
        <g className="lid">
          <ellipse cx="52" cy="52" rx="30" ry="34" fill="#fff" />
          <circle className="pupil" cx="52" cy="58" r="12" fill="#1c0d02" />
        </g>
        <g className="lid">
          <ellipse cx="148" cy="52" rx="30" ry="34" fill="#fff" />
          <circle className="pupil" cx="148" cy="58" r="12" fill="#1c0d02" />
        </g>
      </svg>
    </div>
  );
}

function Glove({ side = "left", style, ...rest }) {
  const flip = side === "right";
  return (
    <div aria-hidden="true" {...rest} style={{ position: "absolute", transform: flip ? "scaleX(-1)" : undefined, ...style }}>
      <svg viewBox="0 0 120 110" style={{ width: "100%", display: "block" }}>
        <path d="M14 96 Q2 74 16 58 Q4 46 16 34 Q10 18 30 14 Q38 2 54 10 L96 34 Q116 48 106 72 Q96 98 66 102 Q34 106 14 96 Z"
          fill="#fff" stroke="#17130e" strokeWidth="7" strokeLinejoin="round" />
        <path d="M34 34 Q48 28 58 38 M28 56 Q44 50 56 60" stroke="#17130e" strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

const HERO_IMG = "assets/hero-empanada.jpg";

/* Corrimiento (px, SIEMPRE hacia afuera: si va hacia adentro choca con los
   guantes del carrusel) y giro de cada chip de sabor,
   para que queden "desordenados" a los costados. [0] = izquierda, [1] = derecha. */
const SCATTER = [
  [{ dx: 24, rot: -6 }, { dx: 0, rot: 4 }, { dx: 42, rot: -2 }, { dx: 8, rot: 7 }, { dx: 50, rot: -5 }, { dx: 4, rot: 3 }, { dx: 30, rot: -8 }],
  [{ dx: 6, rot: 5 }, { dx: 40, rot: -4 }, { dx: 0, rot: 6 }, { dx: 30, rot: -7 }, { dx: 8, rot: 3 }, { dx: 46, rot: -3 }],
];

/* ============================================================
   SLIDER DE SABORES — el "títere" de la sección Nuestro Menú.
   Las fotos se cruzan con opacidad dentro del mismo blob para que
   los ojos y los guantes no salten entre slide y slide.
   ============================================================ */
function SaborSlider({ index, onIndex }) {
  const items = MENU.find((c) => c.id === "empanadas").items;
  const n = items.length;
  const shift = (d) => onIndex((index + d + n) % n);

  React.useEffect(() => {
    const t = setInterval(() => onIndex((i) => (i + 1) % n), 4600);
    return () => clearInterval(t);
  }, [n, onIndex]);

  // swipe en mobile
  const x0 = React.useRef(null);
  const onStart = (e) => { x0.current = e.touches[0].clientX; };
  const onEnd = (e) => {
    if (x0.current == null) return;
    const dx = e.changedTouches[0].clientX - x0.current;
    if (Math.abs(dx) > 45) shift(dx < 0 ? 1 : -1);
    x0.current = null;
  };

  return (
    <div className="bfx-saborslider">
      <div className="stage" onTouchStart={onStart} onTouchEnd={onEnd}>
        <div data-float=".08" style={{ position: "relative" }}>
          <div className="bfx-blobphoto" style={{ aspectRatio: "1.2", border: "9px solid #fff" }}>
            {items.map((it, k) => (
              <img key={it.id} src={it.img} alt={"Empanada de " + it.name}
                className={"bfx-slide" + (k === index ? " on" : "")}
                loading={k === 0 ? "eager" : "lazy"} />
            ))}
          </div>
          <GooglyEyes style={{ left: "27%", top: "4%", width: "46%" }} />
          <Glove side="left" style={{ left: "-7%", bottom: "8%", width: "clamp(90px,14vw,150px)", zIndex: 3 }} data-pop />
          <Glove side="right" style={{ right: "-7%", bottom: "10%", width: "clamp(90px,14vw,150px)", zIndex: 3 }} data-pop />
        </div>
        <button className="bfx-slidearrow left" onClick={() => shift(-1)} aria-label="Sabor anterior">‹</button>
        <button className="bfx-slidearrow right" onClick={() => shift(1)} aria-label="Sabor siguiente">›</button>
      </div>
      {/* el pie identifica de qué gusto es la foto */}
      <div className="bfx-slidecaption" aria-live="polite">{items[index].name}</div>
    </div>
  );
}

/* ============================================================
   HOME
   ============================================================ */
function Home({ go }) {
  const ref = useFX();
  const empanadas = MENU.find((c) => c.id === "empanadas").items;
  const [sabor, setSabor] = React.useState(0);

  /* Un solo mensaje, repetido para que la cinta no deje huecos: el marquee
     clona la fila y la desplaza, así que una fila más angosta que la pantalla
     se vería medio vacía.
     TODO(Fappi): copy definitivo del marquee y del hero. */
  const marqueeMsgs = Array(6).fill("Promociones todas las semanas");

  const polaroids = [
    { img: "assets/empanadas/carne-cuchillo.jpg", name: "Carne Cuchillo", price: money(2700), rot: -5 },
    { img: "assets/empanadas/cheeseburger.jpg", name: "Cheeseburger", price: money(2700), rot: 3 },
    { img: "assets/empanadas/matambre-pizza.jpg", name: "Matambre a la Pizza", price: money(2700), rot: 6 },
  ];

  /* Barrios: van como chips SOBRE el recorrido punteado.
     x/y están en % del viewBox del recorrido (1440x900 → left=x/14.4, top=y/9),
     tomados de los mismos waypoints que usa la moto en fx.js. */
  const barrios = [
    { n: "VILLA DEVOTO", x: 8, y: 23.4, rot: -4 },
    { n: "VILLA DEL PARQUE", x: 32.1, y: 36.6, rot: 3 },
    { n: "VILLA PUEYRREDÓN", x: 54.2, y: 40, rot: -3 },
    { n: "MONTE CASTRO", x: 73.8, y: 39.8, rot: 5 },
    { n: "SANTA RITA", x: 92, y: 48.4, rot: -6 },
  ];

  // La vitrina muestra el ranking real: las más vendidas primero.
  const masVendidas = [...empanadas].sort((a, b) => b.pop - a.pop).slice(0, 4);
  const reviews = REVIEWS.slice(0, 3);

  return (
    <main ref={ref} className="bfx">

      {/* ================= HERO =================
          Una sola pantalla: titular + títere + palabra gigante. Antes eran
          dos pantallas (el títere arriba y el titular abajo) y había que
          scrollear para ver la propuesta completa. Todo se dimensiona con
          min(vw, svh) para que entre a lo alto en cualquier monitor. */}
      <section className="bfx-hero" aria-label="Dr. Empanada">
        <div className="bfx-hero-grid">
          <div className="bfx-hero-text">
            <div className="bfx-kicker" data-pop>★ EL ESPECIALISTA EN SABOR ★</div>
            <h1 className="bfx-giant bfx-hero-h1" aria-label="Receta del doctor: una docena bien calentita">
              <span aria-hidden="true" data-split="chars" style={{ display: "block" }}>RECETA DEL DOCTOR:</span>
              <span aria-hidden="true" data-split="chars" style={{ display: "block" }}><span className="ylw">UNA DOCENA</span></span>
              <span aria-hidden="true" data-split="chars" style={{ display: "block" }}>BIEN CALENTITA.</span>
            </h1>
            <p className="bfx-copy bfx-hero-lead" data-split="lines">
              Masa casera estirada en el día, rellenos generosos y el repulgue a mano de siempre. Al horno o fritas, con delivery propio por Villa Devoto.
            </p>
            <div className="bfx-hero-ctas" data-pop data-pop-delay=".6">
              <a href="#/menu" className="bfx-blob" data-squash>Pedir online</a>
              <button type="button" className="bfx-ghostbtn"
                onClick={() => { const el = document.getElementById("bfx-sabores"); if (!el) return; if (window.FX && FX.scrollTo) FX.scrollTo(el); else el.scrollIntoView({ behavior: "smooth" }); }}>
                Ver sabores ↓
              </button>
            </div>
          </div>

          {/* el títere: la empanada con ojos, con los sellos alrededor */}
          <div className="bfx-hero-puppet">
            <div className="bfx-hero-burger" data-pop data-pop-delay=".35" data-inertia>
              <div className="bfx-blobphoto" data-idle style={{ width: "100%", height: "100%" }}>
                <img src={HERO_IMG} alt="Empanada de carne cuchillo de Dr. Empanada" fetchPriority="high" />
              </div>
              <GooglyEyes style={{ left: "22%", top: "8%", width: "56%" }} />
            </div>
            <span className="bfx-badge bfx-badge--green" data-pop data-pop-delay=".9" data-idle
              style={{ "--rot": "-9deg", position: "absolute", left: "-4%", bottom: "16%", zIndex: 3 }}>REPULGUE A MANO</span>
            <span className="bfx-badge" data-pop data-pop-delay="1.05" data-idle
              style={{ "--rot": "8deg", position: "absolute", right: "-2%", top: "6%", zIndex: 3 }}>DESDE 1989</span>
          </div>
        </div>

        {/* palabra gigante de fondo: el títere le pisa el borde */}
        <div className="bfx-hero-word bfx-bubble" aria-hidden="true" data-pop data-pop-delay=".4">EMPANADAS</div>
      </section>

      {/* ================= MARQUEE ================= */}
      <div className="bfx-marquee" data-marquee="22" aria-hidden="true">
        <div className="row">
          {marqueeMsgs.map((m, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 34 }}>
              {m} <span className="dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ================= LAS MÁS PEDIDAS (polaroids) ================= */}
      <section style={{ padding: "clamp(70px,9vw,130px) 0 0", textAlign: "center" }} aria-label="Las más pedidas">
        <div className="wrap">
          <div className="bfx-kicker" data-pop>★ LAS MÁS PEDIDAS ★</div>
          <h2 className="bfx-giant bfx-giant--lg" style={{ marginTop: 18 }}>
            <span data-split="chars" style={{ display: "block" }}>SI HAY ALGO QUE CURA TODO</span>
            <span data-split="chars" style={{ display: "block" }}><span className="ylw">SON NUESTRAS EMPANADAS</span></span>
          </h2>
          <div style={{ marginTop: 34 }}>
            <a href="#/menu" className="bfx-blob" data-squash>Pedir online</a>
          </div>

          {/* zIndex 2 + las laterales a la misma altura: la de la derecha
              caía sobre el wave de abajo y le comía la esquina */}
          <div className="bfx-polaroid-row" style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "clamp(18px,3vw,44px)", marginTop: "clamp(44px,6vw,80px)", flexWrap: "wrap" }}>
            {polaroids.map((p, i) => (
              <figure key={p.name} className="bfx-polaroid" data-pop data-pop-delay={i * 0.12} data-inertia
                style={{ "--rot": p.rot + "deg", width: "clamp(220px,20vw,330px)", margin: 0, marginTop: i === 1 ? -26 : 0 }}>
                <img src={p.img} alt={p.name} loading="lazy" style={{ aspectRatio: ".82" }} />
                <figcaption><span>{p.name}</span><b>{p.price}</b></figcaption>
              </figure>
            ))}
          </div>
        </div>
        {/* #191510 = --bfx-dark-sec, el fondo de .bfx-red (ver fx.css) */}
        <Wave fill="#191510" style={{ marginTop: "clamp(-40px,-3vw,-20px)", position: "relative", zIndex: 0 }} />
      </section>

      {/* ================= NUESTRO MENÚ (negro) ================= */}
      <section id="bfx-sabores" className="bfx-red" style={{ paddingTop: "clamp(60px,7vw,110px)", paddingBottom: "clamp(50px,6vw,90px)", overflow: "clip" }} aria-label="Nuestro menú">
        <div className="wrap" style={{ textAlign: "center", position: "relative" }}>
          <Sticker name="fries" size={110} data-pop data-idle style={{ position: "absolute", left: "2%", top: -30, "--rot": "-14deg" }} />
          <Sticker name="beer" size={110} data-pop data-idle style={{ position: "absolute", right: "3%", top: 60, "--rot": "10deg" }} />
          <div className="bfx-kicker" data-pop style={{ color: "#f6e8d2" }}>EL ESPECIALISTA EN SABOR</div>
          <h2 className="bfx-giant bfx-giant--lg bfx-giant--cream" style={{ marginTop: 16 }}>
            <span data-split="chars" style={{ display: "block" }}>NUESTRO <span className="soft">MENÚ</span></span>
          </h2>
          <p className="bfx-copy" data-split="lines" style={{ maxWidth: 560, margin: "24px auto 0" }}>
            Deslizá para conocer nuestros sabores.
          </p>

          {/* el títere es un slider (una foto por sabor) y los 13 sabores
              van "desordenados" a los costados: mitad a la izquierda y
              mitad a la derecha, cada chip con su propio corrimiento y giro.
              En celu se apilan debajo (ver .bfx-saborlayout en fx.css). */}
          <div className="bfx-saborlayout">
            {[empanadas.slice(0, Math.ceil(empanadas.length / 2)), empanadas.slice(Math.ceil(empanadas.length / 2))].map((col, side) => (
              <div key={side} className={"bfx-saborside " + (side === 0 ? "left" : "right")}>
                {col.map((it, k) => {
                  const i = side === 0 ? k : k + Math.ceil(empanadas.length / 2);
                  const s = SCATTER[side][k % SCATTER[side].length];
                  return (
                    <button key={it.id} type="button"
                      className={"bfx-chip bfx-saborchip" + (i === sabor ? " bfx-chip--solid" : "")}
                      style={{ "--dx": s.dx + "px", "--rot": s.rot + "deg" }}
                      aria-pressed={i === sabor}
                      onClick={() => setSabor(i)}>{it.name}</button>
                  );
                })}
              </div>
            ))}
            <SaborSlider index={sabor} onIndex={setSabor} />
          </div>
        </div>
      </section>

      {/* ================= DELIVERY (mostaza) ================= */}
      <section className="bfx-mustardsec" style={{ padding: "0 0 clamp(36px,4vw,64px)", overflow: "clip" }} aria-label="Delivery por Villa Devoto y alrededores">
        {/* la entrada al naranja va con wave. El background del wave tiene que
            ser el de la sección de ARRIBA (#191510) o se ve el escalón. */}
        <Wave fill="#f2900d" style={{ background: "#191510", position: "relative", zIndex: 3 }} />

        {/* Todo entra en una pantalla: arriba texto + mapa lado a lado, y
            abajo la franja del recorrido con los barrios. Antes iba todo
            apilado y el mapa quedaba fuera de la vista. */}
        <div className="wrap" style={{ position: "relative", zIndex: 2, paddingTop: "clamp(10px,2vw,30px)" }}>
          <div className="bfx-deliv-grid">
            <div>
              <div className="bfx-kicker" data-pop>DELIVERY PROPIO + TAKE AWAY</div>
              <h2 className="bfx-giant bfx-giant--md bfx-giant--outline" style={{ marginTop: 12, textAlign: "left" }}>
                <span data-split="chars" style={{ display: "block" }}>DE LA COCINA</span>
                <span data-split="chars" style={{ display: "block" }}>A TU PUERTA/MESA</span>
              </h2>
              <p className="bfx-copy" data-split="lines" style={{ maxWidth: 520, marginTop: 18, color: "#4a2c00" }}>
                Salen calentitas del horno y llegan calentitas a tu casa: repartidores propios, sin apps de por medio. ¿Estás cerca? Pasá a buscarlas por {BIZ.address}.
              </p>
              <p className="bfx-hand" style={{ marginTop: 14, fontSize: 18, letterSpacing: ".06em", textTransform: "uppercase", color: "#4a2c00" }}>
                📍 {BIZ.address} · {BIZ.city}
              </p>
            </div>

            {/* mapa del local */}
            <div className="bfx-mapcard">
              <iframe
                src={"https://www.google.com/maps?q=" + encodeURIComponent(BIZ.mapsQuery) + "&z=15&output=embed"}
                title={"Mapa de Dr. Empanada · " + BIZ.address}
                loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
          </div>

          {/* recorrido + moto + chips de barrios.
              data-path-scene vive acá (no en la sección entera): así el scrub
              de la moto arranca y termina con el recorrido a la vista, en vez
              de gastar media animación con la ruta fuera de pantalla. */}
          <div className="bfx-routebox" data-path-scene>
            <svg viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
              <path className="bfx-route" d="M -80 240 C 260 100 520 480 780 360 C 1040 240 1200 520 1560 420"
                fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="6" strokeDasharray="20 26" strokeLinecap="round" />
            </svg>
            <div className="bfx-rider" aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: (window.FX && FX.STICKERS.moto) || "" }} />
            {/* el pin centra sobre la ruta y el chip se queda con la rotación:
                data-pop anima el transform del elemento, así que si el
                translate(-50%,-50%) viviera en el mismo nodo, GSAP lo pisaría
                y el chip se correría medio ancho al aparecer. */}
            {barrios.map((b, i) => (
              <span key={b.n} className="bfx-routepin" style={{ "--x": b.x + "%", "--y": b.y + "%" }}>
                <span className="bfx-routechip" data-pop data-pop-delay={i * 0.1}
                  style={{ "--rot": b.rot + "deg" }}>{b.n}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LAS MÁS VENDIDAS (oscuro) ================= */}
      <section className="bfx-bar" style={{ padding: "0 0 clamp(80px,9vw,130px)" }} aria-label="Las más vendidas">
        <Wave fill="#241c12" style={{ background: "#f2900d" }} />
        <div className="wrap" style={{ textAlign: "center", paddingTop: "clamp(50px,6vw,90px)", position: "relative" }}>
          <Sticker name="burger" size={120} data-pop data-idle style={{ position: "absolute", right: "4%", top: -20, "--rot": "12deg" }} />
          <div className="bfx-kicker" data-pop style={{ color: "#f6e8d2" }}>★ EL RANKING DEL MOSTRADOR ★</div>
          <h2 className="bfx-giant bfx-giant--lg" style={{ marginTop: 16, color: "#f29211" }}>
            <span data-split="chars" style={{ display: "block" }}>LAS MÁS</span>
            <span data-split="chars" style={{ display: "block" }}>VENDIDAS.</span>
          </h2>
          <p className="bfx-copy" data-split="lines" style={{ maxWidth: 560, margin: "22px auto 0", color: "#f6e8d2" }}>
            Las que más salen por el mostrador, semana tras semana. Todas con masa casera y repulgue a mano, al horno o fritas al mismo precio.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(215px, 1fr))", gap: 20, marginTop: "clamp(40px,5vw,64px)", textAlign: "left" }}>
            {masVendidas.map((b, i) => (
              <div key={b.id} className="bfx-beercard" data-pop data-pop-delay={i * 0.07} data-inertia style={{ "--rot": ((i % 3) - 1) * 2 + "deg" }}>
                <div className="thumb">
                  <img src={b.img} alt={"Empanada de " + b.name} loading="lazy" />
                  <span className="rank">#{i + 1}</span>
                </div>
                <div>
                  <div className="name">{b.name}</div>
                  <div className="brew">Al horno o frita</div>
                </div>
                <div className="row"><span>Las más pedidas</span><span>{b.pop}%</span></div>
                <div className="bfx-meter"><span style={{ width: b.pop + "%" }} /></div>
                <div className="row"><span className="price">{money(b.price)}</span></div>
              </div>
            ))}
          </div>
          <p className="bfx-hand" style={{ marginTop: 26, fontSize: 18, letterSpacing: ".08em", color: "rgba(246,232,210,.65)", textTransform: "uppercase" }}>
            Elaboración propia · Horneadas en el día · Desde 1989
          </p>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      {/* Compacto: llamado a pedir a la izquierda y reseñas a la derecha, en
          una sola pantalla (antes iba todo apilado y medía casi dos). */}
      <section style={{ overflow: "clip", paddingBottom: "clamp(30px,4vw,60px)" }} aria-label="Pedí ahora">
        <Wave fill="#1a1611" style={{ background: "#241c12", marginBottom: "clamp(24px,3vw,44px)" }} />
        <div className="wrap bfx-cta-grid">
          <div className="bfx-cta-text">
            <div className="bfx-kicker" data-pop>¿TE PICÓ EL ANTOJO?</div>
            <h2 className="bfx-giant bfx-giant--lg" style={{ marginTop: 12 }}>
              <span data-split="chars" style={{ display: "block" }}>PEDÍ <span className="ylw">AHORA.</span></span>
            </h2>
            <p className="bfx-copy" data-split="lines" style={{ maxWidth: 480, margin: "16px 0 26px" }}>
              Armá tu pedido online en un minuto: elegís los sabores, sumás de a una y te avisamos cuando sale del horno. {isOpenNow() ? "Estamos abiertos ahora mismo." : "Abrimos de martes a sábado desde las 12."}
            </p>
            <a href="#/menu" className="bfx-blob" data-squash style={{ fontSize: "clamp(20px,2vw,28px)" }}>Pedir online →</a>
          </div>

          {/* reseñas: polaroids encimadas en abanico */}
          <div className="bfx-cta-reviews">
            {reviews.map((r, i) => (
              <div key={r.name} className="bfx-polaroid bfx-reviewcard" data-pop data-pop-delay={i * 0.12} data-inertia
                style={{ "--rot": [-4, 3, -2][i] + "deg" }}>
                <div style={{ color: "var(--bfx-mustard)", fontSize: 16, letterSpacing: 2 }}>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</div>
                <p className="bfx-copy" style={{ fontSize: 17, margin: "6px 0 8px", lineHeight: 1.22 }}>“{r.text}”</p>
                <div className="bfx-hand" style={{ textTransform: "uppercase", letterSpacing: ".1em", fontSize: 14, opacity: .6 }}>{r.name} · {r.when}</div>
              </div>
            ))}
            <div className="bfx-hand" style={{ fontSize: 17, textTransform: "uppercase", letterSpacing: ".14em", opacity: .7, textAlign: "center" }}>
              {BIZ.rating}★ · {BIZ.reviewsCount} reseñas en Google
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { Home, Sticker, Wave, GooglyEyes, SaborSlider });

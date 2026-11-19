/* ============================================================
   about-contact.jsx — Nosotros (mismo lenguaje que el home),
   Contacto (una sola pantalla) y Privacidad (legales, tema oscuro).
   ============================================================ */

/* ===================== NOSOTROS =====================
   Misma estética que el home pero con recursos propios:
   1) hero con la "receta del Dr." (una receta médica de verdad: Rp/,
      letra manuscrita, firma y sello) + contadores que suben solos;
   2) "una historia en cada capa" como recorrido HORIZONTAL que avanza
      con el scroll (se fija la sección y las capas pasan de costado);
   3) cierre con una cinta de fotos en movimiento.
   La información es la misma de siempre. */
function CountUp({ to, prefix = "", suffix = "", decimals = 0, dur = 1400 }) {
  const ref = React.useRef(null);
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.FX && FX.rm) { setV(to); return; }
    let raf = 0, started = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started) return;
      started = true;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        setV(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: .4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{prefix}{v.toFixed(decimals).replace(".", ",")}{suffix}</span>;
}

function Nosotros({ go }) {
  const ref = React.useRef(null);
  const secRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const barRef = React.useRef(null);
  React.useEffect(() => (window.FX ? FX.bind(ref.current) : undefined), []);

  /* recorrido horizontal: la sección se fija y la tira de capas se desplaza
     de costado con el scroll (sólo desktop; en celu se desliza con el dedo) */
  React.useEffect(() => {
    if (!window.gsap || !window.ScrollTrigger || (window.FX && FX.rm)) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const sec = secRef.current, track = trackRef.current;
      const dist = () => Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
      const tw = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: sec, start: "top 72px", end: () => "+=" + dist(),
          // pinType transform: la página vive dentro de .bfx-route-in (que
          // anima con transform) y ahí un position:fixed se descoloca
          pin: true, pinType: "transform", scrub: .6, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (st) => { if (barRef.current) barRef.current.style.transform = "scaleX(" + st.progress + ")"; },
        },
      });
      ScrollTrigger.refresh();
      return () => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); };
    });
    return () => mm.revert();
  }, []);

  const story = [
    { n: "01", tag: "MASA CASERA", cls: "bfx-badge--green", img: "assets/horno-tabla.jpg", txt: "Masa propia estirada en el día: finita, elástica y con el punto justo de horno." },
    { n: "02", tag: "RELLENO GENEROSO", cls: "bfx-badge--red", img: "assets/carne-corte.jpg", txt: "Carne cortada a cuchillo, cebolla dorada lenta y rellenos que se cocinan a fuego lento." },
    { n: "03", tag: "QUESO QUE SE ESTIRA", cls: "", img: "assets/empanadas/provolone-horno.webp", txt: "Muzzarella, provolone y cheddar de verdad, que se funden y se estiran en cada bocado." },
    { n: "04", tag: "REPULGUE A MANO", cls: "bfx-badge--red", img: "assets/repulgue.jpg", txt: "Cada empanada cerrada a mano, con el repulgue de siempre. Así se distingue cada sabor." },
    { n: "05", tag: "PASTELITOS CROCANTES", cls: "bfx-badge--green", img: "assets/pastelitos-membrillo.jpg", txt: "Hojaldre frito y crocante con membrillo, batata o dulce de leche. El final obligado." },
  ];
  const years = new Date().getFullYear() - BIZ.since;
  const reel = ["assets/horno-fila.jpg", "assets/empanadas/carne-cuchillo-frita.webp", "assets/pastelitos-enteros.jpg", "assets/empanadas/humita-horno.webp",
    "assets/promo-bandeja.jpg", "assets/empanadas/vacio-horno.webp", "assets/empanadas/caprese-frita.webp", "assets/empanadas/cheese-horno.webp"];

  return (
    <main ref={ref} className="bfx bfx-about">
      {/* ===== HERO: la receta del Dr. ===== */}
      <section className="bfx-ab-hero" aria-label="Nuestra historia">
        <div className="bfx-ab-hero-grid">
          <div>
            <div className="bfx-kicker" data-pop>★ NUESTRA HISTORIA ★</div>
            <h1 className="bfx-giant bfx-ab-h1" aria-label="Una receta de 1989">
              <span aria-hidden="true" data-split="chars" style={{ display: "block" }}>UNA RECETA</span>
              <span aria-hidden="true" data-split="chars" style={{ display: "block" }}>DE <span className="ylw">1989.</span></span>
            </h1>
            <p className="bfx-copy" data-split="lines" style={{ maxWidth: 500, margin: "18px 0 0" }}>
              No tenemos una lista larga de ingredientes: tenemos una corta, y somos obsesivos con cada cosa que entra.
              Desde 1989 haciendo la empanada que nos gustaría comer.
            </p>
          </div>

          {/* la receta médica */}
          <div className="bfx-rx-wrap" data-pop data-pop-delay=".3">
            <div className="bfx-rx">
              <div className="bfx-rx-head">
                <span className="bfx-logobadge" style={{ fontSize: 6 }}><img src="assets/logo.webp" alt="" width="512" height="512" /></span>
                <div>
                  <div className="dr">Dr. Empanada</div>
                  <div className="sp">El especialista en sabor · Mat. 1989</div>
                </div>
              </div>
              <div className="bfx-rx-body">
                <div className="rp">Rp/</div>
                <ol className="hand">
                  <li>Masa casera, estirada en el día.</li>
                  <li>Relleno generoso, a fuego lento.</li>
                  <li>Repulgue a mano, uno por uno.</li>
                  <li>Al horno o frita, a gusto.</li>
                </ol>
                <div className="hand dose">Tomar una docena cada vez que haya hambre.</div>
              </div>
              <div className="bfx-rx-foot">
                <span>{BIZ.address} · {BIZ.city}</span>
                <svg className="sign" viewBox="0 0 160 50" aria-hidden="true"><path d="M6 36 C 22 6, 30 46, 44 24 S 66 8, 72 30 S 92 44, 104 18 S 132 10, 154 30" fill="none" stroke="#1d3f8f" strokeWidth="3" strokeLinecap="round" /></svg>
              </div>
              <div className="bfx-rx-stamp" aria-hidden="true">
                <span>VILLA DEVOTO</span><b>APROBADO</b><span>· DESDE 1989 ·</span>
              </div>
            </div>
          </div>
        </div>

        {/* contadores */}
        <div className="bfx-ab-stats">
          <div><b><CountUp to={years} prefix="+" /></b><span>años de historia</span></div>
          <div><b><CountUp to={BIZ.rating} decimals={1} suffix="★" /></b><span>en Google · {BIZ.reviewsCount} reseñas</span></div>
          <div><b><CountUp to={13} /></b><span>sabores de empanada</span></div>
          <div><b><CountUp to={100} suffix="%" /></b><span>casero, todos los días</span></div>
        </div>
      </section>

      {/* ===== UNA HISTORIA EN CADA CAPA: recorrido horizontal ===== */}
      <section ref={secRef} className="bfx-mustardsec bfx-ab-layers" aria-label="Una historia en cada capa">
        <div className="bfx-ab-layers-in">
          <div className="bfx-ab-track-viewport">
            <div ref={trackRef} className="bfx-ab-track">
              <div className="bfx-ab-intro">
                <h2 className="bfx-giant bfx-giant--md bfx-giant--outline">
                  <span style={{ display: "block" }}>UNA HISTORIA</span>
                  <span style={{ display: "block" }}>EN CADA CAPA.</span>
                </h2>
                <p className="bfx-copy" style={{ color: "#4a2c00", margin: "16px 0 0" }}>
                  No elegimos ingredientes de una lista: pensamos de dónde vienen, por qué importan y qué le suman a cada empanada.
                </p>
                <div className="bfx-hand hint"><span className="d">Seguí bajando →</span><span className="m">Deslizá →</span></div>
              </div>
              {story.map((s, i) => (
                <article key={s.tag} className="bfx-ab-panel" style={{ "--r": (i % 2 ? 1.5 : -1.5) + "deg" }}>
                  <div className="pic">
                    <img src={s.img} alt={s.tag} loading="eager" decoding="async" />
                    <span className="num">{s.n}</span>
                  </div>
                  <span className={"bfx-badge " + s.cls} style={{ "--rot": (i % 2 ? 4 : -4) + "deg" }}>{s.tag}</span>
                  <p>{s.txt}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="bfx-ab-progress" aria-hidden="true"><span ref={barRef} /></div>
        </div>
      </section>

      {/* ===== CIERRE: desde 1989, con hambre + cinta de fotos ===== */}
      <section className="bfx-ab-close" aria-label="De Villa Devoto">
        <div className="bfx-ab-reel" aria-hidden="true">
          <div className="row">
            {[...reel, ...reel].map((src, i) => (
              <figure key={i} style={{ "--r": ((i % 3) - 1) * 3 + "deg" }}><img src={src} alt="" loading="eager" decoding="async" /></figure>
            ))}
          </div>
        </div>
        <div className="bfx-about-wrap bfx-ab-close-in">
          <span className="bfx-badge bfx-badge--red" data-pop data-idle style={{ "--rot": "-6deg" }}>MELINCUÉ 4399 · VILLA DEVOTO</span>
          <h2 className="bfx-giant bfx-giant--md" style={{ marginTop: 14 }}>
            <span data-split="chars">DESDE 1989, </span><span data-split="chars" className="ylw">CON HAMBRE.</span>
          </h2>
          <p className="bfx-copy" data-split="lines" style={{ maxWidth: 700, margin: "16px auto 0" }}>
            Arrancamos con un horno, una masa casera y cero vueltas. Hoy servimos en el salón, llevamos con delivery propio
            y horneamos todos los días menos los lunes. Docenas surtidas para juntadas, docena en promo los viernes y
            promo mediodía de martes a sábado.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 22, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
            <a href="#/menu" className="bfx-blob" style={{ fontSize: 20 }} data-squash>Ver el menú →</a>
            <a href={"https://instagram.com/" + BIZ.ig} target="_blank" rel="noopener" className="bfx-pill-ylw" style={{ fontSize: 18 }}>
              <Ic.ig width={18} height={18} /> Seguinos
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ===================== CONTACTO =====================
   Todo en UNA pantalla: a la izquierda el titular y el formulario (sale a
   WhatsApp), a la derecha el mapa, los datos y los horarios. Scrolleando
   se llega directo al footer. Misma información que antes. */
function Contacto({ go }) {
  const ref = React.useRef(null);
  React.useEffect(() => (window.FX ? FX.bind(ref.current) : undefined), []);
  const [f, setF] = React.useState({ nombre: "", tel: "", msg: "" });
  const submit = (e) => {
    e.preventDefault();
    const text = `¡Hola Dr. Empanada! Soy ${f.nombre}${f.tel ? " (" + f.tel + ")" : ""}. ${f.msg}`;
    window.open(waLink(text), "_blank", "noopener");
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const cards = [
    ["Dónde", BIZ.address, BIZ.city, "https://www.google.com/maps/search/?api=1&query=Melincu%C3%A9+4399+Villa+Devoto+CABA"],
    ["WhatsApp", BIZ.phoneDisplay, "Pedidos y consultas", waLink("¡Hola Dr. Empanada! Tengo una consulta 🥟")],
    ["Instagram", "@" + BIZ.ig, "Novedades y promos", "https://instagram.com/" + BIZ.ig],
  ];

  return (
    <main ref={ref} className="bfx">
      <section className="bfx-contact" aria-label="Contacto">
        <div className="bfx-contact-grid">
          {/* izquierda: titular + formulario */}
          <div className="bfx-contact-left">
            <div className="bfx-kicker" data-pop>★ DECÍ HOLA ★</div>
            <h1 className="bfx-giant bfx-giant--md" style={{ marginTop: 10 }}>
              <span data-split="chars" style={{ display: "block" }}>¿SE TE ANTOJA?</span>
              <span data-split="chars" style={{ display: "block" }}><span className="ylw">HABLEMOS.</span></span>
            </h1>
            <p className="bfx-copy" data-split="lines" style={{ maxWidth: 500, margin: "14px 0 0" }}>
              Eventos, pedidos grandes, cumpleaños o simplemente hambre: escribinos y el mensaje sale directo a nuestro WhatsApp.
            </p>

            <form onSubmit={submit} className="bfx-contact-form">
              <input className="bfx-input" required placeholder="Tu nombre" value={f.nombre} onChange={set("nombre")} aria-label="Nombre" />
              <input className="bfx-input" placeholder="Tu WhatsApp (opcional)" value={f.tel} onChange={set("tel")} aria-label="WhatsApp" />
              <textarea className="bfx-input" required rows={3} placeholder="Contanos qué se te antoja…" value={f.msg} onChange={set("msg")} aria-label="Mensaje" style={{ resize: "vertical", gridColumn: "1 / -1" }} />
              <div style={{ gridColumn: "1 / -1" }}>
                <button type="submit" className="bfx-pill-ylw" data-squash>Enviar por WhatsApp</button>
              </div>
            </form>
          </div>

          {/* derecha: mapa + datos + horarios */}
          <div className="bfx-contact-right">
            <div className="bfx-stickerframe bfx-contact-map" data-pop style={{ rotate: "-.8deg" }}>
              <iframe
                title="Mapa Dr. Empanada"
                src="https://maps.google.com/maps?q=Melincu%C3%A9%204399%2C%20Villa%20Devoto%2C%20CABA&t=&z=16&ie=UTF8&iwloc=&output=embed"
                style={{ border: 0, width: "100%", height: "100%" }}
                loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <div className="bfx-contact-info">
              <div className="bfx-contact-cards">
                {cards.map(([t, m, s, href], i) => (
                  <a key={t} href={href} target="_blank" rel="noopener" className="bfx-panel bfx-panel--ink" data-pop data-pop-delay={i * 0.08}
                    style={{ rotate: ((i % 2 ? 1 : -1) * 1) + "deg" }}>
                    <div className="bfx-hand t">{t}</div>
                    <div className="bfx-bubble m">{m}</div>
                    <div className="bfx-hand s">{s}</div>
                  </a>
                ))}
              </div>
              <div className="bfx-panel bfx-panel--ink bfx-contact-hours" data-pop data-pop-delay=".24" style={{ rotate: "1deg" }}>
                <div className="bfx-hand t">Horarios</div>
                {BIZ.hours.map((h) => (
                  <div key={h.d} className="bfx-hand row" style={{ opacity: h.closed ? .6 : 1 }}>
                    <span>{h.d}</span><span style={{ color: h.closed ? "var(--bfx-brand)" : "inherit" }}>{h.h}</span>
                  </div>
                ))}
                <div className="bfx-hand" style={{ fontSize: 15, color: "var(--bfx-green)", marginTop: 8 }}>★ Promo mediodía · {HAPPY.when.toLowerCase()}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ===================== PRIVACIDAD (tema oscuro, legales) ===================== */
function Privacidad({ go }) {
  const block = { border: "1px solid var(--line-dark)", borderRadius: 14, padding: 24, background: "var(--ink-2)", marginBottom: 16 };
  return (
    <div className="fadeup">
      <section style={{ borderBottom: "1px solid var(--line-dark)" }}>
        <div className="wrap" style={{ padding: "54px 24px 30px" }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Legales</div>
          <h1 className="display" style={{ fontSize: "clamp(40px,6vw,80px)", margin: 0 }}>Política de privacidad</h1>
          <p className="mono" style={{ fontSize: 12.5, color: "var(--muted-d)", marginTop: 14 }}>Última actualización: julio 2026</p>
        </div>
      </section>

      <div className="wrap" style={{ padding: "40px 24px 70px", maxWidth: 820 }}>
        <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.6, marginBottom: 28 }}>
          En Dr. Empanada cuidamos tus datos tanto como nuestras empanadas. Acá te contamos qué información pedimos, para qué la usamos y qué derechos tenés.
        </p>

        <div style={block}>
          <h2 className="display" style={{ fontSize: 22, margin: "0 0 10px" }}>Qué datos recopilamos</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
            Cuando hacés un pedido te pedimos únicamente lo necesario para prepararlo y entregarlo: <b style={{ color: "var(--white)" }}>nombre</b>, <b style={{ color: "var(--white)" }}>teléfono / WhatsApp</b>, <b style={{ color: "var(--white)" }}>dirección</b> (solo si elegís delivery) y las notas que agregues al pedido.
          </p>
        </div>

        <div style={block}>
          <h2 className="display" style={{ fontSize: 22, margin: "0 0 10px" }}>Para qué los usamos</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
            Usamos tus datos exclusivamente para procesar tu pedido, coordinar el pago y la entrega, y avisarte el estado por WhatsApp. Nada más. No los usamos para publicidad ni los vendemos o cedemos a terceros con fines comerciales.
          </p>
        </div>

        <div style={block}>
          <h2 className="display" style={{ fontSize: 22, margin: "0 0 10px" }}>Dónde se guardan</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
            El pedido se arma en tu propio navegador y se coordina con nosotros por WhatsApp. Conservamos los datos de tu pedido solo el tiempo necesario para gestionarlo y por temas administrativos o fiscales.
          </p>
        </div>

        <div style={block}>
          <h2 className="display" style={{ fontSize: 22, margin: "0 0 10px" }}>Servicios de terceros</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
            Para coordinar pagos y entregas podemos usar plataformas de terceros como WhatsApp y Mercado Pago, que tienen sus propias políticas de privacidad. El sitio se aloja en Cloudflare y usa fuentes de Google Fonts.
          </p>
        </div>

        <div style={block}>
          <h2 className="display" style={{ fontSize: 22, margin: "0 0 10px" }}>Tus derechos</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
            Podés pedirnos acceder, corregir o eliminar tus datos cuando quieras. Escribinos por WhatsApp al <b style={{ color: "var(--white)" }}>{BIZ.phoneDisplay}</b> y lo resolvemos. Conforme a la Ley 25.326 de Protección de Datos Personales de Argentina.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
          <a className="btn btn-orange" href={waLink("¡Hola Dr. Empanada! Tengo una consulta sobre mis datos 🔒")} target="_blank" rel="noopener"><Ic.wa width={18} height={18} /> Escribinos</a>
          <button className="btn btn-ghost" onClick={() => go("#/")}>Volver al inicio</button>
        </div>
      </div>
    </div>
  );
}

/* helpers de formulario (los usan checkout y el panel admin) */
const inp = { width: "100%", padding: "12px 14px", borderRadius: 9, border: "1px solid var(--line-dark)", background: "var(--ink)", color: "var(--white)", fontFamily: "var(--body)", fontSize: 15 };
function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <span className="mono" style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}

Object.assign(window, { Nosotros, Contacto, Privacidad, Field, inp });

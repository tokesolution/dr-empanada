/* ============================================================
   components.jsx — Reveal, Photo, Header, Footer, FAB, ProductCard,
   Customizer (armá tu burger), Toast
   ============================================================ */
const { useState, useEffect, useRef } = React;

const waLink = (text) =>
  `https://wa.me/${BIZ.phoneE164}?text=${encodeURIComponent(text)}`;

const toast = (msg) => window.dispatchEvent(new CustomEvent("bf-toast", { detail: msg }));

/* ---------- Reveal on scroll ---------- */
let _revObs = null;
function revealObserver() {
  if (!_revObs) {
    _revObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); _revObs.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  }
  return _revObs;
}
function Reveal({ children, delay = 0, style, className = "", as = "div" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = revealObserver();
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  const Tag = as;
  return (
    <Tag ref={ref} className={"reveal " + className} style={{ ...style, transitionDelay: delay ? delay + "ms" : undefined }}>
      {children}
    </Tag>
  );
}

/* ---------- Stars ---------- */
function Stars({ value = 5, size = 16 }) {
  return (
    <div style={{ display: "inline-flex", gap: 2, color: "var(--beer)" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Ic.star key={i} width={size} height={size}
          style={{ opacity: i < Math.round(value) ? 1 : .25 }} />
      ))}
    </div>
  );
}

/* ---------- Photo (foto real con skeleton + fallback icónico) ---------- */
const KIND_IMG = {
  burger: "assets/empanadas/carne-cuchillo.jpg",
  beer: "assets/promo-bandeja.jpg",
  fries: "assets/pastelitos-membrillo.jpg",
  ribs: "assets/empanadas/vacio.jpg",
  drink: "assets/promo-docena.jpg",
  promo: "assets/promo-docena.jpg",
  combo: "assets/tabla-carne.jpg",
  cheers: "assets/horno-fila.jpg",
  tap: "assets/horno-tabla.jpg",
};
const CAT_ICON = { drinks: Ic.glass };
function Photo({ item, src, kind, alt = "", className = "", style }) {
  const [ld, setLd] = useState(false);
  const url = src || menuImg(item) || (kind && KIND_IMG[kind]) || null;
  if (!url) {
    const Icon = (item && CAT_ICON[item.cat]) || Ic.glass;
    return (
      <div className={"ph ready " + className} style={style}>
        <span className="ph-icon"><Icon width={30} height={30} /></span>
      </div>
    );
  }
  return (
    <div className={"ph " + (ld ? "ready " : "") + className} style={style}>
      <img src={url} alt={alt || (item && item.name) || ""} loading="lazy"
        className={ld ? "ld" : ""} onLoad={() => setLd(true)} />
    </div>
  );
}

/* ============================================================
   HEADER — announcement bar + nav + estado abierto
   ============================================================ */
function OpenBadge({ compact = false }) {
  const open = isOpenNow();
  return (
    <span className="mono" style={{
      display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700,
      letterSpacing: ".08em", textTransform: "uppercase",
      color: open ? "var(--ok)" : "var(--danger)",
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor", boxShadow: open ? "0 0 0 3px rgba(63,174,107,.2)" : "none" }} />
      {open ? "Abierto ahora" : "Cerrado"}{!compact && !open && " · Mar–Sáb desde las 12"}
    </span>
  );
}

function Header({ route, go }) {
  const store = useStore();
  const [open, setOpen] = useState(false);     // mobile menu
  const [scrolled, setScrolled] = useState(false);
  const [bump, setBump] = useState(false);
  // páginas con tema claro cartoon (header crema)
  const home = ["#/", "", "#/menu", "#/nosotros", "#/contacto", "#/checkout"].includes(route);
  const count = store.cartCount();
  const links = [
    ["#/", "Inicio"], ["#/menu", "Menú"], ["#/nosotros", "Nosotros"], ["#/contacto", "Contacto"],
  ];
  useEffect(() => {
    // IO sobre un sentinel en el tope del documento (evita listener de scroll)
    const s = document.getElementById("bf-top-sentinel");
    if (!s) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { rootMargin: "12px 0px 0px 0px" });
    io.observe(s);
    return () => io.disconnect();
  }, []);
  useEffect(() => { setOpen(false); }, [route]);
  useEffect(() => {
    const b = () => { setBump(true); setTimeout(() => setBump(false), 380); };
    window.addEventListener("bf-cart-bump", b);
    return () => window.removeEventListener("bf-cart-bump", b);
  }, []);

  return (
    <header className={"bfx-head" + (home ? " bfx-header-light" : "") + (scrolled ? " is-scrolled" : "")}>
      <div className="bfx-head-bar" style={{
        background: home ? undefined : (scrolled ? "rgba(12,12,13,.92)" : "rgba(12,12,13,.75)"),
        backdropFilter: home ? undefined : "blur(12px)",
        borderBottom: home ? undefined : ("1px solid " + (scrolled ? "var(--line-dark)" : "transparent")),
      }}>
        {/* Orden del DOM: nav · logo · acciones.
            Desktop: la nav queda a la izquierda y el sello se centra en
            absoluto (ver .bfx-logolink en fx.css), sobresaliendo de la barra.
            Mobile: la nav está oculta, así que el sello cae primero = a la
            izquierda, como siempre. */}
        <div className="wrap" style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, position: "relative" }}>
          <nav className="bf-desktop-nav" style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {links.map(([href, label]) => (
              <a key={href} href={href} className={"bfx-navlink" + (route === href ? " on" : "")}>{label}</a>
            ))}
          </nav>

          <a href="#/" aria-label="Inicio" className="bfx-logolink" style={{ flexShrink: 0, display: "flex" }}><LogoBadge fontSize={8.2} /></a>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="bf-desktop-nav bfx-openpill"><OpenBadge compact /></span>
            <a href="#/menu" className="bfx-navcta bf-order-cta">Pedir online</a>
            <button className={"bfx-headbtn" + (bump ? " bf-bump" : "")} onClick={() => window.dispatchEvent(new Event("bf-open-cart"))}
              aria-label="Carrito">
              <Ic.cart />
              {count > 0 && <span className="badge">{count}</span>}
            </button>
            <button className="bf-burger bfx-headbtn" onClick={() => setOpen((o) => !o)} aria-label="Menú"
              style={{ display: "none" }}>
              {open ? <Ic.x /> : <Ic.menu />}
            </button>
          </div>
        </div>

        {/* mobile drawer */}
        {open && (
          <div className="bf-mobile-nav" style={{ borderTop: "2px solid var(--bfx-hair)", background: "var(--bfx-cream)", padding: "10px 24px 22px" }}>
            {links.map(([href, label], i) => (
              <a key={href} href={href} style={{
                display: "block", fontSize: 34, padding: "13px 0", color: route === href ? "var(--bfx-mustard)" : "var(--bfx-ink)",
                fontFamily: "var(--bfx-round)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".01em",
                borderBottom: "2px solid var(--bfx-hair)",
                animation: `bf-slidein .35s ${i * 60}ms both`,
              }}>{label}</a>
            ))}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
              <span className="bfx-openpill"><OpenBadge /></span>
              <a href={"https://instagram.com/" + BIZ.ig} target="_blank" rel="noopener" style={{ color: "var(--bfx-deep)", display: "grid" }}><Ic.ig /></a>
            </div>
            <a href="#/menu" className="bfx-blob" style={{ marginTop: 16, width: "100%", fontSize: 20 }}>Pedir online</a>
          </div>
        )}
      </div>
    </header>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer({ go }) {
  const ref = useRef(null);
  useEffect(() => (window.FX ? FX.bind(ref.current) : undefined), []);
  // rellenos reales de la carta (stickers v2 de fx.js)
  const ings = ["emp", "morron", "aceituna", "huevo", "cebolla", "queso", "aji", "pastelito"];
  return (
    <footer ref={ref} className="bfx-footer">
      {/* el corte con la página va con wave, como el resto del sitio (antes
          era un hairline que cruzaba la pantalla de lado a lado). zIndex 1 y
          antes de la fuente en el DOM: los ingredientes le pasan por encima. */}
      <Wave fill="#241c12" style={{ background: "var(--bfx-cream)", position: "relative", zIndex: 1 }} />
      {/* fuente de ingredientes saltando desde abajo (queda por detrás del contenido) */}
      <div className="bfx-fountain" data-fountain aria-hidden="true">
        {ings.map((k, i) => (
          <div key={k} className="bfx-ing" style={{ width: 62, height: 62, left: (5 + i * 11.5) + "%" }}
            dangerouslySetInnerHTML={{ __html: (window.FX && FX.STICKERS[k]) || "" }} />
        ))}
      </div>

      {/* compacto: logo + datos en UNA fila (antes: logo arriba, datos
          abajo, un segundo wave y mucho aire para tan poca información) */}
      <div className="bfx-footer-main wrap">
        <a href="#/" aria-label="Inicio" className="bfx-footer-logo">
          <LogoBadge fontSize={9.5} rot={-3} />
          <span className="bfx-hand">El especialista<br />en sabor</span>
        </a>

        <div className="bfx-footer-info">
          <div>
            <span className="lbl">Dónde</span>
            <a href="https://maps.google.com/?q=Melincu%C3%A9+4399+Villa+Devoto+CABA" target="_blank" rel="noopener">{BIZ.address}<br />{BIZ.city}</a>
          </div>
          <div>
            <span className="lbl">Horarios</span>
            {BIZ.hours.map((h, i) => (
              <React.Fragment key={h.d}>{i > 0 && <br />}{h.d}: {h.h}</React.Fragment>
            ))}
          </div>
          <div>
            <span className="lbl">Pedidos</span>
            <a href={"https://wa.me/" + BIZ.phoneE164} target="_blank" rel="noopener">WhatsApp {BIZ.phoneDisplay}</a><br />
            <a href={"https://instagram.com/" + BIZ.ig} target="_blank" rel="noopener">Instagram @{BIZ.ig}</a>
            <div style={{ marginTop: 8 }}><OpenBadge /></div>
          </div>
        </div>
      </div>

      <div className="bfx-footer-legal">
        <p>
          © {new Date().getFullYear()} Dr. Empanada · Desde 1989 · Masa casera y repulgue a mano ·{" "}
          <a href="#/privacidad">Privacidad</a> · <a href="#/admin">Panel ›</a>
        </p>
      </div>
    </footer>
  );
}

/* ============================================================
   WHATSAPP FLOATING BUTTON
   ============================================================ */
function WhatsAppFAB() {
  const [hint, setHint] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHint(true), 1400); const t2 = setTimeout(() => setHint(false), 7000); return () => { clearTimeout(t); clearTimeout(t2); }; }, []);
  return (
    <a href={waLink("¡Hola Dr. Empanada! Quería hacer un pedido 🥟")} target="_blank" rel="noopener"
      onMouseEnter={() => setHint(true)} onMouseLeave={() => setHint(false)}
      style={{ position: "fixed", right: 22, bottom: 22, zIndex: 60, display: "flex", alignItems: "center", gap: 0 }}>
      {hint && (
        <span className="mono" style={{
          position: "absolute", right: 70, whiteSpace: "nowrap", background: "var(--white)", color: "var(--ink)",
          padding: "9px 13px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, boxShadow: "var(--shadow-sm)",
        }}>Pedí por WhatsApp
          <span style={{ position: "absolute", right: -5, top: "50%", marginTop: -5, width: 10, height: 10, background: "var(--white)", transform: "rotate(45deg)" }} />
        </span>
      )}
      <span style={{
        width: 58, height: 58, borderRadius: "50%", background: "#25D366", color: "#fff",
        display: "grid", placeItems: "center", boxShadow: "0 10px 30px -6px rgba(37,211,102,.6)",
        animation: "bf-pulse 2.6s infinite",
      }}><Ic.wa /></span>
    </a>
  );
}

/* ============================================================
   PRODUCT CARD
   ============================================================ */
function ProductCard({ item, featured = false }) {
  const store = useStore();
  const stock = store.getStock()[item.id] ?? 99;
  const out = stock <= 0;
  const [bump, setBump] = useState(false);

  const quickAdd = () => {
    if (out) return;
    store.add(item.id, "single");
    setBump(true); setTimeout(() => setBump(false), 350);
    window.dispatchEvent(new CustomEvent("bf-cart-bump"));
    toast(item.name + " agregada al pedido");
  };
  const customize = () => {
    if (out) return;
    window.dispatchEvent(new CustomEvent("bf-customize", { detail: item.id }));
  };

  return (
    <div className="lift zoom" style={{
      background: "var(--ink-2)", border: "1px solid var(--line-dark)", borderRadius: 14, overflow: "hidden",
      display: "flex", flexDirection: "column",
      opacity: out ? .6 : 1,
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--orange)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line-dark)"; }}>
      <div style={featured ? { position: "relative", flex: 1, minHeight: 300 } : { position: "relative", aspectRatio: "16/11" }}>
        <Photo item={item} style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, zIndex: 2 }}>
          {item.tags.map((t) => (
            <span key={t} className="tag solid" style={{ fontSize: 10, padding: "4px 9px",
              background: t === "TIRADA" ? "var(--beer)" : t.startsWith("PROMO") ? "var(--ink)" : "var(--orange)",
              color: t.startsWith("PROMO") ? "var(--orange)" : "#1a1206" }}>
              {t === "TOP" ? "★ TOP" : t}
            </span>
          ))}
        </div>
        {out && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 2 }}><span className="mono tag" style={{ color: "#fff", borderColor: "#fff" }}>Sin stock</span></div>}
      </div>
      <div style={{ padding: "16px 16px 18px", display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
        <h3 className="display" style={{ fontSize: featured ? 26 : 21, margin: 0 }}>{item.name}</h3>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.45, margin: 0, flex: featured ? "none" : 1 }}>{item.desc}</p>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, marginTop: 4 }}>
          <div>
            <div className="mono tabular" style={{ fontSize: 20, fontWeight: 700, color: "var(--white)" }}>
              {money(item.price)}
              {item.priceDouble && <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>unidad</span>}
            </div>
            {item.priceDouble && (
              <div className="mono tabular" style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                Docena {money(item.priceDouble)}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {item.custom && (
              <button className="btn btn-ghost btn-sm" disabled={out} onClick={customize} aria-label={"Personalizar " + item.name}>
                <Ic.sliders width={15} height={15} />
              </button>
            )}
            <button className={"btn btn-orange btn-sm" + (bump ? " bf-bump" : "")} disabled={out} onClick={item.custom ? customize : quickAdd}>
              <Ic.plus width={15} height={15} /> Sumar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CUSTOMIZER — armá tu empanada / docena
   ============================================================ */
function Customizer() {
  const store = useStore();
  const [item, setItem] = useState(null);
  const [size, setSize] = useState("single");
  const [medallon, setMedallon] = useState(MEDALLONES[0]);
  const [protein, setProtein] = useState(PROTEINAS[0]);
  const [extras, setExtras] = useState([]);
  const [qty, setQty] = useState(1);

  const cbRef = useRef(null);
  useEffect(() => {
    const onOpen = (e) => {
      const d = typeof e.detail === "string" ? { id: e.detail } : e.detail;
      const it = findItem(d.id);
      if (!it) return;
      cbRef.current = d.cb || null; // modo POS: entrega la línea a un callback en vez del carrito
      setItem(it); setSize("single"); setMedallon(MEDALLONES[0]); setProtein(PROTEINAS[0]);
      setExtras([]); setQty(1);
    };
    window.addEventListener("bf-customize", onOpen);
    return () => window.removeEventListener("bf-customize", onOpen);
  }, []);
  useEffect(() => {
    document.body.style.overflow = item ? "hidden" : "";
    const onKey = (e) => { if (e.key === "Escape") setItem(null); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [item]);

  if (!item) return null;

  const isBurger = item.cat === "empanadas";
  const base = size === "double" ? (item.priceDouble || item.price) : item.price;
  const mods = {
    medallon: isBurger ? medallon : null,
    protein: item.protein ? protein : null,
    extras,
  };
  const total = (base + modsTotal(mods)) * qty;

  const confirm = () => {
    if (cbRef.current) {
      cbRef.current({ id: item.id, variant: size, qty, mods });
      setItem(null);
      return;
    }
    store.add(item.id, size, qty, mods);
    window.dispatchEvent(new CustomEvent("bf-cart-bump"));
    toast(item.name + " agregada al pedido");
    setItem(null);
    window.dispatchEvent(new Event("bf-open-cart"));
  };

  const Sec = ({ label, children }) => (
    <div style={{ marginBottom: 22 }}>
      <div className="bfx-seclabel">{label}</div>
      {children}
    </div>
  );

  return (
    <div className="bfx-modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setItem(null); }}>
      <div className="bfx-modal" role="dialog" aria-modal="true" aria-label={"Personalizar " + item.name}>
        {/* header foto */}
        <div className="bfx-modal-head">
          <img src={itemImg(item)} alt={item.name} />
          <div className="veil" />
          <button className="bfx-modal-close" onClick={() => setItem(null)} aria-label="Cerrar"><Ic.x /></button>
          <div className="ttl">
            <h2>{item.name}</h2>
            {item.desc && <p>{item.desc}</p>}
          </div>
        </div>

        {/* data-lenis-prevent: sin esto Lenis se come la rueda y el modal no scrollea */}
        <div className="bfx-modal-body" data-lenis-prevent>
          {/* El cliente suma de a una: sin selector unidad/docena.
              El variant "double" sigue existiendo en el store para el POS. */}
          {isBurger && (
            <Sec label="Cocción · mismo precio">
              <div style={{ display: "grid", gap: 8 }}>
                {MEDALLONES.map((m) => (
                  <button key={m} className={"bfx-opt" + (medallon === m ? " on" : "")} onClick={() => setMedallon(m)}>
                    <span className="bfx-tick"><span className="dot" /></span>
                    <span className="nm">{m}{m !== MEDALLONES[0] && <Ic.fire width={15} height={15} style={{ color: "var(--bfx-mustard)", marginLeft: 8, verticalAlign: "-2px" }} />}</span>
                  </button>
                ))}
              </div>
            </Sec>
          )}

          {item.protein && (
            <Sec label="Elegí la proteína">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {PROTEINAS.map((m) => (
                  <button key={m} className={"bfx-opt" + (protein === m ? " on" : "")} onClick={() => setProtein(m)}>
                    <span className="bfx-tick"><span className="dot" /></span>
                    <span className="nm">{m}</span>
                  </button>
                ))}
              </div>
            </Sec>
          )}
        </div>

        {/* footer */}
        <div className="bfx-modal-foot">
          <div className="bfx-qtybox">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Menos"><Ic.minus width={15} height={15} /></button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} aria-label="Más"><Ic.plus width={15} height={15} /></button>
          </div>
          <button className="bfx-blob" style={{ flex: 1, fontSize: 20 }} onClick={confirm}>
            Agregar · {money(total)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TOAST
   ============================================================ */
function Toaster() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    let t;
    const on = (e) => { setMsg(e.detail); clearTimeout(t); t = setTimeout(() => setMsg(null), 2200); };
    window.addEventListener("bf-toast", on);
    return () => { window.removeEventListener("bf-toast", on); clearTimeout(t); };
  }, []);
  if (!msg) return null;
  return (
    <div className="toast" role="status">
      <span style={{ color: "var(--ok)", display: "grid" }}><Ic.check width={17} height={17} /></span> {msg}
    </div>
  );
}

/* ============================================================
   CTA compartido (estilo "feel the Change") — menú / nosotros / contacto
   ============================================================ */
function AntojoCTA({ go }) {
  const ref = useRef(null);
  useEffect(() => (window.FX ? FX.bind(ref.current) : undefined), []);
  return (
    <section ref={ref} style={{ padding: "clamp(70px,9vw,130px) 0 clamp(50px,6vw,90px)", textAlign: "center", overflow: "clip", position: "relative" }} aria-label="Pedí ahora">
      <div className="wrap" style={{ position: "relative" }}>
        <span className="bfx-badge bfx-badge--red" data-pop data-idle style={{ "--rot": "-7deg" }}>¿SE TE ANTOJÓ?</span>
        <h2 className="bfx-giant bfx-giant--lg" style={{ marginTop: 18 }}>
          <span data-split="chars" style={{ display: "block" }}>SENTÍ</span>
          <span data-split="chars" style={{ display: "block" }}><span className="ylw">EL SABOR.</span></span>
        </h2>
        <p className="bfx-copy" data-split="lines" style={{ maxWidth: 520, margin: "22px auto 32px" }}>
          Carne cuchillo para valientes, humita para golosos. Pedí online y te avisamos cuando sale del horno.
        </p>
        <a href="#/menu" className="bfx-blob" data-squash>Pedir online →</a>
      </div>
    </section>
  );
}

Object.assign(window, { Header, Footer, WhatsAppFAB, ProductCard, Stars, Photo, waLink, Reveal, Customizer, Toaster, OpenBadge, toast, AntojoCTA });

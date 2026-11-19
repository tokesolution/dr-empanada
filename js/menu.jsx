/* ============================================================
   menu.jsx — Menú completo estilo cartoon (nivel crav):
   hero gigante, buscador pill, pills sticky, cards blancas
   sticker, birras con medidores, listas claras. Mantiene toda
   la funcionalidad de pedido (carrito, customizer, stock).
   ============================================================ */
function MenuPage({ go }) {
  const store = useStore();
  const [active, setActive] = React.useState(MENU[0].id);
  const [query, setQuery] = React.useState("");
  const heroRef = React.useRef(null);
  React.useEffect(() => (window.FX ? FX.bind(heroRef.current) : undefined), []);

  /* Pedido rápido: las categorías son PESTAÑAS (se ve una sola por vez) en
     vez de una página larguísima con todo apilado. El buscador busca en toda
     la carta y muestra los resultados agrupados. */
  const q = query.trim().toLowerCase();
  const matches = (i) => !q || (i.name + " " + (i.desc || "") + " " + (i.brewery || "")).toLowerCase().includes(q);
  const results = MENU.map((c) => ({ ...c, items: c.items.filter(matches) })).filter((c) => c.items.length);
  const shown = q ? results : MENU.filter((c) => c.id === active);

  return (
    <main className="bfx">
      {/* cabecera compacta: título a la izquierda, buscador a la derecha */}
      <section ref={heroRef} className="bfx-menu-top" aria-label="La carta">
        <div className="bfx-menu-wrap bfx-menu-head">
          <div>
            <div className="bfx-kicker" data-pop>★ LA CARTA ★</div>
            <h1 className="bfx-giant bfx-giant--md" style={{ marginTop: 8 }}>
              <span data-split="chars">ELEGÍ, SUMÁ </span><span data-split="chars" className="ylw">Y LISTO.</span>
            </h1>
          </div>
          <div className="bfx-menu-search">
            <div style={{ position: "relative", width: "100%" }}>
              <input className="bfx-searchbox" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscá… (humita, cuchillo, membrillo)" aria-label="Buscar en el menú" />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Limpiar búsqueda"
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--bfx-red)", display: "grid", cursor: "pointer" }}>
                  <Ic.x width={19} height={19} />
                </button>
              )}
            </div>
            <p className="bfx-hand bfx-menu-sub">
              Al horno o fritas, al mismo precio · Delivery propio o take away
              {isHappyNow() && <span className="bfx-badge bfx-badge--green" style={{ "--rot": "-4deg", fontSize: 13, marginLeft: 10 }}>PROMO MEDIODÍA ACTIVA</span>}
            </p>
          </div>
        </div>
      </section>

      {/* pestañas sticky */}
      <div className="bfx-catbar">
        <div className="bfx-menu-wrap" style={{ display: "flex", gap: 8, padding: "10px 24px", overflowX: "auto" }}>
          {MENU.map((c) => (
            <button key={c.id} onClick={() => { setActive(c.id); setQuery(""); }}
              className={"bfx-catpill" + (!q && active === c.id ? " on" : "")} aria-pressed={!q && active === c.id}>
              {c.name} <span className="n">{c.items.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bfx-menu-wrap" style={{ padding: "18px 24px 60px" }}>
        {shown.length === 0 && (
          <div style={{ padding: "50px 0", textAlign: "center" }}>
            <Sticker name="aceituna" size={80} style={{ position: "relative", margin: "0 auto 14px" }} />
            <p className="bfx-bubble" style={{ fontSize: 30, margin: "0 0 8px", color: "var(--bfx-brand)", "--bfx-counter": "var(--bfx-cream)" }}>Nada con “{query}”</p>
            <p className="bfx-copy" style={{ margin: "0 0 18px" }}>Probá con otra palabra, o mirá la carta completa.</p>
            <button className="bfx-blob" style={{ fontSize: 18 }} onClick={() => setQuery("")}>Ver todo el menú</button>
          </div>
        )}

        {shown.map((cat) => (
          <section key={cat.id} className="bfx-menu-cat" aria-label={cat.name}>
            <div className="bfx-menu-cathead">
              {q && <h2 className="bfx-giant" style={{ fontSize: "clamp(26px,2.6vw,36px)" }}>{cat.name}</h2>}
              <span className="bfx-hand kick">{cat.kicker}</span>
              {cat.note && <span className="bfx-hand note"><Ic.leaf style={{ color: "var(--bfx-green)", flexShrink: 0 }} /> {cat.note}</span>}
            </div>

            {cat.layout === "cards" && (
              <div className="bfx-menu-grid">
                {cat.items.map((item, i) => <MenuCard key={item.id} item={item} />)}
              </div>
            )}
            {cat.layout === "taps" && <BeerGrid items={cat.items} />}
            {cat.layout === "list" && <LightList items={cat.items} />}

            {cat.id === "promos" && !q && <HappyBanner go={go} />}
          </section>
        ))}
      </div>

      <MobileCartBar go={go} />
    </main>
  );
}

/* ---------- Card de producto (clara, estilo sticker) ---------- */
function MenuCard({ item }) {
  const store = useStore();
  const stock = store.getStock()[item.id] ?? 99;
  const out = stock <= 0;
  const quickAdd = () => {
    if (out) return;
    store.add(item.id, "single");
    window.dispatchEvent(new CustomEvent("bf-cart-bump"));
    toast(item.name + " agregada al pedido");
  };
  const customize = () => { if (!out) window.dispatchEvent(new CustomEvent("bf-customize", { detail: item.id })); };
  const TAG_CLS = { TOP: "bfx-minitag", TIRADA: "bfx-minitag--ylw", "PROMO VIERNES": "bfx-minitag--green" };
  return (
    <div className="bfx-menucard" style={{ opacity: out ? .55 : 1 }}>
      <div className="photo">
        <img src={(item.img) || "assets/horno-tabla.jpg"} alt={item.name} loading="lazy" />
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          {item.tags.map((t) => (
            <span key={t} className={"bfx-minitag " + (TAG_CLS[t] || "")}>{t === "TOP" ? "★ TOP" : t}</span>
          ))}
        </div>
        {out && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(43,20,3,.55)", display: "grid", placeItems: "center" }}>
            <span className="bfx-minitag" style={{ transform: "rotate(-4deg)", fontSize: 16 }}>SIN STOCK</span>
          </div>
        )}
      </div>
      {/* compacta: nombre, descripción en 2 líneas y abajo precio + sumar */}
      <div className="name">{item.name}</div>
      <div className="desc" title={item.desc}>{item.desc}</div>
      <div className="foot">
        <span className="price">{money(item.price)}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {item.custom && (
            <button className="bfx-addbtn ghost" disabled={out} onClick={customize} aria-label={"Personalizar " + item.name}>
              <Ic.sliders width={15} height={15} />
            </button>
          )}
          <button className="bfx-addbtn" disabled={out} onClick={item.custom ? customize : quickAdd} aria-label={"Sumar " + item.name}>
            <Ic.plus width={17} height={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Birras (grid claro con medidores) ---------- */
function BeerGrid({ items }) {
  const store = useStore();
  const happy = isHappyNow();
  const add = (b) => {
    store.add(b.id, "single");
    window.dispatchEvent(new CustomEvent("bf-cart-bump"));
    toast(b.name + " agregada al pedido");
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 20, marginTop: 18 }}>
      {items.map((b, i) => (
        <Reveal key={b.id} delay={(i % 4) * 60} style={{ display: "grid" }}>
          <div className="bfx-beercard" style={{ "--rot": "0deg", boxShadow: "0 18px 40px -18px rgba(43,20,3,.28)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 20, height: 30, borderRadius: "3px 3px 6px 6px", background: b.color, border: "2px solid #efdcbc", flexShrink: 0 }} />
              <div>
                <div className="name">{b.name}</div>
                <div className="brew">{b.brewery}</div>
              </div>
            </div>
            <p className="bfx-hand" style={{ margin: 0, fontSize: 16, lineHeight: 1.3, opacity: .75, letterSpacing: ".02em" }}>{b.desc}</p>
            <div className="row"><span>Amargor</span><span>{b.ibu} IBU · {b.abv}%</span></div>
            <div className="bfx-meter"><span style={{ width: Math.min(100, (b.ibu / 70) * 100) + "%" }} /></div>
            <div className="row">
              <span className="price">{money(b.price)}</span>
              <span className="hh" style={{ color: happy ? "var(--bfx-green)" : "rgba(43,20,3,.45)" }}>HH: 2 × {money(b.hh)}</span>
            </div>
            <button className="bfx-blob" style={{ fontSize: 15, padding: ".7em 1.4em .55em", alignSelf: "flex-start" }} onClick={() => add(b)}>+ Sumar</button>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ---------- Lista clara (tragos / bebidas sin alcohol) ---------- */
function LightList({ items }) {
  const store = useStore();
  const happy = isHappyNow();
  const add = (it) => {
    store.add(it.id, "single");
    window.dispatchEvent(new CustomEvent("bf-cart-bump"));
    toast(it.name + " agregado al pedido");
  };
  return (
    <div style={{ maxWidth: 740, marginTop: 8 }}>
      {items.map((it, i) => (
        <Reveal key={it.id} delay={i * 40}>
          <div className="bfx-lrow">
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 21 }}>{it.name}</div>
              {it.desc && <div style={{ fontSize: 16, opacity: .6 }}>{it.desc}</div>}
              {it.hh && (
                /* la lista vive sobre el fondo oscuro: la tinta apagada va clara */
                <div style={{ fontSize: 15, color: happy ? "var(--bfx-green)" : "rgba(246,232,210,.55)" }}>
                  Promo mediodía · 2 × {money(it.hh)}
                </div>
              )}
            </div>
            <span className="dots" />
            <span style={{ fontSize: 21 }}>{money(it.price)}</span>
            <button className="bfx-addbtn" style={{ width: 38, height: 38 }} aria-label={"Sumar " + it.name} onClick={() => add(it)}>
              <Ic.plus width={16} height={16} />
            </button>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ---------- Happy hour banner ---------- */
function HappyBanner({ go }) {
  const active = isHappyNow();
  return (
    <Reveal>
      <div className="bfx-panel" style={{ marginTop: 28, background: "var(--bfx-mustard)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h3 className="bfx-bubble" style={{ fontSize: 28, margin: 0, color: "var(--bfx-deep)", "--bfx-counter": "var(--bfx-mustard)" }}>Promo mediodía</h3>
            <span className="bfx-minitag" style={{ transform: "rotate(-3deg)", background: active ? "var(--bfx-green)" : "var(--bfx-red)" }}>
              {active ? "ACTIVA AHORA" : HAPPY.when.toUpperCase()}
            </span>
          </div>
          <p className="bfx-hand" style={{ color: "#4a2c00", fontSize: 18, margin: "8px 0 0", maxWidth: 480, letterSpacing: ".02em" }}>
            Docenas y medias docenas a precio especial · {HAPPY.where}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {HAPPY.deals.slice(0, 3).map((d) => (
            <span key={d.name} className="bfx-chip2" style={{ background: "#fff", borderColor: "transparent" }}>{d.name} <b>{money(d.price)}</b></span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ---------- barra inferior mobile con total ---------- */
function MobileCartBar({ go }) {
  const store = useStore();
  const count = store.cartCount();
  if (count === 0) return null;
  return (
    <div className="bf-mobcart" style={{
      position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 55,
      background: "var(--bfx-red)", color: "#fff", borderRadius: 100, padding: "13px 20px",
      border: "3px solid #fff", boxShadow: "0 16px 40px -12px rgba(43,20,3,.5)",
      display: "none", alignItems: "center", justifyContent: "space-between",
      fontFamily: "var(--bfx-mouse)", fontSize: 18, letterSpacing: ".04em",
      cursor: "pointer",
    }} onClick={() => window.dispatchEvent(new Event("bf-open-cart"))}>
      <span>{count} {count === 1 ? "ítem" : "ítems"} · {money(store.cartTotal())}</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Ver pedido <Ic.arrow /></span>
    </div>
  );
}

window.MenuPage = MenuPage;

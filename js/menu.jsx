/* ============================================================
   menu.jsx — La carta, pensada para pedir rápido:
   cabecera compacta, buscador, categorías como pestañas y una
   grilla pareja y a todo el ancho con tarjetas a foto completa
   (nombre y precio sobre la imagen) y selector horno/frita. Mantiene carrito, customizer y stock.
   ============================================================ */
function MenuPage({ go }) {
  const store = useStore();
  const [active, setActive] = React.useState(MENU[0].id);
  const [query, setQuery] = React.useState("");
  const heroRef = React.useRef(null);
  React.useEffect(() => (window.FX ? FX.bind(heroRef.current) : undefined), []);

  /* Las categorías son PESTAÑAS (se ve una sola por vez). El buscador busca
     en toda la carta y muestra los resultados agrupados. */
  const q = query.trim().toLowerCase();
  const matches = (i) => !q || (i.name + " " + (i.desc || "") + " " + (i.brewery || "")).toLowerCase().includes(q);
  const results = MENU.map((c) => ({ ...c, items: c.items.filter(matches) })).filter((c) => c.items.length);
  const shown = q ? results : MENU.filter((c) => c.id === active);
  const promo = (MENU.find((c) => c.id === "promos") || { items: [] }).items.find((i) => i.id === "docena-surtida");
  const CAT_ICON = { empanadas: "emp", pastelitos: "pastelito", promos: "queso", drinks: "aji" };

  return (
    <main className="bfx">
      {/* cabecera compacta */}
      <section ref={heroRef} className="bfx-menu-top" aria-label="La carta">
        <div className="bfx-menu-wrap bfx-menu-head">
          <div>
            <div className="bfx-kicker" data-pop>★ LA CARTA ★</div>
            <h1 className="bfx-giant" style={{ marginTop: 8 }}>
              <span data-split="chars">ELEGÍ, SUMÁ </span><span data-split="chars" className="ylw">Y LISTO.</span>
            </h1>
          </div>
          <div className="bfx-menu-search">
            <div className="bfx-searchwrap">
              <svg className="ico" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
              <input className="bfx-searchbox" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscá… (humita, cuchillo, membrillo)" aria-label="Buscar en el menú" />
              {query && (
                <button className="clr" onClick={() => setQuery("")} aria-label="Limpiar búsqueda"><Ic.x width={18} height={18} /></button>
              )}
            </div>
            <p className="bfx-hand bfx-menu-sub">
              Al horno o fritas, al mismo precio · Delivery propio o take away
              {isHappyNow() && <span className="bfx-badge bfx-badge--green" style={{ "--rot": "-4deg", fontSize: 13, marginLeft: 10 }}>PROMO MEDIODÍA ACTIVA</span>}
            </p>
          </div>
        </div>
      </section>

      {/* pestañas sticky: control segmentado con un sticker por categoría */}
      <div className="bfx-catbar">
        <div className="bfx-menu-wrap" style={{ padding: "10px 24px" }}>
          <div className="bfx-segmented" role="tablist" aria-label="Categorías">
            {MENU.map((c) => {
              const on = !q && active === c.id;
              return (
                <button key={c.id} role="tab" aria-selected={on} onClick={() => { setActive(c.id); setQuery(""); }}
                  className={"bfx-seg" + (on ? " on" : "")}>
                  <span className="ic" aria-hidden="true" dangerouslySetInnerHTML={{ __html: (window.FX && FX.STICKERS[CAT_ICON[c.id]]) || "" }} />
                  {c.name} <span className="n">{c.items.length}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bfx-menu-wrap" style={{ padding: "16px 24px 60px" }}>
        {shown.length === 0 && (
          <div style={{ padding: "50px 0", textAlign: "center" }}>
            <Sticker name="aceituna" size={80} style={{ position: "relative", margin: "0 auto 14px" }} />
            <p className="bfx-bubble" style={{ fontSize: 30, margin: "0 0 8px", color: "var(--bfx-brand)", "--bfx-counter": "var(--bfx-cream)" }}>Nada con “{query}”</p>
            <p className="bfx-copy" style={{ margin: "0 0 18px" }}>Probá con otra palabra, o mirá la carta completa.</p>
            <button className="bfx-blob" style={{ fontSize: 18 }} onClick={() => setQuery("")}>Ver todo el menú</button>
          </div>
        )}

        {shown.map((cat) => {
          // en empanadas (sin búsqueda): selector horno/frita + tile de promo al final
          const isEmp = !q && cat.id === "empanadas";
          return (
            <section key={cat.id + (q ? "-q" : "")} className="bfx-menu-cat bfx-fadein" aria-label={cat.name}>
              <div className="bfx-menu-cathead">
                {q && <h2 className="bfx-giant" style={{ fontSize: "clamp(26px,2.6vw,36px)" }}>{cat.name}</h2>}
                <span className="bfx-hand kick">{cat.kicker}</span>
                {cat.note && <span className="bfx-hand note"><Ic.leaf style={{ color: "var(--bfx-green)", flexShrink: 0 }} /> {cat.note}</span>}
                {(cat.id === "empanadas" || q) && (
                  <div className="bfx-coccion" role="radiogroup" aria-label="Ver fotos al horno o fritas">
                    <span className="lbl">Mirá cómo salen:</span>
                    {[["horno", "Al horno"], ["frita", "Fritas"]].map(([v, l]) => (
                      <button key={v} type="button" role="radio" aria-checked={getCoccion() === v}
                        className={"opt" + (getCoccion() === v ? " on" : "")} onClick={() => setCoccion(v)}>
                        {v === "frita" && <Ic.fire width={14} height={14} />} {l}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {cat.layout === "cards" && (
                <div className="bfx-pgrid">
                  {cat.items.map((item, i) => <ProductTile key={item.id} item={item} top={isEmp && i === 0} index={i} />)}
                  {isEmp && promo && (
                    <button type="button" className="bfx-promotile" onClick={() => setActive("promos")}>
                      <Sticker name="emp" size={84} style={{ position: "absolute", right: 14, top: 12, "--rot": "10deg" }} />
                      <span className="k">Para la juntada</span>
                      <span className="t">{promo.name}</span>
                      <span className="p">{money(promo.price)}</span>
                      <span className="go">Ver promos →</span>
                    </button>
                  )}
                </div>
              )}
              {cat.layout === "taps" && <BeerGrid items={cat.items} />}
              {cat.layout === "list" && <LightList items={cat.items} />}

              {cat.id === "promos" && !q && <HappyBanner go={go} />}
            </section>
          );
        })}
      </div>

      <MobileCartBar go={go} />
    </main>
  );
}

/* ---------- Tarjeta de producto: foto completa + info encima ----------
   La foto ocupa toda la tarjeta y un degradé oscuro abajo deja leer el
   nombre y el precio sobre la imagen (como las apps de delivery). */
function ProductTile({ item, top = false, index = 0 }) {
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
  const TAG_TXT = { TOP: "★ Top" };
  return (
    <article className={"bfx-ptile" + (out ? " is-out" : "")} style={{ "--i": index }}>
      {/* key = src: al cambiar horno/frita la foto se monta de nuevo y entra con fundido */}
      <img key={itemImg(item)} src={itemImg(item)} alt={item.name} loading={index < 10 ? "eager" : "lazy"} />
      <div className="shade" aria-hidden="true" />
      <div className="tags">
        {top && <span className="tag tag--hot">La más pedida</span>}
        {item.tags.filter((t) => !(top && t === "TOP")).map((t) => <span key={t} className="tag">{TAG_TXT[t] || t}</span>)}
      </div>
      {out && <div className="soldout"><span>Sin stock</span></div>}
      <div className="info">
        <h3 className="nm">{item.name}</h3>
        <p className="ds">{item.desc}</p>
        <div className="row">
          <span className="pr">{money(item.price)}</span>
          <div className="acts">
            {item.custom && (
              <button className="ibtn ghost" disabled={out} onClick={customize} aria-label={"Personalizar " + item.name}>
                <Ic.sliders width={15} height={15} />
              </button>
            )}
            <button className="ibtn" disabled={out} onClick={item.custom ? customize : quickAdd} aria-label={"Sumar " + item.name}>
              <Ic.plus width={18} height={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
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
  // bebidas (sin foto): tiles de vidrio en grilla, mismo lenguaje que las tarjetas
  return (
    <div className="bfx-drinkgrid">
      {items.map((it, i) => (
        <div key={it.id} className="bfx-drink" style={{ "--i": i }}>
          <div style={{ minWidth: 0 }}>
            <div className="nm">{it.name}</div>
            {it.desc && <div className="ds">{it.desc}</div>}
            {it.hh && <div className="hh" style={{ color: happy ? "var(--bfx-green)" : undefined }}>Promo mediodía · 2 × {money(it.hh)}</div>}
          </div>
          <span className="pr">{money(it.price)}</span>
          <button className="ibtn" aria-label={"Sumar " + it.name} onClick={() => add(it)}><Ic.plus width={17} height={17} /></button>
        </div>
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

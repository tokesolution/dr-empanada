/* ============================================================
   cart-drawer.jsx — panel del carrito, estética cartoon (crema)
   ============================================================ */
function CartDrawer({ go }) {
  const store = useStore();
  const [open, setOpen] = React.useState(false);
  const lines = store.cartLines();
  const total = store.cartTotal();

  React.useEffect(() => {
    const o = () => setOpen(true);
    window.addEventListener("bf-open-cart", o);
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    return () => { window.removeEventListener("bf-open-cart", o); window.removeEventListener("hashchange", close); };
  }, []);
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const lineKey = (l) => l.id + "|" + l.variant + "|" + (l.modsLabel || "");
  const goCheckout = () => { setOpen(false); go("#/checkout"); };
  const thumb = (it) => it && (menuImg(it)
    || (it.cat === "drinks" ? "assets/promo-docena.jpg" : "assets/horno-tabla.jpg"));

  return (
    <>
      <div onClick={() => setOpen(false)} style={{
        position: "fixed", inset: 0, zIndex: 70, background: "rgba(43,20,3,.5)", backdropFilter: "blur(2px)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .25s",
      }} />
      <aside className="bfx-cart" style={{ transform: open ? "translateX(0)" : "translateX(103%)" }}>
        <div className="bfx-cart-head">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Ic.bag width={22} height={22} />
            <h2>Tu pedido</h2>
            {lines.length > 0 && <span className="count">{store.cartCount()} {store.cartCount() === 1 ? "ítem" : "ítems"}</span>}
          </div>
          <button className="bfx-cart-close" onClick={() => setOpen(false)} aria-label="Cerrar carrito"><Ic.x /></button>
        </div>

        {lines.length === 0 ? (
          <div className="bfx-cart-empty">
            <div>
              <Sticker name="burger" size={92} style={{ position: "relative", margin: "0 auto 14px" }} />
              <p className="bfx-bubble" style={{ fontSize: 30, margin: "0 0 8px" }}>Carrito vacío</p>
              <p className="bfx-copy" style={{ fontSize: 18, margin: "0 0 22px", opacity: .75 }}>Sumá unas empanadas y unos pastelitos.</p>
              <button className="bfx-blob" style={{ fontSize: 20 }} onClick={() => { setOpen(false); go("#/menu"); }}>Ver el menú</button>
            </div>
          </div>
        ) : (
          <>
            <div className="bfx-cart-body" data-lenis-prevent>
              {lines.map((l) => (
                <div key={lineKey(l)} className="bfx-cartline">
                  <div className="thumb">
                    <img src={thumb(l.item)} alt={l.item.name} loading="lazy" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <div className="nm">{l.item.name}{l.variant === "double" ? " · Docena" : ""}</div>
                        {l.modsLabel && <div className="sub">{l.modsLabel}</div>}
                      </div>
                      <button className="rm" onClick={() => store.removeLine(l.id, l.variant, l.mods)} aria-label={"Quitar " + l.item.name}><Ic.x width={17} height={17} /></button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <div className="bfx-qty">
                        <button onClick={() => store.setQty(l.id, l.variant, l.qty - 1, l.mods)} aria-label="Menos"><Ic.minus width={14} height={14} /></button>
                        <span>{l.qty}</span>
                        <button onClick={() => store.setQty(l.id, l.variant, l.qty + 1, l.mods)} aria-label="Más"><Ic.plus width={14} height={14} /></button>
                      </div>
                      <div className="lt">{money(l.lineTotal)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bfx-cart-foot">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                <span className="bfx-hand" style={{ fontSize: 17, letterSpacing: ".14em", textTransform: "uppercase", opacity: .6 }}>Subtotal</span>
                <span className="bfx-bubble" style={{ fontSize: 32 }}>{money(total)}</span>
              </div>
              <button className="bfx-blob" style={{ width: "100%", fontSize: 21 }} onClick={goCheckout}>
                Finalizar pedido →
              </button>
              <p className="bfx-hand" style={{ textAlign: "center", fontSize: 15, opacity: .5, margin: "12px 0 0", letterSpacing: ".04em" }}>El envío se calcula en el checkout</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

window.CartDrawer = CartDrawer;

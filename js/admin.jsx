/* ============================================================
   admin.jsx — Login + shell con roles + tablero de pedidos (KDS)
   Roles: dueño (todo) · cajero (salón, pedidos, caja, stock)
   ============================================================ */
function Admin({ go }) {
  const store = useStore();
  const auth = store.getAuth();
  React.useEffect(() => { store.seedDemo(); }, []);
  if (!auth) return <AdminLogin go={go} />;
  return <AdminShell go={go} auth={auth} />;
}

/* ---------------- LOGIN ---------------- */
function AdminLogin({ go }) {
  const store = useStore();
  const [user, setUser] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [err, setErr] = React.useState(false);
  const submit = (e) => { e.preventDefault(); if (store.login(user, pass)) setErr(false); else setErr(true); };
  return (
    <div className="adm-login">
      <div style={{ width: "min(410px,100%)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <a href="#/" style={{ display: "inline-flex" }}><LogoBadge fontSize={11} /></a>
          <div className="display" style={{ fontSize: 30, marginTop: 14, color: "var(--white)" }}>Panel de gestión</div>
          <div className="mono" style={{ fontSize: 11.5, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--orange)", marginTop: 6 }}>Caja · cocina · salón</div>
        </div>

        <form onSubmit={submit} className="adm-login-card">
          <Field label="Usuario">
            <input style={inp} value={user} onChange={(e) => setUser(e.target.value)} placeholder="Tu usuario" autoFocus autoCapitalize="none" />
          </Field>
          <div style={{ marginTop: 14 }}>
            <Field label="Contraseña"><input type="password" style={inp} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••" /></Field>
          </div>
          {err && (
            <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 14, display: "flex", alignItems: "center", gap: 7, background: "rgba(216,83,60,.1)", border: "1px solid rgba(216,83,60,.35)", padding: "10px 12px", borderRadius: 10 }}>
              <Ic.lock width={15} height={15} /> Usuario o contraseña incorrectos
            </div>
          )}
          <button className="btn btn-orange btn-block btn-lg" style={{ marginTop: 20 }}><Ic.lock width={16} height={16} /> Entrar</button>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--muted-d)", textAlign: "center", marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line-dark)", lineHeight: 1.7 }}>
            Demo · <b style={{ color: "var(--orange)" }}>dueño</b> o <b style={{ color: "var(--orange)" }}>cajero</b> · clave <b style={{ color: "var(--orange)" }}>1234</b>
          </div>
        </form>

        <button onClick={() => go("#/")} className="mono" style={{ background: "none", border: "none", color: "var(--muted)", display: "block", margin: "18px auto 0", fontSize: 12.5, cursor: "pointer" }}>‹ Volver al sitio</button>
      </div>
    </div>
  );
}

/* ícono de foto para la pestaña "Fotos del menú" */
const IcPhoto = (p) => (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></svg>);

/* ---------------- SHELL ---------------- */
function AdminShell({ go, auth }) {
  const store = useStore();
  const isOwner = auth.role !== "cajero";
  const [tab, setTab] = React.useState(isOwner ? "ordenes" : "salon");
  const [detail, setDetail] = React.useState(null);
  const [payOrder, setPayOrder] = React.useState(null);
  const [sound, setSound] = React.useState(true);
  const [tour, setTour] = React.useState(false);

  // hint de primera visita → invita al recorrido de ayuda
  React.useEffect(() => {
    try {
      if (!localStorage.getItem("bf_tour_hint_v1")) {
        localStorage.setItem("bf_tour_hint_v1", "1");
        setTimeout(() => toast("¿Primera vez en el panel? Tocá Ayuda para un recorrido guiado"), 900);
      }
    } catch (e) {}
  }, []);
  const orders = store.getOrders();
  const prevCount = React.useRef(orders.length);
  const [flash, setFlash] = React.useState(false);

  // detectar orden nueva → sonido + flash
  React.useEffect(() => {
    if (orders.length > prevCount.current) {
      if (sound) beep();
      setFlash(true); setTimeout(() => setFlash(false), 1800);
    }
    prevCount.current = orders.length;
  }, [orders.length]);

  const activeOrders = orders.filter((o) => !["entregado", "cancelado"].includes(o.status));
  const occupied = Array.from({ length: store.tableCount() }, (_, i) => i + 1).filter((n) => store.tableOrder(n)).length;
  const pendingPay = orders.filter((o) => !o.paid && o.status !== "cancelado").length;

  /* La navegación va agrupada: arriba lo del día a día (lo que se toca cada
     dos minutos con el local abierto) y abajo lo de gestión, que se mira de
     vez en cuando. Antes eran seis botones sueltos sin jerarquía. */
  const navGroups = [
    ["Operación", [
      ["salon", "Salón", Ic.user, occupied || null],
      ["ordenes", "Pedidos", Ic.list, activeOrders.length || null],
      ["caja", "Caja", Ic.copy, pendingPay || null],
    ]],
    ...(isOwner
      ? [["Gestión", [
          ["stock", "Stock", Ic.box, null],
          ["fotos", "Fotos del menú", IcPhoto, null],
          ["reportes", "Reportes", Ic.chart, null],
          ["ajustes", "Ajustes", Ic.sliders, null],
        ]]]
      : [["Gestión", [["stock", "Stock", Ic.box, null]]]]),
  ];

  const isPos = tab === "salon"; // el POS maneja su propio layout full-height

  return (
    <div className="adm-shell bf-admin">
      {/* sidebar */}
      <aside className="adm-side bf-admin-side">
        <div className="adm-side-head">
          <a href="#/" style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <LogoBadge fontSize={4.2} />
            <span className="display" style={{ fontSize: 19, color: "var(--white)", lineHeight: 1 }}>
              <span style={{ color: "var(--orange)" }}>DR.</span> EMPANADA
            </span>
          </a>
        </div>

        <nav style={{ padding: "6px 12px 12px", flex: 1, alignContent: "start", overflowY: "auto" }}>
          {navGroups.map(([group, items]) => (
            <React.Fragment key={group}>
              <div className="adm-navgroup">{group}</div>
              <div style={{ display: "grid", gap: 3 }}>
                {items.map(([id, label, Icon, badge]) => (
                  <button key={id} onClick={() => setTab(id)} data-tour={"nav-" + id}
                    className={"adm-nav" + (tab === id ? " on" : "")}
                    aria-current={tab === id ? "page" : undefined}>
                    <Icon width={17} height={17} /> {label}
                    {badge != null && <span className="badge tabular">{badge}</span>}
                  </button>
                ))}
              </div>
            </React.Fragment>
          ))}
        </nav>

        <div className="adm-side-foot">
          <div style={{ display: "grid", gap: 7, marginBottom: 12 }}>
            <button onClick={() => setTour(true)} className="adm-sidebtn adm-help">
              <Ic.help width={15} height={15} /> Ayuda · recorrido
            </button>
            <button onClick={() => setSound((s) => !s)} data-tour="sound" className={"adm-sidebtn" + (sound ? " on" : "")}>
              <Ic.bell width={15} height={15} /> Sonido {sound ? "ON" : "OFF"}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--ink-3)", borderRadius: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--orange)", display: "grid", placeItems: "center", color: "#1a1206", flexShrink: 0 }}><Ic.user width={17} height={17} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--white)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{auth.name}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em" }}>{auth.role}</div>
            </div>
            <button onClick={() => store.logout()} title="Cerrar sesión" aria-label="Cerrar sesión" style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", display: "grid" }}><Ic.logout width={17} height={17} /></button>
          </div>
        </div>
      </aside>

      {/* main */}
      <main style={{ minWidth: 0, position: "relative", ...(isPos ? { overflow: "hidden" } : {}) }}>
        {flash && (
          <div className="mono" style={{ position: "fixed", top: 18, right: 18, zIndex: 90, background: "var(--orange)", color: "#1a1206", padding: "12px 18px", borderRadius: 10, fontWeight: 700, boxShadow: "var(--shadow)", display: "flex", alignItems: "center", gap: 8, animation: "fadeup .3s" }}>
            <Ic.bell width={16} height={16} /> ¡Nuevo pedido entrante!
          </div>
        )}
        {tab === "salon" && <Salon auth={auth} onPay={setPayOrder} />}
        {tab === "ordenes" && <OrdersBoard onDetail={setDetail} onPay={setPayOrder} />}
        {tab === "caja" && <Caja onPay={setPayOrder} />}
        {tab === "stock" && <StockManager />}
        {tab === "fotos" && isOwner && <AdminPhotos />}
        {tab === "reportes" && isOwner && <Reports />}
        {tab === "ajustes" && isOwner && <AdminSettings auth={auth} />}
      </main>

      {detail && <OrderDetail order={detail} onClose={() => setDetail(null)} onPay={(o) => { setDetail(null); setPayOrder(o); }} />}
      {payOrder && <PayModal order={payOrder} onClose={() => setPayOrder(null)} />}
      {tour && <AdminTour isOwner={isOwner} setTab={setTab} onClose={() => setTour(false)} />}
      <Customizer />
      <Toaster />
    </div>
  );
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.18].forEach((t, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = i ? 1180 : 880;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.16);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.18);
    });
  } catch (e) {}
}

/* ---------------- ORDERS BOARD (KDS) ---------------- */
const STATUS_META = {
  recibido: { label: "Recibido", color: "#e9b949", bg: "rgba(233,185,73,.12)" },
  preparacion: { label: "En preparación", color: "#f2900d", bg: "rgba(242,144,13,.12)" },
  listo: { label: "Listo", color: "#5aa9ff", bg: "rgba(90,169,255,.12)" },
  camino: { label: "En camino", color: "#9b7bff", bg: "rgba(155,123,255,.12)" },
  entregado: { label: "Entregado", color: "#3fae6b", bg: "rgba(63,174,107,.12)" },
  cancelado: { label: "Cancelado", color: "#d8533c", bg: "rgba(216,83,60,.12)" },
};
// flujo según modalidad: salón y mostrador no pasan por "en camino"
const flowFor = (order) => order.mode === "delivery"
  ? ["recibido", "preparacion", "listo", "camino", "entregado"]
  : ["recibido", "preparacion", "listo", "entregado"];

function OrdersBoard({ onDetail, onPay }) {
  const store = useStore();
  useTick();
  const orders = store.getOrders();
  const [filter, setFilter] = React.useState("activas");
  const filtered = orders.filter((o) =>
    filter === "todas" ? true
      : filter === "activas" ? !["entregado", "cancelado"].includes(o.status)
      : filter === "acobrar" ? (!o.paid && o.status !== "cancelado")
      : filter === "salon" ? o.mode === "salon" && !["entregado", "cancelado"].includes(o.status)
      : o.status === filter
  );

  // métricas del día
  const today = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const sales = today.filter((o) => o.status !== "cancelado").reduce((s, o) => s + o.total, 0);
  const avg = today.length ? Math.round(sales / Math.max(1, today.filter((o) => o.status !== "cancelado").length)) : 0;

  const filtros = [["activas", "Activas"], ["salon", "Salón"], ["acobrar", "A cobrar"], ["recibido", "Recibidos"], ["preparacion", "En prep."], ["camino", "En camino"], ["todas", "Todas"]];

  return (
    <div>
      {/* barra fija: el título y el estado acompañan mientras se scrollea la grilla */}
      <div className="adm-topbar">
        <div>
          <h1>Pedidos</h1>
          <span className="adm-live"><span className="dot" /> En vivo · web, salón y mostrador</span>
        </div>
        <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
          {filtered.length} {filtered.length === 1 ? "pedido" : "pedidos"} en esta vista
        </span>
      </div>

      <div style={{ padding: "22px 28px 60px" }}>
        <div data-tour="metrics" className="adm-metrics bf-metrics" style={{ marginBottom: 24 }}>
          <Metric label="Ventas de hoy" value={money(sales)} accent />
          <Metric label="Pedidos hoy" value={today.length} />
          <Metric label="Ticket promedio" value={avg ? money(avg) : "—"} />
          <Metric label="En curso" value={orders.filter((o) => !["entregado", "cancelado"].includes(o.status)).length} />
        </div>

        <div data-tour="filters" style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {filtros.map(([id, l]) => (
            <button key={id} onClick={() => setFilter(id)} className={"catpill" + (filter === id ? " on" : "")}>{l}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ ...card, textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
            <div style={{ opacity: .3, display: "flex", justifyContent: "center", marginBottom: 12 }}><Ic.list width={42} height={42} /></div>
            No hay pedidos en esta vista.
          </div>
        ) : (
          <div data-tour="cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16 }}>
            {filtered.map((o) => <OrderCard key={o.id} order={o} onDetail={onDetail} onPay={onPay} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, accent }) {
  return (
    <div className={"adm-metric" + (accent ? " adm-metric--accent" : "")}>
      <div className="lbl">{label}</div>
      <div className="val tabular">{value}</div>
    </div>
  );
}

function ModeChip({ order }) {
  const map = {
    delivery: [Ic.truck, "Delivery", "var(--orange)"],
    salon: [Ic.user, "Mesa " + order.table, "#5aa9ff"],
    takeaway: [Ic.bag, order.name === "Mostrador" ? "Mostrador" : "Take away", "var(--muted)"],
  };
  const [Icon, label, color] = map[order.mode] || map.takeaway;
  return (
    <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: ".04em" }}>
      <Icon width={14} height={14} /> {label}
    </span>
  );
}

function OrderCard({ order, onDetail, onPay }) {
  const store = useStore();
  const meta = STATUS_META[order.status];
  const flow = flowFor(order);
  const idx = flow.indexOf(order.status);
  const next = idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  const m = minsSince(order.createdAt);
  const active = !["entregado", "cancelado"].includes(order.status);

  return (
    <div className="adm-card">
      <div style={{ height: 4, background: meta.color }} />
      <div style={{ padding: "16px 18px", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className="display" style={{ fontSize: 20, whiteSpace: "nowrap" }}>{order.id}</span>
              <ModeChip order={order} />
            </div>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>{order.name}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: meta.color, background: meta.bg, padding: "5px 9px", borderRadius: 100, whiteSpace: "nowrap" }}>{meta.label}</span>
            {active && (
              <div className="mono tabular" style={{ fontSize: 12, fontWeight: 700, marginTop: 6, color: elapsedColor(m) }}>⏱ {m < 1 ? "recién" : m + " min"}</div>
            )}
          </div>
        </div>

        <div style={{ margin: "14px 0", display: "grid", gap: 5 }}>
          {order.lines.slice(0, 3).map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 13.5 }}>
              <span className="mono" style={{ color: "var(--orange)", fontWeight: 700 }}>{l.qty}×</span>
              <span style={{ flex: 1 }}>{l.name}{l.variant === "double" && <span style={{ color: "var(--muted)" }}> · doble</span>}{l.mods && <span style={{ color: "var(--muted)" }}> · {l.mods}</span>}</span>
            </div>
          ))}
          {order.lines.length > 3 && <div className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>+{order.lines.length - 3} más…</div>}
          {order.notes && <div style={{ fontSize: 12.5, color: "var(--warn)", background: "rgba(233,185,73,.08)", padding: "6px 10px", borderRadius: 7 }}>📝 {order.notes}</div>}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--line-dark)", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="mono tabular" style={{ fontSize: 17, fontWeight: 700 }}>{money(order.total)}</span>
            {order.paid
              ? <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--ok)", border: "1px solid var(--ok)", padding: "3px 8px", borderRadius: 100 }}>PAGADO</span>
              : order.status !== "cancelado" && (
                <button onClick={() => onPay(order)} className="mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--warn)", border: "1px solid var(--warn)", padding: "3px 8px", borderRadius: 100, background: "none", cursor: "pointer" }}>COBRAR</button>
              )}
          </div>
          <button onClick={() => onDetail(order)} className="mono" style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>Detalle <Ic.arrow width={14} height={14} /></button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, borderTop: "1px solid var(--line-dark)" }}>
        {active && (
          <button onClick={() => store.updateStatus(order.id, "cancelado")} title="Cancelar" className="adm-cancel" style={{ padding: "12px", background: "none", border: "none", borderRight: "1px solid var(--line-dark)", color: "var(--danger)", cursor: "pointer", display: "grid", placeItems: "center" }}><Ic.x width={16} height={16} /></button>
        )}
        {next ? (
          <button onClick={() => store.updateStatus(order.id, next)} className="mono adm-next" style={{ flex: 1, padding: "12px", background: "var(--orange)", border: "none", color: "#1a1206", fontWeight: 700, fontSize: 12.5, letterSpacing: ".04em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Ic.arrow width={15} height={15} /> Pasar a {STATUS_META[next].label}
          </button>
        ) : (
          <div className="mono" style={{ flex: 1, padding: "12px", textAlign: "center", color: STATUS_META[order.status].color, fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>
            {order.status === "entregado" ? "✓ Entregado" : "Cancelado"}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- ORDER DETAIL DRAWER ---------------- */
function OrderDetail({ order, onClose, onPay }) {
  const store = useStore();
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const live = store.getOrders().find((o) => o.id === order.id) || order;
  const meta = STATUS_META[live.status];
  const payLabel = live.paid ? (PAY_LABEL[live.payMethod] || live.payMethod) : (PAY_LABEL[live.pay] || live.pay);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,.6)" }} />
      <aside style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(440px,94vw)", zIndex: 81, background: "var(--ink)", borderLeft: "1px solid var(--line-dark)", boxShadow: "var(--shadow)", display: "flex", flexDirection: "column", animation: "bf-slidein .3s" }}>
        <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--line-dark)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 className="display" style={{ fontSize: 26, margin: 0 }}>{live.id}</h2>
              <span className="mono" style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: meta.color, background: meta.bg, padding: "5px 9px", borderRadius: 100 }}>{meta.label}</span>
            </div>
            <div className="mono" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, display: "flex", gap: 10, alignItems: "center" }}>
              <ModeChip order={live} /> · hace {minsSince(live.createdAt)} min
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}><Ic.x /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
          {/* cliente / mesa */}
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>{live.mode === "salon" ? "Mesa" : "Cliente"}</div>
          <div style={{ ...card, padding: 16, marginBottom: 18 }}>
            <DetRow icon={Ic.user} v={live.name} />
            {live.phone && <DetRow icon={Ic.phone} v={live.phone} />}
            {live.mode === "delivery" && (
              <>
                <DetRow icon={Ic.pin} v={live.address || "—"} />
                {live.bell && <DetRow icon={Ic.bell} v={"Timbre: " + live.bell} />}
              </>
            )}
            {live.mode === "takeaway" && live.name !== "Mostrador" && <DetRow icon={Ic.bag} v="Take away — retira en el local" />}
            <DetRow icon={Ic.copy} v={(live.paid ? "Pagado · " : "Pago: ") + payLabel + (live.discount ? " · desc. " + live.discount + "%" : "")} />
            {live.by && <DetRow icon={Ic.user} v={"Tomado por: " + live.by} />}
            {live.notes && <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(233,185,73,.1)", borderRadius: 8, fontSize: 13, color: "var(--warn)" }}>📝 {live.notes}</div>}
          </div>

          {/* items */}
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>Pedido</div>
          <div style={{ ...card, padding: 16, marginBottom: 18 }}>
            {live.lines.map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < live.lines.length - 1 ? "1px solid var(--line-dark)" : "none" }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <span className="mono" style={{ color: "var(--orange)", fontWeight: 700 }}>{l.qty}×</span>
                  <span>{l.name}{l.variant === "double" && <span style={{ color: "var(--muted)" }}> · doble</span>}{l.mods && <span style={{ color: "var(--muted)" }}> · {l.mods}</span>}</span>
                </div>
                <span className="mono tabular" style={{ color: "var(--muted)" }}>{money(l.lineTotal)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line-dark)" }}>
              <span style={{ color: "var(--muted)" }}>Subtotal</span><span className="mono tabular">{money(live.subtotal)}</span>
            </div>
            {live.mode === "delivery" && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ color: "var(--muted)" }}>Envío</span><span className="mono tabular">{live.shipping ? money(live.shipping) : "Gratis"}</span>
              </div>
            )}
            {live.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ color: "var(--muted)" }}>Descuento</span><span className="mono tabular" style={{ color: "var(--ok)" }}>−{live.discount}%</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10 }}>
              <span className="display" style={{ fontSize: 18 }}>Total</span><span className="display tabular" style={{ fontSize: 26, color: "var(--orange)" }}>{money(live.total)}</span>
            </div>
          </div>

          {/* cambiar estado */}
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>Cambiar estado</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {flowFor(live).map((s) => (
              <button key={s} onClick={() => store.updateStatus(live.id, s)} className="mono" style={{
                padding: "11px", borderRadius: 9, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".03em", cursor: "pointer",
                border: "1.5px solid " + (live.status === s ? STATUS_META[s].color : "var(--line-dark)"),
                background: live.status === s ? STATUS_META[s].bg : "transparent",
                color: live.status === s ? STATUS_META[s].color : "var(--white)",
              }}>{STATUS_META[s].label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: 18, borderTop: "1px solid var(--line-dark)", display: "grid", gap: 10 }}>
          {!live.paid && live.status !== "cancelado" && (
            <button className="btn btn-orange btn-block" onClick={() => onPay(live)}><Ic.check width={17} height={17} /> Cobrar · {money(live.total)}</button>
          )}
          {live.phone && (
            <a className={"btn btn-block " + (live.paid ? "btn-orange" : "btn-ghost")} href={waLink(`¡Hola ${live.name}! Tu pedido ${live.id} está: ${meta.label}. — Dr. Empanada 🥟`)} target="_blank" rel="noopener">
              <Ic.wa width={17} height={17} /> Avisar estado por WhatsApp
            </a>
          )}
        </div>
      </aside>
    </>
  );
}
function DetRow({ icon: Icon, v }) {
  return <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "5px 0" }}><span style={{ color: "var(--orange)", flexShrink: 0 }}><Icon width={16} height={16} /></span><span style={{ fontSize: 14 }}>{v}</span></div>;
}

Object.assign(window, { Admin, STATUS_META, flowFor, Metric, ModeChip });

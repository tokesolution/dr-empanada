/* ============================================================
   app.jsx — router + montaje
   ============================================================ */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#f2900d",
  "displayFont": "Anton"
}/*EDITMODE-END*/;

function useRoute() {
  const [route, setRoute] = React.useState(window.location.hash || "#/");
  React.useEffect(() => {
    const onHash = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}
const go = (hash) => { window.location.hash = hash; };

function App() {
  const route = useRoute();
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // cuando llegan (o cambian desde el panel) las fotos del menú, re-render
  const [, bumpImgs] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    window.addEventListener("bf-menu-images", bumpImgs);
    return () => window.removeEventListener("bf-menu-images", bumpImgs);
  }, []);
  const target = route.split("?")[0];

  // path que realmente se renderiza — cambia recién cuando el wipe tapa la
  // pantalla, así la transición entre páginas se ve y el swap queda oculto.
  // En el montaje path===target → sin wipe; cada navegación posterior sí lo dispara.
  const [path, setPath] = React.useState(target);
  React.useEffect(() => {
    if (path === target) return;
    const swap = () => {
      setPath(target);
      if (window.FX) FX.toTop(); else window.scrollTo({ top: 0 });
    };
    if (window.FX && FX.pageWipe) FX.pageWipe(swap);
    else swap();
  }, [target]);

  // aplicar tweaks a las CSS vars
  React.useEffect(() => {
    document.documentElement.style.setProperty("--orange", t.accent);
    document.documentElement.style.setProperty("--display", `"${t.displayFont}", "Arial Narrow", sans-serif`);
  }, [t.accent, t.displayFont]);

  // avisar a fx.js que la app montó → dispara la salida del loader
  React.useEffect(() => {
    window.dispatchEvent(new Event("bfx-app-ready"));
  }, []);

  const isAdmin = path.startsWith("#/admin");

  // páginas públicas con tema claro cartoon; admin mantiene el oscuro
  const isLight = ["#/", "", "#/menu", "#/nosotros", "#/contacto", "#/checkout"].includes(path);
  React.useEffect(() => {
    document.body.classList.toggle("bfx-home", isLight);
  }, [isLight]);
  // admin también en cartoon (crema) vía remap de tokens en fx.css
  React.useEffect(() => {
    document.body.classList.toggle("bfx-admin", isAdmin);
  }, [isAdmin]);

  let page;
  if (path === "#/" || path === "") page = <Home go={go} />;
  else if (path === "#/menu") page = <MenuPage go={go} />;
  else if (path === "#/nosotros") page = <Nosotros go={go} />;
  else if (path === "#/contacto") page = <Contacto go={go} />;
  else if (path === "#/privacidad") page = <Privacidad go={go} />;
  else if (path === "#/checkout") page = <Checkout go={go} />;
  else if (isAdmin) page = <Admin go={go} />;
  else page = <Home go={go} />;

  const Tweaks = (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Marca" />
      <TweakColor label="Color de acento" value={t.accent}
        options={["#f2900d", "#ffe040", "#e0b060", "#d8533c", "#3fae6b"]}
        onChange={(v) => setTweak("accent", v)} />
      <TweakSelect label="Tipografía display" value={t.displayFont}
        options={["Anton", "Archivo Black", "Oswald", "Bebas Neue"]}
        onChange={(v) => setTweak("displayFont", v)} />
    </TweaksPanel>
  );

  if (isAdmin) {
    return (<>{page}{Tweaks}</>);
  }

  return (
    <>
      <div id="bf-top-sentinel" aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, width: 1, height: 1 }} />
      <Header route={path} go={go} />
      <div key={path} className="bfx-route-in">{page}</div>
      <Footer go={go} />
      <WhatsAppFAB />
      <CartDrawer go={go} />
      <Customizer />
      <Toaster />
      <div className="grain" aria-hidden="true" />
      {ENV !== "PROD" && <div className="bfx-envbadge" title={"Ambiente " + ENV + " · " + location.hostname}>{ENV}</div>}
      {Tweaks}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

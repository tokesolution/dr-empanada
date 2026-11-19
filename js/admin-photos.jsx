/* ============================================================
   admin-photos.jsx — "Fotos del menú" (solo dueño)
   El dueño cambia la foto de cualquier producto sin tocar código:
   elige una imagen, se achica en el navegador (máx. 1400px, webp) y
   se sube a Cloudflare R2 vía /api/menu-images/:id. El sitio la toma
   de /api/menu-images al cargar. Subir pide la "clave de fotos"
   (secreto ADMIN_KEY del proyecto en Cloudflare): el login del panel
   es local, así que la seguridad real la pone el servidor.
   ============================================================ */
const PHOTO_KEY_SS = "bf_photo_key";

/* achica y convierte a webp (cae a jpeg si el navegador no sabe webp) */
function shrinkImage(file, max = 1400, quality = .85) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * s);
      c.height = Math.round(img.naturalHeight * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => {
        if (b && b.type === "image/webp") return resolve(b);
        c.toBlob((j) => (j ? resolve(j) : reject(new Error("No se pudo procesar la imagen"))), "image/jpeg", quality);
      }, "image/webp", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Ese archivo no es una imagen válida")); };
    img.src = url;
  });
}

function AdminPhotos() {
  const [key, setKey] = React.useState(() => { try { return sessionStorage.getItem(PHOTO_KEY_SS) || ""; } catch (e) { return ""; } });
  const [keyInput, setKeyInput] = React.useState("");
  const [busy, setBusy] = React.useState(null);     // id en proceso
  const [preview, setPreview] = React.useState({}); // id → objectURL recién subida
  const [cat, setCat] = React.useState("all");
  const [apiOk, setApiOk] = React.useState(null);   // null = probando
  const [, force] = React.useReducer((x) => x + 1, 0);
  const inputs = React.useRef({});

  React.useEffect(() => {
    fetch("/api/menu-images", { cache: "no-store" })
      .then((r) => setApiOk(r.ok && (r.headers.get("content-type") || "").includes("json")))
      .catch(() => setApiOk(false));
    window.addEventListener("bf-menu-images", force);
    return () => window.removeEventListener("bf-menu-images", force);
  }, []);

  const saveKey = (e) => {
    e.preventDefault();
    const k = keyInput.trim();
    if (!k) return;
    try { sessionStorage.setItem(PHOTO_KEY_SS, k); } catch (err) {}
    setKey(k); setKeyInput("");
  };
  const forgetKey = () => { try { sessionStorage.removeItem(PHOTO_KEY_SS); } catch (e) {} setKey(""); };

  const call = async (method, id, body, type) => {
    const res = await fetch("/api/menu-images/" + id, {
      method, body,
      headers: { "x-admin-key": key, ...(type ? { "content-type": type } : {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { forgetKey(); throw new Error("La clave de fotos no es correcta. Volvé a ingresarla."); }
    if (!res.ok) throw new Error(data.error || "No se pudo guardar (" + res.status + ")");
    return data;
  };

  const upload = async (item, file) => {
    if (!file) return;
    setBusy(item.id);
    try {
      const blob = await shrinkImage(file);
      await call("PUT", item.id, blob, blob.type);
      setPreview((p) => ({ ...p, [item.id]: URL.createObjectURL(blob) }));
      await loadMenuImages();
      toast("Foto de " + item.name + " actualizada");
    } catch (err) {
      toast(err.message || "Error al subir la foto");
    } finally {
      setBusy(null);
      if (inputs.current[item.id]) inputs.current[item.id].value = "";
    }
  };

  const restore = async (item) => {
    if (!confirm("¿Volver a la foto original de " + item.name + "?")) return;
    setBusy(item.id);
    try {
      await call("DELETE", item.id);
      setPreview((p) => { const n = { ...p }; delete n[item.id]; return n; });
      await loadMenuImages();
      toast("Volvió la foto original de " + item.name);
    } catch (err) { toast(err.message || "Error"); } finally { setBusy(null); }
  };

  const cats = MENU.filter((c) => c.layout === "cards");
  const shown = cats.filter((c) => cat === "all" || c.id === cat);
  const panel = { background: "var(--ink-2)", border: "1px solid var(--line-dark)", borderRadius: 16, padding: 20 };

  return (
    <div style={{ padding: "26px 28px 60px", maxWidth: 1200 }}>
      <div style={{ marginBottom: 18 }}>
        <h1 className="display" style={{ fontSize: 36, margin: 0 }}>Fotos del menú</h1>
        <p className="mono" style={{ fontSize: 12.5, color: "var(--muted)", margin: "6px 0 0" }}>
          Cambiá la foto de cualquier producto. Se actualiza en la web para todos al instante.
        </p>
      </div>

      {apiOk === false && (
        <div style={{ ...panel, marginBottom: 16, borderColor: "rgba(216,83,60,.5)", background: "rgba(216,83,60,.08)", fontSize: 14, lineHeight: 1.5 }}>
          <b style={{ color: "var(--danger)" }}>El servicio de fotos no responde en este entorno.</b><br />
          Funciona en la web publicada (Cloudflare) una vez configurados el bucket <span className="mono">MENU_IMAGES</span> y la clave <span className="mono">ADMIN_KEY</span>.
        </div>
      )}

      {!key ? (
        <form onSubmit={saveKey} style={{ ...panel, marginBottom: 18, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 260px" }}>
            <Field label="Clave de fotos">
              <input type="password" style={inp} value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="La clave que te pasó quien hizo la web" autoComplete="off" />
            </Field>
          </div>
          <button className="btn btn-orange"><Ic.lock width={15} height={15} /> Desbloquear</button>
          <p className="mono" style={{ flexBasis: "100%", margin: 0, fontSize: 11.5, color: "var(--muted)" }}>
            Se guarda solo mientras esté abierta esta pestaña.
          </p>
        </form>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <div className="adm-segs">
            {[["all", "Todo"], ...cats.map((c) => [c.id, c.name])].map(([id, label]) => (
              <button key={id} className={"adm-seg" + (cat === id ? " on" : "")} onClick={() => setCat(id)}>{label}</button>
            ))}
          </div>
          <span style={{ flex: 1 }} />
          <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>JPG, PNG o WEBP · se achica sola</span>
          <button className="btn btn-ghost" onClick={forgetKey} style={{ padding: "8px 14px" }}>Bloquear</button>
        </div>
      )}

      {shown.map((c) => (
        <div key={c.id} style={{ marginBottom: 26 }}>
          <div className="display" style={{ fontSize: 20, marginBottom: 12 }}>{c.name}</div>
          <div className="adm-photogrid">
            {c.items.map((it) => {
              const custom = !!IMG_OVERRIDES[it.id];
              const src = preview[it.id] || itemImg(it);
              const loading = busy === it.id;
              return (
                <div key={it.id} className={"adm-photo" + (loading ? " is-busy" : "")}>
                  <div className="pic">
                    <img src={src} alt={it.name} loading="lazy" />
                    {custom && <span className="flag">Foto nueva</span>}
                    {loading && <div className="spin"><span /></div>}
                  </div>
                  <div className="meta">
                    <div className="nm">{it.name}</div>
                    <div className="acts">
                      <input type="file" accept="image/jpeg,image/png,image/webp" hidden
                        ref={(el) => (inputs.current[it.id] = el)}
                        onChange={(e) => upload(it, e.target.files && e.target.files[0])} />
                      <button className="btn btn-orange" disabled={!key || loading || apiOk === false}
                        onClick={() => inputs.current[it.id] && inputs.current[it.id].click()}>
                        Cambiar foto
                      </button>
                      {custom && (
                        <button className="btn btn-ghost" disabled={!key || loading} onClick={() => restore(it)} title="Volver a la foto original">
                          Original
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

window.AdminPhotos = AdminPhotos;

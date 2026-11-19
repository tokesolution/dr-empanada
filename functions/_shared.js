/* ============================================================
   Utilidades compartidas de las Functions de fotos del menú.
   (Los archivos que empiezan con "_" no son rutas.)

   Bindings que tiene que tener el proyecto de Cloudflare Pages
   (Settings → Functions / Variables), en Production y en Preview:
     - MENU_IMAGES : bucket de R2 donde se guardan las fotos
     - ADMIN_KEY   : secreto con la clave para subir fotos
   ============================================================ */

export const INDEX_KEY = "menu-images.json";
export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB por foto
export const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export const validId = (id) => typeof id === "string" && /^[a-z0-9-]{1,60}$/.test(id);

export async function readIndex(bucket) {
  const obj = await bucket.get(INDEX_KEY);
  if (!obj) return {};
  try { return (await obj.json()) || {}; } catch { return {}; }
}

export async function writeIndex(bucket, map) {
  await bucket.put(INDEX_KEY, JSON.stringify(map), { httpMetadata: { contentType: "application/json" } });
}

/* Compara la clave del pedido con ADMIN_KEY en tiempo constante. */
export function authorized(request, env) {
  const expected = env.ADMIN_KEY || "";
  const given = request.headers.get("x-admin-key") || "";
  if (!expected || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

/* "/img/menu/carne-cuchillo-1700000000.webp" → "menu/carne-cuchillo-1700000000.webp" */
export const urlToKey = (url) => (typeof url === "string" && url.startsWith("/img/") ? url.slice(5) : null);

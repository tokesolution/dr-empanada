/* PUT    /api/menu-images/:id  → sube la foto nueva de un producto
   DELETE /api/menu-images/:id  → vuelve a la foto original (la de assets/)
   Las dos piden el header x-admin-key con la clave (secreto ADMIN_KEY). */
import { json, validId, readIndex, writeIndex, authorized, urlToKey, MAX_BYTES, TYPES } from "../../_shared.js";

function guard(params, request, env) {
  if (!env.MENU_IMAGES || !env.ADMIN_KEY) return json({ error: "Las fotos todavía no están configuradas en Cloudflare." }, 503);
  if (!authorized(request, env)) return json({ error: "Clave incorrecta." }, 401);
  if (!validId(params.id)) return json({ error: "Producto inválido." }, 400);
  return null;
}

export async function onRequestPut({ params, request, env }) {
  const bad = guard(params, request, env);
  if (bad) return bad;

  const type = (request.headers.get("content-type") || "").split(";")[0].trim();
  const ext = TYPES[type];
  if (!ext) return json({ error: "Formato no soportado: usá JPG, PNG o WEBP." }, 415);
  const body = await request.arrayBuffer();
  if (!body.byteLength) return json({ error: "La foto está vacía." }, 400);
  if (body.byteLength > MAX_BYTES) return json({ error: "La foto pesa más de 5 MB." }, 413);

  const bucket = env.MENU_IMAGES;
  const key = `menu/${params.id}-${Date.now()}.${ext}`;
  await bucket.put(key, body, { httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" } });

  const map = await readIndex(bucket);
  const oldKey = urlToKey(map[params.id]);
  map[params.id] = "/img/" + key;
  await writeIndex(bucket, map);
  if (oldKey && oldKey !== key) await bucket.delete(oldKey);

  return json({ ok: true, id: params.id, url: map[params.id] });
}

export async function onRequestDelete({ params, request, env }) {
  const bad = guard(params, request, env);
  if (bad) return bad;
  const bucket = env.MENU_IMAGES;
  const map = await readIndex(bucket);
  const oldKey = urlToKey(map[params.id]);
  delete map[params.id];
  await writeIndex(bucket, map);
  if (oldKey) await bucket.delete(oldKey);
  return json({ ok: true, id: params.id });
}

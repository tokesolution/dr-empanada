/* GET /img/menu/<archivo> → sirve la foto desde el bucket de R2.
   Cada foto subida tiene un nombre único (lleva la fecha), así que se
   puede cachear para siempre: al cambiarla cambia la URL. */
export async function onRequestGet({ params, env }) {
  if (!env.MENU_IMAGES) return new Response("Not found", { status: 404 });
  const key = (Array.isArray(params.path) ? params.path : [params.path]).join("/");
  if (!/^menu\/[a-z0-9-]+-\d+\.(jpg|png|webp)$/.test(key)) return new Response("Not found", { status: 404 });
  const obj = await env.MENU_IMAGES.get(key);
  if (!obj) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { headers });
}

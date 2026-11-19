/* GET /api/menu-images → { idProducto: "/img/menu/…" }
   Lo lee el sitio al cargar para reemplazar las fotos de assets/ por las
   que el dueño subió desde el panel. Sin bucket configurado devuelve {}. */
import { json, readIndex } from "../_shared.js";

export async function onRequestGet({ env }) {
  if (!env.MENU_IMAGES) return json({});
  return json(await readIndex(env.MENU_IMAGES));
}

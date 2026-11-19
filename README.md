# Dr. Empanada — sitio web

Sitio estático (HTML + CSS + JSX compilado en el browser con Babel standalone).
**No hay paso de build**: lo que está en el repo es lo que se sirve.

```bash
npm run dev     # http://localhost:4173
```

## Ambientes

| Ambiente | Rama | URL | Para qué |
|---|---|---|---|
| **PROD** | `PROD` | https://dr-empanada.pages.dev | Lo que ve el cliente |
| **TEST** | `TEST` | preview de rama en Cloudflare Pages (`test.dr-empanada.pages.dev`) | Revisar cambios antes de publicar |
| **LOCAL** | la que sea | http://localhost:4173 | Desarrollo |

El ambiente se detecta solo por hostname (`ENV` en [`js/data.jsx`](js/data.jsx)).
Todo lo que **no** sea el dominio de producción muestra un badge fijo abajo a la
izquierda (`TEST` o `LOCAL`) para que no se confunda una preview con el sitio real.

Si algún día se suma un dominio propio, hay que agregarlo a `PROD_HOST`.

### Flujo de trabajo

```
trabajar en TEST  →  push a TEST  →  revisar la preview  →  merge a PROD
```

```bash
git switch TEST
# ...cambios...
git commit -am "lo que sea"
git push origin TEST          # dispara la preview

# cuando está aprobado:
git switch PROD && git merge --ff-only TEST && git push origin PROD
```

Cloudflare Pages tiene `PROD` como *production branch*; cualquier otra rama
genera un deploy de preview automático. No hay variables de entorno: el sitio
es 100% estático y el estado (carrito, pedidos, stock, usuarios del panel) vive
en `localStorage` del navegador.

## Caché

`index.html` referencia los `.jsx`/`.css` con `?v=N`. **Al tocar cualquiera de
esos archivos hay que subir el número**, si no Cloudflare sigue sirviendo la
versión vieja (`/js/*` tiene caché de 1 h, `/css/*` y `/assets/*` de 1 año — ver
[`_headers`](_headers)).

## Dónde tocar qué

| Quiero cambiar... | Archivo |
|---|---|
| Precios, sabores, horarios, datos de pago | `js/data.jsx` |
| Costo de envío, seña, cupones | `js/data.jsx` (`SHIPPING`, `SENA_PCT`, `COUPONS`) |
| Home (hero, slider de sabores, delivery, ranking) | `js/home.jsx` |
| Carta y buscador | `js/menu.jsx` |
| Checkout (datos, pago, confirmación) | `js/checkout.jsx` |
| Header, footer, modal de producto | `js/components.jsx` |
| Animaciones (GSAP + Lenis) | `js/fx.js` |
| Estilo cartoon | `css/fx.css` · base y panel: `css/brand.css` |

El panel de administración está en `#/admin` (usuarios de prueba en
`js/store.jsx` → `getUsers`).

## Fotos del menú (panel admin)

El dueño cambia la foto de cualquier producto desde **Panel › Fotos del menú**.
Las fotos se guardan en Cloudflare R2 a través de las Functions de `functions/`:

| Ruta | Qué hace |
|---|---|
| `GET /api/menu-images` | Mapa `{ idProducto: url }` que el sitio lee al cargar |
| `PUT /api/menu-images/:id` | Sube la foto nueva (pide el header `x-admin-key`) |
| `DELETE /api/menu-images/:id` | Vuelve a la foto original de `assets/` |
| `GET /img/menu/...` | Sirve la foto desde R2 |

Configuración en Cloudflare (proyecto de Pages › Settings, en **Production y Preview**):

- Binding de R2 **`MENU_IMAGES`** → un bucket (ej. `dr-empanada-fotos`).
- Secreto **`ADMIN_KEY`** → la "clave de fotos" que se le pasa al dueño.

Sin eso el sitio funciona igual con las fotos de `assets/` y el panel avisa que
falta configurar. Para probar en local: `npx wrangler pages dev . --r2 MENU_IMAGES`
con un `.dev.vars` que tenga `ADMIN_KEY=...` (está en `.gitignore`).


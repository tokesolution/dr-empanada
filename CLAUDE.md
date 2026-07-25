# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

Deploy to production: `vercel deploy --prod --yes` (run from the project root).

There are no tests in this project.

## Architecture

**Next.js 16 App Router** with Tailwind CSS, hosted on Vercel. Database is **Neon PostgreSQL** accessed via `@neondatabase/serverless` with tagged template literals (never use `?` placeholders).

### Path alias
`@/` maps to the project root. Use it for all internal imports.

### Data flow for orders

Prices are defined statically in `lib/products.js` but can be overridden per-product in the `products_config` DB table. All server-side order logic must go through `lib/products-server.js` (`getProductMap()`) — never read from `lib/products.js` directly in API routes — to get the effective price, stock, and active status.

Client-side code uses `lib/products.js` only for display (menu, cart). The server always recalculates totals; client-submitted prices are ignored.

### DB schema

Tables managed by `POST /api/admin/setup` (runs automatically on first admin login):

- **`orders`** — customer orders. Key columns: `items` (JSONB), `total`, `discount`, `coupon_code`, `promo_id`, `status`.
- **`products_config`** — per-product overrides: `id` (matches `lib/products.js` ids), `price_override`, `stock` (-1 = unlimited), `low_stock_threshold`, `active`.
- **`promotions`** — automatic discounts applied server-side. Fields: `discount_type` (percentage|fixed), `discount_value`, `applies_to` (all|category|product), `applies_value`, `min_order`, `starts_at`, `ends_at`, `active`.
- **`coupons`** — customer-entered codes. Fields: same discount fields + `code` (always uppercase), `max_uses` (-1 = unlimited), `uses_count`, `expires_at`, `active`.

### Authentication (admin)

`lib/admin-auth.js` generates a HMAC-SHA256 token from `ADMIN_PASSWORD` + `ADMIN_SECRET`. The token is stored in `sessionStorage` on the client and sent as the `x-admin-token` header. All admin API routes call `requireAdmin(request)` before doing anything.

The admin panel (`app/admin/page.js`) calls `POST /api/admin/setup` on every login to create missing tables idempotently.

### Discount precedence

In `POST /api/orders` and `POST /api/mp/preference`: if a `coupon_code` is present in the request, validate it and apply it; `uses_count` is incremented immediately. If no coupon, check for active promotions via `getBestPromotion()` in `lib/products-server.js` and apply the best one. Promotions and coupons never stack.

### Mercado Pago flow

1. Tarjeta checkout → `POST /api/mp/preference` creates the order with `status = 'pendiente_pago'` and returns a Checkout URL.
2. MP sends `POST /api/mp/webhook` after payment; the webhook updates order status to `pendiente` (approved) or `cancelado` (rejected).
3. `NEXT_PUBLIC_BASE_URL` env var sets the back URLs and webhook URL. In Vercel this must be set to `https://dr-empanada.vercel.app`.

### Admin panel sections

`app/admin/page.js` is a single `'use client'` component (~700 lines) managing all state. Sections: **Pedidos** (orders), **Stock** (inventory), **Precios** (price overrides), **Promociones** (auto-discounts), **Cupones** (coupon codes), **Métricas** (analytics). Data for each section is fetched lazily when the user navigates to it.

## Key env vars

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_SECRET` | HMAC secret for token generation |
| `MP_ACCESS_TOKEN` | Mercado Pago API token |
| `NEXT_PUBLIC_BASE_URL` | Production URL (for MP webhooks and redirects) |

`@supabase/supabase-js` is installed but unused — the project uses only Neon.

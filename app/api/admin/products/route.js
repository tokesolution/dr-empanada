import { getDb } from '@/lib/db'
import { PRODUCTS } from '@/lib/products'
import { requireAdmin } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const sql = getDb()
    await sql`ALTER TABLE products_config ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false`.catch(() => {})
    const configs = await sql`SELECT * FROM products_config`
    const configMap = Object.fromEntries(configs.map(c => [c.id, c]))
    const products = PRODUCTS.map(p => ({
      ...p,
      price_override: configMap[p.id]?.price_override ?? null,
      effective_price: configMap[p.id]?.price_override != null ? parseInt(configMap[p.id].price_override) : p.price,
      stock: configMap[p.id]?.stock != null ? parseInt(configMap[p.id].stock) : -1,
      low_stock_threshold: configMap[p.id]?.low_stock_threshold != null ? parseInt(configMap[p.id].low_stock_threshold) : 5,
      active: configMap[p.id]?.active ?? true,
      archived: configMap[p.id]?.archived ?? false,
    }))
    return NextResponse.json(products)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  const { id, archived } = body
  if (!id || !PRODUCTS.find(p => p.id === id)) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  const sql = getDb()

  // Archived-only update
  if (archived !== undefined && Object.keys(body).length === 2) {
    await sql`
      INSERT INTO products_config (id, stock, archived, updated_at) VALUES (${id}, -1, ${archived}, NOW())
      ON CONFLICT (id) DO UPDATE SET archived = EXCLUDED.archived, updated_at = NOW()
    `
    return NextResponse.json({ ok: true })
  }

  const { price_override, stock, low_stock_threshold, active } = body
  const priceVal = price_override != null && price_override !== '' ? parseInt(price_override) : null
  const stockVal = stock != null && stock !== '' ? parseInt(stock) : -1
  const thresholdVal = low_stock_threshold != null && low_stock_threshold !== '' ? parseInt(low_stock_threshold) : 5
  try {
    await sql`
      INSERT INTO products_config (id, price_override, stock, low_stock_threshold, active, archived, updated_at)
      VALUES (${id}, ${priceVal}, ${stockVal}, ${thresholdVal}, ${active ?? true}, false, NOW())
      ON CONFLICT (id) DO UPDATE SET
        price_override = EXCLUDED.price_override,
        stock = EXCLUDED.stock,
        low_stock_threshold = EXCLUDED.low_stock_threshold,
        active = EXCLUDED.active,
        updated_at = NOW()
    `
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

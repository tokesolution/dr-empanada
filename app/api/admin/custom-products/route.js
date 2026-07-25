import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS custom_products (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT DEFAULT '',
      price INTEGER NOT NULL,
      category TEXT DEFAULT 'Clásicas',
      img_url TEXT,
      emoji TEXT DEFAULT '🫔',
      stock INTEGER DEFAULT -1,
      low_stock_threshold INTEGER DEFAULT 5,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `
  // Migraciones seguras
  await sql`ALTER TABLE custom_products ADD COLUMN IF NOT EXISTS empanadas_count INTEGER DEFAULT 0`.catch(() => {})
  await sql`ALTER TABLE custom_products ADD COLUMN IF NOT EXISTS pastelitos_count INTEGER DEFAULT 0`.catch(() => {})
  await sql`ALTER TABLE custom_products ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false`.catch(() => {})
  await sql`ALTER TABLE custom_products ADD COLUMN IF NOT EXISTS descripcion TEXT DEFAULT ''`.catch(() => {})
  // Si la columna se llamaba "desc" (palabra reservada), renombrarla
  await sql`ALTER TABLE custom_products RENAME COLUMN "desc" TO descripcion`.catch(() => {})
}

function slugify(str) {
  return 'custom-' + str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 40) + '-' + Date.now().toString(36)
}

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const sql = getDb()
    await ensureTable(sql)
    const products = await sql`SELECT * FROM custom_products ORDER BY created_at ASC`
    return NextResponse.json(products)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  const { nombre, desc, descripcion, price, category, img_url, emoji, stock, empanadas_count, pastelitos_count } = body
  const descVal = (descripcion || desc || '').trim()
  if (!nombre?.trim() || !price) return NextResponse.json({ error: 'Nombre y precio requeridos' }, { status: 400 })
  const stockVal = (stock !== '' && stock != null) ? parseInt(stock) : -1
  const priceVal = parseInt(price)
  if (isNaN(priceVal) || priceVal < 1) return NextResponse.json({ error: 'Precio inválido' }, { status: 400 })
  try {
    const sql = getDb()
    await ensureTable(sql)
    const id = slugify(nombre)
    const [product] = await sql`
      INSERT INTO custom_products (id, nombre, descripcion, price, category, img_url, emoji, stock, empanadas_count, pastelitos_count)
      VALUES (${id}, ${nombre.trim()}, ${descVal}, ${priceVal}, ${category || 'Clásicas'}, ${img_url?.trim() || null}, ${emoji?.trim() || '🫔'}, ${stockVal}, ${parseInt(empanadas_count) || 0}, ${parseInt(pastelitos_count) || 0})
      RETURNING *
    `
    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  const { id, nombre, desc, descripcion, price, category, img_url, emoji, stock, active, archived } = body
  const descVal = descripcion ?? desc ?? null
  try {
    const sql = getDb()
    const [product] = await sql`
      UPDATE custom_products SET
        nombre = COALESCE(${nombre ?? null}, nombre),
        descripcion = COALESCE(${descVal}, descripcion),
        price = COALESCE(${price ? parseInt(price) : null}, price),
        category = COALESCE(${category ?? null}, category),
        img_url = COALESCE(${img_url ?? null}, img_url),
        emoji = COALESCE(${emoji ?? null}, emoji),
        stock = COALESCE(${stock != null ? parseInt(stock) : null}, stock),
        active = COALESCE(${active ?? null}, active),
        archived = COALESCE(${archived ?? null}, archived)
      WHERE id = ${id}
      RETURNING *
    `
    return NextResponse.json(product)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  const { id } = body
  try {
    const sql = getDb()
    await sql`DELETE FROM custom_products WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

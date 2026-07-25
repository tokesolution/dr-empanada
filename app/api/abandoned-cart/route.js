import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS abandoned_carts (
      id SERIAL PRIMARY KEY,
      customer_name TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      cart_items JSONB,
      cart_total INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      contacted BOOLEAN DEFAULT false
    )
  `
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { customer_name, customer_phone, customer_email, cart_items, cart_total } = body
    if (!cart_items?.length) return NextResponse.json({ ok: true })
    const sql = getDb()
    await ensureTable(sql)
    await sql`
      INSERT INTO abandoned_carts (customer_name, customer_phone, customer_email, cart_items, cart_total)
      VALUES (${customer_name || null}, ${customer_phone || null}, ${customer_email || null}, ${JSON.stringify(cart_items)}, ${cart_total || 0})
    `
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ ok: true }) }
}

import { getDb } from '@/lib/db'
import { PRODUCTS } from '@/lib/products'
import { requireAdmin } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function POST(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const sql = getDb()
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS products_config (
        id VARCHAR(50) PRIMARY KEY,
        price_override INTEGER,
        stock INTEGER DEFAULT -1,
        low_stock_threshold INTEGER DEFAULT 5,
        active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    await sql`
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        discount_type VARCHAR(20) NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        applies_to VARCHAR(20) DEFAULT 'all',
        applies_value TEXT,
        min_order INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        starts_at TIMESTAMP,
        ends_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    await sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        discount_type VARCHAR(20) NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        min_order INTEGER DEFAULT 0,
        max_uses INTEGER DEFAULT -1,
        uses_count INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50)`
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0`
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_id INTEGER`
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(100)`
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cooking_method VARCHAR(10)`
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        autor TEXT NOT NULL,
        texto TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        fecha TEXT,
        visible BOOLEAN DEFAULT true
      )
    `

    for (const product of PRODUCTS) {
      await sql`
        INSERT INTO products_config (id, price_override, stock, low_stock_threshold, active)
        VALUES (${product.id}, NULL, -1, 5, true)
        ON CONFLICT (id) DO NOTHING
      `
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

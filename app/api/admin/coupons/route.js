import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const sql = getDb()
    const rows = await sql`SELECT * FROM coupons ORDER BY created_at DESC`
    return NextResponse.json(rows)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  const { code, description, discount_type, discount_value, min_order, max_uses, expires_at } = body
  if (!code?.trim() || !['percentage', 'fixed'].includes(discount_type) || !discount_value) {
    return NextResponse.json({ error: 'Código, tipo y valor son requeridos' }, { status: 400 })
  }
  try {
    const sql = getDb()
    const [row] = await sql`
      INSERT INTO coupons (code, description, discount_type, discount_value, min_order, max_uses, expires_at)
      VALUES (
        ${code.trim().toUpperCase()}, ${description?.trim() || null}, ${discount_type},
        ${parseFloat(discount_value)}, ${parseInt(min_order) || 0},
        ${max_uses !== '' && max_uses != null ? parseInt(max_uses) : -1},
        ${expires_at || null}
      )
      RETURNING *
    `
    return NextResponse.json(row, { status: 201 })
  } catch (err) {
    if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
      return NextResponse.json({ error: 'Ya existe un cupón con ese código' }, { status: 409 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

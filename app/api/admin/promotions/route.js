import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const sql = getDb()
    const rows = await sql`SELECT * FROM promotions ORDER BY created_at DESC`
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
  const { name, description, discount_type, discount_value, applies_to, applies_value, min_order, starts_at, ends_at } = body
  if (!name?.trim() || !['percentage', 'fixed'].includes(discount_type) || !discount_value) {
    return NextResponse.json({ error: 'Nombre, tipo y valor son requeridos' }, { status: 400 })
  }
  try {
    const sql = getDb()
    const [row] = await sql`
      INSERT INTO promotions (name, description, discount_type, discount_value, applies_to, applies_value, min_order, starts_at, ends_at)
      VALUES (
        ${name.trim()}, ${description?.trim() || null}, ${discount_type}, ${parseFloat(discount_value)},
        ${applies_to || 'all'}, ${applies_value?.trim() || null}, ${parseInt(min_order) || 0},
        ${starts_at || null}, ${ends_at || null}
      )
      RETURNING *
    `
    return NextResponse.json(row, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

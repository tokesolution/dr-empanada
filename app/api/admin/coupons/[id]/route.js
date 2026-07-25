import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function PATCH(request, { params }) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  try {
    const sql = getDb()
    const [row] = await sql`
      UPDATE coupons SET active = ${body.active} WHERE id = ${params.id} RETURNING *
    `
    if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(row)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const sql = getDb()
    await sql`DELETE FROM coupons WHERE id = ${params.id}`
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

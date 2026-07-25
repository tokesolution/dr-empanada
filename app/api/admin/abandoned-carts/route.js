import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const sql = getDb()
    const carts = await sql`SELECT * FROM abandoned_carts ORDER BY created_at DESC LIMIT 100`
    return NextResponse.json(carts)
  } catch { return NextResponse.json([]) }
}

export async function PATCH(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await request.json()
  const sql = getDb()
  await sql`UPDATE abandoned_carts SET contacted = true WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}

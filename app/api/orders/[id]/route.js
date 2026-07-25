import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { restoreStock } from '@/lib/products-server'
import { sendPreparingEmail, sendReadyEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

const VALID_STATUSES = ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado']

export async function PATCH(request, { params }) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const orderId = parseInt(id, 10)
  if (!Number.isInteger(orderId) || orderId < 1) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { status } = body
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  try {
    const sql = getDb()

    const [current] = await sql`SELECT * FROM orders WHERE id = ${orderId}`
    if (!current) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

    const [order] = await sql`
      UPDATE orders SET status = ${status} WHERE id = ${orderId} RETURNING *
    `

    if (status === 'cancelado' && current.status !== 'cancelado') {
      const items = typeof current.items === 'string' ? JSON.parse(current.items) : current.items
      await restoreStock(items)
    }

    if (status === 'preparando' && current.status !== 'preparando') {
      sendPreparingEmail(order).catch(() => {})
    }
    if (status === 'listo' && current.status !== 'listo') {
      sendReadyEmail(order).catch(() => {})
    }

    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar el pedido' }, { status: 500 })
  }
}

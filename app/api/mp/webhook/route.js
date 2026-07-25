import { MercadoPagoConfig, Payment } from 'mercadopago'
import { getDb } from '@/lib/db'
import { restoreStock } from '@/lib/products-server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (type !== 'payment' || !data?.id) {
      return NextResponse.json({ ok: true })
    }

    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
    const paymentClient = new Payment(client)
    const payment = await paymentClient.get({ id: data.id })

    const orderId = payment.external_reference
    const status = payment.status

    if (!orderId) return NextResponse.json({ ok: true })

    const sql = getDb()
    let newStatus = 'pendiente_pago'
    if (status === 'approved') newStatus = 'pendiente'
    else if (status === 'rejected') newStatus = 'cancelado'

    const [updated] = await sql`
      UPDATE orders SET status = ${newStatus}
      WHERE id = ${parseInt(orderId, 10)} AND status = 'pendiente_pago'
      RETURNING *
    `

    if (newStatus === 'cancelado' && updated) {
      const items = typeof updated.items === 'string' ? JSON.parse(updated.items) : updated.items
      await restoreStock(items)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // siempre 200 para MP
  }
}

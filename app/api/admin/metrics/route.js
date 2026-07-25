import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const sql = getDb()

    const [totals] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status NOT IN ('cancelado', 'pendiente_pago')) AS total_orders,
        COALESCE(SUM(total) FILTER (WHERE status NOT IN ('cancelado', 'pendiente_pago')), 0) AS total_revenue,
        COUNT(*) FILTER (WHERE status = 'cancelado') AS cancelled_orders,
        COALESCE(AVG(total) FILTER (WHERE status NOT IN ('cancelado', 'pendiente_pago')), 0) AS avg_order_value
      FROM orders
    `

    const [today] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status NOT IN ('cancelado', 'pendiente_pago')) AS orders,
        COALESCE(SUM(total) FILTER (WHERE status NOT IN ('cancelado', 'pendiente_pago')), 0) AS revenue
      FROM orders
      WHERE DATE(created_at AT TIME ZONE 'America/Argentina/Buenos_Aires') = CURRENT_DATE AT TIME ZONE 'America/Argentina/Buenos_Aires'
    `

    const dailyRevenue = await sql`
      SELECT
        DATE(created_at AT TIME ZONE 'America/Argentina/Buenos_Aires') AS date,
        COUNT(*) FILTER (WHERE status NOT IN ('cancelado', 'pendiente_pago')) AS orders,
        COALESCE(SUM(total) FILTER (WHERE status NOT IN ('cancelado', 'pendiente_pago')), 0) AS revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `

    const topProducts = await sql`
      SELECT
        item->>'nombre' AS nombre,
        item->>'id' AS product_id,
        SUM((item->>'qty')::int) AS total_qty,
        SUM((item->>'price')::int * (item->>'qty')::int) AS total_revenue
      FROM orders,
      jsonb_array_elements(items::jsonb) AS item
      WHERE status NOT IN ('cancelado', 'pendiente_pago')
      GROUP BY 1, 2
      ORDER BY total_qty DESC
      LIMIT 10
    `

    const paymentMethods = await sql`
      SELECT
        payment_method,
        COUNT(*) AS count,
        COALESCE(SUM(total), 0) AS revenue
      FROM orders
      WHERE status NOT IN ('cancelado', 'pendiente_pago')
      GROUP BY payment_method
    `

    const deliveryTypes = await sql`
      SELECT delivery_type, COUNT(*) AS count
      FROM orders
      WHERE status NOT IN ('cancelado', 'pendiente_pago')
      GROUP BY delivery_type
    `

    const statusDist = await sql`
      SELECT status, COUNT(*) AS count
      FROM orders
      GROUP BY status
    `

    const [weekRevenue] = await sql`
      SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
      FROM orders
      WHERE status NOT IN ('cancelado', 'pendiente_pago')
        AND created_at >= NOW() - INTERVAL '7 days'
    `

    return NextResponse.json({
      totals,
      today,
      weekRevenue,
      dailyRevenue,
      topProducts,
      paymentMethods,
      deliveryTypes,
      statusDist,
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'
import { formatPrice } from '@/lib/products'

export async function POST(request) {
  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  const { code, subtotal } = body
  if (!code?.trim() || !subtotal || subtotal <= 0) {
    return NextResponse.json({ error: 'Código o subtotal inválido' }, { status: 400 })
  }
  try {
    const sql = getDb()
    const [coupon] = await sql`
      SELECT * FROM coupons
      WHERE code = ${code.trim().toUpperCase()}
        AND active = true
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (max_uses = -1 OR uses_count < max_uses)
    `
    if (!coupon) {
      return NextResponse.json({ error: 'Cupón inválido, expirado o agotado' }, { status: 404 })
    }
    if (parseInt(subtotal) < parseInt(coupon.min_order)) {
      return NextResponse.json({
        error: `El pedido mínimo para este cupón es ${formatPrice(parseInt(coupon.min_order))}`
      }, { status: 400 })
    }
    let discount_amount
    if (coupon.discount_type === 'percentage') {
      discount_amount = Math.round(parseInt(subtotal) * parseFloat(coupon.discount_value) / 100)
    } else {
      discount_amount = Math.min(parseInt(coupon.discount_value), parseInt(subtotal))
    }
    return NextResponse.json({
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: parseFloat(coupon.discount_value),
      discount_amount,
    })
  } catch {
    return NextResponse.json({ error: 'El sistema de cupones no está disponible' }, { status: 503 })
  }
}

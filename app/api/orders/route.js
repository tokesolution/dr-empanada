import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { getProductMap, decrementStock, getBestPromotion } from '@/lib/products-server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const sql = getDb()
    const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`
    return NextResponse.json(rows)
  } catch {
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
  }
}

export async function POST(request) {
  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { customer_name, customer_phone, customer_email, customer_address, delivery_type, payment_method, notes, items, coupon_code, cooking_method } = body

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (
    !customer_name?.trim() || customer_name.length > 100 ||
    !customer_phone?.trim() || customer_phone.length > 30 ||
    !customer_email?.trim() || !emailRegex.test(customer_email) || customer_email.length > 100 ||
    !['retiro', 'delivery'].includes(delivery_type) ||
    !['efectivo', 'transferencia', 'tarjeta'].includes(payment_method) ||
    !Array.isArray(items) || items.length === 0 || items.length > 50
  ) {
    return NextResponse.json({ error: 'Datos del pedido incompletos o inválidos' }, { status: 400 })
  }

  if (delivery_type === 'delivery' && !customer_address?.trim()) {
    return NextResponse.json({ error: 'La dirección es obligatoria para delivery' }, { status: 400 })
  }

  const hasCombo = items.some(i => i.selections?.empanadas?.length > 0)
  const totalQty = items.reduce((s, i) => s + (parseInt(i.qty) || 0), 0)
  if (!hasCombo && totalQty < 3) {
    return NextResponse.json({ error: 'El pedido mínimo es de 3 productos (o incluí un combo).' }, { status: 400 })
  }

  const productMap = await getProductMap()
  let serverTotal = 0
  const validatedItems = []

  for (const item of items) {
    const product = productMap[item.id]
    if (!product || product.active === false) {
      return NextResponse.json({ error: `Producto no disponible: ${item.id}` }, { status: 400 })
    }
    const qty = parseInt(item.qty, 10)
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return NextResponse.json({ error: 'Cantidad inválida' }, { status: 400 })
    }
    if (product.stock >= 0 && product.stock < qty) {
      return NextResponse.json({
        error: `Stock insuficiente para "${product.nombre}". Disponible: ${product.stock}`
      }, { status: 400 })
    }
    serverTotal += product.price * qty
    const cm = ['horno', 'fritas'].includes(item.cooking_method) ? item.cooking_method : null
    validatedItems.push({ id: product.id, nombre: product.nombre, price: product.price, qty, cooking_method: cm, selections: item.selections || null })
  }

  // Cupón (prioridad sobre promociones automáticas)
  let discount = 0
  let finalCouponCode = null
  let finalPromoId = null

  if (coupon_code?.trim()) {
    try {
      const sql = getDb()
      const [coupon] = await sql`
        SELECT * FROM coupons
        WHERE code = ${coupon_code.trim().toUpperCase()}
          AND active = true
          AND (expires_at IS NULL OR expires_at > NOW())
          AND (max_uses = -1 OR uses_count < max_uses)
      `
      if (coupon && serverTotal >= parseInt(coupon.min_order)) {
        discount = coupon.discount_type === 'percentage'
          ? Math.round(serverTotal * parseFloat(coupon.discount_value) / 100)
          : Math.min(parseInt(coupon.discount_value), serverTotal)
        finalCouponCode = coupon.code
        // Incrementar usos del cupón
        await sql`UPDATE coupons SET uses_count = uses_count + 1 WHERE id = ${coupon.id}`
      }
    } catch { /* non-critical */ }
  } else {
    // Intentar aplicar mejor promoción automática
    const { discount: promoDiscount, promo } = await getBestPromotion(validatedItems, serverTotal)
    if (promoDiscount > 0) {
      discount = promoDiscount
      finalPromoId = promo.id
    }
  }

  const finalTotal = Math.max(0, serverTotal - discount)
  const initialStatus = payment_method === 'tarjeta' ? 'pendiente_pago' : 'pendiente'

  try {
    const sql = getDb()
    const sanitizedNotes = notes?.slice(0, 500) || null
    const sanitizedAddress = customer_address?.slice(0, 200) || null

    const sanitizedCookingMethod = ['horno', 'fritas'].includes(cooking_method) ? cooking_method : null

    const [order] = await sql`
      INSERT INTO orders (customer_name, customer_phone, customer_email, customer_address, delivery_type, payment_method, notes, items, total, discount, coupon_code, promo_id, status, cooking_method)
      VALUES (
        ${customer_name.trim()}, ${customer_phone.trim()}, ${customer_email.trim().toLowerCase()}, ${sanitizedAddress},
        ${delivery_type}, ${payment_method}, ${sanitizedNotes},
        ${JSON.stringify(validatedItems)}, ${finalTotal}, ${discount}, ${finalCouponCode}, ${finalPromoId}, ${initialStatus},
        ${sanitizedCookingMethod}
      )
      RETURNING *
    `
    await decrementStock(validatedItems)
    return NextResponse.json(order, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al registrar el pedido' }, { status: 500 })
  }
}

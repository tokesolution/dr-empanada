import { MercadoPagoConfig, Preference } from 'mercadopago'
import { getDb } from '@/lib/db'
import { getProductMap, decrementStock, getBestPromotion } from '@/lib/products-server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { customer_name, customer_phone, customer_email, customer_address, delivery_type, payment_method, notes, items, coupon_code, cooking_method } = body

  if (payment_method !== 'tarjeta') {
    return NextResponse.json({ error: 'Este endpoint es solo para pagos con tarjeta' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!customer_name?.trim() || !customer_phone?.trim() ||
      !customer_email?.trim() || !emailRegex.test(customer_email) ||
      !['retiro', 'delivery'].includes(delivery_type) ||
      !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const hasCombo = items.some(i => i.selections?.empanadas?.length > 0)
  const totalQty = items.reduce((s, i) => s + (parseInt(i.qty) || 0), 0)
  if (!hasCombo && totalQty < 3) {
    return NextResponse.json({ error: 'El pedido mínimo es de 3 productos (o incluí un combo).' }, { status: 400 })
  }

  const productMap = await getProductMap()
  let total = 0
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
    total += product.price * qty
    const cm = ['horno', 'fritas'].includes(item.cooking_method) ? item.cooking_method : null
    validatedItems.push({ id: product.id, nombre: product.nombre, price: product.price, qty, cooking_method: cm })
  }

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
      if (coupon && total >= parseInt(coupon.min_order)) {
        discount = coupon.discount_type === 'percentage'
          ? Math.round(total * parseFloat(coupon.discount_value) / 100)
          : Math.min(parseInt(coupon.discount_value), total)
        finalCouponCode = coupon.code
        await sql`UPDATE coupons SET uses_count = uses_count + 1 WHERE id = ${coupon.id}`
      }
    } catch { /* non-critical */ }
  } else {
    const { discount: promoDiscount, promo } = await getBestPromotion(validatedItems, total)
    if (promoDiscount > 0) {
      discount = promoDiscount
      finalPromoId = promo.id
    }
  }

  const finalTotal = Math.max(0, total - discount)

  const sanitizedCookingMethod = ['horno', 'fritas'].includes(cooking_method) ? cooking_method : null
  const sql = getDb()
  const [order] = await sql`
    INSERT INTO orders (customer_name, customer_phone, customer_email, customer_address, delivery_type, payment_method, notes, items, total, discount, coupon_code, promo_id, status, cooking_method)
    VALUES (
      ${customer_name.trim()}, ${customer_phone.trim()}, ${customer_email.trim().toLowerCase()}, ${customer_address?.slice(0, 200) || null},
      ${delivery_type}, 'tarjeta', ${notes?.slice(0, 500) || null},
      ${JSON.stringify(validatedItems)}, ${finalTotal}, ${discount}, ${finalCouponCode}, ${finalPromoId}, 'pendiente_pago',
      ${sanitizedCookingMethod}
    )
    RETURNING id
  `

  await decrementStock(validatedItems)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dr-empanada.vercel.app'
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN })
  const preferenceClient = new Preference(client)

  const mpItems = validatedItems.map(item => ({
    id: item.id,
    title: item.nombre,
    quantity: item.qty,
    unit_price: item.price,
    currency_id: 'ARS',
  }))

  // Aplicar descuento como ítem negativo en MP
  if (discount > 0) {
    mpItems.push({
      id: 'descuento',
      title: finalCouponCode ? `Cupón ${finalCouponCode}` : 'Descuento promocional',
      quantity: 1,
      unit_price: -discount,
      currency_id: 'ARS',
    })
  }

  const preference = await preferenceClient.create({
    body: {
      external_reference: String(order.id),
      items: mpItems,
      payer: {
        name: customer_name.trim(),
        phone: { number: customer_phone.trim() },
      },
      back_urls: {
        success: `${baseUrl}/pedir/pago-exitoso?order=${order.id}`,
        failure: `${baseUrl}/pedir/pago-fallido?order=${order.id}`,
        pending: `${baseUrl}/pedir/pago-pendiente?order=${order.id}`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/mp/webhook`,
    },
  })

  return NextResponse.json({ init_point: preference.init_point, order_id: order.id })
}

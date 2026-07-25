import { getDb } from '@/lib/db'
import { PRODUCTS } from '@/lib/products'

export async function getProductMap() {
  try {
    const sql = getDb()
    const [configs, customProducts] = await Promise.all([
      sql`SELECT * FROM products_config`,
      sql`SELECT * FROM custom_products WHERE active = true`.catch(() => []),
    ])
    const configMap = Object.fromEntries(configs.map(c => [c.id, c]))
    const result = {}
    for (const p of PRODUCTS) {
      const config = configMap[p.id]
      result[p.id] = {
        ...p,
        price: (config?.price_override != null) ? parseInt(config.price_override) : p.price,
        stock: config != null ? parseInt(config.stock) : -1,
        low_stock_threshold: config != null ? parseInt(config.low_stock_threshold) : 5,
        active: config != null ? config.active : true,
      }
    }
    for (const p of customProducts) {
      if (p.archived) continue
      result[p.id] = {
        id: p.id, nombre: p.nombre, desc: p.descripcion || p.desc || '', price: parseInt(p.price),
        category: p.category, img: p.img_url || null, emoji: p.emoji || '🫔',
        stock: parseInt(p.stock ?? -1), low_stock_threshold: parseInt(p.low_stock_threshold ?? 5),
        active: p.active,
        empanadas_count: parseInt(p.empanadas_count || 0),
        pastelitos_count: parseInt(p.pastelitos_count || 0),
      }
    }
    return result
  } catch {
    return Object.fromEntries(PRODUCTS.map(p => [p.id, { ...p, stock: -1, active: true }]))
  }
}

export async function decrementStock(items) {
  try {
    const sql = getDb()
    for (const item of items) {
      await sql`
        UPDATE products_config
        SET stock = GREATEST(stock - ${item.qty}, 0), updated_at = NOW()
        WHERE id = ${item.id} AND stock > 0
      `
    }
  } catch {
    // Non-critical: order still goes through
  }
}

export async function restoreStock(items) {
  try {
    const sql = getDb()
    for (const item of items) {
      await sql`
        UPDATE products_config
        SET stock = stock + ${item.qty}, updated_at = NOW()
        WHERE id = ${item.id} AND stock >= 0
      `
    }
  } catch {
    // Non-critical
  }
}

export async function getBestPromotion(validatedItems, total) {
  try {
    const sql = getDb()
    const now = new Date()
    const promotions = await sql`
      SELECT * FROM promotions
      WHERE active = true
        AND (starts_at IS NULL OR starts_at <= ${now})
        AND (ends_at IS NULL OR ends_at >= ${now})
        AND (min_order = 0 OR min_order <= ${total})
    `
    let best = 0
    let bestPromo = null
    for (const promo of promotions) {
      let d = 0
      if (promo.applies_to === 'all') {
        d = promo.discount_type === 'percentage'
          ? Math.round(total * parseFloat(promo.discount_value) / 100)
          : Math.min(parseInt(promo.discount_value), total)
      } else if (promo.applies_to === 'category') {
        const catTotal = validatedItems
          .filter(i => PRODUCTS.find(p => p.id === i.id)?.category === promo.applies_value)
          .reduce((s, i) => s + i.price * i.qty, 0)
        d = promo.discount_type === 'percentage'
          ? Math.round(catTotal * parseFloat(promo.discount_value) / 100)
          : Math.min(parseInt(promo.discount_value), catTotal)
      } else if (promo.applies_to === 'product') {
        const it = validatedItems.find(i => i.id === promo.applies_value)
        if (it) {
          const iTotal = it.price * it.qty
          d = promo.discount_type === 'percentage'
            ? Math.round(iTotal * parseFloat(promo.discount_value) / 100)
            : Math.min(parseInt(promo.discount_value), iTotal)
        }
      }
      if (d > best) { best = d; bestPromo = promo }
    }
    return { discount: best, promo: bestPromo }
  } catch {
    return { discount: 0, promo: null }
  }
}

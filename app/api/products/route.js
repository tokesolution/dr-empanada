import { getDb } from '@/lib/db'
import { PRODUCTS } from '@/lib/products'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const sql = getDb()
    const configs = await sql`SELECT id, stock, low_stock_threshold, active FROM products_config`
    const configMap = Object.fromEntries(configs.map(c => [c.id, c]))
    const data = PRODUCTS.map(p => ({
      id: p.id,
      stock: configMap[p.id]?.stock != null ? parseInt(configMap[p.id].stock) : -1,
      low_stock_threshold: configMap[p.id]?.low_stock_threshold != null ? parseInt(configMap[p.id].low_stock_threshold) : 5,
      active: configMap[p.id]?.active ?? true,
      archived: configMap[p.id]?.archived ?? false,
    }))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}

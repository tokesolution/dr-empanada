import { getDb } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const sql = getDb()
    const products = await sql`SELECT * FROM custom_products WHERE active = true AND (archived IS NULL OR archived = false) ORDER BY created_at ASC`
    return NextResponse.json(products)
  } catch { return NextResponse.json([]) }
}

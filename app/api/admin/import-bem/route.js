import { getDb } from '@/lib/db'
import { PRODUCTS } from '@/lib/products'
import { requireAdmin } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

function normalizeStr(s) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim().replace(/\s+/g, ' ')
}

function parseCSV(text) {
  const firstLine = text.split(/\r?\n/)[0] || ''
  const semis = (firstLine.match(/;/g) || []).length
  const commas = (firstLine.match(/,/g) || []).length
  const tabs = (firstLine.match(/\t/g) || []).length
  let sep = ','
  if (tabs >= semis && tabs >= commas) sep = '\t'
  else if (semis >= commas) sep = ';'

  const rows = []
  let cur = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === sep) { cur.push(field); field = '' }
      else if (c === '\n') { cur.push(field); rows.push(cur); cur = []; field = '' }
      else if (c === '\r') { /* skip */ }
      else field += c
    }
  }
  if (field !== '' || cur.length > 0) { cur.push(field); rows.push(cur) }

  const filtered = rows.filter(r => r.some(v => String(v).trim() !== ''))
  return { rows: filtered, separator: sep }
}

function parseNumber(s) {
  if (s == null) return null
  const t = String(s).trim().replace(/\$/g, '').replace(/\s/g, '')
  if (!t) return null
  const lastComma = t.lastIndexOf(',')
  const lastDot = t.lastIndexOf('.')
  let normalized
  if (lastComma > lastDot) normalized = t.replace(/\./g, '').replace(',', '.')
  else normalized = t.replace(/,/g, '')
  const n = parseFloat(normalized)
  return isNaN(n) ? null : n
}

function detectColumns(headers) {
  const h = headers.map(normalizeStr)
  const find = (...keys) => {
    for (const k of keys) {
      const i = h.findIndex(x => x === k)
      if (i !== -1) return i
    }
    for (const k of keys) {
      const i = h.findIndex(x => x.includes(k))
      if (i !== -1) return i
    }
    return -1
  }
  return {
    sku: find('codigo', 'cod', 'sku', 'id', 'code'),
    name: find('descripcion', 'nombre', 'producto', 'articulo', 'detalle', 'name'),
    price: find('precio venta', 'precio de venta', 'precio', 'pvp', 'price'),
    stock: find('stock', 'existencia', 'cantidad', 'qty'),
  }
}

export async function POST(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  let body
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
  const { csv, dryRun = true, updatePrice = true, updateStock = true } = body
  if (!csv || typeof csv !== 'string') {
    return NextResponse.json({ error: 'Falta el CSV' }, { status: 400 })
  }

  const { rows, separator } = parseCSV(csv)
  if (rows.length < 2) {
    return NextResponse.json({ error: 'CSV vacío o sin filas de datos' }, { status: 400 })
  }
  const headers = rows[0]
  const cols = detectColumns(headers)
  if (cols.name === -1) {
    return NextResponse.json({
      error: 'No se detectó columna de nombre/descripción del producto. Encabezados leídos: ' + headers.join(' | '),
    }, { status: 400 })
  }
  if (!updatePrice && !updateStock) {
    return NextResponse.json({ error: 'Marcá al menos precio o stock para actualizar' }, { status: 400 })
  }

  const productByName = {}
  for (const p of PRODUCTS) productByName[normalizeStr(p.nombre)] = p

  const results = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    const rawName = cols.name !== -1 ? row[cols.name] : ''
    const rawPrice = cols.price !== -1 ? row[cols.price] : ''
    const rawStock = cols.stock !== -1 ? row[cols.stock] : ''
    const rawSku = cols.sku !== -1 ? row[cols.sku] : ''
    if (!String(rawName || '').trim()) continue

    const norm = normalizeStr(rawName)
    const matched = productByName[norm]
    const priceN = updatePrice && cols.price !== -1 ? parseNumber(rawPrice) : null
    const stockN = updateStock && cols.stock !== -1 ? parseNumber(rawStock) : null

    results.push({
      row: r + 1,
      raw: { name: rawName, sku: rawSku, price: rawPrice, stock: rawStock },
      matched: matched ? { id: matched.id, nombre: matched.nombre, basePrice: matched.price } : null,
      newPrice: priceN != null ? Math.round(priceN) : null,
      newStock: stockN != null ? Math.round(stockN) : null,
    })
  }

  const matched = results.filter(r => r.matched)
  const summary = {
    totalRows: results.length,
    matched: matched.length,
    unmatched: results.length - matched.length,
    detectedColumns: {
      separator,
      sku: cols.sku !== -1 ? headers[cols.sku] : null,
      name: cols.name !== -1 ? headers[cols.name] : null,
      price: cols.price !== -1 ? headers[cols.price] : null,
      stock: cols.stock !== -1 ? headers[cols.stock] : null,
    },
  }

  if (dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, summary, results })
  }

  const sql = getDb()
  let updated = 0
  for (const r of matched) {
    const setPrice = updatePrice && r.newPrice != null
    const setStock = updateStock && r.newStock != null
    if (!setPrice && !setStock) continue

    const existing = await sql`SELECT id FROM products_config WHERE id = ${r.matched.id}`
    if (existing.length > 0) {
      if (setPrice && setStock) {
        await sql`UPDATE products_config SET price_override = ${r.newPrice}, stock = ${r.newStock}, updated_at = NOW() WHERE id = ${r.matched.id}`
      } else if (setPrice) {
        await sql`UPDATE products_config SET price_override = ${r.newPrice}, updated_at = NOW() WHERE id = ${r.matched.id}`
      } else {
        await sql`UPDATE products_config SET stock = ${r.newStock}, updated_at = NOW() WHERE id = ${r.matched.id}`
      }
    } else {
      await sql`
        INSERT INTO products_config (id, price_override, stock, low_stock_threshold, active, updated_at)
        VALUES (${r.matched.id}, ${setPrice ? r.newPrice : null}, ${setStock ? r.newStock : -1}, 5, true, NOW())
      `
    }
    updated++
  }

  return NextResponse.json({ ok: true, dryRun: false, summary, updated })
}

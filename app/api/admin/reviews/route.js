import { getDb } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

const SEED_REVIEWS = [
  { autor: 'Daniel Gómez', rating: 5, fecha: 'Hace 2 meses', visible: true, texto: 'La verdad, son super recomendables... Había probado las hechas al horno y hoy probé las fritas... son un manjar. El relleno es más que abundante y muy jugosas. Además los pastelitos ni que decirles. La atención de Matias un 10 !!' },
  { autor: 'Franco Mantegazza', rating: 5, fecha: 'Hace 5 meses', visible: true, texto: 'Las mejores empanadas souffle del barrio, sin duda voy a volver a pedir. Muy ricos pastelitos también!! 10/10' },
  { autor: 'Matias Medina', rating: 5, fecha: 'Hace 2 meses', visible: true, texto: 'Excelente lugar en el barrio de devoto para pedir unas ricas empanadas. Fritas o al horno, son una bomba.' },
  { autor: 'ruso boedo', rating: 5, fecha: 'Hace 2 meses', visible: true, texto: 'Las mejores empanadas y postres. Si están buscando sabor, buena calidad de productos, no duden en pedir acá, riquísimo todo!' },
  { autor: 'Julián Bellandi', rating: 5, fecha: 'Hace 3 meses', visible: true, texto: 'Excelente, rápido y rico. Vale destacar sus rellenos potentes y la buena atención!!!' },
  { autor: 'Lucas Ramallo', rating: 2, fecha: 'Hace un año', visible: false, texto: 'Con toda la buena onda, no podes venderme la moto diciendo que pesa 160gr las XL y cuando la pesé apenas alcanzó 120gr. Muy bien logrados los sabores, pero me estas cobrando por producto que no se entrega.' },
  { autor: 'Sebastian Otero', rating: 1, fecha: 'Hace 4 años', visible: false, texto: 'A pesar de sacarlas del horno y verlas así, te las mandan igual. Sabor a quemado y se ven claramente quemadas. La atención al cliente las manda igual.' },
]

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      autor TEXT NOT NULL,
      texto TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      fecha TEXT,
      visible BOOLEAN DEFAULT true
    )
  `
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM reviews`
  if (count === 0) {
    for (const r of SEED_REVIEWS) {
      await sql`INSERT INTO reviews (autor, texto, rating, fecha, visible) VALUES (${r.autor}, ${r.texto}, ${r.rating}, ${r.fecha}, ${r.visible})`
    }
  }
}

export async function GET(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const sql = getDb()
  await ensureTable(sql)
  const reviews = await sql`SELECT * FROM reviews ORDER BY id ASC`
  return NextResponse.json(reviews)
}

export async function POST(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { autor, texto, rating, fecha } = await request.json()
  if (!autor?.trim() || !texto?.trim()) return NextResponse.json({ error: 'Autor y texto son requeridos' }, { status: 400 })
  const sql = getDb()
  await ensureTable(sql)
  const [review] = await sql`
    INSERT INTO reviews (autor, texto, rating, fecha)
    VALUES (${autor.trim()}, ${texto.trim()}, ${parseInt(rating) || 5}, ${fecha?.trim() || null})
    RETURNING *
  `
  return NextResponse.json(review)
}

export async function PATCH(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id, visible } = await request.json()
  const sql = getDb()
  const [review] = await sql`UPDATE reviews SET visible = ${visible} WHERE id = ${id} RETURNING *`
  return NextResponse.json(review)
}

export async function DELETE(request) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await request.json()
  const sql = getDb()
  await sql`DELETE FROM reviews WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}

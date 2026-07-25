import { generateAdminToken } from '@/lib/admin-auth'
import { NextResponse } from 'next/server'

let attempts = new Map() // IP → { count, resetAt }

function isRateLimited(ip) {
  const now = Date.now()
  const entry = attempts.get(ip) || { count: 0, resetAt: now + 60_000 }
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + 60_000 }
  entry.count++
  attempts.set(ip, entry)
  return entry.count > 10 // máx 10 intentos por minuto
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Demasiados intentos. Intentá en un minuto.' }, { status: 429 })
  }

  const { password } = await request.json()

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  return NextResponse.json({ token: generateAdminToken() })
}

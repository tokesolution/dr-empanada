import { sendContactEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const { nombre, email, mensaje } = await request.json()
  if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
    return NextResponse.json({ error: 'Campos incompletos' }, { status: 400 })
  }
  await sendContactEmail(nombre, email, mensaje)
  return NextResponse.json({ ok: true })
}

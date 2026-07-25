import { createHmac, timingSafeEqual } from 'crypto'

// Token = HMAC-SHA256(password, secret) — se valida server-side, nunca viaja la contraseña
export function generateAdminToken() {
  return createHmac('sha256', process.env.ADMIN_SECRET)
    .update(process.env.ADMIN_PASSWORD)
    .digest('hex')
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false
  try {
    const expected = generateAdminToken()
    if (token.length !== expected.length) return false
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}

export function getTokenFromRequest(request) {
  return request.headers.get('x-admin-token') || ''
}

export function requireAdmin(request) {
  return verifyAdminToken(getTokenFromRequest(request))
}

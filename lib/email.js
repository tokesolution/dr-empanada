import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.EMAIL_FROM || 'Dr. Empanada <onboarding@resend.dev>'

function template(content) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dr. Empanada</title>
</head>
<body style="margin:0;padding:20px;background:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;background:#111;border-radius:16px;overflow:hidden;border:1px solid #222;">
    <div style="background:linear-gradient(135deg,#ff6600,#cc3300);padding:28px 30px;text-align:center;">
      <p style="margin:0;font-size:36px;">🫔</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">Dr. Empanada</h1>
    </div>
    <div style="padding:30px;">
      ${content}
    </div>
    <div style="background:#0d0d0d;padding:18px 30px;text-align:center;border-top:1px solid #1a1a1a;">
      <p style="margin:0;color:#555;font-size:12px;">Dr. Empanada · Buenos Aires, Argentina</p>
    </div>
  </div>
</body>
</html>`
}

function itemsHtml(order) {
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
  const rows = items.map(i => {
    const cooking = i.cooking_method === 'fritas' ? ' 🔥 Fritas' : i.cooking_method === 'horno' ? ' ♨️ Al horno' : ''
    return `<tr>
      <td style="color:#ccc;padding:4px 0;">${i.qty}× ${i.nombre}${cooking}</td>
    </tr>`
  }).join('')
  return `<table style="width:100%;border-collapse:collapse;margin:12px 0 20px;">${rows}</table>`
}

export async function sendPreparingEmail(order) {
  if (!resend || !order.customer_email) return
  try {
    await resend.emails.send({
      from: FROM,
      to: order.customer_email,
      subject: '¡Tu pedido se está preparando! 🫔',
      html: template(`
        <h2 style="color:#ff6600;margin:0 0 12px;">¡Hola, ${order.customer_name}!</h2>
        <p style="color:#ccc;line-height:1.6;margin:0 0 20px;">Tu pedido ya está en manos de nuestro equipo y se está preparando con todo el cariño del doctor.</p>
        <div style="background:#1e2f4a;border:1px solid #3b82f6;border-radius:12px;padding:14px 20px;margin:0 0 20px;display:inline-block;">
          <span style="color:#60a5fa;font-weight:bold;font-size:15px;">🔵 Preparando tu pedido...</span>
        </div>
        ${itemsHtml(order)}
        <p style="color:#ccc;margin:0 0 8px;"><strong style="color:#f5f0e8;">Total:</strong> $${parseInt(order.total).toLocaleString('es-AR')}</p>
        <p style="color:#666;font-size:13px;margin:20px 0 0;">Te avisaremos cuando esté listo. ¡Gracias por elegirnos!</p>
      `),
    })
  } catch { /* non-critical */ }
}

export async function sendContactEmail(nombre, email, mensaje) {
  if (!resend) return
  const to = process.env.EMAIL_TO || FROM
  try {
    await resend.emails.send({
      from: FROM,
      to,
      replyTo: email,
      subject: `Consulta de ${nombre} — Dr. Empanada`,
      html: template(`
        <h2 style="color:#ff6600;margin:0 0 12px;">Nueva consulta desde el sitio</h2>
        <p style="color:#ccc;margin:0 0 8px;"><strong style="color:#f5f0e8;">Nombre:</strong> ${nombre}</p>
        <p style="color:#ccc;margin:0 0 8px;"><strong style="color:#f5f0e8;">Email:</strong> ${email}</p>
        <p style="color:#ccc;margin:0 0 8px;"><strong style="color:#f5f0e8;">Mensaje:</strong></p>
        <p style="color:#ccc;line-height:1.6;background:#1a1a1a;border-radius:8px;padding:12px 16px;">${mensaje.replace(/\n/g, '<br>')}</p>
      `),
    })
  } catch { /* non-critical */ }
}

export async function sendReadyEmail(order) {
  if (!resend || !order.customer_email) return
  const isDelivery = order.delivery_type === 'delivery'
  try {
    await resend.emails.send({
      from: FROM,
      to: order.customer_email,
      subject: isDelivery ? '¡Tu pedido está en camino! 🛵' : '¡Tu pedido está listo para retirar! 🏪',
      html: template(`
        <h2 style="color:#ff6600;margin:0 0 12px;">¡Hola, ${order.customer_name}!</h2>
        ${isDelivery ? `
          <p style="color:#ccc;line-height:1.6;margin:0 0 20px;">¡Tu pedido está listo y ya está en camino hacia tu dirección!</p>
          <div style="background:#064e3b;border:1px solid #10b981;border-radius:12px;padding:14px 20px;margin:0 0 20px;display:inline-block;">
            <span style="color:#34d399;font-weight:bold;font-size:15px;">🛵 ¡En camino!</span>
          </div>
          ${order.customer_address ? `<p style="color:#ccc;margin:0 0 12px;"><strong style="color:#f5f0e8;">Dirección:</strong> ${order.customer_address}</p>` : ''}
        ` : `
          <p style="color:#ccc;line-height:1.6;margin:0 0 20px;">¡Tu pedido está listo! Podés pasar a retirarlo por el local cuando quieras.</p>
          <div style="background:#064e3b;border:1px solid #10b981;border-radius:12px;padding:14px 20px;margin:0 0 20px;display:inline-block;">
            <span style="color:#34d399;font-weight:bold;font-size:15px;">🏪 Listo para retirar</span>
          </div>
        `}
        ${itemsHtml(order)}
        <p style="color:#ccc;margin:0 0 8px;"><strong style="color:#f5f0e8;">Total:</strong> $${parseInt(order.total).toLocaleString('es-AR')}</p>
        <p style="color:#666;font-size:13px;margin:20px 0 0;">¡Gracias por elegirnos! Esperamos verte pronto. 🫔</p>
      `),
    })
  } catch { /* non-critical */ }
}

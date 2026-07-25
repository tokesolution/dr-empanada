'use client'
import { useState } from 'react'
import { formatPrice } from '@/lib/products'

const COOKING_LABEL = { horno: '♨️ Al horno', fritas: '🔥 Fritas' }

export default function CheckoutForm({ cart, onBack, onSuccess, onFormChange }) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    delivery_type: 'retiro',
    payment_method: 'efectivo',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  const discount = appliedCoupon?.discount_amount ?? 0
  const total = Math.max(0, subtotal - discount)

  const set = (k, v) => {
    const next = { ...form, [k]: v }
    setForm(next)
    onFormChange?.(next)
  }

  async function validateCoupon() {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    setAppliedCoupon(null)
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      })
      const data = await res.json()
      if (!res.ok) { setCouponError(data.error); return }
      setAppliedCoupon(data)
    } catch {
      setCouponError('Error al validar el cupón')
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.delivery_type === 'delivery' && !form.customer_address.trim()) {
      setError('Ingresá la dirección para el delivery.')
      return
    }
    setLoading(true)
    setError('')

    const items = cart.map(i => ({ id: i.id, qty: i.qty, cooking_method: i.cooking_method || null, selections: i.selections || null }))
    const payload = { ...form, items, coupon_code: appliedCoupon?.code || null }

    try {
      if (form.payment_method === 'tarjeta') {
        const res = await fetch('/api/mp/preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al iniciar el pago')
        window.location.href = data.init_point
      } else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al enviar el pedido')
        onSuccess(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-black border border-gray-700 focus:border-orange-500 text-cream rounded-xl px-4 py-3 outline-none transition-colors placeholder-gray-600'

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={onBack} className="text-orange-500 hover:text-orange-400 mb-6 flex items-center gap-2 font-medium">
        ← Volver al menú
      </button>
      <h2 className="text-3xl font-extrabold text-cream mb-2">Tu pedido</h2>
      <p className="text-gray-400 mb-8">Completá tus datos para confirmar</p>

      {/* Resumen */}
      <div className="bg-black border border-gray-800 rounded-2xl p-5 mb-6 space-y-2">
        {cart.map(i => (
          <div key={i.key} className="flex justify-between text-sm">
            <span className="text-gray-300">
              {i.qty}× {i.nombre}
              {i.cooking_method && (
                <span className="text-gray-500 ml-1.5">{COOKING_LABEL[i.cooking_method]}</span>
              )}
            </span>
            <span className="text-orange-400">{formatPrice(i.price * i.qty)}</span>
          </div>
        ))}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-400 border-t border-gray-800 pt-2">
            <span>Descuento {appliedCoupon?.code ? `(${appliedCoupon.code})` : ''}</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="border-t border-gray-800 pt-2 flex justify-between font-bold">
          <span className="text-cream">Total</span>
          <span className="text-orange-500 text-lg">{formatPrice(total)}</span>
        </div>

        {/* Cupón */}
        <div className="pt-2">
          {!appliedCoupon ? (
            <div>
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), validateCoupon())}
                  placeholder="Código de cupón"
                  maxLength={50}
                  className="flex-1 bg-[#111] border border-gray-700 focus:border-orange-500 text-cream rounded-xl px-3 py-2 outline-none transition-colors placeholder-gray-600 text-sm"
                />
                <button
                  type="button"
                  onClick={validateCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="bg-orange-500/20 border border-orange-600 text-orange-400 hover:bg-orange-500/30 px-4 rounded-xl text-sm font-semibold disabled:opacity-40 transition-colors"
                >
                  {couponLoading ? '...' : 'Aplicar'}
                </button>
              </div>
              {couponError && <p className="text-red-400 text-xs mt-1.5">{couponError}</p>}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-green-900/20 border border-green-800 rounded-xl px-3 py-2">
              <div>
                <span className="text-green-400 text-sm font-semibold">✓ {appliedCoupon.code}</span>
                {appliedCoupon.description && (
                  <p className="text-green-500/70 text-xs">{appliedCoupon.description}</p>
                )}
              </div>
              <button type="button" onClick={removeCoupon} className="text-gray-500 hover:text-red-400 text-xs ml-3">✕</button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Nombre y apellido *</label>
          <input required value={form.customer_name} onChange={e => set('customer_name', e.target.value)}
            maxLength={100} placeholder="Juan García" className={inputCls} />
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Teléfono / WhatsApp *</label>
          <input required value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)}
            maxLength={30} placeholder="11 1234-5678" className={inputCls} />
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-1 block">Email *</label>
          <input required type="email" value={form.customer_email} onChange={e => set('customer_email', e.target.value)}
            maxLength={100} placeholder="juan@ejemplo.com" className={inputCls} />
          <p className="text-gray-600 text-xs mt-1 pl-1">Te avisamos cuando tu pedido esté listo.</p>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">¿Cómo querés recibirlo? *</label>
          <div className="grid grid-cols-2 gap-3">
            {[['retiro', '🏪 Retiro en local'], ['delivery', '🛵 Delivery']].map(([v, lbl]) => (
              <button key={v} type="button" onClick={() => set('delivery_type', v)}
                className={`py-3 rounded-xl border font-semibold text-sm transition-all ${
                  form.delivery_type === v
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {form.delivery_type === 'delivery' && (
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Dirección de entrega *</label>
            <input required value={form.customer_address} onChange={e => set('customer_address', e.target.value)}
              maxLength={200} placeholder="Av. Rivadavia 1234, Villa Devoto" className={inputCls} />
          </div>
        )}

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Método de pago *</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ['efectivo', '💵', 'Efectivo'],
              ['transferencia', '📲', 'Transferencia'],
              ['tarjeta', '💳', 'Tarjeta'],
            ].map(([v, icon, lbl]) => (
              <button key={v} type="button" onClick={() => set('payment_method', v)}
                className={`py-3 px-2 rounded-xl border font-semibold text-sm transition-all flex flex-col items-center gap-1 ${
                  form.payment_method === v
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}>
                <span className="text-xl">{icon}</span>
                <span>{lbl}</span>
              </button>
            ))}
          </div>
          {form.payment_method === 'tarjeta' && (
            <p className="text-gray-500 text-xs mt-2 pl-1">
              Serás redirigido a Mercado Pago para completar el pago con tarjeta de crédito o débito.
            </p>
          )}
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-1 block">Aclaraciones (opcional)</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Sin picante, con extra salsa..." rows={3} maxLength={500}
            className={inputCls + ' resize-none'} />
        </div>

        {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-black font-extrabold py-4 rounded-full text-lg transition-all hover:scale-105">
          {loading
            ? (form.payment_method === 'tarjeta' ? 'Iniciando pago...' : 'Enviando...')
            : form.payment_method === 'tarjeta'
              ? `💳 Pagar con tarjeta · ${formatPrice(total)}`
              : `Confirmar pedido · ${formatPrice(total)}`}
        </button>
      </form>
    </div>
  )
}

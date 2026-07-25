'use client'
import Image from 'next/image'
import { formatPrice } from '@/lib/products'

const COOKING_LABEL = { horno: '♨️ Al horno', fritas: '🔥 Fritas' }

function ComboDetail({ selections }) {
  if (!selections) return null
  const { empanadas = [], pastelitos = [] } = selections
  const byMethod = {}
  empanadas.forEach(({ nombre, qty, cooking }) => {
    const key = cooking === 'horno' ? '♨️' : '🔥'
    if (!byMethod[key]) byMethod[key] = []
    byMethod[key].push(`${qty > 1 ? `${qty}× ` : ''}${nombre}`)
  })
  return (
    <div className="mt-1 space-y-0.5">
      {Object.entries(byMethod).map(([icon, items]) => (
        <p key={icon} className="text-gray-500 text-xs leading-snug">{icon} {items.join(', ')}</p>
      ))}
      {pastelitos.length > 0 && (
        <p className="text-gray-500 text-xs leading-snug">
          🍬 {pastelitos.map(p => `${p.qty > 1 ? `${p.qty}× ` : ''}${p.nombre}`).join(', ')}
        </p>
      )}
    </div>
  )
}

export default function CartDrawer({ cart, onAdd, onRemove, onClose, onCheckout }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)
  const hasCombo = cart.some(i => i.selections != null)
  const meetsMinimum = hasCombo || count >= 3
  const missing = 3 - count

  return (
    <div className="fixed inset-0 z-[52] flex justify-end">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#111] flex flex-col h-full shadow-2xl border-l border-orange-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-cream">
            Tu pedido <span className="text-orange-500">({count})</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-cream text-2xl leading-none">&times;</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center mt-16">Tu carrito está vacío</p>
          ) : cart.map(item => (
            <div key={item.key} className="flex items-start gap-3 bg-black rounded-xl p-3 border border-gray-800">
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-900 flex items-center justify-center mt-0.5">
                {item.img
                  ? <Image src={item.img} alt={item.nombre} width={56} height={56} className="object-cover w-full h-full" />
                  : <span className="text-2xl">{item.emoji}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-cream text-sm font-semibold">{item.nombre}</p>
                {item.cooking_method && (
                  <p className="text-gray-500 text-xs mt-0.5">{COOKING_LABEL[item.cooking_method]}</p>
                )}
                {item.selections && <ComboDetail selections={item.selections} />}
                <p className="text-orange-500 text-sm font-bold mt-1">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onRemove(item.key)}
                  className="w-7 h-7 rounded-full border border-gray-600 text-gray-300 hover:border-orange-500 hover:text-orange-500 font-bold text-sm flex items-center justify-center"
                >−</button>
                <span className="text-cream font-bold w-5 text-center">{item.qty}</span>
                <button
                  onClick={() => onAdd(item)}
                  className="w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-600 text-black font-bold text-sm flex items-center justify-center"
                >+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-800 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-cream">Total</span>
              <span className="text-orange-500">{formatPrice(total)}</span>
            </div>
            {!meetsMinimum && (
              <p className="text-center text-orange-400 text-sm">
                Mínimo 3 productos · falta{missing === 1 ? '' : 'n'} {missing}
              </p>
            )}
            <button
              onClick={onCheckout}
              disabled={!meetsMinimum}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold py-4 rounded-full text-lg transition-all hover:scale-105"
            >
              Confirmar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

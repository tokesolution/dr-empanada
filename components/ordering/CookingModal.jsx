'use client'
import { formatPrice } from '@/lib/products'

export default function CookingModal({ product, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-[52] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-[#111] rounded-t-3xl sm:rounded-2xl border border-gray-800 p-6 shadow-2xl">
        <h3 className="text-cream font-extrabold text-lg mb-1">{product.nombre}</h3>
        <p className="text-gray-500 text-sm mb-6">{formatPrice(product.price)} · ¿Cómo la querés?</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onSelect('horno')}
            className="flex flex-col items-center gap-3 bg-[#0d0d0d] hover:bg-orange-500/10 hover:border-orange-500 border border-gray-700 rounded-2xl py-6 transition-all"
          >
            <span className="text-4xl">♨️</span>
            <span className="text-cream font-bold text-sm">Al horno</span>
          </button>
          <button
            onClick={() => onSelect('fritas')}
            className="flex flex-col items-center gap-3 bg-[#0d0d0d] hover:bg-orange-500/10 hover:border-orange-500 border border-gray-700 rounded-2xl py-6 transition-all"
          >
            <span className="text-4xl">🔥</span>
            <span className="text-cream font-bold text-sm">Fritas</span>
          </button>
        </div>
      </div>
    </div>
  )
}

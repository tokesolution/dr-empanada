'use client'
import { useState } from 'react'
import { PRODUCTS, formatPrice } from '@/lib/products'
import { COMBO_CONFIG } from '@/lib/combos'

const CLASICAS = PRODUCTS.filter(p => p.category === 'Clásicas')
const PASTELITOS = PRODUCTS.filter(p => p.category === 'Pastelitos y Postres')

export default function ComboModal({ combo, onConfirm, onClose }) {
  const config = COMBO_CONFIG[combo.id] || {
    empanadas: parseInt(combo.empanadas_count || 0),
    pastelitos: parseInt(combo.pastelitos_count || 0),
  }
  const [emp, setEmp] = useState({})
  const [past, setPast] = useState({})

  const totalEmp = Object.values(emp).reduce((s, v) => s + (v.horno || 0) + (v.fritas || 0), 0)
  const totalPast = Object.values(past).reduce((s, v) => s + v, 0)
  const isComplete = totalEmp === config.empanadas && totalPast === config.pastelitos

  function adjustEmp(id, method, delta) {
    if (delta > 0 && totalEmp >= config.empanadas) return
    setEmp(prev => {
      const cur = prev[id] || { horno: 0, fritas: 0 }
      return { ...prev, [id]: { ...cur, [method]: Math.max(0, (cur[method] || 0) + delta) } }
    })
  }

  function adjustPast(id, delta) {
    if (delta > 0 && totalPast >= config.pastelitos) return
    setPast(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }))
  }

  function handleConfirm() {
    const empSelections = []
    Object.entries(emp).forEach(([id, { horno, fritas }]) => {
      const p = CLASICAS.find(x => x.id === id)
      if (horno > 0) empSelections.push({ id, nombre: p.nombre, qty: horno, cooking: 'horno' })
      if (fritas > 0) empSelections.push({ id, nombre: p.nombre, qty: fritas, cooking: 'fritas' })
    })
    const pastSelections = []
    Object.entries(past).forEach(([id, qty]) => {
      const p = PASTELITOS.find(x => x.id === id)
      if (qty > 0) pastSelections.push({ id, nombre: p.nombre, qty })
    })
    onConfirm({ empanadas: empSelections, pastelitos: pastSelections })
  }

  const remaining = config.empanadas - totalEmp
  const remainingPast = config.pastelitos - totalPast

  return (
    <div className="fixed inset-0 z-[52] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-[#111] rounded-t-3xl sm:rounded-2xl flex flex-col max-h-[92vh] border border-gray-800 shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-cream font-extrabold text-lg leading-tight">{combo.nombre}</h2>
            <p className="text-orange-500 font-bold mt-0.5">{formatPrice(combo.price)}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-cream text-2xl leading-none ml-4 mt-0.5">&times;</button>
        </div>

        {/* Progress */}
        <div className="px-5 py-3 border-b border-gray-800 flex-shrink-0">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Empanadas</span>
                <span className={remaining === 0 ? 'text-green-400 font-semibold' : 'text-orange-400'}>
                  {totalEmp}/{config.empanadas}
                </span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${(totalEmp / config.empanadas) * 100}%` }} />
              </div>
            </div>
            {config.pastelitos > 0 && (
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Pastelitos</span>
                  <span className={remainingPast === 0 ? 'text-green-400 font-semibold' : 'text-orange-400'}>
                    {totalPast}/{config.pastelitos}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${config.pastelitos > 0 ? (totalPast / config.pastelitos) * 100 : 0}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

          {/* Empanadas */}
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Elegí tus {config.empanadas} empanadas
            </p>
            <div className="space-y-2">
              {CLASICAS.map(p => {
                const h = emp[p.id]?.horno || 0
                const f = emp[p.id]?.fritas || 0
                if (h === 0 && f === 0 && totalEmp >= config.empanadas) return (
                  <div key={p.id} className="flex items-center justify-between py-2 opacity-40">
                    <span className="text-cream text-sm">{p.nombre}</span>
                    <span className="text-gray-600 text-xs">sin cupo</span>
                  </div>
                )
                return (
                  <div key={p.id} className="bg-black rounded-xl px-3 py-2.5 border border-gray-800">
                    <p className="text-cream text-sm font-semibold mb-2">{p.nombre}</p>
                    <div className="flex gap-3">
                      {[['horno', '♨️', h], ['fritas', '🔥', f]].map(([method, icon, qty]) => (
                        <div key={method} className="flex items-center gap-1.5 flex-1">
                          <span className="text-xs text-gray-500 w-14">{icon} {method === 'horno' ? 'Horno' : 'Fritas'}</span>
                          <button
                            onClick={() => adjustEmp(p.id, method, -1)}
                            disabled={qty === 0}
                            className="w-6 h-6 rounded-full border border-gray-700 hover:border-orange-500 text-gray-400 hover:text-orange-500 flex items-center justify-center text-sm font-bold disabled:opacity-30 transition-colors"
                          >−</button>
                          <span className="w-5 text-center text-cream font-bold text-sm">{qty}</span>
                          <button
                            onClick={() => adjustEmp(p.id, method, 1)}
                            disabled={totalEmp >= config.empanadas}
                            className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 text-black flex items-center justify-center text-sm font-bold disabled:opacity-30 transition-colors"
                          >+</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pastelitos */}
          {config.pastelitos > 0 && (
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Elegí tus {config.pastelitos} pastelitos
              </p>
              <div className="space-y-2">
                {PASTELITOS.map(p => {
                  const qty = past[p.id] || 0
                  return (
                    <div key={p.id} className={`bg-black rounded-xl px-3 py-2.5 border border-gray-800 flex items-center justify-between ${qty === 0 && totalPast >= config.pastelitos ? 'opacity-40' : ''}`}>
                      <span className="text-cream text-sm">{p.nombre}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustPast(p.id, -1)}
                          disabled={qty === 0}
                          className="w-7 h-7 rounded-full border border-gray-700 hover:border-orange-500 text-gray-400 hover:text-orange-500 flex items-center justify-center font-bold text-sm disabled:opacity-30 transition-colors"
                        >−</button>
                        <span className="w-5 text-center text-cream font-bold text-sm">{qty}</span>
                        <button
                          onClick={() => adjustPast(p.id, 1)}
                          disabled={totalPast >= config.pastelitos}
                          className="w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-600 text-black flex items-center justify-center font-bold text-sm disabled:opacity-30 transition-colors"
                        >+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-800 flex-shrink-0">
          <button
            onClick={handleConfirm}
            disabled={!isComplete}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold py-3.5 rounded-full text-base transition-all"
          >
            {isComplete
              ? `Agregar al carrito · ${formatPrice(combo.price)}`
              : `Faltan ${remaining > 0 ? `${remaining} empanada${remaining !== 1 ? 's' : ''}` : `${remainingPast} pastelito${remainingPast !== 1 ? 's' : ''}`}`}
          </button>
        </div>
      </div>
    </div>
  )
}

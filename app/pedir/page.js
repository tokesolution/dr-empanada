'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import Image from 'next/image'
import { PRODUCTS, CATEGORIES, formatPrice } from '@/lib/products'
import { COMBO_CONFIG } from '@/lib/combos'
import { useCart } from '@/lib/cart-context'
import CartDrawer from '@/components/ordering/CartDrawer'
import CheckoutForm from '@/components/ordering/CheckoutForm'
import ComboModal from '@/components/ordering/ComboModal'
import CookingModal from '@/components/ordering/CookingModal'

const COOKING_CATS = ['Clásicas', 'Especiales']
const TRENDING_IDS = ['carne-suave', 'carne-cuchillo', 'cheeseburger', 'pollo', 'roque-jamon', 'humita', 'vacio-provo']

function cartKey(productId, cookingMethod) {
  return cookingMethod ? `${productId}_${cookingMethod}` : productId
}

export default function PedirPage() {
  const { cart, addToCart, addComboToCart, removeFromCart, clearCart, cartOpen, setCartOpen } = useCart()
  const [step, setStep] = useState('menu')
  const [order, setOrder] = useState(null)
  const [productConfigs, setProductConfigs] = useState({})
  const [customProducts, setCustomProducts] = useState([])
  const [comboModal, setComboModal] = useState(null)
  const [cookingModal, setCookingModal] = useState(null)
  const [showExitModal, setShowExitModal] = useState(false)
  const [cartBounce, setCartBounce] = useState(false)
  const exitShown = useRef(false)
  const checkoutDataRef = useRef({})
  const prevCartCount = useRef(0)

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setCartBounce(true)
      const t = setTimeout(() => setCartBounce(false), 500)
      prevCartCount.current = cartCount
      return () => clearTimeout(t)
    }
    prevCartCount.current = cartCount
  }, [cartCount])

  // Fetch product configs and custom products
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const map = {}
        data.forEach(p => { map[p.id] = p })
        setProductConfigs(map)
      }).catch(() => {})
    fetch('/api/custom-products')
      .then(r => r.ok ? r.json() : [])
      .then(setCustomProducts)
      .catch(() => {})
  }, [])

  // Exit intent — only when cart has items and user is on menu step
  useEffect(() => {
    if (cartCount === 0 || step !== 'menu') return

    function handleMouseLeave(e) {
      if (e.clientY <= 5 && !exitShown.current) {
        exitShown.current = true
        setShowExitModal(true)
      }
    }
    function handleBeforeUnload(e) {
      e.preventDefault()
      e.returnValue = ''
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [cartCount, step])

  function handleAbandon() {
    const d = checkoutDataRef.current
    if (d.customer_phone || d.customer_name) {
      navigator.sendBeacon('/api/abandoned-cart', JSON.stringify({
        customer_name: d.customer_name || null,
        customer_phone: d.customer_phone || null,
        customer_email: d.customer_email || null,
        cart_items: cart,
        cart_total: cartTotal,
      }))
    }
    setShowExitModal(false)
  }

  // All products (static + custom) merged per category
  const filteredByCategory = useMemo(() => {
    const result = {}
    CATEGORIES.forEach(cat => {
      const staticFiltered = PRODUCTS.filter(p => {
        if (p.category !== cat) return false
        const cfg = productConfigs[p.id]
        if (!cfg) return true
        return cfg.active !== false && cfg.stock !== 0 && !cfg.archived
      })
      const customFiltered = customProducts
        .filter(p => p.category === cat && p.active !== false && p.stock !== 0 && !p.archived)
        .map(p => ({ ...p, img: p.img_url || null, desc: p.descripcion || p.desc || '' }))
      result[cat] = [...staticFiltered, ...customFiltered]
    })
    return result
  }, [productConfigs, customProducts])

  function catId(cat) { return `cat-${CATEGORIES.indexOf(cat)}` }
  const [activeCategory, setActiveCategory] = useState('Combos')

  function handleTabClick(cat) {
    setActiveCategory(cat)
    document.getElementById(catId(cat))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const observers = CATEGORIES.map(cat => {
      const el = document.getElementById(catId(cat))
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveCategory(cat) },
        { rootMargin: '-130px 0px -55% 0px', threshold: 0 }
      )
      obs.observe(el)
      return obs
    }).filter(Boolean)
    return () => observers.forEach(o => o.disconnect())
  }, [filteredByCategory])

  function getQty(key) { return cart.find(i => i.key === key)?.qty || 0 }

  function isLowStock(productId) {
    const cfg = productConfigs[productId]
    if (!cfg || cfg.stock < 0) return false
    return cfg.stock > 0 && cfg.stock <= (cfg.low_stock_threshold ?? 5)
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-4xl font-extrabold text-cream mb-3">¡Pedido recibido!</h1>
          <p className="text-gray-400 text-lg mb-2">
            Hola <span className="text-orange-400 font-semibold">{order?.customer_name}</span>, tu pedido fue registrado.
          </p>
          <p className="text-gray-500 mb-2">Te avisamos al <span className="text-cream">{order?.customer_email}</span> cuando esté listo.</p>
          <p className="text-orange-500 font-bold text-xl mb-10">Total: {formatPrice(order?.total)}</p>
          <button
            onClick={() => { clearCart(); setStep('menu') }}
            className="bg-orange-500 hover:bg-orange-600 text-black font-extrabold py-4 px-10 rounded-full text-lg transition-all hover:scale-105"
          >
            Hacer otro pedido
          </button>
        </div>
      </div>
    )
  }

  if (step === 'checkout') {
    return (
      <div className="min-h-screen bg-black py-24 px-4">
        <CheckoutForm
          cart={cart}
          onFormChange={data => { checkoutDataRef.current = data }}
          onBack={() => setStep('menu')}
          onSuccess={data => { setOrder(data); setStep('success') }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Backdrop que cubre el gap entre navbar y sticky bar */}
      <div className="fixed top-20 left-0 right-0 h-[60px] bg-black z-[49]" />
      {/* Header */}
      <div className="bg-[radial-gradient(ellipse_at_top,_rgba(255,102,0,0.18),_transparent_70%)] pt-28 pb-12 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4">
          <span className="text-orange-500">Pedí</span>
          <span className="text-cream"> online</span>
        </h1>
        <p className="text-gray-400 text-lg">Elegí tus empanadas y confirmá tu pedido</p>
      </div>

      {/* Tira de info */}
      <div className="bg-[#0a0a0a] border-b border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
          {[['🏪','Retiro en local'],['🛵','Delivery'],['⏱️','~50 min'],['📍','Melincué 4399, Villa Devoto']].map(([icon, text]) => (
            <span key={text} className="flex items-center gap-1.5 text-gray-400 text-xs sm:text-sm whitespace-nowrap">
              <span>{icon}</span>{text}
            </span>
          ))}
        </div>
      </div>

      {/* Sticky bar: categorías + carrito */}
      <div className="sticky top-[140px] z-[51] bg-black/95 backdrop-blur border-b border-gray-800 overflow-hidden">
        <div className="max-w-6xl mx-auto flex items-center gap-3 py-3 px-4">
          <div className="flex gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => handleTabClick(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all flex-shrink-0 ${
                  activeCategory === cat ? 'bg-orange-500 text-black' : 'border border-gray-700 text-gray-400 hover:border-orange-500 hover:text-orange-400'
                }`}>
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className={`flex-shrink-0 flex items-center gap-2 font-bold px-4 py-2 rounded-full text-sm transition-all duration-200 ${
              cartCount > 0
                ? `bg-orange-500 hover:bg-orange-600 text-black shadow-lg shadow-orange-500/40 ${cartBounce ? 'cart-pop' : ''}`
                : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700'
            }`}>
            <span>🛒</span>
            {cartCount > 0
              ? <><span className="font-extrabold">{cartCount}</span><span>·</span><span>{formatPrice(cartTotal)}</span></>
              : <span className="text-xs">Mi pedido</span>
            }
          </button>
        </div>
      </div>

      {/* Más elegidos hoy */}
      {(() => {
        const trendingProducts = TRENDING_IDS
          .map(id => PRODUCTS.find(p => p.id === id))
          .filter(p => {
            if (!p) return false
            const cfg = productConfigs[p.id]
            if (!cfg) return true
            return cfg.active !== false && cfg.stock !== 0
          })
        if (trendingProducts.length === 0) return null
        return (
          <div className="max-w-6xl mx-auto px-4 pt-8 pb-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔥</span>
              <h2 className="text-cream font-extrabold text-lg">Más elegidos hoy</h2>
              <span className="text-gray-500 text-sm">Apurate que vuelan!</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
              {trendingProducts.map(product => {
                const hasCooking = COOKING_CATS.includes(product.category)
                const totalQty = hasCooking
                  ? (getQty(cartKey(product.id, 'horno')) + getQty(cartKey(product.id, 'fritas')))
                  : getQty(product.id)
                return (
                  <div key={product.id} className="flex-shrink-0 w-36 bg-[#0d0d0d] border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="relative h-24 bg-gray-900">
                      {product.img
                        ? <Image src={product.img} alt={product.nombre} fill className="object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-4xl">{product.emoji}</div>
                      }
                      {totalQty > 0 && (
                        <div className="absolute top-1.5 right-1.5 bg-orange-500 text-black text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                          {totalQty}
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-cream text-xs font-semibold leading-tight mb-1 line-clamp-2">{product.nombre}</p>
                      <p className="text-orange-500 text-xs font-bold mb-2">{formatPrice(product.price)}</p>
                      <button
                        onClick={() => hasCooking ? setCookingModal(product) : addToCart(product)}
                        className="w-full text-xs bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-lg py-1.5 transition-colors"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Secciones de productos */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {CATEGORIES.map(cat => {
          const products = filteredByCategory[cat] || []
          if (products.length === 0) return null
          const isCombo = cat === 'Combos'
          return (
            <section key={cat} id={catId(cat)} className="scroll-mt-[200px] mb-16">
              <h2 className="text-cream font-extrabold text-2xl mb-6 pb-3 border-b border-gray-800">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(product => {
                  const hasCooking = COOKING_CATS.includes(product.category)
                  const simpleQty = getQty(product.id)
                  const hornoQty = getQty(cartKey(product.id, 'horno'))
                  const fritasQty = getQty(cartKey(product.id, 'fritas'))
                  const totalQty = hasCooking ? hornoQty + fritasQty : isCombo ? cart.filter(i => i.id === product.id).reduce((s, i) => s + i.qty, 0) : simpleQty
                  return (
                    <div key={product.id} className="bg-[#0d0d0d] border border-gray-800 hover:border-orange-500/60 rounded-2xl overflow-hidden flex flex-col transition-all group">
                      <div className="relative h-44 bg-gray-900 overflow-hidden">
                        {product.img ? (
                          <Image src={product.img} alt={product.nombre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-7xl">{product.emoji}</div>
                        )}
                        {isLowStock(product.id) && (
                          <div className="absolute top-2 left-2 bg-orange-500 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">Últimos</div>
                        )}
                        {totalQty > 0 && (
                          <div className="absolute top-2 right-2 bg-orange-500 text-black text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">{totalQty}</div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-cream font-bold text-base mb-1">{product.nombre}</h3>
                        <p className="text-gray-500 text-sm flex-1 leading-relaxed">{product.desc}</p>
                        {isCombo ? (
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-orange-500 font-extrabold text-lg">{formatPrice(product.price)}</span>
                            <button onClick={() => setComboModal(product)}
                              className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-5 py-2 rounded-full text-sm transition-all hover:scale-105">
                              + Armar combo
                            </button>
                          </div>
                        ) : hasCooking ? (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="text-orange-500 font-extrabold text-lg">{formatPrice(product.price)}</span>
                              <span className="text-gray-600 text-xs">c/u</span>
                            </div>
                            <div className="space-y-2">
                              {[['horno','♨️','Al horno',hornoQty],['fritas','🔥','Fritas',fritasQty]].map(([method,icon,label,qty]) => (
                                <div key={method} className="flex items-center justify-between">
                                  <span className="text-gray-400 text-xs font-medium">{icon} {label}</span>
                                  {qty === 0 ? (
                                    <button onClick={() => addToCart(product, method)}
                                      className="text-xs bg-orange-500/15 border border-orange-600/40 text-orange-400 hover:bg-orange-500/25 hover:border-orange-500 px-3 py-1.5 rounded-full font-semibold transition-all">
                                      + Agregar
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <button onClick={() => removeFromCart(cartKey(product.id, method))} className="w-6 h-6 rounded-full border border-gray-600 hover:border-orange-500 text-gray-300 hover:text-orange-500 font-bold flex items-center justify-center text-sm transition-colors">−</button>
                                      <span className="text-cream font-bold w-5 text-center text-sm">{qty}</span>
                                      <button onClick={() => addToCart(product, method)} className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 text-black font-bold flex items-center justify-center text-sm transition-colors">+</button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-orange-500 font-extrabold text-lg">{formatPrice(product.price)}</span>
                            {simpleQty === 0 ? (
                              <button onClick={() => addToCart(product)}
                                className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-5 py-2 rounded-full text-sm transition-all hover:scale-105">
                                Agregar
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 rounded-full border border-gray-600 hover:border-orange-500 text-gray-300 hover:text-orange-500 font-bold flex items-center justify-center transition-colors">−</button>
                                <span className="text-cream font-bold w-6 text-center">{simpleQty}</span>
                                <button onClick={() => addToCart(product)} className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-black font-bold flex items-center justify-center transition-colors">+</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* FAB carrito */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 sm:hidden">
          <button onClick={() => setCartOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-black font-extrabold px-8 py-4 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-3 text-base transition-all hover:scale-105">
            <span>🛒</span><span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span><span>·</span><span>{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}

      {cartOpen && (
        <CartDrawer cart={cart} onAdd={item => addToCart(item, item.cooking_method)}
          onRemove={removeFromCart} onClose={() => setCartOpen(false)}
          onCheckout={() => { setCartOpen(false); setStep('checkout') }} />
      )}

      {comboModal && (
        <ComboModal combo={comboModal}
          onConfirm={selections => { addComboToCart(comboModal, selections); setComboModal(null) }}
          onClose={() => setComboModal(null)} />
      )}

      {cookingModal && (
        <CookingModal product={cookingModal}
          onSelect={method => { addToCart(cookingModal, method); setCookingModal(null) }}
          onClose={() => setCookingModal(null)} />
      )}

      {/* Modal exit intent */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          <div className="relative bg-[#111] border border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">🫔</div>
            <h2 className="text-cream font-extrabold text-2xl mb-3">¿Estás seguro?</h2>
            <p className="text-gray-400 mb-2 leading-relaxed">¿No querés que te curemos el hambre?</p>
            <p className="text-gray-500 text-sm mb-7">Tu pedido todavía te está esperando.</p>
            <div className="space-y-3">
              <button
                onClick={() => { exitShown.current = false; setShowExitModal(false) }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-black font-extrabold py-3.5 rounded-full transition-all hover:scale-105">
                Seguir comprando 🍴
              </button>
              <button
                onClick={handleAbandon}
                className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition-colors">
                No, me voy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { PRODUCTS, CATEGORIES, formatPrice } from '@/lib/products'

const STATUS_CONFIG = {
  pendiente_pago: { label: 'Esperando pago', color: 'bg-purple-500/20 text-purple-400 border-purple-600' },
  pendiente:      { label: 'Pendiente',       color: 'bg-yellow-500/20 text-yellow-400 border-yellow-600' },
  preparando:     { label: 'Preparando',      color: 'bg-blue-500/20 text-blue-400 border-blue-600' },
  listo:          { label: 'Listo',           color: 'bg-green-500/20 text-green-400 border-green-600' },
  entregado:      { label: 'Entregado',       color: 'bg-gray-500/20 text-gray-400 border-gray-600' },
  cancelado:      { label: 'Cancelado',       color: 'bg-red-500/20 text-red-400 border-red-600' },
}
const NEXT_STATUS = { pendiente: 'preparando', preparando: 'listo', listo: 'entregado' }
const TOKEN_KEY = 'dr_admin_token'

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  return `hace ${Math.floor(diff / 3600)} h`
}

function Toggle({ value, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${value ? 'bg-orange-500' : 'bg-gray-700'}`}>
      <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${value ? 'translate-x-4' : ''}`} />
    </button>
  )
}

function fmtRevenue(n) {
  const v = parseInt(n) || 0
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`
  return formatPrice(v)
}

function fillDailyData(data, days = 14) {
  const result = []
  const now = new Date()
  const existing = Object.fromEntries((data || []).map(d => [d.date, d]))
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    result.push(existing[key] || { date: key, orders: 0, revenue: 0 })
  }
  return result
}

const inputCls = 'w-full bg-black border border-gray-700 focus:border-orange-500 text-cream rounded-xl px-4 py-3 outline-none text-sm transition-colors'
const selectCls = 'w-full bg-black border border-gray-700 focus:border-orange-500 text-cream rounded-xl px-4 py-3 outline-none text-sm'

export default function AdminPage() {
  const [token, setToken] = useState(null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [section, setSection] = useState('pedidos')

  // Orders
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [filter, setFilter] = useState('activos')
  const [updating, setUpdating] = useState(null)

  // Products
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productEdits, setProductEdits] = useState({})
  const [savingProduct, setSavingProduct] = useState(null)

  // Promotions
  const [promotions, setPromotions] = useState([])
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoForm, setPromoForm] = useState({ name: '', description: '', discount_type: 'percentage', discount_value: '', applies_to: 'all', applies_value: '', min_order: '', starts_at: '', ends_at: '' })
  const [savingPromo, setSavingPromo] = useState(false)

  // Coupons
  const [coupons, setCoupons] = useState([])
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponForm, setCouponForm] = useState({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order: '', max_uses: '', expires_at: '' })
  const [savingCoupon, setSavingCoupon] = useState(false)

  // Metrics
  const [metrics, setMetrics] = useState(null)
  const [metricsLoading, setMetricsLoading] = useState(false)

  // Reviews
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewForm, setReviewForm] = useState({ autor: '', texto: '', rating: 5, fecha: '' })
  const [savingReview, setSavingReview] = useState(false)

  // Custom products
  const [customProducts, setCustomProducts] = useState([])
  const [customLoading, setCustomLoading] = useState(false)
  const [customForm, setCustomForm] = useState({ nombre: '', desc: '', price: '', category: 'Clásicas', img_url: '', emoji: '🫔', stock: '', empanadas_count: '', pastelitos_count: '' })
  const [savingCustom, setSavingCustom] = useState(false)
  const [imgPreview, setImgPreview] = useState('')

  // Archive
  const [showArchived, setShowArchived] = useState(false)

  // Abandoned carts
  const [abandonedCarts, setAbandonedCarts] = useState([])
  const [abandonedLoading, setAbandonedLoading] = useState(false)

  // BEM importer
  const [bemOpen, setBemOpen] = useState(false)
  const [bemCsv, setBemCsv] = useState('')
  const [bemUpdatePrice, setBemUpdatePrice] = useState(true)
  const [bemUpdateStock, setBemUpdateStock] = useState(true)
  const [bemPreview, setBemPreview] = useState(null)
  const [bemError, setBemError] = useState('')
  const [bemBusy, setBemBusy] = useState(false)
  const [bemApplied, setBemApplied] = useState(null)

  const authHdr = useCallback(() => ({ 'Content-Type': 'application/json', 'x-admin-token': token }), [token])

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null
    if (stored) setToken(stored)
  }, [])

  useEffect(() => {
    if (!token) return
    fetch('/api/admin/setup', { method: 'POST', headers: { 'x-admin-token': token } }).catch(() => {})
  }, [token])

  const fetchOrders = useCallback(async (tk) => {
    const t = tk || token
    if (!t) return
    setOrdersLoading(true)
    try {
      const res = await fetch('/api/orders', { headers: { 'x-admin-token': t } })
      if (res.status === 401) { sessionStorage.removeItem(TOKEN_KEY); setToken(null); return }
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch {} finally { setOrdersLoading(false) }
  }, [token])

  const fetchProducts = useCallback(async () => {
    if (!token) return
    setProductsLoading(true)
    try {
      const res = await fetch('/api/admin/products', { headers: { 'x-admin-token': token } })
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch {} finally { setProductsLoading(false) }
  }, [token])

  const fetchPromotions = useCallback(async () => {
    if (!token) return
    setPromoLoading(true)
    try {
      const res = await fetch('/api/admin/promotions', { headers: { 'x-admin-token': token } })
      const data = await res.json()
      setPromotions(Array.isArray(data) ? data : [])
    } catch {} finally { setPromoLoading(false) }
  }, [token])

  const fetchCoupons = useCallback(async () => {
    if (!token) return
    setCouponLoading(true)
    try {
      const res = await fetch('/api/admin/coupons', { headers: { 'x-admin-token': token } })
      const data = await res.json()
      setCoupons(Array.isArray(data) ? data : [])
    } catch {} finally { setCouponLoading(false) }
  }, [token])

  const fetchMetrics = useCallback(async () => {
    if (!token) return
    setMetricsLoading(true)
    try {
      const res = await fetch('/api/admin/metrics', { headers: { 'x-admin-token': token } })
      const data = await res.json()
      if (!data.error) setMetrics(data)
    } catch {} finally { setMetricsLoading(false) }
  }, [token])

  const fetchCustomProducts = useCallback(async () => {
    if (!token) return
    setCustomLoading(true)
    try {
      const res = await fetch('/api/admin/custom-products', { headers: { 'x-admin-token': token } })
      const data = await res.json()
      setCustomProducts(Array.isArray(data) ? data : [])
    } catch {} finally { setCustomLoading(false) }
  }, [token])

  const fetchAbandonedCarts = useCallback(async () => {
    if (!token) return
    setAbandonedLoading(true)
    try {
      const res = await fetch('/api/admin/abandoned-carts', { headers: { 'x-admin-token': token } })
      const data = await res.json()
      setAbandonedCarts(Array.isArray(data) ? data : [])
    } catch {} finally { setAbandonedLoading(false) }
  }, [token])

  const fetchReviews = useCallback(async () => {
    if (!token) return
    setReviewsLoading(true)
    try {
      const res = await fetch('/api/admin/reviews', { headers: { 'x-admin-token': token } })
      const data = await res.json()
      setReviews(Array.isArray(data) ? data : [])
    } catch {} finally { setReviewsLoading(false) }
  }, [token])

  useEffect(() => {
    if (!token) return
    fetchOrders(token)
    const interval = setInterval(() => fetchOrders(token), 30000)
    return () => clearInterval(interval)
  }, [token, fetchOrders])

  useEffect(() => {
    if (!token) return
    if (section === 'catalogo') { fetchProducts(); fetchCoupons() }
    if (section === 'promociones') fetchPromotions()
    if (section === 'metricas') fetchMetrics()
    if (section === 'resenas') fetchReviews()
    if (section === 'catalogo') { fetchCustomProducts() }
    if (section === 'abandonados') fetchAbandonedCarts()
  }, [section, token]) // eslint-disable-line

  async function handleLogin(e) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      const data = await res.json()
      if (!res.ok) { setLoginError(data.error || 'Contraseña incorrecta'); return }
      sessionStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
    } catch { setLoginError('Error de conexión') } finally { setLoginLoading(false) }
  }

  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null); setOrders([]); setProducts([]); setPromotions([]); setCoupons([]); setMetrics(null); setReviews([]); setCustomProducts([]); setAbandonedCarts([])
  }

  async function updateOrderStatus(id, status) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: authHdr(), body: JSON.stringify({ status }) })
      if (res.status === 401) { handleLogout(); return }
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    } finally { setUpdating(null) }
  }

  function setProductEdit(id, field, value) {
    setProductEdits(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }))
  }

  async function saveProduct(product) {
    const e = productEdits[product.id] || {}
    const payload = {
      id: product.id,
      price_override: e.price_override !== undefined ? (e.price_override === '' ? null : e.price_override) : product.price_override,
      stock: e.stock !== undefined ? e.stock : product.stock,
      low_stock_threshold: e.low_stock_threshold !== undefined ? e.low_stock_threshold : product.low_stock_threshold,
      active: e.active !== undefined ? e.active : product.active,
    }
    setSavingProduct(product.id)
    try {
      await fetch('/api/admin/products', { method: 'PATCH', headers: authHdr(), body: JSON.stringify(payload) })
      setProductEdits(prev => { const n = { ...prev }; delete n[product.id]; return n })
      await fetchProducts()
    } finally { setSavingProduct(null) }
  }

  async function createPromotion(e) {
    e.preventDefault(); setSavingPromo(true)
    try {
      const res = await fetch('/api/admin/promotions', { method: 'POST', headers: authHdr(), body: JSON.stringify(promoForm) })
      if (res.ok) {
        setPromoForm({ name: '', description: '', discount_type: 'percentage', discount_value: '', applies_to: 'all', applies_value: '', min_order: '', starts_at: '', ends_at: '' })
        await fetchPromotions()
      }
    } finally { setSavingPromo(false) }
  }

  async function togglePromo(id, active) {
    await fetch(`/api/admin/promotions/${id}`, { method: 'PATCH', headers: authHdr(), body: JSON.stringify({ active }) })
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, active } : p))
  }

  async function deletePromo(id) {
    if (!confirm('¿Eliminar esta promoción?')) return
    await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE', headers: { 'x-admin-token': token } })
    setPromotions(prev => prev.filter(p => p.id !== id))
  }

  async function createCoupon(e) {
    e.preventDefault(); setSavingCoupon(true)
    try {
      const res = await fetch('/api/admin/coupons', { method: 'POST', headers: authHdr(), body: JSON.stringify(couponForm) })
      const data = await res.json()
      if (res.ok) {
        setCouponForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order: '', max_uses: '', expires_at: '' })
        await fetchCoupons()
      } else { alert(data.error) }
    } finally { setSavingCoupon(false) }
  }

  async function toggleCoupon(id, active) {
    await fetch(`/api/admin/coupons/${id}`, { method: 'PATCH', headers: authHdr(), body: JSON.stringify({ active }) })
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active } : c))
  }

  async function deleteCoupon(id) {
    if (!confirm('¿Eliminar este cupón?')) return
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE', headers: { 'x-admin-token': token } })
    setCoupons(prev => prev.filter(c => c.id !== id))
  }

  function loadBemFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => { setBemCsv(String(reader.result || '')); setBemPreview(null); setBemApplied(null); setBemError('') }
    reader.readAsText(f, 'utf-8')
  }

  async function bemRequest(dryRun) {
    setBemBusy(true); setBemError(''); setBemApplied(null)
    try {
      const res = await fetch('/api/admin/import-bem', {
        method: 'POST', headers: authHdr(),
        body: JSON.stringify({ csv: bemCsv, dryRun, updatePrice: bemUpdatePrice, updateStock: bemUpdateStock }),
      })
      const data = await res.json()
      if (!res.ok) { setBemError(data.error || 'Error procesando CSV'); return }
      if (dryRun) setBemPreview(data)
      else { setBemApplied(data); setBemPreview(null); setBemCsv(''); await fetchProducts() }
    } catch (err) {
      setBemError('Error de conexión: ' + err.message)
    } finally { setBemBusy(false) }
  }

  async function createCustomProduct(e) {
    e.preventDefault(); setSavingCustom(true)
    try {
      const res = await fetch('/api/admin/custom-products', { method: 'POST', headers: authHdr(), body: JSON.stringify(customForm) })
      let data = {}
      try { data = await res.json() } catch {}
      if (res.ok) {
        setCustomForm({ nombre: '', desc: '', price: '', category: 'Clásicas', img_url: '', emoji: '🫔', stock: '', empanadas_count: '', pastelitos_count: '' })
        setImgPreview('')
        await fetchCustomProducts()
      } else { alert(data.error || `Error ${res.status} al guardar el producto`) }
    } catch (err) {
      alert('Error de conexión: ' + err.message)
    } finally { setSavingCustom(false) }
  }

  async function archiveProduct(id) {
    await fetch('/api/admin/products', { method: 'PATCH', headers: authHdr(), body: JSON.stringify({ id, archived: true }) })
    setProducts(prev => prev.map(p => p.id === id ? { ...p, archived: true } : p))
  }

  async function restoreProduct(id) {
    await fetch('/api/admin/products', { method: 'PATCH', headers: authHdr(), body: JSON.stringify({ id, archived: false }) })
    setProducts(prev => prev.map(p => p.id === id ? { ...p, archived: false } : p))
  }

  async function archiveCustomProduct(id) {
    await fetch('/api/admin/custom-products', { method: 'PATCH', headers: authHdr(), body: JSON.stringify({ id, archived: true }) })
    setCustomProducts(prev => prev.map(p => p.id === id ? { ...p, archived: true } : p))
  }

  async function restoreCustomProduct(id) {
    await fetch('/api/admin/custom-products', { method: 'PATCH', headers: authHdr(), body: JSON.stringify({ id, archived: false }) })
    setCustomProducts(prev => prev.map(p => p.id === id ? { ...p, archived: false } : p))
  }

  async function deleteCustomProduct(id) {
    if (!confirm('¿Eliminar este producto?')) return
    await fetch('/api/admin/custom-products', { method: 'DELETE', headers: authHdr(), body: JSON.stringify({ id }) })
    setCustomProducts(prev => prev.filter(p => p.id !== id))
  }

  async function toggleCustomProduct(id, active) {
    await fetch('/api/admin/custom-products', { method: 'PATCH', headers: authHdr(), body: JSON.stringify({ id, active }) })
    setCustomProducts(prev => prev.map(p => p.id === id ? { ...p, active } : p))
  }

  async function markContacted(id) {
    await fetch('/api/admin/abandoned-carts', { method: 'PATCH', headers: authHdr(), body: JSON.stringify({ id }) })
    setAbandonedCarts(prev => prev.map(c => c.id === id ? { ...c, contacted: true } : c))
  }

  async function createReview(e) {
    e.preventDefault(); setSavingReview(true)
    try {
      const res = await fetch('/api/admin/reviews', { method: 'POST', headers: authHdr(), body: JSON.stringify(reviewForm) })
      const data = await res.json()
      if (res.ok) {
        setReviewForm({ autor: '', texto: '', rating: 5, fecha: '' })
        await fetchReviews()
      } else { alert(data.error) }
    } finally { setSavingReview(false) }
  }

  async function toggleReview(id, visible) {
    await fetch('/api/admin/reviews', { method: 'PATCH', headers: authHdr(), body: JSON.stringify({ id, visible }) })
    setReviews(prev => prev.map(r => r.id === id ? { ...r, visible } : r))
  }

  async function deleteReview(id) {
    if (!confirm('¿Eliminar esta reseña?')) return
    await fetch('/api/admin/reviews', { method: 'DELETE', headers: authHdr(), body: JSON.stringify({ id }) })
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  const lowStockCount = products.filter(p => !p.archived && p.stock >= 0 && p.stock <= p.low_stock_threshold).length
  const activeOrders = orders.filter(o => ['pendiente_pago', 'pendiente', 'preparando', 'listo'].includes(o.status))
  const historicOrders = orders.filter(o => ['entregado', 'cancelado'].includes(o.status))
  const filtered = filter === 'activos' ? activeOrders : historicOrders

  const navSections = [
    { id: 'pedidos',    label: 'Pedidos',     badge: activeOrders.length, badgeColor: 'bg-orange-500 text-black' },
    { id: 'catalogo',   label: 'Catálogo',    badge: lowStockCount, badgeColor: 'bg-red-500 text-white' },
    { id: 'promociones',label: 'Promociones', badge: 0 },
    { id: 'resenas',     label: 'Reseñas',     badge: 0 },
    { id: 'abandonados', label: 'Abandonados', badge: abandonedCarts.filter(c => !c.contacted).length, badgeColor: 'bg-yellow-500 text-black' },
    { id: 'metricas',    label: 'Métricas',    badge: 0 },
  ]

  if (!token) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Image src="/images/logo.png" alt="Logo" width={70} height={70} className="mx-auto mb-4 object-contain" />
            <h1 className="text-3xl font-extrabold text-cream">Panel <span className="text-orange-500">Admin</span></h1>
            <p className="text-gray-500 text-sm mt-1">Dr. Empanada</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña"
              className="w-full bg-[#111] border border-gray-700 focus:border-orange-500 text-cream rounded-xl px-4 py-3 outline-none transition-colors" />
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button type="submit" disabled={loginLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-black font-extrabold py-3 rounded-full transition-all">
              {loginLoading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
            <div>
              <h1 className="text-cream font-extrabold text-base leading-none">Panel Admin</h1>
              <p className="text-gray-500 text-xs">Dr. Empanada</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {section === 'pedidos' && (
              <button onClick={() => fetchOrders(token)}
                className="text-gray-400 hover:text-orange-500 text-sm border border-gray-700 hover:border-orange-500 px-3 py-1.5 rounded-full transition-colors">
                {ordersLoading ? '...' : '↻'}
              </button>
            )}
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 text-sm transition-colors">Salir</button>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-gray-900">
          <div className="flex gap-1 px-4 py-2 min-w-max">
            {navSections.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  section === s.id ? 'bg-orange-500 text-black' : 'text-gray-400 hover:text-cream'
                }`}>
                {s.label}
                {s.badge > 0 && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 leading-none ${
                    section === s.id ? 'bg-black/30 text-black' : (s.badgeColor || 'bg-orange-500 text-black')
                  }`}>{s.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── PEDIDOS ── */}
        {section === 'pedidos' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Pendientes', value: orders.filter(o => o.status === 'pendiente').length, color: 'text-yellow-400' },
                { label: 'Preparando', value: orders.filter(o => o.status === 'preparando').length, color: 'text-blue-400' },
                { label: 'Listos',     value: orders.filter(o => o.status === 'listo').length,     color: 'text-green-400' },
              ].map(s => (
                <div key={s.label} className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-5 text-center">
                  <p className={`text-4xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mb-6">
              {[['activos', 'Pedidos activos'], ['historial', 'Historial']].map(([v, lbl]) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${filter === v ? 'bg-orange-500 text-black' : 'border border-gray-700 text-gray-400 hover:border-orange-500'}`}>
                  {lbl}
                </button>
              ))}
            </div>
            {ordersLoading && orders.length === 0 ? (
              <div className="text-center py-20 text-gray-500">Cargando pedidos...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-500">{filter === 'activos' ? 'No hay pedidos activos' : 'No hay pedidos en el historial'}</div>
            ) : (
              <div className="space-y-4">
                {filtered.map(order => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['pendiente']
                  const next = NEXT_STATUS[order.status]
                  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
                  return (
                    <div key={order.id} className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-cream font-bold text-lg">{order.customer_name}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                          </div>
                          <p className="text-gray-500 text-sm">📞 {order.customer_phone} · {timeAgo(order.created_at)}</p>
                          {order.customer_email && <p className="text-gray-600 text-xs mt-0.5">✉️ {order.customer_email}</p>}
                        </div>
                        <div className="text-right">
                          <span className="text-orange-500 font-extrabold text-xl">{formatPrice(order.total)}</span>
                          {parseInt(order.discount) > 0 && <p className="text-green-400 text-xs">-{formatPrice(parseInt(order.discount))} descuento</p>}
                        </div>
                      </div>
                      <div className="bg-black rounded-xl p-4 mb-4 space-y-1">
                        {items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-300">
                              {item.qty}× {item.nombre}
                              {item.cooking_method && (
                                <span className="ml-1.5 text-xs text-gray-500">{item.cooking_method === 'fritas' ? '🔥 Fritas' : '♨️ Al horno'}</span>
                              )}
                            </span>
                            <span className="text-gray-500">{formatPrice(item.price * item.qty)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 mb-4 text-sm">
                        <span className="text-gray-400">{order.delivery_type === 'delivery' ? '🛵 Delivery' : '🏪 Retiro en local'}</span>
                        {order.delivery_type === 'delivery' && order.customer_address && <span className="text-gray-500">📍 {order.customer_address}</span>}
                        <span className="text-gray-400">{order.payment_method === 'efectivo' ? '💵 Efectivo' : order.payment_method === 'transferencia' ? '📲 Transferencia' : '💳 Tarjeta'}</span>
                        {order.coupon_code && <span className="text-green-400 text-xs">🎟️ {order.coupon_code}</span>}
                      </div>
                      {order.notes && <div className="bg-orange-500/10 border border-orange-800 rounded-xl px-4 py-2 mb-4 text-sm text-orange-300">📝 {order.notes}</div>}
                      <div className="flex flex-wrap gap-3">
                        {next && order.status !== 'pendiente_pago' && (
                          <button onClick={() => updateOrderStatus(order.id, next)} disabled={updating === order.id}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-black font-bold px-5 py-2 rounded-full text-sm transition-all">
                            {updating === order.id ? '...' : `→ Marcar como ${STATUS_CONFIG[next]?.label}`}
                          </button>
                        )}
                        {!['cancelado', 'entregado', 'pendiente_pago'].includes(order.status) && (
                          <button onClick={() => updateOrderStatus(order.id, 'cancelado')} disabled={updating === order.id}
                            className="border border-red-800 text-red-400 hover:bg-red-900/20 font-semibold px-5 py-2 rounded-full text-sm transition-all">
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── CATÁLOGO (Productos + Cupones) ── */}
        {section === 'catalogo' && (
          <>
            {/* Agregar producto personalizado */}
            <div className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-5 mb-6">
              <h3 className="text-cream font-bold mb-4">+ Agregar producto nuevo</h3>
              <form onSubmit={createCustomProduct} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Nombre *</label>
                    <input required value={customForm.nombre} onChange={e => setCustomForm(f => ({...f, nombre: e.target.value}))}
                      placeholder="Ej: Empanada especial del chef" maxLength={80} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Descripción</label>
                    <input value={customForm.desc} onChange={e => setCustomForm(f => ({...f, desc: e.target.value}))}
                      placeholder="Descripción corta" maxLength={200} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Precio * ($)</label>
                    <input required type="number" min="1" value={customForm.price}
                      onChange={e => setCustomForm(f => ({...f, price: e.target.value}))}
                      placeholder="3800" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Categoría</label>
                    <select value={customForm.category} onChange={e => setCustomForm(f => ({...f, category: e.target.value}))} className={selectCls}>
                      <option>Clásicas</option>
                      <option>Especiales</option>
                      <option>Pastelitos y Postres</option>
                      <option>Combos</option>
                      <option>Bebidas</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Stock (vacío = ∞)</label>
                    <input type="number" min="0" value={customForm.stock}
                      onChange={e => setCustomForm(f => ({...f, stock: e.target.value}))}
                      placeholder="∞" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Emoji (sin foto)</label>
                    <input value={customForm.emoji} onChange={e => setCustomForm(f => ({...f, emoji: e.target.value}))}
                      placeholder="🫔" maxLength={4} className={inputCls} />
                  </div>
                </div>
                {customForm.category === 'Combos' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-500 text-xs mb-1 block">Empanadas a elegir *</label>
                      <input required type="number" min="1" value={customForm.empanadas_count}
                        onChange={e => setCustomForm(f => ({...f, empanadas_count: e.target.value}))}
                        placeholder="6" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs mb-1 block">Pastelitos a elegir</label>
                      <input type="number" min="0" value={customForm.pastelitos_count}
                        onChange={e => setCustomForm(f => ({...f, pastelitos_count: e.target.value}))}
                        placeholder="0" className={inputCls} />
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-gray-500 text-xs">URL de imagen (opcional)</label>
                    <button type="button"
                      onClick={() => window.open('https://www.google.com/search?tbm=isch&q=empanada+' + encodeURIComponent(customForm.nombre), '_blank')}
                      className="text-orange-400 hover:text-orange-300 text-xs transition-colors">
                      🔍 Buscar en Google Imágenes
                    </button>
                  </div>
                  <input value={customForm.img_url}
                    onChange={e => { setCustomForm(f => ({...f, img_url: e.target.value})); setImgPreview(e.target.value) }}
                    placeholder="https://... (pegá la URL de cualquier imagen de la web)" className={inputCls} />
                  {imgPreview && (
                    <div className="mt-2 relative h-24 w-24 rounded-xl overflow-hidden border border-gray-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgPreview} alt="preview" className="w-full h-full object-cover" onError={() => setImgPreview('')} />
                    </div>
                  )}
                </div>
                <button type="submit" disabled={savingCustom}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-black font-bold px-6 py-2.5 rounded-full text-sm transition-all">
                  {savingCustom ? 'Guardando...' : '+ Agregar al catálogo'}
                </button>
              </form>
            </div>


            {/* Importador BEM (CSV) */}
            <div className="mb-6 bg-[#0d0d0d] border border-gray-800 rounded-2xl overflow-hidden">
              <button onClick={() => setBemOpen(o => !o)}
                className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-[#111] transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">📥</span>
                  <span className="text-cream font-bold text-sm">Importar desde BEM (CSV)</span>
                  <span className="text-gray-600 text-xs hidden sm:inline">— sincronizar precios y stock</span>
                </div>
                <span className="text-gray-500 text-lg">{bemOpen ? '−' : '+'}</span>
              </button>

              {bemOpen && (
                <div className="px-5 pb-5 border-t border-gray-800 pt-4 space-y-4">
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Pegá o subí el CSV exportado desde BEM. Se detectan columnas <span className="text-gray-400">Código</span>,{' '}
                    <span className="text-gray-400">Descripción</span>, <span className="text-gray-400">Precio</span> y{' '}
                    <span className="text-gray-400">Stock</span> (acepta separador <code>,</code> <code>;</code> o tab). El matching es por nombre.
                  </p>

                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Subir archivo</label>
                    <input type="file" accept=".csv,.txt,text/csv" onChange={loadBemFile}
                      className="block w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-500 file:text-black hover:file:bg-orange-600 file:cursor-pointer" />
                  </div>

                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">O pegar contenido CSV</label>
                    <textarea value={bemCsv} onChange={e => { setBemCsv(e.target.value); setBemPreview(null); setBemApplied(null); setBemError('') }}
                      placeholder="Codigo;Descripcion;Precio;Stock&#10;001;Carne Suave;3800;42&#10;..."
                      rows={6} className={`${inputCls} font-mono text-xs leading-relaxed`} />
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Toggle value={bemUpdatePrice} onChange={setBemUpdatePrice} />
                      <span className="text-gray-300">Actualizar precios</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Toggle value={bemUpdateStock} onChange={setBemUpdateStock} />
                      <span className="text-gray-300">Actualizar stock</span>
                    </label>
                  </div>

                  {bemError && (
                    <div className="bg-red-900/20 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-2">{bemError}</div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => bemRequest(true)} disabled={bemBusy || !bemCsv.trim()}
                      className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-cream font-semibold px-5 py-2 rounded-full text-sm transition-all">
                      {bemBusy ? '...' : '👁 Previsualizar'}
                    </button>
                    {bemPreview && (
                      <button onClick={() => bemRequest(false)} disabled={bemBusy || bemPreview.summary.matched === 0}
                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold px-5 py-2 rounded-full text-sm transition-all">
                        {bemBusy ? '...' : `✓ Aplicar a ${bemPreview.summary.matched} producto${bemPreview.summary.matched !== 1 ? 's' : ''}`}
                      </button>
                    )}
                  </div>

                  {bemApplied && (
                    <div className="bg-green-900/20 border border-green-800 text-green-400 text-sm rounded-xl px-4 py-3">
                      ✓ {bemApplied.updated} producto{bemApplied.updated !== 1 ? 's' : ''} actualizado{bemApplied.updated !== 1 ? 's' : ''} desde BEM.
                    </div>
                  )}

                  {bemPreview && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-black border border-gray-800 rounded-xl py-2">
                          <p className="text-cream font-bold text-base">{bemPreview.summary.totalRows}</p>
                          <p className="text-gray-500">Filas</p>
                        </div>
                        <div className="bg-green-900/20 border border-green-800 rounded-xl py-2">
                          <p className="text-green-400 font-bold text-base">{bemPreview.summary.matched}</p>
                          <p className="text-green-500/70">Matchean</p>
                        </div>
                        <div className="bg-red-900/20 border border-red-800 rounded-xl py-2">
                          <p className="text-red-400 font-bold text-base">{bemPreview.summary.unmatched}</p>
                          <p className="text-red-500/70">Sin match</p>
                        </div>
                      </div>

                      <p className="text-gray-600 text-xs">
                        Columnas detectadas — sep: <code className="text-gray-400">{bemPreview.summary.detectedColumns.separator === '\t' ? 'tab' : bemPreview.summary.detectedColumns.separator}</code>
                        {bemPreview.summary.detectedColumns.name && <> · nombre: <code className="text-gray-400">{bemPreview.summary.detectedColumns.name}</code></>}
                        {bemPreview.summary.detectedColumns.price && <> · precio: <code className="text-gray-400">{bemPreview.summary.detectedColumns.price}</code></>}
                        {bemPreview.summary.detectedColumns.stock && <> · stock: <code className="text-gray-400">{bemPreview.summary.detectedColumns.stock}</code></>}
                      </p>

                      <div className="max-h-72 overflow-y-auto border border-gray-800 rounded-xl">
                        <table className="w-full text-xs">
                          <thead className="bg-black sticky top-0">
                            <tr className="text-gray-500 text-left">
                              <th className="px-3 py-2 font-medium">CSV → Producto</th>
                              {bemUpdatePrice && <th className="px-3 py-2 font-medium text-right">Precio</th>}
                              {bemUpdateStock && <th className="px-3 py-2 font-medium text-right">Stock</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {bemPreview.results.map((r, i) => (
                              <tr key={i} className={`border-t border-gray-900 ${r.matched ? '' : 'opacity-50'}`}>
                                <td className="px-3 py-1.5">
                                  <span className={r.matched ? 'text-green-400' : 'text-red-400'}>{r.matched ? '✓' : '✗'}</span>{' '}
                                  <span className="text-gray-400">{r.raw.name}</span>
                                  {r.matched && <span className="text-gray-600"> → {r.matched.nombre}</span>}
                                </td>
                                {bemUpdatePrice && (
                                  <td className="px-3 py-1.5 text-right tabular-nums">
                                    {r.newPrice != null ? <span className="text-orange-400">{formatPrice(r.newPrice)}</span> : <span className="text-gray-700">—</span>}
                                  </td>
                                )}
                                {bemUpdateStock && (
                                  <td className="px-3 py-1.5 text-right tabular-nums">
                                    {r.newStock != null ? <span className="text-cream">{r.newStock}</span> : <span className="text-gray-700">—</span>}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Alerta stock bajo */}
            {lowStockCount > 0 && (
              <div className="mb-6 bg-red-900/20 border border-red-700 rounded-2xl p-4">
                <p className="text-red-400 font-bold mb-2">⚠️ {lowStockCount} producto{lowStockCount > 1 ? 's' : ''} con stock bajo o agotado</p>
                <div className="flex flex-wrap gap-2">
                  {products.filter(p => p.stock >= 0 && p.stock <= p.low_stock_threshold).map(p => (
                    <span key={p.id} className="text-xs bg-red-900/40 text-red-300 border border-red-800 px-2 py-0.5 rounded-full">
                      {p.nombre}: {p.stock === 0 ? 'sin stock' : `${p.stock} restantes`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Header productos */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-cream font-bold text-lg">Productos</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowArchived(v => !v)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${showArchived ? 'bg-gray-700 border-gray-600 text-cream' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}>
                  {showArchived ? '← Volver al catálogo' : `🗂 Archivados (${products.filter(p => p.archived).length + customProducts.filter(p => p.archived).length})`}
                </button>
                <button onClick={fetchProducts} className="text-gray-500 hover:text-orange-500 text-sm transition-colors">
                  {productsLoading ? '...' : '↻'}
                </button>
              </div>
            </div>

            {/* Grid de productos por categoría */}
            {productsLoading && products.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Cargando productos...</div>
            ) : (
              <div className="space-y-8 mb-10">
                {showArchived ? (
                  /* Vista de archivados */
                  (() => {
                    const archivedStatic = products.filter(p => p.archived)
                    const archivedCustom = customProducts.filter(p => p.archived)
                    if (archivedStatic.length === 0 && archivedCustom.length === 0) {
                      return <p className="text-gray-500 text-center py-8">No hay productos archivados.</p>
                    }
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {[...archivedStatic, ...archivedCustom].map(p => (
                          <div key={p.id} className="bg-[#0d0d0d] border border-gray-800 rounded-2xl overflow-hidden opacity-60 flex flex-col">
                            <div className="h-16 bg-[#111] flex items-center justify-center text-3xl">
                              {p.img || p.img_url ? <img src={p.img || p.img_url} alt={p.nombre} className="h-full w-full object-cover" /> : <span>{p.emoji || '🫔'}</span>}
                            </div>
                            <div className="p-3 flex-1">
                              <p className="text-cream text-sm font-semibold mb-1">{p.nombre}</p>
                              <p className="text-gray-600 text-xs">{p.category}</p>
                            </div>
                            <div className="px-3 pb-3">
                              <button
                                onClick={() => p.id.startsWith('custom-') ? restoreCustomProduct(p.id) : restoreProduct(p.id)}
                                className="w-full text-xs bg-gray-700 hover:bg-orange-500 hover:text-black text-cream font-bold py-1.5 rounded-lg transition-colors">
                                ↩ Restaurar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()
                ) : (
                  <>
                {CATEGORIES.map(cat => {
                  const catProds = products.filter(p => p.category === cat && !p.archived)
                  if (catProds.length === 0) return null
                  return (
                    <div key={cat}>
                      <h4 className="text-orange-500 font-bold text-xs uppercase tracking-widest mb-3">{cat}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {catProds.map(p => {
                          const ed = productEdits[p.id] || {}
                          const stock = ed.stock !== undefined ? ed.stock : p.stock
                          const threshold = ed.low_stock_threshold !== undefined ? ed.low_stock_threshold : p.low_stock_threshold
                          const priceOverride = ed.price_override !== undefined ? ed.price_override : p.price_override
                          const active = ed.active !== undefined ? ed.active : p.active
                          const isDirty = Object.keys(ed).length > 0
                          const stockNum = parseInt(stock)
                          const isUnlimited = stockNum === -1
                          const isOut = !isUnlimited && stockNum === 0
                          const isLow = !isUnlimited && stockNum > 0 && stockNum <= parseInt(threshold)
                          const effectivePrice = (priceOverride !== null && priceOverride !== '' && priceOverride !== undefined)
                            ? parseInt(priceOverride) : p.price
                          const staticProd = PRODUCTS.find(pr => pr.id === p.id)

                          return (
                            <div key={p.id} className={`bg-[#0d0d0d] border rounded-2xl overflow-hidden flex flex-col transition-all ${
                              !active ? 'opacity-50 border-gray-800' : isOut ? 'border-red-800' : isLow ? 'border-orange-700' : 'border-gray-800 hover:border-gray-600'
                            }`}>
                              {/* Imagen / emoji */}
                              <div className="relative h-24 bg-[#111] flex items-center justify-center shrink-0 overflow-hidden">
                                {staticProd?.img ? (
                                  <Image src={staticProd.img} alt={p.nombre} fill className="object-cover" />
                                ) : (
                                  <span className="text-4xl select-none">{staticProd?.emoji || '🫔'}</span>
                                )}
                                {/* Badge de stock */}
                                {isOut && (
                                  <span className="absolute top-2 left-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold shadow-lg">Sin stock</span>
                                )}
                                {isLow && !isOut && (
                                  <span className="absolute top-2 left-2 text-xs bg-orange-500 text-black px-2 py-0.5 rounded-full font-bold shadow-lg">Poco</span>
                                )}
                                {/* Toggle activo */}
                                <div className="absolute top-2 right-2">
                                  <Toggle value={active} onChange={v => setProductEdit(p.id, 'active', v)} />
                                </div>
                              </div>

                              <div className="p-3 flex flex-col flex-1 gap-2.5">
                                <p className="text-cream font-semibold text-sm leading-tight">{p.nombre}</p>

                                {/* Control de stock */}
                                <div>
                                  <p className="text-gray-600 text-xs mb-1.5">Stock</p>
                                  {isUnlimited ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-400 font-mono text-sm">∞ ilimitado</span>
                                      <button
                                        onClick={() => setProductEdit(p.id, 'stock', 0)}
                                        className="text-gray-600 text-xs hover:text-orange-400 underline underline-offset-2 transition-colors">
                                        poner límite
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => setProductEdit(p.id, 'stock', Math.max(0, stockNum - 1))}
                                        className="w-7 h-7 bg-gray-800 hover:bg-orange-500 hover:text-black text-cream rounded-lg text-base font-bold transition-colors flex items-center justify-center shrink-0">
                                        −
                                      </button>
                                      <input
                                        type="number"
                                        min="0"
                                        value={stockNum}
                                        onChange={e => {
                                          const val = parseInt(e.target.value, 10)
                                          if (!isNaN(val) && val >= 0) setProductEdit(p.id, 'stock', val)
                                        }}
                                        className={`w-0 min-w-0 flex-1 text-center font-bold text-sm tabular-nums bg-black border border-gray-700 focus:border-orange-500 rounded-lg px-1 py-0.5 outline-none transition-colors ${isOut ? 'text-red-400' : isLow ? 'text-orange-400' : 'text-cream'}`}
                                      />
                                      <button
                                        onClick={() => setProductEdit(p.id, 'stock', stockNum + 1)}
                                        className="w-7 h-7 bg-gray-800 hover:bg-orange-500 hover:text-black text-cream rounded-lg text-base font-bold transition-colors flex items-center justify-center shrink-0">
                                        +
                                      </button>
                                      <button
                                        onClick={() => setProductEdit(p.id, 'stock', -1)}
                                        className="text-gray-600 text-xs hover:text-orange-400 transition-colors font-mono shrink-0">
                                        ∞
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Precio */}
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-gray-600 text-xs">Precio</p>
                                    <p className="text-gray-600 text-xs">Base: {formatPrice(p.price)}</p>
                                  </div>
                                  <input
                                    type="number" min="0" placeholder={String(p.price)}
                                    value={priceOverride ?? ''}
                                    onChange={e => setProductEdit(p.id, 'price_override', e.target.value === '' ? null : e.target.value)}
                                    className="w-full bg-black border border-gray-700 focus:border-orange-500 text-cream rounded-lg px-2.5 py-1.5 text-sm outline-none transition-colors"
                                  />
                                  {(priceOverride !== null && priceOverride !== '' && priceOverride !== undefined) && (
                                    <p className="text-orange-400 font-bold text-xs mt-1 text-right">
                                      → {formatPrice(effectivePrice)}
                                    </p>
                                  )}
                                </div>

                                {/* Botón guardar */}
                                <button
                                  onClick={() => saveProduct(p)}
                                  disabled={!isDirty || savingProduct === p.id}
                                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold py-1.5 rounded-lg text-sm transition-all mt-auto">
                                  {savingProduct === p.id ? 'Guardando...' : isDirty ? 'Guardar cambios' : 'Sin cambios'}
                                </button>
                                {/* Archivar + Eliminar */}
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => { if (confirm(`¿Archivar "${p.nombre}"? Podés restaurarlo desde "Archivados".`)) archiveProduct(p.id) }}
                                    className="flex-1 flex items-center justify-center gap-1 text-gray-600 hover:text-orange-400 hover:bg-orange-900/10 border border-gray-800 hover:border-orange-700 text-xs py-1.5 rounded-lg transition-colors">
                                    🗂 Archivar
                                  </button>
                                  <button
                                    onClick={() => { if (confirm(`¿Eliminar "${p.nombre}"? Podés restaurarlo desde "Archivados".`)) archiveProduct(p.id) }}
                                    className="flex-1 flex items-center justify-center gap-1 text-gray-600 hover:text-red-400 hover:bg-red-900/10 border border-gray-800 hover:border-red-800 text-xs py-1.5 rounded-lg transition-colors">
                                    ✕ Eliminar
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                </>
                )}
              </div>
            )}

            {/* Categorías personalizadas (Bebidas, etc.) */}
            {(() => {
              const STATIC_CATS = ['Combos', 'Clásicas', 'Especiales', 'Pastelitos y Postres']
              const active = customProducts.filter(p => !p.archived)
              const newCats = [...new Set(active.map(p => p.category).filter(c => !STATIC_CATS.includes(c)))]
              if (newCats.length === 0) return null
              return (
                <div className="space-y-8 mb-10">
                  {newCats.map(cat => {
                    const catProds = active.filter(p => p.category === cat)
                    return (
                      <div key={cat}>
                        <h4 className="text-orange-500 font-bold text-xs uppercase tracking-widest mb-3">{cat}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {catProds.map(p => (
                            <div key={p.id} className={`bg-[#0d0d0d] border rounded-2xl overflow-hidden flex flex-col transition-all ${p.active ? 'border-gray-800 hover:border-gray-600' : 'opacity-50 border-gray-800'}`}>
                              <div className="relative h-24 bg-[#111] flex items-center justify-center shrink-0 overflow-hidden">
                                {p.img_url
                                  ? <img src={p.img_url} alt={p.nombre} className="w-full h-full object-cover" />
                                  : <span className="text-4xl">{p.emoji || '🫔'}</span>
                                }
                                <div className="absolute top-2 right-2">
                                  <Toggle value={p.active} onChange={v => toggleCustomProduct(p.id, v)} />
                                </div>
                              </div>
                              <div className="p-3 flex flex-col flex-1 gap-1.5">
                                <p className="text-cream font-semibold text-sm leading-tight">{p.nombre}</p>
                                <p className="text-orange-500 font-bold text-sm">{formatPrice(parseInt(p.price))}</p>
                                <p className="text-gray-600 text-xs">Stock: {parseInt(p.stock) === -1 ? '∞' : p.stock}</p>
                                <div className="flex gap-1.5 mt-auto pt-1">
                                  <button
                                    onClick={() => { if (confirm(`¿Archivar "${p.nombre}"?`)) archiveCustomProduct(p.id) }}
                                    className="flex-1 text-xs text-gray-600 hover:text-orange-400 border border-gray-800 hover:border-orange-700 rounded-lg py-1 transition-colors">
                                    🗂
                                  </button>
                                  <button
                                    onClick={() => deleteCustomProduct(p.id)}
                                    className="flex-1 text-xs text-gray-600 hover:text-red-400 border border-gray-800 hover:border-red-800 rounded-lg py-1 transition-colors">
                                    ✕
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {/* Separador */}
            <div className="border-t border-gray-800 my-8" />

            {/* ── CUPONES ── */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-cream font-bold text-lg">🎟️ Cupones de descuento</h3>
                <span className="text-gray-500 text-sm">{coupons.length} cupón{coupons.length !== 1 ? 'es' : ''}</span>
              </div>

              {/* Form nuevo cupón */}
              <div className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-5 mb-5">
                <h4 className="text-cream font-semibold mb-4 text-sm">Crear nuevo cupón</h4>
                <form onSubmit={createCoupon} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-500 text-xs mb-1 block">Código *</label>
                      <input required value={couponForm.code}
                        onChange={e => setCouponForm(f => ({...f, code: e.target.value.toUpperCase()}))}
                        placeholder="PROMO20" maxLength={50}
                        className={`${inputCls} font-mono tracking-wider`} />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs mb-1 block">Descripción (opcional)</label>
                      <input value={couponForm.description}
                        onChange={e => setCouponForm(f => ({...f, description: e.target.value}))}
                        placeholder="Ej: 20% primera compra" maxLength={200} className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-gray-500 text-xs mb-1 block">Tipo</label>
                      <select value={couponForm.discount_type}
                        onChange={e => setCouponForm(f => ({...f, discount_type: e.target.value}))}
                        className={selectCls}>
                        <option value="percentage">Porcentaje (%)</option>
                        <option value="fixed">Monto fijo ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs mb-1 block">Valor *</label>
                      <input required type="number" min="1"
                        max={couponForm.discount_type === 'percentage' ? '100' : undefined}
                        value={couponForm.discount_value}
                        onChange={e => setCouponForm(f => ({...f, discount_value: e.target.value}))}
                        placeholder={couponForm.discount_type === 'percentage' ? '20' : '1000'}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs mb-1 block">Pedido mínimo ($)</label>
                      <input type="number" min="0" value={couponForm.min_order}
                        onChange={e => setCouponForm(f => ({...f, min_order: e.target.value}))}
                        placeholder="0" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs mb-1 block">Usos máximos (vacío = ∞)</label>
                      <input type="number" min="1" value={couponForm.max_uses}
                        onChange={e => setCouponForm(f => ({...f, max_uses: e.target.value}))}
                        placeholder="∞" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Vencimiento (opcional)</label>
                    <input type="datetime-local" value={couponForm.expires_at}
                      onChange={e => setCouponForm(f => ({...f, expires_at: e.target.value}))}
                      className={`${inputCls} max-w-xs`} />
                  </div>
                  <button type="submit" disabled={savingCoupon}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-black font-bold px-6 py-2.5 rounded-full text-sm transition-all">
                    {savingCoupon ? 'Creando...' : '+ Crear cupón'}
                  </button>
                </form>
              </div>

              {/* Lista de cupones */}
              {couponLoading ? (
                <p className="text-center py-8 text-gray-500">Cargando cupones...</p>
              ) : coupons.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No hay cupones creados</p>
              ) : (
                <div className="space-y-3">
                  {coupons.map(c => {
                    const expired = c.expires_at && new Date(c.expires_at) < new Date()
                    const exhausted = parseInt(c.max_uses) !== -1 && parseInt(c.uses_count) >= parseInt(c.max_uses)
                    const usable = c.active && !expired && !exhausted
                    return (
                      <div key={c.id} className={`bg-[#0d0d0d] border rounded-2xl p-4 transition-all ${usable ? 'border-gray-700' : 'border-gray-800 opacity-60'}`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-orange-400 font-bold font-mono tracking-widest text-base">{c.code}</span>
                              {usable && <span className="text-xs bg-green-500/20 text-green-400 border border-green-700 px-2 py-0.5 rounded-full">Activo</span>}
                              {expired && <span className="text-xs bg-red-500/20 text-red-400 border border-red-700 px-2 py-0.5 rounded-full">Vencido</span>}
                              {exhausted && <span className="text-xs bg-gray-500/20 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full">Agotado</span>}
                            </div>
                            <p className="text-gray-400 text-sm">
                              {c.discount_type === 'percentage' ? `${c.discount_value}% off` : `${formatPrice(parseInt(c.discount_value))} off`}
                              {parseInt(c.min_order) > 0 && ` · Mínimo ${formatPrice(parseInt(c.min_order))}`}
                              {' · '}
                              <span className={exhausted ? 'text-red-400' : 'text-gray-500'}>
                                {c.uses_count} uso{parseInt(c.uses_count) !== 1 ? 's' : ''}
                                {parseInt(c.max_uses) !== -1 ? ` / ${c.max_uses} máx.` : ''}
                              </span>
                            </p>
                            {c.description && <p className="text-gray-500 text-xs mt-0.5">{c.description}</p>}
                            {c.expires_at && <p className="text-gray-600 text-xs mt-1">Vence {new Date(c.expires_at).toLocaleDateString('es-AR')}</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <Toggle value={c.active} onChange={v => toggleCoupon(c.id, v)} />
                            <button onClick={() => deleteCoupon(c.id)} className="text-gray-600 hover:text-red-400 transition-colors">✕</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── PROMOCIONES ── */}
        {section === 'promociones' && (
          <>
            <div className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-5 mb-6">
              <h3 className="text-cream font-bold mb-4">Nueva promoción automática</h3>
              <form onSubmit={createPromotion} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Nombre *</label>
                    <input required value={promoForm.name} onChange={e => setPromoForm(f => ({...f, name: e.target.value}))}
                      placeholder="Ej: 10% en toda la carta" maxLength={100} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Descripción (opcional)</label>
                    <input value={promoForm.description} onChange={e => setPromoForm(f => ({...f, description: e.target.value}))}
                      placeholder="Ej: Promo de inauguración" maxLength={200} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Tipo</label>
                    <select value={promoForm.discount_type} onChange={e => setPromoForm(f => ({...f, discount_type: e.target.value}))} className={selectCls}>
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Monto fijo ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Valor *</label>
                    <input required type="number" min="1" max={promoForm.discount_type === 'percentage' ? '100' : undefined}
                      value={promoForm.discount_value} onChange={e => setPromoForm(f => ({...f, discount_value: e.target.value}))}
                      placeholder={promoForm.discount_type === 'percentage' ? '10' : '500'} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Aplica a</label>
                    <select value={promoForm.applies_to} onChange={e => setPromoForm(f => ({...f, applies_to: e.target.value, applies_value: ''}))} className={selectCls}>
                      <option value="all">Todo el pedido</option>
                      <option value="category">Una categoría</option>
                      <option value="product">Un producto</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Pedido mínimo ($)</label>
                    <input type="number" min="0" value={promoForm.min_order} onChange={e => setPromoForm(f => ({...f, min_order: e.target.value}))} placeholder="0" className={inputCls} />
                  </div>
                </div>
                {promoForm.applies_to === 'category' && (
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Categoría</label>
                    <select value={promoForm.applies_value} onChange={e => setPromoForm(f => ({...f, applies_value: e.target.value}))} className={`${selectCls} max-w-xs`}>
                      <option value="">Seleccionar...</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                {promoForm.applies_to === 'product' && (
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Producto</label>
                    <select value={promoForm.applies_value} onChange={e => setPromoForm(f => ({...f, applies_value: e.target.value}))} className={`${selectCls} max-w-xs`}>
                      <option value="">Seleccionar...</option>
                      {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Desde (opcional)</label>
                    <input type="datetime-local" value={promoForm.starts_at} onChange={e => setPromoForm(f => ({...f, starts_at: e.target.value}))} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Hasta (opcional)</label>
                    <input type="datetime-local" value={promoForm.ends_at} onChange={e => setPromoForm(f => ({...f, ends_at: e.target.value}))} className={inputCls} />
                  </div>
                </div>
                <button type="submit" disabled={savingPromo}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-black font-bold px-6 py-2.5 rounded-full text-sm transition-all">
                  {savingPromo ? 'Creando...' : '+ Crear promoción'}
                </button>
              </form>
            </div>
            {promoLoading ? <p className="text-center py-8 text-gray-500">Cargando...</p> :
              promotions.length === 0 ? <p className="text-center py-8 text-gray-500">No hay promociones creadas</p> : (
              <div className="space-y-3">
                {promotions.map(p => {
                  const now = new Date()
                  const inRange = (!p.starts_at || new Date(p.starts_at) <= now) && (!p.ends_at || new Date(p.ends_at) >= now)
                  const running = p.active && inRange
                  return (
                    <div key={p.id} className={`bg-[#0d0d0d] border rounded-2xl p-4 ${p.active ? 'border-gray-700' : 'border-gray-800 opacity-60'}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-cream font-bold">{p.name}</span>
                            {running && <span className="text-xs bg-green-500/20 text-green-400 border border-green-700 px-2 py-0.5 rounded-full">Activa ahora</span>}
                            {p.active && !inRange && <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-700 px-2 py-0.5 rounded-full">Fuera de horario</span>}
                          </div>
                          <p className="text-gray-500 text-sm">
                            {p.discount_type === 'percentage' ? `${p.discount_value}%` : `$${parseInt(p.discount_value).toLocaleString('es-AR')}`} off
                            {' · '}{p.applies_to === 'all' ? 'Todo el pedido' : p.applies_to === 'category' ? `Cat: ${p.applies_value}` : `Prod: ${p.applies_value}`}
                            {parseInt(p.min_order) > 0 && ` · Mínimo ${formatPrice(parseInt(p.min_order))}`}
                          </p>
                          {p.description && <p className="text-gray-400 text-xs mt-0.5">{p.description}</p>}
                          {(p.starts_at || p.ends_at) && (
                            <p className="text-gray-600 text-xs mt-1">
                              {p.starts_at && `Desde ${new Date(p.starts_at).toLocaleDateString('es-AR')}`}
                              {p.starts_at && p.ends_at && ' · '}
                              {p.ends_at && `Hasta ${new Date(p.ends_at).toLocaleDateString('es-AR')}`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <Toggle value={p.active} onChange={v => togglePromo(p.id, v)} />
                          <button onClick={() => deletePromo(p.id)} className="text-gray-600 hover:text-red-400 transition-colors">✕</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── RESEÑAS ── */}
        {section === 'resenas' && (
          <>
            {/* Formulario nueva reseña */}
            <div className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-5 mb-6">
              <h3 className="text-cream font-bold mb-4">Agregar reseña</h3>
              <form onSubmit={createReview} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Nombre del cliente *</label>
                    <input required value={reviewForm.autor}
                      onChange={e => setReviewForm(f => ({...f, autor: e.target.value}))}
                      placeholder="Ej: María García" maxLength={80} className={inputCls} />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-gray-500 text-xs mb-1 block">Fecha (opcional)</label>
                      <input value={reviewForm.fecha}
                        onChange={e => setReviewForm(f => ({...f, fecha: e.target.value}))}
                        placeholder="Ej: Marzo 2025" maxLength={30} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs mb-1 block">Estrellas</label>
                      <select value={reviewForm.rating}
                        onChange={e => setReviewForm(f => ({...f, rating: parseInt(e.target.value)}))}
                        className={`${selectCls} w-24`}>
                        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Texto de la reseña *</label>
                  <textarea required value={reviewForm.texto}
                    onChange={e => setReviewForm(f => ({...f, texto: e.target.value}))}
                    placeholder="Copiá el texto de la reseña de Google..." rows={3} maxLength={500}
                    className={`${inputCls} resize-none`} />
                </div>
                <button type="submit" disabled={savingReview}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-black font-bold px-6 py-2.5 rounded-full text-sm transition-all">
                  {savingReview ? 'Guardando...' : '+ Agregar reseña'}
                </button>
              </form>
            </div>

            {/* Lista de reseñas */}
            {reviewsLoading ? (
              <p className="text-center py-8 text-gray-500">Cargando reseñas...</p>
            ) : reviews.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No hay reseñas. Agregá las de Google acá.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className={`bg-[#0d0d0d] border rounded-2xl p-4 transition-all ${r.visible ? 'border-gray-700' : 'border-gray-800 opacity-50'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-cream font-semibold text-sm">{r.autor}</span>
                          <span className="text-orange-400 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                          {r.fecha && <span className="text-gray-600 text-xs">{r.fecha}</span>}
                          {r.visible
                            ? <span className="text-xs bg-green-500/20 text-green-400 border border-green-700 px-2 py-0.5 rounded-full">Visible</span>
                            : <span className="text-xs bg-gray-500/20 text-gray-500 border border-gray-700 px-2 py-0.5 rounded-full">Oculta</span>
                          }
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">"{r.texto}"</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Toggle value={r.visible} onChange={v => toggleReview(r.id, v)} />
                        <button onClick={() => deleteReview(r.id)} className="text-gray-600 hover:text-red-400 transition-colors">✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── ABANDONADOS ── */}
        {section === 'abandonados' && (
          <>
            <p className="text-gray-500 text-sm mb-6">Clientes que armaron un carrito y no completaron la compra. Contactalos para cerrar la venta.</p>
            {abandonedLoading ? (
              <p className="text-center py-8 text-gray-500">Cargando...</p>
            ) : abandonedCarts.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No hay carritos abandonados registrados aún.</p>
            ) : (
              <div className="space-y-3">
                {abandonedCarts.map(c => {
                  const items = typeof c.cart_items === 'string' ? JSON.parse(c.cart_items) : (c.cart_items || [])
                  const waPhone = c.customer_phone?.replace(/\D/g, '')
                  const waMsg = encodeURIComponent(`Hola ${c.customer_name || ''}! Vi que dejaste tu pedido sin completar en Dr. Empanada 🫔 ¿Querés que te lo preparemos?`)
                  return (
                    <div key={c.id} className={`bg-[#0d0d0d] border rounded-2xl p-4 transition-all ${c.contacted ? 'border-gray-800 opacity-60' : 'border-yellow-800/50'}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {c.customer_name && <span className="text-cream font-semibold text-sm">{c.customer_name}</span>}
                            {c.customer_phone && <span className="text-gray-400 text-sm">{c.customer_phone}</span>}
                            {c.contacted && <span className="text-xs bg-green-500/20 text-green-400 border border-green-700 px-2 py-0.5 rounded-full">Contactado</span>}
                            {!c.contacted && <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-700 px-2 py-0.5 rounded-full">Sin contactar</span>}
                          </div>
                          <p className="text-gray-500 text-xs mb-1">
                            {new Date(c.created_at).toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                            {c.cart_total > 0 && ` · Total: $${parseInt(c.cart_total).toLocaleString('es-AR')}`}
                          </p>
                          {items.length > 0 && (
                            <p className="text-gray-600 text-xs">{items.map(i => `${i.qty}× ${i.nombre}`).join(', ')}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {waPhone && (
                            <a href={`https://wa.me/549${waPhone}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                              onClick={() => markContacted(c.id)}
                              className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white font-bold px-3 py-1.5 rounded-full text-xs transition-colors">
                              <span>📱</span> WhatsApp
                            </a>
                          )}
                          {!c.contacted && (
                            <button onClick={() => markContacted(c.id)} className="text-gray-600 hover:text-green-400 text-xs transition-colors">
                              ✓ Contactado
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── MÉTRICAS ── */}
        {section === 'metricas' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-cream font-bold text-lg">Análisis y métricas</h3>
              <button onClick={fetchMetrics}
                className="text-gray-400 hover:text-orange-500 text-sm border border-gray-700 hover:border-orange-500 px-3 py-1.5 rounded-full transition-colors">
                {metricsLoading ? '...' : '↻ Actualizar'}
              </button>
            </div>
            {metricsLoading ? (
              <p className="text-center py-20 text-gray-500">Calculando métricas...</p>
            ) : !metrics ? (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-4">Hacé click en "Actualizar" para cargar las métricas.</p>
                <button onClick={fetchMetrics} className="bg-orange-500 hover:bg-orange-600 text-black font-bold px-6 py-2.5 rounded-full text-sm">Cargar métricas</button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Ingresos totales', value: fmtRevenue(metrics.totals?.total_revenue), sub: `${metrics.totals?.total_orders} pedidos`, color: 'text-orange-400' },
                    { label: 'Ticket promedio', value: fmtRevenue(metrics.totals?.avg_order_value), sub: 'por pedido', color: 'text-orange-400' },
                    { label: 'Hoy', value: fmtRevenue(metrics.today?.revenue), sub: `${metrics.today?.orders} pedidos`, color: 'text-green-400' },
                    { label: 'Esta semana', value: fmtRevenue(metrics.weekRevenue?.revenue), sub: `${metrics.weekRevenue?.orders} pedidos`, color: 'text-blue-400' },
                  ].map(kpi => (
                    <div key={kpi.label} className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-4 text-center">
                      <p className={`text-2xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
                      <p className="text-gray-400 text-xs mt-1 font-medium">{kpi.label}</p>
                      <p className="text-gray-600 text-xs">{kpi.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Daily Revenue Chart */}
                {(() => {
                  const filled = fillDailyData(metrics.dailyRevenue, 14)
                  const maxRev = Math.max(...filled.map(d => parseInt(d.revenue) || 0), 1)
                  return (
                    <div className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-5">
                      <h4 className="text-cream font-bold mb-1 text-sm">Ingresos — últimos 14 días</h4>
                      <p className="text-gray-600 text-xs mb-4">Máximo: {fmtRevenue(maxRev)}</p>
                      <div className="flex items-end gap-1 h-28">
                        {filled.map((d, i) => {
                          const rev = parseInt(d.revenue) || 0
                          const h = rev > 0 ? Math.max((rev / maxRev) * 100, 4) : 0
                          const label = new Date(d.date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
                          return (
                            <div key={i} title={`${label}: ${fmtRevenue(rev)} · ${d.orders} pedidos`}
                              className="flex-1 flex flex-col justify-end cursor-default group">
                              <div className="w-full bg-orange-500 group-hover:bg-orange-400 rounded-t transition-colors"
                                style={{ height: h > 0 ? `${h}%` : '2px', opacity: h > 0 ? 1 : 0.2 }} />
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex mt-2">
                        {filled.map((d, i) => (
                          <div key={i} className="flex-1 text-center">
                            {i % 2 === 0 && (
                              <span className="text-gray-700 text-xs">
                                {new Date(d.date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Products */}
                  {metrics.topProducts && metrics.topProducts.length > 0 && (() => {
                    const maxQty = Math.max(...metrics.topProducts.map(p => parseInt(p.total_qty) || 0), 1)
                    return (
                      <div className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-5">
                        <h4 className="text-cream font-bold mb-4 text-sm">Top productos (por unidades)</h4>
                        <div className="space-y-3">
                          {metrics.topProducts.slice(0, 8).map((p, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-gray-600 text-xs w-4 text-right shrink-0">{i + 1}</span>
                              <span className="text-gray-300 text-sm truncate w-28 shrink-0">{p.nombre}</span>
                              <div className="flex-1 bg-gray-800 rounded-full h-2">
                                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(parseInt(p.total_qty) / maxQty) * 100}%` }} />
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-orange-400 text-sm font-bold">{p.total_qty}</span>
                                <span className="text-gray-600 text-xs block">{fmtRevenue(p.total_revenue)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  <div className="space-y-4">
                    {/* Payment Methods */}
                    {metrics.paymentMethods && metrics.paymentMethods.length > 0 && (
                      <div className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-5">
                        <h4 className="text-cream font-bold mb-4 text-sm">Métodos de pago</h4>
                        <div className="space-y-2">
                          {metrics.paymentMethods.map((m, i) => {
                            const icons = { efectivo: '💵', transferencia: '📲', tarjeta: '💳' }
                            const labels = { efectivo: 'Efectivo', transferencia: 'Transferencia', tarjeta: 'Tarjeta' }
                            const total = metrics.paymentMethods.reduce((s, x) => s + parseInt(x.count), 0)
                            const pct = total > 0 ? Math.round((parseInt(m.count) / total) * 100) : 0
                            return (
                              <div key={i} className="flex items-center justify-between gap-3">
                                <span className="text-gray-300 text-sm shrink-0">{icons[m.payment_method]} {labels[m.payment_method] || m.payment_method}</span>
                                <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                                  <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-gray-400 text-sm shrink-0">{m.count} ({pct}%)</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {/* Delivery split */}
                    {metrics.deliveryTypes && metrics.deliveryTypes.length > 0 && (
                      <div className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-5">
                        <h4 className="text-cream font-bold mb-4 text-sm">Tipo de entrega</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {metrics.deliveryTypes.map((d, i) => {
                            const total = metrics.deliveryTypes.reduce((s, x) => s + parseInt(x.count), 0)
                            const pct = total > 0 ? Math.round((parseInt(d.count) / total) * 100) : 0
                            return (
                              <div key={i} className="text-center bg-black rounded-xl p-3">
                                <p className="text-2xl">{d.delivery_type === 'delivery' ? '🛵' : '🏪'}</p>
                                <p className="text-cream font-bold text-lg">{pct}%</p>
                                <p className="text-gray-500 text-xs">{d.delivery_type === 'delivery' ? 'Delivery' : 'Retiro'}</p>
                                <p className="text-gray-600 text-xs">{d.count} pedidos</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    <div className="bg-[#0d0d0d] border border-gray-800 rounded-2xl p-4 flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Pedidos cancelados (total)</span>
                      <span className="text-red-400 font-bold text-lg">{metrics.totals?.cancelled_orders}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

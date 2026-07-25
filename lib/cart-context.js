'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [ready, setReady] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dr_empanada_cart')
      if (saved) setCart(JSON.parse(saved))
    } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem('dr_empanada_cart', JSON.stringify(cart)) } catch {}
  }, [cart, ready])

  const addToCart = useCallback((product, cookingMethod = null) => {
    const desiredKey = product.key || (cookingMethod ? `${product.id}_${cookingMethod}` : product.id)
    const newKey = cookingMethod ? `${product.id}_${cookingMethod}` : product.id
    setCart(prev => {
      const byKey = prev.find(i => i.key === desiredKey) || prev.find(i => i.key === newKey)
      if (byKey) return prev.map(i => i.key === byKey.key ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1, key: newKey, cooking_method: cookingMethod }]
    })
  }, [])

  const addComboToCart = useCallback((combo, selections) => {
    const key = `${combo.id}_${Date.now()}`
    setCart(prev => [...prev, { ...combo, qty: 1, key, selections, cooking_method: null }])
  }, [])

  const removeFromCart = useCallback((key) => {
    setCart(prev => {
      const item = prev.find(i => i.key === key)
      if (!item) return prev
      if (item.qty === 1) return prev.filter(i => i.key !== key)
      return prev.map(i => i.key === key ? { ...i, qty: i.qty - 1 } : i)
    })
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  return (
    <CartContext.Provider value={{ cart, addToCart, addComboToCart, removeFromCart, clearCart, cartOpen, setCartOpen }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}

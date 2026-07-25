'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/menu', label: 'Menú' },
  { href: '/contacto', label: 'Contacto' },
]

function WaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.122 1.524 5.855L.057 23.882a.5.5 0 0 0 .615.612l6.162-1.615A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.66-.523-5.17-1.432l-.37-.22-3.812.998.977-3.701-.242-.381A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  )
}

function IgIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  )
}

function FbIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { cart, setCartOpen } = useCart()
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 border-b border-orange-600 ${
      scrolled ? 'bg-black/90 backdrop-blur-md shadow-lg shadow-black/50' : 'bg-black/80'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-20 relative">

          {/* Izquierda: redes sociales */}
          <div className="flex items-center gap-4">
            <Link href="https://wa.me/5491132456209" target="_blank" rel="noopener noreferrer"
              className="text-gray-300 hover:text-green-400 transition-colors" aria-label="WhatsApp">
              <WaIcon />
            </Link>
            <Link href="https://www.instagram.com/drempanada.arg" target="_blank" rel="noopener noreferrer"
              className="text-gray-300 hover:text-orange-500 transition-colors" aria-label="Instagram">
              <IgIcon />
            </Link>
            <Link href="https://www.facebook.com/SoufleDevoto" target="_blank" rel="noopener noreferrer"
              className="text-gray-300 hover:text-orange-500 transition-colors" aria-label="Facebook">
              <FbIcon />
            </Link>
          </div>

          {/* Centro: logo grande centrado que desborda hacia abajo */}
          <div className="relative h-full flex justify-center">
            <Link href="/" className="absolute top-1 z-10">
              <Image
                src="/images/logo.png"
                alt="Dr. Empanada"
                width={130}
                height={130}
                className="object-contain drop-shadow-2xl transition-transform duration-300 hover:scale-110 cursor-pointer"
              />
            </Link>
          </div>

          {/* Derecha: nav desktop */}
          <div className="hidden md:flex items-center justify-end gap-4">
            <div className="flex items-center gap-4">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`font-medium text-sm transition-colors whitespace-nowrap ${
                    pathname === href ? 'text-orange-500' : 'text-cream/80 hover:text-orange-500'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {cartCount > 0 && pathname !== '/pedir' && (
                <button
                  onClick={() => { setCartOpen(true); router.push('/pedir') }}
                  className="inline-flex items-center gap-1.5 border border-orange-500 text-orange-400 hover:bg-orange-500/10 font-bold py-2 px-4 rounded-full text-sm transition-all hover:scale-105"
                >
                  <span>🛒</span>
                  <span className="bg-orange-500 text-black text-xs font-extrabold rounded-full w-5 h-5 flex items-center justify-center leading-none">{cartCount}</span>
                </button>
              )}
              {pathname === '/pedir' ? (
                <button
                  onClick={() => setCartOpen(true)}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 px-5 rounded-full text-sm transition-all hover:scale-105 whitespace-nowrap"
                >
                  Pedí ya
                </button>
              ) : (
                <Link
                  href="/pedir"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-bold py-2 px-5 rounded-full text-sm transition-all hover:scale-105 whitespace-nowrap"
                >
                  Pedí ya
                </Link>
              )}
            </div>
          </div>

          {/* Hamburger (mobile) */}
          <div className="md:hidden flex items-center justify-end gap-2">
            {cartCount > 0 && pathname !== '/pedir' && (
              <button
                onClick={() => { setCartOpen(true); router.push('/pedir') }}
                className="relative text-orange-400 p-2"
                aria-label="Ver carrito"
              >
                <span className="text-xl">🛒</span>
                <span className="absolute top-0.5 right-0.5 bg-orange-500 text-black text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center leading-none">{cartCount}</span>
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-cream p-2"
              aria-label="Menú"
            >
              <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <div className={`w-6 h-0.5 bg-current my-1.5 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
              <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Menú mobile */}
      <div className={`md:hidden bg-black/95 backdrop-blur-md border-t border-orange-900 transition-all duration-300 ${isOpen ? 'max-h-72' : 'max-h-0 overflow-hidden'}`}>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setIsOpen(false)}
            className={`block px-6 py-4 font-medium transition-colors border-b border-gray-900 ${
              pathname === href ? 'text-orange-500' : 'text-cream/80 hover:text-orange-500 hover:bg-black/40'
            }`}
          >
            {label}
          </Link>
        ))}
        <Link
          href="/pedir"
          onClick={() => setIsOpen(false)}
          className="block px-6 py-4 text-orange-500 font-bold hover:bg-black/60"
        >
          📱 Pedí ya
        </Link>
      </div>
    </nav>
  )
}

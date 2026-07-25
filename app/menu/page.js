import Link from 'next/link'
import Image from 'next/image'
import ScrollReveal from '@/components/ScrollReveal'
import { PRODUCTS, formatPrice } from '@/lib/products'
import { getDb } from '@/lib/db'

export const revalidate = 60

export const metadata = {
  title: 'Menú - Dr. Empanada',
  description: 'Menú completo de Dr. Empanada. Clásicas, especiales, pastelitos y combos artesanales en Villa Devoto.',
}

async function getCustomProducts() {
  try {
    const sql = getDb()
    return await sql`SELECT * FROM custom_products WHERE active = true AND (archived IS NULL OR archived = false) ORDER BY created_at ASC`
  } catch { return [] }
}

const clasicasBase  = PRODUCTS.filter(p => p.category === 'Clásicas')
const especialesBase = PRODUCTS.filter(p => p.category === 'Especiales')
const pastelitosBase = PRODUCTS.filter(p => p.category === 'Pastelitos y Postres')
const combosBase     = PRODUCTS.filter(p => p.category === 'Combos')

function ProductCard({ img, img_url, nombre, desc, descripcion, emoji, price }) {
  const imgSrc = img || img_url || null
  const descText = desc || descripcion || ''
  return (
    <div className="bg-black rounded-2xl overflow-hidden border border-gray-800 hover:border-orange-500 transition-all hover:-translate-y-1 group flex flex-col">
      <div className="relative h-44 overflow-hidden bg-black flex-shrink-0">
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-black">
            {emoji}
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-cream mb-1">{nombre}</h3>
        <p className="text-gray-400 text-sm leading-relaxed flex-1">{descText}</p>
        {price && (
          <p className="text-orange-500 font-extrabold text-lg mt-3">{formatPrice(price)}</p>
        )}
      </div>
    </div>
  )
}

function ComboCard({ nombre, desc, descripcion, emoji, img_url, price }) {
  const descText = desc || descripcion || ''
  return (
    <div className="bg-black rounded-2xl border border-gray-800 hover:border-orange-500 transition-all hover:-translate-y-1 group flex items-center gap-5 p-5">
      {img_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img_url} alt={nombre} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="text-5xl flex-shrink-0 group-hover:scale-110 transition-transform">{emoji}</div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-cream mb-1">{nombre}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{descText}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-orange-500 font-extrabold text-lg">{formatPrice(price)}</p>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <ScrollReveal>
      <div className="flex items-center gap-4 mb-10">
        <div className="h-px flex-1 bg-gray-800" />
        <h2 className="text-3xl font-bold text-orange-500 whitespace-nowrap">{children}</h2>
        <div className="h-px flex-1 bg-gray-800" />
      </div>
    </ScrollReveal>
  )
}

export default async function Menu() {
  const customProds = await getCustomProducts()

  const STATIC_CATS = ['Clásicas', 'Especiales', 'Pastelitos y Postres', 'Combos']
  const customByCat = {}
  customProds.forEach(p => {
    if (!customByCat[p.category]) customByCat[p.category] = []
    customByCat[p.category].push(p)
  })

  const clasicas   = [...clasicasBase,   ...(customByCat['Clásicas'] || [])]
  const especiales = [...especialesBase, ...(customByCat['Especiales'] || [])]
  const pastelitos = [...pastelitosBase, ...(customByCat['Pastelitos y Postres'] || [])]
  const combos     = [...combosBase,     ...(customByCat['Combos'] || [])]
  const newCats    = Object.keys(customByCat).filter(c => !STATIC_CATS.includes(c))

  return (
    <div className="bg-black min-h-screen">
      {/* ── Header ── */}
      <section className="py-28 bg-[radial-gradient(ellipse_at_top,_rgba(255,102,0,0.18),_transparent_70%)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in-up">
            Nuestro <span className="text-orange-500">Menú</span>
          </h1>
          <p className="text-xl text-gray-300 mb-2 animate-fade-in-up delay-200">
            Elaboradas artesanalmente. Disponibles fritas en grasa o al horno.
          </p>
          <p className="text-gray-500 text-sm mb-8 animate-fade-in-up delay-200">
            Precios por unidad · Los combos tienen su propia sección
          </p>
          <div className="animate-fade-in-up delay-300">
            <Link
              href="/pedir"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-black font-bold py-4 px-10 rounded-full text-lg transition-all hover:scale-105 shadow-lg shadow-orange-500/20"
            >
              📱 Pedí ahora online
            </Link>
          </div>
        </div>
      </section>

      {/* ── Clásicas ── */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle>Clásicas</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clasicas.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 60}>
                <ProductCard {...p} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Especiales ── */}
      <section className="py-14 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle>Especiales</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {especiales.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 80}>
                <ProductCard {...p} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pastelitos y Postres ── */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle>Pastelitos y Postres</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pastelitos.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 80}>
                <ProductCard {...p} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categorías personalizadas (Bebidas, etc.) ── */}
      {newCats.map(cat => (
        <section key={cat} className="py-14 bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle>{cat}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(customByCat[cat] || []).map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 60}>
                  <ProductCard {...p} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ── Combos y Promos ── */}
      <section className="py-14 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle>Combos y Promos</SectionTitle>
          <p className="text-gray-500 text-sm text-center -mt-6 mb-10">
            Empanadas clásicas a elección · fritas en grasa o al horno
          </p>
          <div className="flex flex-col gap-4">
            {combos.map((c, i) => (
              <ScrollReveal key={c.id} delay={i * 60}>
                <ComboCard {...c} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-24">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-8">
              <p className="text-orange-400 font-medium text-lg mb-2">¿Ya sabés lo que querés?</p>
              <p className="text-gray-300 mb-6">Hacé tu pedido online o escribinos por WhatsApp.</p>
              <Link
                href="/pedir"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 px-8 rounded-full transition-all hover:scale-105"
              >
                📱 Pedí ya online
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  )
}

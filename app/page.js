import Link from 'next/link'
import Image from 'next/image'
import ScrollReveal from '@/components/ScrollReveal'
import ReviewsSlider from '@/components/ReviewsSlider'
import { getDb } from '@/lib/db'

export const revalidate = 60

const SEED_REVIEWS = [
  { autor: 'Daniel Gómez', rating: 5, fecha: 'Hace 2 meses', visible: true, texto: 'La verdad, son super recomendables... Había probado las hechas al horno y hoy probé las fritas... son un manjar. El relleno es más que abundante y muy jugosas. Además los pastelitos ni que decirles. La atención de Matias un 10 !!' },
  { autor: 'Franco Mantegazza', rating: 5, fecha: 'Hace 5 meses', visible: true, texto: 'Las mejores empanadas souffle del barrio, sin duda voy a volver a pedir. Muy ricos pastelitos también!! 10/10' },
  { autor: 'Matias Medina', rating: 5, fecha: 'Hace 2 meses', visible: true, texto: 'Excelente lugar en el barrio de devoto para pedir unas ricas empanadas. Fritas o al horno, son una bomba.' },
  { autor: 'ruso boedo', rating: 5, fecha: 'Hace 2 meses', visible: true, texto: 'Las mejores empanadas y postres. Si están buscando sabor, buena calidad de productos, no duden en pedir acá, riquísimo todo!' },
  { autor: 'Julián Bellandi', rating: 5, fecha: 'Hace 3 meses', visible: true, texto: 'Excelente, rápido y rico. Vale destacar sus rellenos potentes y la buena atención!!!' },
]

async function getVisibleReviews() {
  try {
    const sql = getDb()
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM reviews`
    if (count === 0) {
      for (const r of SEED_REVIEWS) {
        await sql`INSERT INTO reviews (autor, texto, rating, fecha, visible) VALUES (${r.autor}, ${r.texto}, ${r.rating}, ${r.fecha}, ${r.visible})`
      }
    }
    return await sql`SELECT * FROM reviews WHERE visible = true ORDER BY id ASC`
  } catch { return [] }
}

const featured = [
  { img: '/images/menu/carne-suave.png',   nombre: 'Carne Suave',   desc: 'Carne vacuna, cebolla, huevo duro y aceitunas. Un clásico eterno.' },
  { img: '/images/menu/carne-cuchillo.jpg', nombre: 'Carne Cuchillo', desc: 'Cortada a cuchillo, con más textura y sabor en cada bocado.' },
  { img: '/images/menu/cheeseburger.jpg',   nombre: 'Cheeseburguer',  desc: 'El sabor de una hamburguesa clásica en formato empanada.' },
]

const razones = [
  { icon: '📅', titulo: 'Desde 1989', desc: 'Más de 35 años elaborando empanadas artesanales en Villa Devoto.' },
  { icon: '🌿', titulo: 'Materia prima', desc: 'Ingredientes frescos seleccionados para potenciar el sabor.' },
  { icon: '🤌', titulo: 'Masa artesanal', desc: 'Rellenos generosos y masa hecha a mano con dedicación.' },
]

export default async function Home() {
  const reviews = await getVisibleReviews()
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-end justify-center overflow-hidden pb-24 sm:pb-32">
        {/* Contenido */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-extrabold mb-4 leading-tight animate-fade-in-up delay-100 drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            <span className="text-orange-500">Dr.</span>
            <span className="text-cream">Empanada</span>
          </h1>
          <p className="text-orange-400 font-semibold text-lg mb-3 animate-fade-in-up delay-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Villa Devoto, CABA · Desde 1989
          </p>
          <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Empanadas artesanales con rellenos generosos y masa hecha a mano. Clásicas y especiales para todos los gustos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
            <Link
              href="/pedir"
              className="bg-orange-500 hover:bg-orange-600 text-black font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-orange-500/30"
            >
              📱 Pedí ya
            </Link>
            <Link
              href="/menu"
              className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black font-bold py-4 px-10 rounded-full text-lg transition-all"
            >
              Ver menú
            </Link>
          </div>
        </div>

      </section>

      {/* ── Por qué elegirnos ── */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              ¿Por qué <span className="text-orange-500">elegirnos</span>?
            </h2>
            <p className="text-gray-400 text-lg">Sabor, consistencia y satisfacción garantizados</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {razones.map((r, i) => (
              <ScrollReveal key={r.titulo} delay={i * 120}>
                <div className="text-center p-10 bg-black rounded-2xl border border-gray-800 hover:border-orange-500 transition-colors group h-full">
                  <div className="text-5xl mb-5 group-hover:scale-110 transition-transform">{r.icon}</div>
                  <h3 className="text-xl font-bold text-orange-500 mb-3">{r.titulo}</h3>
                  <p className="text-gray-400">{r.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reseñas de Google ── */}
      {reviews.length > 0 && (
        <section className="py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Lo que dicen <span className="text-orange-500">nuestros clientes</span>
              </h2>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">4.5 en Google Maps</span>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <ReviewsSlider reviews={reviews} />
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── Productos destacados ── */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Las <span className="text-orange-500">favoritas</span>
            </h2>
            <p className="text-gray-400 text-lg">Lo que más nos piden</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((p, i) => (
              <ScrollReveal key={p.nombre} delay={i * 130}>
                <div className="bg-black rounded-2xl overflow-hidden border border-gray-800 hover:border-orange-500 transition-all hover:-translate-y-2 group h-full">
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={p.img}
                      alt={p.nombre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-orange-500 mb-2">{p.nombre}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal className="text-center mt-12">
            <Link
              href="/menu"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-black font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105"
            >
              Ver menú completo
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Galería ── */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Nuestro <span className="text-orange-500">local</span>
            </h2>
            <p className="text-gray-400 text-lg">Melincué 4399, Villa Devoto</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { src: '/images/nosotros/foto1.jpg', alt: 'Interior del local de Dr. Empanada en Villa Devoto' },
              { src: '/images/nosotros/foto2.jpg', alt: 'Equipo y mostrador de Dr. Empanada' },
              { src: '/images/nosotros/foto3.jpg', alt: 'Empanadas artesanales recién preparadas en Dr. Empanada' },
            ].map(({ src, alt }, i) => (
              <ScrollReveal key={src} delay={i * 100}>
                <div className="relative h-64 rounded-2xl overflow-hidden group">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA WhatsApp ── */}
      <section className="py-24 bg-orange-500">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">¿Listo para pedir?</h2>
            <p className="text-black/75 text-xl mb-10">Escribinos por WhatsApp y te atendemos al instante.</p>
            <Link
              href="/pedir"
              className="inline-block bg-black hover:bg-black/80 text-white font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105"
            >
              📱 Pedí ya online
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  )
}

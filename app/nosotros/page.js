import Link from 'next/link'
import Image from 'next/image'
import ScrollReveal from '@/components/ScrollReveal'

export const metadata = {
  title: 'Nosotros - Dr. Empanada',
  description: 'Conocé la historia de Dr. Empanada, empanadas artesanales en Villa Devoto desde 1989.',
}

const valores = [
  { icon: '🌿', titulo: 'Calidad', desc: 'Materia prima seleccionada. Nunca bajamos el estándar.' },
  { icon: '🤝', titulo: 'Compromiso', desc: 'Mejora constante en procesos para garantizar sabor y consistencia.' },
  { icon: '🤌', titulo: 'Artesanal', desc: 'Masa y rellenos hechos a mano, como siempre se hizo.' },
  { icon: '❤️', titulo: 'Pasión', desc: 'Más de 35 años dedicados a la gastronomía con identidad propia.' },
]

export default function Nosotros() {
  return (
    <div className="bg-black min-h-screen">
      {/* ── Header con foto de fondo ── */}
      <section className="relative py-40 overflow-hidden">
        <Image
          src="/images/nosotros/foto2.jpg"
          alt="Dr. Empanada local"
          fill
          className="object-cover brightness-[0.2]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in-up">
            Sobre <span className="text-orange-500">nosotros</span>
          </h1>
          <p className="text-xl text-gray-300 animate-fade-in-up delay-200">
            Empanadas artesanales en Villa Devoto desde 1989
          </p>
        </div>
      </section>

      {/* ── Historia ── */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <ScrollReveal className="animate-slide-left">
              <h2 className="text-3xl font-bold text-orange-500 mb-6">Nuestra historia</h2>
              <p className="text-gray-300 mb-5 leading-relaxed text-lg">
                Dr. Empanada nació en <strong className="text-cream">1989</strong> en el corazón de Villa Devoto, Buenos Aires.
                Durante más de tres décadas hemos mantenido viva la tradición de la empanada artesanal argentina.
              </p>
              <p className="text-gray-300 mb-5 leading-relaxed text-lg">
                Desde <strong className="text-cream">2006</strong>, bajo la dirección actual, apostamos por la mejora continua:
                mejores ingredientes, nuevas recetas especiales y un proceso más cuidado, sin perder nunca la esencia artesanal que nos define.
              </p>
              <p className="text-gray-300 leading-relaxed text-lg">
                Hoy ofrecemos empanadas clásicas y especiales con rellenos generosos y masa artesanal, disponibles fritas en grasa o al horno, acompañadas de nuestros pastelitos.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl shadow-orange-900/20">
                <Image
                  src="/images/nosotros/foto3.jpg"
                  alt="Empanadas artesanales"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-orange-500 font-bold text-lg">Artesanales desde el primer día</p>
                  <p className="text-gray-300 text-sm">Villa Devoto, CABA</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-black">
            {[
              { num: '+35', label: 'Años de trayectoria' },
              { num: '19',  label: 'Variedades en el menú' },
              { num: '❤️',  label: 'Hechas con amor' },
            ].map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 100}>
                <div>
                  <p className="text-5xl font-extrabold mb-2">{s.num}</p>
                  <p className="text-black/70 font-medium">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Galería ── */}
      <section className="py-20 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nuestro <span className="text-orange-500">local</span>
            </h2>
            <p className="text-gray-400">Melincué 4399, Villa Devoto, CABA</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['/images/nosotros/foto1.jpg', '/images/nosotros/foto2.jpg', '/images/nosotros/foto3.jpg'].map((src, i) => (
              <ScrollReveal key={src} delay={i * 100}>
                <div className="relative h-64 rounded-2xl overflow-hidden group">
                  <Image
                    src={src}
                    alt={`Foto del local ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Valores ── */}
      <section className="py-20 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nuestros <span className="text-orange-500">valores</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map((v, i) => (
              <ScrollReveal key={v.titulo} delay={i * 100}>
                <div className="bg-black rounded-2xl p-8 border border-gray-800 hover:border-orange-500 transition-colors text-center group h-full">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{v.icon}</div>
                  <h3 className="text-orange-500 font-bold text-lg mb-2">{v.titulo}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-black">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">
              ¿Querés conocer nuestro <span className="text-orange-500">menú</span>?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/menu" className="inline-block bg-orange-500 hover:bg-orange-600 text-black font-bold py-4 px-8 rounded-full text-lg transition-all hover:scale-105">
                Ver menú completo
              </Link>
              <Link href="https://wa.me/5491132456209" target="_blank" rel="noopener noreferrer" className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all hover:scale-105">
                📱 Pedí ya
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  )
}

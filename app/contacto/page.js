import Link from 'next/link'
import ContactForm from '@/components/ContactForm'

export const metadata = {
  title: 'Contacto - Dr. Empanada',
  description: 'Contactate con Dr. Empanada en Villa Devoto. WhatsApp, Instagram y más.',
}

const info = [
  {
    icon: '📍',
    label: 'Dirección',
    value: 'Melincué 4399, Villa Devoto, CABA',
    href: 'https://maps.google.com/?q=-34.610505,-58.506771',
  },
  {
    icon: '📱',
    label: 'WhatsApp',
    value: '+54 9 11 3245-6209',
    href: 'https://wa.me/5491132456209',
  },
  {
    icon: '📸',
    label: 'Instagram',
    value: '@drempanada.arg',
    href: 'https://www.instagram.com/drempanada.arg',
  },
  {
    icon: '👥',
    label: 'Facebook',
    value: 'SoufleDevoto',
    href: 'https://www.facebook.com/SoufleDevoto',
  },
]

export default function Contacto() {
  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <section className="py-28 bg-[radial-gradient(ellipse_at_top,_rgba(255,102,0,0.15),_transparent_70%)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            <span className="text-orange-500">Contacto</span>
          </h1>
          <p className="text-xl text-gray-300">Estamos en Villa Devoto. ¡Escribinos cuando quieras!</p>
        </div>
      </section>

      <section className="py-16 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-8">Encontranos</h2>
              <div className="space-y-4 mb-8">
                {info.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-5 bg-black rounded-2xl border border-gray-800 hover:border-orange-500 transition-colors group"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="text-orange-500 font-semibold text-xs uppercase tracking-widest mb-0.5">{item.label}</p>
                      <p className="text-cream group-hover:text-orange-400 transition-colors">{item.value}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Mapa */}
              <div className="rounded-2xl overflow-hidden border border-gray-800">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.1!2d-58.506771!3d-34.610505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzM3LjgiUyA1OMKwMzAnMjQuNCJX!5e0!3m2!1ses!2sar!4v1"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Dr. Empanada"
                />
              </div>
            </div>

            {/* Formulario */}
            <div>
              <h2 className="text-2xl font-bold text-orange-500 mb-8">Envianos un mensaje</h2>
              <ContactForm />

              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                <p className="text-green-400 text-sm">
                  Para respuestas más rápidas escribinos directamente por{' '}
                  <Link href="https://wa.me/5491132456209" target="_blank" className="font-bold underline hover:text-green-300">
                    WhatsApp
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

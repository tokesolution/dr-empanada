import Link from 'next/link'

export const metadata = {
  title: 'Productos - Dr. Empanada',
  description: 'Nuestro menú completo de empanadas artesanales.',
}

const productos = [
  { emoji: '🥩', nombre: 'Carne Suave', desc: 'Relleno de carne vacuna jugosa, cebolla, huevo duro y aceitunas con especias de la casa.', categoria: 'Carne' },
  { emoji: '🌶️', nombre: 'Carne Picante', desc: 'Carne vacuna con ají molido, pimentón y un toque picante que conquista.', categoria: 'Carne' },
  { emoji: '🍗', nombre: 'Pollo al Verdeo', desc: 'Pollo tierno desmenuzado con cebolla de verdeo y un toque de crema.', categoria: 'Pollo' },
  { emoji: '🍄', nombre: 'Pollo y Champiñones', desc: 'Pollo con champiñones salteados al ajo, hierbas frescas y queso crema.', categoria: 'Pollo' },
  { emoji: '🧀', nombre: 'Jamón y Queso', desc: 'Jamón cocido de calidad con queso cremoso que se derrite en cada bocado.', categoria: 'Clásica' },
  { emoji: '🍅', nombre: 'Caprese', desc: 'Tomate fresco, mozzarella y albahaca. Una combinación italiana irresistible.', categoria: 'Vegetariana' },
  { emoji: '🌽', nombre: 'Humita', desc: 'Choclo cremoso con cebolla, morrones y especias. Un clásico del norte.', categoria: 'Vegetariana' },
  { emoji: '🥦', nombre: 'Verdura', desc: 'Mix de vegetales frescos salteados con especias y un toque de queso.', categoria: 'Vegetariana' },
  { emoji: '🫕', nombre: 'Choclo y Queso', desc: 'Choclo dulce con queso fundido. Dulce, salado y completamente adictivo.', categoria: 'Vegetariana' },
]

const categoriaColors = {
  'Carne': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Pollo': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Clásica': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Vegetariana': 'bg-green-500/10 text-green-400 border-green-500/20',
}

export default function Productos() {
  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <section className="py-28 bg-[radial-gradient(ellipse_at_top,_rgba(255,102,0,0.15),_transparent_70%)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
            Nuestros <span className="text-orange-500">productos</span>
          </h1>
          <p className="text-xl text-gray-300">
            Todas elaboradas artesanalmente con ingredientes frescos cada día
          </p>
        </div>
      </section>

      {/* Grilla de productos */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((p) => (
              <div
                key={p.nombre}
                className="bg-black rounded-2xl p-7 border border-gray-800 hover:border-orange-500 transition-all hover:-translate-y-1 group"
              >
                <div className="text-6xl mb-4 text-center group-hover:scale-110 transition-transform">{p.emoji}</div>
                <span className={`inline-block border text-xs font-semibold px-3 py-1 rounded-full mb-3 ${categoriaColors[p.categoria]}`}>
                  {p.categoria}
                </span>
                <h3 className="text-lg font-bold text-cream mb-2">{p.nombre}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nota */}
      <section className="pb-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-8">
            <p className="text-orange-400 font-medium text-lg mb-2">¿Buscás algo especial?</p>
            <p className="text-gray-300 mb-6">
              Consultanos sobre variedades especiales o si tenés alguna restricción alimentaria.
            </p>
            <Link
              href="/contacto"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-black font-bold py-3 px-8 rounded-full transition-all"
            >
              Escribinos
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

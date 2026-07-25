import Link from 'next/link'

export const metadata = { title: 'Pago pendiente - Dr. Empanada' }

export default function PagoPendiente({ searchParams }) {
  const orderId = searchParams?.order

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">⏳</div>
        <h1 className="text-4xl font-extrabold text-cream mb-3">Pago en proceso</h1>
        <p className="text-gray-400 text-lg mb-2">
          Tu pago está siendo procesado. Te avisaremos cuando se confirme.
        </p>
        {orderId && (
          <p className="text-gray-600 text-sm mb-2">Pedido #{orderId}</p>
        )}
        <p className="text-orange-400 font-semibold mb-10">
          Te contactaremos al número que ingresaste para confirmar.
        </p>
        <Link
          href="/"
          className="inline-block border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black font-extrabold py-4 px-10 rounded-full text-lg transition-all"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

import Link from 'next/link'

export const metadata = { title: 'Pago exitoso - Dr. Empanada' }

export default function PagoExitoso({ searchParams }) {
  const orderId = searchParams?.order

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-4xl font-extrabold text-cream mb-3">¡Pago aprobado!</h1>
        <p className="text-gray-400 text-lg mb-2">Tu pedido fue registrado y pagado correctamente.</p>
        {orderId && (
          <p className="text-gray-600 text-sm mb-2">Pedido #{orderId}</p>
        )}
        <p className="text-orange-400 font-semibold mb-10">
          Te contactaremos para confirmar los detalles.
        </p>
        <Link
          href="/pedir"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-black font-extrabold py-4 px-10 rounded-full text-lg transition-all hover:scale-105"
        >
          Hacer otro pedido
        </Link>
      </div>
    </div>
  )
}

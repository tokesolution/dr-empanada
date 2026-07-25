import Link from 'next/link'

export const metadata = { title: 'Pago fallido - Dr. Empanada' }

export default function PagoFallido() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">😕</div>
        <h1 className="text-4xl font-extrabold text-cream mb-3">Pago no procesado</h1>
        <p className="text-gray-400 text-lg mb-10">
          Hubo un problema con el pago. Podés intentar de nuevo o elegir otro método de pago.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/pedir"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-black font-extrabold py-4 px-8 rounded-full text-lg transition-all hover:scale-105"
          >
            Intentar de nuevo
          </Link>
        </div>
      </div>
    </div>
  )
}

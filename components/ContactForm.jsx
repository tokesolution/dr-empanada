'use client'
import { useState } from 'react'

export default function ContactForm() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setEnviado(true)
    } catch {
      setError('No se pudo enviar el mensaje. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div className="bg-orange-500/10 border border-orange-500/40 rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-orange-500 mb-2">¡Mensaje enviado!</h3>
        <p className="text-gray-300">Te respondemos a la brevedad. ¡Gracias!</p>
        <button
          onClick={() => { setEnviado(false); setForm({ nombre: '', email: '', mensaje: '' }) }}
          className="mt-6 text-orange-500 hover:text-orange-400 underline text-sm"
        >
          Enviar otro mensaje
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Nombre</label>
        <input
          type="text"
          name="nombre"
          required
          value={form.nombre}
          onChange={handleChange}
          placeholder="Tu nombre"
          className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-cream placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
        <input
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-cream placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Mensaje</label>
        <textarea
          name="mensaje"
          required
          rows={5}
          value={form.mensaje}
          onChange={handleChange}
          placeholder="¿En qué te podemos ayudar?"
          className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-cream placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
        />
      </div>
      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-black font-bold py-4 px-8 rounded-xl text-lg transition-all"
      >
        {loading ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  )
}

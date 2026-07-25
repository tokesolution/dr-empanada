'use client'
import { useState, useEffect, useCallback } from 'react'

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-orange-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function ReviewsSlider({ reviews }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [animating, setAnimating] = useState(false)

  const go = useCallback((idx) => {
    setAnimating(true)
    setTimeout(() => {
      setCurrent((idx + reviews.length) % reviews.length)
      setAnimating(false)
    }, 180)
  }, [reviews.length])

  useEffect(() => {
    if (reviews.length <= 1 || paused) return
    const t = setInterval(() => go(current + 1), 5000)
    return () => clearInterval(t)
  }, [current, paused, reviews.length, go])

  if (!reviews.length) return null

  const r = reviews[current]

  return (
    <div
      className="relative max-w-3xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Card */}
      <div className={`bg-[#0d0d0d] border border-gray-800 rounded-2xl px-8 py-10 text-center transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        {/* Google logo */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-gray-500 text-sm font-medium">Reseña de Google</span>
        </div>

        <Stars rating={r.rating} />

        <blockquote className="mt-5 mb-6 text-gray-300 text-base md:text-lg leading-relaxed italic">
          "{r.texto}"
        </blockquote>

        <p className="text-orange-400 font-semibold text-sm">{r.autor}</p>
        {r.fecha && <p className="text-gray-600 text-xs mt-1">{r.fecha}</p>}
      </div>

      {/* Flechas */}
      {reviews.length > 1 && (
        <>
          <button
            onClick={() => go(current - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-10 h-10 rounded-full bg-[#0d0d0d] border border-gray-700 hover:border-orange-500 text-gray-400 hover:text-orange-500 flex items-center justify-center transition-all"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            onClick={() => go(current + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-10 h-10 rounded-full bg-[#0d0d0d] border border-gray-700 hover:border-orange-500 text-gray-400 hover:text-orange-500 flex items-center justify-center transition-all"
            aria-label="Siguiente"
          >
            ›
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-5">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`rounded-full transition-all ${i === current ? 'w-6 h-2 bg-orange-500' : 'w-2 h-2 bg-gray-700 hover:bg-gray-500'}`}
                aria-label={`Ir a reseña ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

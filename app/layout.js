import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { CartProvider } from '@/lib/cart-context'
import ScrollToTop from '@/components/ScrollToTop'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://dr-empanada.vercel.app'),
  title: 'Dr. Empanada - Empanadas Artesanales | Villa Devoto',
  description: 'Empanadas artesanales desde 1989 en Villa Devoto, CABA. Clásicas y especiales con rellenos generosos y masa artesanal.',
  openGraph: {
    title: 'Dr. Empanada - Empanadas Artesanales | Villa Devoto',
    description: 'Empanadas artesanales desde 1989 en Villa Devoto, CABA. Clásicas y especiales con rellenos generosos y masa artesanal.',
    url: 'https://dr-empanada.vercel.app',
    siteName: 'Dr. Empanada',
    images: [{ url: '/images/nosotros/foto1.jpg', width: 1200, height: 630, alt: 'Dr. Empanada - Empanadas artesanales en Villa Devoto' }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr. Empanada - Empanadas Artesanales | Villa Devoto',
    description: 'Empanadas artesanales desde 1989 en Villa Devoto, CABA.',
    images: ['/images/nosotros/foto1.jpg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-black text-cream min-h-screen`}>
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          poster="/images/nosotros/foto1.jpg"
          className="fixed inset-0 w-full h-full object-cover scale-110 -z-10 motion-reduce:hidden"
        >
          <source src="/hero-video-orig.mp4" type="video/mp4" />
        </video>
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.72) 100%)' }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "Dr. Empanada",
            "description": "Empanadas artesanales desde 1989 en Villa Devoto, CABA.",
            "url": "https://dr-empanada.vercel.app",
            "image": "https://dr-empanada.vercel.app/images/nosotros/foto1.jpg",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Melincué 4399",
              "addressLocality": "Villa Devoto",
              "addressRegion": "CABA",
              "addressCountry": "AR"
            },
            "servesCuisine": "Argentine",
            "priceRange": "$$",
            "foundingDate": "1989",
          }) }}
        />
        <CartProvider>
          <Navbar />
          <main className="pt-20">{children}</main>
          <Footer />
          <WhatsAppButton />
          <ScrollToTop />
        </CartProvider>
      </body>
    </html>
  )
}

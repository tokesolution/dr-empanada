export default function sitemap() {
  const base = 'https://dr-empanada.vercel.app'
  return [
    { url: base,               lastModified: new Date(), changeFrequency: 'weekly',  priority: 1   },
    { url: `${base}/menu`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/pedir`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/nosotros`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contacto`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}

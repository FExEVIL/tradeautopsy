import { Metadata } from 'next'
import { APP_URL } from '@/lib/constants'

interface PageSEOProps {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
  noIndex?: boolean
}

export function generatePageMetadata({
  title,
  description,
  keywords = [],
  ogImage,
  canonicalUrl,
  noIndex = false,
}: PageSEOProps): Metadata {
  const siteUrl = APP_URL
  
  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      url: canonicalUrl || siteUrl,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

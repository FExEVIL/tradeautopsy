'use client'

import { APP_URL } from '@/lib/constants'

export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>
}) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  )
}

export function OrganizationStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TradeAutopsy',
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    description:
      'Advanced trading journal and analytics platform with AI coaching for stock traders, F&O traders, and day traders',
    sameAs: [
      'https://twitter.com/tradeautopsy',
      'https://linkedin.com/company/tradeautopsy',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@tradeautopsy.in',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function ProductStructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'TradeAutopsy',
    applicationCategory: 'FinanceApplication',
    description:
      'AI-powered trading journal and analytics platform for tracking, analyzing, and improving trading performance',
    url: APP_URL,
    image: `${APP_URL}/og-image-1200x630.png`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: '0',
      priceValidUntil: '2026-12-31',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '250',
    },
    operatingSystem: 'Web, Android, iOS',
    inLanguage: 'en-IN',
    featureList: [
      'AI Trading Coach',
      'Pattern Detection',
      'Trading Rules Engine',
      'Multi-Broker Integration',
      'Risk Management Tools',
      'Performance Analytics',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQStructuredData({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

# SEO Implementation Guide for TradeAutopsy

This document outlines how to extend and maintain SEO optimization across the TradeAutopsy application.

## Overview

TradeAutopsy has been optimized for search engines with comprehensive meta tags, structured data, and technical SEO best practices. The implementation targets high-value trading-related keywords.

## Key Components

### 1. Global Metadata (`app/layout.tsx`)

The root layout includes:
- Comprehensive meta tags (title, description, keywords)
- Open Graph tags for social sharing
- Twitter Card metadata
- Robots directives
- Canonical URLs
- App links and verification tags

**To update:** Modify the `metadata` export in `app/layout.tsx`.

### 2. Page-Level SEO (`components/SEO/PageSEO.tsx`)

Use `generatePageMetadata()` for individual pages:

```typescript
import { generatePageMetadata } from '@/components/SEO/PageSEO'

export const metadata = generatePageMetadata({
  title: 'Your Page Title',
  description: 'Page description (155-160 characters)',
  keywords: ['keyword1', 'keyword2'],
  canonicalUrl: 'https://www.tradeautopsy.in/your-page',
  noIndex: false, // Set to true for private pages
})
```

### 3. Structured Data (`components/SEO/StructuredData.tsx`)

Available components:
- `OrganizationStructuredData` - Company information
- `ProductStructuredData` - Software application schema
- `BreadcrumbStructuredData` - Navigation breadcrumbs
- `FAQStructuredData` - FAQ page schema

**Usage:**
```tsx
import { OrganizationStructuredData } from '@/components/SEO/StructuredData'

export default function Page() {
  return (
    <>
      <OrganizationStructuredData />
      {/* Your page content */}
    </>
  )
}
```

### 4. Internal Linking (`lib/internal-links.ts`)

Centralized internal link map and `InternalLink` component for SEO-friendly anchor text.

**Usage:**
```tsx
import { InternalLink } from '@/components/SEO/InternalLink'
import { internalLinks } from '@/lib/internal-links'

<InternalLink href={internalLinks.patterns} keyword="pattern detection">
  Learn about pattern detection
</InternalLink>
```

## Adding New Pages

### Step 1: Create Page Component

```typescript
// app/new-page/page.tsx
import { Metadata } from 'next'
import { generatePageMetadata } from '@/components/SEO/PageSEO'
import { BreadcrumbStructuredData } from '@/components/SEO/StructuredData'

export const metadata: Metadata = generatePageMetadata({
  title: 'New Page Title',
  description: 'Page description for SEO',
  keywords: ['relevant', 'keywords'],
  canonicalUrl: 'https://www.tradeautopsy.in/new-page',
})

export default function NewPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://www.tradeautopsy.in' },
    { name: 'New Page', url: 'https://www.tradeautopsy.in/new-page' },
  ]

  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbs} />
      <div>
        <h1>Page Title (Only one H1 per page)</h1>
        <section>
          <h2>Section Title</h2>
          {/* Content */}
        </section>
      </div>
    </>
  )
}
```

### Step 2: Update Sitemap

Add the new page to `public/sitemap.xml`:

```xml
<url>
  <loc>https://www.tradeautopsy.in/new-page</loc>
  <lastmod>2025-12-11</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

### Step 3: Add to Internal Links

Update `lib/internal-links.ts` if the page should be linked internally.

## SEO Best Practices

### Heading Hierarchy
- Use only ONE `<h1>` per page
- Follow logical hierarchy: H1 → H2 → H3
- Include target keywords in headings naturally

### Meta Descriptions
- Keep between 155-160 characters
- Include primary keyword
- Write compelling copy that encourages clicks

### Images
- Always include descriptive `alt` text
- Use Next.js `Image` component for optimization
- Include relevant keywords in alt text naturally

### Internal Linking
- Use descriptive anchor text (not "click here")
- Link to related content
- Include target keywords in anchor text when natural

### Content
- Write for humans first, search engines second
- Include target keywords naturally
- Aim for comprehensive, valuable content (1000+ words for blog posts)

## Target Keywords

### Primary Keywords
- trading journal
- trading analytics
- AI trading coach
- F&O trading
- day trading journal
- pattern detection trading

### Secondary Keywords
- trading software India
- Zerodha journal
- trading rules engine
- risk management trading
- position sizing calculator
- trading psychology

## Monitoring & Maintenance

### Monthly Tasks
1. Check Google Search Console for:
   - Keyword rankings
   - Click-through rates
   - Search impressions
   - Core Web Vitals

2. Review and update:
   - Meta descriptions for low CTR pages
   - Content on underperforming pages
   - Internal links to boost important pages

3. Create new content:
   - Blog posts targeting high-search-volume keywords
   - Update existing content with new information
   - Add FAQ items based on user questions

### Tools
- Google Search Console
- Google Analytics
- Lighthouse (performance)
- Schema.org validator

## Verification Codes

Update these in `app/layout.tsx` when available:
- Google Search Console verification code
- Yandex verification code
- Social media handles (@tradeautopsy)

## Performance Optimization

- Images use WebP/AVIF formats (configured in `next.config.js`)
- Fonts are preconnected for faster loading
- Sitemap includes mobile and image namespaces
- Canonical URLs prevent duplicate content issues

## Questions?

For SEO-related questions or updates, refer to this guide or contact the development team.

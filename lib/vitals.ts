import { Metric } from 'web-vitals'

// ✅ Map metric names to human-readable labels
const metricLabels: Record<string, string> = {
  FCP: 'First Contentful Paint',
  LCP: 'Largest Contentful Paint',
  CLS: 'Cumulative Layout Shift',
  FID: 'First Input Delay',
  INP: 'Interaction to Next Paint',
  TTFB: 'Time to First Byte',
}

// ✅ Thresholds for "good", "needs improvement", "poor"
const thresholds = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 },
}

// ✅ Determine rating
function getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[metric.name as keyof typeof thresholds]
  if (!threshold) return 'good'

  if (metric.value <= threshold.good) return 'good'
  if (metric.value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// ✅ Format value for display
function formatValue(metric: Metric): string {
  if (metric.name === 'CLS') {
    return metric.value.toFixed(3)
  }
  return `${Math.round(metric.value)}ms`
}

// ✅ Main handler for Web Vitals
export function reportWebVitals(metric: Metric) {
  const rating = getRating(metric)
  const label = metricLabels[metric.name] || metric.name
  const value = formatValue(metric)

  // ✅ Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'
    console.log(`${emoji} ${label}: ${value} (${rating})`)
  }

  // ✅ Send to custom analytics (optional)
  sendToAnalytics(metric, rating)

  // ✅ Send to monitoring service (optional)
  sendToMonitoring(metric)
}

// ✅ Send to Google Analytics (if you use it)
function sendToAnalytics(metric: Metric, rating: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
      metric_rating: rating,
    })
  }
}

// ✅ Send to custom monitoring (like Sentry, DataDog, etc.)
function sendToMonitoring(metric: Metric) {
  // Example: Send to your API
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    fetch('/api/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating: getRating(metric),
        id: metric.id,
        navigationType: metric.navigationType,
        timestamp: Date.now(),
        url: window.location.href,
      }),
    }).catch((error) => {
      // Silently fail - don't break the app
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to send vitals:', error)
      }
    })
  }
}

// ✅ Get all vitals and log summary
export async function getAllVitals() {
  const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals')

  const vitals: Metric[] = []

  const callback = (metric: Metric) => {
    vitals.push(metric)
  }

  onCLS(callback)
  onFCP(callback)
  onLCP(callback)
  onTTFB(callback)
  onINP(callback)

  return vitals
}

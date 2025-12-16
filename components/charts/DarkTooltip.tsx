'use client'

/**
 * Custom tooltip component for dark theme Recharts
 */
export function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      <p
        style={{
          color: '#ffffff',
          fontWeight: 600,
          marginBottom: '8px',
          fontSize: '14px',
        }}
      >
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <p
          key={index}
          style={{
            color: entry.color || '#a3a3a3',
            fontSize: '13px',
            margin: '4px 0',
          }}
        >
          <span style={{ color: '#a3a3a3' }}>{entry.name}:</span>{' '}
          <span style={{ fontWeight: 600, color: entry.color || '#ffffff' }}>
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })
              : entry.value}
          </span>
        </p>
      ))}
    </div>
  )
}

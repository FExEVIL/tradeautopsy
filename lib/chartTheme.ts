/**
 * Dark theme configuration for Recharts
 * Ensures all charts match the dark theme aesthetic
 */

export const darkChartTheme = {
  tooltip: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    borderWidth: 1,
    titleColor: '#ffffff',
    bodyColor: '#a3a3a3',
    padding: 12,
    cornerRadius: 8,
  },
  
  legend: {
    wrapperStyle: {
      color: '#ffffff',
      paddingTop: '20px',
    },
    iconType: 'line' as const,
  },
  
  grid: {
    stroke: '#333',
    strokeDasharray: '3 3',
  },
  
  axis: {
    stroke: '#666',
    tick: {
      fill: '#a3a3a3',
    },
    label: {
      fill: '#a3a3a3',
    },
  },
  
  cursor: {
    fill: 'rgba(255, 255, 255, 0.05)',
    stroke: '#666',
    strokeWidth: 1,
  },
}

/**
 * Recharts-specific theme configuration
 */
export const rechartsTheme = {
  tooltip: {
    contentStyle: {
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      color: '#ffffff',
    },
    labelStyle: {
      color: '#ffffff',
    },
    itemStyle: {
      color: '#a3a3a3',
    },
  },
  
  cartesianGrid: {
    stroke: '#333',
    strokeDasharray: '3 3',
  },
  
  axis: {
    stroke: '#333',
    tick: {
      fill: '#a3a3a3',
    },
  },
}

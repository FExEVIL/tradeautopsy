'use client'

import { useState } from 'react'
import { Download, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { format, parseISO } from 'date-fns'

interface DailyPerformanceHeaderProps {
  date: string
}

export function DailyPerformanceHeader({ date }: DailyPerformanceHeaderProps) {
  const [exporting, setExporting] = useState(false)
  const searchParams = useSearchParams()
  
  // Get return month/year from URL
  const returnMonth = searchParams.get('returnMonth')
  const returnYear = searchParams.get('returnYear')
  
  // Build back URL with month/year if available
  const backUrl = returnMonth && returnYear
    ? `/dashboard/calendar?month=${returnMonth}&year=${returnYear}`
    : '/dashboard/calendar'

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      // Use browser's print functionality for PDF export
      // This maintains the exact visual design
      window.print()
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Failed to export PDF. Please use your browser\'s print function.')
    } finally {
      setExporting(false)
    }
  }

  let formattedDate = date
  try {
    const dateObj = parseISO(date)
    formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy')
  } catch {
    // Fallback if date parsing fails
    formattedDate = new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <Link
          href={backUrl}
          className="p-2 hover:bg-white/10 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Performance Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">
            Deep dive into your trading metrics and equity growth.
          </p>
          <p className="text-gray-500 text-sm mt-1">{formattedDate}</p>
        </div>
      </div>

      {/* Export PDF Button */}
      <button
        onClick={handleExportPDF}
        disabled={exporting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 rounded-lg transition text-white font-medium"
      >
        {exporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Export PDF
          </>
        )}
      </button>
    </div>
  )
}

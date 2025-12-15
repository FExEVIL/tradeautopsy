'use client'

/**
 * Global print styles for PDF export
 * Ensures dark theme is preserved when printing/exporting to PDF
 */
export function PrintStyles() {
  return (
    <style jsx global>{`
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        body {
          background: #000000 !important;
          color: #ffffff !important;
        }
        
        @page {
          size: A4;
          margin: 1cm;
          background: #000000 !important;
        }

        /* Hide navigation and UI elements */
        nav,
        aside,
        header:not(#daily-performance-page),
        button:not(.print-keep) {
          display: none !important;
        }

        /* Ensure dark backgrounds print */
        .bg-\\[\\#0a0a0a\\],
        .bg-\\[\\#0F0F0F\\],
        .bg-\\[\\#0A0A0A\\] {
          background: #000000 !important;
        }

        /* Ensure borders are visible */
        .border-white\\/5,
        .border-white\\/10 {
          border-color: rgba(255, 255, 255, 0.2) !important;
        }

        /* Ensure text colors are preserved */
        .text-white {
          color: #ffffff !important;
        }

        .text-gray-400 {
          color: #9ca3af !important;
        }

        .text-gray-500 {
          color: #6b7280 !important;
        }

        .text-green-400 {
          color: #10b981 !important;
        }

        .text-red-400 {
          color: #ef4444 !important;
        }

        /* Ensure chart backgrounds are dark */
        canvas {
          background: #000000 !important;
        }
      }
    `}</style>
  )
}

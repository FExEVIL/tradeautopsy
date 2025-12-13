'use client'

import { useState } from 'react'
import { Trade } from '@/types/trade'
import { formatINR } from '@/lib/formatters'

interface ExportButtonProps {
  trades: Trade[]
  label?: string
}

export function ExportButton({ trades, label = 'Export' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = () => {
    setIsExporting(true)

    // Create CSV header
    const headers = [
      'Date',
      'Symbol',
      'Type',
      'Strategy',
      'Quantity',
      'Price',
      'P&L',
      'Note',
      'Tags',
    ]

    // Create CSV rows
    const rows = trades.map((trade) => [
      new Date(trade.trade_date).toLocaleDateString('en-IN'),
      trade.tradingsymbol,
      trade.transaction_type,
      trade.product || 'N/A',
      trade.quantity,
      trade.average_price ? formatINR(trade.average_price) : '₹0',
      trade.pnl ? formatINR(trade.pnl) : '₹0',
      trade.journal_note?.replace(/"/g, '""') || '', // Escape quotes
      trade.journal_tags?.join('; ') || '',
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(',')
      ),
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `trade-journal-${new Date().toISOString().split('T')[0]}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setIsExporting(false)
  }

  const exportToPDF = async () => {
    setIsExporting(true)

    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF()

    // Title
    doc.setFontSize(18)
    doc.text('Trade Journal', 14, 20)

    // Summary stats
    doc.setFontSize(10)
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const wins = trades.filter((t) => (t.pnl || 0) > 0).length
    const losses = trades.filter((t) => (t.pnl || 0) < 0).length
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0
    const avgTrade = trades.length > 0 ? totalPnL / trades.length : 0
    const bestTrade = Math.max(...trades.map(t => t.pnl || 0))
    const worstTrade = Math.min(...trades.map(t => t.pnl || 0))

    doc.setFont('helvetica', 'bold')
    doc.text('Summary Statistics', 14, 30)
    doc.setFont('helvetica', 'normal')
    
    const stats = [
      `Total P&L: ${formatINR(totalPnL)}`,
      `Total Trades: ${trades.length} (${wins} wins, ${losses} losses)`,
      `Win Rate: ${winRate.toFixed(1)}%`,
      `Average Trade: ${formatINR(avgTrade)}`,
      `Best Trade: ${formatINR(bestTrade)}`,
      `Worst Trade: ${formatINR(worstTrade)}`,
    ]
    
    stats.forEach((stat, idx) => {
      doc.text(stat, 14, 38 + idx * 6)
    })

    // Table data
    const tableData = trades.map((trade) => [
      new Date(trade.trade_date).toLocaleDateString('en-IN'),
      trade.tradingsymbol,
      trade.transaction_type,
      trade.quantity,
      formatINR(trade.average_price || 0),
      formatINR(trade.pnl || 0),
      trade.journal_tags?.join(', ') || '-',
    ])

    autoTable(doc, {
      head: [['Date', 'Symbol', 'Type', 'Qty', 'Price', 'P&L', 'Tags']],
      body: tableData,
      startY: 75,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] },
      columnStyles: {
        5: { cellWidth: 40 }, // P&L column wider
      },
      didParseCell: (data: any) => {
        // Color code P&L column
        if (data.column.index === 5 && data.cell.text) {
          const pnlValue = parseFloat(data.cell.text.replace(/[₹,]/g, ''))
          if (pnlValue > 0) {
            data.cell.styles.textColor = [34, 197, 94] // green
          } else if (pnlValue < 0) {
            data.cell.styles.textColor = [239, 68, 68] // red
          }
        }
      },
    })

    // Add notes section if trades have notes
    const tradesWithNotes = trades.filter((t) => t.journal_note)
    if (tradesWithNotes.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 40
      doc.setFontSize(12)
      doc.text('Journal Notes', 14, finalY + 10)

      let yPos = finalY + 18
      tradesWithNotes.forEach((trade, idx) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(
          `${trade.tradingsymbol} - ${new Date(trade.trade_date).toLocaleDateString('en-IN')}`,
          14,
          yPos
        )

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        const noteLines = doc.splitTextToSize(trade.journal_note || '', 180)
        doc.text(noteLines, 14, yPos + 5)

        yPos += 5 + noteLines.length * 4 + 5
      })
    }

    doc.save(`trade-journal-${new Date().toISOString().split('T')[0]}.pdf`)

    setIsExporting(false)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToCSV}
        disabled={isExporting || trades.length === 0}
        className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {isExporting ? 'Exporting...' : 'Export CSV'}
      </button>

      <button
        onClick={exportToPDF}
        disabled={isExporting || trades.length === 0}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-900 disabled:text-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {isExporting ? 'Exporting...' : 'Export PDF'}
      </button>
    </div>
  )
}

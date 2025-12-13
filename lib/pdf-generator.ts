import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { createClient } from '@/utils/supabase/server'
import { formatINR } from './formatters'

interface Trade {
  trade_date: string
  symbol?: string | null
  tradingsymbol?: string | null
  pnl: string | number | null
  quantity?: number | null
  entry_price?: number | null
  exit_price?: number | null
  setup?: string | null
  notes?: string | null
  journal_tags?: string[] | null
}

interface ReportOptions {
  startDate: Date
  endDate: Date
  includeNotes?: boolean
  includeTags?: boolean
  reportType?: 'performance' | 'risk' | 'behavioral' | 'full'
}

/**
 * Generate PDF report for user's trades
 */
export async function generatePDFReport(
  userId: string,
  options: ReportOptions & { profileId?: string | null }
): Promise<Blob> {
  const supabase = await createClient()

  // Get current profile if not provided
  let profileId = options.profileId
  if (!profileId) {
    const { getCurrentProfileId } = await import('@/lib/profile-utils')
    profileId = await getCurrentProfileId(userId)
  }

  // Fetch trades (filter by profile)
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('trade_date', options.startDate.toISOString().split('T')[0])
    .lte('trade_date', options.endDate.toISOString().split('T')[0])
  
  if (profileId) {
    tradesQuery = tradesQuery.eq('profile_id', profileId)
  }
  
  const { data: trades } = await tradesQuery.order('trade_date', { ascending: false })

  const doc = new jsPDF()

  // Header
  const reportType = options.reportType || 'performance'
  const reportTitles: Record<string, string> = {
    performance: 'Performance Report',
    risk: 'Risk Analysis Report',
    behavioral: 'Behavioral Analysis Report',
    full: 'Complete Trading Report'
  }
  
  doc.setFontSize(20)
  doc.setTextColor(34, 197, 94) // Green color
  doc.text(`TradeAutopsy ${reportTitles[reportType]}`, 20, 20)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Period: ${format(options.startDate, 'dd MMM yyyy')} - ${format(options.endDate, 'dd MMM yyyy')}`,
    20,
    30
  )
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 20, 35)

  // Summary Statistics
  const netPnL = (trades || []).reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
  const wins = (trades || []).filter(t => parseFloat(String(t.pnl || '0')) > 0).length
  const losses = (trades || []).filter(t => parseFloat(String(t.pnl || '0')) < 0).length
  const winRate = (trades || []).length > 0 ? (wins / (trades || []).length) * 100 : 0
  const avgWin = wins > 0
    ? (trades || []).filter(t => parseFloat(String(t.pnl || '0')) > 0)
        .reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0) / wins
    : 0
  const avgLoss = losses > 0
    ? Math.abs((trades || []).filter(t => parseFloat(String(t.pnl || '0')) < 0)
        .reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0) / losses)
    : 0

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  let yPos = 50

  doc.text('Summary Statistics', 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.text(`Total Trades: ${trades?.length || 0}`, 20, yPos)
  yPos += 7
  doc.text(`Net P&L: ${formatINR(netPnL)}`, 20, yPos)
  yPos += 7
  doc.text(`Win Rate: ${winRate.toFixed(1)}%`, 20, yPos)
  yPos += 7
  doc.text(`Wins: ${wins} | Losses: ${losses}`, 20, yPos)
  yPos += 7
  doc.text(`Avg Win: ${formatINR(avgWin)} | Avg Loss: ${formatINR(avgLoss)}`, 20, yPos)
  yPos += 15

  // Trades Table
  const tableData = (trades || []).map(t => {
    const pnl = parseFloat(String(t.pnl || '0'))
    const symbol = t.symbol || t.tradingsymbol || 'N/A'
    const date = format(new Date(t.trade_date), 'dd MMM yyyy')
    const pnlFormatted = formatINR(pnl)
    const setup = t.setup || '-'

    return [date, symbol, pnlFormatted, setup]
  })

  autoTable(doc, {
    startY: yPos,
    head: [['Date', 'Symbol', 'P&L', 'Setup']],
    body: tableData,
    headStyles: {
      fillColor: [34, 197, 94], // Green
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    bodyStyles: {
      textColor: [0, 0, 0]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      2: { cellWidth: 40 }, // P&L column
    },
    didParseCell: (data) => {
      // Color code P&L column
      if (data.column.index === 2 && data.row.index > 0) {
        const pnlValue = data.cell.text[0]
        if (pnlValue.startsWith('₹')) {
          const numValue = parseFloat(pnlValue.replace(/[₹,]/g, ''))
          if (numValue > 0) {
            data.cell.styles.textColor = [34, 197, 94] // Green
          } else if (numValue < 0) {
            data.cell.styles.textColor = [239, 68, 68] // Red
          }
        }
      }
    },
    margin: { top: yPos, left: 20, right: 20 }
  })

  // Notes section (if enabled)
  if (options.includeNotes) {
    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50
    let notesY = finalY + 20

    const tradesWithNotes = (trades || []).filter(t => t.notes && t.notes.trim().length > 0)

    if (tradesWithNotes.length > 0) {
      doc.setFontSize(12)
      doc.text('Trade Notes', 20, notesY)
      notesY += 8

      doc.setFontSize(9)
      for (const trade of tradesWithNotes.slice(0, 10)) { // Limit to 10 notes
        if (notesY > 270) {
          doc.addPage()
          notesY = 20
        }

        const symbol = trade.symbol || trade.tradingsymbol || 'N/A'
        const date = format(new Date(trade.trade_date), 'dd MMM yyyy')
        doc.setFont('helvetica', 'bold')
        doc.text(`${symbol} - ${date}`, 20, notesY)
        notesY += 5

        doc.setFont('helvetica', 'normal')
        const noteLines = doc.splitTextToSize(trade.notes || '', 170)
        doc.text(noteLines, 20, notesY)
        notesY += noteLines.length * 5 + 5
      }
    }
  }

  // Convert to blob
  const pdfBlob = doc.output('blob')
  return pdfBlob
}


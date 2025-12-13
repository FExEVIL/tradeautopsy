import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { generatePDFReport } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { startDate, endDate, includeNotes, includeTags, scheduledReportId, reportType, profileId } = await request.json()

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 })
    }

    // Get current profile if not provided
    let currentProfileId = profileId
    if (!currentProfileId) {
      const { getCurrentProfileId } = await import('@/lib/profile-utils')
      currentProfileId = await getCurrentProfileId(user.id)
    }

    const finalReportType = reportType || 'performance'

    const pdfBlob = await generatePDFReport(user.id, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      includeNotes: includeNotes !== false,
      includeTags: includeTags !== false,
      reportType: finalReportType as any,
      profileId: currentProfileId
    })

    // Save to report history
    try {
      await supabase.from('report_history').insert({
        user_id: user.id,
        scheduled_report_id: scheduledReportId || null,
        report_type: finalReportType,
        report_format: 'pdf',
        start_date: startDate,
        end_date: endDate,
        file_size: pdfBlob.size,
        email_sent: false,
        metadata: { includeNotes, includeTags }
      })
    } catch (historyError) {
      // Don't fail the request if history save fails
      console.error('Failed to save report history:', historyError)
    }

    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="TradeAutopsy-Report-${startDate}-to-${endDate}.pdf"`
      }
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    )
  }
}


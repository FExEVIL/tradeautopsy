'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Loader2, Calendar, Clock, History, Mail, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { format } from 'date-fns'

interface ReportsClientProps {
  totalTrades: number
}

interface ScheduledReport {
  id: string
  report_type: string
  schedule_frequency: string
  schedule_time: string
  schedule_day: number | null
  email_enabled: boolean
  email_address: string | null
  enabled: boolean
  next_send_at: string | null
}

interface ReportHistory {
  id: string
  report_type: string
  report_format: string
  start_date: string
  end_date: string
  email_sent: boolean
  generated_at: string
}

export function ReportsClient({ totalTrades }: ReportsClientProps) {
  const [startDate, setStartDate] = useState(format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [includeNotes, setIncludeNotes] = useState(true)
  const [includeTags, setIncludeTags] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'generate' | 'schedule' | 'history'>('generate')
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([])
  const [loadingScheduled, setLoadingScheduled] = useState(false)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  
  // Schedule form state
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [scheduleDay, setScheduleDay] = useState(1)
  const [reportType, setReportType] = useState('performance')
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [emailAddress, setEmailAddress] = useState('')

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          includeNotes,
          includeTags
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `TradeAutopsy-Report-${format(new Date(startDate), 'yyyy-MM-dd')}-to-${format(new Date(endDate), 'yyyy-MM-dd')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('PDF generation error:', error)
      let errorMessage = 'Failed to generate PDF. Please try again.'
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('aborted')) {
          errorMessage = 'Request timed out. Please try again with a smaller date range.'
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('network') || error.name === 'TypeError') {
          errorMessage = 'Network error. Please check your internet connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateCSV = async () => {
    setGenerating(true)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch('/api/reports/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error('Failed to generate CSV')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `TradeAutopsy-Report-${format(new Date(startDate), 'yyyy-MM-dd')}-to-${format(new Date(endDate), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('CSV generation error:', error)
      let errorMessage = 'Failed to generate CSV. Please try again.'
      
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('aborted')) {
          errorMessage = 'Request timed out. Please try again with a smaller date range.'
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('network') || error.name === 'TypeError') {
          errorMessage = 'Network error. Please check your internet connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'schedule') {
      loadScheduledReports()
    } else if (activeTab === 'history') {
      loadReportHistory()
    }
  }, [activeTab])

  const loadScheduledReports = async () => {
    setLoadingScheduled(true)
    try {
      const response = await fetch('/api/reports/scheduled')
      if (response.ok) {
        const data = await response.json()
        setScheduledReports(data)
      }
    } catch (error) {
      console.error('Failed to load scheduled reports:', error)
    } finally {
      setLoadingScheduled(false)
    }
  }

  const loadReportHistory = async () => {
    try {
      const response = await fetch('/api/reports/history')
      if (response.ok) {
        const data = await response.json()
        setReportHistory(data)
      }
    } catch (error) {
      console.error('Failed to load report history:', error)
    }
  }

  const handleCreateSchedule = async () => {
    try {
      const response = await fetch('/api/reports/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: reportType,
          schedule_frequency: scheduleFrequency,
          schedule_time: scheduleTime,
          schedule_day: scheduleFrequency === 'weekly' || scheduleFrequency === 'monthly' ? scheduleDay : null,
          email_enabled: emailEnabled,
          email_address: emailEnabled ? emailAddress : null,
          include_notes: includeNotes,
          include_tags: includeTags
        })
      })

      if (response.ok) {
        setShowScheduleForm(false)
        loadScheduledReports()
        // Reset form
        setScheduleFrequency('weekly')
        setScheduleTime('09:00')
        setScheduleDay(1)
        setReportType('performance')
        setEmailEnabled(true)
        setEmailAddress('')
      } else {
        alert('Failed to create schedule')
      }
    } catch (error) {
      console.error('Failed to create schedule:', error)
      alert('Failed to create schedule')
    }
  }

  const handleToggleSchedule = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/reports/scheduled/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled })
      })

      if (response.ok) {
        loadScheduledReports()
      }
    } catch (error) {
      console.error('Failed to toggle schedule:', error)
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled report?')) return

    try {
      const response = await fetch(`/api/reports/scheduled/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadScheduledReports()
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            Custom Reports
          </h1>
          <p className="text-gray-400 mt-2">Generate detailed PDF or CSV reports of your trading performance</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'generate'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Generate Report
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Scheduled Reports
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            Report History
          </button>
        </div>

        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
          <h2 className="text-lg font-semibold text-white mb-6">Report Options</h2>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-[#0A0A0A] text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Include journal notes</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTags}
                onChange={(e) => setIncludeTags(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-[#0A0A0A] text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Include tags</span>
            </label>
          </div>

          {/* Generate Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleGeneratePDF}
              disabled={generating}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Generate PDF Report
                </>
              )}
            </button>
            <button
              onClick={handleGenerateCSV}
              disabled={generating}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Generate CSV Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generate Report Tab */}
        {activeTab === 'generate' && (
          <>
            <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
              <h2 className="text-lg font-semibold text-white mb-6">Report Options</h2>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNotes}
                    onChange={(e) => setIncludeNotes(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-[#0A0A0A] text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Include journal notes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTags}
                    onChange={(e) => setIncludeTags(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-[#0A0A0A] text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">Include tags</span>
                </label>
              </div>

              {/* Generate Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleGeneratePDF}
                  disabled={generating}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Generate PDF Report
                    </>
                  )}
                </button>
                <button
                  onClick={handleGenerateCSV}
                  disabled={generating}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Generate CSV Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <p className="text-sm text-blue-400">
                <strong>Note:</strong> PDF reports include summary statistics, trade table, and optional notes. 
                CSV reports contain raw trade data for analysis in Excel or other tools.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Total trades in database: {totalTrades}
              </p>
            </div>
          </>
        )}

        {/* Scheduled Reports Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Scheduled Reports</h2>
              <button
                onClick={() => setShowScheduleForm(!showScheduleForm)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {showScheduleForm ? 'Cancel' : '+ New Schedule'}
              </button>
            </div>

            {/* Schedule Form */}
            {showScheduleForm && (
              <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5 space-y-4">
                <h3 className="text-lg font-semibold text-white">Create Scheduled Report</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="performance">Performance</option>
                      <option value="risk">Risk</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="full">Full Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                    <select
                      value={scheduleFrequency}
                      onChange={(e) => setScheduleFrequency(e.target.value as any)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                    />
                  </div>

                  {(scheduleFrequency === 'weekly' || scheduleFrequency === 'monthly') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {scheduleFrequency === 'weekly' ? 'Day of Week' : 'Day of Month'}
                      </label>
                      <input
                        type="number"
                        min={scheduleFrequency === 'weekly' ? 0 : 1}
                        max={scheduleFrequency === 'weekly' ? 6 : 31}
                        value={scheduleDay}
                        onChange={(e) => setScheduleDay(parseInt(e.target.value))}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailEnabled}
                      onChange={(e) => setEmailEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-white/10 bg-[#0A0A0A] text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Send via email</span>
                  </label>

                  {emailEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCreateSchedule}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create Schedule
                </button>
              </div>
            )}

            {/* Scheduled Reports List */}
            {loadingScheduled ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : scheduledReports.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No scheduled reports yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledReports.map((schedule) => (
                  <div key={schedule.id} className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white capitalize">{schedule.report_type} Report</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            schedule.enabled 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {schedule.enabled ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>Frequency: <span className="text-white capitalize">{schedule.schedule_frequency}</span></p>
                          <p>Time: <span className="text-white">{schedule.schedule_time}</span></p>
                          {schedule.next_send_at && (
                            <p>Next send: <span className="text-white">{format(new Date(schedule.next_send_at), 'MMM d, yyyy h:mm a')}</span></p>
                          )}
                          {schedule.email_enabled && schedule.email_address && (
                            <p className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span className="text-white">{schedule.email_address}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSchedule(schedule.id, schedule.enabled)}
                          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          title={schedule.enabled ? 'Pause' : 'Resume'}
                        >
                          {schedule.enabled ? (
                            <ToggleRight className="w-5 h-5 text-green-400" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Report History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Report History</h2>
            
            {reportHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No report history yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reportHistory.map((report) => (
                  <div key={report.id} className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white capitalize">{report.report_type} Report</h3>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400 uppercase">
                            {report.report_format}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>Period: <span className="text-white">{format(new Date(report.start_date), 'MMM d')} - {format(new Date(report.end_date), 'MMM d, yyyy')}</span></p>
                          <p>Generated: <span className="text-white">{format(new Date(report.generated_at), 'MMM d, yyyy h:mm a')}</span></p>
                          {report.email_sent && (
                            <p className="flex items-center gap-2 text-green-400">
                              <Mail className="w-4 h-4" />
                              Email sent
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


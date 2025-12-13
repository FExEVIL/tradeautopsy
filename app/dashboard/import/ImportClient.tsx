'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Upload, CheckCircle, AlertCircle, X, Download } from 'lucide-react'
import { BROKER_PRESETS, detectBrokerFromHeaders, getPresetForBroker } from '@/lib/csv-import/presets'
import { useProfile } from '@/lib/contexts/ProfileContext'

type CsvRow = Record<string, string>
type ColumnMapping = Record<string, string>

interface ParsedData {
  headers: string[]
  rows: CsvRow[]
}

interface ValidationError {
  row: number
  field: string
  message: string
}

export default function ImportClient({ userId }: { userId: string }) {
  const { activeProfile } = useProfile() // Get active profile from context
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [importing, setImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string>('generic')
  const [showPreview, setShowPreview] = useState(false)
  const [previewTrades, setPreviewTrades] = useState<any[]>([])

  // P&L removed from required columns
  const requiredColumns = [
    { key: 'tradingsymbol', label: 'Symbol' },
    { key: 'transaction_type', label: 'Transaction Type (BUY/SELL)' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'average_price', label: 'Average Price' },
    { key: 'trade_date', label: 'Trade Date' },
  ]

  const optionalColumns = [
    { key: 'entry_price', label: 'Entry Price' },
    { key: 'exit_price', label: 'Exit Price' },
    { key: 'status', label: 'Status' },
    { key: 'side', label: 'Side' },
    { key: 'product', label: 'Product (MIS/CNC/NRML)' },
    // REMOVED: P&L - this is ALWAYS auto-calculated by matching BUY/SELL pairs
    // Users should never provide P&L in CSV - it will be calculated automatically
    { key: 'trade_id', label: 'Broker Trade ID' },
]

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'text/csv') {
      processFile(droppedFile)
    } else {
      setError('Please upload a valid CSV file')
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const processFile = (file: File) => {
    setFile(file)
    setError(null)
    setParsedData(null)
    setImportSuccess(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = Object.keys(results.data[0] as CsvRow)
        setParsedData({
          headers,
          rows: results.data as CsvRow[],
        })

        // Auto-detect broker from headers
        const detectedBroker = detectBrokerFromHeaders(headers)
        if (detectedBroker) {
          setSelectedPreset(detectedBroker)
        }

        // Get preset mapping or use auto-detection
        const preset = getPresetForBroker(selectedPreset)
        const autoMapping: ColumnMapping = {}
        
        if (preset && preset.columnMapping && Object.keys(preset.columnMapping).length > 0) {
          // Use preset mapping
          Object.entries(preset.columnMapping).forEach(([key, presetHeader]) => {
            // Find matching header (case-insensitive)
            const matchingHeader = headers.find(h => 
              h.toLowerCase() === presetHeader.toLowerCase() ||
              h.toLowerCase().includes(presetHeader.toLowerCase())
            )
            if (matchingHeader) {
              autoMapping[key] = matchingHeader
            }
          })
        }
        
        // Fallback to auto-detection for unmapped columns
        headers.forEach((header) => {
          const lowerHeader = header.toLowerCase()
          if (!Object.values(autoMapping).includes(header)) {
            if (lowerHeader.includes('symbol') && !autoMapping['tradingsymbol']) {
              autoMapping['tradingsymbol'] = header
            }
            if ((lowerHeader.includes('transaction') || lowerHeader.includes('type') || lowerHeader.includes('side') || lowerHeader.includes('buy/sell')) && !autoMapping['transaction_type']) {
              autoMapping['transaction_type'] = header
            }
            if ((lowerHeader.includes('quantity') || lowerHeader.includes('qty')) && !autoMapping['quantity']) {
              autoMapping['quantity'] = header
            }
            if (lowerHeader.includes('price') && !autoMapping['average_price']) {
              autoMapping['average_price'] = header
            }
            if (lowerHeader.includes('date') && !autoMapping['trade_date']) {
              autoMapping['trade_date'] = header
            }
            if (lowerHeader.includes('entry') && !autoMapping['entry_price']) {
              autoMapping['entry_price'] = header
            }
            if (lowerHeader.includes('exit') && !autoMapping['exit_price']) {
              autoMapping['exit_price'] = header
            }
            if (lowerHeader.includes('product') && !autoMapping['product']) {
              autoMapping['product'] = header
            }
            if ((lowerHeader.includes('order') || lowerHeader.includes('trade id')) && !autoMapping['trade_id']) {
              autoMapping['trade_id'] = header
            }
          }
        })
        
        setColumnMapping(autoMapping)
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`)
      },
    })
  }

  const validateData = (): boolean => {
    const errors: ValidationError[] = []

    // only requiredColumns are enforced
    requiredColumns.forEach(col => {
      if (!columnMapping[col.key]) {
        errors.push({ row: -1, field: col.key, message: `${col.label} is required but not mapped` })
      }
    })

    if (errors.length > 0) {
      setValidationErrors(errors)
      return false
    }

    if (parsedData) {
      parsedData.rows.slice(0, 10).forEach((row, idx) => {
        if (!row[columnMapping['tradingsymbol']]) {
          errors.push({ row: idx + 1, field: 'tradingsymbol', message: 'Symbol is empty' })
        }
        if (!row[columnMapping['quantity']]) {
          errors.push({ row: idx + 1, field: 'quantity', message: 'Quantity is empty' })
        }

        const qty = parseFloat(row[columnMapping['quantity']])
        if (isNaN(qty) || qty <= 0) {
          errors.push({ row: idx + 1, field: 'quantity', message: 'Invalid quantity' })
        }

        const price = parseFloat(row[columnMapping['average_price']])
        if (isNaN(price) || price <= 0) {
          errors.push({ row: idx + 1, field: 'average_price', message: 'Invalid price' })
        }
      })
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleImport = async () => {
    if (!validateData() || !parsedData || !file) return

    setImporting(true)
    setError(null)

    // Calculate timeout based on number of trades
    const tradeCount = parsedData.rows.length
    const isLargeImport = tradeCount > 200
    
    // More generous timeouts:
    // - Small imports (≤200): 1s per trade, min 2min, max 10min
    // - Large imports (>200): 0.5s per trade, min 10min, max 20min
    const IMPORT_TIMEOUT_MS = isLargeImport
      ? Math.min(Math.max(tradeCount * 500, 600000), 1200000) // 10min to 20min for large imports
      : Math.min(Math.max(tradeCount * 1000, 120000), 600000) // 2min to 10min for small imports

    try {
      // Show progress for large imports
      if (tradeCount > 50) {
        const timeoutSeconds = Math.round(IMPORT_TIMEOUT_MS / 1000)
        const timeoutMinutes = Math.round(timeoutSeconds / 60)
        const message = tradeCount > 200
          ? `Importing ${tradeCount} trades (this may take up to ${timeoutMinutes} minutes). P&L is being calculated automatically.`
          : `Importing ${tradeCount} trades (this may take up to ${timeoutMinutes} minute${timeoutMinutes > 1 ? 's' : ''}). P&L is being calculated automatically.`
        console.log(message)
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), IMPORT_TIMEOUT_MS)
      
      let response: Response
      try {
        // CRITICAL: Send the CSV file directly to server for auto-detection and P&L calculation
        // Don't parse client-side - let the server handle it with auto-detection
        const formData = new FormData()
        formData.append('file', file)
        
        // Get current profile ID from context (client-safe)
        // Server will also try to get it from cookie if not provided
        if (activeProfile?.id) {
          formData.append('profile_id', activeProfile.id)
        } else {
          // Fallback to localStorage if context not loaded yet
          const storedProfileId = localStorage.getItem('current_profile_id')
          if (storedProfileId) {
            formData.append('profile_id', storedProfileId)
          }
        }

        console.log(`[Import] Sending CSV file to server for auto-detection and P&L calculation...`)
        console.log(`[Import] File name: ${file.name}, size: ${file.size} bytes`)
        console.log(`[Import] Profile ID: ${activeProfile?.id || localStorage.getItem('current_profile_id') || 'none'}`)
        
        response = await fetch('/api/trades/import', {
          method: 'POST',
          body: formData, // Send FormData, not JSON
          // DO NOT set Content-Type header - browser will set it automatically with boundary
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        
        // Handle network errors with more specific messages
        if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted') || fetchError.message?.includes('timeout')) {
          throw new Error(`Import timed out after ${Math.round(IMPORT_TIMEOUT_MS / 1000)}s. The file is being processed in the background. Please refresh the page in a few minutes to see your trades.`)
        }
        
        if (fetchError.message?.includes('Failed to fetch') || fetchError.name === 'TypeError') {
          // More specific error message
          const isNetworkError = !navigator.onLine || fetchError.message.includes('network')
          throw new Error(
            isNetworkError 
              ? 'Network error. Please check your internet connection and try again.'
              : 'Server error. The import may still be processing. Please wait a moment and refresh the page.'
          )
        }
        
        // Re-throw other errors
        throw fetchError
      }

      if (!response.ok) {
        let errorMessage = 'Import failed'
        let errorDetails: any = null
        let errorText = ''
        
        // Try to get error text first
        try {
          errorText = await response.text()
          console.log('[Import] Raw error response:', errorText)
        } catch (textError) {
          console.warn('[Import] Could not read error response as text:', textError)
        }
        
        // Try to parse as JSON
        try {
          if (errorText) {
            errorDetails = JSON.parse(errorText)
            // Get the FULL error message (prioritize message field which has full text)
            errorMessage = errorDetails.message || errorDetails.error || errorDetails.details || errorMessage
            console.log('[Import] Parsed error details:', {
              message: errorDetails.message,
              error: errorDetails.error,
              details: errorDetails.details,
              name: errorDetails.name
            })
          } else {
            // Try response.json() as fallback
            errorDetails = await response.json()
            errorMessage = errorDetails.message || errorDetails.error || errorDetails.details || errorMessage
          }
        } catch (parseError) {
          // If response is not JSON, use status text or raw text
          errorMessage = errorText || response.statusText || errorMessage
          console.warn('[Import] Could not parse error as JSON:', parseError)
          console.warn('[Import] Raw error text:', errorText?.substring(0, 500)) // First 500 chars
        }
        
        // Log error details for debugging
        console.error('[Import] Server error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          details: errorDetails,
          rawText: errorText.substring(0, 500) // First 500 chars
        })
        
        // Provide user-friendly error messages based on status code
        // Use the full error message from server (not truncated)
        let userFriendlyMessage = errorMessage
        
        if (response.status === 400) {
          userFriendlyMessage = `Invalid data: ${errorMessage}. Please check your CSV format.`
        } else if (response.status === 401) {
          userFriendlyMessage = 'Authentication error. Please log in again.'
        } else if (response.status === 500) {
          // For 500 errors, show the full server error message
          const serverMessage = errorDetails?.message || errorDetails?.error || errorMessage
          userFriendlyMessage = `Server error: ${serverMessage}`
          
          // In development, show more details
          if (process.env.NODE_ENV === 'development' && errorDetails?.stack) {
            console.error('[Import] Server error stack:', errorDetails.stack)
          }
        }
        
        // Log the FULL error message (not truncated) to console
        console.error('[Import] Full error message:', userFriendlyMessage)
        if (errorDetails?.message && errorDetails.message !== errorMessage) {
          console.error('[Import] Server error message:', errorDetails.message)
        }
        
        throw new Error(userFriendlyMessage)
      }

      const result = await response.json()
      setImportSuccess(result.count)
      
      // P&L is always calculated automatically - no need to check
      if (result.count > 0) {
        console.log(`✓ ${result.count} trades imported. P&L calculated automatically.`)
      }
      
      setTimeout(() => setImportSuccess(null), 5000)
      setParsedData(null)
      setParsedData(null)
      setFile(null)
    } catch (err) {
      // AbortError will trigger when the timeout fires
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('Import aborted due to timeout')
      } else {
        console.error('Import error:', err)
      }
      let errorMessage = 'Failed to import trades. Please try again.'
      
      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.message.includes('timeout') || err.message.includes('aborted')) {
          errorMessage = 'Import timed out. Please try again with a smaller file.'
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('network') || err.name === 'TypeError') {
          errorMessage = 'Network error. Please check your internet connection and try again.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Import Trades</h1>
        <p className="text-gray-400 mt-1">Upload CSV from any broker to import trades</p>
      </div>

      {/* Broker Preset Selector */}
      {parsedData && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Broker Preset (optional)
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => {
              setSelectedPreset(e.target.value)
              // Re-apply mapping when preset changes
              if (parsedData) {
                const preset = getPresetForBroker(e.target.value)
                if (preset && preset.columnMapping) {
                  const newMapping: ColumnMapping = {}
                  Object.entries(preset.columnMapping).forEach(([key, presetHeader]) => {
                    const matchingHeader = parsedData.headers.find(h => 
                      h.toLowerCase() === presetHeader.toLowerCase() ||
                      h.toLowerCase().includes(presetHeader.toLowerCase())
                    )
                    if (matchingHeader) {
                      newMapping[key] = matchingHeader
                    }
                  })
                  setColumnMapping({ ...columnMapping, ...newMapping })
                }
              }
            }}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            {Object.entries(BROKER_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.name} - {preset.description}
              </option>
            ))}
          </select>
        </div>
      )}

      {importSuccess && (
  <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
    <div>
      <h3 className="font-semibold text-emerald-400">
        Imported {importSuccess} trades successfully
      </h3>
      <p className="text-sm text-gray-300 mt-1">
        {importSuccess > 0 
          ? `Your dashboard has been updated with ${importSuccess} trades. P&L has been calculated automatically.`
          : 'Your dashboard has been updated with the latest trades and calculated P&L.'}
      </p>
    </div>
  </div>
)}


      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-400">Error</h3>
            <p className="text-sm text-gray-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {!parsedData && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center hover:border-emerald-500/50 transition-colors cursor-pointer"
        >
          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Drop your CSV file here</h3>
          <p className="text-gray-400 mb-4">or click to browse</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-colors"
          >
            Choose File
          </label>
        </div>
      )}

      {parsedData && !importSuccess && (
        <div className="space-y-6">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Map CSV Columns</h2>
              <button
                onClick={() => {
                  setFile(null)
                  setParsedData(null)
                  setColumnMapping({})
                  setValidationErrors([])
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredColumns.map(col => (
                <div key={col.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {col.label} <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={columnMapping[col.key] || ''}
                    onChange={(e) => setColumnMapping({ ...columnMapping, [col.key]: e.target.value })}
                    className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Select column...</option>
                    {parsedData.headers.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Info message about P&L auto-calculation */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-400">
                <strong>💡 Note:</strong> P&L is automatically calculated by matching BUY/SELL pairs. 
                You don't need a P&L column in your CSV - it will be calculated for you.
              </p>
            </div>

            <details className="mt-4">
              <summary className="text-sm text-gray-400 cursor-pointer hover:text-white">Optional columns</summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {optionalColumns.map(col => (
                  <div key={col.key}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{col.label}</label>
                    <select
                      value={columnMapping[col.key] || ''}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [col.key]: e.target.value })}
                      className="w-full bg-[#0d0d0d] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Skip this column</option>
                      {parsedData.headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </details>
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <h3 className="font-semibold text-red-400 mb-2">Validation Errors</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>
                    {err.row === -1 ? '' : `Row ${err.row}: `}{err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">Preview (First 10 rows)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-2 px-3 text-gray-400">Symbol</th>
                    <th className="text-left py-2 px-3 text-gray-400">Type</th>
                    <th className="text-right py-2 px-3 text-gray-400">Qty</th>
                    <th className="text-right py-2 px-3 text-gray-400">Price</th>
                    <th className="text-left py-2 px-3 text-gray-400">Date</th>
                    <th className="text-right py-2 px-3 text-gray-400">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.rows.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-white">{row[columnMapping['tradingsymbol']] || '-'}</td>
                      <td className="py-2 px-3 text-white">{row[columnMapping['transaction_type']] || '-'}</td>
                      <td className="py-2 px-3 text-white text-right">{row[columnMapping['quantity']] || '-'}</td>
                      <td className="py-2 px-3 text-white text-right">₹{row[columnMapping['average_price']] || '-'}</td>
                      <td className="py-2 px-3 text-white">{row[columnMapping['trade_date']] || '-'}</td>
                      <td className="py-2 px-3 text-right font-medium text-gray-500 italic">
                        Auto-calculated
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Total rows in file: {parsedData.rows.length}
            </p>
          </div>

         <button
  onClick={handleImport}
  
  disabled={importing || validationErrors.length > 0}
  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
>
  {importing ? 'Importing...' : `Import ${parsedData.rows.length} Trades`}
</button>
 </div>
      )}
    </div>
  )
}

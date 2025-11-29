'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react'

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
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [importing, setImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    { key: 'pnl', label: 'P&L' }, // now treated as optional
    { key: 'trade_id', label: 'Broker Trade ID' },   // NEW
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

        const autoMapping: ColumnMapping = {}
        headers.forEach((header) => {
          const lowerHeader = header.toLowerCase()
          if (lowerHeader.includes('symbol')) autoMapping['tradingsymbol'] = header
          if (lowerHeader.includes('transaction') || lowerHeader.includes('type')) autoMapping['transaction_type'] = header
          if (lowerHeader.includes('quantity') || lowerHeader.includes('qty')) autoMapping['quantity'] = header
          // Zerodha has "price", not "average_price" – use price directly
          if (lowerHeader.includes('price')) autoMapping['average_price'] = header
          if (lowerHeader.includes('date')) autoMapping['trade_date'] = header
          // no auto-mapping for pnl because this CSV has no pnl column
          if (lowerHeader.includes('entry')) autoMapping['entry_price'] = header
          if (lowerHeader.includes('exit')) autoMapping['exit_price'] = header
          if (lowerHeader.includes('product')) autoMapping['product'] = header
          autoMapping['trade_id'] = header       // NEW
  
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
    if (!validateData() || !parsedData) return

    setImporting(true)
    setError(null)

    try {
   const trades = parsedData.rows.map(row => ({
  user_id: userId,
  tradingsymbol: row[columnMapping['tradingsymbol']],
  transaction_type: row[columnMapping['transaction_type']],
  quantity: parseInt(row[columnMapping['quantity']]),
  average_price: parseFloat(row[columnMapping['average_price']]),
  entry_price: columnMapping['entry_price'] ? parseFloat(row[columnMapping['entry_price']]) || null : null,
  exit_price: columnMapping['exit_price'] ? parseFloat(row[columnMapping['exit_price']]) || null : null,
  trade_date: row[columnMapping['trade_date']],
  trade_id: columnMapping['trade_id']
    ? row[columnMapping['trade_id']]
    : null,                                      // NEW
  pnl: columnMapping['pnl']
    ? parseFloat(row[columnMapping['pnl']]) || 0
    : 0,
  status: columnMapping['status'] ? row[columnMapping['status']] : 'completed',
  product: columnMapping['product'] ? row[columnMapping['product']] : 'MIS',
}))

      const response = await fetch('/api/trades/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trades }),
      })

      if (!response.ok) {
        throw new Error('Import failed')
      }

      const result = await response.json()
      setImportSuccess(result.count)
      setTimeout(() => setImportSuccess(null), 5000)
      setParsedData(null)
      setParsedData(null)
      setFile(null)
    } catch (err) {
      setError('Failed to import trades. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Import Trades</h1>
        <p className="text-gray-400 mt-1">Upload your Zerodha tradebook CSV to import trades</p>
      </div>

      {importSuccess && (
  <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
    <div>
      <h3 className="font-semibold text-emerald-400">
        Imported {importSuccess} trades from Zerodha
      </h3>
      <p className="text-sm text-gray-300 mt-1">
        Your dashboard has been updated with the latest trades.
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
                    {err.row === -1 ? '⚠️' : `Row ${err.row}:`} {err.message}
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
                      <td
                        className={`py-2 px-3 text-right font-medium ${
                          columnMapping['pnl'] && row[columnMapping['pnl']]
                            ? parseFloat(row[columnMapping['pnl']]) >= 0
                              ? 'text-emerald-400'
                              : 'text-red-400'
                            : 'text-gray-400'
                        }`}
                      >
                        ₹{columnMapping['pnl'] && row[columnMapping['pnl']] ? row[columnMapping['pnl']] : '-'}
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

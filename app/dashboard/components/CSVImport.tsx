'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function CSVImport() {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please log in first')
        setUploading(false)
        return
      }

      const text = await file.text()
      const rows = text.split('\n').slice(1).filter(row => row.trim())
      
      const trades = rows.map(row => {
        const parts = row.split(',').map(p => p.trim())
        const symbol = parts[0]
        const side = parts[1]
        const entry_date = parts[2]
        const entry_price = parseFloat(parts[3])
        const exit_date = parts[4] || null
        const exit_price = parts[5] ? parseFloat(parts[5]) : null
        const quantity = parseInt(parts[6])
        
        let pnl = null
        if (exit_price && quantity) {
          if (side === 'LONG') {
            pnl = (exit_price - entry_price) * quantity
          } else {
            pnl = (entry_price - exit_price) * quantity
          }
        }

        return {
          user_id: user.id,
          tradingsymbol: symbol,
          side: side,
          transaction_type: side,
          entry_date: entry_date,
          entry_price: entry_price,
          exit_date: exit_date,
          exit_price: exit_price,
          trade_date: entry_date,
          average_price: entry_price,
          quantity: quantity,
          pnl: pnl,
          status: exit_date ? 'CLOSED' : 'OPEN'
        }
      }).filter(t => t.tradingsymbol && !isNaN(t.entry_price))

      console.log('Trades to import:', trades)

      const { data, error } = await supabase.from('trades').insert(trades)
      
      if (error) {
        console.error('Full Supabase error:', JSON.stringify(error, null, 2))
        alert('Database error: ' + JSON.stringify(error))
        setUploading(false)
        return
      }
      
      alert('Successfully imported ' + trades.length + ' trades!')
      window.location.reload()
      
    } catch (error: any) {
      console.error('Import error:', error)
      alert('Error: ' + (error?.message || 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-neutral-900 rounded-lg p-6">
      <h3 className="text-white text-lg font-semibold mb-4">Import Trades</h3>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
        id="csv-upload"
      />
      <label htmlFor="csv-upload" className="cursor-pointer inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium">
        {uploading ? 'Uploading...' : 'Choose CSV File'}
      </label>
      <p className="text-gray-400 text-sm mt-4">Format: symbol,side,entry_date,entry_price,exit_date,exit_price,quantity</p>
    </div>
  )
}

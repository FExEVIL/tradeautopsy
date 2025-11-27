import { CSVImport } from '../components/CSVImport'

export default function ImportPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Import Trades</h1>
      <CSVImport />
    </div>
  )
}

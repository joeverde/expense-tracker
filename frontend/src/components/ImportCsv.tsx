import { type ChangeEvent, useState } from 'react'
import { useImportCsv } from '../hooks'

export function ImportCsv() {
  const importCsv = useImportCsv()
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setResult(null)
    setError('')

    try {
      const content = await file.text()
      const response = await importCsv.mutateAsync(content)
      setResult(response.imported)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.')
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Import CSV</h2>
          <p className="subtitle">Bulk import expenses from a file</p>
        </div>
      </div>

      <div className="card">
        <p className="help-text">
          Upload a CSV file with columns: <code>date,amount,category,description</code>
        </p>
        <p className="help-text muted">
          Dates should be ISO format (yyyy-MM-dd). Categories are created automatically if missing.
        </p>

        <label className="file-input">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            disabled={importCsv.isPending}
          />
          <span className="btn btn-secondary">
            {importCsv.isPending ? 'Importing…' : 'Choose CSV file'}
          </span>
        </label>

        {fileName && <p className="file-name">Selected: {fileName}</p>}

        {result !== null && (
          <p className="success-msg">Successfully imported {result} expense{result !== 1 ? 's' : ''}.</p>
        )}

        {error && <p className="form-error">{error}</p>}
      </div>

      <div className="card">
        <h3>Example format</h3>
        <pre className="code-block">{`date,amount,category,description
2026-01-15,42.50,Food,Groceries
2026-01-20,1200.00,Rent,January rent
2026-02-01,45.00,Transport,Transit pass`}</pre>
      </div>
    </section>
  )
}

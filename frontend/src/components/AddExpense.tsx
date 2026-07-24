import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories, useCreateExpense } from '../hooks'

export function AddExpense() {
  const navigate = useNavigate()
  const { data: categories = [], isLoading: categoriesLoading } = useCategories()
  const createExpense = useCreateExpense()

  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!categoryId || !amount || !description.trim()) {
      setError('Please fill in all fields.')
      return
    }

    const parsedAmount = parseFloat(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number.')
      return
    }

    try {
      await createExpense.mutateAsync({
        categoryId,
        amount: parsedAmount,
        description: description.trim(),
        date,
      })
      navigate('/expenses')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense.')
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Add expense</h2>
          <p className="subtitle">Record a new transaction</p>
        </div>
      </div>

      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Category
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
            disabled={categoriesLoading}
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label>
          Amount
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>

        <label>
          Description
          <input
            type="text"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>

        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={createExpense.isPending}>
            {createExpense.isPending ? 'Saving…' : 'Save expense'}
          </button>
        </div>
      </form>
    </section>
  )
}

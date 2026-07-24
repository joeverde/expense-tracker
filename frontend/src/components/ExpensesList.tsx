import { useMemo, useState } from 'react'
import { useCategories, useDeleteExpense, useExpenses } from '../hooks'
import { formatCurrency, formatDate } from '../utils'
import type { Expense } from '../types'

export function ExpensesList() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>()

  const filters = useMemo(
    () => ({
      from: from || undefined,
      to: to || undefined,
      categoryId,
    }),
    [from, to, categoryId],
  )

  const { data: categories = [] } = useCategories()
  const { data: expenses = [], isLoading, error } = useExpenses(filters)
  const deleteExpense = useDeleteExpense()

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Delete "${expense.description}"?`)) return
    await deleteExpense.mutateAsync(expense.id)
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Expenses</h2>
          <p className="subtitle">Filter and manage your spending</p>
        </div>
      </div>

      <div className="card filters">
        <div className="filter-grid">
          <label>
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label>
            Category
            <select
              value={categoryId ?? ''}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : undefined)
              }
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>
        {(from || to || categoryId) && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setFrom('')
              setTo('')
              setCategoryId(undefined)
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading && <p className="status">Loading expenses…</p>}
      {error && <p className="status error">Failed to load expenses.</p>}

      {!isLoading && !error && expenses.length === 0 && (
        <p className="empty card">No expenses match your filters.</p>
      )}

      {!isLoading && expenses.length > 0 && (
        <ul className="expense-list">
          {expenses.map((expense) => (
            <li key={expense.id} className="expense-item card">
              <div className="expense-main">
                <span className="expense-desc">{expense.description}</span>
                <span className="expense-amount">{formatCurrency(expense.amount)}</span>
              </div>
              <div className="expense-meta">
                <span className="badge">{expense.categoryName}</span>
                <span>{formatDate(expense.date)}</span>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={deleteExpense.isPending}
                onClick={() => handleDelete(expense)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

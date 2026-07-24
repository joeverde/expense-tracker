import type {
  Category,
  CreateExpenseInput,
  Expense,
  ExpenseFilters,
  ImportResult,
  MonthlySummary,
} from './types'

class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response | Promise<Response>): Promise<T> {
  const res = await response
  if (res.ok) {
    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
  }

  let message = `Request failed (${res.status})`
  try {
    const body = (await res.json()) as { error?: string }
    if (body.error) message = body.error
  } catch {
    // ignore parse errors
  }
  throw new ApiError(message)
}

export const api = {
  getCategories: () =>
    handleResponse<Category[]>(fetch('/api/categories')),

  getExpenses: (filters: ExpenseFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.from) params.set('from', filters.from)
    if (filters.to) params.set('to', filters.to)
    if (filters.categoryId) params.set('categoryId', String(filters.categoryId))
    const query = params.toString()
    return handleResponse<Expense[]>(fetch(`/api/expenses${query ? `?${query}` : ''}`))
  },

  createExpense: (input: CreateExpenseInput) =>
    handleResponse<Expense>(
      fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    ),

  updateExpense: (id: number, input: CreateExpenseInput) =>
    handleResponse<Expense>(
      fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    ),

  deleteExpense: (id: number) =>
    handleResponse<void>(fetch(`/api/expenses/${id}`, { method: 'DELETE' })),

  getMonthlySummary: (year: number) =>
    handleResponse<MonthlySummary>(fetch(`/api/summary/monthly?year=${year}`)),

  importCsv: (content: string) =>
    handleResponse<ImportResult>(
      fetch('/api/expenses/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: content,
      }),
    ),
}

export { ApiError }

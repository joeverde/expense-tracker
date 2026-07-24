export interface Category {
  id: number
  name: string
}

export interface Expense {
  id: number
  categoryId: number
  categoryName: string
  amount: number
  description: string
  date: string
  createdAt: string
}

export interface CreateExpenseInput {
  categoryId: number
  amount: number
  description: string
  date: string
}

export interface MonthTotal {
  month: number
  total: number
}

export interface CategoryTotal {
  category: string
  total: number
}

export interface MonthlySummary {
  year: number
  months: MonthTotal[]
  byCategory: CategoryTotal[]
}

export interface ImportResult {
  imported: number
}

export interface ExpenseFilters {
  from?: string
  to?: string
  categoryId?: number
}

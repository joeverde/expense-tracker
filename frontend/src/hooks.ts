import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { CreateExpenseInput, ExpenseFilters } from './types'

export const queryKeys = {
  categories: ['categories'] as const,
  expenses: (filters: ExpenseFilters) => ['expenses', filters] as const,
  summary: (year: number) => ['summary', year] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: api.getCategories,
  })
}

export function useExpenses(filters: ExpenseFilters) {
  return useQuery({
    queryKey: queryKeys.expenses(filters),
    queryFn: () => api.getExpenses(filters),
  })
}

export function useMonthlySummary(year: number) {
  return useQuery({
    queryKey: queryKeys.summary(year),
    queryFn: () => api.getMonthlySummary(year),
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CreateExpenseInput }) =>
      api.updateExpense(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}

export function useImportCsv() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.importCsv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
    },
  })
}

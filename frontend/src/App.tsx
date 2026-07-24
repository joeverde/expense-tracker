import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { ExpensesList } from './components/ExpensesList'
import { AddExpense } from './components/AddExpense'
import { ImportCsv } from './components/ImportCsv'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="expenses" element={<ExpensesList />} />
          <Route path="add" element={<AddExpense />} />
          <Route path="import" element={<ImportCsv />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

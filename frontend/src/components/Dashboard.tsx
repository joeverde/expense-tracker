import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMonthlySummary } from '../hooks'
import { CHART_COLORS, formatCurrency, MONTH_NAMES } from '../utils'

export function Dashboard() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const { data, isLoading, error } = useMonthlySummary(year)

  if (isLoading) return <p className="status">Loading dashboard…</p>
  if (error) return <p className="status error">Failed to load summary.</p>
  if (!data) return null

  const monthlyData = data.months
    .filter((m) => m.total > 0)
    .map((m) => ({
      name: MONTH_NAMES[m.month - 1],
      total: m.total,
    }))

  const categoryData = data.byCategory.map((c) => ({
    name: c.category,
    value: c.total,
  }))

  const yearTotal = data.byCategory.reduce((sum, c) => sum + c.total, 0)

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="subtitle">Overview for {year}</p>
        </div>
        <label className="field-inline">
          <span>Year</span>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="stat-card highlight">
        <span className="stat-label">Total spent</span>
        <span className="stat-value">{formatCurrency(yearTotal)}</span>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Monthly totals</h3>
          {monthlyData.length === 0 ? (
            <p className="empty">No expenses recorded this year.</p>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} width={56} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="total" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h3>By category</h3>
          {categoryData.length === 0 ? (
            <p className="empty">No category data yet.</p>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {categoryData.length > 0 && (
        <div className="card">
          <h3>Category breakdown</h3>
          <ul className="breakdown-list">
            {categoryData.map((item, index) => (
              <li key={item.name}>
                <span className="dot" style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
                <span className="breakdown-name">{item.name}</span>
                <span className="breakdown-amount">{formatCurrency(item.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

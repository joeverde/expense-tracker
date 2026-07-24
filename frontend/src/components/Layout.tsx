import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/expenses', label: 'Expenses' },
  { to: '/add', label: 'Add' },
  { to: '/import', label: 'Import' },
]

export function Layout() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon" aria-hidden="true">$</span>
            <h1>Expense Tracker</h1>
          </div>
          <nav className="nav" aria-label="Main">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

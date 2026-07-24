# Expense Tracker

A full-stack personal expense tracker built as a portfolio project. Track spending by category, visualize monthly trends, and import transactions from CSV — all stored locally on your machine.

## Features

- **Dashboard** — bar chart of monthly totals and pie chart of spending by category
- **Expense management** — list, filter (date range + category), add, and delete expenses
- **CSV import** — bulk import with automatic category creation
- **REST API** — ASP.NET Core minimal APIs with Swagger documentation
- **Local-first** — SQLite database, no cloud accounts or external services required

## Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Backend  | ASP.NET Core 10, EF Core, SQLite, Swashbuckle |
| Frontend | React 19, TypeScript, Vite, TanStack Query    |
| Charts   | Recharts                                        |
| Routing  | React Router                                    |

## Getting started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 20+

### Backend (port 5103)

```bash
cd backend
dotnet run --launch-profile http
```

API available at `http://localhost:5103`. Swagger UI at `http://localhost:5103/swagger` in Development.

### Frontend (port 5174)

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5174`. The Vite dev server proxies `/api` requests to the backend.

## API overview

| Method | Endpoint                    | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| GET    | `/api/categories`           | List categories                      |
| POST   | `/api/categories`           | Create category                      |
| GET    | `/api/expenses`             | List expenses (filterable)           |
| POST   | `/api/expenses`             | Create expense                       |
| PUT    | `/api/expenses/{id}`        | Update expense                       |
| DELETE | `/api/expenses/{id}`        | Delete expense                       |
| GET    | `/api/summary/monthly`      | Monthly + category summary for charts |
| POST   | `/api/expenses/import-csv`  | Import CSV (file or raw text body)   |

Errors return `{ "error": "message" }`.

### CSV import format

```csv
date,amount,category,description
2026-01-15,42.50,Food,Groceries
2026-01-20,1200.00,Rent,January rent
```

## Configuration

Copy `backend/appsettings.Example.json` to `backend/appsettings.json` (already included). The SQLite database file `expenses.db` is created automatically on first run with seed data.

## Privacy

All data is stored locally in a SQLite file (`expenses.db`) on your machine. No data is sent to third-party services. Delete the database file to remove all stored expenses.

## License

MIT — see [LICENSE](LICENSE).

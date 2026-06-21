# Budget Planner

A mobile-first budget and spending tracker, installable as a PWA. All data is stored locally on-device (IndexedDB via Dexie) — nothing is sent to a server.

## Features

- **Budget Planner** — set budgets per category & sub-category on weekly/monthly/custom cycles
- **Money Manage** — track multiple account types (cash, debit, credit, mutual funds, stocks)
- **Recurring Transactions** — daily/weekly/monthly/custom recurring entries, auto-posted when due
- **Subscription Manager** — track subscriptions and see estimated monthly cost
- **Budget Calendar** — calendar view of daily income/expense
- **Stats & Charts** — category breakdown (donut) and spending trend (line) charts
- **Export & Import** — CSV export/import of transactions

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Dexie.js (IndexedDB) for local-first storage
- react-router-dom, recharts, lucide-react
- vite-plugin-pwa for installable PWA support

## Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Roadmap

The web app is designed to later be wrapped as a native Android app (e.g. via Android Studio / Trusted Web Activity), at which point native home-screen widget and OS shortcut integrations can be added.

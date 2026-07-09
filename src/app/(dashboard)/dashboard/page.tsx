export default function DashboardPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-medium text-graphite-900">Dashboard</h1>
      <p className="mt-1 text-sm text-graphite-500">
        Stock health and recent movements will show up here once products and
        movements are wired in.
      </p>

      <div className="mt-8 rounded border border-dashed border-graphite-300 bg-white p-8 text-center">
        <div className="font-mono text-xs uppercase tracking-wide text-graphite-400">
          Day 1 — foundation complete
        </div>
        <p className="mt-2 text-sm text-graphite-600">
          Auth, database schema, and the app shell are live. Next up: the
          product catalog.
        </p>
      </div>
    </div>
  );
}

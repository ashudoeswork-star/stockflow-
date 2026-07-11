import Link from "next/link";
import { getDashboardData } from "./actions";
import { Package, ArrowLeftRight, Truck, ShoppingCart, AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const {
    totalProducts,
    totalOnHand,
    lowStock,
    outOfStock,
    recentMovements,
    openPOs,
    openSOs,
  } = await getDashboardData();

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-graphite-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-graphite-500">Stock health at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <div className="rounded-lg border border-graphite-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package size={14} className="text-graphite-400" />
            <span className="text-xs font-medium uppercase tracking-wide text-graphite-400">Products</span>
          </div>
          <div className="text-2xl font-medium text-graphite-900">{totalProducts}</div>
          <div className="mt-0.5 text-xs text-graphite-400">SKUs in catalog</div>
        </div>

        <div className="rounded-lg border border-graphite-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowLeftRight size={14} className="text-graphite-400" />
            <span className="text-xs font-medium uppercase tracking-wide text-graphite-400">On Hand</span>
          </div>
          <div className="text-2xl font-medium text-graphite-900">{totalOnHand.toLocaleString()}</div>
          <div className="mt-0.5 text-xs text-graphite-400">Total units in stock</div>
        </div>

        <div className="rounded-lg border border-graphite-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck size={14} className="text-graphite-400" />
            <span className="text-xs font-medium uppercase tracking-wide text-graphite-400">Open POs</span>
          </div>
          <div className="text-2xl font-medium text-graphite-900">{openPOs}</div>
          <Link href="/purchase-orders" className="mt-0.5 text-xs text-graphite-400 hover:text-graphite-700">
            View all →
          </Link>
        </div>

        <div className="rounded-lg border border-graphite-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart size={14} className="text-graphite-400" />
            <span className="text-xs font-medium uppercase tracking-wide text-graphite-400">Open SOs</span>
          </div>
          <div className="text-2xl font-medium text-graphite-900">{openSOs}</div>
          <Link href="/sales-orders" className="mt-0.5 text-xs text-graphite-400 hover:text-graphite-700">
            View all →
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Low stock alerts */}
        <div className="rounded-lg border border-graphite-200 bg-white">
          <div className="flex items-center justify-between border-b border-graphite-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-signal-500" />
              <span className="text-sm font-medium text-graphite-900">Stock alerts</span>
            </div>
            <span className="font-mono text-xs text-graphite-400">
              {outOfStock.length} out · {lowStock.length} low
            </span>
          </div>

          {lowStock.length === 0 && outOfStock.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-graphite-400">
              All products are well stocked
            </div>
          ) : (
            <div className="divide-y divide-graphite-50">
              {outOfStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <div className="text-sm font-medium text-graphite-900">{p.name}</div>
                    <div className="font-mono text-xs text-graphite-400">{p.sku}</div>
                  </div>
                  <span className="stamp-badge border-red-200 bg-red-50 text-red-600">Out of stock</span>
                </div>
              ))}
              {lowStock.filter(p => p.onHand > 0).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <div className="text-sm font-medium text-graphite-900">{p.name}</div>
                    <div className="font-mono text-xs text-graphite-400">{p.sku}</div>
                  </div>
                  <div className="text-right">
                    <span className="stamp-badge border-signal-400/30 bg-signal-50 text-signal-600">Low stock</span>
                    <div className="mt-0.5 font-mono text-xs text-graphite-400">{p.onHand} / {p.reorderLevel} min</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-graphite-100 px-4 py-2">
            <Link href="/products" className="text-xs text-graphite-400 hover:text-graphite-700">
              View all products →
            </Link>
          </div>
        </div>

        {/* Recent movements */}
        <div className="rounded-lg border border-graphite-200 bg-white">
          <div className="flex items-center justify-between border-b border-graphite-100 px-4 py-3">
            <span className="text-sm font-medium text-graphite-900">Recent movements</span>
            <Link href="/movements" className="text-xs text-graphite-400 hover:text-graphite-700">View all →</Link>
          </div>

          {recentMovements.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-graphite-400">
              No movements recorded yet
            </div>
          ) : (
            <div className="divide-y divide-graphite-50">
              {recentMovements.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`font-mono text-sm font-medium ${m.type === "IN" ? "text-emerald-600" : "text-signal-500"}`}>
                      {m.type === "IN" ? "+" : "-"}{m.quantity}
                    </span>
                    <div>
                      <div className="text-sm text-graphite-700">{m.product.name}</div>
                      <div className="font-mono text-xs text-graphite-400">
                        {m.reference ?? m.product.sku}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-graphite-400">
                    {new Date(m.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

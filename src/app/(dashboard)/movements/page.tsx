import { getMovements, getProductsForSelect } from "./actions";
import { AddMovementButton } from "@/components/movements/add-movement-modal";
import { ArrowLeftRight } from "lucide-react";

export default async function MovementsPage() {
  const [movements, products] = await Promise.all([
    getMovements(),
    getProductsForSelect(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-graphite-900">Stock movements</h1>
          <p className="mt-0.5 text-sm text-graphite-500">
            Every stock in and stock out event, in order.
          </p>
        </div>
        <AddMovementButton products={products} />
      </div>

      {movements.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-graphite-300 bg-white py-16 text-center">
          <ArrowLeftRight size={32} className="mb-3 text-graphite-300" />
          <div className="font-medium text-graphite-600">No movements yet</div>
          <p className="mt-1 text-sm text-graphite-400">
            Record your first stock in or stock out event above
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-graphite-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-graphite-200 bg-graphite-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-graphite-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-graphite-500">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-graphite-500">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-graphite-500">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-graphite-500">Balance after</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-graphite-500">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-graphite-50/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-graphite-400">
                    {new Date(m.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-graphite-900">{m.product.name}</div>
                    <div className="font-mono text-xs text-graphite-400">{m.product.sku}</div>
                  </td>
                  <td className="px-4 py-3">
                    {m.type === "IN" ? (
                      <span className="stamp-badge border-emerald-200 bg-emerald-50 text-emerald-700">
                        ↑ Stock In
                      </span>
                    ) : (
                      <span className="stamp-badge border-signal-400/30 bg-signal-50 text-signal-600">
                        ↓ Stock Out
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-graphite-900">
                    {m.type === "IN" ? "+" : "-"}{m.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-graphite-500">
                    {m.balanceAfter}
                  </td>
                  <td className="px-4 py-3 text-graphite-400 text-xs">
                    {m.reference ?? <span className="text-graphite-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-graphite-100 bg-graphite-50 px-4 py-2.5 text-xs text-graphite-400">
            {movements.length} movement{movements.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}

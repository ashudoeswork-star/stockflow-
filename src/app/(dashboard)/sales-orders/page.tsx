import { getSalesOrders, getProductsForSO, confirmSO, dispatchSO, cancelSO } from "./actions";
import { CreateSOButton } from "@/components/sales-orders/create-so-modal";
import { ShoppingCart } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "border-graphite-200 bg-graphite-50 text-graphite-500",
  CONFIRMED: "border-blue-200 bg-blue-50 text-blue-700",
  DISPATCHED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-500",
};

export default async function SalesOrdersPage() {
  const [sos, products] = await Promise.all([getSalesOrders(), getProductsForSO()]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-graphite-900">Sales orders</h1>
          <p className="mt-0.5 text-sm text-graphite-500">
            Create SOs for customers. Mark as dispatched to auto-deduct stock.
          </p>
        </div>
        <CreateSOButton products={products} />
      </div>

      {sos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-graphite-300 bg-white py-16 text-center">
          <ShoppingCart size={32} className="mb-3 text-graphite-300" />
          <div className="font-medium text-graphite-600">No sales orders yet</div>
          <p className="mt-1 text-sm text-graphite-400">Create your first SO above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sos.map((so) => (
            <div key={so.id} className="rounded-lg border border-graphite-200 bg-white p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-graphite-900">{so.soNumber}</span>
                    <span className={`stamp-badge ${STATUS_STYLES[so.status]}`}>{so.status}</span>
                  </div>
                  <div className="mt-1 text-sm text-graphite-500">
                    {so.customer}
                    {so.deliveryDate && (
                      <span className="ml-2 text-graphite-400">
                        · Deliver by {new Date(so.deliveryDate).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {so.status === "DRAFT" && (
                    <form action={confirmSO.bind(null, so.id)}>
                      <button className="btn-secondary text-xs">Confirm</button>
                    </form>
                  )}
                  {so.status === "CONFIRMED" && (
                    <form action={dispatchSO.bind(null, so.id)}>
                      <button className="btn-primary text-xs">Mark as dispatched</button>
                    </form>
                  )}
                  {(so.status === "DRAFT" || so.status === "CONFIRMED") && (
                    <form action={cancelSO.bind(null, so.id)}>
                      <button className="btn-secondary text-xs text-signal-500">Cancel</button>
                    </form>
                  )}
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-graphite-100">
                    <th className="pb-1.5 text-left text-xs font-medium uppercase tracking-wide text-graphite-400">Product</th>
                    <th className="pb-1.5 text-right text-xs font-medium uppercase tracking-wide text-graphite-400">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-50">
                  {so.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-1.5 text-graphite-700">
                        {item.product.name}
                        <span className="ml-1.5 font-mono text-xs text-graphite-400">{item.product.sku}</span>
                      </td>
                      <td className="py-1.5 text-right font-mono text-graphite-700">
                        {item.quantity} {item.product.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {so.notes && (
                <p className="mt-3 text-xs text-graphite-400 border-t border-graphite-100 pt-3">{so.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

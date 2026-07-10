import { getPurchaseOrders, getProductsForPO, markAsOrdered, markAsReceived, cancelPO } from "./actions";
import { CreatePOButton } from "@/components/purchase-orders/create-po-modal";
import { Truck } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "border-graphite-200 bg-graphite-50 text-graphite-500",
  ORDERED: "border-blue-200 bg-blue-50 text-blue-700",
  RECEIVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-500",
};

export default async function PurchaseOrdersPage() {
  const [pos, products] = await Promise.all([getPurchaseOrders(), getProductsForPO()]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-graphite-900">Purchase orders</h1>
          <p className="mt-0.5 text-sm text-graphite-500">Raise POs to suppliers. Mark as received to auto-update stock.</p>
        </div>
        <CreatePOButton products={products} />
      </div>

      {pos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-graphite-300 bg-white py-16 text-center">
          <Truck size={32} className="mb-3 text-graphite-300" />
          <div className="font-medium text-graphite-600">No purchase orders yet</div>
          <p className="mt-1 text-sm text-graphite-400">Create your first PO above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pos.map((po) => (
            <div key={po.id} className="rounded-lg border border-graphite-200 bg-white p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-graphite-900">{po.poNumber}</span>
                    <span className={`stamp-badge ${STATUS_STYLES[po.status]}`}>{po.status}</span>
                  </div>
                  <div className="mt-1 text-sm text-graphite-500">
                    {po.supplier}
                    {po.expectedDate && (
                      <span className="ml-2 text-graphite-400">· Expected {new Date(po.expectedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {po.status === "DRAFT" && (
                    <form action={markAsOrdered.bind(null, po.id)}>
                      <button className="btn-secondary text-xs">Mark as ordered</button>
                    </form>
                  )}
                  {po.status === "ORDERED" && (
                    <form action={markAsReceived.bind(null, po.id)}>
                      <button className="btn-primary text-xs">Mark as received</button>
                    </form>
                  )}
                  {(po.status === "DRAFT" || po.status === "ORDERED") && (
                    <form action={cancelPO.bind(null, po.id)}>
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
                  {po.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-1.5 text-graphite-700">
                        {item.product.name}
                        <span className="ml-1.5 font-mono text-xs text-graphite-400">{item.product.sku}</span>
                      </td>
                      <td className="py-1.5 text-right font-mono text-graphite-700">{item.quantity} {item.product.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {po.notes && <p className="mt-3 text-xs text-graphite-400 border-t border-graphite-100 pt-3">{po.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

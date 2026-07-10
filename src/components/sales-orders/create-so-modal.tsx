"use client";

import { useState, useTransition } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { createSalesOrder } from "@/app/(dashboard)/sales-orders/actions";

type Product = { id: string; name: string; sku: string; unit: string; onHand: number };
type LineItem = { productId: string; quantity: number };

function Modal({ products, onClose }: { products: Product[]; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ productId: "", quantity: 1 }]);

  function addLine() { setLineItems([...lineItems, { productId: "", quantity: 1 }]); }
  function removeLine(i: number) { setLineItems(lineItems.filter((_, idx) => idx !== i)); }
  function updateLine(i: number, field: keyof LineItem, value: string | number) {
    const updated = [...lineItems];
    updated[i] = { ...updated[i], [field]: value };
    setLineItems(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    lineItems.forEach((item) => {
      formData.append("productId", item.productId);
      formData.append("quantity", String(item.quantity));
    });
    startTransition(async () => {
      try {
        await createSalesOrder(formData);
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-graphite-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-lg border border-graphite-200 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-graphite-200 px-6 py-4 sticky top-0 bg-white">
          <h2 className="font-medium text-graphite-900">Create sales order</h2>
          <button onClick={onClose} className="rounded p-1 text-graphite-400 hover:bg-graphite-50"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">Customer *</label>
            <input name="customer" required className="input-field" placeholder="e.g. Rahul Traders" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">Delivery date</label>
              <input name="deliveryDate" type="date" className="input-field" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">Notes</label>
              <input name="notes" className="input-field" placeholder="Optional" />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wide text-graphite-500">Line items *</label>
              <button type="button" onClick={addLine} className="text-xs text-graphite-500 hover:text-graphite-900 flex items-center gap-1">
                <Plus size={12} /> Add line
              </button>
            </div>
            <div className="space-y-2">
              {lineItems.map((item, i) => {
                const selected = products.find(p => p.id === item.productId);
                return (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => updateLine(i, "productId", e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select product…</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku}) — {p.onHand} {p.unit} available
                          </option>
                        ))}
                      </select>
                      {selected && (
                        <p className="mt-0.5 text-xs text-graphite-400">{selected.onHand} {selected.unit} in stock</p>
                      )}
                    </div>
                    <input
                      type="number" min="1" required
                      value={item.quantity}
                      onChange={(e) => updateLine(i, "quantity", parseInt(e.target.value))}
                      className="input-field w-24"
                      placeholder="Qty"
                    />
                    {lineItems.length > 1 && (
                      <button type="button" onClick={() => removeLine(i)} className="mt-2 text-graphite-300 hover:text-signal-500">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded border border-signal-600/30 bg-signal-50 px-3 py-2 text-sm text-signal-600">{error}</div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? "Creating…" : "Create SO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateSOButton({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary"><Plus size={15} />New sales order</button>
      {open && <Modal products={products} onClose={() => setOpen(false)} />}
    </>
  );
}

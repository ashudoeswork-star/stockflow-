"use client";

import { useState, useTransition } from "react";
import { X, Plus } from "lucide-react";
import { createMovement } from "@/app/(dashboard)/movements/actions";

type Product = {
  id: string;
  name: string;
  sku: string;
  onHand: number;
  unit: string;
};

function Modal({
  products,
  onClose,
}: {
  products: Product[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("type", type);

    startTransition(async () => {
      try {
        await createMovement(formData);
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-graphite-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg border border-graphite-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-graphite-200 px-6 py-4">
          <h2 className="font-medium text-graphite-900">Record stock movement</h2>
          <button onClick={onClose} className="rounded p-1 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-700">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* IN / OUT toggle */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">
              Movement type
            </label>
            <div className="flex rounded border border-graphite-200 p-0.5">
              <button
                type="button"
                onClick={() => setType("IN")}
                className={`flex-1 rounded py-1.5 text-sm font-medium transition-colors ${
                  type === "IN"
                    ? "bg-emerald-600 text-white"
                    : "text-graphite-500 hover:text-graphite-900"
                }`}
              >
                Stock In
              </button>
              <button
                type="button"
                onClick={() => setType("OUT")}
                className={`flex-1 rounded py-1.5 text-sm font-medium transition-colors ${
                  type === "OUT"
                    ? "bg-signal-500 text-white"
                    : "text-graphite-500 hover:text-graphite-900"
                }`}
              >
                Stock Out
              </button>
            </div>
          </div>

          {/* Product select */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">
              Product *
            </label>
            <select
              name="productId"
              required
              className="input-field"
              onChange={(e) => {
                const p = products.find((p) => p.id === e.target.value) || null;
                setSelectedProduct(p);
              }}
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — {p.onHand} {p.unit} on hand
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">
              Quantity *
            </label>
            <input
              name="quantity"
              type="number"
              min="1"
              required
              className="input-field"
              placeholder="e.g. 100"
            />
            {selectedProduct && type === "OUT" && (
              <p className="mt-1 text-xs text-graphite-400">
                Available: {selectedProduct.onHand} {selectedProduct.unit}
              </p>
            )}
          </div>

          {/* Reference */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">
              Reference <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              name="reference"
              className="input-field"
              placeholder="e.g. PO-1042, manual count, SO-0023"
            />
          </div>

          {error && (
            <div className="rounded border border-signal-600/30 bg-signal-50 px-3 py-2 text-sm text-signal-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? "Recording…" : "Record movement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddMovementButton({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={15} />
        Record movement
      </button>
      {open && <Modal products={products} onClose={() => setOpen(false)} />}
    </>
  );
}

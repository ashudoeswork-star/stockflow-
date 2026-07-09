"use client";

import { useState, useTransition, useRef } from "react";
import { X, Plus } from "lucide-react";
import { createProduct, updateProduct } from "@/app/(dashboard)/products/actions";

type Product = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  category: string | null;
  reorderLevel: number;
  onHand: number;
};

const UNITS = ["pcs", "kg", "g", "box", "carton", "litre", "ml", "pair", "set"];

function Modal({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEdit = !!product;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateProduct(product.id, formData);
        } else {
          await createProduct(formData);
        }
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-graphite-950/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg border border-graphite-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-graphite-200 px-6 py-4">
          <h2 className="font-medium text-graphite-900">
            {isEdit ? "Edit product" : "Add product"}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-graphite-400 hover:bg-graphite-50 hover:text-graphite-700"
          >
            <X size={16} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">
                Product name *
              </label>
              <input
                name="name"
                required
                defaultValue={product?.name}
                className="input-field"
                placeholder="e.g. Basmati Rice 25kg"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">
                SKU *
              </label>
              <input
                name="sku"
                required
                defaultValue={product?.sku}
                className="input-field font-mono"
                placeholder="e.g. RICE-BAS-25"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">
                Unit
              </label>
              <select
                name="unit"
                defaultValue={product?.unit ?? "pcs"}
                className="input-field"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">
                Category
              </label>
              <input
                name="category"
                defaultValue={product?.category ?? ""}
                className="input-field"
                placeholder="e.g. Grains"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">
                Reorder level
              </label>
              <input
                name="reorderLevel"
                type="number"
                min="0"
                defaultValue={product?.reorderLevel ?? 0}
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          {error && (
            <div className="rounded border border-signal-600/30 bg-signal-50 px-3 py-2 text-sm text-signal-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending
                ? isEdit
                  ? "Saving…"
                  : "Adding…"
                : isEdit
                ? "Save changes"
                : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddProductButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={15} />
        Add product
      </button>
      {open && <Modal onClose={() => setOpen(false)} />}
    </>
  );
}

export function EditProductButton({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-graphite-500 hover:text-graphite-900 transition-colors"
      >
        Edit
      </button>
      {open && <Modal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}

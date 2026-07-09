move page.tsx "src\app\(dashboard)\products\"import { Suspense } from "react";
import { getProducts } from "./actions";
import { AddProductButton } from "@/components/products/product-modal";
import { EditProductButton } from "@/components/products/product-modal";
import { DeleteProductButton } from "@/components/products/delete-button";
import { ProductSearch } from "@/components/products/product-search";
import { Package } from "lucide-react";

async function ProductsTable({ search }: { search?: string }) {
  const products = await getProducts(search);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-graphite-300 bg-white py-16 text-center">
        <Package size={32} className="mb-3 text-graphite-300" />
        <div className="font-medium text-graphite-600">
          {search ? `No products matching "${search}"` : "No products yet"}
        </div>
        <p className="mt-1 text-sm text-graphite-400">
          {search
            ? "Try a different search term"
            : "Add your first SKU to get started"}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-graphite-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-graphite-200 bg-graphite-50">
            <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide text-graphite-500">
              SKU
            </th>
            <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide text-graphite-500">
              Name
            </th>
            <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide text-graphite-500">
              Category
            </th>
            <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide text-graphite-500">
              Unit
            </th>
            <th className="px-4 py-3 text-right font-medium text-xs uppercase tracking-wide text-graphite-500">
              On hand
            </th>
            <th className="px-4 py-3 text-right font-medium text-xs uppercase tracking-wide text-graphite-500">
              Reorder at
            </th>
            <th className="px-4 py-3 text-right font-medium text-xs uppercase tracking-wide text-graphite-500">
              Status
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-graphite-100">
          {products.map((p) => {
            const isLow = p.onHand <= p.reorderLevel && p.reorderLevel > 0;
            const isOut = p.onHand === 0;
            return (
              <tr
                key={p.id}
                className="group transition-colors hover:bg-graphite-50/60"
              >
                <td className="px-4 py-3 font-mono text-xs text-graphite-500">
                  {p.sku}
                </td>
                <td className="px-4 py-3 font-medium text-graphite-900">
                  {p.name}
                </td>
                <td className="px-4 py-3 text-graphite-500">
                  {p.category ?? (
                    <span className="text-graphite-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-graphite-500">{p.unit}</td>
                <td className="px-4 py-3 text-right font-mono font-medium text-graphite-900">
                  {p.onHand.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono text-graphite-400">
                  {p.reorderLevel.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {isOut ? (
                    <span className="stamp-badge border-red-200 bg-red-50 text-red-600">
                      Out of stock
                    </span>
                  ) : isLow ? (
                    <span className="stamp-badge border-signal-400/30 bg-signal-50 text-signal-600">
                      Low stock
                    </span>
                  ) : (
                    <span className="stamp-badge border-emerald-200 bg-emerald-50 text-emerald-700">
                      In stock
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <EditProductButton product={p} />
                    <DeleteProductButton id={p.id} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="border-t border-graphite-100 bg-graphite-50 px-4 py-2.5 text-xs text-graphite-400">
        {products.length} product{products.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const search = searchParams.q;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-graphite-900">Products</h1>
          <p className="mt-0.5 text-sm text-graphite-500">
            Your SKU catalog — all products and current stock levels.
          </p>
        </div>
        <AddProductButton />
      </div>

      <div className="mb-4">
        <Suspense>
          <ProductSearch />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border border-graphite-200 bg-white py-12 text-center text-sm text-graphite-400">
            Loading products…
          </div>
        }
      >
        <ProductsTable search={search} />
      </Suspense>
    </div>
  );
}

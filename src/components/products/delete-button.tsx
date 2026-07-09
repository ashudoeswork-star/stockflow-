"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/(dashboard)/products/actions";

export function DeleteProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this product? This can't be undone.")) return;
    startTransition(async () => {
      await deleteProduct(id);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-signal-500 hover:text-signal-600 transition-colors disabled:opacity-40"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}

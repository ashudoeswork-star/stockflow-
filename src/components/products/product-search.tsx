"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition } from "react";

export function ProductSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-graphite-400"
      />
      <input
        type="text"
        placeholder="Search by name, SKU or category…"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={handleSearch}
        className="input-field pl-8 w-72"
      />
    </div>
  );
}

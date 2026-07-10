"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  ShoppingCart,
  Truck,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, ready: true },
  { href: "/products", label: "Products", icon: Package, ready: true },
  { href: "/movements", label: "Stock movements", icon: ArrowLeftRight, ready: true },
  { href: "/purchase-orders", label: "Purchase orders", icon: Truck, ready: true },
  { href: "/sales-orders", label: "Sales orders", icon: ShoppingCart, ready: true },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-graphite-200 bg-white">
      <div className="border-b border-graphite-200 px-5 py-5">
        <div className="text-base font-medium tracking-tight text-graphite-900">
          StockFlow
        </div>
        <div className="mt-0.5 font-mono text-[11px] text-graphite-400">
          Warehouse ops
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-graphite-900 text-ledger-paper"
                  : "text-graphite-600 hover:bg-graphite-50 hover:text-graphite-900"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-graphite-200 px-3 py-3">
        <div className="truncate px-3 py-1 font-mono text-[11px] text-graphite-400">
          {email}
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm text-graphite-600 transition-colors hover:bg-graphite-50 hover:text-graphite-900"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

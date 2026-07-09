"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: brand panel — signature element is the manifest ticket */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-graphite-950 p-12 text-ledger-paper lg:flex">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-graphite-400">
            Distribution Operations
          </div>
          <div className="mt-3 text-3xl font-medium tracking-tight">
            StockFlow
          </div>
        </div>

        <div className="rounded border border-graphite-700 bg-graphite-900/60 p-6 font-mono text-xs leading-relaxed text-graphite-300">
          <div className="mb-3 flex items-center justify-between border-b border-graphite-700 pb-3 text-[11px] uppercase tracking-wide text-graphite-500">
            <span>Manifest</span>
            <span>No. 00142</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-graphite-500">Origin</span>
            <span>Whitefield WH-01</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-graphite-500">SKU count</span>
            <span>284</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-graphite-500">Status</span>
            <span className="text-signal-400">In transit</span>
          </div>
          <div className="mt-3 border-t border-graphite-700 pt-3 text-[11px] text-graphite-500">
            Tracked in real time. No spreadsheets.
          </div>
        </div>

        <div className="font-mono text-[11px] text-graphite-600">
          v0.1 — built for mid-market distribution
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex w-full items-center justify-center bg-ledger-paper px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="text-2xl font-medium tracking-tight text-graphite-900">
              StockFlow
            </div>
          </div>

          <h1 className="text-xl font-medium text-graphite-900">Sign in</h1>
          <p className="mt-1 text-sm text-graphite-500">
            Use the credentials your admin set up for you.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-graphite-500">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded border border-signal-600/30 bg-signal-50 px-3 py-2 text-sm text-signal-600">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

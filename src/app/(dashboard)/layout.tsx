import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt and suspenders — middleware already protects this, but a direct
  // server check here means this layout is safe even if middleware config drifts.
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex">
      <Sidebar email={user.email ?? ""} />
      <main className="min-h-screen flex-1 bg-ledger-paper px-8 py-8">
        {children}
      </main>
    </div>
  );
}

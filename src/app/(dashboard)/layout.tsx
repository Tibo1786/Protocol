import { NavBar } from "@/components/nav-bar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

export { DashboardLayout as default };

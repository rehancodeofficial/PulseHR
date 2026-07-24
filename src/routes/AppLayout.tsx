import { Outlet } from "react-router";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout() {
  return (
    <div
      className="flex h-screen w-full overflow-hidden transition-colors duration-200"
      style={{
        background: "var(--background)",
      }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            border: "none",
            borderRadius: 20,
            boxShadow: "var(--shadow-elevated)",
            color: "var(--foreground)",
            fontWeight: 500,
          },
        }}
      />
    </div>
  );
}

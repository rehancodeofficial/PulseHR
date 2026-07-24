import { Outlet } from "react-router";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout() {
  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #EEF3E4 0%, #D4E5BC 45%, #A8C88A 100%)",
        backgroundAttachment: "fixed",
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
            background: "#FAFAF7",
            border: "none",
            borderRadius: 20,
            boxShadow:
              "6px 6px 18px rgba(45,74,43,0.15), -4px -4px 12px rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,0.6)",
            color: "#2A3324",
            fontWeight: 500,
          },
        }}
      />
    </div>
  );
}

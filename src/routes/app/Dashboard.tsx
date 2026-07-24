// @ts-nocheck
import { useAuth } from "@/lib/auth-store";
import { AdminDashboard } from "./AdminDashboard";
import { EmployeeDashboard } from "./EmployeeDashboard";

const ADMIN_ROLES = ["admin", "manager", "supervisor", "accountant"];

export function Dashboard() {
  const user = useAuth((s) => s.user)!;

  if (ADMIN_ROLES.includes(user.role)) {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
}

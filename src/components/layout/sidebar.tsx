import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/lib/auth-store";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Plane,
  FolderKanban,
  ListChecks,
  Boxes,
  FileText,
  Bell,
  BarChart3,
  Settings,
  ScrollText,
  LogOut,
  ChevronRight,
  DollarSign,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import type { Role } from "@/types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
  section?: string;
}

const nav: NavItem[] = [
  // ── Shared ──────────────────────────────────────────
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "employee", "manager", "supervisor", "accountant"],
    section: "workspace",
  },
  {
    to: "/attendance",
    label: "Attendance",
    icon: CalendarCheck,
    roles: ["admin", "employee", "manager", "supervisor", "accountant"],
    section: "workspace",
  },
  {
    to: "/leaves",
    label: "Leave Management",
    icon: Plane,
    roles: ["admin", "employee", "manager", "supervisor", "accountant"],
    section: "workspace",
  },
  {
    to: "/payroll",
    label: "Payroll",
    icon: DollarSign,
    roles: ["admin", "employee", "manager", "supervisor", "accountant"],
    section: "workspace",
  },
  {
    to: "/tasks",
    label: "Tasks",
    icon: ListChecks,
    roles: ["admin", "employee", "manager", "supervisor"],
    section: "workspace",
  },
  {
    to: "/notifications",
    label: "Notifications",
    icon: Bell,
    roles: ["admin", "employee", "manager", "supervisor", "accountant"],
    section: "workspace",
  },
  // ── Admin Tools ─────────────────────────────────────
  {
    to: "/employees",
    label: "Employees",
    icon: Users,
    roles: ["admin", "manager", "supervisor", "accountant"],
    section: "admin",
  },
  {
    to: "/departments",
    label: "Departments",
    icon: Building2,
    roles: ["admin", "manager"],
    section: "admin",
  },
  {
    to: "/projects",
    label: "Projects",
    icon: FolderKanban,
    roles: ["admin", "manager", "supervisor"],
    section: "admin",
  },
  {
    to: "/assets",
    label: "Assets",
    icon: Boxes,
    roles: ["admin", "accountant"],
    section: "admin",
  },
  {
    to: "/documents",
    label: "Documents",
    icon: FileText,
    roles: ["admin", "employee", "manager", "supervisor", "accountant"],
    section: "admin",
  },
  {
    to: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["admin", "manager", "accountant"],
    section: "admin",
  },
  {
    to: "/audit-logs",
    label: "Audit Logs",
    icon: ScrollText,
    roles: ["admin", "accountant"],
    section: "admin",
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
    roles: ["admin", "employee", "manager", "supervisor", "accountant"],
    section: "admin",
  },
];

export function Sidebar() {
  const { pathname: path } = useLocation();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role as Role;
  const isEmployee = role === "employee";
  const items = nav.filter((n) => n.roles.includes(role));
  const workspaceItems = items.filter((i) => i.section === "workspace");
  const adminItems = items.filter((i) => i.section === "admin");

  return (
    <aside
      className="hidden md:flex w-64 min-w-[16rem] max-w-[16rem] flex-col h-screen sticky top-0 transition-colors duration-200"
      style={{
        background: "var(--card)",
        boxShadow: "var(--shadow-elevated)",
        zIndex: 30,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-7 shrink-0">
        <div
          className="flex items-center justify-center p-2 shrink-0"
          style={{
            width: 40,
            height: 40,
            background: "var(--gradient-primary)",
            borderRadius: 14,
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <img src="/logo.png" alt="PulseHR" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="text-base font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
            PulseHR
          </div>
          <div className="text-[10px] tracking-wide font-medium" style={{ color: "var(--muted-foreground)" }}>
            HR Management Platform
          </div>
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-1">
        {/* Workspace section */}
        <div
          className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "var(--primary)" }}
        >
          Main Menu
        </div>
        <div className="space-y-0.5">
          {workspaceItems.map((item) => (
            <NavLink key={item.to} item={item} path={path} />
          ))}
        </div>

        {/* Admin Tools section */}
        {adminItems.length > 0 && (
          <div className="pt-4">
            <div
              className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--primary)" }}
            >
              {isEmployee ? "Resources" : "Admin Tools"}
            </div>
            <div className="space-y-0.5">
              {adminItems.map((item) => (
                <NavLink key={item.to} item={item} path={path} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 pb-5 pt-3 shrink-0">
        {/* User card */}
        <div
          className="flex items-center gap-2.5 mb-3 px-3 py-3 rounded-2xl"
          style={{
            background: "var(--input)",
            boxShadow: "var(--shadow-inset)",
          }}
        >
          <div
            className="shrink-0"
            style={{
              borderRadius: "50%",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <Avatar className="size-8">
              <AvatarFallback
                className="text-xs font-bold"
                style={{
                  background: "var(--gradient-primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>
              {user.name}
            </div>
            <div className="text-[10px] capitalize" style={{ color: "var(--muted-foreground)" }}>
              {user.role}
            </div>
          </div>
          <UserCircle2 className="size-4 shrink-0" style={{ color: "var(--primary)" }} />
        </div>

        {/* Sign out */}
        <button
          onClick={async () => {
            await logout();
            navigate("/auth");
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-150"
          style={{
            color: "var(--destructive)",
            background: "transparent",
          }}
        >
          <LogOut className="size-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  path,
}: {
  item: NavItem;
  path: string;
}) {
  const active = path === item.to || path.startsWith(item.to + "/");
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition-all font-medium",
      )}
      style={
        active
          ? {
              background: "var(--gradient-primary)",
              color: "var(--primary-foreground)",
              boxShadow: "var(--shadow-glow)",
              fontWeight: 700,
            }
          : {
              color: "var(--muted-foreground)",
            }
      }
    >
      <Icon
        className="size-4 shrink-0"
        style={{ color: active ? "var(--primary-foreground)" : "var(--primary)" }}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {active && <ChevronRight className="size-3.5 shrink-0" style={{ color: "var(--primary-foreground)" }} />}
    </Link>
  );
}

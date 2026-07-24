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
  Hexagon,
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
    <aside className="hidden md:flex w-64 min-w-[16rem] max-w-[16rem] flex-col border-r border-border bg-sidebar/80 backdrop-blur-xl h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border shrink-0">
        <div className="size-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow shrink-0 p-1">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-sm font-semibold tracking-tight truncate">VertexEMS</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground truncate">
            Code Vertex
          </div>
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
        {/* Workspace section */}
        <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {isEmployee ? "My Workspace" : "Workspace"}
        </div>
        {workspaceItems.map((item) => (
          <NavLink key={item.to} item={item} path={path} />
        ))}

        {/* Admin Tools section — only if user has admin-section items */}
        {adminItems.length > 0 && (
          <>
            <div className="px-2 pt-4 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {isEmployee ? "Resources" : "Admin Tools"}
            </div>
            {adminItems.map((item) => (
              <NavLink key={item.to} item={item} path={path} />
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3 shrink-0">
        <div className="flex items-center gap-2.5 mb-2 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent/40 transition-colors cursor-default">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="text-xs gradient-primary text-primary-foreground">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{user.name}</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground capitalize">{user.role}</span>
              <span
                className={cn(
                  "inline-block size-1.5 rounded-full",
                  role === "admin"
                    ? "bg-destructive"
                    : role === "manager"
                      ? "bg-[--color-warning]"
                      : role === "accountant"
                        ? "bg-[--color-info]"
                        : "bg-success",
                )}
              />
            </div>
          </div>
          <UserCircle2 className="size-4 text-muted-foreground shrink-0" />
        </div>
        <button
          onClick={async () => {
            await logout();
            navigate("/auth");
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function NavLink({ item, path }: { item: NavItem; path: string }) {
  const active = path === item.to || path.startsWith(item.to + "/");
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        active
          ? "bg-linear-to-r from-primary/15 to-secondary/5 text-foreground shadow-[inset_0_0_0_1px_var(--color-border)]"
          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50",
      )}
    >
      <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
      <span className="flex-1 truncate">{item.label}</span>
      {active && <ChevronRight className="size-3.5 text-primary shrink-0" />}
    </Link>
  );
}

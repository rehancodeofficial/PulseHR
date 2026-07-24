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
    <aside className="hidden md:flex w-64 min-w-[16rem] max-w-[16rem] flex-col bg-sidebar h-screen sticky top-0 border-r border-sidebar-border/10">
      {/* Logo */}
      <div className="flex flex-col gap-1 px-6 py-7 shrink-0">
        <div className="text-2xl font-bold tracking-tight text-white">PulseHR</div>
        <div className="text-[10px] tracking-wider text-sidebar-foreground/60 font-medium">
          HR management Platform
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-1">
        {/* Workspace section */}
        <div className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/45">
          Main Menu
        </div>
        <div className="space-y-1">
          {workspaceItems.map((item) => (
            <NavLink key={item.to} item={item} path={path} />
          ))}
        </div>

        {/* Admin Tools section — only if user has admin-section items */}
        {adminItems.length > 0 && (
          <div className="pt-4">
            <div className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/45">
              {isEmployee ? "Resources" : "Admin Tools"}
            </div>
            <div className="space-y-1">
              {adminItems.map((item) => (
                <NavLink key={item.to} item={item} path={path} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Upgrade to Premium Card */}
      <div className="px-4 py-3 shrink-0">
        <div className="rounded-2xl bg-linear-to-br from-[#123126] to-[#0a1a14] p-4 border border-white/5 shadow-md relative overflow-hidden">
          <div className="text-xs font-bold text-white mb-1">Upgrade to Premium</div>
          <div className="text-[10px] text-sidebar-foreground/70 leading-relaxed mb-3">
            Get interesting features and can improve your performance.
          </div>
          <button className="w-full py-2 px-3 bg-primary text-primary-foreground font-semibold text-xs rounded-xl shadow-sm hover:opacity-90 transition-opacity">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* User footer */}
      <div className="border-t border-sidebar-border/10 p-3 shrink-0">
        <div className="flex items-center gap-2.5 mb-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-default">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user.name}</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-sidebar-foreground/70 capitalize">{user.role}</span>
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
          <UserCircle2 className="size-4 text-sidebar-foreground/60 shrink-0" />
        </div>
        <button
          onClick={async () => {
            await logout();
            navigate("/auth");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground hover:text-white hover:bg-white/5 transition-colors"
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
        "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all font-medium",
        active
          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
          : "text-sidebar-foreground hover:text-white hover:bg-white/5",
      )}
    >
      <Icon className={cn("size-4 shrink-0", active ? "text-primary-foreground" : "text-sidebar-foreground group-hover:text-white")} />
      <span className="flex-1 truncate">{item.label}</span>
      {active && <ChevronRight className="size-3.5 text-primary-foreground shrink-0" />}
    </Link>
  );
}

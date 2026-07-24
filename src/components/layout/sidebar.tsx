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

/* ── Clay sidebar shadow token ── */
const SIDEBAR_SHADOW =
  "8px 0 24px rgba(45,74,43,0.12), -4px 0 12px rgba(255,255,255,0.7)";
const ACTIVE_PILL_SHADOW =
  "4px 4px 12px rgba(45,74,43,0.22), -2px -2px 8px rgba(255,255,255,0.55), inset 0 1px 0 rgba(255,255,255,0.25)";
const AVATAR_SHADOW =
  "3px 3px 8px rgba(45,74,43,0.18), -2px -2px 6px rgba(255,255,255,0.70)";

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
      className="hidden md:flex w-64 min-w-[16rem] max-w-[16rem] flex-col h-screen sticky top-0"
      style={{
        background: "#FAFAF7",
        boxShadow: SIDEBAR_SHADOW,
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
            background: "linear-gradient(145deg, #46613D, #2A3E28)",
            borderRadius: 14,
            boxShadow: "4px 4px 10px rgba(45,74,43,0.28), -2px -2px 6px rgba(255,255,255,0.6)",
          }}
        >
          <img src="/logo.png" alt="PulseHR" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="text-base font-bold tracking-tight" style={{ color: "#2A3324" }}>
            PulseHR
          </div>
          <div className="text-[10px] tracking-wide font-medium" style={{ color: "#6B7862" }}>
            HR Management Platform
          </div>
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-1">
        {/* Workspace section */}
        <div
          className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ color: "#9CB56E" }}
        >
          Main Menu
        </div>
        <div className="space-y-0.5">
          {workspaceItems.map((item) => (
            <NavLink key={item.to} item={item} path={path} activePillShadow={ACTIVE_PILL_SHADOW} />
          ))}
        </div>

        {/* Admin Tools section */}
        {adminItems.length > 0 && (
          <div className="pt-4">
            <div
              className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "#9CB56E" }}
            >
              {isEmployee ? "Resources" : "Admin Tools"}
            </div>
            <div className="space-y-0.5">
              {adminItems.map((item) => (
                <NavLink key={item.to} item={item} path={path} activePillShadow={ACTIVE_PILL_SHADOW} />
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
            background: "#EFF4E7",
            boxShadow: "inset 2px 2px 6px rgba(45,74,43,0.1), inset -1px -1px 4px rgba(255,255,255,0.65)",
          }}
        >
          <div
            className="shrink-0"
            style={{
              borderRadius: "50%",
              boxShadow: AVATAR_SHADOW,
            }}
          >
            <Avatar className="size-8">
              <AvatarFallback
                className="text-xs font-bold"
                style={{
                  background: "linear-gradient(145deg, #9CB56E, #5C7A45)",
                  color: "#FAFAF7",
                }}
              >
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate" style={{ color: "#2A3324" }}>
              {user.name}
            </div>
            <div className="text-[10px] capitalize" style={{ color: "#6B7862" }}>
              {user.role}
            </div>
          </div>
          <UserCircle2 className="size-4 shrink-0" style={{ color: "#9CB56E" }} />
        </div>

        {/* Sign out */}
        <button
          onClick={async () => {
            await logout();
            navigate("/auth");
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all"
          style={{
            color: "#C17A64",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FFF0EC";
            e.currentTarget.style.boxShadow =
              "3px 3px 8px rgba(193,122,100,0.12), -2px -2px 6px rgba(255,255,255,0.7)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.boxShadow = "none";
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
  activePillShadow,
}: {
  item: NavItem;
  path: string;
  activePillShadow: string;
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
              background: "linear-gradient(145deg, #9CB56E 0%, #5C7A45 100%)",
              color: "#FAFAF7",
              boxShadow: activePillShadow,
              fontWeight: 700,
            }
          : {
              color: "#6B7862",
            }
      }
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "#EFF4E7";
          e.currentTarget.style.color = "#2A3324";
          e.currentTarget.style.boxShadow =
            "inset 2px 2px 5px rgba(45,74,43,0.08), inset -1px -1px 3px rgba(255,255,255,0.6)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#6B7862";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      <Icon
        className="size-4 shrink-0"
        style={{ color: active ? "#FAFAF7" : "#9CB56E" }}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {active && <ChevronRight className="size-3.5 shrink-0" style={{ color: "#FAFAF7" }} />}
    </Link>
  );
}

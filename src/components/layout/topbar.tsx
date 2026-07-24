import { useAuth } from "@/lib/auth-store";
import { useNavigate } from "react-router";
import { Bell, Search, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";
import { useQuery } from "@/lib/api/query-hooks";
import { getNotificationsFn } from "@/lib/api/app.functions";
import type { Notification } from "@/types";

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  hr: "HR Specialist",
  manager: "Manager",
  employee: "Employee",
  supervisor: "Supervisor",
  accountant: "Accountant",
};

const RAISED_SHADOW =
  "4px 4px 12px rgba(45,74,43,0.14), -3px -3px 8px rgba(255,255,255,0.80), inset 0 1px 0 rgba(255,255,255,0.55)";
const INSET_SHADOW =
  "inset 3px 3px 8px rgba(45,74,43,0.12), inset -2px -2px 6px rgba(255,255,255,0.72)";

export function Topbar() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: getNotificationsFn,
  });

  if (!user) return null;

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <header
      className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 px-6"
      style={{
        background: "rgba(250,250,247,0.85)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 2px 16px rgba(45,74,43,0.08), 0 -1px 0 rgba(255,255,255,0.7) inset",
      }}
    >
      {/* Clay search bar */}
      <div className="relative flex-1 max-w-xl">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 size-4"
          style={{ color: "#9CB56E" }}
        />
        <input
          type="text"
          placeholder="Search anything here..."
          className="w-full h-12 pl-11 pr-4 text-sm focus:outline-none"
          style={{
            background: "#EFF4E7",
            borderRadius: 20,
            border: "none",
            color: "#2A3324",
            boxShadow: INSET_SHADOW,
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow =
              "inset 3px 3px 10px rgba(45,74,43,0.16), inset -2px -2px 6px rgba(255,255,255,0.72), 0 0 0 2px rgba(156,181,110,0.4)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = INSET_SHADOW;
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Raised clay notification bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative inline-flex items-center justify-center size-11 transition-all"
              style={{
                background: "#FAFAF7",
                borderRadius: "50%",
                border: "none",
                boxShadow: RAISED_SHADOW,
                color: "#5C7A45",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "5px 5px 14px rgba(45,74,43,0.18), -3px -3px 10px rgba(255,255,255,0.85)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = RAISED_SHADOW;
              }}
            >
              <Bell className="size-5" />
              {unread > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 size-5 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{
                    background: "linear-gradient(145deg, #C17A64, #A15A44)",
                    color: "#FAFAF7",
                    boxShadow: "2px 2px 5px rgba(45,74,43,0.2)",
                  }}
                >
                  {unread}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80"
            style={{
              background: "#FAFAF7",
              borderRadius: 20,
              border: "none",
              boxShadow:
                "8px 8px 24px rgba(45,74,43,0.15), -5px -5px 14px rgba(255,255,255,0.8)",
              padding: "8px",
            }}
          >
            <DropdownMenuLabel
              className="font-bold text-sm px-3 py-2"
              style={{ color: "#2A3324" }}
            >
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator style={{ background: "#E1E9D4" }} />
            {notifications.length === 0 ? (
              <div className="text-xs text-center py-4" style={{ color: "#6B7862" }}>
                No new notifications
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="flex-col items-start gap-1 py-2.5 px-3 rounded-xl cursor-pointer"
                  style={{ color: "#2A3324" }}
                >
                  <div className="flex w-full items-center gap-2">
                    <span className="font-semibold text-sm">{n.title}</span>
                    {n.unread && (
                      <span
                        className="ml-auto size-2 rounded-full shrink-0"
                        style={{ background: "#9CB56E" }}
                      />
                    )}
                  </div>
                  <span className="text-xs" style={{ color: "#6B7862" }}>
                    {n.body}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User profile clay button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-3 px-3 py-2 transition-all"
              style={{
                background: "#FAFAF7",
                borderRadius: 20,
                border: "none",
                boxShadow: RAISED_SHADOW,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "5px 5px 14px rgba(45,74,43,0.18), -3px -3px 10px rgba(255,255,255,0.85)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = RAISED_SHADOW;
              }}
            >
              <div
                style={{
                  borderRadius: "50%",
                  boxShadow: "3px 3px 8px rgba(45,74,43,0.18), -2px -2px 6px rgba(255,255,255,0.7)",
                }}
              >
                <Avatar className="size-9">
                  <AvatarFallback
                    className="text-sm font-bold"
                    style={{
                      background: "linear-gradient(145deg, #9CB56E, #5C7A45)",
                      color: "#FAFAF7",
                    }}
                  >
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-sm font-bold" style={{ color: "#2A3324" }}>
                  {user.name}
                </div>
                <div className="text-[10px] font-medium flex items-center gap-1.5" style={{ color: "#6B7862" }}>
                  <span
                    className="size-1.5 rounded-full inline-block animate-pulse"
                    style={{ background: "#9CB56E" }}
                  />
                  {roleLabels[user.role] ?? user.role}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52"
            style={{
              background: "#FAFAF7",
              borderRadius: 20,
              border: "none",
              boxShadow:
                "8px 8px 24px rgba(45,74,43,0.15), -5px -5px 14px rgba(255,255,255,0.8)",
              padding: "8px",
            }}
          >
            <DropdownMenuLabel className="px-3 py-2">
              <div className="text-sm font-semibold" style={{ color: "#2A3324" }}>
                {user.name}
              </div>
              <div className="text-xs font-normal" style={{ color: "#6B7862" }}>
                {user.email}
              </div>
              <div className="text-xs font-medium mt-0.5 capitalize" style={{ color: "#9CB56E" }}>
                {roleLabels[user.role] ?? user.role}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator style={{ background: "#E1E9D4" }} />
            <DropdownMenuItem
              className="gap-2 rounded-xl px-3 py-2 cursor-pointer"
              style={{ color: "#2A3324" }}
            >
              <User className="size-4" style={{ color: "#9CB56E" }} />
              My profile
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: "#E1E9D4" }} />
            <DropdownMenuItem
              className="gap-2 rounded-xl px-3 py-2 cursor-pointer"
              style={{ color: "#C17A64" }}
              onClick={async () => {
                await logout();
                navigate("/auth");
              }}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

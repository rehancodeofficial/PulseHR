import { useAuth } from "@/lib/auth-store";
import { useNavigate } from "react-router";
import { Bell, Search, LogOut, User, Sun, Moon } from "lucide-react";
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
import { useTheme } from "@/components/theme-provider";

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  hr: "HR Specialist",
  manager: "Manager",
  employee: "Employee",
  supervisor: "Supervisor",
  accountant: "Accountant",
};

export function Topbar() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: getNotificationsFn,
  });

  if (!user) return null;

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <header
      className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 px-6 transition-colors duration-200"
      style={{
        background: "var(--card)",
        opacity: 0.96,
        backdropFilter: "blur(16px)",
        boxShadow: "var(--shadow-elevated)",
      }}
    >
      {/* Clay search bar */}
      <div className="relative flex-1 max-w-xl">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 size-4"
          style={{ color: "var(--secondary)" }}
        />
        <input
          type="text"
          placeholder="Search anything here..."
          className="w-full h-12 pl-11 pr-4 text-sm focus:outline-none transition-all duration-200"
          style={{
            background: "var(--input)",
            borderRadius: 20,
            border: "none",
            color: "var(--foreground)",
            boxShadow: "var(--shadow-inset)",
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative inline-flex items-center justify-center size-11 transition-all duration-150 cursor-pointer"
          style={{
            background: "var(--card)",
            borderRadius: "50%",
            border: "none",
            boxShadow: "var(--shadow-glow)",
            color: "var(--primary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
          }}
        >
          {theme === "dark" ? <Sun className="size-5 text-[#F0C64A]" /> : <Moon className="size-5 text-[#6B5A2E]" />}
        </button>

        {/* Raised clay notification bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative inline-flex items-center justify-center size-11 transition-all duration-150 cursor-pointer"
              style={{
                background: "var(--card)",
                borderRadius: "50%",
                border: "none",
                boxShadow: "var(--shadow-glow)",
                color: "var(--primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
              }}
            >
              <Bell className="size-5" />
              {unread > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 size-5 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{
                    background: "var(--destructive)",
                    color: "var(--destructive-foreground)",
                    boxShadow: "2px 2px 5px rgba(0,0,0,0.2)",
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
              background: "var(--card)",
              borderRadius: 20,
              border: "none",
              boxShadow: "var(--shadow-elevated)",
              padding: "8px",
            }}
          >
            <DropdownMenuLabel
              className="font-bold text-sm px-3 py-2"
              style={{ color: "var(--foreground)" }}
            >
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator style={{ background: "var(--input)" }} />
            {notifications.length === 0 ? (
              <div className="text-xs text-center py-4" style={{ color: "var(--muted-foreground)" }}>
                No new notifications
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="flex-col items-start gap-1 py-2.5 px-3 rounded-xl cursor-pointer"
                  style={{ color: "var(--foreground)" }}
                >
                  <div className="flex w-full items-center gap-2">
                    <span className="font-semibold text-sm">{n.title}</span>
                    {n.unread && (
                      <span
                        className="ml-auto size-2 rounded-full shrink-0"
                        style={{ background: "var(--primary)" }}
                      />
                    )}
                  </div>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
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
              className="flex items-center gap-3 px-3 py-2 transition-all duration-150 cursor-pointer"
              style={{
                background: "var(--card)",
                borderRadius: 20,
                border: "none",
                boxShadow: "var(--shadow-glow)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  borderRadius: "50%",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                <Avatar className="size-9">
                  <AvatarFallback
                    className="text-sm font-bold animate-in fade-in duration-200"
                    style={{
                      background: "var(--gradient-primary)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                  {user.name}
                </div>
                <div className="text-[10px] font-medium flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                  <span
                    className="size-1.5 rounded-full inline-block animate-pulse"
                    style={{ background: "var(--success)" }}
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
              background: "var(--card)",
              borderRadius: 20,
              border: "none",
              boxShadow: "var(--shadow-elevated)",
              padding: "8px",
            }}
          >
            <DropdownMenuLabel className="px-3 py-2">
              <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                {user.name}
              </div>
              <div className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>
                {user.email}
              </div>
              <div className="text-xs font-medium mt-0.5 capitalize" style={{ color: "var(--primary)" }}>
                {roleLabels[user.role] ?? user.role}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator style={{ background: "var(--input)" }} />
            <DropdownMenuItem
              className="gap-2 rounded-xl px-3 py-2 cursor-pointer"
              style={{ color: "var(--foreground)" }}
            >
              <User className="size-4" style={{ color: "var(--primary)" }} />
              My profile
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: "var(--input)" }} />
            <DropdownMenuItem
              className="gap-2 rounded-xl px-3 py-2 cursor-pointer"
              style={{ color: "var(--destructive)" }}
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

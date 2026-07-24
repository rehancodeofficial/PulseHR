import { useAuth } from "@/lib/auth-store";
import { useNavigate } from "react-router";
import { Bell, Search, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 bg-background px-6 border-b border-border/10">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search anything here..."
          className="pl-11 h-12 bg-white border border-border/40 rounded-full focus-visible:ring-primary/20 shadow-xs text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative inline-flex items-center justify-center size-11 rounded-full border border-border/40 bg-white hover:bg-muted transition-colors shadow-xs">
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 size-5 rounded-full text-[10px] font-bold bg-destructive text-white flex items-center justify-center border-2 border-background">
                {unread}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="font-bold text-sm">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.slice(0, 5).map((n) => (
              <DropdownMenuItem key={n.id} className="flex-col items-start gap-1 py-2">
                <div className="flex w-full items-center gap-2">
                  <span className="font-semibold text-sm">{n.title}</span>
                  {n.unread && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
                </div>
                <span className="text-xs text-muted-foreground">{n.body}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User profile menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-full hover:bg-muted/40 px-2 py-1.5 transition-colors">
            <Avatar className="size-10 border border-primary/25">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-sm font-bold text-foreground">{user.name}</div>
              <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-primary inline-block animate-pulse" />
                {roleLabels[user.role] ?? user.role}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
              <div className="text-xs text-primary font-medium mt-0.5 capitalize">
                {roleLabels[user.role] ?? user.role}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <User className="size-4" /> My profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={async () => {
                await logout();
                navigate("/auth");
              }}
            >
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

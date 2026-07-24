import { Outlet, Navigate, useLocation } from "react-router";
import { useAuth } from "@/lib/auth-store";
import type { Role } from "@/types";
import {
  ShieldOff,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

interface RoleGuardProps {
  /** Roles that ARE allowed to access the child routes */
  roles: Role[];
}

/**
 * Wraps protected routes that require a specific role.
 * Unlike AuthGuard (which redirects to /auth), RoleGuard renders an
 * Access Denied card in-place so the layout remains visible.
 */
export function RoleGuard({ roles }: RoleGuardProps) {
  const user = useAuth((s) => s.user);
  const location = useLocation();

  if (!user) return <Navigate to="/auth" replace />;

  if (!roles.includes(user.role as Role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="size-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6 shadow-inner">
          <ShieldOff className="size-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm mb-1">
          You don&apos;t have permission to access{" "}
          <span className="font-mono text-sm text-foreground bg-muted px-1.5 py-0.5 rounded">
            {location.pathname}
          </span>
          .
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Contact your administrator if you believe this is a mistake.
        </p>
        <Button asChild className="gradient-primary text-primary-foreground shadow-glow">
          <Link to="/dashboard">
            <LayoutDashboard className="size-4 mr-2" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return <Outlet />;
}

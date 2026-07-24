import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/lib/auth-store";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

/* ─── Clay helper: input wrapper with carved inset groove ─── */
function ClayInput({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      className="clay-input w-full h-11 px-4 text-sm placeholder:text-[#6B5A2E] focus:outline-none"
      style={{
        boxShadow: "var(--shadow-inset)",
        background: "var(--input)",
        color: "var(--foreground)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-inset), 0 0 0 2.5px var(--ring)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-inset)";
      }}
    />
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }
    setLoading(true);
    try {
      const u = await login(email, password, remember);
      toast.success(`Welcome back, ${u.name.split(" ")[0]}`);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen grid lg:grid-cols-2 transition-colors duration-200"
      style={{ background: "var(--background)" }}
    >
      {/* ── Left clay hero panel ── */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
        style={{
          background: "var(--gradient-primary)",
        }}
      >
        {/* Organic blob orbs for depth */}
        <div
          className="absolute"
          style={{
            top: "-80px",
            right: "-80px",
            width: "340px",
            height: "340px",
            borderRadius: "999px",
            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
            filter: "blur(2px)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-60px",
            left: "-60px",
            width: "280px",
            height: "280px",
            borderRadius: "999px",
            background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)",
            filter: "blur(4px)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "40%",
            left: "60%",
            width: "180px",
            height: "180px",
            borderRadius: "999px",
            background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%)",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="clay-logo flex items-center justify-center p-2.5"
            style={{ width: 48, height: 48, background: "var(--card)", boxShadow: "var(--shadow-glow)" }}
          >
            <img src="/logo.png" alt="PulseHR Logo" className="w-full h-full object-contain" />
          </div>
          <div className="leading-tight" style={{ color: "var(--primary-foreground)" }}>
            <div className="font-display text-lg font-bold tracking-tight">PulseHR</div>
            <div className="text-[10px] uppercase tracking-[0.22em] opacity-75">
              HR Management Platform
            </div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative space-y-7" style={{ color: "var(--primary-foreground)" }}>
          {/* Enterprise pill badge */}
          <div
            className="clay-badge inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] px-4 py-2"
            style={{ background: "rgba(255,255,255,0.12)", color: "var(--primary-foreground)" }}
          >
            <Sparkles className="size-3.5 text-inherit" />
            Enterprise EMS Platform
          </div>

          <h1
            className="font-display text-5xl font-bold leading-[1.06] max-w-md"
            style={{ color: "var(--primary-foreground)", textShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
          >
            Run your entire workforce from one premium workspace.
          </h1>

          <p className="text-base max-w-md opacity-90">
            Employees, attendance, leave, projects, assets and audit logs — unified, role-aware, and
            built for scale.
          </p>

          {/* Clay stat pills */}
          <div className="grid grid-cols-3 gap-3 max-w-md pt-1">
            {[
              ["12+", "Modules"],
              ["RBAC", "First-class"],
              ["Realtime", "Insights"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="clay-stat-pill flex flex-col gap-0.5"
                style={{ background: "rgba(255,255,255,0.1)", boxShadow: "var(--shadow-glow)" }}
              >
                <div className="font-display text-2xl font-bold" style={{ color: "var(--primary-foreground)" }}>{v}</div>
                <div className="text-[10px] uppercase tracking-wider opacity-80" style={{ color: "var(--primary-foreground)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-[11px] opacity-70" style={{ color: "var(--primary-foreground)" }}>
          © {new Date().getFullYear()} PulseHR. All rights reserved.
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex items-center justify-center p-6 md:p-12">
        {/* Clay card */}
        <div
          className="clay-card w-full max-w-md p-9"
          style={{
            background: "var(--card)",
            boxShadow: "var(--shadow-elevated)",
          }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div
              className="clay-logo flex items-center justify-center p-1.5"
              style={{ width: 38, height: 38, background: "var(--card)", boxShadow: "var(--shadow-glow)" }}
            >
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="font-display font-bold" style={{ color: "var(--foreground)" }}>PulseHR</div>
          </div>

          <h2 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Sign in to your workspace
          </h2>
          <p className="mt-1.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Enter your credentials to access the platform.
          </p>

          <form className="mt-7 space-y-5" onSubmit={onSubmit}>
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Work email
              </label>
              <ClayInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Password
                </label>
                <Link
                  to="/auth/forgot"
                  className="text-xs font-medium hover:underline"
                  style={{ color: "var(--primary)" }}
                >
                  Forgot?
                </Link>
              </div>
              <ClayInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {/* Remember me — clay toggle */}
            <label className="flex items-center gap-3 select-none cursor-pointer">
              <span
                className="relative flex items-center justify-center"
                style={{ width: 22, height: 22 }}
              >
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 8,
                    background: remember ? "var(--primary)" : "var(--input)",
                    boxShadow: remember ? "var(--shadow-glow)" : "var(--shadow-inset)",
                    transition: "all 0.18s ease",
                  }}
                  onClick={() => setRemember((v) => !v)}
                >
                  {remember && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="var(--primary-foreground)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
                Remember me for 30 days
              </span>
            </label>

            {/* Clay submit button */}
            <button
              type="submit"
              disabled={loading}
              className="clay-button w-full h-11 flex items-center justify-center text-sm font-bold tracking-wide"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "var(--shadow-glow)",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
            </button>

            <div className="text-center text-sm pt-1" style={{ color: "var(--muted-foreground)" }}>
              Don't have an account?{" "}
              <Link
                to="/auth/signup"
                className="font-semibold hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

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
      className="clay-input w-full h-11 px-4 text-sm placeholder:text-[#7A9070] focus:outline-none"
      style={{
        boxShadow:
          "inset 3px 3px 8px rgba(45,74,43,0.14), inset -2px -2px 6px rgba(255,255,255,0.78)",
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow =
          "inset 3px 3px 10px rgba(45,74,43,0.18), inset -2px -2px 6px rgba(255,255,255,0.78), 0 0 0 2.5px rgba(139,170,60,0.45)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow =
          "inset 3px 3px 8px rgba(45,74,43,0.14), inset -2px -2px 6px rgba(255,255,255,0.78)";
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
      className="min-h-screen grid lg:grid-cols-2"
      style={{ background: "linear-gradient(160deg, #EDF2E6 0%, #E4ECD9 50%, #DDE8D0 100%)" }}
    >
      {/* ── Left clay hero panel ── */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #3A5C38 0%, #4A6741 28%, #5C7A3E 58%, #3D5C2A 100%)",
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
            background: "radial-gradient(circle, rgba(168,196,138,0.28) 0%, transparent 70%)",
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
            background: "radial-gradient(circle, rgba(139,170,60,0.18) 0%, transparent 65%)",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="clay-logo flex items-center justify-center p-2.5"
            style={{ width: 48, height: 48 }}
          >
            <img src="/logo.png" alt="PulseHR Logo" className="w-full h-full object-contain" />
          </div>
          <div className="leading-tight text-white">
            <div className="font-display text-lg font-bold tracking-tight">PulseHR</div>
            <div className="text-[10px] uppercase tracking-[0.22em] opacity-75">
              HR Management Platform
            </div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative text-white space-y-7">
          {/* Enterprise pill badge */}
          <div
            className="clay-badge inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] px-4 py-2 text-white/90"
          >
            <Sparkles className="size-3.5 text-[#c8e07a]" />
            Enterprise EMS Platform
          </div>

          <h1
            className="font-display text-5xl font-bold leading-[1.06] max-w-md"
            style={{ color: "#ffffff", textShadow: "0 2px 12px rgba(0,0,0,0.18)" }}
          >
            Run your entire workforce from one premium workspace.
          </h1>

          <p className="text-base max-w-md" style={{ color: "rgba(255,255,255,0.84)" }}>
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
              >
                <div className="font-display text-2xl font-bold text-white">{v}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/72">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-[11px]" style={{ color: "rgba(255,255,255,0.60)" }}>
          © {new Date().getFullYear()} PulseHR. All rights reserved.
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex items-center justify-center p-6 md:p-12">
        {/* Clay card */}
        <div
          className="clay-card w-full max-w-md p-9"
          style={{
            boxShadow:
              "10px 10px 28px rgba(45,74,43,0.17), -7px -7px 18px rgba(255,255,255,0.86), inset 0 1px 0 rgba(255,255,255,0.65)",
          }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div
              className="clay-logo flex items-center justify-center p-1.5"
              style={{ width: 38, height: 38 }}
            >
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="font-display font-bold text-[#1F2B1A]">PulseHR</div>
          </div>

          <h2 className="font-display text-2xl font-bold" style={{ color: "#1F2B1A" }}>
            Sign in to your workspace
          </h2>
          <p className="mt-1.5 text-sm" style={{ color: "#5A7255" }}>
            Enter your credentials to access the platform.
          </p>

          <form className="mt-7 space-y-5" onSubmit={onSubmit}>
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-semibold"
                style={{ color: "#2D4A2B" }}
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
                  style={{ color: "#2D4A2B" }}
                >
                  Password
                </label>
                <Link
                  to="/auth/forgot"
                  className="text-xs font-medium hover:underline"
                  style={{ color: "#5C7A2A" }}
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
                    background: remember ? "#6B8E4E" : "#EEF3E6",
                    boxShadow: remember
                      ? "3px 3px 8px rgba(45,74,43,0.25), -2px -2px 5px rgba(255,255,255,0.5), inset 0 1px 0 rgba(255,255,255,0.18)"
                      : "inset 2px 2px 6px rgba(45,74,43,0.13), inset -1px -1px 4px rgba(255,255,255,0.75)",
                    transition: "all 0.18s ease",
                  }}
                  onClick={() => setRemember((v) => !v)}
                >
                  {remember && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </span>
              <span className="text-sm" style={{ color: "#4A6741" }}>
                Remember me for 30 days
              </span>
            </label>

            {/* Clay submit button */}
            <button
              type="submit"
              disabled={loading}
              className="clay-button w-full h-11 flex items-center justify-center text-sm font-bold tracking-wide"
              style={{
                background: loading
                  ? "linear-gradient(145deg, #7A9830, #5A7820)"
                  : "linear-gradient(145deg, #8BAA3C 0%, #6B8A2A 60%, #4E6B1F 100%)",
                boxShadow:
                  "5px 5px 16px rgba(45,74,43,0.30), -3px -3px 10px rgba(255,255,255,0.60), inset 0 1px 0 rgba(255,255,255,0.28)",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
            </button>

            <div className="text-center text-sm pt-1" style={{ color: "#5A7255" }}>
              Don't have an account?{" "}
              <Link
                to="/auth/signup"
                className="font-semibold hover:underline"
                style={{ color: "#5C7A2A" }}
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

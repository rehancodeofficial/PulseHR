import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/lib/auth-store";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/types";

/* ─── Shared clay input ─── */
function ClayInput({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
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

/* ─── Clay select ─── */
function ClaySelect({
  id,
  value,
  onChange,
  children,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="clay-select w-full h-11 px-4 text-sm focus:outline-none"
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
    >
      {children}
    </select>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const signup = useAuth((s) => s.signup);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("d1");
  const [designation, setDesignation] = useState("Software Engineer");
  const [role, setRole] = useState<Role>("employee");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !email || !password || !designation) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await signup(fullName, email, password, departmentId, designation, role);
      if (res?.isPending) {
        toast.success(
          "Registration request submitted! Your account is pending administrator approval.",
        );
        navigate("/auth");
      } else {
        toast.success(`Welcome, ${fullName.split(" ")[0]}! Your account has been registered.`);
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to register account");
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
        {/* Blob orbs */}
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
          <div className="clay-badge inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] px-4 py-2 text-white/90">
            <Sparkles className="size-3.5 text-[#c8e07a]" />
            Enterprise EMS Platform
          </div>

          <h1
            className="font-display text-5xl font-bold leading-[1.06] max-w-md"
            style={{ color: "#ffffff", textShadow: "0 2px 12px rgba(0,0,0,0.18)" }}
          >
            Join the premium enterprise workspace today.
          </h1>

          <p className="text-base max-w-md" style={{ color: "rgba(255,255,255,0.84)" }}>
            Set up your professional identity, select your workspace department, and access unified
            tracking features instantly.
          </p>

          {/* Clay stat pills */}
          <div className="grid grid-cols-3 gap-3 max-w-md pt-1">
            {[
              ["12+", "Modules"],
              ["RBAC", "First-class"],
              ["Realtime", "Insights"],
            ].map(([v, l]) => (
              <div key={l} className="clay-stat-pill flex flex-col gap-0.5">
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

      {/* ── Right form panel (scrollable) ── */}
      <div className="flex items-start justify-center p-6 md:p-12 overflow-y-auto">
        <div
          className="clay-card w-full max-w-md p-9 my-8"
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
            Create your workspace account
          </h2>
          <p className="mt-1.5 text-sm" style={{ color: "#5A7255" }}>
            Complete the form below to register on the platform.
          </p>

          <form className="mt-7 space-y-4" onSubmit={onSubmit}>
            {/* Full name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-sm font-semibold" style={{ color: "#2D4A2B" }}>
                Full Name
              </label>
              <ClayInput
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold" style={{ color: "#2D4A2B" }}>
                Work Email
              </label>
              <ClayInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane.doe@pulsehr.solutions"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold" style={{ color: "#2D4A2B" }}>
                Password
              </label>
              <ClayInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Department + Role (2-col) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="department" className="block text-sm font-semibold" style={{ color: "#2D4A2B" }}>
                  Department
                </label>
                <ClaySelect
                  id="department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  <option value="d1">Engineering</option>
                  <option value="d2">Design</option>
                  <option value="d3">Human Resources</option>
                  <option value="d4">Sales &amp; Marketing</option>
                  <option value="d5">Finance</option>
                  <option value="d6">Operations</option>
                </ClaySelect>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="role" className="block text-sm font-semibold" style={{ color: "#2D4A2B" }}>
                  Work Role
                </label>
                <ClaySelect
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="accountant">Accountant</option>
                </ClaySelect>
              </div>
            </div>

            {/* Designation */}
            <div className="space-y-1.5">
              <label htmlFor="designation" className="block text-sm font-semibold" style={{ color: "#2D4A2B" }}>
                Designation
              </label>
              <ClayInput
                id="designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Software Engineer"
                required
              />
            </div>

            {/* Clay submit button */}
            <button
              type="submit"
              disabled={loading}
              className="clay-button w-full h-11 flex items-center justify-center text-sm font-bold tracking-wide mt-2"
              style={{
                background: loading
                  ? "linear-gradient(145deg, #7A9830, #5A7820)"
                  : "linear-gradient(145deg, #8BAA3C 0%, #6B8A2A 60%, #4E6B1F 100%)",
                boxShadow:
                  "5px 5px 16px rgba(45,74,43,0.30), -3px -3px 10px rgba(255,255,255,0.60), inset 0 1px 0 rgba(255,255,255,0.28)",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Register Account"}
            </button>

            <div className="text-center text-sm pt-1" style={{ color: "#5A7255" }}>
              Already have an account?{" "}
              <Link
                to="/auth"
                className="font-semibold hover:underline"
                style={{ color: "#5C7A2A" }}
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";

/* ─── Floating theme toggle ─── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="fixed top-4 right-4 z-50 flex items-center justify-center rounded-2xl transition-all duration-200"
      style={{
        width: 40,
        height: 40,
        background: "var(--card)",
        boxShadow: "var(--shadow-glow)",
        color: "var(--foreground)",
      }}
    >
      {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </button>
  );
}

export function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 transition-colors duration-200"
      style={{ background: "var(--background)" }}
    >
      <ThemeToggle />

      {/* Clay card */}
      <div
        className="clay-card w-full max-w-md p-9"
        style={{
          background: "var(--card)",
          boxShadow: "var(--shadow-elevated)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-7">
          <div
            className="clay-logo flex items-center justify-center p-2"
            style={{ width: 44, height: 44, background: "var(--card)", boxShadow: "var(--shadow-glow)" }}
          >
            <img src="/logo.png" alt="PulseHR Logo" className="w-full h-full object-contain" />
          </div>
          <div className="font-display font-bold text-xl" style={{ color: "var(--foreground)" }}>
            PulseHR
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Reset your password
        </h2>
        <p className="mt-1.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Enter your work email and we'll send you a recovery link.
        </p>

        {sent ? (
          <div
            className="mt-6 p-4 text-sm"
            style={{
              background: "var(--muted)",
              borderRadius: 16,
              color: "var(--foreground)",
              boxShadow: "var(--shadow-inset)",
            }}
          >
            If <strong>{email}</strong> exists in our directory, a reset link is on its way.
          </div>
        ) : (
          <form
            className="mt-7 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              setSent(true);
              toast.success("Recovery email sent");
            }}
          >
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Work email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="clay-input w-full h-11 px-4 text-sm focus:outline-none"
                style={{
                  background: "var(--input)",
                  color: "var(--foreground)",
                  boxShadow: "var(--shadow-inset)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow =
                    "var(--shadow-inset), 0 0 0 2.5px var(--ring)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-inset)";
                }}
              />
            </div>

            <button
              type="submit"
              className="clay-button w-full h-11 flex items-center justify-center text-sm font-bold tracking-wide"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              Send recovery link
            </button>
          </form>
        )}

        <Link
          to="/auth"
          className="mt-7 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: "var(--primary)" }}
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

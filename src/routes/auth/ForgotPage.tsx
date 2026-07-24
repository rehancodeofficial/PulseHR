import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(160deg, #EDF2E6 0%, #E4ECD9 50%, #DDE8D0 100%)" }}
    >
      {/* Clay card */}
      <div
        className="clay-card w-full max-w-md p-9"
        style={{
          boxShadow:
            "10px 10px 28px rgba(45,74,43,0.17), -7px -7px 18px rgba(255,255,255,0.86), inset 0 1px 0 rgba(255,255,255,0.65)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-7">
          <div
            className="clay-logo flex items-center justify-center p-2"
            style={{ width: 44, height: 44 }}
          >
            <img src="/logo.png" alt="PulseHR Logo" className="w-full h-full object-contain" />
          </div>
          <div className="font-display font-bold text-xl" style={{ color: "#1F2B1A" }}>
            PulseHR
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold" style={{ color: "#1F2B1A" }}>
          Reset your password
        </h2>
        <p className="mt-1.5 text-sm" style={{ color: "#5A7255" }}>
          Enter your work email and we'll send you a recovery link.
        </p>

        {sent ? (
          <div
            className="mt-6 p-4 text-sm"
            style={{
              background: "rgba(107,142,78,0.12)",
              borderRadius: 16,
              color: "#3A5C20",
              boxShadow:
                "inset 2px 2px 6px rgba(45,74,43,0.12), inset -1px -1px 4px rgba(255,255,255,0.6)",
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
                style={{ color: "#2D4A2B" }}
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
            </div>

            <button
              type="submit"
              className="clay-button w-full h-11 flex items-center justify-center text-sm font-bold tracking-wide"
              style={{
                background: "linear-gradient(145deg, #8BAA3C 0%, #6B8A2A 60%, #4E6B1F 100%)",
                boxShadow:
                  "5px 5px 16px rgba(45,74,43,0.30), -3px -3px 10px rgba(255,255,255,0.60), inset 0 1px 0 rgba(255,255,255,0.28)",
              }}
            >
              Send recovery link
            </button>
          </form>
        )}

        <Link
          to="/auth"
          className="mt-7 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: "#5C7A2A" }}
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

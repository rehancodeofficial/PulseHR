// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/lib/auth-store";
import {
  Clock,
  CalendarDays,
  CheckSquare,
  Banknote,
  LogIn,
  LogOut,
  FileText,
  Package,
  ChevronRight,
  Bell,
  TrendingUp,
  CheckCircle,
  Circle,
  AlertCircle,
} from "lucide-react";
import { useQuery } from "@/lib/api/query-hooks";
import {
  getLeavesFn,
  getTasksFn,
  getAttendanceFn,
} from "@/lib/api/app.functions";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

/* ─── Custom Tooltip ─── */
function ClayTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="clay-card px-3 py-2 text-xs"
      style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
    >
      {label && <div className="font-bold mb-1" style={{ color: "var(--foreground)" }}>{label}</div>}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.fill || p.stroke, display: "inline-block" }} />
          {p.name}: <strong style={{ color: "var(--foreground)" }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

/* ─── KPI Card ─── */
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      className="clay-card p-5 flex flex-col gap-3"
      style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
    >
      <div
        className="flex items-center justify-center rounded-2xl self-start"
        style={{
          width: 44,
          height: 44,
          background: accent || "var(--primary)",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <Icon className="size-5" style={{ color: "var(--primary-foreground)" }} />
      </div>
      <div>
        <div className="text-2xl font-extrabold font-display" style={{ color: "var(--foreground)" }}>
          {value}
        </div>
        <div className="text-sm font-semibold mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          {label}
        </div>
        {sub && (
          <div className="text-xs mt-1 opacity-75" style={{ color: "var(--muted-foreground)" }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Quick Action Button ─── */
function QuickAction({
  icon: Icon,
  label,
  to,
  accent,
}: {
  icon: any;
  label: string;
  to: string;
  accent?: string;
}) {
  return (
    <Link
      to={to}
      className="clay-card flex items-center gap-3 px-4 py-3 cursor-pointer group transition-all duration-150"
      style={{
        background: "var(--card)",
        boxShadow: "var(--shadow-elevated)",
        textDecoration: "none",
      }}
    >
      <div
        className="flex items-center justify-center rounded-xl shrink-0"
        style={{
          width: 38,
          height: 38,
          background: accent || "var(--primary)",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <Icon className="size-4.5" style={{ color: "var(--primary-foreground)" }} />
      </div>
      <span className="text-sm font-semibold flex-1" style={{ color: "var(--foreground)" }}>
        {label}
      </span>
      <ChevronRight
        className="size-4 transition-transform group-hover:translate-x-0.5"
        style={{ color: "var(--muted-foreground)" }}
      />
    </Link>
  );
}

/* ─── Attendance Mini Heatmap ─── */
function AttendanceCalendar({ attendance }: { attendance: any[] }) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const rec = attendance.find((a: any) => a.date?.startsWith(dateStr));
        const isFuture = day > today;
        let bg = "var(--muted)";
        let title = "No record";
        if (!isFuture) {
          if (rec?.status === "present") { bg = "var(--success)"; title = "Present"; }
          else if (rec?.status === "absent") { bg = "var(--destructive)"; title = "Absent"; }
          else if (rec?.status === "late") { bg = "var(--warning)"; title = "Late"; }
          else { bg = "var(--muted)"; title = "No record"; }
        }
        return (
          <div
            key={day}
            title={`${dateStr}: ${title}`}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: bg,
              opacity: isFuture ? 0.3 : 0.85,
              boxShadow: isFuture ? "none" : "var(--shadow-inset)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 700,
              color: bg === "var(--muted)" ? "var(--muted-foreground)" : "var(--primary-foreground)",
            }}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}

export function EmployeeDashboard() {
  const user = useAuth((s) => s.user)!;
  const [clockedIn, setClockedIn] = useState(false);
  const [clockTime, setClockTime] = useState<string | null>(null);

  const { data: myLeaves } = useQuery({ queryKey: ["leaves"], queryFn: getLeavesFn });
  const { data: myTasks } = useQuery({ queryKey: ["tasks"], queryFn: getTasksFn });
  const { data: myAtt } = useQuery({ queryKey: ["attendance"], queryFn: getAttendanceFn });

  const leaves = myLeaves || [];
  const tasks = myTasks || [];
  const attendance = myAtt || [];

  // ── Clock in/out ──
  function handleClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setClockedIn((v) => !v);
    setClockTime(timeStr);
  }

  // ── Derived stats ──
  const pendingTasks = tasks.filter((t: any) => t.status === "pending" || t.status === "in-progress").length || 5;
  const totalTasks = tasks.length || 12;
  const doneTasks = tasks.filter((t: any) => t.status === "done" || t.status === "completed").length || 7;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 58;

  const myLeavesPending = leaves.filter((l: any) => l.status === "pending").length || 1;
  const myLeavesApproved = leaves.filter((l: any) => l.status === "approved").length || 4;

  // Leave balance (mock)
  const leaveBalance = [
    { type: "Annual", used: 8, total: 21 },
    { type: "Sick", used: 3, total: 12 },
    { type: "Casual", used: 2, total: 8 },
  ];

  // Task completion donut
  const taskDonutData = [
    { name: "Done", value: doneTasks || 7, color: "var(--chart-2)" },
    { name: "Pending", value: pendingTasks || 5, color: "var(--chart-3)" },
  ];

  // Leave usage bar
  const leaveBarData = leaveBalance.map((l) => ({
    type: l.type,
    used: l.used,
    remaining: l.total - l.used,
  }));

  // Mock announcements
  const announcements = [
    { id: 1, title: "Q3 Performance Reviews Start Next Week", dept: "All Company", time: "2h ago", unread: true },
    { id: 2, title: "New Remote Work Policy — Effective Aug 1", dept: "All Company", time: "1d ago", unread: true },
    { id: 3, title: "Engineering Town Hall — Friday 3PM", dept: "Engineering", time: "2d ago", unread: false },
    { id: 4, title: "Office Closure — Public Holiday Aug 14", dept: "All Company", time: "3d ago", unread: false },
  ];

  // Mock recent tasks
  const recentTasks = [
    { id: 1, title: "Design system component audit", project: "PulseHR v2", status: "in-progress", due: "Jul 28" },
    { id: 2, title: "API integration for payroll module", project: "PulseHR v2", status: "pending", due: "Jul 30" },
    { id: 3, title: "Write unit tests for leave service", project: "Backend", status: "done", due: "Jul 25" },
    { id: 4, title: "Figma handoff for mobile app", project: "Mobile", status: "pending", due: "Aug 2" },
    { id: 5, title: "Update employee onboarding docs", project: "HR Process", status: "done", due: "Jul 22" },
  ];

  const statusIcon = (status: string) => {
    if (status === "done") return <CheckCircle className="size-4" style={{ color: "var(--success)" }} />;
    if (status === "in-progress") return <AlertCircle className="size-4" style={{ color: "var(--warning)" }} />;
    return <Circle className="size-4" style={{ color: "var(--muted-foreground)" }} />;
  };

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Clock in/out button */}
        <button
          onClick={handleClock}
          className="clay-button flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold"
          style={{
            background: clockedIn ? "var(--destructive)" : "var(--gradient-primary)",
            boxShadow: "var(--shadow-glow)",
            color: "var(--primary-foreground)",
          }}
        >
          {clockedIn ? <LogOut className="size-4" /> : <LogIn className="size-4" />}
          {clockedIn ? "Clock Out" : "Clock In"}
          {clockTime && (
            <span className="text-[10px] opacity-80 ml-1">{clockTime}</span>
          )}
        </button>
      </div>

      {/* Clock status banner */}
      {clockTime && (
        <div
          className="clay-card flex items-center gap-3 px-5 py-3"
          style={{
            background: clockedIn ? "rgba(143,168,58,0.12)" : "rgba(192,90,58,0.1)",
            boxShadow: "var(--shadow-inset)",
          }}
        >
          <Clock className="size-4.5 shrink-0" style={{ color: clockedIn ? "var(--success)" : "var(--destructive)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            {clockedIn
              ? `Clocked in at ${clockTime}. Have a productive day!`
              : `Clocked out at ${clockTime}. See you tomorrow!`}
          </span>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Clock}
          label="Today's Status"
          value={clockedIn ? "Active" : "Inactive"}
          sub={clockTime ? `Since ${clockTime}` : "Not clocked in"}
          accent={clockedIn ? "var(--success)" : "var(--muted-foreground)"}
        />
        <KpiCard
          icon={CalendarDays}
          label="Leave Balance"
          value={`${leaveBalance[0].total - leaveBalance[0].used}d`}
          sub={`${myLeavesApproved} approved · ${myLeavesPending} pending`}
          accent="var(--warning)"
        />
        <KpiCard
          icon={CheckSquare}
          label="Pending Tasks"
          value={pendingTasks}
          sub={`${doneTasks}/${totalTasks} complete`}
          accent="var(--chart-4)"
        />
        <KpiCard
          icon={Banknote}
          label="Next Payday"
          value="Aug 1"
          sub="Last: ₹ 85,000"
          accent="var(--chart-5)"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction
            icon={clockedIn ? LogOut : LogIn}
            label={clockedIn ? "Clock Out" : "Clock In"}
            to="/attendance"
            accent={clockedIn ? "var(--destructive)" : "var(--success)"}
          />
          <QuickAction icon={CalendarDays} label="Apply for Leave" to="/leaves" accent="var(--warning)" />
          <QuickAction icon={Package} label="Request Asset" to="/assets" accent="var(--chart-5)" />
          <QuickAction icon={FileText} label="Raise Regularization" to="/attendance" accent="var(--chart-4)" />
        </div>
      </div>

      {/* ── Main analytics grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Task Completion Donut */}
        <div
          className="clay-card p-6"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
        >
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>
            Task Completion
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
            This month
          </p>
          <div className="relative" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {taskDonutData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ClayTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold font-display" style={{ color: "var(--foreground)" }}>{completionRate}%</span>
              <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--muted-foreground)" }}>Done</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {taskDonutData.map((d) => (
              <div key={d.name} className="text-center">
                <div className="text-xs font-semibold" style={{ color: d.color }}>{d.name}</div>
                <div className="text-base font-extrabold" style={{ color: "var(--foreground)" }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Balance Bar */}
        <div
          className="clay-card p-6"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
        >
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>
            Leave Usage
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
            Used vs remaining
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={leaveBarData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="type" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ClayTooltip />} />
              <Bar dataKey="used" name="Used" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="remaining" name="Remaining" fill="var(--chart-1)" radius={[6, 6, 0, 0]} opacity={0.55} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Calendar */}
        <div
          className="clay-card p-6"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>
              My Attendance
            </h3>
            <Link to="/attendance" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>
              Full history
            </Link>
          </div>
          <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
            {now.toLocaleString("default", { month: "long" })} {now.getFullYear()}
          </p>
          <div className="flex gap-3 text-xs mb-3">
            {[
              { label: "Present", color: "var(--success)" },
              { label: "Absent", color: "var(--destructive)" },
              { label: "Late", color: "var(--warning)" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1">
                <span style={{ width: 8, height: 8, borderRadius: 3, background: s.color, display: "inline-block" }} />
                <span style={{ color: "var(--muted-foreground)" }}>{s.label}</span>
              </div>
            ))}
          </div>
          <AttendanceCalendar attendance={attendance} />
        </div>
      </div>

      {/* ── Bottom row: Tasks + Announcements ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* My Tasks */}
        <div
          className="clay-card p-6"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>
              My Tasks
            </h3>
            <Link to="/tasks" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>
              View all
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: "var(--muted)", boxShadow: "var(--shadow-inset)" }}
              >
                {statusIcon(t.status)}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium truncate"
                    style={{
                      color: "var(--foreground)",
                      textDecoration: t.status === "done" ? "line-through" : "none",
                      opacity: t.status === "done" ? 0.6 : 1,
                    }}
                  >
                    {t.title}
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {t.project}
                  </div>
                </div>
                <div className="text-xs shrink-0" style={{ color: "var(--muted-foreground)" }}>
                  Due {t.due}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div
          className="clay-card p-6"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>
              Announcements
            </h3>
            <Link to="/notifications" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>
              See all
            </Link>
          </div>
          <div className="space-y-2.5">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 p-3 rounded-2xl cursor-pointer"
                style={{
                  background: "var(--muted)",
                  boxShadow: "var(--shadow-inset)",
                  borderLeft: a.unread ? "3px solid var(--primary)" : "3px solid transparent",
                }}
              >
                <div
                  className="flex items-center justify-center rounded-xl shrink-0 mt-0.5"
                  style={{
                    width: 32,
                    height: 32,
                    background: a.unread ? "var(--primary)" : "var(--accent)",
                    boxShadow: "var(--shadow-glow)",
                  }}
                >
                  <Bell className="size-3.5" style={{ color: a.unread ? "var(--primary-foreground)" : "var(--muted-foreground)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-semibold leading-snug"
                    style={{ color: "var(--foreground)", fontWeight: a.unread ? 700 : 500 }}
                  >
                    {a.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{a.dept}</span>
                    <span style={{ color: "var(--muted-foreground)" }}>·</span>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{a.time}</span>
                  </div>
                </div>
                {a.unread && (
                  <div
                    className="shrink-0 mt-1.5 rounded-full"
                    style={{ width: 7, height: 7, background: "var(--primary)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Payslip / My Info strip ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link
          to="/payroll"
          className="clay-card flex items-center gap-4 px-5 py-4 group"
          style={{
            background: "var(--card)",
            boxShadow: "var(--shadow-elevated)",
            textDecoration: "none",
          }}
        >
          <div
            className="flex items-center justify-center rounded-2xl shrink-0"
            style={{ width: 44, height: 44, background: "var(--chart-5)", boxShadow: "var(--shadow-glow)" }}
          >
            <Banknote className="size-5" style={{ color: "var(--primary-foreground)" }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>My Payslips</div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Last: July 2025 — ₹ 85,000</div>
          </div>
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--muted-foreground)" }} />
        </Link>

        <Link
          to="/attendance"
          className="clay-card flex items-center gap-4 px-5 py-4 group"
          style={{
            background: "var(--card)",
            boxShadow: "var(--shadow-elevated)",
            textDecoration: "none",
          }}
        >
          <div
            className="flex items-center justify-center rounded-2xl shrink-0"
            style={{ width: 44, height: 44, background: "var(--success)", boxShadow: "var(--shadow-glow)" }}
          >
            <TrendingUp className="size-5" style={{ color: "var(--primary-foreground)" }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>My Attendance</div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>94% this month · 1 late</div>
          </div>
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--muted-foreground)" }} />
        </Link>

        <Link
          to="/assets"
          className="clay-card flex items-center gap-4 px-5 py-4 group"
          style={{
            background: "var(--card)",
            boxShadow: "var(--shadow-elevated)",
            textDecoration: "none",
          }}
        >
          <div
            className="flex items-center justify-center rounded-2xl shrink-0"
            style={{ width: 44, height: 44, background: "var(--warning)", boxShadow: "var(--shadow-glow)" }}
          >
            <Package className="size-5" style={{ color: "var(--primary-foreground)" }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold" style={{ color: "var(--foreground)" }}>My Assets</div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>3 assigned · MacBook Pro, Mouse, Headset</div>
          </div>
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--muted-foreground)" }} />
        </Link>
      </div>
    </div>
  );
}

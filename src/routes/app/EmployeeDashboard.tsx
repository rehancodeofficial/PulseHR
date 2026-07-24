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
  Award,
  Calendar,
  ShieldAlert,
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
      style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)", zIndex: 9999 }}
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
      <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--muted-foreground)" }} />
    </Link>
  );
}

/* ─── Progress Bar ─── */
function ProgressBar({ label, pct, color, sub }: { label: string; pct: number; color?: string; sub?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="font-bold" style={{ color: color || "var(--primary)" }}>{pct}%</span>
      </div>
      <div className="relative rounded-full overflow-hidden" style={{ height: 10, background: "var(--muted)", boxShadow: "var(--shadow-inset)" }}>
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color || "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }} />
      </div>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
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

  // Leave balance
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
  ];

  // Mock recent tasks
  const recentTasks = [
    { id: 1, title: "Design system component audit", project: "PulseHR v2", status: "in-progress", due: "Jul 28", priority: "high" },
    { id: 2, title: "API integration for payroll module", project: "PulseHR v2", status: "pending", due: "Jul 30", priority: "medium" },
    { id: 3, title: "Write unit tests for leave service", project: "Backend", status: "done", due: "Jul 25", priority: "low" },
    { id: 4, title: "Figma handoff for mobile app", project: "Mobile", status: "pending", due: "Aug 2", priority: "high" },
  ];

  const statusIcon = (status: string) => {
    if (status === "done") return <CheckCircle className="size-4" style={{ color: "var(--success)" }} />;
    if (status === "in-progress") return <AlertCircle className="size-4" style={{ color: "var(--warning)" }} />;
    return <Circle className="size-4" style={{ color: "var(--muted-foreground)" }} />;
  };

  // ── Personal Work Pattern Data ──
  const weeklyHoursData = [
    { name: "Wk 1", logged: 42, target: 40 },
    { name: "Wk 2", logged: 38, target: 40 },
    { name: "Wk 3", logged: 45, target: 40 },
    { name: "Wk 4", logged: 41, target: 40 },
  ];

  const overtimeHoursThisMonth = 8;
  const punctualityStreak = 14;

  // ── Pay & Goals Data ──
  const currentSalaryBreakdown = [
    { name: "Net Pay", value: 68000, color: "var(--chart-2)" },
    { name: "PF & Tax Deductions", value: 12000, color: "var(--chart-4)" },
    { name: "Allowances", value: 5000, color: "var(--chart-1)" },
  ];

  const individualGoals = [
    { title: "Deliver Dashboard Updates", progress: 85, color: "var(--chart-2)" },
    { title: "Optimize Query Performance", progress: 60, color: "var(--chart-3)" },
    { title: "Complete Security Training", progress: 100, color: "var(--chart-1)" },
  ];

  // ── Team & Recognition Data ──
  const teamCalendar = [
    { name: "Julian Wan", status: "Active", reason: "" },
    { name: "Aria Mercer", status: "On Leave", reason: "Annual Leave" },
    { name: "Alex Chen", status: "Active", reason: "" },
    { name: "Damilola Ade", status: "Remote", reason: "Work From Home" },
  ];

  const kudosReceived = [
    { from: "Aria Mercer", text: "Great job resolving the production database deadlock so quickly!", date: "Yesterday" },
    { from: "Julian Wan", text: "The new yellow claymorphism dashboard design looks beautiful and crisp.", date: "3 days ago" },
  ];

  const upcomingMeetings = [
    { title: "Weekly Sync 1:1 with Jane", time: "Tomorrow at 2:00 PM" },
    { title: "Quarterly OKR Review", time: "Jul 31 at 11:00 AM" },
  ];

  // ── Reminders & Personal Info ──
  const docExpiryReminders = [
    { doc: "Passport Renewal", expiry: "In 45 days", isCritical: false },
    { doc: "Visa Expiry (H1B)", expiry: "In 12 days", isCritical: true },
  ];

  const personalTasksPriority = [
    { name: "High", value: 3, color: "var(--chart-4)" },
    { name: "Medium", value: 4, color: "var(--chart-3)" },
    { name: "Low", value: 5, color: "var(--chart-2)" },
  ];

  const now = new Date();

  return (
    <div className="space-y-6 pb-12">
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

      {/* ── SECTION 1: Personal Work Pattern ── */}
      <div>
        <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Personal Work Pattern</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Hours vs Target */}
          <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
            <h3 className="font-display text-sm font-bold mb-3" style={{ color: "var(--foreground)" }}>Weekly Logged Hours</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyHoursData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ClayTooltip />} />
                <Bar dataKey="logged" name="Logged" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="var(--chart-5)" radius={[6, 6, 0, 0]} opacity={0.4} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Overtime & Punctuality Streak */}
          <div className="flex flex-col gap-4">
            <div className="clay-card p-5 flex items-center gap-4" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)", flex: 1 }}>
              <div className="flex items-center justify-center rounded-2xl shrink-0" style={{ width: 44, height: 44, background: "var(--success)", boxShadow: "var(--shadow-glow)" }}>
                <TrendingUp className="size-5" style={{ color: "var(--primary-foreground)" }} />
              </div>
              <div>
                <div className="text-2xl font-extrabold font-display" style={{ color: "var(--foreground)" }}>{punctualityStreak} Days</div>
                <div className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Punctuality Streak</div>
                <div className="text-[10px]" style={{ color: "var(--success)", fontWeight: 600 }}>Consecutive on-time check-ins</div>
              </div>
            </div>

            <div className="clay-card p-5 flex items-center gap-4" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)", flex: 1 }}>
              <div className="flex items-center justify-center rounded-2xl shrink-0" style={{ width: 44, height: 44, background: "var(--chart-3)", boxShadow: "var(--shadow-glow)" }}>
                <Clock className="size-5" style={{ color: "var(--primary-foreground)" }} />
              </div>
              <div>
                <div className="text-2xl font-extrabold font-display" style={{ color: "var(--foreground)" }}>{overtimeHoursThisMonth} hrs</div>
                <div className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Overtime Logged</div>
                <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Total approved overtime this cycle</div>
              </div>
            </div>
          </div>

          {/* Attendance Calendar Mini Heatmap */}
          <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-sm font-bold" style={{ color: "var(--foreground)" }}>My Attendance Heatmap</h3>
              <Link to="/attendance" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>All logs</Link>
            </div>
            <AttendanceCalendar attendance={attendance} />
            <div className="flex gap-2 text-[10px] mt-4 justify-between">
              <span className="flex items-center gap-1"><span style={{ width: 6, height: 6, borderRadius: 2, background: "var(--success)" }} /> Present</span>
              <span className="flex items-center gap-1"><span style={{ width: 6, height: 6, borderRadius: 2, background: "var(--warning)" }} /> Late</span>
              <span className="flex items-center gap-1"><span style={{ width: 6, height: 6, borderRadius: 2, background: "var(--destructive)" }} /> Absent</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Pay, Goals & Reminders ── */}
      <div>
        <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Pay &amp; Goals</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Salary Breakdown */}
          <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
            <h3 className="font-display text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>Current Salary Breakdown</h3>
            <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Gross vs Deductions</p>
            <div className="relative" style={{ height: 130 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={currentSalaryBreakdown} cx="50%" cy="50%" innerRadius={38} outerRadius={55} dataKey="value" strokeWidth={0} paddingAngle={4}>
                    {currentSalaryBreakdown.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<ClayTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-2 text-xs">
              {currentSalaryBreakdown.map((d) => (
                <div key={d.name} className="flex justify-between items-center">
                  <span className="flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, display: "inline-block" }} />
                    {d.name}
                  </span>
                  <span className="font-bold" style={{ color: "var(--foreground)" }}>₹ {d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goals & OKRs */}
          <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
            <h3 className="font-display text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>My OKRs &amp; Goals</h3>
            <div className="space-y-3">
              {individualGoals.map((goal, idx) => (
                <ProgressBar key={idx} label={goal.title} pct={goal.progress} color={goal.color} />
              ))}
            </div>
          </div>

          {/* Reminders & Tenure Counter */}
          <div className="flex flex-col gap-4">
            {/* Expiry Reminders */}
            <div className="clay-card p-5" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)", flex: 1 }}>
              <h3 className="font-display text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--foreground)" }}>Reminders</h3>
              <div className="space-y-2">
                {docExpiryReminders.map((r, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: r.isCritical ? "rgba(192,90,58,0.12)" : "var(--muted)" }}>
                    <ShieldAlert className="size-4 shrink-0" style={{ color: r.isCritical ? "var(--destructive)" : "var(--warning)" }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate text-foreground">{r.doc}</div>
                      <div className="text-[10px] text-muted-foreground">{r.expiry}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tenure anniversary */}
            <div className="clay-card p-5 flex items-center justify-between" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)", color: "var(--primary-foreground)" }}>
              <div>
                <div className="text-[10px] uppercase tracking-widest opacity-80">My Tenure Counter</div>
                <div className="text-xl font-extrabold font-display mt-0.5">2 yrs, 3 mos</div>
                <div className="text-[10px] opacity-90 mt-1">Celebrating work anniversary soon!</div>
              </div>
              <Award className="size-8 opacity-40" />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Team, Tasks & Recognition ── */}
      <div>
        <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>Team &amp; Tasks</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team calendar */}
          <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="size-4.5" style={{ color: "var(--primary)" }} />
              <h3 className="font-display text-sm font-bold text-foreground">Immediate Team Leave &amp; WFH</h3>
            </div>
            <div className="space-y-2">
              {teamCalendar.map((team, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl" style={{ background: "var(--muted)", boxShadow: "var(--shadow-inset)" }}>
                  <span className="text-xs font-semibold text-foreground">{team.name}</span>
                  {team.reason ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(217,138,32,0.15)", color: "var(--warning)" }}>
                      {team.reason}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(143,168,58,0.15)", color: "var(--success)" }}>
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Peer Recognition & Kudos */}
          <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Award className="size-4.5" style={{ color: "var(--warning)" }} />
              <h3 className="font-display text-sm font-bold text-foreground">Kudos Received</h3>
            </div>
            <div className="space-y-3">
              {kudosReceived.map((k, idx) => (
                <div key={idx} className="p-3 rounded-2xl" style={{ background: "var(--muted)", boxShadow: "var(--shadow-inset)" }}>
                  <p className="text-xs italic text-foreground">"{k.text}"</p>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-muted-foreground font-semibold">
                    <span>— {k.from}</span>
                    <span>{k.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Task Priority breakdown */}
          <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
            <h3 className="font-display text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>Task Priority Breakdown</h3>
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>Personal assigned tasks only</p>
            <div className="flex items-center gap-4">
              <div style={{ width: 100, height: 100, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={personalTasksPriority} cx="50%" cy="50%" outerRadius={45} dataKey="value" strokeWidth={0} paddingAngle={2}>
                      {personalTasksPriority.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<ClayTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 flex-1 text-xs">
                {personalTasksPriority.map((d) => (
                  <div key={d.name} className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, display: "inline-block" }} />
                      {d.name}
                    </span>
                    <span className="font-bold text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
            <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>My Assigned Tasks</h3>
            <Link to="/tasks" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>View all</Link>
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
                  <div className="text-[10px] uppercase font-bold" style={{ color: t.priority === "high" ? "var(--destructive)" : t.priority === "medium" ? "var(--warning)" : "var(--success)" }}>
                    {t.priority} Priority
                  </div>
                </div>
                <div className="text-xs shrink-0" style={{ color: "var(--muted-foreground)" }}>
                  Due {t.due}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements & 1:1 meetings */}
        <div className="flex flex-col gap-4">
          <div className="clay-card p-5" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)", flex: 1 }}>
            <h3 className="font-display text-sm font-bold text-foreground mb-3">Upcoming 1:1s &amp; Meetings</h3>
            <div className="space-y-2">
              {upcomingMeetings.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: "var(--muted)", boxShadow: "var(--shadow-inset)" }}>
                  <span className="text-xs font-bold text-foreground">{m.title}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">{m.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="clay-card p-5"
            style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold" style={{ color: "var(--foreground)" }}>Announcements</h3>
              <Link to="/notifications" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>See all</Link>
            </div>
            <div className="space-y-2.5">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-2.5 rounded-2xl cursor-pointer"
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
                      className="text-xs font-semibold leading-snug"
                      style={{ color: "var(--foreground)", fontWeight: a.unread ? 700 : 500 }}
                    >
                      {a.title}
                    </div>
                    <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{a.dept} · {a.time}</span>
                  </div>
                </div>
              ))}
            </div>
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

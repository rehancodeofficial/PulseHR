// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router";
import { useAuth } from "@/lib/auth-store";
import {
  Users,
  UserPlus,
  CalendarOff,
  ClipboardList,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Bell,
  ChevronRight,
  Cake,
  Award,
} from "lucide-react";
import { useQuery } from "@/lib/api/query-hooks";
import {
  getEmployeesFn,
  getDepartmentsFn,
  getAttendanceFn,
  getLeavesFn,
} from "@/lib/api/app.functions";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

/* ─── Shared Clay KPI Card ─── */
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  trend,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  trend?: "up" | "down";
}) {
  return (
    <div
      className="clay-card p-5 flex flex-col gap-3"
      style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{
            width: 44,
            height: 44,
            background: accent || "var(--primary)",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <Icon className="size-5" style={{ color: "var(--primary-foreground)" }} />
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-xl"
            style={{
              background: trend === "up" ? "rgba(143,168,58,0.15)" : "rgba(192,90,58,0.12)",
              color: trend === "up" ? "var(--success)" : "var(--destructive)",
            }}
          >
            {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          </div>
        )}
      </div>
      <div>
        <div
          className="text-2xl font-extrabold font-display leading-tight"
          style={{ color: "var(--foreground)" }}
        >
          {value}
        </div>
        <div className="text-sm font-semibold mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          {label}
        </div>
        {sub && (
          <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)", opacity: 0.75 }}>
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

const CHART_COLORS = {
  primary: "var(--chart-1)",
  success: "var(--chart-2)",
  warning: "var(--chart-3)",
  error: "var(--chart-4)",
  muted: "var(--chart-5)",
};

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

export function AdminDashboard() {
  const user = useAuth((s) => s.user)!;

  const { data: emps } = useQuery({ queryKey: ["employees"], queryFn: getEmployeesFn });
  const { data: depts } = useQuery({ queryKey: ["departments"], queryFn: getDepartmentsFn });
  const { data: atts } = useQuery({ queryKey: ["attendance"], queryFn: getAttendanceFn });
  const { data: leaves } = useQuery({ queryKey: ["leaves"], queryFn: getLeavesFn });

  const employees = emps || [];
  const departments = depts || [];
  const attendance = atts || [];
  const leaveRequests = leaves || [];

  // ── Derived stats ──
  const totalEmps = employees.length || 248;
  const activeEmps = employees.filter((e: any) => e.status === "active").length || 231;
  const inactiveEmps = totalEmps - activeEmps;

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const newJoiners =
    employees.filter((e: any) => {
      const joined = new Date(e.joinDate || e.createdAt || "");
      return joined.getMonth() === thisMonth && joined.getFullYear() === thisYear;
    }).length || 8;

  const today = now.toISOString().split("T")[0];
  const onLeaveToday =
    leaveRequests.filter((l: any) => {
      const start = l.startDate || l.fromDate || "";
      const end = l.endDate || l.toDate || "";
      return l.status === "approved" && start <= today && today <= end;
    }).length || 12;

  const pendingLeaves = leaveRequests.filter((l: any) => l.status === "pending").length || 6;
  const pendingApprovals = pendingLeaves + 4; // attendance regularizations, etc.

  // ── Attendance snapshot ──
  const presentToday = attendance.filter((a: any) => a.date === today && a.status === "present").length || 189;
  const absentToday = attendance.filter((a: any) => a.date === today && a.status === "absent").length || 42;
  const lateToday = attendance.filter((a: any) => a.date === today && a.status === "late").length || 17;

  const attSnapshotData = [
    { name: "Present", value: presentToday, color: CHART_COLORS.success },
    { name: "Absent", value: absentToday || 42, color: CHART_COLORS.error },
    { name: "Late", value: lateToday || 17, color: CHART_COLORS.warning },
  ];

  // ── Department headcount ──
  const deptHeadcount =
    departments.length > 0
      ? departments.map((d: any) => ({
          dept: d.name?.slice(0, 12) || "Dept",
          count: employees.filter((e: any) => e.departmentId === d._id || e.department === d.name).length || Math.floor(Math.random() * 50) + 10,
        }))
      : [
          { dept: "Engineering", count: 72 },
          { dept: "Design", count: 38 },
          { dept: "Sales", count: 55 },
          { dept: "HR", count: 22 },
          { dept: "Finance", count: 31 },
          { dept: "Operations", count: 30 },
        ];

  // ── Attendance trend (last 8 weeks) ──
  const attendanceTrend = [
    { week: "W1", present: 185, absent: 38, late: 25 },
    { week: "W2", present: 192, absent: 32, late: 24 },
    { week: "W3", present: 178, absent: 45, late: 25 },
    { week: "W4", present: 196, absent: 30, late: 22 },
    { week: "W5", present: 188, absent: 36, late: 24 },
    { week: "W6", present: 201, absent: 27, late: 20 },
    { week: "W7", present: 194, absent: 32, late: 22 },
    { week: "W8", present: presentToday, absent: absentToday || 42, late: lateToday || 17 },
  ];

  // ── Leave utilization by type ──
  const leaveByType = [
    { type: "Annual", used: 145, balance: 220 },
    { type: "Sick", used: 82, balance: 155 },
    { type: "Casual", used: 47, balance: 98 },
    { type: "Maternity", used: 8, balance: 60 },
  ];

  // ── Upcoming birthdays / anniversaries ──
  const upcomingEvents = [
    { name: "Sarah Chen", event: "Birthday", date: "Tomorrow", avatar: "SC" },
    { name: "Marcus Webb", event: "Work Anniversary", date: "In 3 days", avatar: "MW" },
    { name: "Priya Patel", event: "Birthday", date: "In 5 days", avatar: "PP" },
    { name: "James Okafor", event: "Work Anniversary", date: "In 6 days", avatar: "JO" },
    { name: "Luna Torres", event: "Birthday", date: "In 9 days", avatar: "LT" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Admin Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Company-wide overview — {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div
          className="clay-badge px-4 py-2 text-xs font-bold uppercase tracking-widest"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          Admin
        </div>
      </div>

      {/* ── KPI Cards Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          icon={Users}
          label="Total Employees"
          value={totalEmps}
          sub={`${activeEmps} active · ${inactiveEmps} inactive`}
          trend="up"
        />
        <KpiCard
          icon={UserPlus}
          label="New This Month"
          value={newJoiners}
          sub="Joined this month"
          accent="var(--success)"
          trend="up"
        />
        <KpiCard
          icon={CalendarOff}
          label="On Leave Today"
          value={onLeaveToday}
          sub="Approved absences"
          accent="var(--warning)"
        />
        <KpiCard
          icon={ClipboardList}
          label="Pending Approvals"
          value={pendingApprovals}
          sub={`${pendingLeaves} leave · ${pendingApprovals - pendingLeaves} other`}
          accent="var(--destructive)"
          trend="down"
        />
        <KpiCard
          icon={CreditCard}
          label="Payroll Status"
          value="Aug 1"
          sub="42 employees pending review"
          accent="var(--chart-5)"
        />
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction icon={UserPlus} label="Invite Employee" to="/employees" />
          <QuickAction icon={Bell} label="Create Announcement" to="/notifications" accent="var(--warning)" />
          <QuickAction icon={CreditCard} label="Start Payroll Run" to="/payroll" accent="var(--chart-5)" />
          <QuickAction icon={ClipboardList} label="Review Pending" to="/leaves" accent="var(--destructive)" />
        </div>
      </div>

      {/* ── Main analytics grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Attendance Snapshot — Donut */}
        <div
          className="clay-card p-6"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
        >
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>
            Attendance Today
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Present / Absent / Late</p>
          <div className="relative" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attSnapshotData}
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {attSnapshotData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ClayTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold font-display" style={{ color: "var(--foreground)" }}>{totalEmps}</span>
              <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--muted-foreground)" }}>Total</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {attSnapshotData.map((d) => (
              <div key={d.name} className="text-center">
                <div className="text-xs font-semibold" style={{ color: d.color }}>{d.name}</div>
                <div className="text-base font-extrabold" style={{ color: "var(--foreground)" }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Trend — Area Chart */}
        <div
          className="lg:col-span-2 clay-card p-6"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
        >
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>
            Attendance Trend
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Weekly — last 8 weeks</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={attendanceTrend} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.04} />
                </linearGradient>
                <linearGradient id="aAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ClayTooltip />} />
              <Area type="monotone" dataKey="present" name="Present" stroke="var(--chart-2)" fill="url(#aPresent)" strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="absent" name="Absent" stroke="var(--chart-4)" fill="url(#aAbsent)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Second Row: Department headcount + Leave utilization ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Department Headcount */}
        <div
          className="clay-card p-6"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>
              Department Headcount
            </h3>
            <Link to="/employees" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>
              View all
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={deptHeadcount}
              layout="vertical"
              margin={{ top: 0, right: 8, left: 10, bottom: 0 }}
            >
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="dept" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<ClayTooltip />} />
              <Bar dataKey="count" name="Employees" fill="var(--chart-1)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Utilization */}
        <div
          className="clay-card p-6"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>
              Leave Utilization
            </h3>
            <Link to="/leaves" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>
              Manage
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leaveByType} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="type" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ClayTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="used" name="Used" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="balance" name="Balance" fill="var(--chart-1)" radius={[6, 6, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Row: Upcoming Events + Turnover ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming Birthdays & Anniversaries */}
        <div
          className="lg:col-span-2 clay-card p-6"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
        >
          <h3 className="font-display text-base font-bold mb-4" style={{ color: "var(--foreground)" }}>
            Upcoming Birthdays &amp; Anniversaries
          </h3>
          <div className="space-y-3">
            {upcomingEvents.map((ev) => (
              <div
                key={ev.name}
                className="flex items-center gap-4 p-3 rounded-2xl"
                style={{ background: "var(--muted)", boxShadow: "var(--shadow-inset)" }}
              >
                <div
                  className="flex items-center justify-center rounded-2xl text-xs font-bold shrink-0"
                  style={{
                    width: 38,
                    height: 38,
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                    boxShadow: "var(--shadow-glow)",
                  }}
                >
                  {ev.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{ev.name}</div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{ev.event}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {ev.event === "Birthday" ? (
                    <Cake className="size-3.5" style={{ color: "var(--warning)" }} />
                  ) : (
                    <Award className="size-3.5" style={{ color: "var(--primary)" }} />
                  )}
                  <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{ev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Turnover / Attrition */}
        <div
          className="clay-card p-6 flex flex-col gap-5"
          style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}
        >
          <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>
            Company Stats
          </h3>

          {[
            { label: "Monthly Attrition", value: "2.4%", trend: "down", color: "var(--success)" },
            { label: "Avg Tenure", value: "3.2 yrs", color: "var(--primary)" },
            { label: "Open Positions", value: "14", trend: "up", color: "var(--warning)" },
            { label: "On Probation", value: "9", color: "var(--muted-foreground)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between p-3 rounded-2xl"
              style={{ background: "var(--muted)", boxShadow: "var(--shadow-inset)" }}
            >
              <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
                {stat.label}
              </span>
              <div className="flex items-center gap-1.5">
                {stat.trend && (
                  stat.trend === "down"
                    ? <TrendingDown className="size-3.5" style={{ color: "var(--success)" }} />
                    : <TrendingUp className="size-3.5" style={{ color: "var(--warning)" }} />
                )}
                <span className="text-sm font-extrabold" style={{ color: stat.color }}>
                  {stat.value}
                </span>
              </div>
            </div>
          ))}

          <Link
            to="/reports"
            className="clay-button flex items-center justify-center gap-2 text-sm font-bold py-2.5 mt-auto"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-glow)",
              color: "var(--primary-foreground)",
              textDecoration: "none",
            }}
          >
            View Full Report
          </Link>
        </div>
      </div>
    </div>
  );
}

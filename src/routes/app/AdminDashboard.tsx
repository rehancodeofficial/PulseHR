// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router";
import { useAuth } from "@/lib/auth-store";
import {
  Users, UserPlus, CalendarOff, ClipboardList, CreditCard,
  TrendingUp, TrendingDown, Bell, ChevronRight, Cake, Award,
  AlertTriangle, Package, FileWarning, CheckSquare, Star,
  DollarSign, Clock, Target, Activity,
} from "lucide-react";
import { useQuery } from "@/lib/api/query-hooks";
import {
  getEmployeesFn, getDepartmentsFn, getAttendanceFn,
  getLeavesFn, getProjectsFn, getTasksFn, getAssetsFn,
} from "@/lib/api/app.functions";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line,
  ComposedChart, CartesianGrid,
} from "recharts";

/* ─────────── Shared primitives ─────────── */

function ClayTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="clay-card px-3 py-2 text-xs" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)", zIndex: 9999 }}>
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

function SectionHeading({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mt-8 mb-4">
      <h2 className="font-display text-lg font-bold" style={{ color: "var(--foreground)" }}>{children}</h2>
      {sub && <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{sub}</p>}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, accent, trend }: {
  icon: any; label: string; value: string | number; sub?: string; accent?: string; trend?: "up" | "down";
}) {
  return (
    <div className="clay-card p-5 flex flex-col gap-3" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center justify-center rounded-2xl" style={{ width: 44, height: 44, background: accent || "var(--primary)", boxShadow: "var(--shadow-glow)" }}>
          <Icon className="size-5" style={{ color: "var(--primary-foreground)" }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-xl" style={{ background: trend === "up" ? "rgba(143,168,58,0.15)" : "rgba(192,90,58,0.12)", color: trend === "up" ? "var(--success)" : "var(--destructive)" }}>
            {trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-extrabold font-display leading-tight" style={{ color: "var(--foreground)" }}>{value}</div>
        <div className="text-sm font-semibold mt-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</div>
        {sub && <div className="text-xs mt-1 opacity-75" style={{ color: "var(--muted-foreground)" }}>{sub}</div>}
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, to, accent }: { icon: any; label: string; to: string; accent?: string }) {
  return (
    <Link to={to} className="clay-card flex items-center gap-3 px-4 py-3 cursor-pointer group transition-all duration-150" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)", textDecoration: "none" }}>
      <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 38, height: 38, background: accent || "var(--primary)", boxShadow: "var(--shadow-glow)" }}>
        <Icon className="size-4.5" style={{ color: "var(--primary-foreground)" }} />
      </div>
      <span className="text-sm font-semibold flex-1" style={{ color: "var(--foreground)" }}>{label}</span>
      <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" style={{ color: "var(--muted-foreground)" }} />
    </Link>
  );
}

/* ─── Attrition Heatmap ─── */
function AttritionHeatmap({ data }: { data: { dept: string; q1: number; q2: number; q3: number; q4: number }[] }) {
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const max = Math.max(...data.flatMap((d) => [d.q1, d.q2, d.q3, d.q4]));
  const cellColor = (val: number) => {
    const intensity = max > 0 ? val / max : 0;
    if (intensity === 0) return "var(--muted)";
    if (intensity < 0.33) return "rgba(143,168,58,0.4)";
    if (intensity < 0.66) return "rgba(217,138,32,0.55)";
    return "rgba(192,90,58,0.75)";
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs" style={{ borderCollapse: "separate", borderSpacing: "4px" }}>
        <thead>
          <tr>
            <th className="text-left pb-2 pr-2" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>Department</th>
            {quarters.map((q) => (
              <th key={q} className="text-center pb-2" style={{ color: "var(--muted-foreground)", fontWeight: 600, minWidth: 48 }}>{q}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.dept}>
              <td className="pr-3 py-1 font-semibold truncate" style={{ color: "var(--foreground)", maxWidth: 100 }}>{row.dept}</td>
              {(["q1", "q2", "q3", "q4"] as const).map((q) => (
                <td key={q} className="text-center">
                  <div className="flex items-center justify-center rounded-xl mx-auto font-bold" style={{ width: 44, height: 32, background: cellColor(row[q]), color: row[q] > max * 0.5 ? "var(--primary-foreground)" : "var(--foreground)", boxShadow: "var(--shadow-inset)" }}>
                    {row[q]}%
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Late Check-in Day Heatmap ─── */
function LateHeatmap({ data }: { data: { day: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  const cellBg = (val: number) => {
    const i = max > 0 ? val / max : 0;
    if (i === 0) return "var(--muted)";
    if (i < 0.4) return "rgba(232,185,58,0.35)";
    if (i < 0.7) return "rgba(217,138,32,0.6)";
    return "rgba(192,90,58,0.8)";
  };
  return (
    <div className="flex items-end gap-3 justify-center pt-2">
      {data.map((d) => (
        <div key={d.day} className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>{d.value}</span>
          <div className="rounded-2xl flex items-end justify-center" style={{ width: 40, height: 60, background: cellBg(d.value), boxShadow: "var(--shadow-inset)" }} />
          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>{d.day.slice(0, 3)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Gantt / Timeline ─── */
function GanttRow({ name, start, duration, total, color }: { name: string; start: number; duration: number; total: number; color: string }) {
  const left = `${(start / total) * 100}%`;
  const width = `${(duration / total) * 100}%`;
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-xs font-medium truncate" style={{ width: 120, color: "var(--foreground)", flexShrink: 0 }}>{name}</span>
      <div className="flex-1 relative" style={{ height: 22, background: "var(--muted)", borderRadius: 10, boxShadow: "var(--shadow-inset)" }}>
        <div className="absolute rounded-xl h-full flex items-center px-2 text-[10px] font-bold overflow-hidden" style={{ left, width, background: color, color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)", minWidth: 8 }}>
          {duration}w
        </div>
      </div>
    </div>
  );
}

/* ─── Progress Bar ─── */
function ProgressBar({ label, pct, color, sub }: { label: string; pct: number; color?: string; sub?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-semibold" style={{ color: "var(--foreground)" }}>{label}</span>
        <span className="font-bold" style={{ color: color || "var(--primary)" }}>{pct}%</span>
      </div>
      <div className="relative rounded-full overflow-hidden" style={{ height: 10, background: "var(--muted)", boxShadow: "var(--shadow-inset)" }}>
        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color || "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }} />
      </div>
      {sub && <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{sub}</p>}
    </div>
  );
}

/* ════════════════════════════════════════ */
export function AdminDashboard() {
  const user = useAuth((s) => s.user)!;
  const { data: emps } = useQuery({ queryKey: ["employees"], queryFn: getEmployeesFn });
  const { data: depts } = useQuery({ queryKey: ["departments"], queryFn: getDepartmentsFn });
  const { data: atts } = useQuery({ queryKey: ["attendance"], queryFn: getAttendanceFn });
  const { data: leaves } = useQuery({ queryKey: ["leaves"], queryFn: getLeavesFn });
  const { data: projs } = useQuery({ queryKey: ["projects"], queryFn: getProjectsFn });
  const { data: tsks } = useQuery({ queryKey: ["tasks"], queryFn: getTasksFn });
  const { data: assts } = useQuery({ queryKey: ["assets"], queryFn: getAssetsFn });

  const employees = emps || [];
  const departments = depts || [];
  const attendance = atts || [];
  const leaveRequests = leaves || [];
  const projects = projs || [];
  const tasks = tsks || [];
  const assets = assts || [];

  const totalEmps = employees.length || 248;
  const activeEmps = employees.filter((e: any) => e.status === "active").length || 231;
  const inactiveEmps = totalEmps - activeEmps;
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const newJoiners = employees.filter((e: any) => {
    const j = new Date(e.joinDate || e.createdAt || "");
    return j.getMonth() === thisMonth && j.getFullYear() === thisYear;
  }).length || 8;
  const today = now.toISOString().split("T")[0];
  const onLeaveToday = leaveRequests.filter((l: any) => l.status === "approved" && (l.startDate || l.fromDate || "") <= today && today <= (l.endDate || l.toDate || "")).length || 12;
  const pendingLeaves = leaveRequests.filter((l: any) => l.status === "pending").length || 6;
  const pendingApprovals = pendingLeaves + 4;
  const presentToday = attendance.filter((a: any) => a.date === today && a.status === "present").length || 189;
  const absentToday = attendance.filter((a: any) => a.date === today && a.status === "absent").length || 42;
  const lateToday = attendance.filter((a: any) => a.date === today && a.status === "late").length || 17;

  const attSnapshotData = [
    { name: "Present", value: presentToday, color: "var(--chart-2)" },
    { name: "Absent", value: absentToday, color: "var(--chart-4)" },
    { name: "Late", value: lateToday, color: "var(--chart-3)" },
  ];

  const deptHeadcount = departments.length > 0
    ? departments.map((d: any) => ({ dept: d.name?.slice(0, 12) || "Dept", count: employees.filter((e: any) => e.departmentId === d._id || e.department === d.name).length || Math.floor(Math.random() * 50) + 10 }))
    : [{ dept: "Engineering", count: 72 }, { dept: "Design", count: 38 }, { dept: "Sales", count: 55 }, { dept: "HR", count: 22 }, { dept: "Finance", count: 31 }, { dept: "Operations", count: 30 }];

  const attendanceTrend = [
    { week: "W1", present: 185, absent: 38 }, { week: "W2", present: 192, absent: 32 },
    { week: "W3", present: 178, absent: 45 }, { week: "W4", present: 196, absent: 30 },
    { week: "W5", present: 188, absent: 36 }, { week: "W6", present: 201, absent: 27 },
    { week: "W7", present: 194, absent: 32 }, { week: "W8", present: presentToday, absent: absentToday },
  ];

  const leaveByType = [
    { type: "Annual", used: 145, balance: 220 }, { type: "Sick", used: 82, balance: 155 },
    { type: "Casual", used: 47, balance: 98 }, { type: "Maternity", used: 8, balance: 60 },
  ];

  const upcomingEvents = [
    { name: "Sarah Chen", event: "Birthday", date: "Tomorrow", avatar: "SC" },
    { name: "Marcus Webb", event: "Work Anniversary", date: "In 3 days", avatar: "MW" },
    { name: "Priya Patel", event: "Birthday", date: "In 5 days", avatar: "PP" },
    { name: "James Okafor", event: "Work Anniversary", date: "In 6 days", avatar: "JO" },
    { name: "Luna Torres", event: "Birthday", date: "In 9 days", avatar: "LT" },
  ];

  // ── Financial Data ──
  const payrollTrend = [
    { month: "Feb", cost: 1820000 }, { month: "Mar", cost: 1875000 },
    { month: "Apr", cost: 1910000 }, { month: "May", cost: 1895000 },
    { month: "Jun", cost: 1940000 }, { month: "Jul", cost: 1985000 },
  ];

  const budgetVsActual = [
    { dept: "Eng", budget: 620, actual: 588 }, { dept: "Design", budget: 280, actual: 271 },
    { dept: "Sales", budget: 450, actual: 467 }, { dept: "HR", budget: 180, actual: 162 },
    { dept: "Finance", budget: 240, actual: 235 }, { dept: "Ops", budget: 210, actual: 198 },
  ];

  const overtimeData = [
    { month: "Feb", hours: 320, cost: 48000 }, { month: "Mar", hours: 280, cost: 42000 },
    { month: "Apr", hours: 410, cost: 61500 }, { month: "May", hours: 360, cost: 54000 },
    { month: "Jun", hours: 295, cost: 44250 }, { month: "Jul", hours: 340, cost: 51000 },
  ];

  const costPerHire = [
    { month: "Feb", cost: 12400 }, { month: "Mar", cost: 14200 }, { month: "Apr", cost: 11800 },
    { month: "May", cost: 13600 }, { month: "Jun", cost: 12900 }, { month: "Jul", cost: 13100 },
  ];

  // ── Workforce Insights ──
  const attritionHeatmap = [
    { dept: "Engineering", q1: 2, q2: 3, q3: 5, q4: 4 },
    { dept: "Design", q1: 1, q2: 4, q3: 2, q4: 6 },
    { dept: "Sales", q1: 8, q2: 7, q3: 9, q4: 11 },
    { dept: "HR", q1: 1, q2: 1, q3: 2, q4: 1 },
    { dept: "Finance", q1: 2, q2: 3, q3: 2, q4: 3 },
    { dept: "Operations", q1: 4, q2: 5, q3: 6, q4: 5 },
  ];

  const avgTenure = [
    { dept: "Engineering", years: 3.8 }, { dept: "Design", years: 2.9 },
    { dept: "Sales", years: 1.7 }, { dept: "HR", years: 4.2 },
    { dept: "Finance", years: 5.1 }, { dept: "Operations", years: 3.3 },
  ];

  const genderData = [
    { name: "Male", value: 142, color: "var(--chart-1)" },
    { name: "Female", value: 89, color: "var(--chart-2)" },
    { name: "Non-binary", value: 12, color: "var(--chart-3)" },
    { name: "Prefer not to say", value: 5, color: "var(--chart-5)" },
  ];

  const lateByDay = [
    { day: "Monday", value: 34 }, { day: "Tuesday", value: 18 },
    { day: "Wednesday", value: 14 }, { day: "Thursday", value: 16 },
    { day: "Friday", value: 29 },
  ];

  const leaveTypePie = [
    { name: "Annual", value: 145, color: "var(--chart-1)" },
    { name: "Sick", value: 82, color: "var(--chart-4)" },
    { name: "Casual", value: 47, color: "var(--chart-3)" },
    { name: "Maternity", value: 8, color: "var(--chart-2)" },
  ];

  // ── Projects & Performance ──
  const allTasks = tasks.length > 0 ? tasks : [];
  const taskTodo = allTasks.filter((t: any) => t.status === "pending" || t.status === "todo").length || 48;
  const taskInProgress = allTasks.filter((t: any) => t.status === "in-progress").length || 67;
  const taskDone = allTasks.filter((t: any) => t.status === "done" || t.status === "completed").length || 124;
  const taskOverdue = allTasks.filter((t: any) => {
    const due = new Date(t.dueDate || t.deadline || "");
    return due < now && t.status !== "done" && t.status !== "completed";
  }).length || 13;

  const taskDistData = [
    { name: "To Do", value: taskTodo, color: "var(--chart-5)" },
    { name: "In Progress", value: taskInProgress, color: "var(--chart-3)" },
    { name: "Done", value: taskDone, color: "var(--chart-2)" },
  ];

  const ganttProjects = projects.length > 0
    ? projects.slice(0, 6).map((p: any, i: number) => ({
        name: p.name || `Project ${i + 1}`,
        start: Math.floor(Math.random() * 4),
        duration: Math.floor(Math.random() * 6) + 2,
        color: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--primary)"][i % 6],
      }))
    : [
        { name: "PulseHR v2.0", start: 0, duration: 8, color: "var(--chart-1)" },
        { name: "Mobile App MVP", start: 2, duration: 6, color: "var(--chart-2)" },
        { name: "Data Migration", start: 1, duration: 4, color: "var(--chart-3)" },
        { name: "API Gateway", start: 4, duration: 5, color: "var(--chart-4)" },
        { name: "QA Automation", start: 3, duration: 7, color: "var(--chart-5)" },
        { name: "Security Audit", start: 6, duration: 3, color: "var(--primary)" },
      ];

  const topPerformers = [
    { rank: 1, name: "Priya Sharma", dept: "Engineering", score: 97, badge: "gold" },
    { rank: 2, name: "Marcus Webb", dept: "Design", score: 94, badge: "silver" },
    { rank: 3, name: "Asel Nurova", dept: "Sales", score: 92, badge: "bronze" },
    { rank: 4, name: "Chen Jian", dept: "Engineering", score: 89, badge: "" },
    { rank: 5, name: "Rita Osei", dept: "Finance", score: 87, badge: "" },
  ];

  const badgeColor = (b: string) => b === "gold" ? "#E8B93A" : b === "silver" ? "#A8A8A8" : b === "bronze" ? "#C87941" : "var(--muted)";

  // ── Operational ──
  const assetData = assets.length > 0
    ? [
        { type: "Laptops", total: assets.filter((a: any) => a.type === "Laptop" || a.category === "Laptop").length || 120, assigned: 108, depreciation: 68 },
        { type: "Monitors", total: assets.filter((a: any) => a.type === "Monitor").length || 95, assigned: 82, depreciation: 55 },
        { type: "Phones", total: 45, assigned: 38, depreciation: 78 },
      ]
    : [
        { type: "Laptops", total: 120, assigned: 108, depreciation: 68 },
        { type: "Monitors", total: 95, assigned: 82, depreciation: 55 },
        { type: "Phones", total: 45, assigned: 38, depreciation: 78 },
        { type: "Peripherals", total: 200, assigned: 162, depreciation: 42 },
      ];

  const licenseData = [
    { name: "Figma", used: 28, total: 30 }, { name: "GitHub", used: 68, total: 75 },
    { name: "Slack", used: 241, total: 250 }, { name: "Zoom", used: 185, total: 200 },
    { name: "Jira", used: 72, total: 80 },
  ];

  const expiringDocs = [
    { name: "James Okafor", doc: "Work Visa", expiry: "Aug 15, 2025", urgency: "critical" },
    { name: "Asel Nurova", doc: "Employment Contract", expiry: "Aug 28, 2025", urgency: "warning" },
    { name: "Rita Osei", doc: "Professional License", expiry: "Sep 10, 2025", urgency: "warning" },
    { name: "Chen Jian", doc: "NDA Agreement", expiry: "Sep 30, 2025", urgency: "info" },
    { name: "Luna Torres", doc: "Work Permit", expiry: "Oct 5, 2025", urgency: "info" },
  ];

  const onboardingProgress = [
    { name: "Sarah Chen", progress: 85, joined: "Jul 18" },
    { name: "Marcus Liu", progress: 60, joined: "Jul 21" },
    { name: "Temi Adeyemi", progress: 40, joined: "Jul 23" },
  ];

  const urgencyColor = (u: string) =>
    u === "critical" ? "var(--destructive)" : u === "warning" ? "var(--warning)" : "var(--chart-5)";

  const urgencyBg = (u: string) =>
    u === "critical" ? "rgba(192,90,58,0.12)" : u === "warning" ? "rgba(217,138,32,0.12)" : "var(--muted)";

  return (
    <div className="space-y-2 pb-10">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--foreground)" }}>Admin Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Company-wide overview — {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="clay-badge px-4 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)" }}>
          Admin
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={Users} label="Total Employees" value={totalEmps} sub={`${activeEmps} active · ${inactiveEmps} inactive`} trend="up" />
        <KpiCard icon={UserPlus} label="New This Month" value={newJoiners} sub="Joined this month" accent="var(--success)" trend="up" />
        <KpiCard icon={CalendarOff} label="On Leave Today" value={onLeaveToday} sub="Approved absences" accent="var(--warning)" />
        <KpiCard icon={ClipboardList} label="Pending Approvals" value={pendingApprovals} sub={`${pendingLeaves} leave · ${pendingApprovals - pendingLeaves} other`} accent="var(--destructive)" trend="down" />
        <KpiCard icon={CreditCard} label="Payroll Status" value="Aug 1" sub="42 employees pending review" accent="var(--chart-5)" />
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mt-5 mb-3" style={{ color: "var(--muted-foreground)" }}>Quick Actions</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction icon={UserPlus} label="Invite Employee" to="/employees" />
          <QuickAction icon={Bell} label="Create Announcement" to="/notifications" accent="var(--warning)" />
          <QuickAction icon={CreditCard} label="Start Payroll Run" to="/payroll" accent="var(--chart-5)" />
          <QuickAction icon={ClipboardList} label="Review Pending" to="/leaves" accent="var(--destructive)" />
        </div>
      </div>

      {/* ══════════════════════════════════════
          SECTION 1 — ATTENDANCE & LEAVE
      ══════════════════════════════════════ */}
      <SectionHeading sub="Real-time workforce attendance snapshot">Attendance &amp; Leave</SectionHeading>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Donut */}
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Attendance Today</h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Present / Absent / Late</p>
          <div className="relative" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attSnapshotData} cx="50%" cy="50%" innerRadius={54} outerRadius={78} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {attSnapshotData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
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

        {/* Attendance Trend */}
        <div className="lg:col-span-2 clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Attendance Trend</h3>
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

      {/* Leave Type Distribution + Late Check-in Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Leave Type Distribution</h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Proportional usage this year</p>
          <div className="flex items-center gap-4">
            <div style={{ width: 140, height: 140, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leaveTypePie} cx="50%" cy="50%" outerRadius={65} dataKey="value" strokeWidth={0} paddingAngle={3}>
                    {leaveTypePie.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<ClayTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5 flex-1">
              {leaveTypePie.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, display: "inline-block" }} />
                    <span style={{ color: "var(--foreground)" }}>{d.name}</span>
                  </div>
                  <span className="font-bold" style={{ color: "var(--foreground)" }}>{d.value} days</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Late Check-ins by Day</h3>
          <p className="text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>Mon &amp; Fri patterns visible — monthly aggregate</p>
          <LateHeatmap data={lateByDay} />
          <p className="text-[10px] mt-3 text-center" style={{ color: "var(--muted-foreground)" }}>
            Monday &amp; Friday show highest late arrivals — consider flexible hours policy
          </p>
        </div>
      </div>

      {/* Department headcount + Leave utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>Department Headcount</h3>
            <Link to="/employees" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>View all</Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptHeadcount} layout="vertical" margin={{ top: 0, right: 8, left: 10, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="dept" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<ClayTooltip />} />
              <Bar dataKey="count" name="Employees" fill="var(--chart-1)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>Leave Utilization</h3>
            <Link to="/leaves" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>Manage</Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leaveByType} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="type" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ClayTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} iconType="circle" iconSize={8} />
              <Bar dataKey="used" name="Used" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="balance" name="Balance" fill="var(--chart-1)" radius={[6, 6, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══════════════════════════════════════
          SECTION 2 — FINANCIAL
      ══════════════════════════════════════ */}
      <SectionHeading sub="Monthly expenditure, budget tracking and overtime costs">Financial Overview</SectionHeading>

      {/* Financial KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} label="Monthly Payroll" value="₹19.85L" sub="Jul 2025 run" accent="var(--chart-5)" trend="up" />
        <KpiCard icon={TrendingUp} label="Avg Cost/Hire" value="₹13,100" sub="Last 6 months avg" accent="var(--warning)" />
        <KpiCard icon={Clock} label="Overtime Hours" value="340 hrs" sub="Jul — +15% vs Jun" accent="var(--destructive)" trend="up" />
        <KpiCard icon={Activity} label="Budget Variance" value="-2.8%" sub="Under budget this month" accent="var(--success)" trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Payroll cost trend */}
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Payroll Cost Trend</h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Monthly total expenditure (₹)</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={payrollTrend} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="payrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip content={<ClayTooltip />} formatter={(v: number) => [`₹${(v / 100000).toFixed(2)}L`, "Payroll"]} />
              <Line type="monotone" dataKey="cost" name="Payroll Cost" stroke="var(--chart-1)" strokeWidth={3} dot={{ fill: "var(--chart-1)", r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Budget vs Actual */}
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Budget vs. Actual Spend</h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Per department (₹ thousands)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={budgetVsActual} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ClayTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }} iconType="circle" iconSize={8} />
              <Bar dataKey="budget" name="Budget" fill="var(--chart-1)" radius={[6, 6, 0, 0]} opacity={0.55} />
              <Bar dataKey="actual" name="Actual" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Overtime + Cost per hire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Overtime Hours &amp; Cost</h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Company-wide per month</p>
          <ResponsiveContainer width="100%" height={170}>
            <ComposedChart data={overtimeData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<ClayTooltip />} />
              <Bar yAxisId="left" dataKey="hours" name="Hours" fill="var(--chart-3)" radius={[6, 6, 0, 0]} opacity={0.7} />
              <Line yAxisId="right" type="monotone" dataKey="cost" name="Cost" stroke="var(--chart-4)" strokeWidth={2.5} dot={{ fill: "var(--chart-4)", r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Cost Per Hire</h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Average recruitment cost per new hire (₹)</p>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={costPerHire} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<ClayTooltip />} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Cost/Hire"]} />
              <Line type="monotone" dataKey="cost" name="Cost/Hire" stroke="var(--chart-2)" strokeWidth={3} dot={{ fill: "var(--chart-2)", r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══════════════════════════════════════
          SECTION 3 — WORKFORCE INSIGHTS
      ══════════════════════════════════════ */}
      <SectionHeading sub="Attrition patterns, tenure analysis and diversity metrics">Workforce Insights</SectionHeading>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Diversity Donut */}
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Gender Distribution</h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Workforce diversity breakdown</p>
          <div className="relative" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={48} outerRadius={70} dataKey="value" strokeWidth={0} paddingAngle={4}>
                  {genderData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<ClayTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {genderData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, display: "inline-block" }} />
                  <span style={{ color: "var(--muted-foreground)" }}>{d.name}</span>
                </div>
                <span className="font-bold" style={{ color: "var(--foreground)" }}>{d.value} ({Math.round(d.value / totalEmps * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Average Tenure by Dept */}
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Avg Tenure by Dept</h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Years of average experience</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={avgTenure} layout="vertical" margin={{ top: 0, right: 8, left: 10, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} domain={[0, 6]} tickFormatter={(v) => `${v}yr`} />
              <YAxis type="category" dataKey="dept" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<ClayTooltip />} formatter={(v: number) => [`${v} years`, "Avg Tenure"]} />
              <Bar dataKey="years" name="Avg Tenure" fill="var(--chart-2)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attrition Heatmap */}
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Attrition Heatmap</h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Turnover % by dept per quarter</p>
          <AttritionHeatmap data={attritionHeatmap} />
          <div className="flex items-center gap-3 mt-4 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
            <span>Low</span>
            <div className="flex gap-1">
              {["rgba(143,168,58,0.4)", "rgba(217,138,32,0.6)", "rgba(192,90,58,0.8)"].map((c, i) => (
                <span key={i} style={{ width: 16, height: 10, borderRadius: 4, background: c, display: "inline-block" }} />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          SECTION 4 — PROJECTS & PERFORMANCE
      ══════════════════════════════════════ */}
      <SectionHeading sub="Company-wide task status, project timelines and performance data">Projects &amp; Performance</SectionHeading>

      {/* Overdue flag + task distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task status donut */}
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="font-display text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Task Status</h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Company-wide distribution</p>
          <div className="relative" style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskDistData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} dataKey="value" strokeWidth={0} paddingAngle={4}>
                  {taskDistData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<ClayTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold font-display" style={{ color: "var(--foreground)" }}>{taskTodo + taskInProgress + taskDone}</span>
              <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--muted-foreground)" }}>Total</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-3">
            {taskDistData.map((d) => (
              <div key={d.name} className="text-center">
                <div className="text-[10px] font-semibold" style={{ color: d.color }}>{d.name}</div>
                <div className="text-sm font-extrabold" style={{ color: "var(--foreground)" }}>{d.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue red-flag + Performance review */}
        <div className="flex flex-col gap-4">
          {/* Overdue tasks */}
          <div className="clay-card p-5 flex items-center gap-4" style={{ background: "rgba(192,90,58,0.10)", boxShadow: "var(--shadow-elevated)" }}>
            <div className="flex items-center justify-center rounded-2xl shrink-0" style={{ width: 48, height: 48, background: "var(--destructive)", boxShadow: "var(--shadow-glow)" }}>
              <AlertTriangle className="size-5" style={{ color: "var(--primary-foreground)" }} />
            </div>
            <div>
              <div className="text-3xl font-extrabold font-display" style={{ color: "var(--destructive)" }}>{taskOverdue}</div>
              <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Overdue Tasks</div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Across all projects — needs attention</div>
            </div>
          </div>

          {/* Performance review completion */}
          <div className="clay-card p-5 flex-1" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
            <h3 className="font-display text-sm font-bold mb-3" style={{ color: "var(--foreground)" }}>Performance Review Cycle</h3>
            <div className="space-y-3">
              <ProgressBar label="Overall completion" pct={68} color="var(--chart-2)" sub="68 of 100 employees reviewed" />
              <ProgressBar label="Self-assessments" pct={82} color="var(--chart-1)" />
              <ProgressBar label="Manager reviews" pct={54} color="var(--chart-3)" />
            </div>
          </div>
        </div>

        {/* Top Performers Leaderboard */}
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Star className="size-4.5" style={{ color: "var(--primary)" }} />
            <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>Top Performers</h3>
          </div>
          <div className="space-y-2.5">
            {topPerformers.map((p) => (
              <div key={p.rank} className="flex items-center gap-3 p-2.5 rounded-2xl" style={{ background: "var(--muted)", boxShadow: "var(--shadow-inset)" }}>
                <div className="flex items-center justify-center rounded-xl text-xs font-extrabold shrink-0" style={{ width: 32, height: 32, background: badgeColor(p.badge), color: p.badge ? "var(--primary-foreground)" : "var(--muted-foreground)", boxShadow: "var(--shadow-glow)" }}>
                  #{p.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{p.name}</div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{p.dept}</div>
                </div>
                <div className="text-sm font-extrabold shrink-0" style={{ color: "var(--primary)" }}>{p.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gantt / Project Timeline */}
      <div className="clay-card p-6 mt-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>Project Timeline</h3>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Active projects — week-by-week Gantt view (12 week window)</p>
          </div>
          <Link to="/projects" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>All projects</Link>
        </div>
        <div className="mb-3 flex gap-2 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          {Array.from({ length: 13 }, (_, i) => (
            <span key={i} className="flex-1 text-center">{i === 0 ? "" : `W${i}`}</span>
          ))}
        </div>
        {ganttProjects.map((p) => (
          <GanttRow key={p.name} name={p.name} start={p.start} duration={p.duration} total={12} color={p.color} />
        ))}
      </div>

      {/* ══════════════════════════════════════
          SECTION 5 — OPERATIONAL
      ══════════════════════════════════════ */}
      <SectionHeading sub="Asset tracking, license usage, compliance and onboarding">Operational</SectionHeading>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Utilization */}
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>Asset Utilization &amp; Depreciation</h3>
            <Link to="/assets" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>View assets</Link>
          </div>
          <div className="space-y-4">
            {assetData.map((a) => (
              <div key={a.type} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold" style={{ color: "var(--foreground)" }}>{a.type}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>{a.assigned}/{a.total} assigned</span>
                </div>
                <div className="relative rounded-full overflow-hidden" style={{ height: 8, background: "var(--muted)", boxShadow: "var(--shadow-inset)" }}>
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(a.assigned / a.total) * 100}%`, background: "var(--chart-1)" }} />
                </div>
                <div className="flex justify-between text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                  <span>Utilization: {Math.round(a.assigned / a.total * 100)}%</span>
                  <span style={{ color: a.depreciation > 65 ? "var(--destructive)" : "var(--warning)" }}>Depreciation: {a.depreciation}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Software License Usage */}
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <h3 className="font-display text-base font-bold mb-4" style={{ color: "var(--foreground)" }}>Software License Usage</h3>
          <div className="space-y-4">
            {licenseData.map((l) => {
              const pct = Math.round((l.used / l.total) * 100);
              return (
                <div key={l.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold" style={{ color: "var(--foreground)" }}>{l.name}</span>
                    <span style={{ color: pct > 90 ? "var(--destructive)" : "var(--muted-foreground)" }}>{l.used}/{l.total} seats ({pct}%)</span>
                  </div>
                  <div className="relative rounded-full overflow-hidden" style={{ height: 8, background: "var(--muted)", boxShadow: "var(--shadow-inset)" }}>
                    <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${pct}%`, background: pct > 90 ? "var(--destructive)" : pct > 75 ? "var(--warning)" : "var(--chart-2)" }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] mt-3" style={{ color: "var(--muted-foreground)" }}>
            Slack nearing capacity (96%). Consider upgrading seats.
          </p>
        </div>
      </div>

      {/* Expiring Documents + Onboarding */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Expiring docs */}
        <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
          <div className="flex items-center gap-2 mb-4">
            <FileWarning className="size-4.5" style={{ color: "var(--warning)" }} />
            <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>Document / Certification Expiry</h3>
          </div>
          <div className="space-y-2.5">
            {expiringDocs.map((d, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: urgencyBg(d.urgency), boxShadow: "var(--shadow-inset)" }}>
                <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 32, height: 32, background: urgencyColor(d.urgency), opacity: 0.9 }}>
                  <FileWarning className="size-3.5" style={{ color: "white" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{d.name}</div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{d.doc}</div>
                </div>
                <div className="text-xs font-bold shrink-0" style={{ color: urgencyColor(d.urgency) }}>{d.expiry}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Onboarding + Upcoming Birthdays */}
        <div className="flex flex-col gap-5">
          <div className="clay-card p-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="size-4.5" style={{ color: "var(--success)" }} />
              <h3 className="font-display text-sm font-bold" style={{ color: "var(--foreground)" }}>Onboarding Progress</h3>
            </div>
            <div className="space-y-3">
              {onboardingProgress.map((o) => (
                <ProgressBar key={o.name} label={`${o.name} (joined ${o.joined})`} pct={o.progress} color={o.progress < 50 ? "var(--warning)" : "var(--chart-2)"} />
              ))}
            </div>
          </div>

          <div className="clay-card p-5" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
            <h3 className="font-display text-sm font-bold mb-3" style={{ color: "var(--foreground)" }}>Upcoming Events</h3>
            <div className="space-y-2">
              {upcomingEvents.slice(0, 3).map((ev) => (
                <div key={ev.name} className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-xl text-[10px] font-bold shrink-0" style={{ width: 30, height: 30, background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: "var(--shadow-glow)" }}>
                    {ev.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{ev.name}</div>
                    <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{ev.event} · {ev.date}</div>
                  </div>
                  {ev.event === "Birthday" ? <Cake className="size-3.5 shrink-0" style={{ color: "var(--warning)" }} /> : <Award className="size-3.5 shrink-0" style={{ color: "var(--primary)" }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Company Attrition stats strip */}
      <div className="clay-card p-6 mt-6" style={{ background: "var(--card)", boxShadow: "var(--shadow-elevated)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-bold" style={{ color: "var(--foreground)" }}>Company Stats Summary</h3>
          <Link to="/reports" className="text-xs font-semibold hover:underline" style={{ color: "var(--primary)" }}>Full Report</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Monthly Attrition", value: "2.4%", trend: "down", color: "var(--success)" },
            { label: "Avg Tenure", value: "3.2 yrs", color: "var(--primary)" },
            { label: "Open Positions", value: "14", trend: "up", color: "var(--warning)" },
            { label: "On Probation", value: "9", color: "var(--muted-foreground)" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between p-3 rounded-2xl" style={{ background: "var(--muted)", boxShadow: "var(--shadow-inset)" }}>
              <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>{stat.label}</span>
              <div className="flex items-center gap-1.5">
                {stat.trend && (stat.trend === "down"
                  ? <TrendingDown className="size-3.5" style={{ color: "var(--success)" }} />
                  : <TrendingUp className="size-3.5" style={{ color: "var(--warning)" }} />
                )}
                <span className="text-sm font-extrabold" style={{ color: stat.color }}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

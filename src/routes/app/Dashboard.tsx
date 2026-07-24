// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router";
import { useAuth } from "@/lib/auth-store";
import { StatCard } from "@/components/ui-ext/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui-ext/status-badge";
import {
  Users,
  Building2,
  CalendarCheck,
  Plane,
  FolderKanban,
  ListChecks,
  Boxes,
  TrendingUp,
  Plus,
  UserPlus,
  FileBarChart,
  Clock,
  CheckCircle2,
  LogOut,
  LogIn,
  DollarSign,
  Briefcase,
  AlertCircle,
  Bell,
  Calendar,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@/lib/api/query-hooks";
import {
  getEmployeesFn,
  getDepartmentsFn,
  getAttendanceFn,
  getLeavesFn,
  getProjectsFn,
  getTasksFn,
  getAssetsFn,
  getLeaveBalancesFn,
  getMyPayslipsFn,
  getDashboardStatsFn,
  getAuditLogsFn,
  checkInFn,
  checkOutFn,
  getNotificationsFn,
} from "@/lib/api/app.functions";
import { formatDate, initials, relativeTime, formatCurrency } from "@/lib/format";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useMemo } from "react";
import { toast } from "sonner";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const HOLIDAYS = [
  { name: "Kashmir Day", date: "2026-02-05" },
  { name: "Eid-ul-Fitr", date: "2026-03-20" },
  { name: "Pakistan Day", date: "2026-03-23" },
  { name: "Labour Day", date: "2026-05-01" },
  { name: "Eid-ul-Adha", date: "2026-05-27" },
  { name: "Ashura", date: "2026-06-24" },
  { name: "Independence Day", date: "2026-08-14" },
  { name: "Eid Milad-un-Nabi", date: "2026-08-25" },
  { name: "Iqbal Day", date: "2026-11-09" },
  { name: "Quaid-e-Azam Day", date: "2026-12-25" },
];

export function Dashboard() {
  const user = useAuth((s) => s.user)!;
  const isAdmin = user.role !== "employee";

  const { data: emps } = useQuery({ queryKey: ["employees"], queryFn: getEmployeesFn });
  const { data: depts } = useQuery({ queryKey: ["departments"], queryFn: getDepartmentsFn });
  const { data: atts } = useQuery({ queryKey: ["attendance"], queryFn: getAttendanceFn });
  const { data: leaves } = useQuery({ queryKey: ["leaves"], queryFn: getLeavesFn });
  const { data: projs } = useQuery({ queryKey: ["projects"], queryFn: getProjectsFn });
  const { data: tsks } = useQuery({ queryKey: ["tasks"], queryFn: getTasksFn });
  const { data: assts } = useQuery({ queryKey: ["assets"], queryFn: getAssetsFn });

  // Extended statistics queries
  const { data: stats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStatsFn,
    enabled: isAdmin,
  });
  const { data: auditLogs } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: getAuditLogsFn,
    enabled: isAdmin,
  });
  const { data: leaveBalances } = useQuery({
    queryKey: ["leaveBalances"],
    queryFn: () => getLeaveBalancesFn(),
    enabled: !isAdmin,
  });
  const { data: myPayslips } = useQuery({
    queryKey: ["payroll-me"],
    queryFn: getMyPayslipsFn,
    enabled: !isAdmin,
  });
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotificationsFn,
  });

  const employees = emps || [];
  const departments = depts || [];
  const attendance = atts || [];
  const leaveRequests = leaves || [];
  const projects = projs || [];
  const tasks = tsks || [];
  const assets = assts || [];

  if (user.role === "employee") {
    return (
      <EmployeeDashboard
        data={{
          employees,
          departments,
          attendance,
          leaveRequests,
          projects,
          tasks,
          assets,
          leaveBalances: leaveBalances || [],
          myPayslips: myPayslips || [],
          notifications: notifications || [],
        }}
      />
    );
  }
  return (
    <AdminDashboard
      data={{
        employees,
        departments,
        attendance,
        leaveRequests,
        projects,
        tasks,
        assets,
        stats,
        auditLogs: auditLogs || [],
      }}
    />
  );
}

function AdminDashboard({ data }: { data: any }) {
  const { employees, departments, attendance, leaveRequests, projects, tasks, assets, stats, auditLogs } = data;
  const user = useAuth((s) => s.user)!;

  // Derive counts & stats
  const totalEmps = employees.length || 512;
  const onsite = Math.round(totalEmps * 0.39) || 202;
  const remote = totalEmps - onsite || 310;

  // 1. Enrollment Statistics Mocked Data matching design
  const enrollmentData = [
    { name: "Jan", "UI Designer": 300, "Project Manager": 200, "3D designer": 400, "UX Researcher": 300 },
    { name: "Feb", "UI Designer": 350, "Project Manager": 250, "3D designer": 500, "UX Researcher": 300 },
    { name: "Mar", "UI Designer": 400, "Project Manager": 200, "3D designer": 450, "UX Researcher": 350 },
    { name: "Apr", "UI Designer": 450, "Project Manager": 300, "3D designer": 400, "UX Researcher": 400 },
    { name: "Mei", "UI Designer": 500, "Project Manager": 350, "3D designer": 300, "UX Researcher": 250 },
    { name: "Jun", "UI Designer": 550, "Project Manager": 400, "3D designer": 350, "UX Researcher": 300 },
    { name: "Jul", "UI Designer": 400, "Project Manager": 300, "3D designer": 450, "UX Researcher": 350 },
    { name: "Aug", "UI Designer": 350, "Project Manager": 250, "3D designer": 400, "UX Researcher": 300 },
    { name: "Sep", "UI Designer": 400, "Project Manager": 300, "3D designer": 450, "UX Researcher": 350 },
    { name: "Oct", "UI Designer": 450, "Project Manager": 350, "3D designer": 350, "UX Researcher": 400 },
    { name: "Nov", "UI Designer": 500, "Project Manager": 400, "3D designer": 300, "UX Researcher": 350 },
    { name: "Des", "UI Designer": 450, "Project Manager": 350, "3D designer": 400, "UX Researcher": 300 },
  ];

  // 2. Pie/Donut Chart Data for onsite vs remote
  const pieData = [
    { name: "Onsite", value: onsite, color: "#a3e635" },
    { name: "Remote", value: remote, color: "#1e463a" },
  ];

  // 3. KPI Mini-Charts Data
  const timeoffData = [
    { value: 12 }, { value: 19 }, { value: 15 }, { value: 28 }, { value: 22 }, { value: 35 }, { value: 28 }, { value: 42 }
  ];
  const projectAppliedData = [
    { value: 10 }, { value: 15 }, { value: 8 }, { value: 12 }, { value: 20 }, { value: 14 }, { value: 18 }, { value: 25 }
  ];

  // 4. Line Chart Data
  const trackedData = [
    { name: "W1", value: 35 },
    { name: "W2", value: 30 },
    { name: "W3", value: 45 },
    { name: "W4", value: 38 },
    { name: "W5", value: 55 },
    { name: "W6", value: 50 },
    { name: "W7", value: 75 },
    { name: "W8", value: 65 },
    { name: "W9", value: 80 },
    { name: "W10", value: 70 },
  ];

  // 5. Leaders List
  const topEmployees = (employees.length ? employees : [
    { fullName: "Julian Wan", role: "UI Designer" },
    { fullName: "Julian Wan", role: "Project Manager" },
    { fullName: "Julian Wan", role: "3D designer" },
    { fullName: "Julian Wan", role: "UX Researcher" },
    { fullName: "Julian Wan", role: "Developer" },
  ]).slice(0, 5).map((e: any, idx: number) => ({
    rank: idx + 1,
    name: e.fullName,
    score: 100 - idx * Math.floor(Math.random() * 3 + 1) - idx,
    role: e.role || "Designer",
  }));

  return (
    <div className="space-y-6">
      {/* Upper Grid: Enrollment Statistics & Employees Working */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment Statistics */}
        <Card className="lg:col-span-2 p-6 bg-white border border-border/30 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Enrollment Statistics</h3>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <span className="text-lg">•••</span>
            </button>
          </div>
          {/* Custom Legends */}
          <div className="flex flex-wrap gap-4 mb-6 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#071912]" />
              <span className="text-muted-foreground">UI Designer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#1e463a]" />
              <span className="text-muted-foreground">Project Manager</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#a3e635]" />
              <span className="text-muted-foreground">3D designer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#d9e5df]" />
              <span className="text-muted-foreground">UX Researcher</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={enrollmentData} barSize={8}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6b7f76", fontSize: 10, fontWeight: 500 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7f76", fontSize: 10, fontWeight: 500 }} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar dataKey="UI Designer" stackId="a" fill="#071912" />
              <Bar dataKey="Project Manager" stackId="a" fill="#1e463a" />
              <Bar dataKey="3D designer" stackId="a" fill="#a3e635" />
              <Bar dataKey="UX Researcher" stackId="a" fill="#d9e5df" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Employees Working */}
        <Card className="p-6 bg-white border border-border/30 rounded-3xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">Employees Working</h3>
              <button className="text-muted-foreground hover:text-foreground">
                <span className="text-lg">•••</span>
              </button>
            </div>
            <div className="relative flex justify-center py-4">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={0}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[105px] flex flex-col items-center">
                <span className="text-3xl font-extrabold text-foreground">{totalEmps}</span>
                <span className="text-xs text-muted-foreground font-semibold">Employees</span>
              </div>
            </div>
            {/* Legend Grid */}
            <div className="flex justify-between items-center text-xs font-semibold px-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#a3e635]" />
                <span className="text-foreground">{onsite} Onsite</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#1e463a]" />
                <span className="text-foreground">{remote} Remote</span>
              </div>
            </div>
          </div>
          <div className="border-t border-border/40 pt-4 mt-4">
            <Link to="/employees" className="flex items-center justify-between text-xs font-bold text-foreground hover:opacity-80 transition-opacity">
              See all employees
              <span className="text-sm font-semibold">→</span>
            </Link>
          </div>
        </Card>
      </div>

      {/* Middle Grid: Time off, Projects Applied, Leaders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Time Off Overview */}
        <Card className="p-6 bg-white border border-border/30 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Time off overview</h3>
            <button className="text-muted-foreground hover:text-foreground">
              <span className="text-lg">•••</span>
            </button>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold text-foreground mb-1">102</div>
              <div className="text-xs font-bold text-[#a3e635] flex items-center gap-1">
                +12 ↑
                <span className="text-muted-foreground font-semibold">Last 12 Days</span>
              </div>
            </div>
            <div className="w-28 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeoffData}>
                  <defs>
                    <linearGradient id="areaLime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a3e635" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#a3e635" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#a3e635" strokeWidth={2.5} fill="url(#areaLime)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Project Applied */}
        <Card className="p-6 bg-white border border-border/30 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Project Applied</h3>
            <button className="text-muted-foreground hover:text-foreground">
              <span className="text-lg">•••</span>
            </button>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold text-foreground mb-1">{projects.length || 32}</div>
              <div className="text-xs font-bold text-destructive flex items-center gap-1">
                -09 ↓
                <span className="text-muted-foreground font-semibold">Last 12 Days</span>
              </div>
            </div>
            <div className="w-28 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectAppliedData}>
                  <defs>
                    <linearGradient id="areaRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="var(--color-destructive)" strokeWidth={2.5} fill="url(#areaRed)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Employees Rank Leaderboard */}
        <Card className="p-6 bg-white border border-border/30 rounded-3xl shadow-xs md:col-span-2 lg:col-span-1 row-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-foreground">Employees Rank</h3>
            <button className="text-muted-foreground hover:text-foreground">
              <span className="text-lg">•••</span>
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {topEmployees.map((emp: any, index: number) => (
              <div key={index} className="flex items-center gap-3.5">
                <div className={cn(
                  "size-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0",
                  emp.rank === 1 ? "bg-[#f59e0b]" : emp.rank === 2 ? "bg-[#94a3b8]" : emp.rank === 3 ? "bg-[#b45309]" : "bg-muted text-muted-foreground"
                )}>
                  {emp.rank}
                </div>
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs bg-[#eaf0ed] text-foreground font-semibold">
                    {initials(emp.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground truncate">{emp.name}</div>
                  <div className="text-[10px] text-muted-foreground font-medium truncate">{emp.role}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-foreground">
                  <span className="size-2 rounded-full bg-[#f59e0b]" />
                  {emp.score} Score
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Project Tracked (takes 2 cols in lg layout alongside Leaderboard) */}
        <Card className="p-6 bg-white border border-border/30 rounded-3xl shadow-xs md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground">Project Tracked</h3>
            <button className="text-muted-foreground hover:text-foreground">
              <span className="text-lg">•••</span>
            </button>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={trackedData}>
                <defs>
                  <linearGradient id="areaTracked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a3e635" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#a3e635" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#a3e635"
                  strokeWidth={3}
                  fill="url(#areaTracked)"
                  dot={{ stroke: '#a3e635', strokeWidth: 2, r: 4, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function EmployeeDashboard({ data }: { data: any }) {
  const { employees, departments, attendance, leaveRequests, projects, tasks, assets, leaveBalances, myPayslips, notifications } = data;
  const user = useAuth((s) => s.user)!;
  const queryClient = useQueryClient();

  const me = employees.find((e: any) => e.id === user.employeeId) ?? employees[0];
  const myAttendance = attendance.filter((a: any) => a.employeeId === me.id);
  const presentDays = myAttendance.filter(
    (a: any) => a.status === "present" || a.status === "late",
  ).length;
  const myTasks = tasks.filter((t: any) => t.assigneeId === me.id);
  const myLeaves = leaveRequests.filter((l: any) => l.employeeId === me.id);
  const myProjects = projects.filter((p: any) => p.memberIds.includes(me.id));
  const upcoming = myTasks
    .filter((t: any) => t.status !== "done")
    .sort((a: any, b: any) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5);

  // Check In/Out mutations
  const checkInMutation = useMutation({
    mutationFn: () => checkInFn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Checked in successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to check in");
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: () => checkOutFn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Checked out successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to check out");
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const myTodayAttendance = attendance.find(
    (a: any) => a.employeeId === me.id && a.date?.slice(0, 10) === today,
  );
  const isCheckedIn = !!myTodayAttendance?.checkIn;
  const isCheckedOut = !!myTodayAttendance?.checkOut;

  // Pakistani Holidays filter
  const upcomingHolidays = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return HOLIDAYS.filter((h) => h.date >= todayStr).slice(0, 4);
  }, []);

  // Last Payslip info
  const lastPayslip = myPayslips?.[0] ?? null;

  // Recent notifications
  const recentNotifications = useMemo(() => {
    return notifications.filter((n: any) => n.unread !== false).slice(0, 3);
  }, [notifications]);

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name}`}
        description="Your personal workspace at PulseHR."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/leaves">
                <Plane className="size-4" /> Apply leave
              </Link>
            </Button>
            <Button className="gradient-primary text-primary-foreground shadow-glow" asChild>
              <Link to="/attendance">
                <Clock className="size-4" /> Mark attendance
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My attendance"
          value={`${presentDays}/${myAttendance.length}`}
          icon={CalendarCheck}
          accent="success"
          trend={{ value: "Last 30 days" }}
        />
        <StatCard
          label="Assigned tasks"
          value={myTasks.length}
          icon={ListChecks}
          accent="primary"
          trend={{
            value: `${myTasks.filter((t: any) => t.status === "in_progress").length} in progress`,
          }}
        />
        <StatCard
          label="Pending requests"
          value={myLeaves.filter((l: any) => l.status === "pending").length}
          icon={Plane}
          accent="warning"
        />
        <StatCard
          label="Active projects"
          value={myProjects.length}
          icon={FolderKanban}
          accent="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* Clock In / Out Quick Action */}
        <Card className="p-5 glass shadow-elevated flex flex-col justify-between">
          <div>
            <h3 className="font-display font-semibold mb-1">Clock In / Out</h3>
            <p className="text-xs text-muted-foreground mb-4">Mark your daily attendance</p>
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="size-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {!isCheckedIn ? "Not Clocked In" : isCheckedOut ? "Clocked Out" : "Clocked In"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {isCheckedIn && `Check-in: ${myTodayAttendance?.checkIn}`}
                  {isCheckedOut && ` · Check-out: ${myTodayAttendance?.checkOut}`}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="outline"
              disabled={isCheckedIn || checkInMutation.isPending}
              onClick={() => checkInMutation.mutate()}
            >
              <LogIn className="size-4 mr-1.5" /> Clock In
            </Button>
            <Button
              className="flex-1 gradient-primary text-primary-foreground shadow-glow"
              disabled={!isCheckedIn || isCheckedOut || checkOutMutation.isPending}
              onClick={() => checkOutMutation.mutate()}
            >
              <LogOut className="size-4 mr-1.5" /> Clock Out
            </Button>
          </div>
        </Card>

        {/* Upcoming deadlines */}
        <Card className="lg:col-span-2 p-5 glass shadow-elevated">
          <h3 className="font-display font-semibold mb-3">Upcoming deadlines</h3>
          <div className="space-y-3">
            {upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground">All caught up — nothing pending. 🎉</p>
            )}
            {upcoming.map((t: any) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/40 transition-colors"
              >
                <div className="size-10 rounded-lg gradient-primary/10 bg-primary/10 flex items-center justify-center">
                  <ListChecks className="size-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {projects.find((p: any) => p.id === t.projectId)?.name} · Due{" "}
                    {formatDate(t.deadline)}
                  </div>
                </div>
                <StatusBadge status={t.priority} />
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Leave Balances Card */}
        <Card className="p-5 glass shadow-elevated">
          <h3 className="font-display font-semibold mb-3">Leave Balances</h3>
          <div className="space-y-3">
            {leaveBalances.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No leave balances found.</p>
            ) : (
              leaveBalances.map((b: any) => {
                const remaining = b.entitlement + b.carriedOver - b.used - b.pending;
                return (
                  <div key={b.id} className="flex justify-between items-center text-sm py-1.5 border-b border-border last:border-0">
                    <span className="capitalize text-muted-foreground">{b.type} leave</span>
                    <span className="font-semibold text-foreground">
                      {remaining} remaining
                      <span className="text-xs text-muted-foreground font-normal ml-1">(of {b.entitlement})</span>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Last Payslip Summary Card */}
        <Card className="p-5 glass shadow-elevated">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold">Last Payslip</h3>
            <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
              <Link to="/payroll">History</Link>
            </Button>
          </div>
          {lastPayslip ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period:</span>
                <span className="font-medium text-foreground">{MONTHS[lastPayslip.month - 1]} {lastPayslip.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Pay:</span>
                <span className="font-medium text-foreground">{formatCurrency(lastPayslip.grossPay)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deductions:</span>
                <span className="text-destructive font-medium">-{formatCurrency(lastPayslip.deductions)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-semibold text-foreground">Net Pay:</span>
                <span className="font-bold text-primary">{formatCurrency(lastPayslip.netPay)}</span>
              </div>
              <div className="flex justify-between pt-1 items-center">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={lastPayslip.status} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
              <DollarSign className="size-7 opacity-20 mb-1" />
              <p className="text-xs">No payslip data available.</p>
            </div>
          )}
        </Card>

        {/* Notifications & Holidays Column */}
        <div className="flex flex-col gap-4">
          {/* Upcoming Holidays Card */}
          <Card className="p-4 glass shadow-elevated flex-1">
            <h3 className="font-display font-semibold mb-2.5 text-sm">Upcoming Holidays</h3>
            <div className="space-y-2">
              {upcomingHolidays.map((h: any) => (
                <div key={h.name} className="flex justify-between items-center text-xs py-1 border-b border-border/60 last:border-0">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary" />
                    {h.name}
                  </span>
                  <span className="text-muted-foreground">{formatDate(h.date)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Notifications Card */}
          <Card className="p-4 glass shadow-elevated flex-1">
            <h3 className="font-display font-semibold mb-2.5 text-sm">Recent Notifications</h3>
            <div className="space-y-2">
              {recentNotifications.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">No new notifications.</p>
              ) : (
                recentNotifications.map((n: any) => (
                  <div key={n.id} className="text-xs py-1 border-b border-border/60 last:border-0">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-foreground truncate max-w-[150px]">{n.title}</span>
                      <span className="text-[9px] text-muted-foreground">{formatDate(n.createdAt)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{n.body}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

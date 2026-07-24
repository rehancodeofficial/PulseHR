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
  const activeEmps = employees.filter((e: any) => e.status === "active").length;
  const inactiveEmps = employees.filter((e: any) => e.status !== "active").length;
  
  const today = new Date().toISOString().slice(0, 10);
  const presentToday = attendance.filter(
    (a: any) => a.date?.slice(0, 10) === today && (a.status === "present" || a.status === "late"),
  ).length;
  const attendanceRate = Math.round((presentToday / Math.max(activeEmps, 1)) * 100);
  const pendingLeaves = leaveRequests.filter((l: any) => l.status === "pending").length;
  const activeProjects = projects.filter((p: any) => p.status === "active").length;
  const pendingTasks = tasks.filter((t: any) => t.status !== "done").length;

  const attendanceTrend = useMemo(() => {
    const map: Record<string, { date: string; present: number; late: number; absent: number }> = {};
    attendance.forEach((a: any) => {
      const k = a.date?.slice(0, 10) ?? a.date;
      map[k] ??= { date: k, present: 0, late: 0, absent: 0 };
      if (a.status === "present") map[k].present++;
      else if (a.status === "late") map[k].late++;
      else if (a.status === "absent") map[k].absent++;
    });
    return Object.values(map)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map((r) => ({
        ...r,
        label: new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      }));
  }, [attendance]);

  const deptDist = departments.map((d: any) => ({
    name: d.name,
    value: d.headcount ?? employees.filter((e: any) => e.departmentId === d.id).length,
  }));
  const colors = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
    "var(--color-primary)",
  ];

  const leaveStats = [
    { type: "Annual", count: leaveRequests.filter((l: any) => l.type === "annual").length },
    { type: "Sick", count: leaveRequests.filter((l: any) => l.type === "sick").length },
    { type: "Casual", count: leaveRequests.filter((l: any) => l.type === "casual").length },
    { type: "Emergency", count: leaveRequests.filter((l: any) => l.type === "emergency").length },
  ];

  const upcomingHolidays = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return HOLIDAYS.filter((h) => h.date >= todayStr).slice(0, 4);
  }, []);

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name}`}
        description="Here's what's happening across Code Vertex Solutions today."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/reports">
                <FileBarChart className="size-4" /> Reports
              </Link>
            </Button>
            <Button className="gradient-primary text-primary-foreground shadow-glow" asChild>
              <Link to="/employees">
                <UserPlus className="size-4" /> Add employee
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total employees"
          value={employees.length}
          icon={Users}
          accent="primary"
          trend={{ value: `${activeEmps} active / ${inactiveEmps} inactive` }}
        />
        <StatCard
          label="Attendance rate"
          value={`${attendanceRate}%`}
          icon={CalendarCheck}
          accent="success"
          trend={{ value: "Today", positive: true }}
        />
        <StatCard
          label="Total Payroll (Month)"
          value={stats ? formatCurrency(stats.payrollThisMonth) : "—"}
          icon={DollarSign}
          accent="secondary"
          trend={{ value: stats ? `${stats.payrollCount} payslips processed` : "—", positive: true }}
        />
        <StatCard
          label="Leave requests"
          value={pendingLeaves}
          icon={Plane}
          accent="warning"
          trend={{ value: "Pending review" }}
        />
        <StatCard
          label="Departments"
          value={departments.length}
          icon={Building2}
          accent="info"
        />
        <StatCard
          label="Active projects"
          value={activeProjects}
          icon={FolderKanban}
          accent="primary"
        />
        <StatCard label="Pending tasks" value={pendingTasks} icon={ListChecks} accent="info" />
        <StatCard label="Company assets" value={assets.length} icon={Boxes} accent="secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2 p-5 glass shadow-elevated">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Attendance trends</h3>
              <p className="text-xs text-muted-foreground">Last 14 working days</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[--color-chart-1]" /> Present
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[--color-chart-2]" /> Late
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-destructive" /> Absent
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={attendanceTrend}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="present"
                stroke="var(--color-chart-1)"
                fill="url(#g1)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="late"
                stroke="var(--color-chart-2)"
                fill="url(#g2)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="absent"
                stroke="var(--color-destructive)"
                fill="transparent"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 glass shadow-elevated">
          <h3 className="font-display font-semibold">Department distribution</h3>
          <p className="text-xs text-muted-foreground mb-2">Headcount by team</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={deptDist}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {deptDist.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} stroke="var(--color-background)" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 text-xs">
            {deptDist.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: colors[i % colors.length] }}
                  />
                  {d.name}
                </span>
                <span className="text-muted-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="p-5 glass shadow-elevated">
          <h3 className="font-display font-semibold">Leave statistics</h3>
          <p className="text-xs text-muted-foreground mb-4">By type, last 90 days</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leaveStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="type" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2 p-5 glass shadow-elevated">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Project progress</h3>
              <p className="text-xs text-muted-foreground">Active engagements</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects">
                View all <TrendingUp className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {projects.slice(0, 4).map((p: any) => (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.client} · Due {formatDate(p.deadline)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} />
                    <span className="text-sm font-semibold tabular-nums w-10 text-right">
                      {p.progress}%
                    </span>
                  </div>
                </div>
                <Progress value={p.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card className="p-5 glass shadow-elevated">
          <h3 className="font-display font-semibold mb-3">Recent leave requests</h3>
          <div className="space-y-3">
            {leaveRequests.slice(0, 5).map((l: any) => {
              const emp = employees.find((e: any) => e.id === l.employeeId);
              return (
                <div key={l.id} className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs">
                      {initials(emp?.fullName ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{emp?.fullName}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {l.type} leave · {l.days}d · {formatDate(l.startDate)}
                    </div>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 glass shadow-elevated">
          <h3 className="font-display font-semibold mb-3">Quick actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: "/employees", label: "Add employee", icon: UserPlus },
              { to: "/departments", label: "Create department", icon: Building2 },
              { to: "/projects", label: "New project", icon: FolderKanban },
              { to: "/reports", label: "Generate report", icon: FileBarChart },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group relative rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/40 transition-all p-4"
              >
                <a.icon className="size-5 text-primary mb-2" />
                <div className="text-sm font-medium">{a.label}</div>
                <Plus className="absolute top-3 right-3 size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Recent Activities card */}
        <Card className="lg:col-span-2 p-5 glass shadow-elevated">
          <h3 className="font-display font-semibold mb-3">Recent Activities</h3>
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No recent activities logged.</p>
            ) : (
              auditLogs.slice(0, 5).map((l: any) => (
                <div key={l.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Clock className="size-4" />
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-foreground mr-1.5">{l.actorName || l.actor || "System"}</span>
                      <span className="text-muted-foreground mr-1.5">{l.action.toLowerCase().replace(/_/g, " ")}</span>
                      <span className="text-foreground font-medium">{l.target}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 pl-2">{relativeTime(l.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Holidays card */}
        <Card className="p-5 glass shadow-elevated">
          <h3 className="font-display font-semibold mb-3">Upcoming Holidays</h3>
          <div className="space-y-3">
            {upcomingHolidays.map((h: any) => (
              <div key={h.name} className="flex justify-between items-center text-sm py-1 border-b border-border last:border-0">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  {h.name}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(h.date)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
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
        description="Your personal workspace at Code Vertex Solutions."
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

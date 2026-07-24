// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router";
import { useAuth } from "@/lib/auth-store";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useQuery } from "@/lib/api/query-hooks";
import {
  getEmployeesFn,
  getDepartmentsFn,
  getAttendanceFn,
  getLeavesFn,
  getProjectsFn,
  getTasksFn,
  getAssetsFn,
} from "@/lib/api/app.functions";
import { initials } from "@/lib/format";
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
} from "recharts";

export function Dashboard() {
  const user = useAuth((s) => s.user)!;

  // Retrieve basic data for stats (or default/mock if not available)
  const { data: emps } = useQuery({ queryKey: ["employees"], queryFn: getEmployeesFn });
  const { data: depts } = useQuery({ queryKey: ["departments"], queryFn: getDepartmentsFn });
  const { data: atts } = useQuery({ queryKey: ["attendance"], queryFn: getAttendanceFn });
  const { data: leaves } = useQuery({ queryKey: ["leaves"], queryFn: getLeavesFn });
  const { data: projs } = useQuery({ queryKey: ["projects"], queryFn: getProjectsFn });
  const { data: tsks } = useQuery({ queryKey: ["tasks"], queryFn: getTasksFn });
  const { data: assts } = useQuery({ queryKey: ["assets"], queryFn: getAssetsFn });

  const employees = emps || [];
  const projects = projs || [];

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

  // 2. Pie/Donut Chart Data for onsite vs remote — clay palette
  const pieData = [
    { name: "Onsite", value: onsite, color: "#9CB56E" },
    { name: "Remote", value: remote, color: "#46613D" },
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
    score: 100 - idx * 2,
    role: e.role || e.designation || "Designer",
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
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7862", fontSize: 10, fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7862", fontSize: 10, fontWeight: 600 }} />
              <Tooltip
                contentStyle={{
                  background: "#FAFAF7",
                  borderRadius: 16,
                  border: "none",
                  boxShadow: "6px 6px 18px rgba(45,74,43,0.14), -4px -4px 10px rgba(255,255,255,0.8)",
                  color: "#2A3324",
                }}
                cursor={{ fill: "rgba(156,181,110,0.06)" }}
              />
              <Bar dataKey="UI Designer" stackId="a" fill="#2A3324" radius={[0,0,0,0]} />
              <Bar dataKey="Project Manager" stackId="a" fill="#46613D" />
              <Bar dataKey="3D designer" stackId="a" fill="#9CB56E" />
              <Bar dataKey="UX Researcher" stackId="a" fill="#D4E5BC" radius={[4, 4, 0, 0]} />
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
                    cx="50%"
                    cy={130}
                    paddingAngle={0}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[85px] inset-x-0 flex flex-col items-center">
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
              <div className="text-3xl font-extrabold mb-1" style={{ color: "#2A3324" }}>102</div>
              <div className="text-xs font-bold flex items-center gap-1" style={{ color: "#9CB56E" }}>
                +12 ↑
                <span className="font-semibold" style={{ color: "#6B7862" }}>Last 12 Days</span>
              </div>
            </div>
            <div className="w-28 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeoffData}>
                  <defs>
                    <linearGradient id="areaLime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9CB56E" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#9CB56E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#9CB56E" strokeWidth={2.5} fill="url(#areaLime)" dot={false} />
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
              <div className="text-3xl font-extrabold mb-1" style={{ color: "#2A3324" }}>{projects.length || 32}</div>
              <div className="text-xs font-bold flex items-center gap-1" style={{ color: "#C17A64" }}>
                -09 ↓
                <span className="font-semibold" style={{ color: "#6B7862" }}>Last 12 Days</span>
              </div>
            </div>
            <div className="w-28 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectAppliedData}>
                  <defs>
                    <linearGradient id="areaRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C17A64" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#C17A64" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#C17A64" strokeWidth={2.5} fill="url(#areaRed)" dot={false} />
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
            {topEmployees.map((emp: any) => (
              <div key={emp.rank} className="flex items-center gap-3.5">
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
                    <stop offset="0%" stopColor="#9CB56E" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#9CB56E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    background: "#FAFAF7",
                    borderRadius: 14,
                    border: "none",
                    boxShadow: "5px 5px 15px rgba(45,74,43,0.13), -3px -3px 8px rgba(255,255,255,0.75)",
                    color: "#2A3324",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#9CB56E"
                  strokeWidth={3}
                  fill="url(#areaTracked)"
                  dot={{ stroke: "#9CB56E", strokeWidth: 2, r: 4, fill: "#FAFAF7" }}
                  activeDot={{ r: 6, fill: "#9CB56E" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

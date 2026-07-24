// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@/lib/api/query-hooks";
import { useAuth } from "@/lib/auth-store";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui-ext/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui-ext/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  FileText,
  Loader2,
  Play,
  CheckCircle2,
  Clock,
  Printer,
  TrendingUp,
  Banknote,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";
import {
  getPayrollFn,
  getMyPayslipsFn,
  generatePayrollFn,
  getDepartmentsFn,
} from "@/lib/api/app.functions";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function PayrollPage() {
  const user = useAuth((s) => s.user)!;
  const isAdmin = user.role !== "employee";

  if (isAdmin) return <AdminPayroll />;
  return <EmployeePayroll />;
}

// ─── Admin Payroll View ────────────────────────────────────────────────────────

function AdminPayroll() {
  const queryClient = useQueryClient();
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(String(now.getFullYear()));
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  const params: any = {};
  if (filterMonth !== "all") params.month = Number(filterMonth);
  if (filterYear !== "all") params.year = Number(filterYear);

  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ["payroll", filterMonth, filterYear],
    queryFn: () => getPayrollFn(params),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartmentsFn,
  });

  // Stats
  const totalNetPay = payrolls.reduce((s: number, p: any) => s + p.netPay, 0);
  const totalGross = payrolls.reduce((s: number, p: any) => s + p.grossPay, 0);
  const processed = payrolls.filter((p: any) => p.status === "processed" || p.status === "paid").length;
  const pending = payrolls.filter((p: any) => p.status === "pending").length;

  // Monthly trend chart
  const trendData = useMemo(() => {
    const map: Record<string, number> = {};
    payrolls.forEach((p: any) => {
      const key = `${MONTHS[p.month - 1].slice(0, 3)} ${p.year}`;
      map[key] = (map[key] ?? 0) + p.netPay;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value }));
  }, [payrolls]);

  const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - i));

  return (
    <>
      <PageHeader
        title="Payroll Management"
        description="Generate payroll, manage salary structures, and download payslips."
        actions={
          <Button
            onClick={() => setIsGenerateOpen(true)}
            className="gradient-primary text-primary-foreground shadow-glow"
          >
            <Play className="size-4" /> Generate Payroll
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Net Pay"
          value={formatCurrency(totalNetPay)}
          icon={DollarSign}
          accent="primary"
          trend={{ value: "Current filter", positive: true }}
        />
        <StatCard
          label="Total Gross"
          value={formatCurrency(totalGross)}
          icon={TrendingUp}
          accent="secondary"
        />
        <StatCard
          label="Processed"
          value={processed}
          icon={CheckCircle2}
          accent="success"
        />
        <StatCard
          label="Pending"
          value={pending}
          icon={Clock}
          accent="warning"
        />
      </div>

      {/* Trend chart */}
      {trendData.length > 1 && (
        <Card className="mt-6 p-5 glass shadow-elevated">
          <h3 className="font-display font-semibold mb-1">Payroll Cost Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Net pay per period</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="payG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: any) => [formatCurrency(v), "Net Pay"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                fill="url(#payG)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Filters + Table */}
      <Card className="glass shadow-elevated p-4 mt-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Payslip</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((p: any) => (
                  <TableRow key={p.id} className="group">
                    <TableCell>
                      <div className="text-sm font-medium">{p.employeeName ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{p.employeeCode}</div>
                    </TableCell>
                    <TableCell className="text-sm">{p.departmentName ?? "—"}</TableCell>
                    <TableCell className="text-sm">
                      {MONTHS[p.month - 1]} {p.year}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-right">
                      {formatCurrency(p.grossPay)}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-right text-destructive">
                      -{formatCurrency(p.deductions)}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-right font-semibold">
                      {formatCurrency(p.netPay)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => printPayslip(p)}
                      >
                        <Printer className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {payrolls.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                      <Banknote className="size-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No payroll records found for the selected period.</p>
                      <p className="text-xs mt-1">Click "Generate Payroll" to create payslips for this month.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <GeneratePayrollDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
        departments={departments}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["payroll"] })}
      />
    </>
  );
}

// ─── Employee Payroll View ─────────────────────────────────────────────────────

function EmployeePayroll() {
  const { data: payrolls = [], isLoading } = useQuery({
    queryKey: ["payroll-me"],
    queryFn: getMyPayslipsFn,
  });

  const totalEarned = payrolls.reduce((s: number, p: any) => s + p.netPay, 0);
  const lastPayslip = payrolls[0] ?? null;

  return (
    <>
      <PageHeader
        title="My Payroll"
        description="View your salary history, payslips, and deductions."
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Current Salary"
          value={lastPayslip ? formatCurrency(lastPayslip.grossPay) : "—"}
          icon={DollarSign}
          accent="primary"
          trend={{ value: "Gross pay", positive: true }}
        />
        <StatCard
          label="Last Net Pay"
          value={lastPayslip ? formatCurrency(lastPayslip.netPay) : "—"}
          icon={Banknote}
          accent="success"
          trend={{ value: lastPayslip ? `${MONTHS[lastPayslip.month - 1]} ${lastPayslip.year}` : "—" }}
        />
        <StatCard
          label="Total Earned (shown)"
          value={formatCurrency(totalEarned)}
          icon={TrendingUp}
          accent="secondary"
          trend={{ value: `${payrolls.length} payslips` }}
        />
      </div>

      <Card className="glass shadow-elevated p-4 mt-6">
        <h3 className="font-display font-semibold mb-4">Payslip History</h3>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Download</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-sm">
                      {MONTHS[p.month - 1]} {p.year}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-right">
                      {formatCurrency(p.grossPay)}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-right text-destructive">
                      -{formatCurrency(p.deductions)}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-right font-semibold">
                      {formatCurrency(p.netPay)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => printPayslip(p)}
                      >
                        <Printer className="size-3.5 mr-1.5" /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {payrolls.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                      <FileText className="size-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No payslips available yet.</p>
                      <p className="text-xs mt-1">Your payslips will appear here once payroll is processed.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </>
  );
}

// ─── Generate Payroll Dialog ───────────────────────────────────────────────────

function GeneratePayrollDialog({
  open,
  onOpenChange,
  departments,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  departments: any[];
  onSuccess: () => void;
}) {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [departmentId, setDepartmentId] = useState("all");
  const [deductionPercent, setDeductionPercent] = useState("0");

  const years = Array.from({ length: 3 }, (_, i) => String(now.getFullYear() - i));

  const mutation = useMutation({
    mutationFn: () =>
      generatePayrollFn({
        data: {
          month: Number(month),
          year: Number(year),
          ...(departmentId !== "all" ? { departmentId } : {}),
          deductionPercent: Number(deductionPercent),
        },
      }),
    onSuccess: (res: any) => {
      toast.success(`Payroll generated for ${res?.generated ?? "all"} employees`);
      onSuccess();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to generate payroll");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Generate Payroll</DialogTitle>
          <DialogDescription>
            Create payslips for all active employees for the selected period.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Department (optional)</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Deduction %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={deductionPercent}
              onChange={(e) => setDeductionPercent(e.target.value)}
              placeholder="e.g. 5 for 5%"
            />
            <p className="text-xs text-muted-foreground">Applied uniformly as % of gross pay.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="gradient-primary text-primary-foreground"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Play className="size-4 mr-2" />
            )}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── PDF Payslip Printer ───────────────────────────────────────────────────────

function printPayslip(p: any) {
  const win = window.open("", "_blank");
  if (!win) {
    toast.error("Popup blocked! Please allow popups to print payslips.");
    return;
  }

  const html = `
    <html>
      <head>
        <title>Payslip — ${p.employeeName} — ${MONTHS[p.month - 1]} ${p.year}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; color: #0f172a; padding: 48px; }
          .card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 40px; max-width: 680px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 28px; }
          .company { font-size: 22px; font-weight: 700; color: #4f46e5; }
          .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
          .badge { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; }
          .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; margin-bottom: 12px; margin-top: 24px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .field { background: #f8fafc; border-radius: 8px; padding: 12px; }
          .field-label { font-size: 11px; color: #94a3b8; margin-bottom: 3px; }
          .field-value { font-size: 14px; font-weight: 500; }
          .pay-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
          .pay-row:last-child { border: none; }
          .pay-label { font-size: 13px; color: #475569; }
          .pay-value { font-size: 13px; font-weight: 500; }
          .net-row { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; padding: 16px 20px; border-radius: 10px; margin-top: 16px; }
          .net-label { font-size: 14px; font-weight: 600; }
          .net-value { font-size: 22px; font-weight: 700; }
          .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
          .deduction { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div>
              <div class="company">VertexEMS</div>
              <div class="sub">Code Vertex Solutions · Employee Payslip</div>
            </div>
            <div class="badge">PAYSLIP</div>
          </div>

          <div class="section-title">Employee Information</div>
          <div class="grid">
            <div class="field">
              <div class="field-label">Full Name</div>
              <div class="field-value">${p.employeeName ?? "—"}</div>
            </div>
            <div class="field">
              <div class="field-label">Employee Code</div>
              <div class="field-value">${p.employeeCode ?? "—"}</div>
            </div>
            <div class="field">
              <div class="field-label">Department</div>
              <div class="field-value">${p.departmentName ?? "—"}</div>
            </div>
            <div class="field">
              <div class="field-label">Pay Period</div>
              <div class="field-value">${MONTHS[p.month - 1]} ${p.year}</div>
            </div>
          </div>

          <div class="section-title">Earnings & Deductions</div>
          <div class="pay-row">
            <span class="pay-label">Basic Salary (Gross)</span>
            <span class="pay-value">PKR ${Number(p.grossPay).toLocaleString("en-PK")}</span>
          </div>
          <div class="pay-row">
            <span class="pay-label">Total Deductions</span>
            <span class="pay-value deduction">- PKR ${Number(p.deductions).toLocaleString("en-PK")}</span>
          </div>
          ${p.notes ? `<div class="pay-row"><span class="pay-label">Notes</span><span class="pay-value" style="max-width:280px;text-align:right;font-size:12px;color:#64748b">${p.notes}</span></div>` : ""}

          <div class="net-row">
            <span class="net-label">Net Pay</span>
            <span class="net-value">PKR ${Number(p.netPay).toLocaleString("en-PK")}</span>
          </div>

          <div class="footer">
            Generated on ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            · This is a computer-generated payslip and does not require a signature.
            <br/>VertexEMS Enterprise Platform · Code Vertex Solutions
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
}

import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { created, ok } from "../utils/api-response.js";
import { audit } from "../utils/audit.js";
import { getPagination, pageMeta, paginationQuerySchema } from "../utils/pagination.js";

export const payrollRouter = Router();

const idParams = z.object({ id: z.string().min(1) });

const payrollQuerySchema = paginationQuerySchema.extend({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).optional(),
  employeeId: z.string().optional(),
  status: z.enum(["pending", "processed", "paid"]).optional(),
});

const generatePayrollSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
  departmentId: z.string().optional(),
  deductionPercent: z.coerce.number().min(0).max(100).default(0),
});

const updatePayrollSchema = z.object({
  deductions: z.coerce.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(["pending", "processed", "paid"]).optional(),
});

function serializePayroll(p: any) {
  return {
    id: p.id,
    employeeId: p.employeeId,
    employeeName: p.employee?.fullName ?? null,
    employeeCode: p.employee?.employeeCode ?? null,
    departmentId: p.employee?.departmentId ?? null,
    departmentName: p.employee?.department?.name ?? null,
    month: p.month,
    year: p.year,
    grossPay: Number(p.grossPay),
    deductions: Number(p.deductions),
    netPay: Number(p.netPay),
    status: p.status,
    notes: p.notes,
    generatedById: p.generatedById,
    generatedByName: p.generatedBy?.fullName ?? null,
    generatedAt: p.generatedAt,
  };
}

payrollRouter.use(authenticate);

// ─── GET /payroll — admin / accountant: list all payrolls ─────────────────────
payrollRouter.get(
  "/",
  authorize("admin", "manager", "accountant"),
  validate({ query: payrollQuerySchema }),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as z.infer<typeof payrollQuerySchema>;
    const { skip, take } = getPagination(query);

    const where: Prisma.PayrollWhereInput = {
      ...(query.month ? { month: query.month } : {}),
      ...(query.year ? { year: query.year } : {}),
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, payrolls] = await prisma.$transaction([
      prisma.payroll.count({ where }),
      prisma.payroll.findMany({
        where,
        include: {
          employee: { include: { department: true } },
          generatedBy: true,
        },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        skip,
        take,
      }),
    ]);

    ok(res, payrolls.map(serializePayroll), pageMeta(total, query));
  }),
);

// ─── GET /payroll/me — employee: own payslips ─────────────────────────────────
payrollRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const employeeId = req.user!.employeeId;
    const payrolls = await prisma.payroll.findMany({
      where: { employeeId },
      include: {
        employee: { include: { department: true } },
        generatedBy: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    ok(res, payrolls.map(serializePayroll));
  }),
);

// ─── POST /payroll/generate — admin: bulk generate for a month ────────────────
payrollRouter.post(
  "/generate",
  authorize("admin", "accountant"),
  validate({ body: generatePayrollSchema }),
  asyncHandler(async (req, res) => {
    const input = req.body as z.infer<typeof generatePayrollSchema>;
    const { month, year, departmentId, deductionPercent } = input;

    const where: Prisma.EmployeeWhereInput = {
      status: "active",
      ...(departmentId ? { departmentId } : {}),
    };

    const employees = await prisma.employee.findMany({
      where,
      include: { department: true },
    });

    const results = await prisma.$transaction(
      employees.map((emp) => {
        const grossPay = Number(emp.salary);
        const deductions = Math.round((grossPay * deductionPercent) / 100 * 100) / 100;
        const netPay = grossPay - deductions;
        return prisma.payroll.upsert({
          where: { employeeId_month_year: { employeeId: emp.id, month, year } },
          update: { grossPay, deductions, netPay, generatedById: req.user!.employeeId },
          create: {
            employeeId: emp.id,
            month,
            year,
            grossPay,
            deductions,
            netPay,
            generatedById: req.user!.employeeId,
          },
        });
      }),
    );

    await audit(req, "payroll.generate", `payroll:${year}-${month}`);
    created(res, { generated: results.length, month, year });
  }),
);

// ─── GET /payroll/:id — single payslip ───────────────────────────────────────
payrollRouter.get(
  "/:id",
  validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as z.infer<typeof idParams>;
    const payroll = await prisma.payroll.findUniqueOrThrow({
      where: { id },
      include: {
        employee: { include: { department: true } },
        generatedBy: true,
      },
    });

    // Employees can only see their own payslips
    if (
      req.user!.role === "employee" &&
      payroll.employeeId !== req.user!.employeeId
    ) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }

    ok(res, serializePayroll(payroll));
  }),
);

// ─── PATCH /payroll/:id — admin: update deductions / status ───────────────────
payrollRouter.patch(
  "/:id",
  authorize("admin", "accountant"),
  validate({ params: idParams, body: updatePayrollSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as z.infer<typeof idParams>;
    const input = req.body as z.infer<typeof updatePayrollSchema>;

    const existing = await prisma.payroll.findUniqueOrThrow({ where: { id } });
    const deductions = input.deductions ?? Number(existing.deductions);
    const netPay = Number(existing.grossPay) - deductions;

    const updated = await prisma.payroll.update({
      where: { id },
      data: {
        ...(input.deductions !== undefined ? { deductions, netPay } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
      include: {
        employee: { include: { department: true } },
        generatedBy: true,
      },
    });

    await audit(req, "payroll.update", `payroll:${id}`);
    ok(res, serializePayroll(updated));
  }),
);

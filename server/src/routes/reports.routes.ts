import { Router } from "express";
import { prisma } from "../prisma.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ok } from "../utils/api-response.js";

export const reportsRouter = Router();

reportsRouter.use(authenticate);
reportsRouter.use(authorize("admin", "manager", "accountant"));

reportsRouter.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [employeeCount, departmentCount, projectCount, pendingLeaves, payrollAgg, pendingPayrolls] =
      await Promise.all([
        prisma.employee.count({ where: { status: "active" } }),
        prisma.department.count(),
        prisma.project.count({ where: { status: "active" } }),
        prisma.leaveRequest.count({ where: { status: "pending" } }),
        prisma.payroll.aggregate({
          where: { month: currentMonth, year: currentYear },
          _sum: { netPay: true },
          _count: true,
        }),
        prisma.payroll.count({
          where: { month: currentMonth, year: currentYear, status: "pending" },
        }),
      ]);

    ok(res, {
      employees: employeeCount,
      departments: departmentCount,
      activeProjects: projectCount,
      pendingLeaves,
      payrollThisMonth: Number(payrollAgg._sum.netPay ?? 0),
      payrollCount: payrollAgg._count,
      pendingPayrolls,
    });
  }),
);

import { PrismaClient, type Prisma } from "@prisma/client";
import { hashPassword } from "../server/src/utils/crypto.js";

const prisma = new PrismaClient();

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

async function main() {
  const passwordHash = await hashPassword("123456");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Clean slate: delete all employees (cascades to everything else)
    await tx.employee.deleteMany();

    // 1. Company Settings (idempotent)
    await tx.companySettings.upsert({
      where: { id: "company" },
      update: {},
      create: { id: "company" },
    });

    // 2. Admin Employee
    const adminEmail = "admin@pulsehr.solutions";
    const adminEmployee = await tx.employee.create({
      data: {
        employeeCode: "CVS-000",
        fullName: "Admin Vertex",
        email: adminEmail,
        phone: "+92 300 0000000",
        cnic: "00000-0000000-0",
        address: "CodeVertex Head Office, Karachi",
        gender: "other",
        dob: date("1990-01-01"),
        designation: "System Administrator",
        joiningDate: date("2022-01-01"),
        status: "active",
        salary: "1000000",
        role: "admin",
      }
    });

    // Admin Credentials
    await tx.userCredential.create({
      data: {
        employeeId: adminEmployee.id,
        passwordHash,
        emailVerifiedAt: new Date(),
      },
    });

    // Admin Notification Preferences
    await tx.notificationPreference.create({
      data: { employeeId: adminEmployee.id },
    });

    // 3. Employee Account
    const empEmail = "rehan@pulsehr.solutions";
    const employeeUser = await tx.employee.create({
      data: {
        employeeCode: "CVS-001",
        fullName: "Rehan",
        email: empEmail,
        phone: "+92 300 0000001",
        cnic: "00000-0000000-1",
        address: "CodeVertex Office, Karachi",
        gender: "male",
        dob: date("1995-01-01"),
        designation: "Software Engineer",
        joiningDate: date("2023-01-01"),
        status: "active",
        salary: "150000",
        role: "employee",
      }
    });

    // Employee Credentials
    await tx.userCredential.create({
      data: {
        employeeId: employeeUser.id,
        passwordHash,
        emailVerifiedAt: new Date(),
      },
    });

    // Employee Notification Preferences
    await tx.notificationPreference.create({
      data: { employeeId: employeeUser.id },
    });

    // Audit Log for Seeding
    await tx.auditLog.create({
      data: {
        actorId: adminEmployee.id,
        actorName: adminEmployee.fullName,
        action: "seed.database",
        target: "system",
        metadata: { source: "server/prisma/seed.ts" },
      },
    });
  });

  console.log(`Seed completed.`);
  console.log(`   Admin login: admin@pulsehr.solutions`);
  console.log(`   Employee login: rehan@pulsehr.solutions`);
  console.log(`   Password:    123456`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

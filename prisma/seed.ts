/* eslint-disable */
// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default Admin role
  const adminRoleId = nanoid();
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      id: adminRoleId,
      name: "Admin",
      createdBy: null, // Will be updated after admin user is created
      version: 1,
    },
  });

  // Create additional roles
  const userRoleId = nanoid();
  const userRole = await prisma.role.upsert({
    where: { name: "User" },
    update: {},
    create: {
      id: userRoleId,
      name: "User",
      createdBy: null,
      version: 1,
    },
  });

  const managerRoleId = nanoid();
  const managerRole = await prisma.role.upsert({
    where: { name: "Manager" },
    update: {},
    create: {
      id: managerRoleId,
      name: "Manager",
      createdBy: null,
      version: 1,
    },
  });

  // Create default team
  const defaultTeamId = nanoid();
  const defaultTeam = await prisma.team.upsert({
    where: { name: "SamconOwner" },
    update: {},
    create: {
      id: defaultTeamId,
      name: "SamconOwner",
      createdBy: null,
      version: 1,
    },
  });

  // Create default Admin user
  const adminUserId = nanoid();
  const hashedPassword = await bcrypt.hash("Admin123!", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@samcon.com" },
    update: {},
    create: {
      id: adminUserId,
      name: "Admin",
      email: "admin@samcon.com",
      passwordHash: hashedPassword,
      roleId: adminRole.id,
      createdBy: null,
      version: 1,
    },
  });

  // Update roles and team with createdBy admin user
  await prisma.role.updateMany({
    where: { createdBy: null },
    data: { createdBy: adminUser.id, updatedBy: adminUser.id },
  });

  await prisma.team.update({
    where: { id: defaultTeam.id },
    data: { createdBy: adminUser.id, updatedBy: adminUser.id },
  });

  await prisma.user.update({
    where: { id: adminUser.id },
    data: { createdBy: adminUser.id, updatedBy: adminUser.id },
  });

  // Add admin to default team
  const userTeamId = nanoid();
  await prisma.userTeam.upsert({
    where: {
      userId_teamId: {
        userId: adminUser.id,
        teamId: defaultTeam.id,
      },
    },
    update: {},
    create: {
      id: userTeamId,
      userId: adminUser.id,
      teamId: defaultTeam.id,
      createdBy: adminUser.id,
      version: 1,
    },
  });

  // Starter Types based on RealPars motor starter guide
  const starterTypes = [
    "Manual Motor Starter",
    "Magnetic Motor Starter (Direct Online)",
    "Auto-transformer Motor Starter",
    "Star-Delta Motor Starter",
    "Soft Starter",
    "Variable Frequency Drive (VFD)",
  ];

  for (const starterType of starterTypes) {
    await prisma.starterType.upsert({
      where: { name: starterType },
      update: {},
      create: {
        id: nanoid(),
        name: starterType,
        createdBy: adminUser.id,
        version: 1,
      },
    });
  }

  // Source Types for electrical panels
  const sourceTypes = [
    "Main Supply",
    "Generator",
    "UPS",
    "Solar Panel",
    "Battery Bank",
    "Transformer Secondary",
    "Bus Tie",
    "Emergency Supply",
  ];

  for (const sourceType of sourceTypes) {
    await prisma.sourceType.upsert({
      where: { name: sourceType },
      update: {},
      create: {
        id: nanoid(),
        name: sourceType,
        createdBy: adminUser.id,
        version: 1,
      },
    });
  }

  // Breaker Types
  const breakerTypes = [
    "MCB (Miniature Circuit Breaker)",
    "MCCB (Molded Case Circuit Breaker)",
    "ACB (Air Circuit Breaker)",
    "VCB (Vacuum Circuit Breaker)",
    "SF6 Circuit Breaker",
    "Oil Circuit Breaker",
    "RCBO (Residual Current Breaker)",
    "RCCB (Residual Current Circuit Breaker)",
  ];

  for (const breakerType of breakerTypes) {
    await prisma.breakerType.upsert({
      where: { name: breakerType },
      update: {},
      create: {
        id: nanoid(),
        name: breakerType,
        createdBy: adminUser.id,
        version: 1,
      },
    });
  }

  // Feeder Types
  const feederTypes = [
    "Motor Feeder",
    "Lighting Feeder",
    "Power Feeder",
    "Control Feeder",
    "HVAC Feeder",
    "Emergency Feeder",
    "Distribution Feeder",
    "Sub-Main Feeder",
  ];

  for (const feederType of feederTypes) {
    await prisma.feederType.upsert({
      where: { name: feederType },
      update: {},
      create: {
        id: nanoid(),
        name: feederType,
        createdBy: adminUser.id,
        version: 1,
      },
    });
  }

  // Equipment Types
  const equipmentTypes = [
    "Pump Motor",
    "Fan Motor",
    "Compressor Motor",
    "Conveyor Motor",
    "Crane Motor",
    "Mixer Motor",
    "Blower Motor",
    "Chiller Motor",
    "Elevator Motor",
    "Escalator Motor",
    "HVAC Unit",
    "Lighting Panel",
    "Control Panel",
    "Distribution Panel",
    "MCC Panel",
    "PLC Panel",
    "VFD Panel",
    "Soft Starter Panel",
  ];

  for (const equipmentType of equipmentTypes) {
    await prisma.equipmentType.upsert({
      where: { name: equipmentType },
      update: {},
      create: {
        id: nanoid(),
        name: equipmentType,
        description: `${equipmentType} for electrical panel applications`,
        createdBy: adminUser.id,
        version: 1,
      },
    });
  }

  console.log("Database seeded successfully!");
  console.log(`Created admin user: ${adminUser.email}`);
  console.log(`Created default team: ${defaultTeam.name}`);
  console.log(`Created ${starterTypes.length} starter types`);
  console.log(`Created ${sourceTypes.length} source types`);
  console.log(`Created ${breakerTypes.length} breaker types`);
  console.log(`Created ${feederTypes.length} feeder types`);
  console.log(`Created ${equipmentTypes.length} equipment types`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

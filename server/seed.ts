import { storage } from "./storage";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create BDE Machine
    const machine = await storage.createBdeMachine({
      machineId: "BDE-1",
      password: "1234",
      department: "Production",
      isActive: true,
    });
    console.log("✓ Created BDE machine:", machine.machineId);

    // Create Factory Users
    const users = await Promise.all([
      storage.createFactoryUser({
        name: "John Smith",
        role: "Assembly Operator",
        isActive: true,
      }),
      storage.createFactoryUser({
        name: "Sarah Johnson",
        role: "Quality Inspector",
        isActive: true,
      }),
      storage.createFactoryUser({
        name: "Mike Chen",
        role: "Machine Operator",
        isActive: true,
      }),
      storage.createFactoryUser({
        name: "Emily Davis",
        role: "Line Supervisor",
        isActive: true,
      }),
      storage.createFactoryUser({
        name: "Robert Wilson",
        role: "Assembly Operator",
        isActive: true,
      }),
      storage.createFactoryUser({
        name: "Lisa Anderson",
        role: "Quality Control",
        isActive: true,
      }),
    ]);
    console.log("✓ Created", users.length, "factory users");

    // Create Part Numbers
    const parts = await Promise.all([
      storage.createPartNumber({ partNumber: "P-101", isActive: true }),
      storage.createPartNumber({ partNumber: "P-103", isActive: true }),
      storage.createPartNumber({ partNumber: "P-104", isActive: true }),
      storage.createPartNumber({ partNumber: "P50-", isActive: true }),
      storage.createPartNumber({ partNumber: "PN-1001", isActive: true }),
      storage.createPartNumber({ partNumber: "PN-1002", isActive: true }),
      storage.createPartNumber({ partNumber: "PN-1003", isActive: true }),
    ]);
    console.log("✓ Created", parts.length, "part numbers");

    // Create Order Numbers
    const orders = await Promise.all([
      storage.createOrderNumber({ orderNumber: "ORD-2024-001", isActive: true }),
      storage.createOrderNumber({ orderNumber: "ORD-2024-002", isActive: true }),
      storage.createOrderNumber({ orderNumber: "ORD-2024-003", isActive: true }),
      storage.createOrderNumber({ orderNumber: "ORD-2024-004", isActive: true }),
    ]);
    console.log("✓ Created", orders.length, "order numbers");

    // Create Performance IDs
    const performance = await Promise.all([
      storage.createPerformanceId({ performanceId: "PERF-A", isActive: true }),
      storage.createPerformanceId({ performanceId: "PERF-B", isActive: true }),
      storage.createPerformanceId({ performanceId: "PERF-C", isActive: true }),
      storage.createPerformanceId({ performanceId: "PERF-D", isActive: true }),
    ]);
    console.log("✓ Created", performance.length, "performance IDs");

    console.log("\n✅ Database seeded successfully!");
    console.log("\nLogin credentials:");
    console.log("Machine ID: BDE-1");
    console.log("Password: 1234");
  } catch (error) {
    console.error("❌ Seed error:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

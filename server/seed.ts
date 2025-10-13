import { storage } from "./storage";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create BDE machines
    const machine1 = await storage.createBDEMachine({
      machineId: "MACHINE-001",
      password: "password123",
    });
    console.log("✅ Created BDE machine: MACHINE-001");

    await storage.createBDEMachine({
      machineId: "MACHINE-002",
      password: "password123",
    });
    console.log("✅ Created BDE machine: MACHINE-002");

    // Create users
    await storage.createUser({
      name: "John Smith",
      role: "Assembly Operator",
      imageUrl: null,
    });
    console.log("✅ Created user: John Smith");

    await storage.createUser({
      name: "Sarah Johnson",
      role: "Quality Inspector",
      imageUrl: null,
    });
    console.log("✅ Created user: Sarah Johnson");

    await storage.createUser({
      name: "Mike Chen",
      role: "Machine Operator",
      imageUrl: null,
    });
    console.log("✅ Created user: Mike Chen");

    await storage.createUser({
      name: "Emily Davis",
      role: "Line Supervisor",
      imageUrl: null,
    });
    console.log("✅ Created user: Emily Davis");

    await storage.createUser({
      name: "Robert Wilson",
      role: "Assembly Operator",
      imageUrl: null,
    });
    console.log("✅ Created user: Robert Wilson");

    await storage.createUser({
      name: "Lisa Anderson",
      role: "Quality Control",
      imageUrl: null,
    });
    console.log("✅ Created user: Lisa Anderson");

    // Create part numbers
    const partNumbers = ["PN-1001", "PN-1002", "PN-1003", "PN-1004", "PN-1005"];
    for (const pn of partNumbers) {
      await storage.createPartNumber({ partNumber: pn });
      console.log(`✅ Created part number: ${pn}`);
    }

    // Create order numbers
    const orderNumbers = ["ORD-2024-001", "ORD-2024-002", "ORD-2024-003", "ORD-2024-004"];
    for (const on of orderNumbers) {
      await storage.createOrderNumber({ orderNumber: on });
      console.log(`✅ Created order number: ${on}`);
    }

    // Create performance IDs
    const performanceIds = ["PERF-A", "PERF-B", "PERF-C", "PERF-D"];
    for (const pid of performanceIds) {
      await storage.createPerformanceId({ performanceId: pid });
      console.log(`✅ Created performance ID: ${pid}`);
    }

    console.log("✨ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

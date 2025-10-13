import WorkTracker from "../WorkTracker";
import user1 from "@assets/stock_images/professional_factory_697daf75.jpg";

export default function WorkTrackerExample() {
  // TODO: remove mock functionality
  const mockUser = {
    id: "1",
    name: "John Smith",
    role: "Assembly Operator",
    imageUrl: user1,
  };

  const mockPartNumbers = ["PN-1001", "PN-1002", "PN-1003", "PN-1004"];
  const mockOrderNumbers = ["ORD-2024-001", "ORD-2024-002", "ORD-2024-003"];
  const mockPerformanceIds = ["PERF-A", "PERF-B", "PERF-C"];

  return (
    <WorkTracker
      user={mockUser}
      partNumbers={mockPartNumbers}
      orderNumbers={mockOrderNumbers}
      performanceIds={mockPerformanceIds}
      onSubmit={(data) => console.log("Work session submitted:", data)}
    />
  );
}

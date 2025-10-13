import AdminDashboard from "../AdminDashboard";
import user1 from "@assets/stock_images/professional_factory_697daf75.jpg";
import user2 from "@assets/stock_images/professional_factory_69cb87bb.jpg";
import user3 from "@assets/stock_images/professional_factory_3bb8f823.jpg";

export default function AdminDashboardExample() {
  // TODO: remove mock functionality
  const mockUsers = [
    { id: "1", name: "John Smith", role: "Assembly Operator", imageUrl: user1 },
    { id: "2", name: "Sarah Johnson", role: "Quality Inspector", imageUrl: user2 },
    { id: "3", name: "Mike Chen", role: "Machine Operator", imageUrl: user3 },
  ];

  const mockPartNumbers = ["PN-1001", "PN-1002", "PN-1003", "PN-1004"];
  const mockOrderNumbers = ["ORD-2024-001", "ORD-2024-002", "ORD-2024-003"];
  const mockPerformanceIds = ["PERF-A", "PERF-B", "PERF-C"];

  return (
    <AdminDashboard
      users={mockUsers}
      partNumbers={mockPartNumbers}
      orderNumbers={mockOrderNumbers}
      performanceIds={mockPerformanceIds}
    />
  );
}

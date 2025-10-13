import { useLocation } from "wouter";
import AdminDashboard from "@/components/AdminDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import user1 from "@assets/stock_images/professional_factory_697daf75.jpg";
import user2 from "@assets/stock_images/professional_factory_69cb87bb.jpg";
import user3 from "@assets/stock_images/professional_factory_3bb8f823.jpg";
import user4 from "@assets/stock_images/professional_factory_e84d08c3.jpg";

export default function AdminPage() {
  const [, setLocation] = useLocation();

  // TODO: remove mock functionality - fetch from database
  const mockUsers = [
    { id: "1", name: "John Smith", role: "Assembly Operator", imageUrl: user1 },
    { id: "2", name: "Sarah Johnson", role: "Quality Inspector", imageUrl: user2 },
    { id: "3", name: "Mike Chen", role: "Machine Operator", imageUrl: user3 },
    { id: "4", name: "Emily Davis", role: "Line Supervisor", imageUrl: user4 },
  ];

  const mockPartNumbers = ["PN-1001", "PN-1002", "PN-1003", "PN-1004", "PN-1005"];
  const mockOrderNumbers = ["ORD-2024-001", "ORD-2024-002", "ORD-2024-003", "ORD-2024-004"];
  const mockPerformanceIds = ["PERF-A", "PERF-B", "PERF-C", "PERF-D"];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back-to-login"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold">Admin Panel</h1>
          </div>
        </div>
      </header>

      <AdminDashboard
        users={mockUsers}
        partNumbers={mockPartNumbers}
        orderNumbers={mockOrderNumbers}
        performanceIds={mockPerformanceIds}
      />
    </div>
  );
}

import { useLocation } from "wouter";
import WorkTracker from "@/components/WorkTracker";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import user1 from "@assets/stock_images/professional_factory_697daf75.jpg";

export default function WorkTrackerPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // TODO: remove mock functionality - get from context/state
  const currentUser = {
    id: "1",
    name: "John Smith",
    role: "Assembly Operator",
    imageUrl: user1,
  };

  // TODO: remove mock functionality - fetch from database
  const mockPartNumbers = ["PN-1001", "PN-1002", "PN-1003", "PN-1004", "PN-1005"];
  const mockOrderNumbers = ["ORD-2024-001", "ORD-2024-002", "ORD-2024-003", "ORD-2024-004"];
  const mockPerformanceIds = ["PERF-A", "PERF-B", "PERF-C", "PERF-D"];

  const handleSubmit = (data: any) => {
    console.log("Work session submitted:", data);
    // TODO: Submit to database
    toast({
      title: "Work Session Completed",
      description: `Duration: ${Math.floor(data.duration / 60)}m ${data.duration % 60}s`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/select-user")}
                data-testid="button-back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold">Work Tracking</h1>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <WorkTracker
        user={currentUser}
        partNumbers={mockPartNumbers}
        orderNumbers={mockOrderNumbers}
        performanceIds={mockPerformanceIds}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

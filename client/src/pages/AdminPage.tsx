import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AdminDashboard from "@/components/AdminDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function AdminPage() {
  const [, setLocation] = useLocation();

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiClient.getUsers(),
  });

  const { data: bdeMachines = [] } = useQuery({
    queryKey: ['/api/machines'],
    queryFn: () => apiClient.getMachines(),
  });

  const { data: partNumbersData = [] } = useQuery({
    queryKey: ['/api/part-numbers'],
    queryFn: () => apiClient.getPartNumbers(),
  });

  const { data: orderNumbersData = [] } = useQuery({
    queryKey: ['/api/order-numbers'],
    queryFn: () => apiClient.getOrderNumbers(),
  });

  const { data: performanceIdsData = [] } = useQuery({
    queryKey: ['/api/performance-ids'],
    queryFn: () => apiClient.getPerformanceIds(),
  });

  // Transform data to match component props
  const partNumbers = partNumbersData.map((p: any) => p.part_number);
  const orderNumbers = orderNumbersData.map((o: any) => o.order_number);
  const performanceIds = performanceIdsData.map((p: any) => p.performance_id);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b glass-effect">
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
        users={users}
        bdeMachines={bdeMachines}
        partNumbers={partNumbers}
        orderNumbers={orderNumbers}
        performanceIds={performanceIds}
      />
    </div>
  );
}

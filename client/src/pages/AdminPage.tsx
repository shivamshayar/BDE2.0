import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminDashboard from "@/components/AdminDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch all data
  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });

  const { data: bdeMachines = [], isLoading: machinesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/machines"],
  });

  const { data: partNumbers = [], isLoading: partsLoading } = useQuery<any[]>({
    queryKey: ["/api/master/parts"],
  });

  const { data: orderNumbers = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/master/orders"],
  });

  const { data: performanceIds = [], isLoading: performanceLoading } = useQuery<any[]>({
    queryKey: ["/api/master/performance"],
  });

  // Mutations for creating items
  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await apiRequest("POST", "/api/users", data);
        return await response.json();
      } catch (error) {
        throw error; // Re-throw to trigger onError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Success", description: "User created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create user", variant: "destructive" });
    },
  });

  const createMachineMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await apiRequest("POST", "/api/admin/machines", data);
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/machines"] });
      toast({ title: "Success", description: "Machine created successfully" });
    },
    onError: (error: any) => {
      const message = error.message?.includes("409") 
        ? "Machine ID already exists" 
        : error.message || "Failed to create machine";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const createPartNumberMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await apiRequest("POST", "/api/master/parts", data);
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/parts"] });
      toast({ title: "Success", description: "Part number created successfully" });
    },
    onError: (error: any) => {
      const message = error.message?.includes("409") 
        ? "Part number already exists" 
        : error.message || "Failed to create part number";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const createOrderNumberMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await apiRequest("POST", "/api/master/orders", data);
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/orders"] });
      toast({ title: "Success", description: "Order number created successfully" });
    },
    onError: (error: any) => {
      const message = error.message?.includes("409") 
        ? "Order number already exists" 
        : error.message || "Failed to create order number";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const createPerformanceIdMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await apiRequest("POST", "/api/master/performance", data);
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/performance"] });
      toast({ title: "Success", description: "Performance ID created successfully" });
    },
    onError: (error: any) => {
      const message = error.message?.includes("409") 
        ? "Performance ID already exists" 
        : error.message || "Failed to create performance ID";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      try {
        const response = await apiRequest("PATCH", `/api/admin/machines/${id}/password`, { password });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/machines"] });
      toast({ title: "Success", description: "Password reset successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to reset password", variant: "destructive" });
    },
  });

  const handleAddUser = async (name: string, role: string, imageUrl: string | null) => {
    await createUserMutation.mutateAsync({ name, role, imageUrl, isActive: true });
  };

  const handleAddMachine = async (machineId: string, password: string, department: string) => {
    await createMachineMutation.mutateAsync({ machineId, password, department, isActive: true });
  };

  const handleAddPartNumber = async (partNumber: string) => {
    await createPartNumberMutation.mutateAsync({ partNumber, isActive: true });
  };

  const handleAddOrderNumber = async (orderNumber: string) => {
    await createOrderNumberMutation.mutateAsync({ orderNumber, isActive: true });
  };

  const handleAddPerformanceId = async (performanceId: string) => {
    await createPerformanceIdMutation.mutateAsync({ performanceId, isActive: true });
  };

  const handleResetPassword = async (id: string, password: string) => {
    await resetPasswordMutation.mutateAsync({ id, password });
  };

  const isLoading = usersLoading || machinesLoading || partsLoading || ordersLoading || performanceLoading;

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

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : (
        <AdminDashboard
          users={users}
          bdeMachines={bdeMachines}
          partNumbers={partNumbers.map((p: any) => p.partNumber)}
          orderNumbers={orderNumbers.map((o: any) => o.orderNumber)}
          performanceIds={performanceIds.map((p: any) => p.performanceId)}
          onAddUser={handleAddUser}
          onAddMachine={handleAddMachine}
          onAddPartNumber={handleAddPartNumber}
          onAddOrderNumber={handleAddOrderNumber}
          onAddPerformanceId={handleAddPerformanceId}
          onResetPassword={handleResetPassword}
        />
      )}
    </div>
  );
}

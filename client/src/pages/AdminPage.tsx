import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminDashboard from "@/components/AdminDashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
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

  // Edit mutations
  const editUserMutation = useMutation({
    mutationFn: async ({ id, name, imageUrl }: { id: string; name: string; imageUrl: string | null }) => {
      try {
        const response = await apiRequest("PATCH", `/api/users/${id}`, { name, imageUrl });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Success", description: "User updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update user", variant: "destructive" });
    },
  });

  const editMachineMutation = useMutation({
    mutationFn: async ({ id, machineId, department, isAdmin }: { id: string; machineId: string; department: string; isAdmin: boolean }) => {
      try {
        const response = await apiRequest("PATCH", `/api/admin/machines/${id}`, { machineId, department, isAdmin });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/machines"] });
      toast({ title: "Success", description: "Machine updated successfully" });
    },
    onError: (error: any) => {
      const message = error.message?.includes("409") 
        ? "Machine ID already exists" 
        : error.message || "Failed to update machine";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const editPartNumberMutation = useMutation({
    mutationFn: async ({ id, partNumber }: { id: string; partNumber: string }) => {
      try {
        const response = await apiRequest("PATCH", `/api/master/parts/${id}`, { partNumber });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/parts"] });
      toast({ title: "Success", description: "Part number updated successfully" });
    },
    onError: (error: any) => {
      const message = error.message?.includes("409") 
        ? "Part number already exists" 
        : error.message || "Failed to update part number";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const editOrderNumberMutation = useMutation({
    mutationFn: async ({ id, orderNumber }: { id: string; orderNumber: string }) => {
      try {
        const response = await apiRequest("PATCH", `/api/master/orders/${id}`, { orderNumber });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/orders"] });
      toast({ title: "Success", description: "Order number updated successfully" });
    },
    onError: (error: any) => {
      const message = error.message?.includes("409") 
        ? "Order number already exists" 
        : error.message || "Failed to update order number";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const editPerformanceIdMutation = useMutation({
    mutationFn: async ({ id, performanceId, performanceName }: { id: string; performanceId: string; performanceName: string }) => {
      try {
        const response = await apiRequest("PATCH", `/api/master/performance/${id}`, { performanceId, performanceName });
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/performance"] });
      toast({ title: "Success", description: "Performance ID updated successfully" });
    },
    onError: (error: any) => {
      const message = error.message?.includes("409") 
        ? "Performance ID already exists" 
        : error.message || "Failed to update performance ID";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  // Delete mutations
  const deleteMachineMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiRequest("DELETE", `/api/admin/machines/${id}`);
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/machines"] });
    },
    onError: (error: any) => {
      throw error;
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiRequest("DELETE", `/api/users/${id}`);
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      throw error;
    },
  });

  const deletePartNumberMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiRequest("DELETE", `/api/master/parts/${id}`);
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/parts"] });
    },
    onError: (error: any) => {
      throw error;
    },
  });

  const deleteOrderNumberMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiRequest("DELETE", `/api/master/orders/${id}`);
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/orders"] });
    },
    onError: (error: any) => {
      throw error;
    },
  });

  const deletePerformanceIdMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiRequest("DELETE", `/api/master/performance/${id}`);
        return await response.json();
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/performance"] });
    },
    onError: (error: any) => {
      throw error;
    },
  });

  const handleAddUser = async (name: string, imageUrl: string | null) => {
    await createUserMutation.mutateAsync({ name, imageUrl, isActive: true });
  };

  const handleAddMachine = async (machineId: string, password: string, department: string, isAdmin: boolean) => {
    await createMachineMutation.mutateAsync({ machineId, password, department, isAdmin, isActive: true });
  };

  const handleAddPartNumber = async (partNumber: string) => {
    await createPartNumberMutation.mutateAsync({ partNumber, isActive: true });
  };

  const handleAddOrderNumber = async (orderNumber: string) => {
    await createOrderNumberMutation.mutateAsync({ orderNumber, isActive: true });
  };

  const handleAddPerformanceId = async (performanceId: string, performanceName: string) => {
    await createPerformanceIdMutation.mutateAsync({ performanceId, performanceName, isActive: true });
  };

  const handleResetPassword = async (id: string, password: string) => {
    await resetPasswordMutation.mutateAsync({ id, password });
  };

  const handleEditUser = async (id: string, name: string, imageUrl: string | null) => {
    await editUserMutation.mutateAsync({ id, name, imageUrl });
  };

  const handleEditMachine = async (id: string, machineId: string, department: string, isAdmin: boolean) => {
    await editMachineMutation.mutateAsync({ id, machineId, department, isAdmin });
  };

  const handleEditPartNumber = async (id: string, partNumber: string) => {
    await editPartNumberMutation.mutateAsync({ id, partNumber });
  };

  const handleEditOrderNumber = async (id: string, orderNumber: string) => {
    await editOrderNumberMutation.mutateAsync({ id, orderNumber });
  };

  const handleEditPerformanceId = async (id: string, performanceId: string, performanceName: string) => {
    await editPerformanceIdMutation.mutateAsync({ id, performanceId, performanceName });
  };

  const handleDeleteMachine = async (id: string) => {
    await deleteMachineMutation.mutateAsync(id);
  };

  const handleDeleteUser = async (id: string) => {
    await deleteUserMutation.mutateAsync(id);
  };

  const handleDeletePartNumber = async (id: string) => {
    await deletePartNumberMutation.mutateAsync(id);
  };

  const handleDeleteOrderNumber = async (id: string) => {
    await deleteOrderNumberMutation.mutateAsync(id);
  };

  const handleDeletePerformanceId = async (id: string) => {
    await deletePerformanceIdMutation.mutateAsync(id);
  };

  const isLoading = usersLoading || machinesLoading || partsLoading || ordersLoading || performanceLoading;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

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
          partNumbers={partNumbers}
          orderNumbers={orderNumbers}
          performanceIds={performanceIds}
          onAddUser={handleAddUser}
          onAddMachine={handleAddMachine}
          onAddPartNumber={handleAddPartNumber}
          onAddOrderNumber={handleAddOrderNumber}
          onAddPerformanceId={handleAddPerformanceId}
          onEditUser={handleEditUser}
          onEditMachine={handleEditMachine}
          onEditPartNumber={handleEditPartNumber}
          onEditOrderNumber={handleEditOrderNumber}
          onEditPerformanceId={handleEditPerformanceId}
          onResetPassword={handleResetPassword}
          onDeleteMachine={handleDeleteMachine}
          onDeleteUser={handleDeleteUser}
          onDeletePartNumber={handleDeletePartNumber}
          onDeleteOrderNumber={handleDeleteOrderNumber}
          onDeletePerformanceId={handleDeletePerformanceId}
        />
      )}
    </div>
  );
}

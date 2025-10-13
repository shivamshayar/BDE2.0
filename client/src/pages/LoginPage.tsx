import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import MachineLoginForm from "@/components/MachineLoginForm";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async ({ machineId, password }: { machineId: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", { machineId, password });
      return await response.json();
    },
    onSuccess: (data: any) => {
      login(data.sessionToken, data.machine.machineId);
      setLocation("/select-user");
    },
    onError: (error: any) => {
      setError(error.message || "Invalid machine ID or password");
    },
  });

  const handleLogin = (machineId: string, password: string) => {
    setError(null);
    loginMutation.mutate({ machineId, password });
  };

  return <MachineLoginForm onLogin={handleLogin} error={error || undefined} />;
}

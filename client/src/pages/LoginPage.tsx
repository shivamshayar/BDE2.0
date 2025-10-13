import { useState } from "react";
import { useLocation } from "wouter";
import MachineLoginForm from "@/components/MachineLoginForm";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleLogin = async (machineId: string, password: string) => {
    try {
      setError("");
      await apiClient.loginMachine(machineId, password);
      
      toast({
        title: "Login successful",
        description: `Logged in as ${machineId}`,
      });
      
      setLocation("/select-user");
    } catch (err: any) {
      const errorMessage = err.message || "Invalid machine ID or password";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: errorMessage,
      });
    }
  };

  return <MachineLoginForm onLogin={handleLogin} error={error} />;
}

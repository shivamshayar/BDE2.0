import { useState } from "react";
import { useLocation } from "wouter";
import MachineLoginForm from "@/components/MachineLoginForm";
import { apiRequest } from "@/lib/queryClient";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (machineId: string, password: string) => {
    setError("");
    setLoading(true);

    try {
      const response = await apiRequest("POST", "/api/bde/login", { machineId, password });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      const data = await response.json();
      // Store machine info in sessionStorage
      sessionStorage.setItem("bdeMachine", JSON.stringify(data.machine));
      setLocation("/tracker");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return <MachineLoginForm onLogin={handleLogin} error={error} loading={loading} />;
}

import { useState } from "react";
import { useLocation } from "wouter";
import MachineLoginForm from "@/components/MachineLoginForm";
import { apiRequest } from "@/lib/queryClient";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (machineId: string, password: string): Promise<boolean> => {
    setError("");
    setLoading(true);

    try {
      const response = await apiRequest("POST", "/api/bde/login", { machineId, password });

      const data = await response.json();
      // Store machine info in sessionStorage
      sessionStorage.setItem("bdeMachine", JSON.stringify(data.machine));
      setLocation("/tracker");
      return true;
    } catch (err: any) {
      // apiRequest throws on non-OK responses with "<status>: <body>" messages
      const message = String(err?.message || "");
      if (message.startsWith("401") || message.startsWith("403") || message.startsWith("400")) {
        try {
          const body = JSON.parse(message.substring(message.indexOf(":") + 1).trim());
          setError(body.error || "Login failed");
        } catch {
          setError("Login failed");
        }
      } else {
        setError("Network error. Please try again.");
      }
      setLoading(false);
      return false;
    }
  };

  return <MachineLoginForm onLogin={handleLogin} error={error} loading={loading} />;
}

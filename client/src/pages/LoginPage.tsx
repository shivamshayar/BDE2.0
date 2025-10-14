import { useLocation } from "wouter";
import MachineLoginForm from "@/components/MachineLoginForm";

export default function LoginPage() {
  const [, setLocation] = useLocation();

  const handleLogin = (machineId: string, password: string) => {
    // TODO: Implement actual authentication
    console.log("Login attempt:", machineId, password);
    
    // For demo, just navigate to user selection
    setLocation("/select-user");
  };

  return <MachineLoginForm onLogin={handleLogin} />;
}

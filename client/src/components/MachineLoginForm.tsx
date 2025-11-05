import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertCircle, X, Monitor } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface SavedMachine {
  machineId: string;
  password: string;
  lastLogin: string;
}

interface MachineLoginFormProps {
  onLogin?: (machineId: string, password: string) => void;
  error?: string;
  loading?: boolean;
}

const SAVED_MACHINES_KEY = "bde_saved_machines";

export default function MachineLoginForm({ onLogin, error, loading }: MachineLoginFormProps) {
  const [machineId, setMachineId] = useState("");
  const [password, setPassword] = useState("");
  const [savedMachines, setSavedMachines] = useState<SavedMachine[]>([]);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const { t } = useLanguage();

  // Load saved machines from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_MACHINES_KEY);
    if (saved) {
      try {
        const machines = JSON.parse(saved) as SavedMachine[];
        setSavedMachines(machines);
      } catch (e) {
        console.error("Failed to parse saved machines", e);
      }
    }
  }, []);

  const saveMachineCredentials = (machineId: string, password: string) => {
    const newMachine: SavedMachine = {
      machineId,
      password,
      lastLogin: new Date().toISOString(),
    };

    // Remove existing entry for this machine ID if it exists
    const filtered = savedMachines.filter(m => m.machineId !== machineId);
    const updated = [newMachine, ...filtered].slice(0, 5); // Keep max 5 machines
    
    setSavedMachines(updated);
    localStorage.setItem(SAVED_MACHINES_KEY, JSON.stringify(updated));
  };

  const handleQuickLogin = (machine: SavedMachine) => {
    if (onLogin) {
      onLogin(machine.machineId, machine.password);
    }
  };

  const handleRemoveMachine = (machineId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedMachines.filter(m => m.machineId !== machineId);
    setSavedMachines(updated);
    localStorage.setItem(SAVED_MACHINES_KEY, JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin) {
      // Save credentials for quick login next time
      saveMachineCredentials(machineId, password);
      onLogin(machineId, password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <Lock className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold gradient-text">{t.login.title}</CardTitle>
            <CardDescription className="mt-3 text-base">
              {savedMachines.length > 0 && !showManualLogin ? "Quick Login" : t.login.title}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Login - Show saved machines */}
          {savedMachines.length > 0 && !showManualLogin && (
            <div className="space-y-4">
              <div className="space-y-3">
                {savedMachines.map((machine) => (
                  <div
                    key={machine.machineId}
                    className="relative w-full h-16 border rounded-md flex items-center justify-between group hover:border-primary hover:bg-primary/5 transition-all cursor-pointer px-4"
                    onClick={() => handleQuickLogin(machine)}
                    data-testid={`button-quick-login-${machine.machineId}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-bold text-base">{machine.machineId}</div>
                        <div className="text-xs text-muted-foreground">
                          Last login: {new Date(machine.lastLogin).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleRemoveMachine(machine.machineId, e)}
                      data-testid={`button-remove-${machine.machineId}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowManualLogin(true)}
                data-testid="button-show-manual-login"
              >
                Use Different Machine
              </Button>
            </div>
          )}

          {/* Manual Login Form */}
          {(savedMachines.length === 0 || showManualLogin) && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="machineId" className="text-sm font-semibold">{t.login.machineId}</Label>
                <Input
                  id="machineId"
                  data-testid="input-machine-id"
                  type="text"
                  placeholder={t.login.enterMachineId}
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className="h-12 border-2 focus:border-primary transition-colors"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">{t.login.password}</Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  placeholder={t.login.enterPassword}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-2 focus:border-primary transition-colors"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                data-testid="button-login"
                disabled={loading}
              >
                {loading ? t.loading : t.login.loginButton}
              </Button>

              {savedMachines.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowManualLogin(false)}
                  data-testid="button-back-to-quick-login"
                >
                  Back to Quick Login
                </Button>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

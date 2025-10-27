import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface MachineLoginFormProps {
  onLogin?: (machineId: string, password: string) => void;
  error?: string;
  loading?: boolean;
}

export default function MachineLoginForm({ onLogin, error, loading }: MachineLoginFormProps) {
  const [machineId, setMachineId] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin) {
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
              {t.login.title}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

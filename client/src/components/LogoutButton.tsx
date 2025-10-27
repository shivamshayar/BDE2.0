import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

export function LogoutButton() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const handleLogout = () => {
    sessionStorage.removeItem('machineId');
    sessionStorage.removeItem('isAdmin');
    setLocation('/');
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      data-testid="button-logout"
      className="gap-2 hover-elevate active-elevate-2"
    >
      <LogOut className="h-4 w-4" />
      {t.logout}
    </Button>
  );
}

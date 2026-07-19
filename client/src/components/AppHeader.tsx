import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoutButton } from './LogoutButton';

interface AppHeaderProps {
  children?: React.ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="border-b bg-background" data-testid="app-header">
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <div className="flex items-center gap-2">{children}</div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoutButton } from './LogoutButton';

export function AppHeader() {
  return (
    <header className="border-b bg-background" data-testid="app-header">
      <div className="flex items-center justify-end gap-2 px-4 py-2">
        <LanguageSwitcher />
        <LogoutButton />
      </div>
    </header>
  );
}

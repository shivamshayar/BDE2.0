import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, LogOut } from "lucide-react";
import UserSelectionCard from "./UserSelectionCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
}

interface UserSelectionPageProps {
  users: User[];
  machineId?: string;
  onSelectUser?: (user: User) => void;
  onLogout?: () => void;
}

export default function UserSelectionPage({
  users,
  machineId = "MACHINE-001",
  onSelectUser,
  onLogout,
}: UserSelectionPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (user: User) => {
    setSelectedUserId(user.id);
    if (onSelectUser) {
      setTimeout(() => {
        onSelectUser(user);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b glass-effect">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold gradient-text">BDE Work Tracking</h1>
              <Badge variant="outline" className="text-base px-4 py-1 font-mono font-semibold border-2" data-testid="badge-machine-id">
                {machineId}
              </Badge>
            </div>
            <Button variant="outline" onClick={onLogout} className="shadow-md hover:shadow-lg transition-all" data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">Select Your Profile</h2>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-base border-2 focus:border-primary shadow-md"
                  data-testid="input-search-users"
                />
              </div>
              <Badge variant="secondary" className="text-base px-5 py-2 font-semibold" data-testid="badge-user-count">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredUsers.map((user) => (
              <UserSelectionCard
                key={user.id}
                id={user.id}
                name={user.name}
                role={user.role}
                imageUrl={user.imageUrl}
                selected={selectedUserId === user.id}
                onClick={() => handleSelectUser(user)}
              />
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-xl text-muted-foreground">No users found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

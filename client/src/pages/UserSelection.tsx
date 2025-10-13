import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import UserSelectionPage from "@/components/UserSelectionPage";
import { apiClient } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserSelection() {
  const [, setLocation] = useLocation();

  // Fetch real users from API
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiClient.getUsers(),
  });

  // Get machine ID from localStorage
  const machineId = localStorage.getItem('machine_id') || '';

  const handleSelectUser = (user: any) => {
    // Store selected user in localStorage for work tracker
    localStorage.setItem('selected_user', JSON.stringify({
      id: user.id,
      name: user.name,
      role: user.role,
      imageUrl: user.image_url
    }));
    setLocation("/work-tracker");
  };

  const handleLogout = () => {
    apiClient.clearAuth();
    localStorage.removeItem('selected_user');
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-64 mx-auto" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Map API user data to component format
  const formattedUsers = users.map((user: any) => ({
    id: user.id.toString(),
    name: user.name,
    role: user.role,
    imageUrl: user.image_url || undefined
  }));

  return (
    <UserSelectionPage
      users={formattedUsers}
      machineId={machineId}
      onSelectUser={handleSelectUser}
      onLogout={handleLogout}
    />
  );
}

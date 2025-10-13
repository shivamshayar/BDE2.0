import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import CompactSessionsSidebar from "@/components/CompactSessionsSidebar";
import MultiUserWorkTracker from "@/components/MultiUserWorkTracker";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserSelectionCard from "@/components/UserSelectionCard";
import { apiClient } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userImage?: string;
  isRunning: boolean;
  duration: number;
  partNumber: string;
  orderNumber: string;
  performanceId: string;
}

export default function WorkTrackerPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);

  // Fetch real data from API
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiClient.getUsers(),
  });

  const { data: partNumbersData = [] } = useQuery({
    queryKey: ['/api/part-numbers'],
    queryFn: () => apiClient.getPartNumbers(),
  });

  const { data: orderNumbersData = [] } = useQuery({
    queryKey: ['/api/order-numbers'],
    queryFn: () => apiClient.getOrderNumbers(),
  });

  const { data: performanceIdsData = [] } = useQuery({
    queryKey: ['/api/performance-ids'],
    queryFn: () => apiClient.getPerformanceIds(),
  });

  // Transform data to simple string arrays
  const partNumbers = partNumbersData.map((p: any) => p.part_number);
  const orderNumbers = orderNumbersData.map((o: any) => o.order_number);
  const performanceIds = performanceIdsData.map((p: any) => p.performance_id);

  // Work session submission mutation
  const createWorkSessionMutation = useMutation({
    mutationFn: (sessionData: any) => apiClient.createWorkSession(sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-sessions'] });
    },
  });

  // Initialize sessions from selected user in localStorage
  const [sessions, setSessions] = useState<UserSession[]>(() => {
    const selectedUser = localStorage.getItem('selected_user');
    if (selectedUser) {
      try {
        const user = JSON.parse(selectedUser);
        return [{
          id: `session-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          userImage: user.imageUrl,
          isRunning: false,
          duration: 0,
          partNumber: "",
          orderNumber: "",
          performanceId: "",
        }];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>("session-1");

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleUpdateSession = (sessionId: string, updates: Partial<UserSession>) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, ...updates } : session
      )
    );
  };

  const handleStopSession = async (sessionId: string, data: any) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const startTime = new Date(Date.now() - data.duration * 1000);
    const endTime = new Date();

    try {
      // Submit work session to API
      await createWorkSessionMutation.mutateAsync({
        user_id: parseInt(session.userId),
        part_number: data.partNumber,
        order_number: data.orderNumber,
        performance_id: data.performanceId,
        duration_seconds: data.duration,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      });

      toast({
        title: "Work Session Saved",
        description: `Duration: ${Math.floor(data.duration / 60)}m ${data.duration % 60}s`,
      });

      // Remove session after successful save
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      // Switch to another session if available
      if (sessions.length > 1) {
        const remainingSessions = sessions.filter((s) => s.id !== sessionId);
        setActiveSessionId(remainingSessions[0].id);
      }
    } catch (error) {
      toast({
        title: "Error Saving Session",
        description: error instanceof Error ? error.message : "Failed to save work session",
        variant: "destructive",
      });
    }
  };

  const handleAddSession = (user: any) => {
    const newSession: UserSession = {
      id: `session-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userImage: user.imageUrl,
      isRunning: false,
      duration: 0,
      partNumber: "",
      orderNumber: "",
      performanceId: "",
    };
    
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setShowAddUserDialog(false);
    
    toast({
      title: "User Added",
      description: `${user.name} has been added to the active sessions.`,
    });
  };

  // Map API users to component format
  const formattedUsers = users.map((user: any) => ({
    id: user.id.toString(),
    name: user.name,
    role: user.role,
    imageUrl: user.image_url || undefined,
  }));

  // Filter out users who already have active sessions
  const availableUsersToAdd = formattedUsers.filter(
    (user) => !sessions.some((session) => session.userId === user.id)
  );

  return (
    <div className="flex h-screen bg-background">
      <CompactSessionsSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onAddSession={() => setShowAddUserDialog(true)}
        onSettings={() => setLocation("/admin")}
      />

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-xl font-semibold">BDE Work Tracking</h1>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {activeSession ? (
          <MultiUserWorkTracker
            session={activeSession}
            partNumbers={partNumbers}
            orderNumbers={orderNumbers}
            performanceIds={performanceIds}
            onUpdateSession={handleUpdateSession}
            onStopSession={handleStopSession}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">No active session selected</p>
              <Button onClick={() => setShowAddUserDialog(true)}>
                Add User Session
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Add User to Session</DialogTitle>
            <DialogDescription>
              Select a user to add to the active work sessions
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {availableUsersToAdd.length > 0 ? (
              availableUsersToAdd.map((user) => (
                <UserSelectionCard
                  key={user.id}
                  id={user.id}
                  name={user.name}
                  role={user.role}
                  imageUrl={user.imageUrl}
                  onClick={() => handleAddSession(user)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">All users are already in active sessions</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

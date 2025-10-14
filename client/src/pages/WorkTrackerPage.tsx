import { useState } from "react";
import { useLocation } from "wouter";
import CompactSessionsSidebar from "@/components/CompactSessionsSidebar";
import CompactWorkTracker from "@/components/CompactWorkTracker";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserSelectionCard from "@/components/UserSelectionCard";
import user1 from "@assets/stock_images/professional_factory_697daf75.jpg";
import user2 from "@assets/stock_images/professional_factory_69cb87bb.jpg";
import user3 from "@assets/stock_images/professional_factory_3bb8f823.jpg";
import user4 from "@assets/stock_images/professional_factory_e84d08c3.jpg";
import user5 from "@assets/stock_images/professional_factory_ba70ba6b.jpg";
import user6 from "@assets/stock_images/professional_factory_3ce76da2.jpg";

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

  // TODO: remove mock functionality - get from database
  const availableUsers = [
    { id: "1", name: "John Smith", role: "Assembly Operator", imageUrl: user1 },
    { id: "2", name: "Sarah Johnson", role: "Quality Inspector", imageUrl: user2 },
    { id: "3", name: "Mike Chen", role: "Machine Operator", imageUrl: user3 },
    { id: "4", name: "Emily Davis", role: "Line Supervisor", imageUrl: user4 },
    { id: "5", name: "Robert Wilson", role: "Assembly Operator", imageUrl: user5 },
    { id: "6", name: "Lisa Anderson", role: "Quality Control", imageUrl: user6 },
  ];

  const mockPartNumbers = ["P-101", "P-103", "P-104", "P50-", "PN-1001", "PN-1002", "PN-1003"];
  const mockOrderNumbers = ["ORD-2024-001", "ORD-2024-002", "ORD-2024-003", "ORD-2024-004"];
  const mockPerformanceIds = ["PERF-A", "PERF-B", "PERF-C", "PERF-D"];
  const mockRecentParts = ["P-101", "P50-", "P-103", "P-104"];

  // TODO: remove mock functionality - manage in state/context
  const [sessions, setSessions] = useState<UserSession[]>([
    {
      id: "session-1",
      userId: "1",
      userName: "John Smith",
      userRole: "Assembly Operator",
      userImage: user1,
      isRunning: false,
      duration: 0,
      partNumber: "",
      orderNumber: "",
      performanceId: "",
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>("session-1");

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleUpdateSession = (sessionId: string, updates: Partial<UserSession>) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, ...updates } : session
      )
    );
  };

  const handleStopSession = (sessionId: string, data: any) => {
    console.log("Work session completed:", data);
    toast({
      title: "Work Session Completed",
      description: `Duration: ${Math.floor(data.duration / 60)}m ${data.duration % 60}s`,
    });
    
    // Remove session after completion
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    
    // Switch to another session if available
    if (sessions.length > 1) {
      const remainingSessions = sessions.filter((s) => s.id !== sessionId);
      setActiveSessionId(remainingSessions[0].id);
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

  // Filter out users who already have active sessions
  const availableUsersToAdd = availableUsers.filter(
    (user) => !sessions.some((session) => session.userId === user.id)
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <CompactSessionsSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onAddSession={() => setShowAddUserDialog(true)}
        onSettings={() => setLocation("/admin")}
      />

      {activeSession ? (
        <CompactWorkTracker
          session={activeSession}
          department="Production"
          machineId="BDE-1"
          partNumbers={mockPartNumbers}
          orderNumbers={mockOrderNumbers}
          performanceIds={mockPerformanceIds}
          recentPartNumbers={mockRecentParts}
          onUpdateSession={handleUpdateSession}
          onStopSession={handleStopSession}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-5xl">👤</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">No Active Session</h2>
              <p className="text-xl text-muted-foreground">Click the + button in the sidebar to add a user</p>
            </div>
          </div>
        </div>
      )}

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

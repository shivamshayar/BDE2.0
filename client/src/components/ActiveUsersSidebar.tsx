import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Clock } from "lucide-react";

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  isRunning: boolean;
  duration: number;
  partNumber?: string;
  orderNumber?: string;
}

interface ActiveUsersSidebarProps {
  sessions: UserSession[];
  activeSessionId?: string;
  onSelectSession?: (sessionId: string) => void;
  onAddSession?: () => void;
}

export default function ActiveUsersSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onAddSession,
}: ActiveUsersSidebarProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-80 border-r bg-sidebar h-screen flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="font-semibold text-sidebar-foreground">Active Sessions</h2>
          <Badge variant="secondary" data-testid="badge-session-count">
            {sessions.length}
          </Badge>
        </div>
        <Button
          onClick={onAddSession}
          className="w-full"
          variant="outline"
          data-testid="button-add-session"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User Session
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No active sessions</p>
            </div>
          ) : (
            sessions.map((session) => {
              const initials = session.userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              const isActive = activeSessionId === session.id;

              return (
                <Card
                  key={session.id}
                  className={`p-3 cursor-pointer transition-all hover-elevate ${
                    isActive ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => onSelectSession?.(session.id)}
                  data-testid={`card-session-${session.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={session.userImage} alt={session.userName} />
                      <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" data-testid={`text-session-name-${session.id}`}>
                        {session.userName}
                      </div>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <Clock className={`w-3 h-3 ${session.isRunning ? "text-green-600" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-mono ${session.isRunning ? "text-green-600" : "text-muted-foreground"}`}>
                          {formatTime(session.duration)}
                        </span>
                      </div>

                      {session.partNumber && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {session.partNumber}
                        </div>
                      )}

                      <Badge
                        variant={session.isRunning ? "default" : "secondary"}
                        className="mt-2 text-xs"
                        data-testid={`badge-status-${session.id}`}
                      >
                        {session.isRunning ? "Running" : "Stopped"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

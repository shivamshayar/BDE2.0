import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userImage?: string;
  isRunning: boolean;
  duration: number;
  partNumber?: string;
  orderNumber?: string;
}

interface CompactSessionsSidebarProps {
  sessions: UserSession[];
  activeSessionId?: string;
  onSelectSession?: (sessionId: string) => void;
  onAddSession?: () => void;
  onRemoveSession?: (sessionId: string) => void;
  onSettings?: () => void;
}

export default function CompactSessionsSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onAddSession,
  onRemoveSession,
  onSettings,
}: CompactSessionsSidebarProps) {
  const [longPressSession, setLongPressSession] = useState<string | null>(null);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleMouseDown = (sessionId: string, isRunning: boolean) => {
    if (isRunning) return; // Don't allow removal if timer is running
    
    const timer = setTimeout(() => {
      setLongPressSession(sessionId);
    }, 800); // 800ms for long press
    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleRemove = () => {
    if (longPressSession && onRemoveSession) {
      onRemoveSession(longPressSession);
      setLongPressSession(null);
    }
  };

  const selectedSession = sessions.find(s => s.id === longPressSession);

  return (
    <div className="w-20 bg-gradient-to-b from-sidebar to-sidebar/90 flex flex-col items-center py-6 gap-4 shadow-xl">
      {/* Active Sessions */}
      <div className="flex-1 flex flex-col items-center gap-4">
        {sessions.map((session) => {
          const isActive = activeSessionId === session.id;
          const initials = session.userName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <Tooltip key={session.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelectSession?.(session.id)}
                  onMouseDown={() => handleMouseDown(session.id, session.isRunning)}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={() => handleMouseDown(session.id, session.isRunning)}
                  onTouchEnd={handleMouseUp}
                  className={`relative group transition-all duration-200 ${
                    isActive ? "scale-110" : "opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                  data-testid={`button-session-${session.id}`}
                >
                  <Avatar className={`w-14 h-14 transition-all shadow-lg ${
                    isActive ? "ring-4 ring-white/50 shadow-white/20" : "hover:shadow-primary/30"
                  }`}>
                    <AvatarImage src={session.userImage} alt={session.userName} />
                    <AvatarFallback className="bg-primary-foreground text-primary text-sm font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Running Indicator - Green Dot */}
                  {session.isRunning && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-3.5 h-3.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground border shadow-xl">
                <div className="text-sm">
                  <div className="font-semibold">{session.userName}</div>
                  <div className="text-xs text-muted-foreground">{session.userRole}</div>
                  {session.isRunning && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">● Timer Running</div>
                  )}
                  {!session.isRunning && (
                    <div className="text-xs text-muted-foreground mt-1">Long press to remove</div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Add Session Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onAddSession}
              className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-sidebar-foreground border-2 border-white/20 hover:border-white/40 transition-all hover:scale-105 shadow-lg"
              data-testid="button-add-session"
            >
              <Plus className="w-7 h-7" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground border shadow-xl">
            <p className="text-sm font-medium">Add User Session</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Settings Button at Bottom */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettings}
            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-sidebar-foreground border-2 border-white/20 hover:border-white/40 transition-all hover:scale-105 shadow-lg"
            data-testid="button-settings"
          >
            <Settings className="w-7 h-7" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-popover text-popover-foreground border shadow-xl">
          <p className="text-sm font-medium">Settings</p>
        </TooltipContent>
      </Tooltip>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!longPressSession} onOpenChange={(open) => !open && setLongPressSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {selectedSession?.userName} from the active sessions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-remove">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} data-testid="button-confirm-remove">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

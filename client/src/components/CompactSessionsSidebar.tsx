import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  onSettings?: () => void;
}

export default function CompactSessionsSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onAddSession,
  onSettings,
}: CompactSessionsSidebarProps) {
  return (
    <div className="w-20 bg-primary flex flex-col items-center py-6 gap-4">
      {/* Active Sessions */}
      <div className="flex-1 flex flex-col items-center gap-4">
        {sessions.map((session, index) => {
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
                  className={`relative group ${isActive ? "" : "opacity-80 hover:opacity-100"}`}
                  data-testid={`button-session-${session.id}`}
                >
                  <Avatar className={`w-12 h-12 transition-all ${isActive ? "ring-4 ring-primary-foreground" : ""}`}>
                    <AvatarImage src={session.userImage} alt={session.userName} />
                    <AvatarFallback className="bg-primary-foreground text-primary text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Number Badge */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-foreground text-primary rounded-full flex items-center justify-center text-xs font-bold border-2 border-primary">
                    {index + 1}
                  </div>

                  {/* Running Indicator */}
                  {session.isRunning && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground border">
                <div className="text-sm">
                  <div className="font-semibold">{session.userName}</div>
                  <div className="text-xs text-muted-foreground">{session.userRole}</div>
                  {session.isRunning && (
                    <div className="text-xs text-green-600 mt-1">Timer Running</div>
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
              className="w-12 h-12 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
              data-testid="button-add-session"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground border">
            <p className="text-sm">Add User Session</p>
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
            className="w-12 h-12 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
            data-testid="button-settings"
          >
            <Settings className="w-6 h-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-popover text-popover-foreground border">
          <p className="text-sm">Settings</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

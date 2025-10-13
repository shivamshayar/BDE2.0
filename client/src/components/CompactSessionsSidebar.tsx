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
    <div className="w-20 bg-gradient-to-b from-sidebar to-sidebar/90 flex flex-col items-center py-6 gap-4 shadow-xl">
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
                  
                  {/* Number Badge */}
                  <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-white text-sidebar rounded-full flex items-center justify-center text-xs font-bold border-2 border-sidebar shadow-md">
                    {index + 1}
                  </div>

                  {/* Running Indicator */}
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
    </div>
  );
}

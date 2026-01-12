import { useEffect, useState, useCallback } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  isRunning: boolean;
  duration: number;
  startTime?: number; // Timestamp when timer started
  onDurationChange?: (duration: number) => void;
}

export default function Timer({ isRunning, duration, startTime, onDurationChange }: TimerProps) {
  const [displaySeconds, setDisplaySeconds] = useState(duration);

  // Calculate current elapsed time based on startTime
  const calculateElapsed = useCallback(() => {
    if (!isRunning || !startTime) {
      return duration;
    }
    const now = Date.now();
    const elapsedSinceStart = Math.floor((now - startTime) / 1000);
    return elapsedSinceStart;
  }, [isRunning, startTime, duration]);

  // Update display when timer state changes
  useEffect(() => {
    if (!isRunning) {
      setDisplaySeconds(duration);
      return;
    }

    // Calculate initial display
    setDisplaySeconds(calculateElapsed());

    // Update display every second
    const interval = setInterval(() => {
      const elapsed = calculateElapsed();
      setDisplaySeconds(elapsed);
      if (onDurationChange) {
        onDurationChange(elapsed);
      }
    }, 1000);

    // Also update when tab becomes visible again (handles background throttling)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning) {
        const elapsed = calculateElapsed();
        setDisplaySeconds(elapsed);
        if (onDurationChange) {
          onDurationChange(elapsed);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, startTime, calculateElapsed, onDurationChange]);

  // Sync with external duration when not running
  useEffect(() => {
    if (!isRunning) {
      setDisplaySeconds(duration);
    }
  }, [duration, isRunning]);

  const hours = Math.floor(displaySeconds / 3600);
  const minutes = Math.floor((displaySeconds % 3600) / 60);
  const secs = displaySeconds % 60;

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  return (
    <div
      className={`p-10 rounded-2xl transition-all duration-300 ${
        isRunning
          ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-500/50 timer-active"
          : "bg-muted/50 border-2 border-transparent"
      }`}
      data-testid="timer-display"
    >
      <div className="flex items-center justify-center gap-6">
        <div className={`p-4 rounded-xl transition-all ${
          isRunning 
            ? "bg-green-500 shadow-lg shadow-green-500/30" 
            : "bg-muted"
        }`}>
          <Clock className={`w-10 h-10 ${isRunning ? "text-white" : "text-muted-foreground"}`} />
        </div>
        <div className={`font-mono text-6xl font-bold tracking-tight ${
          isRunning ? "text-green-600 dark:text-green-400" : "text-foreground"
        }`} data-testid="text-timer">
          {formatTime(hours)}:{formatTime(minutes)}:{formatTime(secs)}
        </div>
      </div>
      <div className="text-center mt-6">
        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
          isRunning 
            ? "bg-green-500 text-white shadow-md" 
            : "bg-muted text-muted-foreground"
        }`}>
          {isRunning ? "Timer Running" : "Timer Stopped"}
        </span>
      </div>
    </div>
  );
}

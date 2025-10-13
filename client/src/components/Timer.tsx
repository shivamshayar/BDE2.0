import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  isRunning: boolean;
  duration: number;
  onDurationChange?: (duration: number) => void;
}

export default function Timer({ isRunning, duration, onDurationChange }: TimerProps) {
  const [seconds, setSeconds] = useState(duration);

  useEffect(() => {
    setSeconds(duration);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          const newSeconds = prevSeconds + 1;
          if (onDurationChange) {
            onDurationChange(newSeconds);
          }
          return newSeconds;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, onDurationChange]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

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
          {isRunning ? "🟢 Timer Running" : "⏸️ Timer Stopped"}
        </span>
      </div>
    </div>
  );
}

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
      className={`p-8 rounded-xl ${
        isRunning
          ? "bg-green-500/10 ring-2 ring-green-500/50 animate-pulse"
          : "bg-muted"
      }`}
      data-testid="timer-display"
    >
      <div className="flex items-center justify-center gap-4">
        <Clock className={`w-8 h-8 ${isRunning ? "text-green-600" : "text-muted-foreground"}`} />
        <div className="font-mono text-5xl font-bold" data-testid="text-timer">
          {formatTime(hours)}:{formatTime(minutes)}:{formatTime(secs)}
        </div>
      </div>
      <div className="text-center mt-4 text-sm text-muted-foreground">
        {isRunning ? "Timer Running" : "Timer Stopped"}
      </div>
    </div>
  );
}

import { useState } from "react";
import Timer from "../Timer";
import { Button } from "@/components/ui/button";

export default function TimerExample() {
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(0);

  return (
    <div className="p-8 bg-background space-y-6">
      <Timer 
        isRunning={isRunning} 
        duration={duration}
        onDurationChange={setDuration}
      />
      <div className="flex gap-4 justify-center">
        <Button onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? "Stop" : "Start"}
        </Button>
        <Button variant="outline" onClick={() => setDuration(0)}>
          Reset
        </Button>
      </div>
    </div>
  );
}

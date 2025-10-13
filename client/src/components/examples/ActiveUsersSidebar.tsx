import { useState } from "react";
import ActiveUsersSidebar from "../ActiveUsersSidebar";
import user1 from "@assets/stock_images/professional_factory_697daf75.jpg";
import user2 from "@assets/stock_images/professional_factory_69cb87bb.jpg";

export default function ActiveUsersSidebarExample() {
  const [activeSessionId, setActiveSessionId] = useState("1");

  // TODO: remove mock functionality
  const mockSessions = [
    {
      id: "1",
      userId: "1",
      userName: "John Smith",
      userRole: "Assembly Operator",
      userImage: user1,
      isRunning: true,
      duration: 1245,
      partNumber: "PN-1001",
      orderNumber: "ORD-2024-001",
    },
    {
      id: "2",
      userId: "2",
      userName: "Sarah Johnson",
      userRole: "Quality Inspector",
      userImage: user2,
      isRunning: false,
      duration: 3600,
      partNumber: "PN-1002",
      orderNumber: "ORD-2024-002",
    },
  ];

  return (
    <div className="flex h-screen">
      <ActiveUsersSidebar
        sessions={mockSessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          console.log("Selected session:", id);
          setActiveSessionId(id);
        }}
        onAddSession={() => console.log("Add new session")}
      />
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Work tracker content goes here</p>
      </div>
    </div>
  );
}

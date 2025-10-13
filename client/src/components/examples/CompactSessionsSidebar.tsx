import { useState } from "react";
import CompactSessionsSidebar from "../CompactSessionsSidebar";
import user1 from "@assets/stock_images/professional_factory_697daf75.jpg";
import user2 from "@assets/stock_images/professional_factory_69cb87bb.jpg";

export default function CompactSessionsSidebarExample() {
  const [activeSessionId, setActiveSessionId] = useState("1");

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
      <CompactSessionsSidebar
        sessions={mockSessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          console.log("Selected session:", id);
          setActiveSessionId(id);
        }}
        onAddSession={() => console.log("Add new session")}
        onSettings={() => console.log("Open settings")}
      />
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Work tracker content goes here</p>
      </div>
    </div>
  );
}

import { useLocation } from "wouter";
import UserSelectionPage from "@/components/UserSelectionPage";
import user1 from "@assets/stock_images/professional_factory_697daf75.jpg";
import user2 from "@assets/stock_images/professional_factory_69cb87bb.jpg";
import user3 from "@assets/stock_images/professional_factory_3bb8f823.jpg";
import user4 from "@assets/stock_images/professional_factory_e84d08c3.jpg";
import user5 from "@assets/stock_images/professional_factory_ba70ba6b.jpg";
import user6 from "@assets/stock_images/professional_factory_3ce76da2.jpg";

export default function UserSelection() {
  const [, setLocation] = useLocation();

  // TODO: remove mock functionality - fetch from database
  const mockUsers = [
    { id: "1", name: "John Smith", role: "Assembly Operator", imageUrl: user1 },
    { id: "2", name: "Sarah Johnson", role: "Quality Inspector", imageUrl: user2 },
    { id: "3", name: "Mike Chen", role: "Machine Operator", imageUrl: user3 },
    { id: "4", name: "Emily Davis", role: "Line Supervisor", imageUrl: user4 },
    { id: "5", name: "Robert Wilson", role: "Assembly Operator", imageUrl: user5 },
    { id: "6", name: "Lisa Anderson", role: "Quality Control", imageUrl: user6 },
  ];

  const handleSelectUser = (user: any) => {
    console.log("User selected:", user);
    // TODO: Store selected user in context/state
    setLocation("/work-tracker");
  };

  const handleLogout = () => {
    console.log("Logging out");
    setLocation("/");
  };

  return (
    <UserSelectionPage
      users={mockUsers}
      machineId="MACHINE-001"
      onSelectUser={handleSelectUser}
      onLogout={handleLogout}
    />
  );
}

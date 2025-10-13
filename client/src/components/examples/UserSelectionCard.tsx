import UserSelectionCard from "../UserSelectionCard";
import user1 from "@assets/stock_images/professional_factory_697daf75.jpg";

export default function UserSelectionCardExample() {
  return (
    <div className="p-8 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
        <UserSelectionCard
          id="1"
          name="John Smith"
          role="Assembly Operator"
          imageUrl={user1}
          onClick={() => console.log("Selected: John Smith")}
        />
        <UserSelectionCard
          id="2"
          name="Sarah Johnson"
          role="Quality Inspector"
          selected={true}
          onClick={() => console.log("Selected: Sarah Johnson")}
        />
        <UserSelectionCard
          id="3"
          name="Mike Chen"
          role="Machine Operator"
          onClick={() => console.log("Selected: Mike Chen")}
        />
      </div>
    </div>
  );
}

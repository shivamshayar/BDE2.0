import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface UserSelectionCardProps {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function UserSelectionCard({
  id,
  name,
  role,
  imageUrl,
  selected = false,
  onClick,
}: UserSelectionCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card
      className={`relative cursor-pointer transition-all hover-elevate ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
      data-testid={`card-user-${id}`}
    >
      {selected && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      )}
      
      <div className="p-6 flex flex-col items-center text-center space-y-4">
        <Avatar className="w-32 h-32">
          <AvatarImage src={imageUrl} alt={name} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg" data-testid={`text-username-${id}`}>
            {name}
          </h3>
          <Badge variant="secondary" data-testid={`badge-role-${id}`}>
            {role}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

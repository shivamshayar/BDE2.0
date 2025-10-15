import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface UserSelectionCardProps {
  id: string;
  name: string;
  imageUrl?: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function UserSelectionCard({
  id,
  name,
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
      className={`relative cursor-pointer transition-all duration-200 hover:-translate-y-1 border-2 ${
        selected 
          ? "ring-4 ring-primary/20 border-primary shadow-xl" 
          : "border-transparent shadow-md hover:shadow-xl"
      }`}
      onClick={onClick}
      data-testid={`card-user-${id}`}
    >
      {selected && (
        <div className="absolute top-4 right-4 z-10">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Check className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
      )}
      
      <div className="p-8 flex flex-col items-center text-center space-y-4">
        <div className={`relative ${selected ? 'ring-4 ring-primary/30 rounded-full' : ''}`}>
          <Avatar className="w-36 h-36 border-4 border-background shadow-lg">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-accent/20">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-bold text-xl" data-testid={`text-username-${id}`}>
            {name}
          </h3>
        </div>
      </div>
    </Card>
  );
}

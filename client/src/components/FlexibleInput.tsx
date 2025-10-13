import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Keyboard, List, Barcode } from "lucide-react";
import { Label } from "@/components/ui/label";

interface FlexibleInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

export default function FlexibleInput({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
  placeholder = "Enter or scan value",
  required = false,
}: FlexibleInputProps) {
  const [mode, setMode] = useState<"select" | "manual">("select");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <div className="flex gap-1">
          <Button
            type="button"
            variant={mode === "select" ? "default" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setMode("select")}
            disabled={disabled}
            data-testid={`button-select-mode-${id}`}
          >
            <List className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant={mode === "manual" ? "default" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setMode("manual")}
            disabled={disabled}
            data-testid={`button-manual-mode-${id}`}
          >
            <Keyboard className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {mode === "select" ? (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger id={id} className="h-12" data-testid={`select-${id}`}>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="relative">
          <Input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="h-12 pr-10"
            data-testid={`input-${id}`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <Barcode className="h-4 w-4" />
          </div>
        </div>
      )}
      
      {mode === "manual" && (
        <p className="text-xs text-muted-foreground">
          Type manually or scan barcode
        </p>
      )}
    </div>
  );
}

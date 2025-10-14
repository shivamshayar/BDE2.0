import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  onSelect: (value: string) => void;
}

export default function BottomDrawer({
  isOpen,
  onClose,
  title,
  options,
  onSelect,
}: BottomDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-2xl font-bold">{title}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
            data-testid="button-close-drawer"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg border-2"
              data-testid="input-drawer-search"
            />
          </div>
        </div>

        {/* Options Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredOptions.map((option) => (
              <Button
                key={option}
                variant="outline"
                className="h-16 text-lg font-semibold border-2 hover:border-primary hover:bg-primary/10 transition-all"
                onClick={() => {
                  onSelect(option);
                  onClose();
                }}
                data-testid={`button-option-${option}`}
              >
                {option}
              </Button>
            ))}
          </div>

          {filteredOptions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No results found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

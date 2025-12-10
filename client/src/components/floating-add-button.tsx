import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 md:hidden z-40">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500 rounded-full blur-md opacity-50 animate-pulse" />
        <Button
          size="lg"
          onClick={onClick}
          className="relative h-14 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black glow-cyan"
          data-testid="button-floating-add"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add Monitor</span>
        </Button>
      </div>
    </div>
  );
}

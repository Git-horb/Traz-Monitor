import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 md:hidden z-40">
      <Button
        size="lg"
        onClick={onClick}
        className="h-14 w-14 rounded-full shadow-lg"
        data-testid="button-floating-add"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add Monitor</span>
      </Button>
    </div>
  );
}

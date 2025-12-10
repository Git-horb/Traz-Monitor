import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, Lock, Eye, EyeOff, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => void;
  isPending: boolean;
  monitorName: string;
  error?: string | null;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  monitorName,
  error,
}: DeleteConfirmDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setShowPassword(false);
    }
  }, [open]);

  const handleConfirm = () => {
    if (password.trim()) {
      onConfirm(password);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#0d1117]/95 backdrop-blur-xl border-red-500/30 shadow-2xl shadow-red-500/10">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-bold">Terminate Monitor</AlertDialogTitle>
              <p className="text-xs uppercase tracking-wider text-red-400/70 mt-0.5">Irreversible Action</p>
            </div>
          </div>
          <AlertDialogDescription className="pt-4 text-muted-foreground">
            You are about to permanently delete <span className="text-foreground font-semibold">{monitorName}</span>. 
            All monitoring data and history will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-4">
          <Label htmlFor="delete-password" className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-red-400" />
            Deletion Password
          </Label>
          <div className="relative">
            <Input
              id="delete-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter the password you set when creating this monitor"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && password.trim()) {
                  handleConfirm();
                }
              }}
              className="bg-background/50 border-border/50 focus:border-red-500/50 focus:ring-red-500/20 pr-10"
              data-testid="input-delete-password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              data-testid="button-toggle-delete-password"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-400 flex items-center gap-2" data-testid="text-delete-error">
              <AlertTriangle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel 
            disabled={isPending} 
            className="border-border/50"
            data-testid="button-cancel-delete"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || !password.trim()}
            className="bg-red-600 hover:bg-red-500 gap-2"
            data-testid="button-confirm-delete"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Confirm Deletion
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

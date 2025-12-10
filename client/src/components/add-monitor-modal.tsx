import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Eye, EyeOff, Globe, Clock, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { createMonitorSchema, INTERVAL_OPTIONS, type CreateMonitor, type Monitor } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AddMonitorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateMonitor) => void;
  isPending: boolean;
  editingMonitor?: Monitor | null;
}

export function AddMonitorModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  editingMonitor,
}: AddMonitorModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const isEditing = !!editingMonitor;
  
  const form = useForm<CreateMonitor>({
    resolver: zodResolver(createMonitorSchema),
    defaultValues: {
      name: "",
      url: "",
      interval: 5,
      password: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (editingMonitor) {
        form.reset({
          name: editingMonitor.name,
          url: editingMonitor.url,
          interval: editingMonitor.interval,
          password: "",
        });
      } else {
        form.reset({
          name: "",
          url: "",
          interval: 5,
          password: "",
        });
      }
      setShowPassword(false);
    }
  }, [open, editingMonitor, form]);

  const handleSubmit = (data: CreateMonitor) => {
    onSubmit(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset({
        name: "",
        url: "",
        interval: 5,
        password: "",
      });
      setShowPassword(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#0d1117]/95 backdrop-blur-xl border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
              <Globe className="h-5 w-5 text-cyan-400" />
            </div>
            {isEditing ? "Edit Monitor" : "New Monitor"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? "Update the monitoring configuration for this endpoint."
              : "Configure a new endpoint to monitor in real-time."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Display Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Website"
                      className="bg-background/50 border-border/50 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                      {...field}
                      data-testid="input-monitor-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Endpoint URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      type="url"
                      className="bg-background/50 border-border/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 font-mono text-sm"
                      {...field}
                      data-testid="input-monitor-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-purple-400" />
                    {isEditing ? "Verification Password" : "Deletion Password"}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder={isEditing ? "Enter password to authorize changes" : "Secure password for deletion"}
                        type={showPassword ? "text" : "password"}
                        className="bg-background/50 border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20 pr-10"
                        {...field}
                        data-testid="input-monitor-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    {isEditing 
                      ? "Required to save changes (use original or master password)"
                      : "Required to delete or edit this monitor"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interval"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    Check Interval
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {INTERVAL_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={cn(
                            "flex items-center justify-center rounded-lg border p-3 text-sm font-medium transition-all duration-200",
                            field.value === option.value
                              ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10"
                              : "border-border/50 bg-background/30 text-muted-foreground hover:border-border hover:bg-muted/30"
                          )}
                        >
                          {option.label.replace("Every ", "")}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="border-border/50"
                data-testid="button-cancel-monitor"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-bold"
                data-testid="button-submit-monitor"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Activate Monitor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { createMonitorSchema, updateMonitorSchema, INTERVAL_OPTIONS, type CreateMonitor, type UpdateMonitor, type Monitor } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AddMonitorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateMonitor | UpdateMonitor) => void;
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
    resolver: zodResolver(isEditing ? updateMonitorSchema : createMonitorSchema),
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
    if (isEditing) {
      const { password, ...updateData } = data;
      onSubmit(updateData);
    } else {
      onSubmit(data);
    }
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Monitor" : "Add New Monitor"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the monitoring settings for this website."
              : "Enter the details for the website you want to monitor."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Website"
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
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      type="url"
                      {...field}
                      data-testid="input-monitor-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Deletion Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter a password to protect deletion"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          data-testid="input-monitor-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      You'll need this password to delete this monitor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="interval"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Check Interval</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                    >
                      {INTERVAL_OPTIONS.map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={`interval-${option.value}`}
                          className={cn(
                            "flex items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors hover-elevate",
                            field.value === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          )}
                        >
                          <RadioGroupItem
                            value={option.value.toString()}
                            id={`interval-${option.value}`}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{option.label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                data-testid="button-cancel-monitor"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                data-testid="button-submit-monitor"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Start Monitoring"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

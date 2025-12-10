import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
} from "@/components/ui/form";
import { insertMonitorSchema, INTERVAL_OPTIONS, type InsertMonitor, type Monitor } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AddMonitorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertMonitor) => void;
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
  const form = useForm<InsertMonitor>({
    resolver: zodResolver(insertMonitorSchema),
    defaultValues: {
      name: "",
      url: "",
      interval: 5,
    },
  });

  useEffect(() => {
    if (open) {
      if (editingMonitor) {
        form.reset({
          name: editingMonitor.name,
          url: editingMonitor.url,
          interval: editingMonitor.interval,
        });
      } else {
        form.reset({
          name: "",
          url: "",
          interval: 5,
        });
      }
    }
  }, [open, editingMonitor, form]);

  const handleSubmit = (data: InsertMonitor) => {
    onSubmit(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset({
        name: "",
        url: "",
        interval: 5,
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingMonitor ? "Edit Monitor" : "Add New Monitor"}
          </DialogTitle>
          <DialogDescription>
            {editingMonitor
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

            <FormField
              control={form.control}
              name="interval"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Check Interval</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
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
                {editingMonitor ? "Save Changes" : "Start Monitoring"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

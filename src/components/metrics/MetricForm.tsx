import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

interface MetricFormProps {
  metricTypes: string[];
  onClose: () => void;
  onMetricAdded?: () => void;
}

// Create a function to get the Supabase client
const getSupabaseClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are missing");
    return null;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

const MetricForm = ({ metricTypes, onClose, onMetricAdded }: MetricFormProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [metricType, setMetricType] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const supabase = getSupabaseClient();
    if (!supabase) {
      toast.error("Database connection not available. Please check your environment variables.");
      setSaving(false);
      return;
    }

    // Insert into Supabase
    const { error } = await supabase
      .from("health_metrics")
      .insert([
        {
          date: date.toISOString(),
          type: metricType,
          value: value,
          notes: notes,
        },
      ]);

    setSaving(false);

    if (error) {
      console.error("Error saving metric:", error);
      toast.error("Failed to save metric. Please try again.");
      return;
    }

    toast.success("Health metric saved");
    if (onMetricAdded) onMetricAdded();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log New Health Metric</DialogTitle>
            <DialogDescription>
              Record a new health measurement. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Date Picker */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                      type="button"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Metric Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric-type" className="text-right">
                Metric
              </Label>
              <div className="col-span-3">
                <Select value={metricType} onValueChange={setMetricType} required>
                  <SelectTrigger id="metric-type">
                    <SelectValue placeholder="Select metric type" />
                  </SelectTrigger>
                  <SelectContent>
                    {metricTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Value */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Value
              </Label>
              <Input
                id="value"
                required
                placeholder="e.g., 120/80, 98 mg/dL"
                className="col-span-3"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            
            {/* Notes */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Optional notes about this reading"
                className="col-span-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Metric"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MetricForm;

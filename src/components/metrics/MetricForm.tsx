
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
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import MetricDatePicker from "./MetricDatePicker";
import MetricTypeSelect from "./MetricTypeSelect";
import MetricValueInput from "./MetricValueInput";
import MetricNotesInput from "./MetricNotesInput";

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
            <MetricDatePicker date={date} setDate={setDate} />
            <MetricTypeSelect metricType={metricType} setMetricType={setMetricType} metricTypes={metricTypes} />
            <MetricValueInput value={value} setValue={setValue} />
            <MetricNotesInput notes={notes} setNotes={setNotes} />
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

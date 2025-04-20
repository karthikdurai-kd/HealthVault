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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import MetricDatePicker from "./MetricDatePicker";
import MetricTypeSelect from "./MetricTypeSelect";
import MetricValueInput from "./MetricValueInput";
import MetricNotesInput from "./MetricNotesInput";
import { supabase } from "@/integrations/supabase/client";

interface MetricFormProps {
  metricTypes: string[];
  onClose: () => void;
  onMetricAdded?: () => void;
}

const MetricForm = ({ metricTypes, onClose, onMetricAdded }: MetricFormProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [metricType, setMetricType] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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

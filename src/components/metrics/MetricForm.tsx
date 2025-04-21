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
import { useAddHealthMetric } from "@/hooks/useAddHealthMetric";
import { useUpdateHealthMetric } from "@/hooks/useUpdateHealthMetric";

interface HealthMetric {
  id: string;
  type: string;
  value: string;
  date: string;
  notes: string;
}

interface MetricFormProps {
  metricTypes: string[];
  onClose: () => void;
  onMetricAdded: () => void;
  initialData?: HealthMetric;
  isEditing?: boolean;
}

export function MetricForm({ 
  metricTypes, 
  onClose, 
  onMetricAdded, 
  initialData, 
  isEditing = false 
}: MetricFormProps) {
  const addMetric = useAddHealthMetric();
  const updateMetric = useUpdateHealthMetric();
  
  // Helper function to ensure dates are consistent
  const formatDateForStorage = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Parse ISO date string into a Date object
  const parseLocalDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  };

  // State for form values
  const [formValues, setFormValues] = useState({
    type: initialData?.type || "",
    value: initialData?.value || "",
    date: initialData?.date || formatDateForStorage(new Date()),
    notes: initialData?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dateToSubmit = formValues.date;
    
    if (isEditing && initialData) {
      updateMetric.mutate({
        id: initialData.id,
        type: formValues.type,
        value: formValues.value,
        date: dateToSubmit,
        notes: formValues.notes
      }, {
        onSuccess: () => {
          onMetricAdded();
          onClose();
        }
      });
    } else {
      addMetric.mutate({
        type: formValues.type,
        value: formValues.value,
        date: dateToSubmit,
        notes: formValues.notes
      }, {
        onSuccess: () => {
          onMetricAdded();
          onClose();
        }
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Health Metric" : "Log New Health Metric"}
            </DialogTitle>
            <DialogDescription>
              Record a new health measurement. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <MetricDatePicker 
              date={parseLocalDate(formValues.date)}
              setDate={(date) => {
                setFormValues(prev => ({
                  ...prev, 
                  date: formatDateForStorage(date)
                }));
              }} 
            />
            <MetricTypeSelect 
              metricType={formValues.type} 
              setMetricType={(type) => setFormValues(prev => ({...prev, type}))} 
              metricTypes={metricTypes} 
            />
            <MetricValueInput 
              value={formValues.value} 
              setValue={(value) => setFormValues(prev => ({...prev, value}))} 
            />
            <MetricNotesInput 
              notes={formValues.notes} 
              setNotes={(notes) => setFormValues(prev => ({...prev, notes}))} 
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={addMetric.isPending || updateMetric.isPending}>
              {(addMetric.isPending || updateMetric.isPending) ? "Saving..." : isEditing ? "Update Metric" : "Save Metric"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MetricForm;

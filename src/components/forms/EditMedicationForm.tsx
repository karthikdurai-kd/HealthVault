
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useUpdateMedication } from "@/hooks/useUpdateMedication";
import { getMedicationById } from "@/hooks/useMedications";
import { MedicationInput } from "@/hooks/useAddMedication";

const frequencies = ["Once daily", "Twice daily", "Three times daily", "Every 12 hours", "Every 8 hours", "Every 6 hours", "Weekly", "As needed"];
const timings = ["Morning", "Noon", "Evening", "Bedtime", "Before meals", "With meals", "After meals", "Morning and Evening"];

const formSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  time: z.string().min(1, "Time of day is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditMedicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicationId: string | null;
}

export function EditMedicationForm({ open, onOpenChange, medicationId }: EditMedicationFormProps) {
  const updateMedication = useUpdateMedication();
  const [loading, setLoading] = React.useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "",
      time: "",
    },
  });

  // Load medication data when the form is opened
  useEffect(() => {
    if (open && medicationId) {
      const loadMedication = async () => {
        try {
          setLoading(true);
          const data = await getMedicationById(medicationId);
          form.reset({
            name: data.name,
            dosage: data.dosage,
            frequency: data.frequency,
            time: data.time,
          });
        } catch (error) {
          console.error("Error loading medication:", error);
        } finally {
          setLoading(false);
        }
      };
      
      loadMedication();
    }
  }, [open, medicationId, form]);

  const onSubmit = (data: FormValues) => {
    if (!medicationId) return;
    
    const medicationData: MedicationInput = {
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      time: data.time,
    };
    
    updateMedication.mutate({ 
      id: medicationId, 
      medication: medicationData 
    }, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Medication</DialogTitle>
          <DialogDescription>Update medication details.</DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-4">Loading medication details...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Lisinopril" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage</FormLabel>
                    <FormControl>
                      <Input placeholder="10mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frequencies.map((freq) => (
                          <SelectItem key={freq} value={freq}>
                            {freq}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of Day</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time of day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timings.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMedication.isPending}
                >
                  {updateMedication.isPending ? "Saving..." : "Update Medication"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

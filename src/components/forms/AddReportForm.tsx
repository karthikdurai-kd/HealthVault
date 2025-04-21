
import React from "react";
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
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAddReport } from "@/hooks/useAddReport";
import { useDoctors } from "@/hooks/useDoctors";

const reportTypes = ["Lab Test", "Radiology", "Cardiology", "General", "Specialist"];

const formSchema = z.object({
  title: z.string().min(1, "Report title is required"),
  date: z.string().min(1, "Date is required"),
  doctor_id: z.string().min(1, "Doctor is required"),
  hospital: z.string().min(1, "Hospital is required"),
  type: z.string().min(1, "Report type is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddReportForm({ open, onOpenChange }: AddReportFormProps) {
  const { data: doctors = [], isLoading: isLoadingDoctors } = useDoctors();
  const addReport = useAddReport();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: new Date().toISOString().split("T")[0],
      doctor_id: "",
      hospital: "",
      type: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    const report = {
      ...data,
      has_file: false // For now, we're not handling file uploads
    };
    
    addReport.mutate(report, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  // When doctor is selected, auto-fill hospital
  const selectedDoctorId = form.watch("doctor_id");
  React.useEffect(() => {
    if (selectedDoctorId) {
      const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
      if (selectedDoctor) {
        form.setValue("hospital", selectedDoctor.hospital);
      }
    }
  }, [selectedDoctorId, doctors, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Medical Report</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Blood Test Results" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doctor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingDoctors ? (
                        <SelectItem value="loading" disabled>
                          Loading doctors...
                        </SelectItem>
                      ) : (
                        doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialty}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hospital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospital/Clinic</FormLabel>
                  <FormControl>
                    <Input placeholder="City Medical Center" {...field} />
                  </FormControl>
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
                disabled={addReport.isPending}
              >
                {addReport.isPending ? "Saving..." : "Add Report"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

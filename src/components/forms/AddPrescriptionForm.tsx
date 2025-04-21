
import React, { useState, useEffect } from "react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddPrescription } from "@/hooks/useAddPrescription";
import { useDoctors } from "@/hooks/useDoctors";
import { useMedications } from "@/hooks/useMedications";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  doctor_id: z.string().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
  expiry_date: z.string().min(1, "Expiry date is required"),
  file: z.any()
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        return file instanceof File && 
          ["application/pdf", "image/png", "image/jpeg"].includes(file.type);
      },
      "Only PDF, PNG, or JPEG files are accepted"
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface PrescriptionMedication {
  medication_id: string;
  duration: string;
}

interface AddPrescriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPrescriptionForm({ open, onOpenChange }: AddPrescriptionFormProps) {
  const { data: doctors = [], isLoading: isLoadingDoctors } = useDoctors();
  const { data: medications = [], isLoading: isLoadingMedications } = useMedications();
  const [prescriptionMeds, setPrescriptionMeds] = useState<PrescriptionMedication[]>([]);
  const [currentMed, setCurrentMed] = useState<string>("");
  const [currentDuration, setCurrentDuration] = useState<string>("1 month");
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const addPrescription = useAddPrescription();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctor_id: "",
      date: new Date().toISOString().split("T")[0],
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
      file: undefined,
    },
  });

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      form.reset();
      setPrescriptionMeds([]);
      setUploadedFileUrl(null);
      setCurrentMed("");
    }
  }, [open, form]);

  const addMedicationToPrescription = () => {
    if (currentMed) {
      setPrescriptionMeds([
        ...prescriptionMeds,
        { medication_id: currentMed, duration: currentDuration },
      ]);
      setCurrentMed("");
    }
  };

  const removeMedicationFromPrescription = (index: number) => {
    setPrescriptionMeds(prescriptionMeds.filter((_, i) => i !== index));
  };

  // Upload file to Supabase Storage bucket 'prescriptions'
  const uploadFile = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    try {
      const { data, error } = await supabase.storage
        .from("prescriptions")
        .upload(fileName, file, { 
          cacheControl: "3600", 
          upsert: false,
          contentType: file.type 
        });

      if (error) {
        console.error("Error uploading file:", error);
        setUploading(false);
        return null;
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("prescriptions")
        .getPublicUrl(fileName);

      setUploading(false);
      setUploadedFileUrl(publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Exception during upload:", error);
      setUploading(false);
      return null;
    }
  };

  const onSubmit = async (data: FormValues) => {
    let file_url = uploadedFileUrl;
    
    try {
      if (data.file && data.file.length > 0) {
        const uploadedUrl = await uploadFile(data.file[0]);
        if (!uploadedUrl) {
          form.setError("file", { 
            message: "Failed to upload file. Please try again." 
          });
          return;
        }
        file_url = uploadedUrl;
      }

      const prescription = {
        doctor_id: data.doctor_id,
        date: data.date,
        expiry_date: data.expiry_date,
        has_file: !!file_url,
        file_url: file_url || null,
        medications: prescriptionMeds,
      };

      addPrescription.mutate(prescription, {
        onSuccess: () => {
          form.reset();
          setPrescriptionMeds([]);
          setUploadedFileUrl(null);
          onOpenChange(false);
        },
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Prescription</DialogTitle>
          <DialogDescription>Upload prescription data and add details.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="doctor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prescription Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiry_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File upload */}
            <FormField
              control={form.control}
              name="file"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Upload Prescription File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,image/png,image/jpeg"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files?.length) {
                          onChange(files);
                        }
                      }}
                      {...fieldProps}
                      className="file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-health-blue-100 file:text-health-blue-700
                      hover:file:bg-health-blue-200
                      "
                    />
                  </FormControl>
                  {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Medications</h3>

              <div className="flex gap-2">
                <Select value={currentMed} onValueChange={setCurrentMed}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingMedications ? (
                      <SelectItem value="loading" disabled>
                        Loading medications...
                      </SelectItem>
                    ) : (
                      medications.map((med) => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.name} ({med.dosage})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                <Select value={currentDuration} onValueChange={setCurrentDuration}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 week">1 week</SelectItem>
                    <SelectItem value="2 weeks">2 weeks</SelectItem>
                    <SelectItem value="1 month">1 month</SelectItem>
                    <SelectItem value="2 months">2 months</SelectItem>
                    <SelectItem value="3 months">3 months</SelectItem>
                    <SelectItem value="6 months">6 months</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="button" size="icon" onClick={addMedicationToPrescription} disabled={!currentMed}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {prescriptionMeds.length > 0 && (
                <div className="rounded-md border p-4 mt-2">
                  <ul className="space-y-2">
                    {prescriptionMeds.map((med, index) => {
                      const medication = medications.find((m) => m.id === med.medication_id);
                      return (
                        <li key={index} className="flex items-center justify-between">
                          <span>
                            {medication?.name} ({medication?.dosage}) - {med.duration}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedicationFromPrescription(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addPrescription.isPending || uploading}>
                {addPrescription.isPending || uploading ? "Saving..." : "Add Prescription"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

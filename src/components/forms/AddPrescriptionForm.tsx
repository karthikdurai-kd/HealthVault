
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
import { uploadFileToBucket, ensurePublicBucket } from "@/utils/supabaseUtils";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface AddPrescriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPrescriptionForm({ open, onOpenChange }: AddPrescriptionFormProps) {
  const { data: doctors = [], isLoading: isLoadingDoctors } = useDoctors();
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const { toast } = useToast();

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
      setUploadedFileUrl(null);
    }
  }, [open, form]);

  // Create storage bucket if it doesn't exist 
  useEffect(() => {
    if (open) {
      ensurePublicBucket('prescriptions')
        .then(success => {
          if (!success) {
            toast({
              title: "Warning",
              description: "Storage may not be available for file uploads",
              variant: "destructive",
            });
          }
        })
        .catch(error => {
          console.error("Error checking storage:", error);
        });
    }
  }, [open, toast]);

  // Upload file to Supabase Storage bucket 'prescriptions'
  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadFileToBucket(file, 'prescriptions', 'prescription_');
      setUploading(false);
      
      if (url) {
        setUploadedFileUrl(url);
        return url;
      } else {
        toast({
          title: "Upload Failed",
          description: "Failed to upload file. Please try again.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Exception during upload:", error);
      setUploading(false);
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      });
      return null;
    }
  };

  const onSubmit = async (data: FormValues) => {
    let file_url = uploadedFileUrl;
    
    try {
      // Only attempt to upload if there's a file and it hasn't been uploaded yet
      if (data.file && data.file.length > 0 && !uploadedFileUrl) {
        file_url = await uploadFile(data.file[0]);
        if (!file_url) {
          form.setError("file", { 
            message: "Failed to upload file. Please try again." 
          });
          return;
        }
      }

      const prescription = {
        doctor_id: data.doctor_id,
        date: data.date,
        expiry_date: data.expiry_date,
        has_file: !!file_url,
        file_url: file_url || null,
      };

      console.log("Submitting prescription:", prescription);

      addPrescription.mutate(prescription, {
        onSuccess: () => {
          form.reset();
          setUploadedFileUrl(null);
          onOpenChange(false);
        },
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to save prescription. Please try again.",
        variant: "destructive",
      });
    }
  };

  // View uploaded file
  const handleViewFile = () => {
    if (uploadedFileUrl) window.open(uploadedFileUrl, "_blank");
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
                          // Reset any previous upload
                          setUploadedFileUrl(null);
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
                  {uploadedFileUrl && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600">File uploaded successfully!</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleViewFile}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

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

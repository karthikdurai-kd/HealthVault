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
import { useAddReport } from "@/hooks/useAddReport";
import { useDoctors } from "@/hooks/useDoctors";
import { uploadFileToBucket, ensurePublicBucket } from "@/utils/supabaseUtils";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const reportTypes = ["Lab Test", "Radiology", "Cardiology", "General", "Specialist"];

const formSchema = z.object({
  title: z.string().min(1, "Report title is required"),
  date: z.string().min(1, "Date is required"),
  doctor_id: z.string().min(1, "Doctor is required"),
  hospital: z.string().min(1, "Hospital is required"),
  type: z.string().min(1, "Report type is required"),
  file: z
    .any()
    .optional()
    .refine(
      (file) =>
        !file ||
        !file.length ||
        (file[0] instanceof File &&
          ["application/pdf", "image/png", "image/jpeg"].includes(file[0].type)),
      "Only PDF, PNG, or JPEG files are accepted"
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface AddReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddReportForm({ open, onOpenChange }: AddReportFormProps) {
  const { data: doctors = [], isLoading: isLoadingDoctors } = useDoctors();
  const addReport = useAddReport();
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: new Date().toISOString().split("T")[0],
      doctor_id: "",
      hospital: "",
      type: "",
      file: undefined,
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        form.reset();
        setUploadedFileUrl(null);
      }, 300);
    }
  }, [open, form]);

  // Create storage bucket if it doesn't exist
  useEffect(() => {
    if (open) {
      ensurePublicBucket('reports')
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

  // Upload file to Supabase Storage bucket 'reports'
  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const uploadedUrl = await uploadFileToBucket(file, 'reports', 'report_');
      
      setUploading(false);
      
      if (uploadedUrl) {
        setUploadedFileUrl(uploadedUrl);
        return uploadedUrl;
      } else {
        toast({
          title: "Upload Failed",
          description: "Failed to upload file. Please try again.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Error in file upload:", error);
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
    
    // Only upload if there's a file and it hasn't been uploaded yet
    if (data.file && data.file[0] && !uploadedFileUrl) {
      setUploading(true);
      try {
        const uploadedUrl = await uploadFile(data.file[0]);
        if (!uploadedUrl) {
          setUploading(false);
          form.setError("file", { 
            message: "Failed to upload file. Please try again." 
          });
          return;
        }
        file_url = uploadedUrl;
      } catch (error) {
        console.error("Error during file upload:", error);
        setUploading(false);
        form.setError("file", { 
          message: "Failed to upload file. Please try again." 
        });
        return;
      }
    }

    const report = {
      title: data.title,
      date: data.date,
      doctor_id: data.doctor_id,
      hospital: data.hospital,
      type: data.type,
      has_file: !!file_url,
      file_url: file_url || null,
    };

    console.log("Submitting report:", report);

    addReport.mutate(report, {
      onSuccess: () => {
        form.reset();
        setUploadedFileUrl(null);
        onOpenChange(false);
        toast({
          title: "Success",
          description: "Report added successfully",
        });
      },
      onError: (error) => {
        console.error("Error adding report:", error);
        toast({
          title: "Error",
          description: `Failed to add report: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };

  // When doctor is selected, auto-fill hospital
  const selectedDoctorId = form.watch("doctor_id");
  useEffect(() => {
    if (selectedDoctorId) {
      const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
      if (selectedDoctor && selectedDoctor.hospital) {
        form.setValue("hospital", selectedDoctor.hospital);
      }
    }
  }, [selectedDoctorId, doctors, form]);

  // Download or view file
  const handleDownloadFile = () => {
    if (uploadedFileUrl) window.open(uploadedFileUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Medical Report</DialogTitle>
          <DialogDescription>
            Enter details about the medical report and upload the file.
          </DialogDescription>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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

            {/* File upload */}
            <FormField
              control={form.control}
              name="file"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Upload Report File</FormLabel>
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
                      className="file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-health-blue-100 file:text-health-blue-700
                      hover:file:bg-health-blue-200
                      "
                      {...fieldProps}
                    />
                  </FormControl>
                  {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                  {uploadedFileUrl && (
                    <p className="text-sm text-green-600">File uploaded successfully!</p>
                  )}
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
              <Button type="submit" disabled={addReport.isPending || uploading}>
                {addReport.isPending || uploading ? "Saving..." : "Add Report"}
              </Button>
              {uploadedFileUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadFile}
                  className="ml-2"
                >
                  <Download className="mr-1 h-4 w-4" />
                  View Uploaded File
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

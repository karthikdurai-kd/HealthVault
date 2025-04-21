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
import { supabase } from "@/integrations/supabase/client";
import { Download } from "lucide-react";

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
        (file instanceof File &&
          ["application/pdf", "image/png", "image/jpeg"].includes(file.type)),
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
  const [uploading, setUploading] = React.useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = React.useState<string | null>(null);

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

  // Upload file to Supabase Storage bucket 'reports'
  const uploadFile = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("reports")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) {
      alert("Error uploading file: " + error.message);
      setUploading(false);
      return null;
    }
    // Get public URL
    const { data: publicUrlData } = supabase.storage.from("reports").getPublicUrl(fileName);

    setUploading(false);
    setUploadedFileUrl(publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  };

  const onSubmit = async (data: FormValues) => {
    let file_url = uploadedFileUrl;
    if (data.file && data.file.length > 0) {
      const uploadedUrl = await uploadFile(data.file[0]);
      if (!uploadedUrl) return;
      file_url = uploadedUrl;
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

    addReport.mutate(report, {
      onSuccess: () => {
        form.reset();
        setUploadedFileUrl(null);
        onOpenChange(false);
      },
    });
  };

  // When doctor is selected, auto-fill hospital
  const selectedDoctorId = form.watch("doctor_id");
  React.useEffect(() => {
    if (selectedDoctorId) {
      const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
      if (selectedDoctor) {
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Report File</FormLabel>
                  <FormControl>
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) field.onChange([file]);
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-health-blue-100 file:text-health-blue-700
                      hover:file:bg-health-blue-200
                      "
                    />
                    {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
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

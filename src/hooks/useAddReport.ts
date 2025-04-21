
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ensurePublicBucket } from "@/utils/supabaseUtils";

export interface ReportInput {
  title: string;
  date: string;
  doctor_id: string;
  hospital: string;
  type: string;
  has_file: boolean;
  file_url?: string | null;
}

export function useAddReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (report: ReportInput) => {
      // Validate required fields
      if (!report.title || !report.date || !report.doctor_id || !report.hospital || !report.type) {
        throw new Error("Required fields are missing");
      }

      console.log("Adding report with these details:", report);

      // Create bucket if it doesn't exist - make sure this happens before trying to access it
      await supabase.storage.createBucket('reports', {
        public: true,
        fileSizeLimit: 10485760
      }).catch(error => {
        // Bucket might already exist, which is fine
        console.log("Bucket creation attempt:", error?.message);
      });

      // Ensure the reports bucket exists before proceeding
      const bucketExists = await ensurePublicBucket('reports');
      if (!bucketExists) {
        console.error("Failed to create or access reports storage bucket");
        throw new Error("Failed to create or access storage bucket");
      }

      console.log("Reports bucket is accessible, proceeding with report save");

      // Insert the report
      const { data, error } = await supabase
        .from("reports")
        .insert([report])
        .select()
        .single();

      if (error) {
        console.error("Error inserting report:", error);
        throw error;
      }
      
      console.log("Report added successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        title: "Success", 
        description: "Report added successfully"
      });
    },
    onError: (error) => {
      console.error("Error adding report:", error);
      toast({
        title: "Error",
        description: `Failed to add report: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

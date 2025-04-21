
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

      // Ensure the reports bucket exists before proceeding
      const bucketExists = await ensurePublicBucket('reports');
      if (!bucketExists) {
        throw new Error("Failed to create or access storage bucket");
      }

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
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error) => {
      console.error("Error adding report:", error);
    },
  });
}

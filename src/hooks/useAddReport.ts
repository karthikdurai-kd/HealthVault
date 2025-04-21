
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

      // Check if the reports bucket exists, create if not
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const reportsBucket = buckets?.find(b => b.name === 'reports');
        
        if (!reportsBucket) {
          console.log("Creating reports bucket");
          const { error } = await supabase.storage.createBucket('reports', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          });
          
          if (error) {
            console.error("Error creating bucket:", error);
            throw new Error(`Failed to create storage bucket: ${error.message}`);
          }
          
          // Try to set a public policy
          try {
            await supabase.rpc('create_public_bucket_policy', { bucket_name: 'reports' });
          } catch (policyError) {
            console.error("Error setting public policy:", policyError);
            // Continue anyway, as this may not be fatal
          }
        }
      } catch (error) {
        console.error("Error checking/creating bucket:", error);
      }

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

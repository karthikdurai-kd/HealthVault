
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
          await supabase.storage.createBucket('reports', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          });
        }
      } catch (error) {
        console.error("Error checking/creating bucket:", error);
      }

      const { data, error } = await supabase
        .from("reports")
        .insert([report])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        title: "Success",
        description: "Medical report added successfully",
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


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { deleteFileFromBucket } from "@/utils/supabaseUtils";
import { useToast } from "@/hooks/use-toast";

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      console.log("Fetching reports data");
      const { data, error } = await supabase
        .from("reports")
        .select("*, doctor:doctors(id, name, specialty)")
        .order("date", { ascending: false });
      
      if (error) {
        console.error("Error fetching reports:", error);
        throw error;
      }
      console.log("Reports data fetched:", data?.length || 0, "reports");
      return data || [];
    },
  });
}

// Delete a report hook
export function useDeleteReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, fileUrl }: { id: string, fileUrl: string | null }) => {
      try {
        console.log("Deleting report:", id, "with file:", fileUrl);
        
        // If there's a file, delete it first
        if (fileUrl) {
          const fileDeleted = await deleteFileFromBucket(fileUrl, 'reports');
          if (!fileDeleted) {
            console.warn("Failed to delete file, but will continue with report deletion");
          }
        }

        // Delete the report record
        const { error } = await supabase
          .from('reports')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error("Error deleting report from database:", error);
          throw error;
        }
        
        console.log("Report deleted successfully");
        return { success: true, id };
      } catch (error) {
        console.error("Error in deleteReport mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error in delete mutation handler:", error);
      toast({
        title: "Error",
        description: "Failed to delete report. Please try again.",
        variant: "destructive",
      });
    }
  });
}


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { deleteFileFromBucket } from "@/utils/supabaseUtils";
import { useToast } from "@/hooks/use-toast";

export function usePrescriptions() {
  return useQuery({
    queryKey: ["prescriptions"],
    queryFn: async () => {
      console.log("Fetching prescriptions data");
      // Get all prescriptions, join doctors and link to medications
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*, doctor:doctors(*), prescription_medications:prescription_medications(*, medication:medications(*))")
        .order("date", { ascending: false });
        
      if (error) {
        console.error("Error fetching prescriptions:", error);
        throw error;
      }
      console.log("Prescriptions data fetched:", data?.length || 0, "prescriptions");
      return data || [];
    },
  });
}

// Delete a prescription
export function useDeletePrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, fileUrl }: { id: string, fileUrl: string | null }) => {
      try {
        console.log("Deleting prescription:", id, "with file:", fileUrl);
        
        // If there's a file, delete it first
        if (fileUrl) {
          const fileDeleted = await deleteFileFromBucket(fileUrl, 'prescriptions');
          if (!fileDeleted) {
            console.warn("Failed to delete file, but will continue with prescription deletion");
          }
        }

        // Delete any medication links first
        const { error: relError } = await supabase
          .from('prescription_medications')
          .delete()
          .eq('prescription_id', id);
          
        if (relError) {
          console.warn("Error deleting prescription medications:", relError);
          // Continue anyway as the main prescription still needs to be deleted
        }

        // Delete the prescription record
        const { error } = await supabase
          .from('prescriptions')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error("Error deleting prescription from database:", error);
          throw error;
        }
        
        console.log("Prescription deleted successfully");
        return { success: true, id };
      } catch (error) {
        console.error("Error in deletePrescription mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast({
        title: "Success",
        description: "Prescription deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error in delete mutation handler:", error);
      toast({
        title: "Error",
        description: "Failed to delete prescription. Please try again.",
        variant: "destructive",
      });
    }
  });
}

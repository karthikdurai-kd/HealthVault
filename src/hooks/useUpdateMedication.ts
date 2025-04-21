
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MedicationInput } from "./useAddMedication";

export function useUpdateMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, medication }: { id: string; medication: MedicationInput }) => {
      if (!medication.name || !medication.dosage || !medication.frequency || !medication.time) {
        throw new Error("All fields are required");
      }

      const { data, error } = await supabase
        .from("medications")
        .update(medication)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating medication:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      toast({
        title: "Success",
        description: "Medication updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update medication: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

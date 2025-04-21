
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MedicationInput {
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  last_taken?: string;
}

export function useAddMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (medication: MedicationInput) => {
      if (!medication.name || !medication.dosage || !medication.frequency || !medication.time) {
        throw new Error("All fields are required");
      }

      // Set default last_taken value if not provided
      const medicationWithLastTaken = {
        ...medication,
        last_taken: medication.last_taken || "Not taken yet"
      };

      const { data, error } = await supabase
        .from("medications")
        .insert([medicationWithLastTaken])
        .select()
        .single();

      if (error) {
        console.error("Error adding medication:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      toast({
        title: "Success",
        description: "Medication added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add medication: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}


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
      const { data, error } = await supabase
        .from("medications")
        .insert([medication])
        .select()
        .single();

      if (error) throw error;
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


import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface HealthMetricInput {
  type: string;
  value: string;
  date: string;
  notes?: string;
}

export function useAddHealthMetric() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (metric: HealthMetricInput) => {
      const { data, error } = await supabase
        .from("health_metrics")
        .insert([metric])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health_metrics"] });
      toast({
        title: "Success",
        description: "Health metric added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add health metric: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

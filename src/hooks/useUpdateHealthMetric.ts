import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface HealthMetricUpdateInput {
  id: string;
  type: string;
  value: string;
  date: string;
  notes?: string;
}

// useUpdateHealthMetric is used to update a health metric
export function useUpdateHealthMetric() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (metric: HealthMetricUpdateInput) => {
      const { data, error } = await supabase
        .from("health_metrics")
        .update({
          type: metric.type,
          value: metric.value,
          date: metric.date,
          notes: metric.notes
        })
        .eq("id", metric.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health_metrics"] });
      toast({
        title: "Success",
        description: "Health metric updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update health metric: ${error.message}`,
        variant: "destructive",
      });
    },
  });
} 
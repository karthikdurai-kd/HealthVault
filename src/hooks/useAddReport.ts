
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
}

export function useAddReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (report: ReportInput) => {
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
      toast({
        title: "Error",
        description: `Failed to add report: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

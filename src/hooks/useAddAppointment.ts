
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AppointmentInput {
  doctor_id: string;
  date: string;
  time: string;
  status: string;
}

export function useAddAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (appointment: AppointmentInput) => {
      if (!appointment.doctor_id || !appointment.date || !appointment.time || !appointment.status) {
        throw new Error("All fields are required");
      }

      const { data, error } = await supabase
        .from("appointments")
        .insert([appointment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to schedule appointment: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

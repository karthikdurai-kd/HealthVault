
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DoctorInput {
  name: string;
  specialty: string;
  hospital: string;
  address: string;
  phone: string;
  last_visit?: string | null;
  next_appointment?: string | null;
}

export function useAddDoctor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (doctor: DoctorInput) => {
      // Validate required fields
      if (!doctor.name || !doctor.specialty || !doctor.hospital || !doctor.address || !doctor.phone) {
        throw new Error("Required fields are missing");
      }

      const { data, error } = await supabase
        .from("doctors")
        .insert([doctor])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast({
        title: "Success",
        description: "Doctor added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add doctor: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

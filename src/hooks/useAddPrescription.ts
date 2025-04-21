import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PrescriptionInput {
  doctor_id: string;
  date: string;
  expiry_date: string;
  has_file: boolean;
  file_url?: string | null;
}

export function useAddPrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (prescription: PrescriptionInput) => {
      // Validate required fields
      if (!prescription.doctor_id || !prescription.date || !prescription.expiry_date) {
        throw new Error("Required fields are missing");
      }

      // Insert the prescription 
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from("prescriptions")
        .insert([{
          doctor_id: prescription.doctor_id,
          date: prescription.date,
          expiry_date: prescription.expiry_date,
          has_file: prescription.has_file,
          file_url: prescription.file_url
        }])
        .select()
        .single();

      if (prescriptionError) {
        console.error("Error adding prescription:", prescriptionError);
        throw prescriptionError;
      }

      console.log("Prescription added successfully:", prescriptionData);
      return prescriptionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast({
        title: "Success",
        description: "Prescription added successfully",
      });
    },
    onError: (error) => {
      console.error("Error in mutation:", error);
      toast({
        title: "Error",
        description: `Failed to add prescription: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PrescriptionInput {
  doctor_id: string;
  date: string;
  expiry_date: string;
  has_file: boolean;
  medications?: {
    medication_id: string;
    duration: string;
  }[];
}

export function useAddPrescription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (prescription: PrescriptionInput) => {
      // First insert the prescription
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from("prescriptions")
        .insert([{
          doctor_id: prescription.doctor_id,
          date: prescription.date,
          expiry_date: prescription.expiry_date,
          has_file: prescription.has_file
        }])
        .select()
        .single();

      if (prescriptionError) throw prescriptionError;

      // If medications are provided, insert prescription_medications
      if (prescription.medications && prescription.medications.length > 0) {
        const prescriptionMedicationsData = prescription.medications.map(med => ({
          prescription_id: prescriptionData.id,
          medication_id: med.medication_id,
          duration: med.duration
        }));

        const { error: medicationsError } = await supabase
          .from("prescription_medications")
          .insert(prescriptionMedicationsData);

        if (medicationsError) throw medicationsError;
      }

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
      toast({
        title: "Error",
        description: `Failed to add prescription: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

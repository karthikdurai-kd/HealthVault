
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ensurePublicBucket } from "@/utils/supabaseUtils";

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

      // Create bucket if it doesn't exist - make sure this happens before trying to access it
      await supabase.storage.createBucket('prescriptions', {
        public: true,
        fileSizeLimit: 10485760
      }).catch(error => {
        // Bucket might already exist, which is fine
        console.log("Bucket creation attempt:", error?.message);
      });

      // Ensure the prescriptions bucket exists and is accessible
      const bucketExists = await ensurePublicBucket('prescriptions');
      if (!bucketExists) {
        console.error("Failed to create or access storage bucket for prescriptions");
        throw new Error("Failed to create or access storage bucket");
      }

      console.log("Prescription bucket is accessible, proceeding with prescription save");

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

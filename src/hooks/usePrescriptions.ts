
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePrescriptions() {
  return useQuery({
    queryKey: ["prescriptions"],
    queryFn: async () => {
      // Get all prescriptions, join doctors and link to medications
      const { data, error } = await supabase
        .from("prescriptions")
        .select("*, doctor:doctors(*), prescription_medications:prescription_medications(*, medication:medications(*))");
      if (error) throw error;
      return data || [];
    },
  });
}

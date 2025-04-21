
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*, doctor:doctors(id, name, specialty)")
        .order("date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMedications() {
  return useQuery({
    queryKey: ["medications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medications")
        .select("*");
      
      if (error) {
        console.error("Error fetching medications:", error);
        throw error;
      }
      
      return data || [];
    }
  });
}

// Add a function to get a single medication by ID
export async function getMedicationById(id: string) {
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching medication:", error);
    throw error;
  }
  
  return data;
}

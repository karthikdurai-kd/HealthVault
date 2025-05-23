import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Doctor {
  id: string;  // UUID from database
  name: string;
  specialty: string;
  hospital: string;
  address: string;
  phone: string;
  lastVisit: string | null;
  nextAppointment: string | null;
  created_at?: string;
}

export function useDoctors() {
  return useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("created_at", { ascending: false }); // Sort by creation date, newest first
      if (error) throw error;
      
      // Map the data to match the Doctor interface
      return (data || []).map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        hospital: doctor.hospital,
        address: doctor.address,
        phone: doctor.phone,
        lastVisit: doctor.last_visit ? new Date(doctor.last_visit).toLocaleDateString() : null,
        nextAppointment: doctor.next_appointment ? new Date(doctor.next_appointment).toLocaleDateString() : null,
        created_at: doctor.created_at
      }));
    },
  });
}

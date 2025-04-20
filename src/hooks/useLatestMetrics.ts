
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Main dashboard metrics types
const mainTypes = [
  { type: "Blood Pressure", unit: "mmHg" },
  { type: "Blood Sugar", unit: "mg/dL" },
  { type: "Cholesterol", unit: "mg/dL" },
  { type: "Weight", unit: "kg" },
];

export type MetricSummary = {
  type: string;
  value: string;
  date: string;
};

export function useLatestMetrics() {
  const [metrics, setMetrics] = useState<Record<string, MetricSummary | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      setLoading(true);
      const result: Record<string, MetricSummary | null> = {};
      for (const t of mainTypes) {
        const { data, error } = await supabase
          .from("health_metrics")
          .select("value,date")
          .eq("type", t.type)
          .order("date", { ascending: false })
          .limit(1);

        if (error || !data || !data[0]) {
          result[t.type] = null;
        } else {
          result[t.type] = {
            type: t.type,
            value: data[0].value,
            date: data[0].date,
          };
        }
      }
      setMetrics(result);
      setLoading(false);
    }
    fetchLatest();
  }, []);

  return { metrics, loading };
}

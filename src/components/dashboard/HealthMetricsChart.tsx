import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

// List of all metrics for the dropdown (used in Metric page)
const metricOptions = [
  { value: "bloodPressure", label: "Blood Pressure" },
  { value: "bloodSugar", label: "Blood Sugar" },
  { value: "weight", label: "Weight" },
  { value: "cholesterol", label: "Cholesterol" },
  { value: "hemoglobin", label: "Hemoglobin" },
  { value: "creatinine", label: "Creatinine" },
  { value: "heartRate", label: "Heart Rate" },
  { value: "oxygenSaturation", label: "Oxygen Saturation" },
];

// Update mapping with all metrics
const typeMap: { [key: string]: string } = {
  bloodPressure: "Blood Pressure",
  bloodSugar: "Blood Sugar",
  cholesterol: "Cholesterol",
  weight: "Weight",
  hemoglobin: "Hemoglobin",
  creatinine: "Creatinine",
  heartRate: "Heart Rate",
  oxygenSaturation: "Oxygen Saturation",
};

interface HealthMetricsChartProps {
  forceRefresh?: number;
  metricKey?: string; // for mini charts
  mini?: boolean;
  title?: string;
  description?: string;
}

const HealthMetricsChart: React.FC<HealthMetricsChartProps> = ({
  forceRefresh,
  metricKey,
  mini = false,
  title = "Health Trends",
  description = "Track your health metrics over time",
}) => {
  const defaultMetric = metricKey || "bloodPressure";
  const [selectedMetric, setSelectedMetric] = useState(defaultMetric);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);

  // Fetch health data from Supabase
  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      setError(null);

      try {
        const { data: metrics, error: fetchError } = await supabase
          .from("health_metrics")
          .select("*")
          .eq("type", typeMap[selectedMetric])
          .order("date", { ascending: true });

        if (!fetchError && metrics) {
          setData(metrics);
        } else {
          setData([]);
          setError("Failed to load health metrics");
        }
      } catch (e) {
        setError("An error occurred connecting to the database");
      }

      setLoading(false);
    }
    fetchMetrics();
  }, [selectedMetric, forceRefresh]);

  // Draw D3 line chart when data or metric changes
  useEffect(() => {
    if (!data.length || !chartRef.current) {
      chartRef.current && (chartRef.current.innerHTML = "");
      return;
    }

    chartRef.current.innerHTML = "";

    const margin = mini
      ? { top: 10, right: 12, bottom: 22, left: 35 }
      : { top: 16, right: 30, bottom: 40, left: 48 };
    const width = chartRef.current.offsetWidth || (mini ? 260 : 500);
    const height = mini ? 120 : 300;

    // Parse the data
    const xData = data.map((d) => new Date(d.date));
    let yData: number[] = [];
    switch (selectedMetric) {
      case "bloodPressure":
        yData = data.map((d) => {
          if (typeof d.value === "string" && d.value.includes("/")) {
            const parts = d.value.split("/");
            return (parseInt(parts[0], 10) + parseInt(parts[1], 10)) / 2;
          }
          return +d.value;
        });
        break;
      default:
        yData = data.map((d) => +d.value);
        break;
    }

    // Scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(xData) as [Date, Date])
      .range([margin.left, width - margin.right]);
    const y = d3
      .scaleLinear()
      .domain([d3.min(yData) || 0, d3.max(yData) || 100])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Line generator
    const line = d3
      .line<[Date, number]>()
      .x(([date]) => x(date))
      .y(([, value]) => y(value));

    const lineData = xData.map((d, i) => [d, yData[i]] as [Date, number]);

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x)
          .ticks(5)
          .tickFormat(d3.timeFormat(mini ? "%b" : "%b %d") as any)
      )
      .selectAll("text")
      .style("font-size", mini ? 10 : 12);

    // Y axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(mini ? 3 : 5))
      .selectAll("text")
      .style("font-size", mini ? 10 : 12);

    // Line
    svg
      .append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#6366F1")
      .attr("stroke-width", mini ? 1.25 : 2)
      .attr("d", line as any);

    // Dots
    svg
      .selectAll("circle")
      .data(lineData)
      .join("circle")
      .attr("cx", ([date]) => x(date))
      .attr("cy", ([, value]) => y(value))
      .attr("r", mini ? 2 : 4)
      .attr("fill", "#6366F1");
  }, [data, selectedMetric, mini]);

  // Only show metric select on non-mini (main) chart
  return (
    <Card className={mini ? "" : "col-span-3"}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {!mini && (
          <div>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent className={mini ? "pt-1 pb-1" : "pt-2"}>
        <div ref={chartRef} className={mini ? "h-[120px] w-full" : "h-[300px] w-full"} />
        {loading && (
          <div className="text-center text-muted-foreground mt-2">
            Loading...
          </div>
        )}
        {!loading && error && (
          <div className="text-center text-red-500 mt-2">{error}</div>
        )}
        {!loading && !error && data.length === 0 && (
          <div className="text-center text-muted-foreground mt-2">
            No health metrics available.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthMetricsChart;

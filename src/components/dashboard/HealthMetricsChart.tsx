
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const metricOptions = [
  { value: "bloodPressure", label: "Blood Pressure" },
  { value: "bloodSugar", label: "Blood Sugar" },
  { value: "cholesterol", label: "Cholesterol" },
];

const HealthMetricsChart = () => {
  const [selectedMetric, setSelectedMetric] = useState("bloodPressure");
  const [data, setData] = useState<any[]>([]);
  const chartRef = useRef<HTMLDivElement | null>(null);

  // Fetch health data from Supabase
  useEffect(() => {
    async function fetchMetrics() {
      // Replace 'health_metrics' with your actual Supabase table
      const { data: metrics, error } = await supabase
        .from("health_metrics")
        .select("*")
        .order("date", { ascending: true });
      if (!error && metrics) {
        setData(metrics);
      } else {
        setData([]);
      }
    }
    fetchMetrics();
  }, []);

  // Draw D3 line chart when data or metric changes
  useEffect(() => {
    if (!data.length || !chartRef.current) return;

    // Clear previous SVG
    chartRef.current.innerHTML = "";

    // Prepare D3
    const margin = { top: 16, right: 30, bottom: 40, left: 48 };
    const width = chartRef.current.offsetWidth || 500;
    const height = 300;

    // Parse the data
    const xData = data.map((d) => new Date(d.date));
    let yData: number[] = [];
    switch (selectedMetric) {
      case "bloodPressure":
        yData = data.map((d) => {
          if (typeof d.value === "string" && d.value.includes("/")) {
            // Parse "120/80" format as average value
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
    const x = d3.scaleTime().domain(d3.extent(xData) as [Date, Date]).range([margin.left, width - margin.right]);
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

    // Data for line
    const lineData = xData.map((d, i) => [d, yData[i]] as [Date, number]);

    // Create SVG
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
          .ticks(7)
          .tickFormat(d3.timeFormat("%b %d") as any)
      )
      .selectAll("text")
      .style("font-size", 12);

    // Y axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .selectAll("text")
      .style("font-size", 12);

    // Line
    svg
      .append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#6366F1")
      .attr("stroke-width", 2)
      .attr("d", line as any);

    // Dots
    svg
      .selectAll("circle")
      .data(lineData)
      .join("circle")
      .attr("cx", ([date]) => x(date))
      .attr("cy", ([, value]) => y(value))
      .attr("r", 4)
      .attr("fill", "#6366F1");
  }, [data, selectedMetric]);

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Health Trends</CardTitle>
          <CardDescription>
            Track your health metrics over time
          </CardDescription>
        </div>
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
      </CardHeader>
      <CardContent className="pt-2">
        <div ref={chartRef} className="h-[300px] w-full" />
        {data.length === 0 && (
          <div className="text-center text-muted-foreground mt-6">
            No health metrics available.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthMetricsChart;

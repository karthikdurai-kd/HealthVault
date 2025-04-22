import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
// List of all metrics for the dropdown
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

interface HealthMetricData {
  id: string;
  type: string;
  value: string;
  date: string;
  notes?: string;
  dateObj: Date;
}

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
  const [data, setData] = useState<HealthMetricData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [timeRange, setTimeRange] = useState("month");
  const [chartType, setChartType] = useState("line");
  const [zoomLevel, setZoomLevel] = useState(1);

  // Helper function to fix the timezone issue and ensure dates are consistent
  const fixDateTimezone = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    date.setHours(12, 0, 0, 0); // Set to noon to avoid any timezone shifts
    return date;
  };

  // Fetch health data from Supabase
  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      setError(null);

      try {
        // Clear previous data first to ensure clean updates
        setData([]);
        
        let query = supabase
          .from("health_metrics")
          .select("*")
          .eq("type", typeMap[selectedMetric])
          .order("date", { ascending: true });
        
        // Apply time range filter
        const now = new Date();
        now.setHours(0, 0, 0, 0); 
        
        const startDate = new Date(now);
        
        if (timeRange === "week") {
          startDate.setDate(now.getDate() - 7);
        } else if (timeRange === "month") {
          startDate.setMonth(now.getMonth() - 1);
        } else if (timeRange === "year") {
          startDate.setFullYear(now.getFullYear() - 1);
        } else if (timeRange === "all") { 
          startDate.setFullYear(now.getFullYear() - 10);
        }
        
        // Format date as YYYY-MM-DD
        const formattedStartDate = startDate.toISOString().split('T')[0];
        query = query.gte("date", formattedStartDate);

        const { data: metrics, error: fetchError } = await query;

        if (!fetchError && metrics) {
          
          const processedData = metrics.map(metric => ({
            ...metric,
            dateObj: fixDateTimezone(metric.date)
          }));
          
          setData(processedData);
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
  }, [selectedMetric, timeRange, forceRefresh]);

  // Draw the chart when data changes
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Clear previous chart
    chartRef.current.innerHTML = "";
    
    if (!data.length) return;

    const margin = mini
      ? { top: 10, right: 12, bottom: 22, left: 35 }
      : { top: 20, right: 40, bottom: 40, left: 48 };
    const width = chartRef.current.offsetWidth || (mini ? 260 : 500);
    const height = mini ? 120 : 300;

    // Parse the data
    const xData = data.map((d) => d.dateObj); 
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

    // Determine date format based on time range
    let tickFormat;
    if (timeRange === "week") {
      tickFormat = d3.timeFormat("%a %d"); // Day of week + date
    } else if (timeRange === "month") {
      tickFormat = d3.timeFormat("%b %d"); // Month + date
    } else if (timeRange === "year" || timeRange === "all") {
      tickFormat = d3.timeFormat("%b %Y"); // Month + year
    } else {
      tickFormat = d3.timeFormat("%b %d"); // Default format
    }
    
    // Determine number of ticks based on time range and data size
    let tickCount;
    if (timeRange === "week") {
      tickCount = Math.min(7, data.length); // Every day
    } else if (timeRange === "month") {
      tickCount = Math.min(6, data.length); // Every 5 days
    } else if (timeRange === "year") {
      tickCount = Math.min(12, data.length); // Monthly
    } else {
      tickCount = Math.min(6, data.length); // Default
    }

    // Scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(xData) as [Date, Date])
      .range([margin.left, width - margin.right])
      .nice(); 
    
    // Find min/max for y scale
    const yMin = Math.min(d3.min(yData) || 0, 0);
    const yMax = d3.max(yData) || 100;
    const yPadding = (yMax - yMin) * 0.1; // Add 10% padding
    
    const y = d3
      .scaleLinear()
      .domain([yMin - yPadding, yMax + yPadding])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Add gradient fill
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", `area-gradient-${selectedMetric}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
      
    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6") 
      .attr("stop-opacity", 0.4);
      
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.1);

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(x)
          .ticks(mini ? 3 : tickCount)
          .tickFormat(tickFormat as d3.TimeFormatOutput)
      )
      .selectAll("text")
      .style("font-size", mini ? 10 : 12)
      .attr("transform", "rotate(-20)")
      .style("text-anchor", "end");

    // Y axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(mini ? 3 : 5))
      .selectAll("text")
      .style("font-size", mini ? 10 : 12);

    // Grid lines (horizontal)
    svg
      .append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(y.ticks(5))
      .enter()
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", "rgba(0,0,0,0.1)")
      .attr("stroke-dasharray", "2,2");

    // Line
    const line = d3
      .line<[Date, number]>()
      .x(([date]) => x(date))
      .y(([, value]) => y(value))
      .curve(d3.curveMonotoneX);

    const lineData = xData.map((d, i) => [d, yData[i]] as [Date, number]);

    // Area fill under the line
    const area = d3
      .area<[Date, number]>()
      .x(([date]) => x(date))
      .y0(height - margin.bottom)
      .y1(([, value]) => y(value))
      .curve(d3.curveMonotoneX);

    // Add area fill
    svg
      .append("path")
      .datum(lineData)
      .attr("fill", `url(#area-gradient-${selectedMetric})`)
      .attr("d", area as d3.Area<[Date, number]>);

    // Add line
    svg
      .append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6") // Tailwind blue-500
      .attr("stroke-width", mini ? 1.25 : 2)
      .attr("d", line as d3.Line<[Date, number]>);

    // Add dots
    svg
      .selectAll("circle")
      .data(lineData)
      .join("circle")
      .attr("cx", ([date]) => x(date))
      .attr("cy", ([, value]) => y(value))
      .attr("r", mini ? 2 : 4)
      .attr("fill", "#3b82f6") 
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    // Interactive tooltip
    if (!mini) {
      const tooltip = d3
        .select(chartRef.current)
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "4px")
        .style("padding", "8px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", 100)
        .style("transform", "translate(-50%, -100%)") 
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");

      const getFormattedDate = (date: Date) => {
        const adjusted = new Date(date);
        return adjusted.toISOString().split('T')[0];
      };

      svg
        .selectAll("circle")
        .on("mouseover", function(event, d) {
          const [date, value] = d;
          const originalData = data.find(d => d.dateObj.getTime() === date.getTime());
          
          d3.select(this)
            .attr("r", 6)
            .attr("stroke", "#3b82f6")
            .attr("stroke-width", 2);
            
          tooltip
            .style("opacity", 1)
            .html(
              `<div class="p-1">
                <div class="font-bold">${getFormattedDate(date)}</div>
                <div>Value: ${originalData ? originalData.value : value.toFixed(1)}</div>
              </div>`
            )
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("r", 4)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);
            
          tooltip.style("opacity", 0);
        });
    }

  }, [data, selectedMetric, mini, timeRange]);

  return (
    <Card className={mini ? "" : "col-span-2"}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        
        {!mini && (
          <div className="flex items-center gap-2">
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
      
      {!mini && (
        <div className="px-6">
          <Tabs 
            defaultValue="month" 
            value={timeRange}
            onValueChange={setTimeRange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}
      
      <CardContent className={mini ? "pt-1 pb-1" : "pt-4"}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: mini ? "120px" : "300px" }}>
            <div className="text-center text-muted-foreground">
              Loading data...
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center" style={{ height: mini ? "120px" : "300px" }}>
            <div className="text-center text-red-500">
              {error}
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height: mini ? "120px" : "300px" }}>
            <div className="text-center text-muted-foreground">
              No data available for this period
            </div>
          </div>
        ) : (
          <div ref={chartRef} className={mini ? "h-[120px] w-full" : "h-[300px] w-full"} />
        )}
        
        {!mini && !loading && !error && data.length > 0 && (
          <div className="flex justify-between items-center text-sm text-muted-foreground mt-4">
            <div>
              <span className="font-medium">Latest:</span> {data[data.length - 1].value} ({data[data.length - 1].date})
            </div>
            <div>
              Showing {data.length} data points ({timeRange})
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthMetricsChart;

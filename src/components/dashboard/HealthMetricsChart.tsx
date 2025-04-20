
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const dummyData = [
  {
    date: "2023-04-01",
    bloodPressure: 120,
    bloodSugar: 100,
    cholesterol: 180,
  },
  {
    date: "2023-04-08",
    bloodPressure: 118,
    bloodSugar: 105,
    cholesterol: 175,
  },
  {
    date: "2023-04-15",
    bloodPressure: 122,
    bloodSugar: 110,
    cholesterol: 190,
  },
  {
    date: "2023-04-22",
    bloodPressure: 125,
    bloodSugar: 95,
    cholesterol: 170,
  },
  {
    date: "2023-04-29",
    bloodPressure: 117,
    bloodSugar: 98,
    cholesterol: 165,
  },
  {
    date: "2023-05-06",
    bloodPressure: 119,
    bloodSugar: 103,
    cholesterol: 178,
  },
];

const metricOptions = [
  { value: "bloodPressure", label: "Blood Pressure" },
  { value: "bloodSugar", label: "Blood Sugar" },
  { value: "cholesterol", label: "Cholesterol" },
];

const timeRangeOptions = [
  { value: "1w", label: "Last Week" },
  { value: "1m", label: "Last Month" },
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
];

const HealthMetricsChart = () => {
  const [selectedMetric, setSelectedMetric] = useState("bloodPressure");
  const [timeRange, setTimeRange] = useState("1m");
  const [chartData, setChartData] = useState(dummyData);

  // In a real app, you would fetch data based on the selected time range
  useEffect(() => {
    console.log(`Fetching ${selectedMetric} data for time range: ${timeRange}`);
    // This would be an API call in a real app
    // For now, we'll just use our dummy data
    setChartData(dummyData);
  }, [selectedMetric, timeRange]);

  const getColor = () => {
    switch (selectedMetric) {
      case "bloodPressure":
        return "#1A73E8";
      case "bloodSugar":
        return "#34A853";
      case "cholesterol":
        return "#FBBC04";
      default:
        return "#1A73E8";
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Health Trends</CardTitle>
          <CardDescription>
            Track your health metrics over time
          </CardDescription>
        </div>
        <div className="flex gap-2">
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
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke={getColor()}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthMetricsChart;

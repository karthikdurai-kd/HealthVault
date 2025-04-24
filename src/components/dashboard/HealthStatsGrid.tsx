import { Activity, Heart, Droplet } from "lucide-react";

interface Props {
  latestMetrics: Record<string, { value: string; date: string } | null>;
  loading: boolean;
}

// Date format for the health stats grid
function formatRecency(dateStr?: string) {
  if (!dateStr) return "-";
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const date = new Date(
    parseInt(parts[0]), 
    parseInt(parts[1]) - 1, 
    parseInt(parts[2])
  );
  
  const now = new Date();
  
  // Compare year, month, and day
  const isToday = 
    date.getFullYear() === now.getFullYear() && 
    date.getMonth() === now.getMonth() && 
    date.getDate() === now.getDate();
  
  if (isToday) return "Today";
  
  // Calculate yesterday
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  
  const isYesterday = 
    date.getFullYear() === yesterday.getFullYear() && 
    date.getMonth() === yesterday.getMonth() && 
    date.getDate() === yesterday.getDate();
  
  if (isYesterday) return "Yesterday";
  
  // For older dates, calculate day difference
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return `${diffDays} days ago`;
}

const metricInfo = [
  {
    type: "Blood Pressure",
    icon: <Heart className="h-4 w-4 text-health-danger" />,
    unit: "mmHg",
  },
  {
    type: "Blood Sugar",
    icon: <Droplet className="h-4 w-4 text-health-warning" />,
    unit: "mg/dL",
  },
  {
    type: "Cholesterol",
    icon: <Activity className="h-4 w-4 text-health-green-600" />,
    unit: "mg/dL",
  },
  {
    type: "Weight",
    icon: <Activity className="h-4 w-4 text-health-green-600" />,
    unit: "kg",
  },
];

const HealthStatsGrid = ({ latestMetrics, loading }: Props) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricInfo.map(({ type, icon, unit }) => {
        const metric = latestMetrics[type];
        return (
          <div
            className="rounded-lg border bg-card text-card-foreground shadow-sm"
            key={type}
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
              <div className="text-sm font-medium">{type}</div>
              {icon}
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">
                {loading
                  ? "..."
                  : metric
                  ? `${metric.value} ${unit}`
                  : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading
                  ? ""
                  : metric
                  ? <>Last checked {formatRecency(metric.date)}</>
                  : "No data recorded"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HealthStatsGrid;

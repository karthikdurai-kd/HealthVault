import { Activity, Heart, Droplet } from "lucide-react";

interface Props {
  latestMetrics: Record<string, { value: string; date: string } | null>;
  loading: boolean;
}

function formatRecency(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
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


import { Activity, Heart, Droplet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HealthStatsGrid = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
          <Heart className="h-4 w-4 text-health-danger" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">120/80</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-health-green-600">Normal</span> • Last checked 2 days ago
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blood Sugar</CardTitle>
          <Droplet className="h-4 w-4 text-health-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">110 mg/dL</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-health-warning">Slightly elevated</span> • Last checked 3 days ago
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cholesterol</CardTitle>
          <Activity className="h-4 w-4 text-health-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">180 mg/dL</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-health-green-600">Normal</span> • Last checked 1 week ago
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Creatinine</CardTitle>
          <Activity className="h-4 w-4 text-health-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0.9 mg/dL</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-health-green-600">Normal</span> • Last checked 2 weeks ago
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthStatsGrid;

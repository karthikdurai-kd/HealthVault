
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import HealthStatsGrid from "@/components/dashboard/HealthStatsGrid";
import HealthMetricsChart from "@/components/dashboard/HealthMetricsChart";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import RecentMedications from "@/components/dashboard/RecentMedications";
import { BellRing, Upload, Plus } from "lucide-react";
import { useLatestMetrics } from "@/hooks/useLatestMetrics";

const Index = () => {
  const { metrics, loading } = useLatestMetrics();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here's an overview of your health
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Report
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Health Data
              </Button>
            </div>
          </div>
          
          {/* Alerts/Reminders */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground">
            <div className="flex items-start gap-4">
              <BellRing className="mt-0.5 h-5 w-5 text-health-warning" />
              <div>
                <h3 className="font-medium">Medication Reminder</h3>
                <p className="text-sm text-muted-foreground">
                  Don't forget to take your evening medications at 8:00 PM today
                </p>
              </div>
            </div>
          </div>
          
          {/* Health Stats Grid */}
          <HealthStatsGrid latestMetrics={metrics} loading={loading}/>
          
          {/* Charts and data section */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <HealthMetricsChart />
            <div className="space-y-4 md:col-span-1">
              <UpcomingAppointments />
            </div>
          </div>
          
          {/* Medications */}
          <RecentMedications />
        </main>
      </div>
    </div>
  );
};

export default Index;

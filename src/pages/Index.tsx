
import React, { useState } from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import HealthStatsGrid from "@/components/dashboard/HealthStatsGrid";
import HealthMetricsChart from "@/components/dashboard/HealthMetricsChart";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import { useLatestMetrics } from "@/hooks/useLatestMetrics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddHealthMetricForm } from "@/components/forms/AddHealthMetricForm";
import { AddReportForm } from "@/components/forms/AddReportForm";

const allMiniMetrics = [
  { key: "bloodPressure", label: "Blood Pressure", unit: "mmHg" },
  { key: "bloodSugar", label: "Blood Sugar", unit: "mg/dL" },
  { key: "weight", label: "Weight", unit: "kg" },
  { key: "cholesterol", label: "Cholesterol", unit: "mg/dL" },
  { key: "hemoglobin", label: "Hemoglobin", unit: "g/dL" },
];

const Index = () => {
  const { metrics, loading } = useLatestMetrics();
  const [showHealthMetricForm, setShowHealthMetricForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your health
            </p>
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

          {/* All Mini Graphs for Health Metrics */}
          <div>
            <h2 className="mt-5 mb-3 text-lg font-semibold">All Metric Trends</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allMiniMetrics.map(metric => (
                <HealthMetricsChart
                  key={metric.key}
                  metricKey={metric.key}
                  mini
                  title={metric.label}
                  description={`Recent trend (${metric.unit})`}
                />
              ))}
            </div>
          </div>

          {/* Dialog for Health Metric Form */}
          <Dialog open={showHealthMetricForm} onOpenChange={setShowHealthMetricForm}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Health Metric</DialogTitle>
              </DialogHeader>
              <AddHealthMetricForm onSuccess={() => setShowHealthMetricForm(false)} />
            </DialogContent>
          </Dialog>
          
          {/* Report Form */}
          <AddReportForm 
            open={showReportForm} 
            onOpenChange={setShowReportForm} 
          />
        </main>
      </div>
    </div>
  );
};

export default Index;

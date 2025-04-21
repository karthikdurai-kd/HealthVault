
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

          {/* Unified Health Metrics Chart (with dropdown for all types) */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <HealthMetricsChart />
            <div className="space-y-4 md:col-span-1">
              <UpcomingAppointments />
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

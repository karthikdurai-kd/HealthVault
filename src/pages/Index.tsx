import React, { useState } from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import HealthStatsGrid from "@/components/dashboard/HealthStatsGrid";
import HealthMetricsChart from "@/components/dashboard/HealthMetricsChart";
import { useLatestMetrics } from "@/hooks/useLatestMetrics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddHealthMetricForm } from "@/components/forms/AddHealthMetricForm";
import { AddReportForm } from "@/components/forms/AddReportForm";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Calendar, FileText, Pill } from "lucide-react"      
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { metrics, loading } = useLatestMetrics();
  const [showHealthMetricForm, setShowHealthMetricForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back!  Here's an overview of your health
              </p>
            </div>
         
          </div>

          {/* Health Stats Grid */}
          <HealthStatsGrid latestMetrics={metrics} loading={loading}/>

          {/* Main Content Grid */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-2">
            <HealthMetricsChart />
            {/* <div className="space-y-4 md:col-span-1">
              <HealthGoals />
            </div> */}
          </div>

          {/* Quick Access Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => navigate('/appointments')}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Appointments</h3>
                  <p className="text-sm text-muted-foreground">Schedule & manage</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/metrics')}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <Activity className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Health Metrics</h3>
                  <p className="text-sm text-muted-foreground">Track your vitals</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/prescriptions')}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-full">
                  <Pill className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Medications</h3>
                  <p className="text-sm text-muted-foreground">Prescriptions & dosage</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/reports')}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Medical Reports</h3>
                  <p className="text-sm text-muted-foreground">View & organize</p>
                </div>
              </CardContent>
            </Card>
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

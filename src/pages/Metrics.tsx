
import React, { useState } from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MetricForm from "@/components/metrics/MetricForm";

// Sample metric data
const metrics = [
  {
    id: 1,
    date: "2025-04-18",
    type: "Blood Pressure",
    value: "120/80 mmHg",
    notes: "Morning reading, after medication"
  },
  {
    id: 2,
    date: "2025-04-18",
    type: "Blood Sugar",
    value: "98 mg/dL",
    notes: "Fasting"
  },
  {
    id: 3,
    date: "2025-04-17",
    type: "Weight",
    value: "78 kg",
    notes: ""
  },
  {
    id: 4,
    date: "2025-04-16",
    type: "Blood Pressure",
    value: "118/78 mmHg",
    notes: "Evening reading"
  },
  {
    id: 5,
    date: "2025-04-15",
    type: "Cholesterol",
    value: "185 mg/dL",
    notes: "Lab test result"
  }
];

const metricTypes = [
  "Blood Pressure",
  "Blood Sugar",
  "Weight",
  "Cholesterol",
  "Hemoglobin",
  "Creatinine",
  "Heart Rate",
  "Oxygen Saturation"
];

const Metrics = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Health Metrics</h1>
              <p className="text-muted-foreground">
                Track and monitor your vital health parameters
              </p>
            </div>
            <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Log New Metric
            </Button>
          </div>
          
          {/* Metrics Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Blood Pressure</CardTitle>
                <CardDescription>Latest reading</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">120/80 <span className="text-sm font-normal text-muted-foreground">mmHg</span></div>
                <p className="text-xs text-muted-foreground">Last recorded: Today</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Blood Sugar</CardTitle>
                <CardDescription>Latest reading</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98 <span className="text-sm font-normal text-muted-foreground">mg/dL</span></div>
                <p className="text-xs text-muted-foreground">Last recorded: Today</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weight</CardTitle>
                <CardDescription>Latest reading</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78 <span className="text-sm font-normal text-muted-foreground">kg</span></div>
                <p className="text-xs text-muted-foreground">Last recorded: Yesterday</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Cholesterol</CardTitle>
                <CardDescription>Latest reading</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">185 <span className="text-sm font-normal text-muted-foreground">mg/dL</span></div>
                <p className="text-xs text-muted-foreground">Last recorded: 3 days ago</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Metric History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Metric History</span>
                <Button variant="outline" size="sm" className="gap-1">
                  <FileText className="h-4 w-4" />
                  Export
                </Button>
              </CardTitle>
              <CardDescription>
                Your recorded health metrics in chronological order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell>{new Date(metric.date).toLocaleDateString()}</TableCell>
                      <TableCell>{metric.type}</TableCell>
                      <TableCell>{metric.value}</TableCell>
                      <TableCell>{metric.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Metric Form Dialog */}
          {isFormOpen && (
            <MetricForm 
              metricTypes={metricTypes} 
              onClose={() => setIsFormOpen(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Metrics;


import React, { useState, useEffect } from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText } from "lucide-react";
import { filePdf } from "lucide-react/icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MetricForm from "@/components/metrics/MetricForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

// These must match the backend
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
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch metrics from Supabase on mount/refresh
  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("health_metrics")
          .select("*")
          .order("date", { ascending: false });

        if (fetchError) {
          console.error("Error fetching metrics:", fetchError);
          setMetrics([]);
          setError("Failed to load metrics from database");
          toast.error("Failed to fetch metrics from backend.");
        } else {
          setMetrics(data || []);
        }
      } catch (e) {
        console.error("Exception fetching metrics:", e);
        setError("An error occurred connecting to the database");
      }

      setLoading(false);
    }

    fetchMetrics();
  }, [refreshKey]);

  // Utility to get latest metric value (by type)
  function getLatestMetric(type: string) {
    const filtered = metrics.filter((m) => m.type === type);
    if (!filtered.length) return null;
    return filtered[0];
  }

  function formatRecency(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff} days ago`;
  }

  // Export PDF for a single metric row
  function handleExportPdf(metric: any) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Health Metric Record", 14, 20);
    doc.setFontSize(12);
    let y = 35;
    doc.text(`Metric: ${metric.type}`, 14, y);
    y += 10;
    doc.text(`Date: ${new Date(metric.date).toLocaleDateString()}`, 14, y);
    y += 10;
    doc.text(`Value: ${metric.value}`, 14, y);
    y += 10;
    if (metric.notes) {
      doc.text("Notes:", 14, y);
      y += 8;
      doc.setFont("times", "italic");
      doc.text(metric.notes, 14, y);
      doc.setFont("times", "normal");
    }
    doc.save(`HealthMetric_${metric.type}_${new Date(metric.date).toLocaleDateString()}.pdf`);
  }

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
            <Button 
              className="gap-2" 
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Log New Metric
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {/* Metrics Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {["Blood Pressure", "Blood Sugar", "Weight", "Cholesterol"].map((type) => {
              const latest = getLatestMetric(type);
              return (
                <Card key={type}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{type}</CardTitle>
                    <CardDescription>Latest reading</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {latest?.value ?? "-"}
                      {type === "Blood Pressure" && <span className="text-sm font-normal text-muted-foreground"> mmHg</span>}
                      {type === "Blood Sugar" && <span className="text-sm font-normal text-muted-foreground"> mg/dL</span>}
                      {type === "Weight" && <span className="text-sm font-normal text-muted-foreground"> kg</span>}
                      {type === "Cholesterol" && <span className="text-sm font-normal text-muted-foreground"> mg/dL</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last recorded: {latest ? formatRecency(latest.date) : "-"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Metric History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Metric History</span>
                <Button variant="outline" size="sm" className="gap-1" disabled>
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
                    <TableHead>Export</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5}>Loading...</TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-red-500">
                        Error loading data
                      </TableCell>
                    </TableRow>
                  ) : (
                    metrics.map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell>{new Date(metric.date).toLocaleDateString()}</TableCell>
                        <TableCell>{metric.type}</TableCell>
                        <TableCell>{metric.value}</TableCell>
                        <TableCell>{metric.notes || "-"}</TableCell>
                        <TableCell>
                          <Button 
                            size="icon"
                            variant="ghost"
                            title="Export to PDF"
                            onClick={() => handleExportPdf(metric)}
                          >
                            <span className="sr-only">Export to PDF</span>
                            {/* @ts-ignore */}
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10v7m4-7v7m4-7v7M4 21h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2Z"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 4v4H6V4"/></svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {!loading && !error && metrics.length === 0 && (
                <div className="text-center text-muted-foreground mt-6">No health metrics found. Add your first entry!</div>
              )}
            </CardContent>
          </Card>
          
          {/* Metric Form Dialog */}
          {isFormOpen && (
            <MetricForm 
              metricTypes={metricTypes} 
              onClose={() => setIsFormOpen(false)}
              onMetricAdded={() => setRefreshKey(k => k + 1)}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Metrics;

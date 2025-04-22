import React, { useState, useEffect } from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MetricForm from "@/components/metrics/MetricForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ExportMetricsModal from "@/components/metrics/ExportMetricsModal";
import { Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDeleteHealthMetric } from "@/hooks/useDeleteHealthMetric";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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

interface HealthMetric {
  id: string;
  type: string;
  value: string;
  date: string;
  notes: string;
}

const Metrics = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteMetric = useDeleteHealthMetric();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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
          setMetrics(data.map(metric => {
            const displayDate = new Date(metric.date);
            displayDate.setDate(displayDate.getDate() + 1);
            
            return {
              id: metric.id,
              type: metric.type,
              value: metric.value,
              date: displayDate.toISOString().split('T')[0],
              notes: metric.notes
            };
          }));
        }
      } catch (e) {
        console.error("Exception fetching metrics:", e);
        setError("An error occurred connecting to the database");
      }

      setLoading(false);
    }

    fetchMetrics();
  }, [refreshKey]);

  function formatRecency(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff} days ago`;
  }

  const handleEdit = (metric: HealthMetric) => {
    setSelectedMetric(metric);
    setIsEditOpen(true);
  };

  const handleDelete = (metric: HealthMetric) => {
    setSelectedMetric(metric);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMetric) {
      deleteMetric.mutate(selectedMetric.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setRefreshKey(k => k + 1);
        }
      });
    }
  };

  const totalPages = Math.ceil(metrics.length / itemsPerPage);
  const paginatedMetrics = metrics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
            <div className="flex gap-2">
              <Button 
                className="gap-2" 
                variant="outline" 
                onClick={() => setIsExportOpen(true)}
              >
                Export
              </Button>
              <Button 
                className="gap-2" 
                onClick={() => setIsFormOpen(true)}
              >
                Log New Metric
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {/* REMOVED Metrics Overview Cards */}

          {/* Metric History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Metric History</CardTitle>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4}>Loading...</TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-red-500">
                        Error loading data
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMetrics.map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell>{new Date(metric.date).toLocaleDateString()}</TableCell>
                        <TableCell>{metric.type}</TableCell>
                        <TableCell>{metric.value}</TableCell>
                        <TableCell>{metric.notes || "-"}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(metric)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(metric)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {!loading && !error && metrics.length === 0 && (
                <div className="text-center text-muted-foreground mt-6">No health metrics found. Add your first entry!</div>
              )}
              {!loading && !error && metrics.length > 0 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            isActive={currentPage === page}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Metric Form Dialog */}
          {(isFormOpen || isEditOpen) && (
            <MetricForm 
              metricTypes={metricTypes} 
              onClose={() => {
                setIsFormOpen(false);
                setIsEditOpen(false);
                setSelectedMetric(null);
              }}
              onMetricAdded={() => setRefreshKey(k => k + 1)}
              initialData={isEditOpen ? selectedMetric : undefined}
              isEditing={isEditOpen}
            />
          )}

          {/* Export Metrics Modal */}
          {isExportOpen && (
            <ExportMetricsModal 
              metrics={metrics}
              open={isExportOpen}
              onClose={() => setIsExportOpen(false)}
            />
          )}

          {/* Delete Confirmation Dialog */}
          {isDeleteDialogOpen && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this health metric record.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={confirmDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </main>
      </div>
    </div>
  );
};

export default Metrics;


import React, { useState } from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Calendar, Search, Download, User, Filter, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReports, useDeleteReport } from "@/hooks/useReports";
import { useDoctors } from "@/hooks/useDoctors";
import { AddReportForm } from "@/components/forms/AddReportForm";
import { useToast } from "@/hooks/use-toast";

const reportTypes = ["All Types", "Lab Test", "Radiology", "Cardiology", "General", "Specialist"];

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const { data: reports = [], isLoading, refetch } = useReports();
  const { data: doctors = [] } = useDoctors();
  const [showReportForm, setShowReportForm] = useState(false);
  const { toast } = useToast();
  const deleteReport = useDeleteReport();

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.doctor?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.hospital.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === "All Types" || report.type === selectedType;

    return matchesSearch && matchesType;
  });

  // Function to download or view report file
  const handleDownloadFile = (fileUrl: string | null, reportTitle: string) => {
    if (!fileUrl) {
      toast({
        title: "No file available",
        description: "This report doesn't have an attached file",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Opening file URL:", fileUrl);
    // Open the file in a new tab
    window.open(fileUrl, "_blank");
  };

  // Function to delete a report
  const handleDeleteReport = (reportId: string, fileUrl: string | null) => {
    if (confirm("Are you sure you want to delete this report?")) {
      deleteReport.mutate({ id: reportId, fileUrl });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Medical Reports</h1>
              <p className="text-muted-foreground">
                Store and access your medical reports and test results
              </p>
            </div>
            <Button onClick={() => setShowReportForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Report
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reports..."
                className="w-full bg-background pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div>Loading...</div>
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <CardDescription>{report.type}</CardDescription>
                      </div>
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{report.date ? new Date(report.date).toLocaleDateString() : ""}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{report.doctor?.name || "Unknown Doctor"}</span>
                      </div>
                      <div className="text-sm text-muted-foreground ml-6">{report.hospital}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t p-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleDownloadFile(report.file_url, report.title)}
                      disabled={!report.file_url}
                    >
                      <Download className="h-4 w-4" />
                      {report.file_url ? "View Report" : "No File Available"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDeleteReport(report.id, report.file_url)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card className="border-dashed md:col-span-2 lg:col-span-3">
                <CardContent className="pt-6 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-3 text-lg font-medium">No reports found</h3>
                  <p className="mb-4 mt-1 text-sm text-muted-foreground">
                    {searchTerm || selectedType !== "All Types"
                      ? "Try adjusting your search or filters."
                      : "Upload medical reports to keep track of your test results."}
                  </p>
                  <Button onClick={() => setShowReportForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Add Report Form */}
          <AddReportForm open={showReportForm} onOpenChange={setShowReportForm} />
        </main>
      </div>
    </div>
  );
};

export default Reports;

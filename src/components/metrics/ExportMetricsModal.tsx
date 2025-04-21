import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Metric {
  id: string;
  type: string;
  value: string | number;
  date: string;
  notes?: string;
}

interface ExportMetricsModalProps {
  metrics: Metric[];
  open: boolean;
  onClose: () => void;
}

const metricUnits: Record<string, string> = {
  "Blood Pressure": "mmHg",
  "Blood Sugar": "mg/dL",
  "Weight": "kg",
  "Cholesterol": "mg/dL",
  "Hemoglobin": "g/dL",
  "Creatinine": "mg/dL",
  "Heart Rate": "bpm",
  "Oxygen Saturation": "%",
};

const getMetricTypes = (metrics: Metric[]) => {
  const types: string[] = [];
  metrics.forEach((m) => {
    if (m.type && !types.includes(m.type)) types.push(m.type);
  });
  return types;
};

const ExportMetricsModal: React.FC<ExportMetricsModalProps> = ({
  metrics,
  open,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>("");
  const { toast } = useToast();

  // All unique metric types
  const metricTypes = useMemo(() => getMetricTypes(metrics), [metrics]);

  // Filter metrics if a filterType is selected
  const filteredMetrics = useMemo(() => {
    if (!filterType || filterType === "all") return metrics;
    return metrics.filter((m) => m.type === filterType);
  }, [filterType, metrics]);

  const isSelected = (id: string) => selectedIds.includes(id);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredMetrics.map((m) => m.id);
    if (visibleIds.every((id) => selectedIds.includes(id))) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...visibleIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleExport = () => {
    const toExport = metrics.filter((m) => selectedIds.includes(m.id));
    if (toExport.length === 0) {
      toast({
        title: "No metrics selected",
        description: "Please select at least one metric to export.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Set the title
      doc.setFontSize(16);
      doc.text("Health Metric Records", 14, 22);
      
      // Create table header data
      const headers = [['Date', 'Metric Type', 'Value', 'Notes']];
      
      // Create table body data
      const data = toExport.map(metric => [
        new Date(metric.date).toLocaleDateString(),
        metric.type,
        `${metric.value} ${metricUnits[metric.type] || ""}`,
        metric.notes || "-"
      ]);
      
      // Generate the table
      autoTable(doc, {
        head: headers,
        body: data,
        startY: 30,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 40 }, // Date
          1: { cellWidth: 50 }, // Metric Type
          2: { cellWidth: 40, halign: 'right' }, // Value
          3: { cellWidth: 'auto' } // Notes
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
          overflow: 'linebreak'
        },
        margin: { top: 30 }
      });
      
      // Generate filename with current date
      const filename = `HealthMetrics_${new Date().toISOString().split("T")[0]}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      toast({
        title: "Success",
        description: `Exported ${toExport.length} metrics to PDF`,
      });
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export failed",
        description: "There was an error creating the PDF file.",
        variant: "destructive"
      });
    }
  };

  // Calculate if all visible items are selected
  const visibleSelectedIds = filteredMetrics
    .map((m) => m.id)
    .filter((id) => selectedIds.includes(id));
  const allVisibleSelected = filteredMetrics.length > 0 && visibleSelectedIds.length === filteredMetrics.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Health Metrics</DialogTitle>
          <DialogDescription>
            Select and export your health metrics to PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-2 flex items-center gap-3 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filter metrics by type:</span>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {metricTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mb-2 text-sm text-muted-foreground">
          Select which metrics to export below.
        </div>
        <div className="max-h-80 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={handleSelectAllVisible}
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMetrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No health metrics found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMetrics.map((metric) => (
                  <TableRow key={metric.id} className={isSelected(metric.id) ? "bg-accent" : ""}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={isSelected(metric.id)}
                        onChange={() => handleToggle(metric.id)}
                      />
                    </TableCell>
                    <TableCell>{new Date(metric.date).toLocaleDateString()}</TableCell>
                    <TableCell>{metric.type}</TableCell>
                    <TableCell>
                      {metric.value} {metricUnits[metric.type] || ""}
                    </TableCell>
                    <TableCell>{metric.notes || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={selectedIds.length === 0}>
            Export Selected
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportMetricsModal;

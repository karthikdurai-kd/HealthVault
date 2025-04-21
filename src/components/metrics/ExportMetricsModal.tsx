
import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import jsPDF from "jspdf";
import { Filter } from "lucide-react";

interface ExportMetricsModalProps {
  metrics: any[];
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

const getMetricTypes = (metrics: any[]) => {
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

  // All unique metric types
  const metricTypes = useMemo(() => getMetricTypes(metrics), [metrics]);

  // Filter metrics if a filterType is selected
  const filteredMetrics = useMemo(() => {
    if (!filterType) return metrics;
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
      alert("Please select at least one metric to export.");
      return;
    }
    
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Set the title
    doc.setFontSize(16);
    doc.text("Health Metric Records", 14, 22);
    
    // Initialize position
    const startY = 34;
    let y = startY;
    
    // Set normal font size for content
    doc.setFontSize(10);
    
    // Loop through selected metrics
    toExport.forEach((metric, i) => {
      if (i > 0) y += 12;
      doc.text(`Metric: ${metric.type}`, 14, y);
      y += 6;
      doc.text(
        `Date: ${new Date(metric.date).toLocaleDateString()}   Value: ${
          metric.value
        } ${metricUnits[metric.type] || ""}`,
        14,
        y
      );
      y += 6;
      if (metric.notes) {
        doc.text(`Notes: ${metric.notes}`, 14, y);
        y += 6;
      }
      // Add space between records
      y += 2;
      // Next page if required
      if (y > 270 && i < toExport.length - 1) {
        doc.addPage();
        y = 20;
      }
    });
    
    // Generate filename with current date
    const filename = `HealthMetrics_${new Date().toISOString().split("T")[0]}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
    // Close the modal
    onClose();
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
            <FormControl>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value={""}>All</SelectItem>
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

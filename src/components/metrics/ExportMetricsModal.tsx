
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

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

const ExportMetricsModal: React.FC<ExportMetricsModalProps> = ({
  metrics,
  open,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isSelected = (id: string) => selectedIds.includes(id);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === metrics.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(metrics.map((m) => m.id));
    }
  };

  const handleExport = () => {
    const toExport = metrics.filter((m) => selectedIds.includes(m.id));
    if (toExport.length === 0) {
      alert("Please select at least one metric to export.");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Health Metric Records", 14, 22);
    const startY = 34;
    let y = startY;
    doc.setFontSize(10);
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
    doc.save(`HealthMetrics_${new Date().toISOString().split("T")[0]}.pdf`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Health Metrics</DialogTitle>
        </DialogHeader>
        <div className="mb-2 text-sm text-muted-foreground">
          Select which metrics you want to export.
        </div>
        <div className="max-h-80 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === metrics.length && metrics.length > 0}
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No health metrics found.
                  </TableCell>
                </TableRow>
              ) : (
                metrics.map((metric) => (
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

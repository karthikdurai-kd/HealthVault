
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MetricTypeSelectProps {
  metricType: string;
  setMetricType: (v: string) => void;
  metricTypes: string[];
}

const MetricTypeSelect: React.FC<MetricTypeSelectProps> = ({ metricType, setMetricType, metricTypes }) => (
  <div className="grid grid-cols-4 items-center gap-4">
    <Label htmlFor="metric-type" className="text-right">
      Metric
    </Label>
    <div className="col-span-3">
      <Select value={metricType} onValueChange={setMetricType} required>
        <SelectTrigger id="metric-type">
          <SelectValue placeholder="Select metric type" />
        </SelectTrigger>
        <SelectContent>
          {metricTypes.map(type => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default MetricTypeSelect;

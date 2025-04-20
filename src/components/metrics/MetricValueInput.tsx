
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MetricValueInputProps {
  value: string;
  setValue: (v: string) => void;
}

const MetricValueInput: React.FC<MetricValueInputProps> = ({ value, setValue }) => (
  <div className="grid grid-cols-4 items-center gap-4">
    <Label htmlFor="value" className="text-right">
      Value
    </Label>
    <Input
      id="value"
      required
      placeholder="e.g., 120/80, 98 mg/dL"
      className="col-span-3"
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  </div>
);

export default MetricValueInput;

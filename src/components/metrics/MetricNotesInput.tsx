
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MetricNotesInputProps {
  notes: string;
  setNotes: (v: string) => void;
}

const MetricNotesInput: React.FC<MetricNotesInputProps> = ({ notes, setNotes }) => (
  <div className="grid grid-cols-4 items-center gap-4">
    <Label htmlFor="notes" className="text-right">
      Notes
    </Label>
    <Textarea
      id="notes"
      placeholder="Optional notes about this reading"
      className="col-span-3"
      value={notes}
      onChange={e => setNotes(e.target.value)}
    />
  </div>
);

export default MetricNotesInput;

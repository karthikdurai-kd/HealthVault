import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MetricDatePickerProps {
  date: Date;
  setDate: (d: Date) => void;
}

const MetricDatePicker: React.FC<MetricDatePickerProps> = ({ date, setDate }) => {
  const displayDate = date instanceof Date && !isNaN(date.getTime()) 
    ? date 
    : new Date();

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="date" className="text-right">
        Date
      </Label>
      <div className="col-span-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal")}
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(displayDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={displayDate}
              onSelect={(newDate) => {
                if (newDate) {
                  const safeDate = new Date(newDate);
                  safeDate.setHours(12, 0, 0, 0);
                  setDate(safeDate);
                }
              }}
              initialFocus
              toDate={new Date()}
              className="p-3"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default MetricDatePicker;

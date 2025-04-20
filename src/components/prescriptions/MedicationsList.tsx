
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill } from "lucide-react";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  lastTaken: string;
}

interface MedicationsListProps {
  medications: Medication[];
}

const MedicationsList = ({ medications }: MedicationsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Medications</CardTitle>
        <CardDescription>
          Your prescribed medications and schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medications.map((medication, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 rounded-lg border p-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-health-blue-100">
                <Pill className="h-5 w-5 text-health-blue-700" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium leading-none">
                  {medication.name} ({medication.dosage})
                </p>
                <p className="text-sm text-muted-foreground">
                  {medication.frequency} • {medication.time}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Last taken: {medication.lastTaken}
              </div>
            </div>
          ))}
          
          {medications.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No active medications
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationsList;

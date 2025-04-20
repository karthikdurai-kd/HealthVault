
import { Pill } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const medications = [
  {
    id: 1,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    time: "Morning",
    lastTaken: "Today"
  },
  {
    id: 2,
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    time: "Morning and Evening",
    lastTaken: "Today"
  },
  {
    id: 3,
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily",
    time: "Evening",
    lastTaken: "Yesterday"
  },
];

const RecentMedications = () => {
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
          {medications.map((medication) => (
            <div
              key={medication.id}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentMedications;

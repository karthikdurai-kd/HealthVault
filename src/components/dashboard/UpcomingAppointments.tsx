
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const appointments = [
  {
    id: 1,
    doctor: "Dr. Smith",
    specialty: "Cardiologist",
    date: "Mon, May 10",
    time: "10:00 AM",
    status: "confirmed",
  },
  {
    id: 2,
    doctor: "Dr. Johnson",
    specialty: "Endocrinologist",
    date: "Thu, May 20",
    time: "2:30 PM",
    status: "pending",
  },
  {
    id: 3,
    doctor: "Dr. Williams",
    specialty: "Nephrologist",
    date: "Tue, Jun 5",
    time: "9:15 AM",
    status: "confirmed",
  },
];

const UpcomingAppointments = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>
          You have {appointments.length} upcoming doctor appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-health-blue-100">
                  <CalendarIcon className="h-5 w-5 text-health-blue-700" />
                </div>
                <div>
                  <p className="font-medium">{appointment.doctor}</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.specialty}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{appointment.date}</span>
                    <span>•</span>
                    <span>{appointment.time}</span>
                  </div>
                </div>
              </div>
              <div>
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    appointment.status === "confirmed"
                      ? "bg-health-green-100 text-health-green-700"
                      : "bg-health-blue-100 text-health-blue-700"
                  }`}
                >
                  {appointment.status === "confirmed" ? "Confirmed" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Schedule New Appointment</Button>
      </CardFooter>
    </Card>
  );
};

export default UpcomingAppointments;


import React from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, User, Clock, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample appointments data
const appointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    hospital: "City Heart Hospital",
    date: "2025-05-20",
    time: "10:00 AM",
    status: "upcoming"
  },
  {
    id: 2,
    doctor: "Dr. Emily Rodriguez",
    specialty: "Neurologist",
    hospital: "Brain & Spine Center",
    date: "2025-06-12",
    time: "2:30 PM",
    status: "upcoming"
  },
  {
    id: 3,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    hospital: "City Heart Hospital",
    date: "2025-03-15",
    time: "9:30 AM",
    status: "past"
  },
  {
    id: 4,
    doctor: "Dr. Michael Chen",
    specialty: "Endocrinologist",
    hospital: "Metro Diabetes Clinic",
    date: "2025-02-08",
    time: "11:15 AM",
    status: "past"
  },
  {
    id: 5,
    doctor: "Dr. Emily Rodriguez",
    specialty: "Neurologist",
    hospital: "Brain & Spine Center",
    date: "2025-04-02",
    time: "3:45 PM",
    status: "past"
  }
];

const Appointments = () => {
  const upcomingAppointments = appointments.filter(apt => apt.status === "upcoming");
  const pastAppointments = appointments.filter(apt => apt.status === "past");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
              <p className="text-muted-foreground">
                Schedule and manage your doctor visits
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Appointment
            </Button>
          </div>
          
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id} className="border-l-4 border-l-health-blue-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{appointment.doctor}</CardTitle>
                      <CardDescription>{appointment.specialty}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.hospital}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">Reschedule</Button>
                        <Button variant="outline" size="sm" className="flex-1">Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {upcomingAppointments.length === 0 && (
                  <Card className="col-span-full border-dashed">
                    <CardContent className="pt-6 text-center">
                      <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
                      <h3 className="mt-3 text-lg font-medium">No upcoming appointments</h3>
                      <p className="mb-4 mt-1 text-sm text-muted-foreground">
                        Schedule a new appointment with your doctor.
                      </p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule Appointment
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="past" className="space-y-4">
              <div className="rounded-lg border">
                {pastAppointments.map((appointment, index) => (
                  <div key={appointment.id} className={`p-4 ${index !== pastAppointments.length - 1 ? 'border-b' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-medium">{appointment.doctor}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                        <p className="text-sm text-muted-foreground mt-1">{appointment.hospital}</p>
                      </div>
                      <div className="mt-3 flex items-center gap-4 sm:mt-0">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{new Date(appointment.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {pastAppointments.length === 0 && (
                  <div className="p-6 text-center">
                    <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-3 text-lg font-medium">No past appointments</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your appointment history will appear here.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Appointments;

import React, { useState } from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, User, Clock, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppointments } from "@/hooks/useAppointments";
import { useDoctors } from "@/hooks/useDoctors";
import { ScheduleAppointmentForm } from "@/components/forms/ScheduleAppointmentForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Appointments = () => {
  const { data: appointments = [], isLoading, refetch } = useAppointments();
  const { data: doctors = [] } = useDoctors();
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const { toast } = useToast();

  const upcomingAppointments = appointments.filter(apt => apt.status === "upcoming");
  const pastAppointments = appointments.filter(apt => apt.status === "past");

  // Function to format date with timezone handling
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    
    try {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      // Format the date as Month Day, Year
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  async function handleCancel(id: string) {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "past" })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Could not cancel appointment.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been cancelled.",
      });
      refetch();
    }
  }

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
            <Button className="gap-2" onClick={() => setShowAppointmentForm(true)}>
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
                {isLoading ? (
                  <div>Loading...</div>
                ) : upcomingAppointments.map((appointment) => {
                    return (
                      <Card key={appointment.id} className="border-l-4 border-l-health-blue-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{appointment.doctor.name}</CardTitle>
                          <CardDescription>{appointment.doctor.specialty}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{appointment.doctor.hospital}</span>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            {/* Only show Cancel button */}
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleCancel(appointment.id)}>Cancel</Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                {upcomingAppointments.length === 0 && !isLoading && (
                  <Card className="col-span-full border-dashed">
                    <CardContent className="pt-6 text-center">
                      <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
                      <h3 className="mt-3 text-lg font-medium">No upcoming appointments</h3>
                      <p className="mb-4 mt-1 text-sm text-muted-foreground">
                        Schedule a new appointment with your doctor.
                      </p>
                      <Button onClick={() => setShowAppointmentForm(true)}>
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
                {isLoading ? (
                  <div>Loading...</div>
                ) : pastAppointments.map((appointment, index) => {
                    return (
                      <div key={appointment.id} className={`p-4 ${index !== pastAppointments.length - 1 ? 'border-b' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="font-medium">{appointment.doctor.name}</h3>
                            <p className="text-sm text-muted-foreground">{appointment.doctor.specialty}</p>
                            <p className="text-sm text-muted-foreground mt-1">{appointment.doctor.hospital}</p>
                          </div>
                          <div className="mt-3 flex items-center gap-4 sm:mt-0">
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{formatDate(appointment.date)}</span>
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
                    );
                  })}
                {pastAppointments.length === 0 && !isLoading && (
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
          
          <ScheduleAppointmentForm 
            open={showAppointmentForm} 
            onOpenChange={setShowAppointmentForm} 
          />
        </main>
      </div>
    </div>
  );
};

export default Appointments;

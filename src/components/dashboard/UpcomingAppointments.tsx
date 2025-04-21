
import React, { useState, useEffect } from "react";
import { CalendarIcon, CalendarX, Clock, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppointments } from "@/hooks/useAppointments";
import { useDoctors } from "@/hooks/useDoctors";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const UpcomingAppointments = () => {
  const { data: appointments = [], isLoading, refetch } = useAppointments();
  const { toast } = useToast();
  const upcoming = appointments.filter(a => a.status === "upcoming");

  // Cancel appointment handler
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
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>
          {isLoading 
            ? "Loading..." 
            : `You have ${upcoming.length} upcoming appointment${upcoming.length !== 1 ? "s" : ""}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading && (
            <div className="text-muted-foreground text-center py-6">Loading...</div>
          )}
          {upcoming.length === 0 && !isLoading && (
            <div className="text-muted-foreground text-center py-6">
              <CalendarX className="mx-auto mb-2 h-8 w-8" />
              No upcoming appointments
            </div>
          )}
          {upcoming.map((apt) => (
            <div key={apt.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-health-blue-100">
                  <CalendarIcon className="h-5 w-5 text-health-blue-700" />
                </div>
                <div>
                  <p className="font-medium">{apt.doctor?.name ?? "Doctor"}</p>
                  <p className="text-sm text-muted-foreground">{apt.doctor?.specialty}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {apt.date ? new Date(apt.date).toLocaleDateString() : "-"}
                    </span>
                    <span>•</span>
                    <span>{apt.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{apt.doctor?.hospital}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className="inline-block rounded-full px-2 py-1 text-xs font-medium bg-health-blue-100 text-health-blue-700">
                  Upcoming
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-1 px-2 py-1"
                  onClick={() => handleCancel(apt.id)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingAppointments;

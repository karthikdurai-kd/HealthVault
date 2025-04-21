import React, { useState, useEffect } from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Phone, MapPin, Calendar, User, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import DoctorCard from "@/components/doctors/DoctorCard";
import { useDoctors } from "@/hooks/useDoctors";
import { AddDoctorForm } from "@/components/forms/AddDoctorForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/useAppointments";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 6;

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data = [], isLoading, refetch } = useDoctors();
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments();
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredDoctors = data.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
  
  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  // Reset to last page when total pages change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Filter upcoming appointments
  const upcomingAppointments = appointments.filter(
    appointment => appointment.status === "upcoming"
  );

  // Function to format date properly with timezone handling
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    
    try {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      
      const date = new Date(year, month - 1, day);
      
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

  async function handleDeleteDoctor(id: string) {
    setDeletingId(id);
    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      setDeletingId(null);
      return;
    }

    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (!error) {
      toast({
        title: "Success",
        description: "Doctor deleted.",
      });
      
      // Check if this was the last item on the current page
      if (paginatedDoctors.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      refetch?.();
    } else {
      toast({
        title: "Error",
        description: "Failed to delete doctor.",
        variant: "destructive",
      });
    }
    setDeletingId(null);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Doctors & Visits</h1>
              <p className="text-muted-foreground">
                Manage your healthcare providers and appointments
              </p>
            </div>
            <Button className="gap-2" onClick={() => setShowDoctorForm(true)}>
              <Plus className="h-4 w-4" />
              Add New Doctor
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search doctors, specialties, or hospitals..."
              className="w-full bg-background pl-8 md:w-1/2 lg:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Doctors List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div>Loading...</div>
            ) : paginatedDoctors.map(doctor => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onDelete={handleDeleteDoctor}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {filteredDoctors.length > ITEMS_PER_PAGE && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          isActive={currentPage === pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          
          {/* Empty State */}
          {filteredDoctors.length === 0 && !isLoading && (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <User className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 text-lg font-medium">No doctors found</h3>
                <p className="mb-4 mt-1 text-sm text-muted-foreground">
                  Try adjusting your search or add a new doctor.
                </p>
                <Button onClick={() => setShowDoctorForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Doctor
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Upcoming Appointments Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>
                {appointmentsLoading 
                  ? "Loading..." 
                  : `You have ${upcomingAppointments.length} upcoming appointment${upcomingAppointments.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointmentsLoading ? (
                  <div className="text-muted-foreground text-center py-4">Loading...</div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No upcoming appointments scheduled
                  </div>
                ) : (
                  upcomingAppointments.map(appointment => (
                    <div key={appointment.id} className="flex items-center space-x-4 rounded-lg border p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-health-blue-100">
                        <Calendar className="h-5 w-5 text-health-blue-700" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium leading-none">{appointment.doctor?.name || "Doctor"}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.doctor?.specialty} • {appointment.doctor?.hospital}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(appointment.date)} • {appointment.time}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Add Doctor Form */}
          <AddDoctorForm 
            open={showDoctorForm} 
            onOpenChange={setShowDoctorForm} 
          />
        </main>
      </div>
    </div>
  );
};

export default Doctors;

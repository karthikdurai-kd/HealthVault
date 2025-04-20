
import React from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Calendar, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MedicationsList from "@/components/prescriptions/MedicationsList";

// Sample prescription data
const prescriptions = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    date: "2025-03-15",
    expiryDate: "2025-09-15",
    hasFile: true,
    medications: [
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "3 months" },
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "3 months" }
    ]
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    date: "2025-02-08",
    expiryDate: "2025-05-08",
    hasFile: true,
    medications: [
      { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", duration: "3 months" }
    ]
  },
  {
    id: 3,
    doctor: "Dr. Emily Rodriguez",
    date: "2025-04-02",
    expiryDate: "2025-07-02",
    hasFile: false,
    medications: [
      { name: "Sertraline", dosage: "50mg", frequency: "Once daily", duration: "1 month" },
      { name: "Loratadine", dosage: "10mg", frequency: "As needed", duration: "2 weeks" }
    ]
  }
];

// Active medications across all prescriptions
const activeMedications = [
  { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", time: "Morning", lastTaken: "Today" },
  { name: "Metformin", dosage: "500mg", frequency: "Twice daily", time: "Morning and Evening", lastTaken: "Today" },
  { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", time: "Evening", lastTaken: "Yesterday" },
  { name: "Sertraline", dosage: "50mg", frequency: "Once daily", time: "Morning", lastTaken: "Today" }
];

const Prescriptions = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Prescriptions</h1>
              <p className="text-muted-foreground">
                Manage your prescriptions and medications
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Prescription
            </Button>
          </div>
          
          <Tabs defaultValue="medications">
            <TabsList>
              <TabsTrigger value="medications">Current Medications</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescription History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="medications" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search medications..."
                  className="w-full bg-background pl-8 md:w-1/2 lg:w-1/3"
                />
              </div>
              
              <MedicationsList medications={activeMedications} />
            </TabsContent>
            
            <TabsContent value="prescriptions" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search prescriptions..."
                  className="w-full bg-background pl-8 md:w-1/2 lg:w-1/3"
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {prescriptions.map((prescription) => (
                  <Card key={prescription.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-base">
                        <span>Prescription #{prescription.id}</span>
                        {prescription.hasFile && (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {prescription.doctor}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Issued: {new Date(prescription.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Valid until: {new Date(prescription.expiryDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-sm font-medium">Medications:</p>
                          <ul className="mt-1 space-y-1">
                            {prescription.medications.map((med, idx) => (
                              <li key={idx} className="text-sm">
                                {med.name} ({med.dosage}) - {med.frequency}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {prescriptions.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-3 text-lg font-medium">No prescriptions found</h3>
                    <p className="mb-4 mt-1 text-sm text-muted-foreground">
                      Add your prescriptions to keep track of your medications.
                    </p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Prescription
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Prescriptions;

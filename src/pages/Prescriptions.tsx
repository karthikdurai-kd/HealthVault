
import React, { useState } from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Calendar, Search, User, Download, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MedicationsList from "@/components/prescriptions/MedicationsList";
import { usePrescriptions, useDeletePrescription } from "@/hooks/usePrescriptions";
import { useMedications } from "@/hooks/useMedications";
import { AddPrescriptionForm } from "@/components/forms/AddPrescriptionForm";
import { AddMedicationForm } from "@/components/forms/AddMedicationForm";
import { useToast } from "@/hooks/use-toast";

const Prescriptions = () => {
  const { data: prescriptions = [], isLoading } = usePrescriptions();
  const { data: allMedications = [], isLoading: medicationsLoading } = useMedications();
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const deletePrescription = useDeletePrescription();

  // Active medications
  const activeMedications = allMedications
    .filter(med => !medicationsLoading)
    .map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      time: m.time,
    }));

  const filteredMedications = activeMedications.filter(
    (med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.dosage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const doctorName = prescription.doctor?.name || "";

    return (
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Function to download or view prescription file
  const handleDownloadFile = (fileUrl: string | null) => {
    if (!fileUrl) {
      toast({
        title: "No file available",
        description: "This prescription doesn't have an attached file",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Opening file URL:", fileUrl);
    window.open(fileUrl, "_blank");
  };

  // Function to delete a prescription
  const handleDeletePrescription = (prescriptionId: string, fileUrl: string | null) => {
    if (confirm("Are you sure you want to delete this prescription?")) {
      deletePrescription.mutate({ id: prescriptionId, fileUrl });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 space-y-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Prescriptions</h1>
              <p className="text-muted-foreground">Manage your prescriptions and medications</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setShowMedicationForm(true)}>
                <Plus className="h-4 w-4" />
                Add Medication
              </Button>
              <Button className="gap-2" onClick={() => setShowPrescriptionForm(true)}>
                <Plus className="h-4 w-4" />
                Add Prescription
              </Button>
            </div>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {medicationsLoading ? (
                <div className="py-4 text-center">Loading medications...</div>
              ) : (
                <MedicationsList medications={filteredMedications} />
              )}
            </TabsContent>

            <TabsContent value="prescriptions" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search prescriptions..."
                  className="w-full bg-background pl-8 md:w-1/2 lg:w-1/3"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                  <div>Loading...</div>
                ) : filteredPrescriptions.map((prescription) => (
                    <Card key={prescription.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-base">
                          <span>Prescription #{prescription.id.slice(0, 8)}</span>
                        </CardTitle>
                        <CardDescription>{prescription.doctor?.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Issued:{" "}
                              {prescription.date ? new Date(prescription.date).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Valid until:{" "}
                              {prescription.expiry_date
                                ? new Date(prescription.expiry_date).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t p-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => handleDownloadFile(prescription.file_url)}
                          disabled={!prescription.has_file || !prescription.file_url}
                        >
                          <Download className="h-4 w-4" />
                          {prescription.has_file && prescription.file_url ? "View Prescription" : "No File Available"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleDeletePrescription(prescription.id, prescription.file_url)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>

              {filteredPrescriptions.length === 0 && !isLoading && (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    {searchTerm ? (
                      <>
                        <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                        <h3 className="mt-3 text-lg font-medium">No prescriptions found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search criteria.</p>
                      </>
                    ) : (
                      <>
                        <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                        <h3 className="mt-3 text-lg font-medium">No prescriptions found</h3>
                        <p className="mb-4 mt-1 text-sm text-muted-foreground">
                          Add your prescriptions to keep track of your medications.
                        </p>
                        <Button onClick={() => setShowPrescriptionForm(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Prescription
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Forms */}
          <AddPrescriptionForm open={showPrescriptionForm} onOpenChange={setShowPrescriptionForm} />
          <AddMedicationForm open={showMedicationForm} onOpenChange={setShowMedicationForm} />
        </main>
      </div>
    </div>
  );
};

export default Prescriptions;


import React, { useState } from 'react';
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Calendar, Search, User, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MedicationsList from "@/components/prescriptions/MedicationsList";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { useMedications } from "@/hooks/useMedications";
import { AddPrescriptionForm } from "@/components/forms/AddPrescriptionForm";
import { AddMedicationForm } from "@/components/forms/AddMedicationForm";

const Prescriptions = () => {
  const { data: prescriptions = [], isLoading } = usePrescriptions();
  const { data: allMedications = [] } = useMedications();
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const activeMedications = allMedications
    .filter(
      (m) =>
        m.last_taken &&
        (m.last_taken.toLowerCase() === "today" || m.last_taken.toLowerCase() === "yesterday")
    )
    .map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      time: m.time,
      lastTaken: m.last_taken,
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
    if (!fileUrl) return;
    // Open the file url in a new tab (view or download depending on browser settings)
    window.open(fileUrl, "_blank");
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

              <MedicationsList medications={filteredMedications} />

              {filteredMedications.length === 0 && !searchTerm && (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No active medications
                  </CardContent>
                </Card>
              )}

              {filteredMedications.length === 0 && searchTerm && (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No medications found
                  </CardContent>
                </Card>
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
                          {prescription.has_file && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDownloadFile(prescription.file_url)}
                              aria-label="View prescription file"
                              title="View prescription file"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
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
                          <div className="pt-2">
                            <p className="text-sm font-medium">Medications:</p>
                            <ul className="mt-1 space-y-1">
                              {(prescription.prescription_medications || []).map((pm, idx) =>
                                pm.medication ? (
                                  <li key={idx} className="text-sm">
                                    {pm.medication.name} ({pm.medication.dosage}) - {pm.medication.frequency}
                                  </li>
                                ) : null
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {filteredPrescriptions.length === 0 && !searchTerm && (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-3 text-lg font-medium">No prescriptions found</h3>
                    <p className="mb-4 mt-1 text-sm text-muted-foreground">
                      Add your prescriptions to keep track of your medications.
                    </p>
                    <Button onClick={() => setShowPrescriptionForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Prescription
                    </Button>
                  </CardContent>
                </Card>
              )}

              {filteredPrescriptions.length === 0 && searchTerm && (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-3 text-lg font-medium">No prescriptions found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search criteria.</p>
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


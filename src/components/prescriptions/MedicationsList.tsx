import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Edit, Trash2, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditMedicationForm } from "@/components/forms/EditMedicationForm";
import { useDeleteMedication } from "@/hooks/useDeleteMedication";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AddMedicationForm } from "@/components/forms/AddMedicationForm";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
}

interface MedicationsListProps {
  medications: Medication[];
}

const ITEMS_PER_PAGE = 5;

const MedicationsList = ({ medications }: MedicationsListProps) => {
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingMedication, setDeletingMedication] = useState<Medication | null>(null);
  const deleteMedication = useDeleteMedication();
  const [showAddMedicationForm, setShowAddMedicationForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(medications.length / ITEMS_PER_PAGE);
  
  // Ensure current page is valid when total pages change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMedications = medications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleEdit = (medicationId: string) => {
    setEditingMedicationId(medicationId);
    setShowEditForm(true);
  };

  const handleDelete = (medication: Medication) => {
    setDeletingMedication(medication);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deletingMedication) {
      deleteMedication.mutate(deletingMedication.id, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setDeletingMedication(null);
          
          // Check if this was the last item on the current page
          if (paginatedMedications.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        }
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
        { medications.length > 0 && (
            <>
            <CardTitle>Medications</CardTitle>
            <CardDescription>
              Your prescribed medications and schedule
            </CardDescription>
            </>
        )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medications.length > 0 ? (
              <>
                {paginatedMedications.map((medication) => (
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
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(medication.id)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(medication)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Pagination */}
                {medications.length > ITEMS_PER_PAGE && (
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
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 text-lg font-medium">No active medications</h3>
                <p className="mb-4 mt-1 text-sm text-muted-foreground">
                  Add your medications to keep track of your prescriptions.
                </p>
                <Button onClick={() => setShowAddMedicationForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                  Add Medication
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Medication Form */}
      <EditMedicationForm 
        open={showEditForm} 
        onOpenChange={setShowEditForm}
        medicationId={editingMedicationId}
      />

      {/* Add Medication Form */}
      <AddMedicationForm 
        open={showAddMedicationForm} 
        onOpenChange={setShowAddMedicationForm}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {deletingMedication?.name} from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMedication.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MedicationsList;

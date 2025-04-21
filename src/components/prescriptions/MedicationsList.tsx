
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditMedicationForm } from "@/components/forms/EditMedicationForm";
import { useDeleteMedication } from "@/hooks/useDeleteMedication";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

const MedicationsList = ({ medications }: MedicationsListProps) => {
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingMedicationId, setDeletingMedicationId] = useState<string | null>(null);
  const deleteMedication = useDeleteMedication();

  const handleEdit = (medicationId: string) => {
    setEditingMedicationId(medicationId);
    setShowEditForm(true);
  };

  const handleDelete = (medicationId: string) => {
    setDeletingMedicationId(medicationId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deletingMedicationId) {
      deleteMedication.mutate(deletingMedicationId, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setDeletingMedicationId(null);
        }
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Medications</CardTitle>
          <CardDescription>
            Your prescribed medications and schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medications.length > 0 ? (
              medications.map((medication) => (
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
                      onClick={() => handleDelete(medication.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No active medications
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medication from your records.
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

import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Calendar, User, Trash2 } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  address: string;
  phone: string;
  lastVisit: string | null;
  nextAppointment: string | null;
}

interface DoctorCardProps {
  doctor: Doctor;
  onDelete?: (id: string, name: string) => void;
}

const DoctorCard = ({ doctor, onDelete }: DoctorCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-health-blue-700 p-4 text-white">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">{doctor.name}</h3>
              <p className="text-sm text-white/80">{doctor.specialty}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{doctor.hospital}</p>
              <p className="text-xs text-muted-foreground">{doctor.address}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">{doctor.phone}</p>
          </div>
          
          {doctor.nextAppointment && (
            <div className="flex items-center gap-2 text-health-blue-700">
              <Calendar className="h-4 w-4" />
              <p className="text-sm font-medium">Next: {doctor.nextAppointment}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 border-t bg-muted/30 p-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onDelete && onDelete(doctor.id, doctor.name)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;

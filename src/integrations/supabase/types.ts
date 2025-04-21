export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          date: string
          doctor_id: string
          id: string
          status: string
          time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          doctor_id: string
          id?: string
          status: string
          time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          doctor_id?: string
          id?: string
          status?: string
          time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          address: string
          created_at: string
          hospital: string
          id: string
          last_visit: string | null
          name: string
          next_appointment: string | null
          phone: string
          specialty: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          hospital: string
          id?: string
          last_visit?: string | null
          name: string
          next_appointment?: string | null
          phone: string
          specialty: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          hospital?: string
          id?: string
          last_visit?: string | null
          name?: string
          next_appointment?: string | null
          phone?: string
          specialty?: string
          updated_at?: string
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          type: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          type: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          type?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          frequency: string
          id: string
          last_taken: string | null
          name: string
          time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage: string
          frequency: string
          id?: string
          last_taken?: string | null
          name: string
          time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string
          frequency?: string
          id?: string
          last_taken?: string | null
          name?: string
          time?: string
          updated_at?: string
        }
        Relationships: []
      }
      prescription_medications: {
        Row: {
          created_at: string
          duration: string
          id: string
          medication_id: string
          prescription_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration: string
          id?: string
          medication_id: string
          prescription_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: string
          id?: string
          medication_id?: string
          prescription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescription_medications_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_medications_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          date: string
          doctor_id: string
          expiry_date: string
          has_file: boolean
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          doctor_id: string
          expiry_date: string
          has_file?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          doctor_id?: string
          expiry_date?: string
          has_file?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          date: string
          doctor_id: string
          has_file: boolean
          hospital: string
          id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          doctor_id: string
          has_file?: boolean
          hospital: string
          id?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          doctor_id?: string
          has_file?: boolean
          hospital?: string
          id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

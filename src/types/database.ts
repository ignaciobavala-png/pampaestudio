export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          cancelled_at: string | null
          created_at: string
          date: string
          id: string
          payment_status: string
          price: number | null
          status: string
          template_id: string
          user_id: string
          user_pack_id: string | null
          waitlist_position: number | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          date: string
          id?: string
          payment_status?: string
          price?: number | null
          status?: string
          template_id: string
          user_id: string
          user_pack_id?: string | null
          waitlist_position?: number | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          date?: string
          id?: string
          payment_status?: string
          price?: number | null
          status?: string
          template_id?: string
          user_id?: string
          user_pack_id?: string | null
          waitlist_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "class_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_templates: {
        Row: {
          class_type_id: string
          created_at: string
          created_by: string | null
          day_of_week: number
          description: string | null
          discipline: string
          id: string
          is_active: boolean
          is_standalone: boolean
          max_capacity: number
          name: string
          price: number | null
          recurrence: string
          room_id: string
          specific_date: string | null
          teacher_id: string
          time_end: string
          time_start: string
        }
        Insert: {
          class_type_id: string
          created_at?: string
          created_by?: string | null
          day_of_week: number
          description?: string | null
          discipline?: string
          id?: string
          is_active?: boolean
          is_standalone?: boolean
          max_capacity: number
          name: string
          price?: number | null
          recurrence?: string
          room_id: string
          specific_date?: string | null
          teacher_id: string
          time_end: string
          time_start: string
        }
        Update: {
          class_type_id?: string
          created_at?: string
          created_by?: string | null
          day_of_week?: number
          description?: string | null
          discipline?: string
          id?: string
          is_active?: boolean
          is_standalone?: boolean
          max_capacity?: number
          name?: string
          price?: number | null
          recurrence?: string
          room_id?: string
          specific_date?: string | null
          teacher_id?: string
          time_end?: string
          time_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_templates_class_type_id_fkey"
            columns: ["class_type_id"]
            isOneToOne: false
            referencedRelation: "class_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_templates_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_templates_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      class_types: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pack_class_types: {
        Row: {
          class_type_id: string
          pack_id: string
        }
        Insert: {
          class_type_id: string
          pack_id: string
        }
        Update: {
          class_type_id?: string
          pack_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pack_class_types_class_type_id_fkey"
            columns: ["class_type_id"]
            isOneToOne: false
            referencedRelation: "class_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pack_class_types_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
      }
      packs: {
        Row: {
          created_at: string
          credits: number
          description: string
          duration_days: number | null
          eyebrow: string
          features: Json
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          period: string
          price: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          credits: number
          description?: string
          duration_days?: number | null
          eyebrow?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          period: string
          price: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          credits?: number
          description?: string
          duration_days?: number | null
          eyebrow?: string
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          period?: string
          price?: number
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          experience_level: string | null
          full_name: string
          id: string
          is_approved: boolean
          medical_notes: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          experience_level?: string | null
          full_name?: string
          id: string
          is_approved?: boolean
          medical_notes?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          experience_level?: string | null
          full_name?: string
          id?: string
          is_approved?: boolean
          medical_notes?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      teachers: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          sort_order: number
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      user_packs: {
        Row: {
          assigned_by: string | null
          created_at: string
          credits_remaining: number
          expires_at: string | null
          frozen_at: string | null
          id: string
          pack_id: string
          starts_at: string
          status: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          credits_remaining: number
          expires_at?: string | null
          frozen_at?: string | null
          id?: string
          pack_id: string
          starts_at?: string
          status?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          credits_remaining?: number
          expires_at?: string | null
          frozen_at?: string | null
          id?: string
          pack_id?: string
          starts_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_packs_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_packs_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_packs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_book_spot: {
        Args: { p_date: string; p_template_id: string; p_user_id: string }
        Returns: Json
      }
      admin_cancel_class: {
        Args: { p_date: string; p_template_id: string }
        Returns: Json
      }
      admin_reschedule_booking: {
        Args: {
          p_booking_id: string
          p_new_date: string
          p_new_template_id: string
        }
        Returns: Json
      }
      book_recurring: {
        Args: { p_start_date: string; p_template_id: string; p_weeks: number }
        Returns: Json
      }
      book_spot: {
        Args: { p_date: string; p_template_id: string }
        Returns: Json
      }
      cancel_booking: { Args: { p_booking_id: string }; Returns: Json }
      class_is_standalone: { Args: { p_template_id: string }; Returns: boolean }
      count_confirmed: {
        Args: { p_date: string; p_template_id: string }
        Returns: number
      }
      get_next_waitlist_position: {
        Args: { p_date: string; p_template_id: string }
        Returns: number
      }
      is_admin: { Args: never; Returns: boolean }
      is_class_full: {
        Args: { p_date: string; p_template_id: string }
        Returns: boolean
      }
      run_pack_alerts: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

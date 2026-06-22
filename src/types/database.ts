export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          status: string
          template_id: string
          user_id: string
          waitlist_position: number | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          date: string
          id?: string
          status?: string
          template_id: string
          user_id: string
          waitlist_position?: number | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          date?: string
          id?: string
          status?: string
          template_id?: string
          user_id?: string
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
          created_at: string
          created_by: string | null
          day_of_week: number
          description: string | null
          discipline: string
          id: string
          is_active: boolean
          max_capacity: number
          name: string
          room: string
          teacher: string
          time_end: string
          time_start: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          day_of_week: number
          description?: string | null
          discipline: string
          id?: string
          is_active?: boolean
          max_capacity: number
          name: string
          room: string
          teacher: string
          time_end: string
          time_start: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          day_of_week?: number
          description?: string | null
          discipline?: string
          id?: string
          is_active?: boolean
          max_capacity?: number
          name?: string
          room?: string
          teacher?: string
          time_end?: string
          time_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      packs: {
        Row: {
          created_at: string
          credits: number
          description: string
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
          full_name: string
          id: string
          is_approved: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          is_approved?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_approved?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_packs: {
        Row: {
          assigned_by: string | null
          created_at: string
          credits_remaining: number
          expires_at: string | null
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
      count_confirmed: {
        Args: { p_date: string; p_template_id: string }
        Returns: number
      }
      get_next_waitlist_position: {
        Args: { p_date: string; p_template_id: string }
        Returns: number
      }
      is_class_full: {
        Args: { p_date: string; p_template_id: string }
        Returns: boolean
      }
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

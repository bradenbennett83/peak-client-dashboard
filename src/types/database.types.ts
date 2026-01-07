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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          practice_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          practice_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          practice_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      case_files: {
        Row: {
          case_id: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          uploaded_at: string | null
        }
        Insert: {
          case_id: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          uploaded_at?: string | null
        }
        Update: {
          case_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_files_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          carrier: string | null
          case_number: string
          case_type: string
          created_at: string | null
          due_date: string | null
          id: string
          instructions: string | null
          is_priority: boolean | null
          is_rush: boolean | null
          material: string | null
          metadata: Json | null
          notes: string | null
          patient_name: string
          practice_id: string
          received_date: string | null
          salesforce_id: string | null
          shade: string | null
          shipped_date: string | null
          status: string | null
          teeth_numbers: string | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          carrier?: string | null
          case_number: string
          case_type: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          is_priority?: boolean | null
          is_rush?: boolean | null
          material?: string | null
          metadata?: Json | null
          notes?: string | null
          patient_name: string
          practice_id: string
          received_date?: string | null
          salesforce_id?: string | null
          shade?: string | null
          shipped_date?: string | null
          status?: string | null
          teeth_numbers?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          carrier?: string | null
          case_number?: string
          case_type?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          is_priority?: boolean | null
          is_rush?: boolean | null
          material?: string | null
          metadata?: Json | null
          notes?: string | null
          patient_name?: string
          practice_id?: string
          received_date?: string | null
          salesforce_id?: string | null
          shade?: string | null
          shipped_date?: string | null
          status?: string | null
          teeth_numbers?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          practice_id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          practice_id: string
          role: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          practice_id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          amount_paid: number | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          line_items: Json | null
          metadata: Json | null
          paid_date: string | null
          practice_id: string
          salesforce_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          amount_paid?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          line_items?: Json | null
          metadata?: Json | null
          paid_date?: string | null
          practice_id: string
          salesforce_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          line_items?: Json | null
          metadata?: Json | null
          paid_date?: string | null
          practice_id?: string
          salesforce_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          practice_id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          practice_id: string
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          practice_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      office_platform_status: {
        Row: {
          activated_at: string | null
          created_at: string | null
          deactivated_at: string | null
          id: string
          is_active: boolean
          notes: string | null
          platform_id: string
          practice_id: string
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          platform_id: string
          practice_id: string
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          platform_id?: string
          practice_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "office_platform_status_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platform_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "office_platform_status_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          metadata: Json | null
          payment_method: string | null
          status: string | null
          stripe_payment_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          metadata?: Json | null
          payment_method?: string | null
          status?: string | null
          stripe_payment_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          metadata?: Json | null
          payment_method?: string | null
          status?: string | null
          stripe_payment_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_items: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["platform_status"]
          status_label: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id: string
          name: string
          status?: Database["public"]["Enums"]["platform_status"]
          status_label: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["platform_status"]
          status_label?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      practices: {
        Row: {
          billing_address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          salesforce_account_id: string | null
          salesforce_id: string
          settings: Json | null
          shipping_address: string | null
          status: string | null
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          salesforce_account_id?: string | null
          salesforce_id: string
          settings?: Json | null
          shipping_address?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          salesforce_account_id?: string | null
          salesforce_id?: string
          settings?: Json | null
          shipping_address?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shipping_labels: {
        Row: {
          carrier: string | null
          created_at: string | null
          direction: string | null
          from_address: Json
          id: string
          label_data: string | null
          label_url: string | null
          practice_id: string
          service: string | null
          status: string | null
          to_address: Json
          tracking_number: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          direction?: string | null
          from_address: Json
          id?: string
          label_data?: string | null
          label_url?: string | null
          practice_id: string
          service?: string | null
          status?: string | null
          to_address: Json
          tracking_number: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          direction?: string | null
          from_address?: Json
          id?: string
          label_data?: string | null
          label_url?: string | null
          practice_id?: string
          service?: string | null
          status?: string | null
          to_address?: Json
          tracking_number?: string
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_labels_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          operation: string
          records_processed: number | null
          service: string
          status: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          operation: string
          records_processed?: number | null
          service: string
          status: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          operation?: string
          records_processed?: number | null
          service?: string
          status?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_login_at: string | null
          last_name: string | null
          name: string | null
          phone: string | null
          practice_id: string
          role: string | null
          salesforce_contact_id: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string | null
          name?: string | null
          phone?: string | null
          practice_id: string
          role?: string | null
          salesforce_contact_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string | null
          name?: string | null
          phone?: string | null
          practice_id?: string
          role?: string | null
          salesforce_contact_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_practice_id: { Args: Record<string, never>; Returns: string }
    }
    Enums: {
      platform_status: "live" | "partial" | "future"
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

// Helper types for common tables
export type User = Tables<"users">
export type Practice = Tables<"practices">
export type Case = Tables<"cases">
export type CaseFile = Tables<"case_files">
export type Invoice = Tables<"invoices">
export type Payment = Tables<"payments">
export type ShippingLabel = Tables<"shipping_labels">
export type Notification = Tables<"notifications">
export type Invitation = Tables<"invitations">
export type AuditLog = Tables<"audit_logs">

// Insert types
export type UserInsert = TablesInsert<"users">
export type PracticeInsert = TablesInsert<"practices">
export type CaseInsert = TablesInsert<"cases">
export type InvoiceInsert = TablesInsert<"invoices">
export type PaymentInsert = TablesInsert<"payments">
export type ShippingLabelInsert = TablesInsert<"shipping_labels">
export type NotificationInsert = TablesInsert<"notifications">
export type InvitationInsert = TablesInsert<"invitations">

// Update types
export type UserUpdate = TablesUpdate<"users">
export type PracticeUpdate = TablesUpdate<"practices">
export type CaseUpdate = TablesUpdate<"cases">
export type InvoiceUpdate = TablesUpdate<"invoices">

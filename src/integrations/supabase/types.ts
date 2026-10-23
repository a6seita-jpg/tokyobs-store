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
      chat_messages: {
        Row: {
          author: string
          body: string
          created_at: string
          id: string
          sender_id: string
          sender_role: string
          thread_id: string
        }
        Insert: {
          author?: string
          body: string
          created_at?: string
          id?: string
          sender_id: string
          sender_role: string
          thread_id: string
        }
        Update: {
          author?: string
          body?: string
          created_at?: string
          id?: string
          sender_id?: string
          sender_role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          kind: string
          order_id: string | null
          owner_email: string
          owner_id: string
          owner_name: string
          unread_for_admin: number
          unread_for_user: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          order_id?: string | null
          owner_email: string
          owner_id: string
          owner_name?: string
          unread_for_admin?: number
          unread_for_user?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          order_id?: string | null
          owner_email?: string
          owner_id?: string
          owner_name?: string
          unread_for_admin?: number
          unread_for_user?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_email: string
          buyer_nickname: string
          comprovante: string | null
          created_at: string
          expires_at: string
          id: string
          items: Json
          observacao: string | null
          status: string
          total: number
          user_id: string
        }
        Insert: {
          buyer_email: string
          buyer_nickname?: string
          comprovante?: string | null
          created_at?: string
          expires_at: string
          id: string
          items?: Json
          observacao?: string | null
          status?: string
          total: number
          user_id: string
        }
        Update: {
          buyer_email?: string
          buyer_nickname?: string
          comprovante?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          items?: Json
          observacao?: string | null
          status?: string
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string
          created_at: string
          email: string
          id: string
          nickname: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar?: string
          created_at?: string
          email: string
          id: string
          nickname?: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar?: string
          created_at?: string
          email?: string
          id?: string
          nickname?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_email: string
          author_name: string
          comment: string
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          author_email: string
          author_name: string
          comment?: string
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          author_email?: string
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      tokyobs_chats: {
        Row: {
          id: string
          kind: string
          messages: Json
          order_id: string | null
          owner_email: string
          owner_name: string
          unread_for_admin: number
          unread_for_user: number
          updated_at: number
        }
        Insert: {
          id: string
          kind: string
          messages?: Json
          order_id?: string | null
          owner_email: string
          owner_name: string
          unread_for_admin?: number
          unread_for_user?: number
          updated_at: number
        }
        Update: {
          id?: string
          kind?: string
          messages?: Json
          order_id?: string | null
          owner_email?: string
          owner_name?: string
          unread_for_admin?: number
          unread_for_user?: number
          updated_at?: number
        }
        Relationships: []
      }
      tokyobs_orders: {
        Row: {
          buyer_email: string
          buyer_nickname: string
          comprovante: string | null
          created_at: number
          expires_at: number
          id: string
          items: Json
          observacao: string | null
          status: string
          total: number
        }
        Insert: {
          buyer_email: string
          buyer_nickname: string
          comprovante?: string | null
          created_at: number
          expires_at: number
          id: string
          items?: Json
          observacao?: string | null
          status?: string
          total?: number
        }
        Update: {
          buyer_email?: string
          buyer_nickname?: string
          comprovante?: string | null
          created_at?: number
          expires_at?: number
          id?: string
          items?: Json
          observacao?: string | null
          status?: string
          total?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      mark_chat_read: { Args: { p_thread_id: string }; Returns: undefined }
      send_chat_message: {
        Args: { p_author?: string; p_body: string; p_thread_id: string }
        Returns: undefined
      }
      submit_order_payment: {
        Args: {
          p_comprovante?: string
          p_expire?: boolean
          p_observacao?: string
          p_order_id: string
        }
        Returns: undefined
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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

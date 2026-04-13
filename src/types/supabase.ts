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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      projects: {
        Row: {
          created_at: string | null
          github_app_installation_id: string | null
          id: string
          name: string
          repo_name: string
          repo_owner: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          github_app_installation_id?: string | null
          id?: string
          name: string
          repo_name: string
          repo_owner: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          github_app_installation_id?: string | null
          id?: string
          name?: string
          repo_name?: string
          repo_owner?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      social_connections: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          platform_user_id: string | null
          platform_username: string | null
          refresh_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          message: string | null
          metadata: Json | null
          project_id: string
          source: string
          status: string
          storage_path: string | null
          thumbnail_url: string | null
          trigger_details: Json | null
          trigger_event: string
          video_url: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          project_id: string
          source?: string
          status?: string
          storage_path?: string | null
          thumbnail_url?: string | null
          trigger_details?: Json | null
          trigger_event: string
          video_url?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          project_id?: string
          source?: string
          status?: string
          storage_path?: string | null
          thumbnail_url?: string | null
          trigger_details?: Json | null
          trigger_event?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_configs: {
        Row: {
          auto_post_social: boolean | null
          created_at: string | null
          discord_webhook_url: string | null
          events: string[]
          id: string
          project_id: string
          slack_webhook_url: string | null
          updated_at: string | null
        }
        Insert: {
          auto_post_social?: boolean | null
          created_at?: string | null
          discord_webhook_url?: string | null
          events?: string[]
          id?: string
          project_id: string
          slack_webhook_url?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_post_social?: boolean | null
          created_at?: string | null
          discord_webhook_url?: string | null
          events?: string[]
          id?: string
          project_id?: string
          slack_webhook_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_prompt_with_sections:
        | {
            Args: {
              p_description?: string
              p_is_private?: boolean
              p_sections?: Json
              p_slug: string
              p_tags?: string[]
              p_title: string
            }
            Returns: {
              prompt_id: string
              section_ids: string[]
            }[]
          }
        | {
            Args: {
              p_created_by: string
              p_description: string
              p_sections: Json
              p_slug: string
              p_tags: string[]
              p_title: string
            }
            Returns: {
              created_at: string
              created_by: string
              description: string
              id: string
              is_private: boolean
              slug: string
              tags: string[]
              title: string
              updated_at: string
            }[]
          }
      increment_usage: { Args: { user_id: string }; Returns: undefined }
      increment_workflow_activation: {
        Args: { workflow_id: string }
        Returns: undefined
      }
      reset_monthly_usage: { Args: never; Returns: undefined }
      update_prompt_with_sections:
        | {
            Args: {
              p_description?: string
              p_is_private?: boolean
              p_prompt_id: string
              p_sections?: Json
              p_tags?: string[]
              p_title?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_description: string
              p_prompt_id: string
              p_sections: Json
              p_tags: string[]
              p_title: string
            }
            Returns: undefined
          }
      update_workflow_stats: {
        Args: { success: boolean; workflow_id: string }
        Returns: undefined
      }
    }
    Enums: {
      role: "user" | "assistant"
      theme: "light" | "dark"
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
    Enums: {
      role: ["user", "assistant"],
      theme: ["light", "dark"],
    },
  },
} as const

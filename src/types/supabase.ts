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
          metadata: Json | null
          project_id: string
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
          metadata?: Json | null
          project_id: string
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
          metadata?: Json | null
          project_id?: string
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

type DefaultSchema = Database['public']

export type Tables<T extends keyof DefaultSchema['Tables']> = DefaultSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof DefaultSchema['Tables']> = DefaultSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof DefaultSchema['Tables']> = DefaultSchema['Tables'][T]['Update']

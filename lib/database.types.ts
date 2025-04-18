export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      api_auth_tokens: {
        Row: {
          created_at: string
          id: string
          mode: Database["public"]["Enums"]["key_mode"]
          team_id: string
          token: string
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["key_mode"]
          team_id: string
          token: string
        }
        Update: {
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["key_mode"]
          team_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_auth_tokens_team_id_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_auth_tokens_team_id_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams_summary"
            referencedColumns: ["team_id"]
          },
        ]
      }
      blocks: {
        Row: {
          block_number: number
          created_at: string
          gas_used: number
          hash: string
          timestamp: string
          transaction_count: number
        }
        Insert: {
          block_number: number
          created_at?: string
          gas_used: number
          hash: string
          timestamp: string
          transaction_count: number
        }
        Update: {
          block_number?: number
          created_at?: string
          gas_used?: number
          hash?: string
          timestamp?: string
          transaction_count?: number
        }
        Relationships: []
      }
      cloud_instances: {
        Row: {
          cpu_arch: string | null
          cpu_cores: number
          cpu_effective_cores: number | null
          cpu_name: string | null
          created_at: string
          disk_name: string
          disk_space: number | null
          gpu_arch: string | null
          gpu_count: number | null
          gpu_memory: number | null
          gpu_name: string | null
          hourly_price: number
          id: number
          instance_name: string
          memory: number
          mobo_name: string | null
          provider: Database["public"]["Enums"]["provider"]
          region: string
          snapshot_date: string | null
        }
        Insert: {
          cpu_arch?: string | null
          cpu_cores: number
          cpu_effective_cores?: number | null
          cpu_name?: string | null
          created_at?: string
          disk_name: string
          disk_space?: number | null
          gpu_arch?: string | null
          gpu_count?: number | null
          gpu_memory?: number | null
          gpu_name?: string | null
          hourly_price: number
          id?: number
          instance_name: string
          memory: number
          mobo_name?: string | null
          provider?: Database["public"]["Enums"]["provider"]
          region: string
          snapshot_date?: string | null
        }
        Update: {
          cpu_arch?: string | null
          cpu_cores?: number
          cpu_effective_cores?: number | null
          cpu_name?: string | null
          created_at?: string
          disk_name?: string
          disk_space?: number | null
          gpu_arch?: string | null
          gpu_count?: number | null
          gpu_memory?: number | null
          gpu_name?: string | null
          hourly_price?: number
          id?: number
          instance_name?: string
          memory?: number
          mobo_name?: string | null
          provider?: Database["public"]["Enums"]["provider"]
          region?: string
          snapshot_date?: string | null
        }
        Relationships: []
      }
      cluster_configurations: {
        Row: {
          cloud_instance_count: number
          cloud_instance_id: number
          cluster_id: string
          id: number
        }
        Insert: {
          cloud_instance_count: number
          cloud_instance_id: number
          cluster_id: string
          id?: number
        }
        Update: {
          cloud_instance_count?: number
          cloud_instance_id?: number
          cluster_id?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "cluster_configurations_cloud_instance_id_cloud_instances_id_fk"
            columns: ["cloud_instance_id"]
            isOneToOne: false
            referencedRelation: "cloud_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_configurations_cluster_id_clusters_id_fk"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      clusters: {
        Row: {
          created_at: string
          cycle_type: string | null
          description: string | null
          hardware: string | null
          id: string
          index: number | null
          nickname: string
          proof_type: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          cycle_type?: string | null
          description?: string | null
          hardware?: string | null
          id?: string
          index?: number | null
          nickname: string
          proof_type?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          cycle_type?: string | null
          description?: string | null
          hardware?: string | null
          id?: string
          index?: number | null
          nickname?: string
          proof_type?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clusters_team_id_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clusters_team_id_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams_summary"
            referencedColumns: ["team_id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string
          id: number
          verifier_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          verifier_id: string
        }
        Update: {
          created_at?: string
          id?: number
          verifier_id?: string
        }
        Relationships: []
      }
      proofs: {
        Row: {
          block_number: number
          cluster_id: string
          created_at: string
          program_id: number | null
          proof_id: number
          proof_status: string
          proved_timestamp: string | null
          proving_cycles: number | null
          proving_time: number | null
          proving_timestamp: string | null
          queued_timestamp: string | null
          size_bytes: number | null
          team_id: string
        }
        Insert: {
          block_number: number
          cluster_id: string
          created_at?: string
          program_id?: number | null
          proof_id?: number
          proof_status: string
          proved_timestamp?: string | null
          proving_cycles?: number | null
          proving_time?: number | null
          proving_timestamp?: string | null
          queued_timestamp?: string | null
          size_bytes?: number | null
          team_id: string
        }
        Update: {
          block_number?: number
          cluster_id?: string
          created_at?: string
          program_id?: number | null
          proof_id?: number
          proof_status?: string
          proved_timestamp?: string | null
          proving_cycles?: number | null
          proving_time?: number | null
          proving_timestamp?: string | null
          queued_timestamp?: string | null
          size_bytes?: number | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proofs_block_number_blocks_block_number_fk"
            columns: ["block_number"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["block_number"]
          },
          {
            foreignKeyName: "proofs_cluster_id_clusters_id_fk"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_program_id_programs_id_fk"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_team_id_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_team_id_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams_summary"
            referencedColumns: ["team_id"]
          },
        ]
      }
      recursive_root_proofs: {
        Row: {
          block_number: number | null
          root_proof: string
          root_proof_id: number
          root_proof_size: number
          team_id: string
          total_proof_size: number
        }
        Insert: {
          block_number?: number | null
          root_proof: string
          root_proof_id?: number
          root_proof_size: number
          team_id: string
          total_proof_size: number
        }
        Update: {
          block_number?: number | null
          root_proof?: string
          root_proof_id?: number
          root_proof_size?: number
          team_id?: string
          total_proof_size?: number
        }
        Relationships: [
          {
            foreignKeyName: "recursive_root_proofs_block_number_blocks_block_number_fk"
            columns: ["block_number"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["block_number"]
          },
          {
            foreignKeyName: "recursive_root_proofs_team_id_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recursive_root_proofs_team_id_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams_summary"
            referencedColumns: ["team_id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          github_org: string | null
          id: string
          logo_url: string | null
          name: string
          storage_quota_bytes: number | null
          twitter_handle: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          github_org?: string | null
          id: string
          logo_url?: string | null
          name: string
          storage_quota_bytes?: number | null
          twitter_handle?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          github_org?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          storage_quota_bytes?: number | null
          twitter_handle?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      recent_summary: {
        Row: {
          avg_cost_per_proof: number | null
          avg_proving_time: number | null
          total_proven_blocks: number | null
        }
        Relationships: []
      }
      teams_summary: {
        Row: {
          avg_cost_per_proof: number | null
          avg_proving_time: number | null
          logo_url: string | null
          team_id: string | null
          team_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_allowed_apikey: {
        Args: {
          apikey: string
          keymode: Database["public"]["Enums"]["key_mode"][]
        }
        Returns: boolean
      }
    }
    Enums: {
      key_mode: "read" | "write" | "all" | "upload"
      provider: "aws" | "vastai"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      key_mode: ["read", "write", "all", "upload"],
      provider: ["aws", "vastai"],
    },
  },
} as const


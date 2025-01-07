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
      aws_instance_pricing: {
        Row: {
          created_at: string
          hourly_price: number
          id: number
          instance_memory: number
          instance_storage: string
          instance_type: string
          region: string
          vcpu: number
        }
        Insert: {
          created_at?: string
          hourly_price: number
          id?: number
          instance_memory: number
          instance_storage: string
          instance_type: string
          region: string
          vcpu: number
        }
        Update: {
          created_at?: string
          hourly_price?: number
          id?: number
          instance_memory?: number
          instance_storage?: string
          instance_type?: string
          region?: string
          vcpu?: number
        }
        Relationships: []
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
      cluster_configurations: {
        Row: {
          cluster_id: string
          id: number
          instance_count: number
          instance_type_id: number
        }
        Insert: {
          cluster_id: string
          id?: number
          instance_count: number
          instance_type_id: number
        }
        Update: {
          cluster_id?: string
          id?: number
          instance_count?: number
          instance_type_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "cluster_configurations_cluster_id_clusters_id_fk"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_configurations_instance_type_id_aws_instance_pricing_id"
            columns: ["instance_type_id"]
            isOneToOne: false
            referencedRelation: "aws_instance_pricing"
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
      proof_binaries: {
        Row: {
          proof_binary: string
          proof_id: number
        }
        Insert: {
          proof_binary: string
          proof_id: number
        }
        Update: {
          proof_binary?: string
          proof_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "proof_binaries_proof_id_proofs_proof_id_fk"
            columns: ["proof_id"]
            isOneToOne: true
            referencedRelation: "proofs"
            referencedColumns: ["proof_id"]
          },
        ]
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
          twitter_handle: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          github_org?: string | null
          id: string
          logo_url?: string | null
          name: string
          twitter_handle?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          github_org?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          twitter_handle?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_id_users_id_fk"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "teams_id_users_id_fk"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never


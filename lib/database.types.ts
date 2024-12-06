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
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["key_mode"]
          token?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["key_mode"]
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_auth_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
          gas_used: number
          hash: string
          timestamp: string
          total_fees: number
          transaction_count: number
        }
        Insert: {
          block_number: number
          gas_used: number
          hash: string
          timestamp: string
          total_fees: number
          transaction_count: number
        }
        Update: {
          block_number?: number
          gas_used?: number
          hash?: string
          timestamp?: string
          total_fees?: number
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
            foreignKeyName: "cluster_configurations_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_configurations_instance_type_id_fkey"
            columns: ["instance_type_id"]
            isOneToOne: false
            referencedRelation: "aws_instance_pricing"
            referencedColumns: ["id"]
          },
        ]
      }
      clusters: {
        Row: {
          cluster_cycle_type: string | null
          cluster_description: string | null
          cluster_hardware: string | null
          cluster_id: number | null
          cluster_name: string
          cluster_proof_type: string | null
          id: string
          user_id: string
        }
        Insert: {
          cluster_cycle_type?: string | null
          cluster_description?: string | null
          cluster_hardware?: string | null
          cluster_id?: number | null
          cluster_name: string
          cluster_proof_type?: string | null
          id?: string
          user_id: string
        }
        Update: {
          cluster_cycle_type?: string | null
          cluster_description?: string | null
          cluster_hardware?: string | null
          cluster_id?: number | null
          cluster_name?: string
          cluster_proof_type?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clusters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      proofs: {
        Row: {
          block_number: number
          cluster_id: string
          created_at: string | null
          proof: string | null
          proof_id: number
          proof_status: string
          proved_timestamp: string | null
          proving_cost: number | null
          proving_cycles: number | null
          proving_time: number | null
          proving_timestamp: string | null
          queued_timestamp: string | null
          user_id: string
        }
        Insert: {
          block_number: number
          cluster_id: string
          created_at?: string | null
          proof?: string | null
          proof_id?: number
          proof_status: string
          proved_timestamp?: string | null
          proving_cost?: number | null
          proving_cycles?: number | null
          proving_time?: number | null
          proving_timestamp?: string | null
          queued_timestamp?: string | null
          user_id: string
        }
        Update: {
          block_number?: number
          cluster_id?: string
          created_at?: string | null
          proof?: string | null
          proof_id?: number
          proof_status?: string
          proved_timestamp?: string | null
          proving_cost?: number | null
          proving_cycles?: number | null
          proving_time?: number | null
          proving_timestamp?: string | null
          queued_timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proofs_block_number_fkey"
            columns: ["block_number"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["block_number"]
          },
          {
            foreignKeyName: "proofs_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recursive_root_proofs: {
        Row: {
          block_number: number | null
          root_proof: string
          root_proof_id: number
          root_proof_size: number
          total_proof_size: number
          user_id: string | null
        }
        Insert: {
          block_number?: number | null
          root_proof: string
          root_proof_id?: number
          root_proof_size: number
          total_proof_size: number
          user_id?: string | null
        }
        Update: {
          block_number?: number | null
          root_proof?: string
          root_proof_id?: number
          root_proof_size?: number
          total_proof_size?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recursive_root_proofs_block_number_fkey"
            columns: ["block_number"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["block_number"]
          },
          {
            foreignKeyName: "recursive_root_proofs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          github_org: string | null
          logo_url: string | null
          team_id: number
          team_name: string
          twitter_handle: string | null
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          github_org?: string | null
          logo_url?: string | null
          team_id?: number
          team_name: string
          twitter_handle?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          github_org?: string | null
          logo_url?: string | null
          team_id?: number
          team_name?: string
          twitter_handle?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
          avg_proving_cost: number | null
          avg_proving_time: number | null
          logo_url: string | null
          team_id: number | null
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


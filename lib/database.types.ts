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
      proofs: {
        Row: {
          block_number: number
          proof: string | null
          proof_id: number
          proof_status: string
          prover_duration: unknown | null
          prover_machine_id: number | null
          proving_cost: number | null
          proving_cycles: number | null
          submission_time: string | null
          user_id: string
        }
        Insert: {
          block_number: number
          proof?: string | null
          proof_id?: number
          proof_status: string
          prover_duration?: unknown | null
          prover_machine_id?: number | null
          proving_cost?: number | null
          proving_cycles?: number | null
          submission_time?: string | null
          user_id: string
        }
        Update: {
          block_number?: number
          proof?: string | null
          proof_id?: number
          proof_status?: string
          prover_duration?: unknown | null
          prover_machine_id?: number | null
          proving_cost?: number | null
          proving_cycles?: number | null
          submission_time?: string | null
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
            foreignKeyName: "proofs_prover_machine_id_fkey"
            columns: ["prover_machine_id"]
            isOneToOne: false
            referencedRelation: "prover_machines"
            referencedColumns: ["machine_id"]
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
      prover_machines: {
        Row: {
          machine_id: number
          machine_name: string
          user_id: string | null
        }
        Insert: {
          machine_id?: number
          machine_name: string
          user_id?: string | null
        }
        Update: {
          machine_id?: number
          machine_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prover_machines_user_id_fkey"
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
          avg_proof_latency: number | null
          total_proven_blocks: number | null
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


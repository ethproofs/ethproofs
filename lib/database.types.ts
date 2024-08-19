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
      blocks: {
        Row: {
          block_number: number
          gas_used: number
          timestamp: string
          transaction_count: number
        }
        Insert: {
          block_number: number
          gas_used: number
          timestamp: string
          transaction_count: number
        }
        Update: {
          block_number?: number
          gas_used?: number
          timestamp?: string
          transaction_count?: number
        }
        Relationships: []
      }
      proofs: {
        Row: {
          block_number: number | null
          proof: string | null
          proof_id: number
          proof_status: string
          prover_duration: unknown | null
          prover_machine_id: number | null
          proving_cost: number | null
          proving_cycles: number | null
          submission_time: string | null
          team_id: number | null
        }
        Insert: {
          block_number?: number | null
          proof?: string | null
          proof_id?: number
          proof_status: string
          prover_duration?: unknown | null
          prover_machine_id?: number | null
          proving_cost?: number | null
          proving_cycles?: number | null
          submission_time?: string | null
          team_id?: number | null
        }
        Update: {
          block_number?: number | null
          proof?: string | null
          proof_id?: number
          proof_status?: string
          prover_duration?: unknown | null
          prover_machine_id?: number | null
          proving_cost?: number | null
          proving_cycles?: number | null
          submission_time?: string | null
          team_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proofs_block_number_fkey"
            columns: ["block_number"]
            isOneToOne: false
            referencedRelation: "block_proof_stats"
            referencedColumns: ["block_number"]
          },
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
            foreignKeyName: "proofs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      prover_machines: {
        Row: {
          machine_id: number
          machine_name: string
          team_id: number | null
        }
        Insert: {
          machine_id?: number
          machine_name: string
          team_id?: number | null
        }
        Update: {
          machine_id?: number
          machine_name?: string
          team_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prover_machines_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
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
          team_id: number | null
          total_proof_size: number
        }
        Insert: {
          block_number?: number | null
          root_proof: string
          root_proof_id?: number
          root_proof_size: number
          team_id?: number | null
          total_proof_size: number
        }
        Update: {
          block_number?: number | null
          root_proof?: string
          root_proof_id?: number
          root_proof_size?: number
          team_id?: number | null
          total_proof_size?: number
        }
        Relationships: [
          {
            foreignKeyName: "recursive_root_proofs_block_number_fkey"
            columns: ["block_number"]
            isOneToOne: false
            referencedRelation: "block_proof_stats"
            referencedColumns: ["block_number"]
          },
          {
            foreignKeyName: "recursive_root_proofs_block_number_fkey"
            columns: ["block_number"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["block_number"]
          },
          {
            foreignKeyName: "recursive_root_proofs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      teams: {
        Row: {
          team_id: number
          team_name: string
        }
        Insert: {
          team_id?: number
          team_name: string
        }
        Update: {
          team_id?: number
          team_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      block_proof_stats: {
        Row: {
          block_number: number | null
          gas_used: number | null
          machine_name: string | null
          prover_duration: unknown | null
          proving_cost: number | null
          proving_cycles: number | null
          team_name: string | null
        }
        Relationships: []
      }
      proof_summary_stats: {
        Row: {
          avg_proof_time: unknown | null
          team_id: number | null
          total_cycles: number | null
          total_proofs: number | null
          total_proving_cost: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proofs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      recursive_proof_stats: {
        Row: {
          compression_ratio: number | null
          root_proof_size: number | null
          team_id: number | null
          team_name: string | null
          total_proof_size: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recursive_root_proofs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
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


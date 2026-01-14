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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
          gas_used: number | null
          hash: string | null
          timestamp: string | null
          transaction_count: number | null
        }
        Insert: {
          block_number: number
          created_at?: string
          gas_used?: number | null
          hash?: string | null
          timestamp?: string | null
          transaction_count?: number | null
        }
        Update: {
          block_number?: number
          created_at?: string
          gas_used?: number | null
          hash?: string | null
          timestamp?: string | null
          transaction_count?: number | null
        }
        Relationships: []
      }
      cluster_versions: {
        Row: {
          cluster_id: string
          created_at: string
          id: number
          index: number
          is_active: boolean
          vk_path: string | null
          zkvm_version_id: number
        }
        Insert: {
          cluster_id: string
          created_at?: string
          id?: number
          index: number
          is_active?: boolean
          vk_path?: string | null
          zkvm_version_id: number
        }
        Update: {
          cluster_id?: string
          created_at?: string
          id?: number
          index?: number
          is_active?: boolean
          vk_path?: string | null
          zkvm_version_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "cluster_versions_cluster_id_clusters_id_fk"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "cluster_summary"
            referencedColumns: ["cluster_id"]
          },
          {
            foreignKeyName: "cluster_versions_cluster_id_clusters_id_fk"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_versions_zkvm_version_id_zkvm_versions_id_fk"
            columns: ["zkvm_version_id"]
            isOneToOne: false
            referencedRelation: "zkvm_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      clusters: {
        Row: {
          created_at: string
          hardware_description: string | null
          id: string
          index: number | null
          is_active: boolean
          is_open_source: boolean
          name: string
          num_gpus: number
          prover_type_id: number
          software_link: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          hardware_description?: string | null
          id?: string
          index?: number | null
          is_active?: boolean
          is_open_source?: boolean
          name: string
          num_gpus?: number
          prover_type_id: number
          software_link?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          hardware_description?: string | null
          id?: string
          index?: number | null
          is_active?: boolean
          is_open_source?: boolean
          name?: string
          num_gpus?: number
          prover_type_id?: number
          software_link?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clusters_prover_type_id_prover_types_id_fk"
            columns: ["prover_type_id"]
            isOneToOne: false
            referencedRelation: "prover_types"
            referencedColumns: ["id"]
          },
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
      gpu_price_index: {
        Row: {
          created_at: string
          gpu_name: string
          hourly_price: number
          id: number
        }
        Insert: {
          created_at?: string
          gpu_name: string
          hourly_price: number
          id?: number
        }
        Update: {
          created_at?: string
          gpu_name?: string
          hourly_price?: number
          id?: number
        }
        Relationships: []
      }
      proofs: {
        Row: {
          block_number: number
          cluster_id: string
          cluster_version_id: number
          created_at: string
          gpu_price_index_id: number | null
          proof_id: number
          proof_status: string
          proved_timestamp: string | null
          proving_cycles: number | null
          proving_time: number | null
          proving_timestamp: string | null
          queued_timestamp: string | null
          size_bytes: number | null
          team_id: string
          updated_at: string
        }
        Insert: {
          block_number: number
          cluster_id: string
          cluster_version_id: number
          created_at?: string
          gpu_price_index_id?: number | null
          proof_id?: number
          proof_status: string
          proved_timestamp?: string | null
          proving_cycles?: number | null
          proving_time?: number | null
          proving_timestamp?: string | null
          queued_timestamp?: string | null
          size_bytes?: number | null
          team_id: string
          updated_at?: string
        }
        Update: {
          block_number?: number
          cluster_id?: string
          cluster_version_id?: number
          created_at?: string
          gpu_price_index_id?: number | null
          proof_id?: number
          proof_status?: string
          proved_timestamp?: string | null
          proving_cycles?: number | null
          proving_time?: number | null
          proving_timestamp?: string | null
          queued_timestamp?: string | null
          size_bytes?: number | null
          team_id?: string
          updated_at?: string
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
            foreignKeyName: "proofs_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "cluster_summary"
            referencedColumns: ["cluster_id"]
          },
          {
            foreignKeyName: "proofs_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_cluster_version_id_cluster_versions_id_fk"
            columns: ["cluster_version_id"]
            isOneToOne: false
            referencedRelation: "cluster_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_gpu_price_index_id_fkey"
            columns: ["gpu_price_index_id"]
            isOneToOne: false
            referencedRelation: "gpu_price_index"
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
      proofs_daily_stats: {
        Row: {
          avg_cost: number
          avg_latency: number
          date: string
          id: number
          median_cost: number
          median_latency: number
          total_proofs: number
        }
        Insert: {
          avg_cost: number
          avg_latency: number
          date: string
          id?: number
          median_cost: number
          median_latency: number
          total_proofs: number
        }
        Update: {
          avg_cost?: number
          avg_latency?: number
          date?: string
          id?: number
          median_cost?: number
          median_latency?: number
          total_proofs?: number
        }
        Relationships: []
      }
      prover_daily_stats: {
        Row: {
          avg_cost: number
          avg_latency: number
          date: string
          id: number
          median_cost: number
          median_latency: number
          team_id: string
          total_proofs: number
        }
        Insert: {
          avg_cost: number
          avg_latency: number
          date: string
          id?: number
          median_cost: number
          median_latency: number
          team_id: string
          total_proofs: number
        }
        Update: {
          avg_cost?: number
          avg_latency?: number
          date?: string
          id?: number
          median_cost?: number
          median_latency?: number
          team_id?: string
          total_proofs?: number
        }
        Relationships: [
          {
            foreignKeyName: "prover_daily_stats_team_id_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prover_daily_stats_team_id_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams_summary"
            referencedColumns: ["team_id"]
          },
        ]
      }
      prover_types: {
        Row: {
          created_at: string
          deployment_type: string
          gpu_configuration: string
          id: number
          name: string
          processing_ratio: string
        }
        Insert: {
          created_at?: string
          deployment_type: string
          gpu_configuration: string
          id: number
          name: string
          processing_ratio: string
        }
        Update: {
          created_at?: string
          deployment_type?: string
          gpu_configuration?: string
          id?: number
          name?: string
          processing_ratio?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          approved: boolean
          chat_id: string | null
          created_at: string
          github_org: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          storage_quota_bytes: number | null
          twitter_handle: string | null
          website_url: string | null
        }
        Insert: {
          approved?: boolean
          chat_id?: string | null
          created_at?: string
          github_org?: string | null
          id: string
          logo_url?: string | null
          name: string
          slug: string
          storage_quota_bytes?: number | null
          twitter_handle?: string | null
          website_url?: string | null
        }
        Update: {
          approved?: boolean
          chat_id?: string | null
          created_at?: string
          github_org?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          storage_quota_bytes?: number | null
          twitter_handle?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      zkvm_performance_metrics: {
        Row: {
          created_at: string
          id: number
          size_bytes: number
          updated_at: string
          verification_ms: number
          zkvm_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          size_bytes: number
          updated_at?: string
          verification_ms: number
          zkvm_id: number
        }
        Update: {
          created_at?: string
          id?: number
          size_bytes?: number
          updated_at?: string
          verification_ms?: number
          zkvm_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "zkvm_performance_metrics_zkvm_id_zkvms_id_fk"
            columns: ["zkvm_id"]
            isOneToOne: true
            referencedRelation: "zkvms"
            referencedColumns: ["id"]
          },
        ]
      }
      zkvm_security_metrics: {
        Row: {
          created_at: string
          evm_stf_bytecode: Database["public"]["Enums"]["severity_level"]
          id: number
          implementation_soundness: Database["public"]["Enums"]["severity_level"]
          max_bounty_amount: number
          quantum_security: Database["public"]["Enums"]["severity_level"]
          security_target_bits: number
          soundcalc_integration: boolean
          updated_at: string
          zkvm_id: number
        }
        Insert: {
          created_at?: string
          evm_stf_bytecode: Database["public"]["Enums"]["severity_level"]
          id?: number
          implementation_soundness: Database["public"]["Enums"]["severity_level"]
          max_bounty_amount: number
          quantum_security: Database["public"]["Enums"]["severity_level"]
          security_target_bits: number
          soundcalc_integration?: boolean
          updated_at?: string
          zkvm_id: number
        }
        Update: {
          created_at?: string
          evm_stf_bytecode?: Database["public"]["Enums"]["severity_level"]
          id?: number
          implementation_soundness?: Database["public"]["Enums"]["severity_level"]
          max_bounty_amount?: number
          quantum_security?: Database["public"]["Enums"]["severity_level"]
          security_target_bits?: number
          soundcalc_integration?: boolean
          updated_at?: string
          zkvm_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "zkvm_security_metrics_zkvm_id_zkvms_id_fk"
            columns: ["zkvm_id"]
            isOneToOne: true
            referencedRelation: "zkvms"
            referencedColumns: ["id"]
          },
        ]
      }
      zkvm_versions: {
        Row: {
          created_at: string
          id: number
          version: string
          zkvm_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          version: string
          zkvm_id: number
        }
        Update: {
          created_at?: string
          id?: number
          version?: string
          zkvm_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "zkvm_versions_zkvm_id_zkvms_id_fk"
            columns: ["zkvm_id"]
            isOneToOne: false
            referencedRelation: "zkvms"
            referencedColumns: ["id"]
          },
        ]
      }
      zkvms: {
        Row: {
          continuations: boolean
          created_at: string
          dual_licenses: boolean
          frontend: string
          id: number
          is_open_source: boolean
          is_proving_mainnet: boolean
          isa: string
          name: string
          parallelizable_proving: boolean
          precompiles: boolean
          repo_url: string
          slug: string
          team_id: string
        }
        Insert: {
          continuations?: boolean
          created_at?: string
          dual_licenses?: boolean
          frontend: string
          id?: number
          is_open_source?: boolean
          is_proving_mainnet?: boolean
          isa: string
          name: string
          parallelizable_proving?: boolean
          precompiles?: boolean
          repo_url: string
          slug: string
          team_id: string
        }
        Update: {
          continuations?: boolean
          created_at?: string
          dual_licenses?: boolean
          frontend?: string
          id?: number
          is_open_source?: boolean
          is_proving_mainnet?: boolean
          isa?: string
          name?: string
          parallelizable_proving?: boolean
          precompiles?: boolean
          repo_url?: string
          slug?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zkvms_team_id_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zkvms_team_id_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams_summary"
            referencedColumns: ["team_id"]
          },
        ]
      }
    }
    Views: {
      cluster_summary: {
        Row: {
          avg_cost_per_proof: number | null
          avg_proving_time: number | null
          cluster_id: string | null
          cluster_name: string | null
          team_id: string | null
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
      recent_summary: {
        Row: {
          avg_cost_per_proof: number | null
          avg_proving_time: number | null
          median_cost_per_proof: number | null
          median_proving_time: number | null
          total_proven_blocks: number | null
        }
        Relationships: []
      }
      teams_summary: {
        Row: {
          avg_cost_per_proof: number | null
          avg_cost_per_proof_multi: number | null
          avg_cost_per_proof_single: number | null
          avg_proving_time: number | null
          avg_proving_time_multi: number | null
          avg_proving_time_single: number | null
          logo_url: string | null
          team_id: string | null
          team_name: string | null
          total_proofs: number | null
          total_proofs_multi: number | null
          total_proofs_single: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      escape_markdown_v2: { Args: { input_text: string }; Returns: string }
      get_telegram_bot_token: { Args: never; Returns: string }
      get_vastai_api_key: { Args: never; Returns: string }
      is_allowed_apikey: {
        Args: {
          apikey: string
          keymode: Database["public"]["Enums"]["key_mode"][]
        }
        Returns: boolean
      }
      populate_missing_proofs_temp: { Args: never; Returns: number }
      send_proof_alerts: { Args: never; Returns: undefined }
      send_proof_alerts_from_temp: { Args: never; Returns: undefined }
      send_telegram_message: {
        Args: {
          bot_token: string
          chat_id: string
          message_text: string
          thread_id?: string
        }
        Returns: undefined
      }
      update_cluster_active_status: { Args: never; Returns: undefined }
      update_gpu_price_index: { Args: never; Returns: undefined }
    }
    Enums: {
      key_mode: "admin" | "read" | "write"
      severity_level: "red" | "yellow" | "green"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      key_mode: ["admin", "read", "write"],
      severity_level: ["red", "yellow", "green"],
    },
  },
} as const


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
      benchmarks: {
        Row: {
          created_at: string
          display_name: string
          id: number
          operation_type: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: number
          operation_type: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: number
          operation_type?: string
        }
        Relationships: []
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
          provider_id: number
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
          provider_id: number
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
          provider_id?: number
          region?: string
          snapshot_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cloud_instances_provider_id_cloud_providers_id_fk"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "cloud_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_providers: {
        Row: {
          created_at: string
          display_name: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      cluster_benchmarks: {
        Row: {
          benchmark_id: number
          cluster_id: string
          cost_usd: number
          created_at: string
          id: number
          time_ms: number
        }
        Insert: {
          benchmark_id: number
          cluster_id: string
          cost_usd: number
          created_at?: string
          id?: number
          time_ms: number
        }
        Update: {
          benchmark_id?: number
          cluster_id?: string
          cost_usd?: number
          created_at?: string
          id?: number
          time_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "cluster_benchmarks_benchmark_id_benchmarks_id_fk"
            columns: ["benchmark_id"]
            isOneToOne: false
            referencedRelation: "benchmarks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_benchmarks_cluster_id_clusters_id_fk"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "cluster_summary"
            referencedColumns: ["cluster_id"]
          },
          {
            foreignKeyName: "cluster_benchmarks_cluster_id_clusters_id_fk"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      cluster_machines: {
        Row: {
          cloud_instance_count: number
          cloud_instance_id: number
          cluster_version_id: number
          id: number
          machine_count: number | null
          machine_id: number | null
        }
        Insert: {
          cloud_instance_count: number
          cloud_instance_id: number
          cluster_version_id: number
          id?: number
          machine_count?: number | null
          machine_id?: number | null
        }
        Update: {
          cloud_instance_count?: number
          cloud_instance_id?: number
          cluster_version_id?: number
          id?: number
          machine_count?: number | null
          machine_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cluster_machines_cloud_instance_id_cloud_instances_id_fk"
            columns: ["cloud_instance_id"]
            isOneToOne: false
            referencedRelation: "cloud_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_machines_cluster_version_id_cluster_versions_id_fk"
            columns: ["cluster_version_id"]
            isOneToOne: false
            referencedRelation: "cluster_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_machines_machine_id_machines_id_fk"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      cluster_versions: {
        Row: {
          cluster_id: string
          created_at: string
          description: string | null
          id: number
          version: string
          zkvm_version_id: number
        }
        Insert: {
          cluster_id: string
          created_at?: string
          description?: string | null
          id?: number
          version: string
          zkvm_version_id: number
        }
        Update: {
          cluster_id?: string
          created_at?: string
          description?: string | null
          id?: number
          version?: string
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
          cycle_type: string | null
          description: string | null
          hardware: string | null
          id: string
          index: number | null
          is_active: boolean
          is_multi_gpu: boolean
          is_open_source: boolean
          nickname: string
          proof_type: string | null
          software_link: string | null
          team_id: string
        }
        Insert: {
          created_at?: string
          cycle_type?: string | null
          description?: string | null
          hardware?: string | null
          id?: string
          index?: number | null
          is_active?: boolean
          is_multi_gpu?: boolean
          is_open_source?: boolean
          nickname: string
          proof_type?: string | null
          software_link?: string | null
          team_id: string
        }
        Update: {
          created_at?: string
          cycle_type?: string | null
          description?: string | null
          hardware?: string | null
          id?: string
          index?: number | null
          is_active?: boolean
          is_multi_gpu?: boolean
          is_open_source?: boolean
          nickname?: string
          proof_type?: string | null
          software_link?: string | null
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
      machines: {
        Row: {
          cpu_cores: number | null
          cpu_model: string | null
          created_at: string
          gpu_count: number[] | null
          gpu_memory_gb: number[] | null
          gpu_models: string[] | null
          id: number
          memory_count: number[] | null
          memory_size_gb: number[] | null
          memory_type: string[] | null
          network_between_machines: string | null
          storage_size_gb: number | null
          total_tera_flops: number | null
        }
        Insert: {
          cpu_cores?: number | null
          cpu_model?: string | null
          created_at?: string
          gpu_count?: number[] | null
          gpu_memory_gb?: number[] | null
          gpu_models?: string[] | null
          id?: number
          memory_count?: number[] | null
          memory_size_gb?: number[] | null
          memory_type?: string[] | null
          network_between_machines?: string | null
          storage_size_gb?: number | null
          total_tera_flops?: number | null
        }
        Update: {
          cpu_cores?: number | null
          cpu_model?: string | null
          created_at?: string
          gpu_count?: number[] | null
          gpu_memory_gb?: number[] | null
          gpu_models?: string[] | null
          id?: number
          memory_count?: number[] | null
          memory_size_gb?: number[] | null
          memory_type?: string[] | null
          network_between_machines?: string | null
          storage_size_gb?: number | null
          total_tera_flops?: number | null
        }
        Relationships: []
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
          cluster_version_id: number
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
          cluster_version_id: number
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
          cluster_version_id?: number
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
            foreignKeyName: "proofs_cluster_version_id_cluster_versions_id_fk"
            columns: ["cluster_version_id"]
            isOneToOne: false
            referencedRelation: "cluster_versions"
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
          protocol_soundness: Database["public"]["Enums"]["severity_level"]
          quantum_security: Database["public"]["Enums"]["severity_level"]
          security_target_bits: number
          trusted_setup: boolean
          updated_at: string
          zkvm_id: number
        }
        Insert: {
          created_at?: string
          evm_stf_bytecode: Database["public"]["Enums"]["severity_level"]
          id?: number
          implementation_soundness: Database["public"]["Enums"]["severity_level"]
          max_bounty_amount: number
          protocol_soundness: Database["public"]["Enums"]["severity_level"]
          quantum_security: Database["public"]["Enums"]["severity_level"]
          security_target_bits: number
          trusted_setup?: boolean
          updated_at?: string
          zkvm_id: number
        }
        Update: {
          created_at?: string
          evm_stf_bytecode?: Database["public"]["Enums"]["severity_level"]
          id?: number
          implementation_soundness?: Database["public"]["Enums"]["severity_level"]
          max_bounty_amount?: number
          protocol_soundness?: Database["public"]["Enums"]["severity_level"]
          quantum_security?: Database["public"]["Enums"]["severity_level"]
          security_target_bits?: number
          trusted_setup?: boolean
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
          release_date: string | null
          version: string
          zkvm_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          release_date?: string | null
          version: string
          zkvm_id: number
        }
        Update: {
          created_at?: string
          id?: number
          release_date?: string | null
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
          cluster_nickname: string | null
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
      escape_markdown_v2: {
        Args: { input_text: string }
        Returns: string
      }
      get_telegram_bot_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_allowed_apikey: {
        Args: {
          apikey: string
          keymode: Database["public"]["Enums"]["key_mode"][]
        }
        Returns: boolean
      }
      populate_missing_proofs_temp: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      send_internal_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      send_internal_summary_from_temp: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      send_team_alerts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      send_team_alerts_from_temp: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      send_telegram_message: {
        Args: { bot_token: string; chat_id: string; message_text: string }
        Returns: Record<string, unknown>
      }
      update_cluster_active_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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

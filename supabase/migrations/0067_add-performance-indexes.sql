-- Proofs: block_number (standalone for JOIN lookups, most queries join on this)
CREATE INDEX IF NOT EXISTS proofs_block_number_idx ON proofs (block_number);

-- Proofs: partial index for proved proofs (nearly every query filters on this)
CREATE INDEX IF NOT EXISTS proofs_proved_status_idx
  ON proofs (block_number, cluster_version_id, proving_time)
  WHERE proof_status = 'proved';

-- Proofs: team_id (team-filtered queries and views)
CREATE INDEX IF NOT EXISTS proofs_team_id_idx ON proofs (team_id);

-- Proofs: proving_time (RTP threshold filters)
CREATE INDEX IF NOT EXISTS proofs_proving_time_idx ON proofs (proving_time)
  WHERE proving_time IS NOT NULL;

-- Proofs: gpu_price_index_id (cost calculation JOINs)
CREATE INDEX IF NOT EXISTS proofs_gpu_price_index_id_idx ON proofs (gpu_price_index_id)
  WHERE gpu_price_index_id IS NOT NULL;

-- Blocks: timestamp (time-range filters used in almost every metrics query)
CREATE INDEX IF NOT EXISTS blocks_timestamp_idx ON blocks ("timestamp")
  WHERE "timestamp" IS NOT NULL;

-- Clusters: partial index for active+approved (most cluster queries filter on this)
CREATE INDEX IF NOT EXISTS clusters_active_approved_idx
  ON clusters (id, team_id, prover_type_id, guest_program_id)
  WHERE is_active = true AND is_approved = true;

-- Clusters: team_id (team-filtered queries)
CREATE INDEX IF NOT EXISTS clusters_team_id_idx ON clusters (team_id);

-- Clusters: prover_type_id (GPU configuration JOINs)
CREATE INDEX IF NOT EXISTS clusters_prover_type_id_idx ON clusters (prover_type_id);

-- Downtime incidents: range lookup for is_downtime_block() function
CREATE INDEX IF NOT EXISTS downtime_incidents_block_range_idx
  ON downtime_incidents (start_block, end_block);

-- RTP cohort snapshots: composite for eligible snapshots at latest week
CREATE INDEX IF NOT EXISTS rtp_cohort_snapshots_week_eligible_idx
  ON rtp_cohort_snapshots (snapshot_week, is_eligible)
  WHERE is_eligible = true;

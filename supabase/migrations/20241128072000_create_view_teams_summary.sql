CREATE VIEW teams_summary AS
SELECT
  t.team_id,
  t.team_name,
  t.logo_url,
  AVG(p.proving_cost) AS average_proving_cost,
  AVG(p.proof_latency) AS average_proof_latency
FROM
  teams t
  LEFT JOIN proofs p ON t.user_id = p.user_id
WHERE
  p.proof_status = 'proved'
  AND p.proved_timestamp >= NOW() - INTERVAL '30 days'
GROUP BY
  t.team_id;
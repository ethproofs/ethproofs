INSERT INTO "public"."blocks" ("block_number", "timestamp", "gas_used", "transaction_count") VALUES
	(1, '2024-07-01 00:00:00', 1000000, 10),
	(2, '2024-07-01 01:00:00', 2000000, 20),
	(3, '2024-07-01 02:00:00', 1500000, 15),
	(4, '2024-07-01 03:00:00', 2500000, 25),
	(5, '2024-07-01 04:00:00', 3000000, 30);

INSERT INTO "public"."teams" ("team_id", "team_name") VALUES
	(1, 'Team Alpha'),
	(2, 'Team Beta');

INSERT INTO "public"."prover_machines" ("machine_id", "team_id", "machine_name") VALUES
	(1, 1, 'Machine A1'),
	(2, 1, 'Machine A2'),
	(3, 2, 'Machine B1'),
	(4, 2, 'Machine B2');

INSERT INTO "public"."proofs" ("proof_id", "block_number", "proof", "proof_status", "prover_machine_id", "prover_duration", "proving_cost", "proving_cycles", "submission_time", "team_id") VALUES
	(1, 1, '\xdeadbeef00', 'proved', 1, '00:30:00', 100.50, 1000000, '2024-07-01 00:30:00', 1),
	(2, 2, '\xbeefdead00', 'proved', 2, '00:45:00', 150.75, 1500000, '2024-07-01 01:45:00', 1),
	(3, 3, '\xfeedbeef00', 'proved', 3, '00:35:00', 120.00, 1200000, '2024-07-01 02:35:00', 2),
	(4, 4, '\xbadf00dd00', 'proved', 4, '01:00:00', 200.00, 2000000, '2024-07-01 04:00:00', 2),
	(5, 5, '\xf00dbeef00', 'proved', 1, '00:55:00', 175.25, 1750000, '2024-07-01 05:00:00', 1);

INSERT INTO "public"."recursive_root_proofs" ("root_proof_id", "block_number", "team_id", "root_proof", "root_proof_size", "total_proof_size") VALUES
	(1, 2, 1, '\xdeadfeed00', 4096, 8192),
	(2, 4, 2, '\xfeeddead00', 2048, 4096);


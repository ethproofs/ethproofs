INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'd6bfdf47-a222-46f8-b316-8dc4ed62e920', 'authenticated', 'authenticated', 'team1@test.com', '$2a$10$ZgKl8NwBBn/ksWEy9qFGeeZLlHbAihClZOo.ib.jQJUpLTXFmqwN.', '2024-09-18 11:21:33.795131+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-09-18 11:21:33.788952+00', '2024-09-18 11:21:33.795292+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '629f0be7-a78f-45a0-98a1-5fa07f76678c', 'authenticated', 'authenticated', 'team2@test.com', '$2a$10$B8s6rcgiHN6gaLhzmEbyVujtf1SDdZwVm/daxhGOtbYKawKqVZhKC', '2024-09-18 11:21:43.915812+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-09-18 11:21:43.913768+00', '2024-09-18 11:21:43.915941+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('d6bfdf47-a222-46f8-b316-8dc4ed62e920', 'd6bfdf47-a222-46f8-b316-8dc4ed62e920', '{"sub": "d6bfdf47-a222-46f8-b316-8dc4ed62e920", "email": "team1@test.com", "email_verified": false, "phone_verified": false}', 'email', '2024-09-18 11:21:33.789923+00', '2024-09-18 11:21:33.789958+00', '2024-09-18 11:21:33.789958+00', '1df11b52-7ab1-40dc-b931-62aad76cd4f2'),
	('629f0be7-a78f-45a0-98a1-5fa07f76678c', '629f0be7-a78f-45a0-98a1-5fa07f76678c', '{"sub": "629f0be7-a78f-45a0-98a1-5fa07f76678c", "email": "team2@test.com", "email_verified": false, "phone_verified": false}', 'email', '2024-09-18 11:21:43.91446+00', '2024-09-18 11:21:43.914488+00', '2024-09-18 11:21:43.914488+00', '52d42c76-0dd7-4946-8aec-8301891c70ce');

INSERT INTO "public"."api_auth_tokens" ("id", "mode", "created_at", "token", "user_id") VALUES
	('b5a87f7a-2eaf-452e-a55f-70806b027ffb', 'all', '2024-09-18 11:26:55.050949+00', '442845a3-5372-43d4-86ce-f72d45a4cf16', 'd6bfdf47-a222-46f8-b316-8dc4ed62e920');

INSERT INTO "public"."blocks" ("block_number", "timestamp", "gas_used", "transaction_count") VALUES
	(1, '2024-07-01 00:00:00', 1000000, 10),
	(2, '2024-07-01 01:00:00', 2000000, 20),
	(3, '2024-07-01 02:00:00', 1500000, 15),
	(4, '2024-07-01 03:00:00', 2500000, 25),
	(5, '2024-07-01 04:00:00', 3000000, 30);

INSERT INTO "public"."prover_machines" ("machine_name", "user_id") VALUES
	('Machine A1', 'd6bfdf47-a222-46f8-b316-8dc4ed62e920'),
	('Machine A2', 'd6bfdf47-a222-46f8-b316-8dc4ed62e920'),
	('Machine B1', '629f0be7-a78f-45a0-98a1-5fa07f76678c'),
	('Machine B2', '629f0be7-a78f-45a0-98a1-5fa07f76678c');

INSERT INTO "public"."proofs" ("block_number", "proof", "proof_status", "prover_machine_id", "prover_duration", "proving_cost", "proving_cycles", "submission_time", "user_id") VALUES
	(1, '\xdeadbeef00', 'proved', 1, '00:30:00', 100.50, 1000000, '2024-07-01 00:30:00+00', 'd6bfdf47-a222-46f8-b316-8dc4ed62e920'),
	(2, '\xbeefdead00', 'proved', 2, '00:45:00', 150.75, 1500000, '2024-07-01 01:45:00+00', 'd6bfdf47-a222-46f8-b316-8dc4ed62e920'),
	(3, '\xfeedbeef00', 'proved', 3, '00:35:00', 120.00, 1200000, '2024-07-01 02:35:00+00', '629f0be7-a78f-45a0-98a1-5fa07f76678c'),
	(4, '\xbadf00dd00', 'proved', 4, '01:00:00', 200.00, 2000000, '2024-07-01 04:00:00+00', '629f0be7-a78f-45a0-98a1-5fa07f76678c'),
	(5, '\xf00dbeef00', 'proved', 1, '00:55:00', 175.25, 1750000, '2024-07-01 05:00:00+00', 'd6bfdf47-a222-46f8-b316-8dc4ed62e920');

INSERT INTO "public"."recursive_root_proofs" ("block_number", "root_proof", "root_proof_size", "total_proof_size", "user_id") VALUES
	(2, '\xdeadfeed00', 4096, 8192, 'd6bfdf47-a222-46f8-b316-8dc4ed62e920'),
	(4, '\xfeeddead00', 2048, 4096, '629f0be7-a78f-45a0-98a1-5fa07f76678c');

INSERT INTO "public"."teams" ("team_name", "user_id") VALUES
	('Team Alpha', 'd6bfdf47-a222-46f8-b316-8dc4ed62e920'),
	('Team Beta', '629f0be7-a78f-45a0-98a1-5fa07f76678c');
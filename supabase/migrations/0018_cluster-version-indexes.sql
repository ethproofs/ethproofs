CREATE INDEX "cluster_machines_cluster_version_id_idx" ON "cluster_machines" USING btree ("cluster_version_id");--> statement-breakpoint
CREATE INDEX "cluster_machines_cloud_instance_id_idx" ON "cluster_machines" USING btree ("cloud_instance_id");--> statement-breakpoint
CREATE INDEX "cluster_versions_cluster_id_idx" ON "cluster_versions" USING btree ("cluster_id");--> statement-breakpoint
CREATE INDEX "proofs_cluster_version_id_idx" ON "proofs" USING btree ("cluster_version_id");
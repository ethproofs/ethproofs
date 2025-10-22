ALTER TABLE "clusters" ADD COLUMN "is_active" boolean DEFAULT false NOT NULL;

-- Create the update function
CREATE OR REPLACE FUNCTION update_cluster_active_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- Set all clusters to inactive
    UPDATE public.clusters SET is_active = false;

    -- Set clusters to active if they have a recent proof
    UPDATE public.clusters
    SET is_active = true
    WHERE id IN (
        SELECT cv.cluster_id
        FROM public.proofs p
        JOIN public.cluster_versions cv ON p.cluster_version_id = cv.id
        WHERE p.proof_status = 'proved'
          AND p.proved_timestamp >= now() - interval '7 days'
        GROUP BY cv.cluster_id
    );
END;
$$;
-- Update the cluster active status check interval from 7 days to 6 hours
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
          AND p.proved_timestamp >= now() - interval '6 hours'
        GROUP BY cv.cluster_id
    );
END;
$$;

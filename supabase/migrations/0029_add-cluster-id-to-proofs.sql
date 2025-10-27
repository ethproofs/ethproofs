-- Add cluster_id column to proofs table for direct access without traversing cluster_version
ALTER TABLE public.proofs
ADD COLUMN cluster_id uuid;

-- Populate cluster_id from cluster_version relationship
UPDATE public.proofs p
SET cluster_id = cv.cluster_id
FROM public.cluster_versions cv
WHERE p.cluster_version_id = cv.id;

-- Add foreign key constraint
ALTER TABLE public.proofs
ADD CONSTRAINT proofs_cluster_id_fkey
FOREIGN KEY (cluster_id) REFERENCES public.clusters(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Make cluster_id NOT NULL since all proofs should have a cluster
ALTER TABLE public.proofs
ALTER COLUMN cluster_id SET NOT NULL;
# Scripts

## GPU Price Index Scripts

These scripts help preserve historical pricing data when transitioning from the old `cloud_instances` table structure to the new `gpu_price_index` system.

### How backfill works

The migration `0042_drop-machines.sql` includes this backfill logic:

```sql
UPDATE proofs p
SET gpu_price_index_id = COALESCE(
  (
    SELECT gpi.id
    FROM gpu_price_index gpi
    WHERE gpi.created_at <= COALESCE(p.proved_timestamp, p.created_at)
    ORDER BY gpi.created_at DESC
    LIMIT 1
  ),
  1
)
WHERE p.proof_status = 'proved';
```

**How quarterly matching works**: If you have these quarterly prices:
- Q1 2024: `id=2`, `created_at=2024-01-01`
- Q2 2024: `id=3`, `created_at=2024-04-01`
- Q3 2024: `id=4`, `created_at=2024-07-01`

A proof with `proved_timestamp=2024-05-15` will get `gpu_price_index_id=3` (Q2 2024) because:
1. Filters to entries where `created_at <= 2024-05-15` → finds Q1 and Q2
2. Orders by `created_at DESC` → Q2 first (most recent)
3. Takes LIMIT 1 → selects Q2

---

## create-historical-gpu-prices.ts

**Purpose**: Creates historical GPU price index entries based on quarterly averages from existing `cloud_instances` data.

**When to use**: Run this BEFORE migration `0042_drop-machines.sql` to preserve historical pricing data.

**What it does**:
1. Reads all historical proofs with their cloud instance pricing
2. Calculates per-GPU prices: `(cloud_instance_count * instance_price) / total_gpus`
3. Groups by quarter and creates one `gpu_price_index` entry per quarter (Q1-Q4 for each year)
4. Sets `created_at` to quarter start date (e.g., 2024-01-01 for Q1 2024)
5. Inserts entries into `gpu_price_index` table

**Usage**:
```bash
# Run this BEFORE migration 0042
npx tsx scripts/create-historical-gpu-prices.ts

# Review the output, then run migration 0042
```

**Output**:
- Number of quarters found
- Number of proofs per quarter
- Average per-GPU price for each quarter
- List of created `gpu_price_index` entries

**Notes**:
- Safe to run multiple times (uses `ON CONFLICT DO NOTHING`)
- Only creates entries for quarters that have proof data
- Does not modify existing data, only inserts new entries

---

## preview-historical-gpu-prices.ts

**Purpose**: PREVIEW what quarterly price entries would be created, without actually inserting them (READ-ONLY).

**When to use**:
- When you need to see what historical prices exist without modifying the database
- Safe to run against production to extract historical pricing data
- Useful if you already ran migration 0042 and need to recreate historical prices

**What it does**:
1. Analyzes historical proofs and cloud instance data
2. Calculates quarterly average per-GPU prices (same logic as `create-historical-gpu-prices.ts`)
3. Shows what WOULD be created without actually inserting
4. Outputs SQL INSERT statements you can copy and run manually

**Usage**:
```bash
# Safe to run against production - does NOT modify data
DATABASE_URL="production-url" npx tsx scripts/preview-historical-gpu-prices.ts

# Copy the INSERT statements from the output
# Run them manually against your local database
```

**Output**:
- Analysis of quarters with proof data
- SQL INSERT statements ready to copy/paste
- Instructions for next steps

**Notes**:
- READ-ONLY - never modifies database
- Safe to run against production
- Use this if you already ran migration 0042 and lost historical data

---

## backfill-proof-prices.ts

**Purpose**: Re-run the backfill logic to update `gpu_price_index_id` for existing proofs.

**When to use**:
- After manually creating `gpu_price_index` entries from preview script
- When proofs have `NULL` gpu_price_index_id values
- To fix incorrect price assignments

**What it does**:
1. Shows all available `gpu_price_index` entries
2. Counts proofs that need updating
3. Updates proofs to link them to appropriate gpu_price_index based on `proved_timestamp`
4. Shows distribution of proofs across price entries

**Usage**:
```bash
# After manually creating gpu_price_index entries
npx tsx scripts/backfill-proof-prices.ts
```

**Output**:
- List of available price index entries
- Count of proofs needing updates
- Number of proofs updated
- Distribution showing how many proofs use each price entry

**Notes**:
- Uses the same backfill logic from migration 0042
- Can be run multiple times safely
- Only updates proofs with NULL gpu_price_index_id

---

## Workflow Examples

### Fresh migration (before running 0042)
```bash
# 1. Create historical price entries
npx tsx scripts/create-historical-gpu-prices.ts

# 2. Run migration 0042 (will auto-backfill)
# drizzle-kit push or your migration tool
```

### Already ran migration 0042 and lost historical data
```bash
# 1. Preview historical prices from production (safe, read-only)
DATABASE_URL="production-url" npx tsx scripts/preview-historical-gpu-prices.ts

# 2. Copy the INSERT statements and run them manually in your local DB

# 3. Run backfill script to update proofs
npx tsx scripts/backfill-proof-prices.ts
```

-- Comparison report pricing: relationship types, upgrade purchases, partner credits

-- Add relationship type to invites (couples or cofounders)
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS relationship_type text
  CHECK (relationship_type IN ('couples', 'cofounders'));

-- Track which purchase unlocked the comparison
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS comparison_purchase_id uuid
  REFERENCES public.purchases(id);

-- Add relationship type to reports
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS relationship_type text
  CHECK (relationship_type IN ('couples', 'cofounders'));

-- Add upgrade purchase types
ALTER TYPE purchase_type ADD VALUE IF NOT EXISTS 'couples_upgrade';
ALTER TYPE purchase_type ADD VALUE IF NOT EXISTS 'cofounders_upgrade';
ALTER TYPE purchase_type ADD VALUE IF NOT EXISTS 'couples_upgrade_single';
ALTER TYPE purchase_type ADD VALUE IF NOT EXISTS 'cofounders_upgrade_single';

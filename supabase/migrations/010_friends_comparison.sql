-- Add "friends" to relationship_type constraints on invites and reports tables

-- Update invites constraint
ALTER TABLE public.invites
DROP CONSTRAINT IF EXISTS invites_relationship_type_check;

ALTER TABLE public.invites
ADD CONSTRAINT invites_relationship_type_check
CHECK (relationship_type IN ('couples', 'cofounders', 'friends'));

-- Update reports constraint
ALTER TABLE public.reports
DROP CONSTRAINT IF EXISTS reports_relationship_type_check;

ALTER TABLE public.reports
ADD CONSTRAINT reports_relationship_type_check
CHECK (relationship_type IN ('couples', 'cofounders', 'friends'));

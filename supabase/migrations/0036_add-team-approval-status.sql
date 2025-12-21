-- Custom SQL migration file, put your code below! --

-- Add approval status to teams table
ALTER TABLE teams ADD COLUMN approved BOOLEAN NOT NULL DEFAULT false;

-- Create an index on the approved column for faster queries
CREATE INDEX teams_approved_idx ON teams(approved);

-- Set existing teams to approved (so they continue working)
UPDATE teams SET approved = true;
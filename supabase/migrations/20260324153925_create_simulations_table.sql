/*
  # Create Simulations History Table

  1. New Tables
    - `simulations`
      - `id` (uuid, primary key) - Unique identifier for each simulation
      - `city` (text) - City name where simulation was run
      - `parameters` (jsonb) - All simulation parameters as JSON
      - `results` (jsonb) - Simulation results including metrics
      - `insights` (text) - AI-generated insights text
      - `recommendations` (jsonb) - Array of AI recommendations
      - `created_at` (timestamptz) - When the simulation was run
      - `user_id` (uuid, nullable) - Future: link to authenticated users

  2. Security
    - Enable RLS on `simulations` table
    - Add policy for anonymous users to insert their simulations
    - Add policy for users to read all simulations (for analytics)
*/

CREATE TABLE IF NOT EXISTS simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  parameters jsonb NOT NULL DEFAULT '{}',
  results jsonb NOT NULL DEFAULT '{}',
  insights text DEFAULT '',
  recommendations jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  user_id uuid
);

ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert simulations"
  ON simulations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view simulations"
  ON simulations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS simulations_city_idx ON simulations(city);
CREATE INDEX IF NOT EXISTS simulations_created_at_idx ON simulations(created_at DESC);

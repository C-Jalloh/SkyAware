-- Create the database schema for TEMPO AQI data
CREATE TABLE IF NOT EXISTS tempo_aqi (
    timestamp TIMESTAMP PRIMARY KEY,
    data JSONB
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_tempo_aqi_timestamp ON tempo_aqi (timestamp DESC);
-- CMS Content Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Main content table
CREATE TABLE IF NOT EXISTS cms_content (
    id TEXT PRIMARY KEY,  -- The data-cms-ref value
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'rich-text', 'image', 'link')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Version history table (optional)
CREATE TABLE IF NOT EXISTS cms_content_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id TEXT NOT NULL REFERENCES cms_content(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cms_content_history_content_id ON cms_content_history(content_id);
CREATE INDEX IF NOT EXISTS idx_cms_content_updated_at ON cms_content(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can read content
CREATE POLICY "Everyone can read content"
ON cms_content FOR SELECT
USING (true);

-- Editors can update content
-- Note: You'll need to set up custom claims or use user metadata for the 'editor' role
CREATE POLICY "Editors can update content"
ON cms_content FOR UPDATE
USING (
    auth.jwt() ->> 'role' = 'editor' OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'editor'
);

-- Editors can insert content
CREATE POLICY "Editors can insert content"
ON cms_content FOR INSERT
WITH CHECK (
    auth.jwt() ->> 'role' = 'editor' OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'editor'
);

-- History policies
CREATE POLICY "Everyone can read history"
ON cms_content_history FOR SELECT
USING (true);

CREATE POLICY "Editors can insert history"
ON cms_content_history FOR INSERT
WITH CHECK (
    auth.jwt() ->> 'role' = 'editor' OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'editor'
);

-- Function to automatically create history on update
CREATE OR REPLACE FUNCTION create_content_history()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO cms_content_history (content_id, content)
    VALUES (OLD.id, OLD.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create history before update
DROP TRIGGER IF EXISTS content_history_trigger ON cms_content;
CREATE TRIGGER content_history_trigger
    BEFORE UPDATE ON cms_content
    FOR EACH ROW
    EXECUTE FUNCTION create_content_history();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_cms_content_updated_at ON cms_content;
CREATE TRIGGER update_cms_content_updated_at
    BEFORE UPDATE ON cms_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

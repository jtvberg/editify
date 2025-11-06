-- RLS Policies for Repeatable Content
-- Run this after repeatable-content.sql
-- Requires is_editor() function from supabase-rls-policies.sql

-- SELECT: Everyone can view repeatable content
CREATE POLICY "Anyone can view repeatable content"
ON content_repeatable FOR SELECT
USING (true);

-- INSERT: Only editors can create repeatable content
CREATE POLICY "Editors can create repeatable content"
ON content_repeatable FOR INSERT
WITH CHECK (public.is_editor());

-- UPDATE: Only editors can update repeatable content
CREATE POLICY "Editors can update repeatable content"
ON content_repeatable FOR UPDATE
USING (public.is_editor());

-- DELETE: Only editors can delete repeatable content
CREATE POLICY "Editors can delete repeatable content"
ON content_repeatable FOR DELETE
USING (public.is_editor());

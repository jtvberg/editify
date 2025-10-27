-- ============================================
-- Complete RLS Policy Update for CMS Content
-- ============================================
-- This script safely updates the RLS policies to use a security definer function
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can read content" ON cms_content;
DROP POLICY IF EXISTS "Editors can update content" ON cms_content;
DROP POLICY IF EXISTS "Editors can insert content" ON cms_content;
DROP POLICY IF EXISTS "Everyone can read history" ON cms_content_history;
DROP POLICY IF EXISTS "Editors can insert history" ON cms_content_history;
DROP POLICY IF EXISTS "System can insert history" ON cms_content_history;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.is_editor();

-- Create a security definer function to check if user is an editor
-- This function runs with the privileges of the user who created it (postgres)
-- allowing it to read from auth.users table
CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'role' = 'editor'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$;

-- Recreate RLS policies using the security definer function

-- CMS Content Policies
CREATE POLICY "Everyone can read content"
ON cms_content FOR SELECT
USING (true);

CREATE POLICY "Editors can update content"
ON cms_content FOR UPDATE
USING (public.is_editor());

CREATE POLICY "Editors can insert content"
ON cms_content FOR INSERT
WITH CHECK (public.is_editor());

-- CMS Content History Policies
CREATE POLICY "Everyone can read history"
ON cms_content_history FOR SELECT
USING (true);

-- Allow the trigger to insert history (no user check needed for trigger inserts)
CREATE POLICY "System can insert history"
ON cms_content_history FOR INSERT
WITH CHECK (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('cms_content', 'cms_content_history')
ORDER BY tablename, policyname;

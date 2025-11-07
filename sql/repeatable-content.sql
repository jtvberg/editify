-- Repeatable Content Schema
-- Run this after supabase-schema.sql
-- This stores structure/ordering only - actual content lives in cms_content

-- Table for repeatable component structure
CREATE TABLE IF NOT EXISTS content_repeatable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_ref TEXT NOT NULL,  -- e.g., 'portfolio.projects'
    component_type TEXT NOT NULL CHECK (component_type IN ('Card', 'Carousel', 'Section', 'Tag')),
    position INTEGER NOT NULL DEFAULT 0,
    -- data contains REFERENCES to cms_content IDs, not actual content
    -- Example: {"title_ref": "portfolio.projects.{uuid}.title", "description_ref": "...", "image_ref": "..."}
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_repeatable_parent_ref ON content_repeatable(parent_ref);
CREATE INDEX IF NOT EXISTS idx_content_repeatable_position ON content_repeatable(parent_ref, position);

-- Enable RLS
ALTER TABLE content_repeatable ENABLE ROW LEVEL SECURITY;

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_repeatable_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS repeatable_update_timestamp ON content_repeatable;
CREATE TRIGGER repeatable_update_timestamp
    BEFORE UPDATE ON content_repeatable
    FOR EACH ROW
    EXECUTE FUNCTION update_repeatable_updated_at();

-- Trigger: Reorder positions on delete
CREATE OR REPLACE FUNCTION reorder_repeatable_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE content_repeatable
    SET position = position - 1
    WHERE parent_ref = OLD.parent_ref
    AND position > OLD.position;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS repeatable_reorder_on_delete ON content_repeatable;
CREATE TRIGGER repeatable_reorder_on_delete
    AFTER DELETE ON content_repeatable
    FOR EACH ROW
    EXECUTE FUNCTION reorder_repeatable_on_delete();

-- Trigger: Auto-create cms_content entries for new repeatable items
CREATE OR REPLACE FUNCTION create_repeatable_cms_content()
RETURNS TRIGGER AS $$
DECLARE
    base_ref TEXT;
    field_refs JSONB;
BEGIN
    base_ref := NEW.parent_ref || '.' || NEW.id::TEXT;
    field_refs := '{}';
    
    -- Create cms_content entries based on component type
    IF NEW.component_type = 'Card' THEN
        -- Title field
        INSERT INTO cms_content (id, content, type, updated_at)
        VALUES (base_ref || '.title', '', 'text', NOW());
        field_refs := field_refs || jsonb_build_object('title_ref', base_ref || '.title');
        
        -- Description field
        INSERT INTO cms_content (id, content, type, updated_at)
        VALUES (base_ref || '.description', '', 'html', NOW());
        field_refs := field_refs || jsonb_build_object('description_ref', base_ref || '.description');
        
        -- Image field
        INSERT INTO cms_content (id, content, type, updated_at)
        VALUES (base_ref || '.image', '', 'image', NOW());
        field_refs := field_refs || jsonb_build_object('image_ref', base_ref || '.image');
        
        -- Link field
        INSERT INTO cms_content (id, content, type, updated_at)
        VALUES (base_ref || '.link', '', 'text', NOW());
        field_refs := field_refs || jsonb_build_object('link_ref', base_ref || '.link');
        
    ELSIF NEW.component_type = 'Carousel' THEN
        -- Carousel fields (TBD)
        INSERT INTO cms_content (id, content, type, updated_at)
        VALUES (base_ref || '.quote', '', 'html', NOW());
        field_refs := field_refs || jsonb_build_object('quote_ref', base_ref || '.quote');

        INSERT INTO cms_content (id, content, type, updated_at)
        VALUES (base_ref || '.name', '', 'text', NOW());
        field_refs := field_refs || jsonb_build_object('name_ref', base_ref || '.name');
        
    ELSIF NEW.component_type = 'Section' THEN
        -- Section fields: title and description
        INSERT INTO cms_content (id, content, type, updated_at)
        VALUES (base_ref || '.title', '', 'text', NOW());
        field_refs := field_refs || jsonb_build_object('title_ref', base_ref || '.title');
        
        INSERT INTO cms_content (id, content, type, updated_at)
        VALUES (base_ref || '.description', '', 'html', NOW());
        field_refs := field_refs || jsonb_build_object('description_ref', base_ref || '.description');
        
    ELSIF NEW.component_type = 'Tag' THEN
        -- Tag label field
        INSERT INTO cms_content (id, content, type, updated_at)
        VALUES (base_ref || '.label', '', 'text', NOW());
        field_refs := field_refs || jsonb_build_object('label_ref', base_ref || '.label');
    END IF;
    
    -- Update data field with references
    NEW.data := NEW.data || field_refs;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS repeatable_create_cms_content ON content_repeatable;
CREATE TRIGGER repeatable_create_cms_content
    BEFORE INSERT ON content_repeatable
    FOR EACH ROW
    EXECUTE FUNCTION create_repeatable_cms_content();

-- Trigger: Clean up cms_content entries when repeatable item is deleted
CREATE OR REPLACE FUNCTION delete_repeatable_cms_content()
RETURNS TRIGGER AS $$
DECLARE
    base_ref TEXT;
BEGIN
    base_ref := OLD.parent_ref || '.' || OLD.id::TEXT;
    
    -- Delete all cms_content entries for this item
    DELETE FROM cms_content WHERE id LIKE base_ref || '.%';
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS repeatable_delete_cms_content ON content_repeatable;
CREATE TRIGGER repeatable_delete_cms_content
    AFTER DELETE ON content_repeatable
    FOR EACH ROW
    EXECUTE FUNCTION delete_repeatable_cms_content();

-- Comments
COMMENT ON TABLE content_repeatable IS 'Stores repeatable component structure - content lives in cms_content';
COMMENT ON COLUMN content_repeatable.data IS 'JSONB with refs to cms_content (e.g., {"title_ref": "portfolio.projects.uuid.title"})';

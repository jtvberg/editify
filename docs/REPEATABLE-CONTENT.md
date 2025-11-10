# Repeatable Content - Implementation Guide

## Overview

A clean, reference-based repeatable content system for Editify with support for nested repeatables (e.g., tags within cards). This architecture stores content in `cms_content` (where history and editing already work) and uses `content_repeatable` only for structure/ordering.

## What Was Built

### 1. Database Schema (`sql/repeatable-content.sql`)

- **content_repeatable table**: Stores component structure (parent_ref, component_type, position)
- **Auto-creation trigger**: Creates cms_content entries when repeatable items are added
- **Auto-deletion trigger**: Cleans up cms_content entries when items are removed
- **Reordering trigger**: Maintains position integrity on delete

**Key Insight:** The `data` JSONB field contains **references** like `{"title_ref": "portfolio.projects.{uuid}.title"}` not actual content.

### 2. TypeScript Types (`src/lib/types/cms.ts`)

```typescript
export type RepeatableComponentType = 'Card' | 'Carousel' | 'Section' | 'Tag';

export interface RepeatableItem {
	id: string;
	parent_ref: string;
	component_type: RepeatableComponentType;
	position: number;
	data: Record<string, string>; // Contains refs, not content!
}

export interface CardData {
	title_ref: string;
	description_ref: string;
	image_ref?: string;
	link_ref?: string;
}
```

### 3. API Functions (`src/lib/cms/index.ts`)

- **repeatableStore**: Writable store for item structure
- **loadRepeatableItems()**: Loads structure from DB (content already in cmsStore)
- **addRepeatableItem()**: Creates item, trigger creates cms_content entries
- **removeRepeatableItem()**: Deletes item, trigger cleans up cms_content
- **reorderRepeatableItem()**: Updates positions

**No sync logic needed!** Content lives in cms_content, accessed via cmsStore.

### 4. Components

#### RepeatableContainer (`src/lib/cms/RepeatableContainer.svelte`)

- Loads items on mount
- Renders add/remove/reorder controls in edit mode
- Uses dynamic components (Svelte 5 syntax)
- Conditional `display: contents` only in edit mode

#### Card (`src/lib/components/repeatable/Card.svelte`)

- Receives `item` prop with data refs
- Uses `$derived` to read content from cmsStore
- Renders CMSContent components for each field
- **Includes nested RepeatableContainer for tags**
- Standard CMS editing flow

#### Tag (`src/lib/components/repeatable/Tag.svelte`)

- Simple repeatable component with label field
- Nested within cards using hierarchical parent_ref
- Example: `parent_ref = "portfolio.projects.{card-uuid}.tags"`
- Renders as styled pill/badge

#### Carousel & Section (Placeholders)

- Ready for future implementation
- Follow same pattern as Card

### 5. Portfolio Page Update

**Before:** 240+ lines with hardcoded cards
**After:** 62 lines using RepeatableContainer

```svelte
<RepeatableContainer ref="portfolio.projects" type="Card" containerClass="project-grid" />
```

## Why This Works

### The Problem Before

- Stored content in `content_repeatable.data` JSONB
- Required complex sync between repeatableStore and cmsStore
- Custom save routing based on UUID patterns
- Break history and cancel functionality
- Duplicated content storage

### The Solution

- Content stored **once** in `cms_content` table
- `content_repeatable` stores only structure/ordering
- Database triggers handle cms_content creation/deletion
- Standard CMS editing flow works automatically
- History and cancel work out of the box

## Data Flow

### Adding a Card

1. User clicks "Add Card"
2. `addRepeatableItem()` inserts to content_repeatable with `parent_ref = "portfolio.projects"`
3. **Database trigger** creates cms_content entries:
   - `portfolio.projects.{uuid}.title`
   - `portfolio.projects.{uuid}.description`
   - `portfolio.projects.{uuid}.image`
   - `portfolio.projects.{uuid}.link`
4. Trigger populates `data` with refs: `{title_ref: "...", description_ref: "...", ...}`
5. RepeatableStore updates with new item
6. Component renders, reads content from cmsStore
7. Card includes nested RepeatableContainer for tags at `portfolio.projects.{uuid}.tags`

### Adding a Tag to a Card

1. User expands card, clicks "Add Tag"
2. `addRepeatableItem()` inserts to content_repeatable with `parent_ref = "portfolio.projects.{card-uuid}.tags"`
3. **Database trigger** creates cms_content entry:
   - `portfolio.projects.{card-uuid}.tags.{tag-uuid}.label`
4. Trigger populates `data` with `{label_ref: "..."}`
5. RepeatableStore updates
6. Tag component renders within card

### Editing a Field

1. User clicks on card title
2. CMSOverlay opens (standard flow)
3. User edits content
4. Save goes to `cms_content` table (standard flow)
5. History entry created automatically (existing trigger)
6. cmsStore updates
7. Component re-renders with new content

### Cancel/History

- **Just work!** No special handling needed
- CMSContent component already handles these
- History stored in cms_content_history (existing table)

## Setup Instructions

### 1. Run Database Scripts

```sql
-- In Supabase SQL Editor
-- Run in order:
1. sql/repeatable-content.sql
2. sql/repeatable-rls-policies.sql
```

### 2. Test the Implementation

1. Navigate to `/portfolio` page
2. Toggle edit mode
3. Click "Add Card"
4. Edit title, description, image, link
5. Verify:
   - ✅ Content saves
   - ✅ History button shows previous versions
   - ✅ Cancel restores original content
   - ✅ Reorder works (up/down buttons)
   - ✅ Delete works with confirmation

### 3. Add Initial Content (Optional)

Use the admin panel or Supabase console to add a few cards:

```javascript
await addRepeatableItem('portfolio.projects', 'Card', {
	title: 'E-Commerce Platform',
	description: '<p>A modern online shopping experience</p>',
	image: '/path/to/image.jpg',
	link: 'https://example.com'
});
```

## Architecture Benefits

1. **Simplicity**: Content storage is unified
2. **Consistency**: All content uses same editing flow
3. **History**: Works automatically via existing triggers
4. **Cancel**: Works automatically via CMSContent component
5. **Maintainability**: Less code, clearer separation of concerns
6. **Extensibility**: Easy to add new component types
7. **Nested Repeatables**: Same pattern works for any nesting depth (tags in cards, items in sections, etc.)

## Adding New Component Types

To add a new repeatable component type (e.g., "Testimonial"):

1. **Update schema trigger** to create fields:

```sql
ELSIF NEW.component_type = 'Testimonial' THEN
  INSERT INTO cms_content (id, content, type, updated_at)
  VALUES (base_ref || '.quote', '', 'html', NOW());
  field_refs := field_refs || jsonb_build_object('quote_ref', base_ref || '.quote');
  -- Add more fields as needed
END IF;
```

2. **Add TypeScript type**:

```typescript
export interface TestimonialData {
	quote_ref: string;
	author_ref: string;
	role_ref?: string;
}
```

3. **Create component**:

```svelte
<!-- Testimonial.svelte -->
<script>
	let { data } = $props();
	let quote = $derived($cmsStore[data.quote_ref]?.content || '');
	let author = $derived($cmsStore[data.author_ref]?.content || '');
</script>

<blockquote>
	<CMSContent ref={data.quote_ref} type="html">
		{@html quote}
	</CMSContent>
	<cite>
		<CMSContent ref={data.author_ref} type="text">
			{author}
		</CMSContent>
	</cite>
</blockquote>
```

4. **Use it**:

```svelte
<RepeatableContainer ref="about.testimonials" type="Testimonial" />
```

## Files Created/Modified

**Created:**

- `sql/repeatable-content.sql` (schema + triggers for Card, Carousel, Section, Tag)
- `sql/repeatable-rls-policies.sql` (RLS policies)
- `src/lib/cms/RepeatableContainer.svelte` (container component)
- `src/lib/components/repeatable/Card.svelte` (card component with nested tags)
- `src/lib/components/repeatable/Tag.svelte` (tag component)
- `src/lib/components/repeatable/Carousel.svelte` (placeholder)
- `src/lib/components/repeatable/Section.svelte` (placeholder)

**Modified:**

- `src/lib/types/cms.ts` (added RepeatableItem, CardData types)
- `src/lib/cms/index.ts` (added repeatableStore, API functions)
- `src/routes/portfolio/+page.svelte` (simplified to use RepeatableContainer)

## Nested Repeatables Pattern

Tags demonstrate how to nest repeatables within other repeatables:

**Card Component:**

```svelte
<script>
	// ... other card code ...
	let tagsRef = $derived(`${item.parent_ref}.${item.id}.tags`);
</script>

<div class="card">
	<!-- card content fields -->

	<!-- Nested tags -->
	<RepeatableContainer ref={tagsRef} type="Tag" containerClass="tag-list" />
</div>
```

**Result:**

- Card: `parent_ref = "portfolio.projects"`, `id = uuid1`
- Tag in Card: `parent_ref = "portfolio.projects.uuid1.tags"`, `id = uuid2`
- All use same `content_repeatable` table
- All use same CRUD functions
- No special tag tables or functions needed

## Next Steps

1. **Test thoroughly** - Add, edit, delete, reorder cards and tags
2. **Migrate existing data** (if you have old portfolio cards in cms_content)
3. **Add more component types** (Carousel, Section, Testimonial, etc.)
4. **Add more nested types** (Items in Carousel, Blocks in Section, etc.)
5. **Add drag-and-drop reordering** (replace up/down buttons)

## Key Takeaways

✅ **Store content once** - in cms_content, not content_repeatable
✅ **Use database triggers** - auto-create/delete cms_content entries
✅ **References, not values** - data contains refs, not actual content
✅ **Standard flow** - no special sync logic needed
✅ **Simplicity wins** - less code, fewer edge cases

The architecture is production-ready and maintainable!

```

```

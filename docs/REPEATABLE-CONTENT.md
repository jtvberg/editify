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
export type RepeatableComponentType = 'Card' | 'Section' | 'Tag' | 'Quote' | 'AccordionItem';
// Note: Carousel and Accordion are page-level containers, not repeatable item types

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
- Supports: `Card`, `Section`, `Tag`, `Quote`

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

#### Quote (`src/lib/components/repeatable/Quote.svelte`)

- Three editable fields: `quote` (html), `author` (text), `role` (text)
- Designed for testimonials
- Styled as a blockquote with decorative opening mark
- Used as the item type inside a Carousel

#### Section (`src/lib/components/repeatable/Section.svelte`)

- Two editable fields: `title` (text), `description` (html)
- Used standalone with `RepeatableContainer`

#### Carousel (`src/lib/components/Carousel.svelte`) — Page-Level Container

Carousel is **not** a repeatable item — it is a standalone page component placed directly in a route:

```svelte
<Carousel ref="home.testimonials" type="Quote" />
```

- **View mode**: single-item display with prev/next arrows, dot indicators, slide transition animation
- **Edit mode**: delegates entirely to `RepeatableContainer` (identical add/remove/reorder UX)
- Accepts `autoRotate` boolean prop (default `false`) and `autoRotateDelay` (default 5000ms)
- Currently supports `Quote` as item type; extend `componentMap` for additional types

#### Accordion (`src/lib/components/Accordion.svelte`) — Page-Level Container

Accordion is **not** a repeatable item — it is a standalone page component:

```svelte
<Accordion ref="faq.items" />
```

- **View mode**: clickable title headers with expand/collapse animation; only one section open at a time
- **Edit mode**: delegates to `RepeatableContainer`
- Default item type is `AccordionItem` (title + content)

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

### Adding a Quote to a Carousel

1. Place `<Carousel ref="home.testimonials" type="Quote" />` on a page
2. Toggle edit mode — Carousel shows RepeatableContainer controls
3. Click "Add Quote"
4. `addRepeatableItem()` inserts to content_repeatable with `parent_ref = "home.testimonials"`
5. **Database trigger** creates cms_content entries:
   - `home.testimonials.{uuid}.quote`
   - `home.testimonials.{uuid}.author`
   - `home.testimonials.{uuid}.role`
6. New entries are immediately fetched and hydrated into cmsStore
7. Quote component renders and fields are clickable/editable right away

### Editing a Field

1. User clicks on a field (quote text, author, etc.)
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

To add a new repeatable item type (e.g., "Testimonial" — though Quote already covers this pattern):

1. **Update schema trigger** in `sql/repeatable-content.sql`:

```sql
ELSIF NEW.component_type = 'Testimonial' THEN
  INSERT INTO cms_content (id, content, type, updated_at)
  VALUES (base_ref || '.quote', '', 'html', NOW());
  field_refs := field_refs || jsonb_build_object('quote_ref', base_ref || '.quote');
  -- Add more fields as needed
END IF;
```

Also update the check constraint:

```sql
CHECK (component_type IN ('Card', 'Section', 'Tag', 'Quote', 'AccordionItem', 'Testimonial'))
```

2. **Add TypeScript type** in `src/lib/types/cms.ts`:

```typescript
export type RepeatableComponentType =
	| 'Card'
	| 'Section'
	| 'Tag'
	| 'Quote'
	| 'AccordionItem'
	| 'Testimonial';
```

3. **Create the component** at `src/lib/components/repeatable/Testimonial.svelte`:

```svelte
<script lang="ts">
	import CMSContent from '$lib/cms/CMSContent.svelte';
	import { cmsStore } from '$lib/cms';
	import type { RepeatableItem } from '$lib/types/cms';

	interface Props {
		item: RepeatableItem;
	}
	let { item }: Props = $props();
	let data = $derived(item.data);
	let quote = $derived(data.quote_ref ? $cmsStore[data.quote_ref]?.content || '' : '');
</script>

<blockquote>
	<CMSContent ref={data.quote_ref} type="html">
		{@html quote || '<p>Quote text…</p>'}
	</CMSContent>
</blockquote>
```

4. **Register in RepeatableContainer** (`src/lib/cms/RepeatableContainer.svelte`):

```typescript
import Testimonial from '$lib/components/repeatable/Testimonial.svelte';

const componentMap = { Card, Section, Tag, Quote, Testimonial };
```

5. **Use it**:

```svelte
<RepeatableContainer ref="about.testimonials" type="Testimonial" />
```

## Files

**SQL:**

- `sql/repeatable-content.sql` — schema + triggers (Card, Section, Tag, Quote, AccordionItem)
- `sql/repeatable-rls-policies.sql` — RLS policies

**Components:**

- `src/lib/cms/RepeatableContainer.svelte` — container with add/remove/reorder controls
- `src/lib/components/repeatable/Card.svelte` — card (title, description, image, link + nested tags)
- `src/lib/components/repeatable/Tag.svelte` — tag label (nested in cards)
- `src/lib/components/repeatable/Quote.svelte` — quote, author, role (for testimonials)
- `src/lib/components/repeatable/Section.svelte` — title, description
- `src/lib/components/repeatable/AccordionItem.svelte` — title, content (for accordions)
- `src/lib/components/Carousel.svelte` — page-level carousel container
- `src/lib/components/Accordion.svelte` — page-level accordion container

**Types:**

- `src/lib/types/cms.ts` — `RepeatableComponentType`, `RepeatableItem`, `CardData`, etc.

**API:**

- `src/lib/cms/index.ts` — `repeatableStore`, `loadRepeatableItems()`, `addRepeatableItem()`, `removeRepeatableItem()`, `reorderRepeatableItem()`

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

1. **Test thoroughly** — Add, edit, delete, reorder cards/tags/quotes
2. **Add drag-and-drop reordering** (replace up/down buttons)
3. **Extend Carousel** to support additional item types beyond Quote
4. **Add more nested types** (items in sections, etc.)

## Key Takeaways

✅ **Store content once** - in cms_content, not content_repeatable
✅ **Use database triggers** - auto-create/delete cms_content entries
✅ **References, not values** - data contains refs, not actual content
✅ **Standard flow** - no special sync logic needed
✅ **Simplicity wins** - less code, fewer edge cases

The architecture is production-ready and maintainable!

```

```

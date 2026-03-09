# Current State Documentation

**Date:** March 9, 2026  
**Status:** ✅ Production Ready

## Overview

The codebase implements:

- Reference-based repeatable content system
- Nested repeatables support (tags within cards)
- Image metadata support (object-fit control)
- All colors in hex with alpha format
- Complete documentation and scripts

## What's Working

### Core CMS

- ✅ Inline editing for text, HTML, and images
- ✅ Content history and versioning
- ✅ Cancel functionality (restores content and metadata)
- ✅ Role-based access (editor role)
- ✅ Image uploads to Supabase Storage
- ✅ Image library browser for existing images
- ✅ Object-fit control for images (fill, contain, cover, none)
- ✅ Real-time synchronization

### Repeatable Content

- ✅ Card component with title, description, image, link
- ✅ Tag component (nested in cards)
- ✅ Quote component (quote, author, role) — for testimonials
- ✅ Section component
- ✅ Carousel container component with left/right navigation and auto-play
- ✅ Add/remove/reorder controls
- ✅ Database triggers for auto-create/delete
- ✅ RepeatableContainer with dynamic component rendering
- ✅ New CMS entries hydrated into store immediately on add (no page refresh needed)

### Standalone Components

- ✅ Marquee — infinite scrolling text banner with CMS-editable content

### Architecture

- ✅ Content stored once in `cms_content`
- ✅ Structure stored in `content_repeatable`
- ✅ Reference-based (no content duplication)
- ✅ History works automatically
- ✅ Cancel works automatically
- ✅ No sync logic needed

## Database Schema

### Tables

**cms_content**

- Stores all content (text, HTML, images)
- `metadata` JSONB column for additional data (e.g., objectFit for images)
- Has automatic history trigger
- Used by both inline CMS and repeatables

**cms_content_history**

- Automatic versioning via trigger
- Supports history/cancel features
- Preserves content snapshots on updates

**content_repeatable**

- Stores component structure and ordering
- `data` JSONB contains refs, not content
- Supports nested items via hierarchical `parent_ref`

### Component Types (Repeatable Items)

- `Card`: Title, description, image, link (supports nested Tags)
- `Section`: Title, description
- `Tag`: Label field (nested within Cards)
- `Quote`: Quote text (html), author name, author role/title

### Carousel (Page-Level Container)

Carousel is **not** a repeatable item type — it is a page-level container component that accepts a `ref` and `type` prop and internally uses `RepeatableContainer` for edit mode. Currently supports `Quote` items.

- **View mode**: single-item display with prev/next arrows, dot pagination, slide counter, auto-play toggle
- **Edit mode**: delegates to `RepeatableContainer` (identical controls to all other repeatable types)

### Image Metadata

Images can store additional metadata in the `metadata` JSONB column:

- **objectFit**: Controls how images are displayed (`fill`, `contain`, `cover`, `none`)
- Set via the image edit overlay (4 buttons)
- In edit mode: always uses `contain` for proper overlay positioning
- In display mode: uses saved preference from metadata
- Future extensibility: alt text, captions, etc.

### Example Structure

```
portfolio.projects (parent_ref for cards)
├── card-uuid-1
│   ├── .title (cms_content, text)
│   ├── .description (cms_content, html)
│   ├── .image (cms_content, image)
│   ├── .link (cms_content, text)
│   └── .tags (parent_ref for tags)
│       ├── tag-uuid-1
│       │   └── .label (cms_content, text)
│       └── tag-uuid-2
│           └── .label (cms_content, text)
└── card-uuid-2
    └── ... (same structure)

home.testimonials (parent_ref for quotes, used inside Carousel)
├── quote-uuid-1
│   ├── .quote (cms_content, html)
│   ├── .author (cms_content, text)
│   └── .role (cms_content, text)
└── quote-uuid-2
    └── ... (same structure)
```

│ └── .label (cms_content)
└── card-uuid-2
└── ... (same structure)

````

## File Inventory

### SQL Files

- `sql/supabase-schema.sql` - Base CMS tables and triggers
- `sql/repeatable-content.sql` - Repeatable content tables and triggers
- `sql/supabase-rls-policies.sql` - CMS RLS policies
- `sql/repeatable-rls-policies.sql` - Repeatable RLS policies

### Core CMS Files

- `src/lib/cms/index.ts` - CMS API functions and stores
- `src/lib/cms/CMSContent.svelte` - Inline editing wrapper
- `src/lib/cms/CMSOverlay.svelte` - Edit overlay with history
- `src/lib/cms/EditModeToggle.svelte` - Edit mode button
- `src/lib/types/cms.ts` - TypeScript types

### Repeatable Components

- `src/lib/cms/RepeatableContainer.svelte` - Container with add/remove/reorder controls
- `src/lib/components/repeatable/Card.svelte` - Card component (complete)
- `src/lib/components/repeatable/Tag.svelte` - Tag component (complete, nested in cards)
- `src/lib/components/repeatable/Quote.svelte` - Quote/testimonial component (complete)
- `src/lib/components/repeatable/Section.svelte` - Section component (complete)
- `src/lib/components/Carousel.svelte` - Page-level carousel container (complete)
- `src/lib/components/Marquee.svelte` - Infinite scrolling text banner (complete)

### Scripts

- `scripts/cms-sync.js` - Sync CMS refs to database
- `scripts/db-reset.js` - Reset database to current schema

### Documentation

- `README.md` - Updated with current features
- `docs/REPEATABLE-CONTENT.md` - Complete architecture guide
- `docs/SETUP.md` - Setup instructions
- `docs/DEPLOYMENT.md` - Deployment guide
- `docs/QUICK-REFERENCE.md` - Commands cheat sheet
- `docs/COMPONENT-EXAMPLES.md` - Usage examples
- `docs/AUTH-SETUP.md` - Authentication setup

## Code Standards

### Colors

All colors must be in hex with alpha format:

- ✅ `color: #ffffffff;` (white)
- ✅ `background: #3b82f61a;` (blue with transparency)
- ❌ `color: white;` (named color)
- ❌ `background: rgba(59, 130, 246, 0.1);` (rgba)

### Component Pattern

All repeatable components follow this pattern:

```svelte
<script lang="ts">
	import type { RepeatableItem } from '$lib/types/cms';
	import CMSContent from '$lib/cms/CMSContent.svelte';
	import { cmsStore } from '$lib/cms';

	export let item: RepeatableItem;

	$: fieldRef = item.data.field_ref;
	$: field = $cmsStore[fieldRef]?.content || '';
</script>

<div class="component">
	<CMSContent ref={fieldRef} type="text">
		{field}
	</CMSContent>
</div>
````

### Nested Repeatables Pattern

To nest repeatables (like tags in cards):

```svelte
<script>
	import RepeatableContainer from '$lib/cms/RepeatableContainer.svelte';

	let tagsRef = $derived(`${item.parent_ref}.${item.id}.tags`);
</script>

<RepeatableContainer ref={tagsRef} type="Tag" containerClass="tag-list" />
```

## Setup Commands

```bash
# Install dependencies
npm install

# Reset database to current schema (requires Supabase credentials in .env)
npm run db:reset

# Sync CMS refs from components to database
npm run cms:sync

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Required in `.env`:

```
PUBLIC_SUPABASE_URL=your-project-url
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

## Testing Checklist

When testing the implementation:

### Inline CMS

- [ ] Click text/HTML fields in edit mode
- [ ] Edit content in overlay
- [ ] Save changes
- [ ] View history
- [ ] Restore previous version
- [ ] Cancel changes
- [ ] Upload image
- [ ] Edit image alt text

### Repeatable Content

- [ ] Toggle edit mode
- [ ] Add card to portfolio
- [ ] Edit card title, description, image, link
- [ ] Add tags to card
- [ ] Edit tag labels
- [ ] Reorder cards (up/down)
- [ ] Reorder tags (up/down)
- [ ] Delete tag
- [ ] Delete card (should delete nested tags too)
- [ ] Verify history works on all fields
- [ ] Verify cancel works on all fields

### Quote / Carousel

- [ ] Place `<Carousel ref="..." type="Quote" />` on a page
- [ ] In edit mode: add/edit/remove/reorder Quote items
- [ ] In view mode: prev/next arrows navigate slides
- [ ] Dot indicators reflect current slide
- [ ] Auto-play toggle starts/pauses rotation
- [ ] New Quote items are immediately editable (no page refresh needed)

### Marquee

- [ ] Place `<Marquee ref="home.marquee" />` on a page
- [ ] In view mode: text scrolls right to left continuously
- [ ] In edit mode: scroll stops, inline text field appears
- [ ] Click field → edit in overlay → Save persists to database
- [ ] Default value shows until first save

## Known Issues

None! 🎉

## Next Steps

Potential enhancements:

1. Add drag-and-drop reordering
2. Add image cropping/resizing
3. Add bulk operations
4. Add search/filter for repeatables
5. Add categories/taxonomies
6. Add preview mode
7. Add scheduled publishing
8. Add multi-language support

## Architecture Decisions

### Why References Not Values?

Storing references instead of actual content:

- ✅ No content duplication
- ✅ History works automatically
- ✅ Cancel works automatically
- ✅ Simpler sync logic
- ✅ Single source of truth

### Why Database Triggers?

Auto-creating cms_content entries via triggers:

- ✅ No application-level sync needed
- ✅ Guaranteed data consistency
- ✅ Cleaner application code
- ✅ Works with any client (web, mobile, etc.)

### Why Nested Repeatables?

Using hierarchical parent_ref for nesting:

- ✅ Same table for all levels
- ✅ Same CRUD functions
- ✅ No special cases
- ✅ Unlimited nesting depth
- ✅ Simple mental model

## Support

For issues or questions:

1. Check documentation in `docs/`
2. Review `docs/REPEATABLE-CONTENT.md`
3. Check git history for this file to see changes
4. Review code comments in key files

---

**Last Updated:** November 6, 2025  
**Status:** Production Ready ✅

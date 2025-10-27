# CMS Quick Reference Card

Quick commands and patterns for daily use.

## 🚀 Commands

```bash
# Start development
npm run dev

# Sync content refs
npm run cms:sync

# Build for production
npm run build

# Type checking
npm run check
```

## 📝 Basic Pattern

```svelte
<script>
	import { cmsStore } from '$lib/cms';
</script>

<h1 data-cms-ref="page.title" data-cms-type="text">
	{$cmsStore['page.title']?.content || 'Fallback'}
</h1>
```

## 🎯 Content Types

```svelte
<!-- Plain Text -->
<p data-cms-ref="text.example" data-cms-type="text">
	{$cmsStore['text.example']?.content || 'Default'}
</p>

<!-- Rich Text (HTML) -->
<article data-cms-ref="article.body" data-cms-type="rich-text">
	{@html $cmsStore['article.body']?.content || '<p>Default</p>'}
</article>

<!-- Image (structure ready) -->
<img
	data-cms-ref="hero.image"
	data-cms-type="image"
	src={$cmsStore['hero.image']?.content || '/default.jpg'}
	alt="Hero"
/>
```

## 🔑 Naming Convention

```
scope.section.element

Examples:
  global.site.name          (Used everywhere)
  home.hero.title           (Home page hero)
  about.team.description    (About page team section)
  pricing.cta.button        (Pricing page CTA)
```

## 🎨 Import Patterns

```svelte
<!-- Option 1: Direct store access -->
<script>
  import { cmsStore, editMode, isEditor } from '$lib/cms';
</script>

<!-- Option 2: With components -->
<script>
  import { CMSContent, EditModeToggle, CMSOverlay } from '$lib';
</script>

<!-- Option 3: Functions -->
<script>
  import {
    initializeCMS,
    saveContent,
    subscribeToChanges,
    checkEditorRole,
    getContentHistory
  } from '$lib/cms';
</script>
```

## 🔐 Editor Role Setup

**Quick SQL method** (run in Supabase SQL Editor):

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "editor"}'::jsonb
WHERE email = 'your-email@example.com';
```

Or via UI: Authentication → Users → [User] → Raw User Meta Data:

```json
{
	"role": "editor"
}
```

## 💾 Programmatic Save

```svelte
<script>
	import { saveContent } from '$lib/cms';

	async function update() {
		const success = await saveContent('ref.name', 'New content');
		console.log(success ? 'Saved!' : 'Failed');
	}
</script>
```

## 🔄 Reusable Content

Same ref in multiple places = shared content:

```svelte
<!-- Header -->
<span data-cms-ref="global.tagline" data-cms-type="text">
	{$cmsStore['global.tagline']?.content}
</span>

<!-- Footer -->
<p data-cms-ref="global.tagline" data-cms-type="text">
	{$cmsStore['global.tagline']?.content}
</p>
```

Edit once → updates everywhere!

## 📊 Stores

```svelte
<script>
	import { cmsStore, editMode, isEditor, activeElement } from '$lib/cms';
</script>

<!-- Check edit mode -->
{#if $editMode}
	<p>Editing enabled</p>
{/if}

<!-- Check if user is editor -->
{#if $isEditor}
	<button>Admin Panel</button>
{/if}

<!-- Access content -->
{$cmsStore['ref.name']?.content}

<!-- Currently editing -->
{$activeElement?.ref}
```

## 🎭 Conditional Content

```svelte
<script>
	import { cmsStore } from '$lib/cms';

	$: hasContent = !!$cmsStore['page.banner']?.content;
</script>

{#if hasContent}
	<div data-cms-ref="page.banner" data-cms-type="text">
		{$cmsStore['page.banner']?.content}
	</div>
{/if}
```

## 🔧 Database Schema

```sql
-- Main table
cms_content (
  id TEXT PRIMARY KEY,        -- Your data-cms-ref value
  content TEXT,               -- The actual content
  type TEXT,                  -- 'text', 'rich-text', 'image', 'link'
  updated_at TIMESTAMP
)

-- History (auto-created on update)
cms_content_history (
  id UUID PRIMARY KEY,
  content_id TEXT,
  content TEXT,
  created_at TIMESTAMP
)
```

## 📱 Typical Workflow

1. **Add content ref** to your Svelte component
2. **Run** `npm run cms:sync` to create DB entry
3. **Log in** as editor
4. **Toggle** Edit Mode (floating button)
5. **Click** element to edit
6. **Type** new content
7. **Click outside** to auto-save

## 🎯 Common Tasks

### Add new editable field

```svelte
<p data-cms-ref="new.field" data-cms-type="text">
	{$cmsStore['new.field']?.content || 'Default'}
</p>
```

Then run: `npm run cms:sync`

### Check content exists

```svelte
<script>
	import { cmsStore } from '$lib/cms';

	$effect(() => {
		console.log('All content:', $cmsStore);
	});
</script>
```

### Force refresh content

```svelte
<script>
	import { supabase } from '$lib/supabase';
	import { cmsStore } from '$lib/cms';

	async function refresh() {
		const { data } = await supabase.from('cms_content').select('*');
		cmsStore.set(
			data.reduce((acc, item) => {
				acc[item.id] = item;
				return acc;
			}, {})
		);
	}
</script>
```

## 🐛 Debug Checklist

**Edit Mode button not showing?**

- [ ] User logged in?
- [ ] User has `role: "editor"` in metadata?
- [ ] Check console for errors

**Changes not saving?**

- [ ] RLS policies set up?
- [ ] Environment variables correct?
- [ ] Network tab shows Supabase requests?

**Content not loading?**

- [ ] Ran `npm run cms:sync`?
- [ ] Check Supabase database has entries
- [ ] Verify ref names match exactly

**TypeScript errors?**

- [ ] Run `npm run prepare`
- [ ] Check import paths
- [ ] Verify `.env` exists

## 📚 File Reference

```
Key files you'll edit:
  src/routes/+page.svelte       - Add content refs here
  src/routes/+layout.svelte     - Global CMS setup
  src/lib/cms/                  - CMS components
  .env                          - Supabase credentials

Key files you won't edit:
  scripts/cms-sync.js           - Sync tool (works automatically)
  supabase-schema.sql           - One-time setup
  src/lib/supabase.ts           - Client config
```

## 🎨 Styling Tips

```css
/* Customize edit mode indicators */
[data-cms-ref] {
	/* Your base styles */
}

.cms-editable {
	/* Customize edit mode appearance */
	outline: 2px dashed blue;
}

.cms-editable:hover {
	/* Hover state when editable */
	background: rgba(0, 0, 255, 0.05);
}
```

## 🚀 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Connect to Netlify
- [ ] Add environment variables
- [ ] Set build command: `npm run build`
- [ ] Set publish dir: `build`
- [ ] Deploy!

---

**Pro Tip:** Keep this file open while developing! 💡

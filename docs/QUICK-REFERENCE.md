# CMS Quick Reference

Quick commands and patterns for daily use with the Editify CMS.

## 🚀 Commands

```bash
# Development
npm run dev              # Start development server at http://localhost:5173

# CMS
npm run cms:sync         # Sync data-cms-ref attributes to database

# Build
npm run build            # Build for production
npm run preview          # Preview production build

# Type Checking
npm run check            # Run TypeScript type checking
```

## 📝 Basic Pattern

The standard pattern for editable content:

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';
</script>

<h1 data-cms-ref="page.title" data-cms-type="text" use:cms>
	{$cmsStore['page.title']?.content || 'Fallback Title'}
</h1>
```

**Key parts:**
- `data-cms-ref` - Unique identifier
- `data-cms-type` - Content type (text or html)
- `use:cms` - Svelte action that enables editing
- `{$cmsStore['ref']?.content || 'Fallback'}` - Display logic

## 🎯 Content Types

### Plain Text

```svelte
<p data-cms-ref="text.example" data-cms-type="text" use:cms>
	{$cmsStore['text.example']?.content || 'Default text'}
</p>
```

### Rich Text (HTML)

```svelte
<article data-cms-ref="article.body" data-cms-type="html" use:cms>
	{@html $cmsStore['article.body']?.content || '<p>Default content</p>'}
</article>
```

### Image (Structure Ready)

```svelte
<img
	data-cms-ref="hero.image"
	data-cms-type="image"
	src={$cmsStore['hero.image']?.content || '/default.jpg'}
	alt="Hero"
	use:cms
/>
```

## 🔑 Naming Convention

Use semantic, namespaced identifiers:

```
scope.section.element

Examples:
  global.site.name           # Site-wide, used everywhere
  global.footer.copyright    # Site-wide footer content
  home.hero.title            # Home page hero section
  about.team.description     # About page team section
  pricing.cta.button         # Pricing page CTA
```

**Namespaces:**
- `global.*` - Site-wide content used in multiple places
- `[page].*` - Page-specific content
- `[page].[section].*` - Section within a page

## 🎨 Import Patterns

### Basic Imports

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';
</script>
```

### With Edit Mode and Editor Check

```svelte
<script>
	import { cmsStore, cms, editMode, isEditor } from '$lib/cms';
</script>

{#if $isEditor}
	<p>You're an editor!</p>
{/if}

{#if $editMode}
	<p>Edit mode is active</p>
{/if}
```

### Programmatic Updates

```svelte
<script>
	import { saveContent } from '$lib/cms';

	async function updateContent() {
		const success = await saveContent('ref.id', 'New content');
		if (success) {
			console.log('Updated!');
		}
	}
</script>
```

## 🔄 Workflow

### 1. Add Content to Your Component

```svelte
<h1 data-cms-ref="home.hero.title" data-cms-type="text" use:cms>
	{$cmsStore['home.hero.title']?.content || 'Welcome'}
</h1>
```

### 2. Sync to Database

```bash
npm run cms:sync
```

### 3. Edit as an Editor

1. Log in to your app with an editor account
2. Click the **Edit Mode** button (bottom right)
3. Click any element to edit
4. Type your changes
5. Click outside or press Tab to save

## 🔐 Editor Setup

Grant editor access via SQL:

```sql
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "editor"}'::jsonb
WHERE email = 'editor@example.com';
```

## 📦 Common Patterns

### Reusable Content

Use the same ref in multiple places:

```svelte
<!-- Header.svelte -->
<h1 data-cms-ref="global.site.name" data-cms-type="text" use:cms>
	{$cmsStore['global.site.name']?.content || 'My Site'}
</h1>

<!-- Footer.svelte -->
<p data-cms-ref="global.site.name" data-cms-type="text" use:cms>
	{$cmsStore['global.site.name']?.content || 'My Site'}
</p>
```

Edit once, updates everywhere!

### Conditional Content

```svelte
{#if showBanner}
	<div data-cms-ref="home.banner" data-cms-type="text" use:cms>
		{$cmsStore['home.banner']?.content || 'Special offer!'}
	</div>
{/if}
```

### Dynamic Lists

```svelte
{#each features as feature}
	<li data-cms-ref="features.{feature}" data-cms-type="text" use:cms>
		{$cmsStore[`features.${feature}`]?.content || 'Feature'}
	</li>
{/each}
```

## 🛠️ Troubleshooting

### Content Not Showing
- Run `npm run cms:sync`
- Check Supabase `cms_content` table
- Verify ref name matches exactly

### Can't Edit
- Confirm you're logged in
- Check editor role in user metadata
- Toggle Edit Mode button
- Ensure element has `use:cms`

### Edits Not Saving
- Check browser console for errors
- Verify RLS policies are set up
- Confirm `sql/supabase-rls-policies.sql` was run
- Check for 403 Forbidden errors

## 📚 More Info

- **Full Setup:** See [SETUP.md](./SETUP.md)
- **Examples:** See [COMPONENT-EXAMPLES.md](./COMPONENT-EXAMPLES.md)
- **Auth Setup:** See [AUTH-SETUP.md](./AUTH-SETUP.md)

## 💡 Pro Tips

1. **Always provide fallbacks** - Makes development easier
2. **Sync after adding refs** - Run `cms:sync` after adding `data-cms-ref` attributes
3. **Use semantic names** - Future you will thank you
4. **Group related content** - Use namespaces like `home.hero.*`
5. **Test as editor** - Log in and try editing before deploying

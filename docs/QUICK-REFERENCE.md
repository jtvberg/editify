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

## 📜 Marquee

A single-field CMS-editable scrolling text banner. Drop it directly into any page route:

```svelte
<script>
	import { Marquee } from '$lib';
</script>

<!-- Defaults: 20s duration, 4rem gap -->
<Marquee ref="home.marquee" />

<!-- Custom speed and gap -->
<Marquee ref="home.marquee" duration={35} gap="6rem" />

<!-- Custom default value (shown until content is saved) -->
<Marquee ref="home.marquee" defaultValue="Welcome to our site · " />
```

**Props:**

| Prop           | Type     | Default                       | Description                                       |
| -------------- | -------- | ----------------------------- | ------------------------------------------------- |
| `ref`          | `string` | required                      | CMS ref key — must be unique                      |
| `defaultValue` | `string` | `'Your marquee text here...'` | Shown until content is saved                      |
| `duration`     | `number` | `20`                          | Scroll duration in seconds (higher = slower)      |
| `gap`          | `string` | `'4rem'`                      | Space between the two text copies (any CSS value) |

**Notes:**

- No `cms:sync` needed — the row is created automatically on first load via `ensureContent`
- In **edit mode** the scroll stops and a static inline text field appears
- Content saves through the standard CMS overlay (click the field, edit, Save)

## 🎠 Carousel / Repeatable Content

### Carousel (page-level container)

Place a `Carousel` directly in any page route. It handles both view and edit mode automatically:

```svelte
<script>
	import { Carousel } from '$lib';
</script>

<!-- Manual navigation only (default) -->
<Carousel ref="home.testimonials" type="Quote" />

<!-- Auto-rotate with default 5s delay -->
<Carousel ref="home.testimonials" type="Quote" autoRotate />

<!-- Auto-rotate with custom delay -->
<Carousel ref="home.testimonials" type="Quote" autoRotate autoRotateDelay={4000} />
```

In **view mode** the carousel shows one item at a time with prev/next arrows and dot indicators.

In **edit mode** it delegates to `RepeatableContainer` so you get the standard add / reorder / delete controls.

### RepeatableContainer (standalone)

Use this directly when you want a managed list without the carousel UI:

```svelte
<script>
	import { RepeatableContainer } from '$lib/cms';
</script>

<!-- Edit-mode-only container (hides in view mode) -->
<RepeatableContainer ref="home.cards" type="Card" />
```

### Available Item Types

| Type      | Fields                          | Use for                        |
| --------- | ------------------------------- | ------------------------------ |
| `Card`    | title, description, image, link | Feature cards, portfolio items |
| `Section` | title, description              | Content sections               |
| `Tag`     | label                           | Tags, badges, categories       |
| `Quote`   | quote, author, role             | Testimonials, pull quotes      |

### Adding a New Item Type

1. Create `src/lib/components/repeatable/MyType.svelte` using the same pattern as `Quote.svelte`
2. Add `'MyType'` to `RepeatableComponentType` in `src/lib/types/cms.ts`
3. Import and add `MyType` to `componentMap` in `RepeatableContainer.svelte`
4. Add a `WHEN NEW.component_type = 'MyType'` block to the trigger in `sql/repeatable-content.sql`
5. Update the `CHECK` constraint in that same file
6. Re-run the SQL in Supabase

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

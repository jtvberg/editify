# Component Usage Examples

Here are practical examples of how to use the CMS in your Svelte components with the `use:cms` action.

## Basic Text Content

The simplest pattern uses the `use:cms` action directive:

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';
</script>

<h1 data-cms-ref="page.title" data-cms-type="text" use:cms>
	{$cmsStore['page.title']?.content || 'Default Page Title'}
</h1>
```

**How it works:**

- `data-cms-ref` - Unique identifier for this content
- `data-cms-type` - Content type (text, html, image)
- `use:cms` - Svelte action that makes the element editable
- `{$cmsStore['page.title']?.content || 'Fallback'}` - Displays saved content or fallback

## Rich Text Content

For content with HTML formatting:

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';
</script>

<article data-cms-ref="blog.post.body" data-cms-type="html" use:cms>
	{@html $cmsStore['blog.post.body']?.content || '<p>Default content...</p>'}
</article>
```

**Note:** In production, always sanitize HTML! Consider using a library like DOMPurify:

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';
	import DOMPurify from 'isomorphic-dompurify';

	$: cleanHTML = DOMPurify.sanitize($cmsStore['blog.post.body']?.content || '<p>Default</p>');
</script>

<article data-cms-ref="blog.post.body" data-cms-type="html" use:cms>
	{@html cleanHTML}
</article>
```

## Reusable Content Across Components

Use the same ref in multiple places - edit once, updates everywhere!

### In Header.svelte

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';
</script>

<header>
	<h1 data-cms-ref="global.site.name" data-cms-type="text" use:cms>
		{$cmsStore['global.site.name']?.content || 'My Site'}
	</h1>
	<span data-cms-ref="global.site.tagline" data-cms-type="text" use:cms>
		{$cmsStore['global.site.tagline']?.content || 'Your tagline here'}
	</span>
</header>
```

### In Footer.svelte

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';
</script>

<footer>
	<!-- Same tagline ref - automatically stays in sync -->
	<p data-cms-ref="global.site.tagline" data-cms-type="text" use:cms>
		{$cmsStore['global.site.tagline']?.content || 'Your tagline here'}
	</p>

	<p data-cms-ref="global.footer.copyright" data-cms-type="text" use:cms>
		{$cmsStore['global.footer.copyright']?.content || '© 2025 Your Company'}
	</p>
</footer>
```

The `global.site.tagline` appears in both components but is managed as a single piece of content!

## Conditional Content

Content can be used in conditional blocks:

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';

	let showBanner = $state(true);
</script>

{#if showBanner}
	<div class="banner" data-cms-ref="home.promo.banner" data-cms-type="text" use:cms>
		{$cmsStore['home.promo.banner']?.content || 'Special offer!'}
	</div>
{/if}
```

## Dynamic Lists

Each list item should have a unique ref:

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';

	const features = ['feature1', 'feature2', 'feature3'];
</script>

<ul>
	{#each features as feature}
		<li data-cms-ref="home.features.{feature}" data-cms-type="text" use:cms>
			{$cmsStore[`home.features.${feature}`]?.content || 'Feature description'}
		</li>
	{/each}
</ul>
```

    import { cmsStore } from '$lib/cms';

    const features = [
    	{ id: 1, ref: 'features.speed' },
    	{ id: 2, ref: 'features.security' },
    	{ id: 3, ref: 'features.scalability' }
    ];

</script>

<ul>
	{#each features as feature}
		<li data-cms-ref={feature.ref} data-cms-type="text">
			{$cmsStore[feature.ref]?.content || 'Feature description'}
		</li>
	{/each}
</ul>
```

## Images with Upload Support

Images can be uploaded and managed directly through the CMS interface. The image URL is stored in the database.

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';
	import defaultHeroImage from '$lib/assets/default-hero.jpg';
</script>

<!-- Simple image -->
<img
	data-cms-ref="home.hero.image"
	data-cms-type="image"
	src={$cmsStore['home.hero.image']?.content || defaultHeroImage}
	alt="Hero"
	use:cms
/>
```

### Image Within a Container

For better control and styling, wrap the image in a div:

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';
	import defaultMissionImage from '$lib/assets/default_image.jpg';
</script>

<div data-cms-ref="about.mission.image" data-cms-type="image" class="image-container" use:cms>
	<img src={$cmsStore['about.mission.image']?.content || defaultMissionImage} alt="Our Mission" />
</div>

<style>
	.image-container {
		max-width: 600px;
		margin: 2rem auto;
	}

	.image-container img {
		width: 100%;
		height: auto;
		border-radius: 8px;
	}
</style>
```

### Using CMSContent Component for Images

You can also use the `CMSContent` component wrapper:

```svelte
<script>
	import { CMSContent } from '$lib/cms';
	import defaultImage from '$lib/assets/default.jpg';
</script>

<CMSContent ref="portfolio.project.thumbnail" type="image">
	<img src={$cmsStore['portfolio.project.thumbnail']?.content || defaultImage} alt="Project" />
</CMSContent>
```

**How image upload works:**

1. In edit mode, click on an image element
2. A file upload dialog appears in the overlay
3. Select an image (max 5MB, formats: JPG, PNG, GIF, WebP)
4. Image is uploaded to Supabase Storage
5. The public URL is saved to the database
6. All instances of that ref are updated automatically

**Setup Required:** See [IMAGE-STORAGE-SETUP.md](./IMAGE-STORAGE-SETUP.md) for configuring Supabase Storage.

### Image with Responsive Variants

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';
</script>

<picture>
	<source
		media="(min-width: 768px)"
		srcset={$cmsStore['home.hero.image']?.content || '/default-hero.jpg'}
	/>
	<img
		data-cms-ref="home.hero.image"
		data-cms-type="image"
		src={$cmsStore['home.hero.mobile']?.content || '/default-hero-mobile.jpg'}
		alt="Hero"
		use:cms
	/>
</picture>
```

## Reactive Content

Use Svelte's reactive syntax with CMS content:

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';

	// Reactive derived value
	$: welcomeMessage = $cmsStore['home.welcome']?.content || 'Welcome!';
	$: isLongMessage = welcomeMessage.length > 50;
</script>

<div
	class="welcome"
	class:long={isLongMessage}
	data-cms-ref="home.welcome"
	data-cms-type="text"
	use:cms
>
	{welcomeMessage}
</div>
```

## With Fallback Logic

Handle multiple fallback levels:

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';

	const DEFAULT_TITLE = 'Welcome to Our Site';

	$: pageTitle = $cmsStore['page.title']?.content || DEFAULT_TITLE;
</script>

<h1 data-cms-ref="page.title" data-cms-type="text" use:cms>
	{pageTitle}
</h1>
```

## Programmatic Content Updates

You can update content programmatically (useful for bulk operations or migrations):

```svelte
<script>
	import { saveContent } from '$lib/cms';

	async function updateContent() {
		const success = await saveContent('test.title', 'New content');
		if (success) {
			console.log('Content updated!');
		}
	}
</script>

<button onclick={updateContent}> Update Content Programmatically </button>
```

## Accessing Edit Mode State

Check if edit mode is active to show/hide elements:

```svelte
<script>
	import { cmsStore, cms, editMode } from '$lib/cms';
</script>

<div class="content" data-cms-ref="page.content" data-cms-type="text" use:cms>
	{$cmsStore['page.content']?.content || 'Default content'}
</div>

{#if $editMode}
	<div class="editor-hint">🖊️ Click any text to edit</div>
{/if}
```

## Checking Editor Role

Show content based on whether the user is an editor:

```svelte
<script>
	import { cmsStore, cms, isEditor } from '$lib/cms';
</script>

<h1 data-cms-ref="page.title" data-cms-type="text" use:cms>
	{$cmsStore['page.title']?.content || 'Page Title'}
</h1>

{#if $isEditor}
	<div class="cms-info">You're logged in as an editor. Toggle Edit Mode to make changes.</div>
{/if}
```

## Complete Page Example

Here's a full page using the CMS:

```svelte
<script>
	import { cmsStore, cms } from '$lib/cms';
</script>

<div class="page">
	<header>
		<h1 data-cms-ref="about.header.title" data-cms-type="text" use:cms>
			{$cmsStore['about.header.title']?.content || 'About Us'}
		</h1>
		<p data-cms-ref="about.header.tagline" data-cms-type="text" use:cms>
			{$cmsStore['about.header.tagline']?.content || 'Learn more about our company'}
		</p>
	</header>

	<main>
		<section class="intro">
			<article data-cms-ref="about.intro" data-cms-type="html" use:cms>
				{@html $cmsStore['about.intro']?.content || '<p>Company introduction...</p>'}
			</article>
		</section>

		<section class="values">
			<h2 data-cms-ref="about.values.title" data-cms-type="text" use:cms>
				{$cmsStore['about.values.title']?.content || 'Our Values'}
			</h2>

			<div class="values-grid">
				<div class="value">
					<h3 data-cms-ref="about.values.trust.title" data-cms-type="text" use:cms>
						{$cmsStore['about.values.trust.title']?.content || 'Trust'}
					</h3>
					<p data-cms-ref="about.values.trust.desc" data-cms-type="text" use:cms>
						{$cmsStore['about.values.trust.desc']?.content || 'We build trust...'}
					</p>
				</div>

				<div class="value">
					<h3 data-cms-ref="about.values.innovation.title" data-cms-type="text" use:cms>
						{$cmsStore['about.values.innovation.title']?.content || 'Innovation'}
					</h3>
					<p data-cms-ref="about.values.innovation.desc" data-cms-type="text" use:cms>
						{$cmsStore['about.values.innovation.desc']?.content || 'We innovate...'}
					</p>
				</div>
			</div>
		</section>
	</main>
</div>

<style>
	.page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.values-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}
</style>
```

## Best Practices

### 1. Use Semantic Ref Names

```svelte
<!-- Good -->
<h1 data-cms-ref="about.team.title" data-cms-type="text" use:cms>...</h1>

<!-- Avoid -->
<h1 data-cms-ref="h1_1" data-cms-type="text" use:cms>...</h1>
```

### 2. Always Provide Fallbacks

```svelte
<!-- Good -->
<p data-cms-ref="content.description" data-cms-type="text" use:cms>
	{$cmsStore['content.description']?.content || 'Meaningful default text'}
</p>

<!-- Avoid -->
<p data-cms-ref="content.description" data-cms-type="text" use:cms>
	{$cmsStore['content.description']?.content}
</p>
```

### 3. Use Namespaces

Organize refs by page/section:

```
global.site.name
global.footer.copyright
home.hero.title
about.team.description
pricing.cta.button
```

### 4. Remember to Sync After Adding Refs

After adding new `data-cms-ref` attributes:

```bash
npm run cms:sync
```

This creates the database entries for your new refs.

## Troubleshooting

**Content not appearing:**

- Check that `cms:sync` has been run
- Verify the ref exists in your Supabase `cms_content` table
- Check browser console for errors

**Can't edit content:**

- Ensure you're logged in as a user with editor role
- Toggle Edit Mode using the button
- Check that the element has both `data-cms-ref` and `use:cms`

**Edits not saving:**

- Verify RLS policies are set up (run `sql/supabase-rls-policies.sql`)
- Check browser console for 403 errors
- Ensure editor role is properly set in user metadata

# Component Usage Examples

Here are practical examples of how to use the CMS in your Svelte components.

## Basic Text Content

```svelte
<script>
	import { cmsStore } from '$lib/cms';
</script>

<h1 data-cms-ref="page.title" data-cms-type="text">
	{$cmsStore['page.title']?.content || 'Default Page Title'}
</h1>
```

## Using the CMSContent Wrapper Component

Instead of manually adding refs and binding to the store, you can use the `CMSContent` wrapper:

```svelte
<script>
	import { CMSContent } from '$lib';
</script>

<CMSContent ref="page.title" type="text">Default Page Title</CMSContent>
```

The wrapper automatically handles store binding and edit mode.

## Rich Text Content

```svelte
<script>
	import { cmsStore } from '$lib/cms';
</script>

<article data-cms-ref="blog.post.body" data-cms-type="rich-text">
	{@html $cmsStore['blog.post.body']?.content || '<p>Default content...</p>'}
</article>
```

**Note:** Always sanitize HTML in production! Consider using a library like DOMPurify.

## Reusable Content Across Components

### In Header.svelte

```svelte
<script>
	import { cmsStore } from '$lib/cms';
</script>

<header>
	<span data-cms-ref="global.site.tagline" data-cms-type="text">
		{$cmsStore['global.site.tagline']?.content || 'Your tagline here'}
	</span>
</header>
```

### In Footer.svelte

```svelte
<script>
	import { cmsStore } from '$lib/cms';
</script>

<footer>
	<p data-cms-ref="global.site.tagline" data-cms-type="text">
		{$cmsStore['global.site.tagline']?.content || 'Your tagline here'}
	</p>

	<p data-cms-ref="global.footer.copyright" data-cms-type="text">
		{$cmsStore['global.footer.copyright']?.content || '© 2025 Your Company'}
	</p>
</footer>
```

The same `global.site.tagline` ref is used in both components - edit once, updates everywhere!

## Conditional Content

```svelte
<script>
	import { cmsStore } from '$lib/cms';

	let showBanner = $state(true);
</script>

{#if showBanner}
	<div class="banner" data-cms-ref="home.promo.banner" data-cms-type="text">
		{$cmsStore['home.promo.banner']?.content || 'Special offer!'}
	</div>
{/if}
```

## Dynamic Lists (Using Same Pattern)

```svelte
<script>
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

## Images (Structure for Future Implementation)

```svelte
<script>
	import { cmsStore } from '$lib/cms';
</script>

<img
	data-cms-ref="home.hero.image"
	data-cms-type="image"
	src={$cmsStore['home.hero.image']?.content || '/default-hero.jpg'}
	alt="Hero"
	class="hero-image"
/>
```

## Reactive Content

```svelte
<script>
	import { cmsStore } from '$lib/cms';

	// Reactive derived value
	$: welcomeMessage = $cmsStore['home.welcome']?.content || 'Welcome!';
	$: isLongMessage = welcomeMessage.length > 50;
</script>

<div class="welcome" class:long={isLongMessage} data-cms-ref="home.welcome" data-cms-type="text">
	{welcomeMessage}
</div>
```

## Programmatic Content Updates

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

## With Fallback Logic

```svelte
<script>
	import { cmsStore } from '$lib/cms';

	function getContent(ref, fallback) {
		return $cmsStore[ref]?.content || fallback;
	}
</script>

<h1 data-cms-ref="page.title" data-cms-type="text">
	{getContent('page.title', 'Untitled Page')}
</h1>
```

## Custom Edit Behavior

```svelte
<script>
	import { cmsStore, editMode, saveContent } from '$lib/cms';

	let localContent = $state('');

	$effect(() => {
		localContent = $cmsStore['custom.field']?.content || '';
	});

	async function handleSave() {
		await saveContent('custom.field', localContent);
	}
</script>

{#if $editMode}
	<input
		type="text"
		bind:value={localContent}
		onblur={handleSave}
		data-cms-ref="custom.field"
		data-cms-type="text"
	/>
{:else}
	<span data-cms-ref="custom.field" data-cms-type="text">
		{localContent}
	</span>
{/if}
```

## Multi-line Text

```svelte
<script>
	import { cmsStore } from '$lib/cms';
</script>

<p class="description" data-cms-ref="product.description" data-cms-type="text">
	{$cmsStore['product.description']?.content || 'Product description goes here...'}
</p>

<style>
	.description {
		white-space: pre-wrap; /* Preserve line breaks */
	}
</style>
```

## With TypeScript

```svelte
<script lang="ts">
	import { cmsStore } from '$lib/cms';
	import type { CMSContent } from '$lib/types/cms';

	function getContentSafe(ref: string): string {
		const content: CMSContent | undefined = $cmsStore[ref];
		return content?.content ?? '';
	}
</script>

<h1 data-cms-ref="page.title" data-cms-type="text">
	{getContentSafe('page.title') || 'Default Title'}
</h1>
```

## Best Practices

### 1. Always Provide Fallback Content

```svelte
<!-- ✅ Good -->
{$cmsStore['home.title']?.content || 'Default Title'}

<!-- ❌ Bad -->
{$cmsStore['home.title']?.content}
```

### 2. Use Semantic Naming

```svelte
<!-- ✅ Good -->
<h1 data-cms-ref="pricing.hero.headline" data-cms-type="text">

<!-- ❌ Bad -->
<h1 data-cms-ref="text1" data-cms-type="text">
```

### 3. Group Related Content

```svelte
<!-- ✅ Good - Grouped by feature -->
data-cms-ref="features.speed.title" data-cms-ref="features.speed.description"

<!-- ❌ Bad - Scattered -->
data-cms-ref="title1" data-cms-ref="desc2"
```

### 4. Use `global.` for Site-Wide Content

```svelte
<!-- Site-wide content that appears everywhere -->
data-cms-ref="global.company.name" data-cms-ref="global.footer.copyright" data-cms-ref="global.site.tagline"
```

### 5. Keep Types Consistent

```svelte
<!-- ✅ Good - Use rich-text for formatted content -->
<article data-cms-ref="blog.content" data-cms-type="rich-text">

<!-- ❌ Bad - Don't use text for formatted content -->
<article data-cms-ref="blog.content" data-cms-type="text">
```

## Testing Content

During development, you can check what content exists:

```svelte
<script>
	import { cmsStore } from '$lib/cms';

	// Log all CMS content (development only)
	$effect(() => {
		console.log('CMS Content:', $cmsStore);
	});
</script>
```

## Performance Tips

### 1. Memoize Derived Content

```svelte
<script>
	import { cmsStore } from '$lib/cms';

	// Only recompute when the specific ref changes
	$: title = $cmsStore['page.title']?.content || 'Default';
</script>
```

### 2. Avoid Unnecessary Reactivity

```svelte
<script>
	import { cmsStore } from '$lib/cms';

	// Get once on mount if content doesn't need to be reactive
	let staticContent = '';

	$effect(() => {
		staticContent = $cmsStore['static.content']?.content || '';
	});
</script>
```

That's it! Check the live examples in `src/routes/+page.svelte` for more patterns.

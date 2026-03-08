<script lang="ts">
	import CMSContent from '$lib/cms/CMSContent.svelte';
	import { cmsStore } from '$lib/cms';
	import type { RepeatableItem } from '$lib/types/cms';

	interface Props {
		item: RepeatableItem;
	}

	let { item }: Props = $props();
	let data = $derived(item.data);
	let quote = $derived(data.quote_ref ? ($cmsStore[data.quote_ref]?.content || '') : '');
	let author = $derived(data.author_ref ? ($cmsStore[data.author_ref]?.content || '') : '');
	let role = $derived(data.role_ref ? ($cmsStore[data.role_ref]?.content || '') : '');
</script>

<figure class="quote-item">
	<blockquote class="quote-text">
		{#if data.quote_ref}
			<CMSContent ref={data.quote_ref} type="html">
				{@html quote || '<p>Quote text…</p>'}
			</CMSContent>
		{/if}
	</blockquote>

	<figcaption class="quote-attribution">
		{#if data.author_ref}
			<div class="quote-author">
				<CMSContent ref={data.author_ref} type="text">
					{author || 'Author name'}
				</CMSContent>
			</div>
		{/if}
		{#if data.role_ref}
			<div class="quote-role">
				<CMSContent ref={data.role_ref} type="text">
					{role || 'Title / Role'}
				</CMSContent>
			</div>
		{/if}
	</figcaption>
</figure>

<style>
	.quote-item {
		margin: 0;
		padding: 2.5rem 3rem;
		background: var(--gradient-card);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		border: 1px solid var(--color-white-10);
		box-shadow: 0 8px 32px var(--color-black-50);
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.quote-text {
		position: relative;
		font-size: 1.25rem;
		font-style: italic;
		color: var(--color-text-primary);
		line-height: 1.75;
	}

	.quote-text::before {
		content: '\201C';
		position: absolute;
		top: -1rem;
		left: -0.5rem;
		font-size: 4rem;
		line-height: 1;
		color: var(--color-primary);
		font-style: normal;
		font-family: Georgia, serif;
		opacity: 0.6;
	}

	.quote-text :global(p) {
		margin: 0;
	}

	.quote-attribution {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.quote-author {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-primary);
		letter-spacing: 0.03em;
	}

	.quote-role {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>

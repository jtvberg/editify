<script lang="ts">
	import CMSContent from '$lib/cms/CMSContent.svelte';
	import { cmsStore, activeElement } from '$lib/cms';
	import type { RepeatableItem } from '$lib/types/cms';

	interface Props {
		item: RepeatableItem;
	}

	let { item }: Props = $props();
	let data = $derived(item.data);
	let quote = $derived(data.quote_ref ? ($cmsStore[data.quote_ref]?.content || '') : '');
	let author = $derived(data.author_ref ? ($cmsStore[data.author_ref]?.content || '') : '');
	let role = $derived(data.role_ref ? ($cmsStore[data.role_ref]?.content || '') : '');

	let frozenQuote = $state('');
	let frozenAuthor = $state('');
	let frozenRole = $state('');

	$effect(() => {
		if (!$activeElement || $activeElement.ref !== data.quote_ref) {
			frozenQuote = quote;
		}
	});

	$effect(() => {
		if (!$activeElement || $activeElement.ref !== data.author_ref) {
			frozenAuthor = author;
		}
	});

	$effect(() => {
		if (!$activeElement || $activeElement.ref !== data.role_ref) {
			frozenRole = role;
		}
	});
</script>

<figure class="quote-item">
	<blockquote class="quote-text">
		{#if data.quote_ref}
			<CMSContent ref={data.quote_ref} type="html">
				{@html frozenQuote || '<p>Quote text…</p>'}
			</CMSContent>
		{/if}
	</blockquote>

	<figcaption class="quote-attribution">
		{#if data.author_ref}
			<div class="quote-author">
				<CMSContent ref={data.author_ref} type="text">
					{frozenAuthor || 'Author name'}
				</CMSContent>
			</div>
		{/if}
		{#if data.role_ref}
			<div class="quote-role">
				<CMSContent ref={data.role_ref} type="text">
					{frozenRole || 'Title / Role'}
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
		font-size: 2.5rem;
        font-weight: 600;
		line-height: 1.1;
		color: var(--color-primary-text);
		font-style: normal;
		opacity: 0.6;
        width: fit-content;
        margin: auto;
	}

    .quote-text :global(p)::before, .quote-text :global(p)::after {
		font-size: 3rem;
		line-height: 1;
		color: var(--color-primary);
		font-style: normal;
		font-family: Georgia, serif;
		opacity: 0.6;
    } 

	.quote-text :global(p)::before {
		content: '\201C';
        margin-right: 5px;
	}

    .quote-text :global(p)::after {
        content: '\201D';
        margin-left: 5px;
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

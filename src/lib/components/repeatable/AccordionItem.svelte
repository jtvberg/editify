<script lang="ts">
	import CMSContent from '$lib/cms/CMSContent.svelte';
	import { cmsStore, activeElement } from '$lib/cms';
	import type { RepeatableItem } from '$lib/types/cms';

	interface Props {
		item: RepeatableItem;
	}

	let { item }: Props = $props();
	let data = $derived(item.data);
	let title = $derived(data.title_ref ? ($cmsStore[data.title_ref]?.content || '') : '');
	let content = $derived(data.content_ref ? ($cmsStore[data.content_ref]?.content || '') : '');
	let frozenTitle = $state('');
	let frozenContent = $state('');

	$effect(() => {
		if (!$activeElement || $activeElement.ref !== data.title_ref) {
			frozenTitle = title;
		}
	});

	$effect(() => {
		if (!$activeElement || $activeElement.ref !== data.content_ref) {
			frozenContent = content;
		}
	});
</script>

<div class="accordion-item-edit">
	{#if data.title_ref}
		<div class="field-group">
			<span class="field-label">Title</span>
			<CMSContent ref={data.title_ref} type="text">
				{frozenTitle || 'Accordion title…'}
			</CMSContent>
		</div>
	{/if}
	{#if data.content_ref}
		<div class="field-group">
			<span class="field-label">Content</span>
			<CMSContent ref={data.content_ref} type="html">
				{@html frozenContent || '<p>Accordion content…</p>'}
			</CMSContent>
		</div>
	{/if}
</div>

<style>
	.accordion-item-edit {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid var(--color-white-10, #ffffff1a);
		border-radius: 8px;
		background: var(--gradient-card, transparent);
	}

	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field-label {
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--cms-primary, #3b82f6);
		opacity: 0.7;
	}
</style>

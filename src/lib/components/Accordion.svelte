<script lang="ts">
	import { onMount } from 'svelte';
	import { editMode, cmsStore, repeatableStore, loadRepeatableItems } from '$lib/cms';
	import type { RepeatableComponentType } from '$lib/types/cms';
	import RepeatableContainer from '$lib/cms/RepeatableContainer.svelte';

	interface Props {
		ref: string;
		type?: RepeatableComponentType;
	}

	let { ref, type = 'AccordionItem' }: Props = $props();

	let items = $derived($repeatableStore[ref] || []);
	let openIndex = $state<number | null>(null);

	onMount(async () => {
		await loadRepeatableItems(ref);
	});

	function toggle(index: number) {
		openIndex = openIndex === index ? null : index;
	}
</script>

<div class="accordion">
	{#if $editMode}
		<RepeatableContainer {ref} {type} />
	{:else}
		{#if items.length > 0}
			{#each items as item, i}
				{@const data = item.data}
				{@const title = data.title_ref ? ($cmsStore[data.title_ref]?.content || 'Untitled') : 'Untitled'}
				{@const content = data.content_ref ? ($cmsStore[data.content_ref]?.content || '') : ''}
				{@const isOpen = openIndex === i}
				<div class="accordion-item" class:open={isOpen}>
					<button class="accordion-header" onclick={() => toggle(i)} aria-expanded={isOpen}>
						<span class="accordion-title">{title}</span>
						<svg
							class="accordion-chevron"
							class:rotated={isOpen}
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M6 9l6 6 6-6" />
						</svg>
					</button>
					<div class="accordion-body" class:expanded={isOpen}>
						<div class="accordion-content">
							{@html content}
						</div>
					</div>
				</div>
			{/each}
		{:else}
			<div class="empty-state">No items yet.</div>
		{/if}
	{/if}
</div>

<style>
	.accordion {
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.accordion-item {
		border-bottom: 1px solid var(--color-white-10, #ffffff1a);
	}

	.accordion-item:first-child {
		border-top: 1px solid var(--color-white-10, #ffffff1a);
	}

	.accordion-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 1rem 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		color: inherit;
		font-size: 1rem;
		font-weight: 600;
		transition: color 0.2s;
	}

	.accordion-header:hover {
		color: var(--color-primary, #3b82f6);
	}

	.accordion-title {
		flex: 1;
		min-width: 0;
	}

	.accordion-chevron {
		flex-shrink: 0;
		transition: transform 0.3s ease;
	}

	.accordion-chevron.rotated {
		transform: rotate(180deg);
	}

	.accordion-body {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.3s ease;
	}

	.accordion-body.expanded {
		grid-template-rows: 1fr;
	}

	.accordion-content {
		overflow: hidden;
		padding: 0 0.5rem;
	}

	.accordion-body.expanded .accordion-content {
		padding-bottom: 1rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: var(--color-text-muted, #9ca3af);
		font-style: italic;
	}
</style>

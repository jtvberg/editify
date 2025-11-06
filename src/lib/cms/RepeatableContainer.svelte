<script lang="ts">
	import { editMode, repeatableStore, loadRepeatableItems, addRepeatableItem, removeRepeatableItem, reorderRepeatableItem } from '$lib/cms';
	import type { RepeatableComponentType } from '$lib/types/cms';
	import { onMount } from 'svelte';
	import Card from '$lib/components/repeatable/Card.svelte';
	import Carousel from '$lib/components/repeatable/Carousel.svelte';
	import Section from '$lib/components/repeatable/Section.svelte';
	import Tag from '$lib/components/repeatable/Tag.svelte';

	interface Props {
		ref: string;
		type: RepeatableComponentType;
		containerClass?: string;
	}

	let { ref, type, containerClass = '' }: Props = $props();

	let items = $derived($repeatableStore[ref] || []);
	let loading = $state(false);

	const componentMap = {
		Card,
		Carousel,
		Section,
		Tag
	};
	
	let Component = $derived(componentMap[type]);

	onMount(async () => {
		loading = true;
		await loadRepeatableItems(ref);
		loading = false;
	});

	async function handleAdd() {
		loading = true;
		await addRepeatableItem(ref, type);
		loading = false;
	}

	async function handleRemove(itemId: string) {
		if (!confirm('Are you sure you want to delete this item?')) return;
		loading = true;
		await removeRepeatableItem(itemId, ref);
		loading = false;
	}

	async function handleMoveUp(itemId: string) {
		const index = items.findIndex(item => item.id === itemId);
		if (index <= 0) return;
		loading = true;
		await reorderRepeatableItem(itemId, ref, index - 1);
		loading = false;
	}

	async function handleMoveDown(itemId: string) {
		const index = items.findIndex(item => item.id === itemId);
		if (index === -1 || index >= items.length - 1) return;
		loading = true;
		await reorderRepeatableItem(itemId, ref, index + 1);
		loading = false;
	}
</script>

<div class="repeatable-container {containerClass}" class:editable={$editMode}>
	{#if loading}
		<div class="loading-overlay">
			<div class="spinner"></div>
		</div>
	{/if}

	{#each items as item (item.id)}
		<div class="repeatable-item">
			{#if $editMode}
				<div class="repeatable-controls">
					<button
						class="control-btn move-up"
						onclick={() => handleMoveUp(item.id)}
						disabled={items.indexOf(item) === 0}
						title="Move up"
					>
						↑
					</button>
					<button
						class="control-btn move-down"
						onclick={() => handleMoveDown(item.id)}
						disabled={items.indexOf(item) === items.length - 1}
						title="Move down"
					>
						↓
					</button>
					<button
						class="control-btn remove"
						onclick={() => handleRemove(item.id)}
						title="Delete"
					>
						×
					</button>
				</div>
			{/if}

			<Component item={item} />
		</div>
	{/each}

	{#if $editMode}
		<button class="add-item-btn" onclick={handleAdd}>
			+ Add {type}
		</button>
	{/if}
</div>

<style>
	.repeatable-container {
		position: relative;
	}

	.repeatable-container.editable {
		display: flex;
        flex-direction: column;
	}

	.repeatable-item {
		position: relative;
	}

	.repeatable-controls {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		gap: 0.25rem;
		z-index: 10;
		background: #000000cc;
		padding: 0.25rem;
		border-radius: 0.5rem;
	}

	.control-btn {
		width: 2rem;
		height: 2rem;
		border: none;
		background: #ffffff1a;
		color: #ffffffff;
		cursor: pointer;
		border-radius: 0.25rem;
		font-size: 1.2rem;
		display: flex;
        padding-bottom: 0.2rem;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
	}

	.control-btn:hover:not(:disabled) {
		background: #ffffff33;
	}

	.control-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.control-btn.remove {
		background: #dc2626cc;
        font-size: xx-large;
        padding-top: 0.3rem;
	}

	.control-btn.remove:hover:not(:disabled) {
		background: #dc2626ff;
	}

	.add-item-btn {
		padding: 0.5rem 0.75rem;
		background: #3b82f6ff;
		color: #ffffffff;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.2s;
		margin: 2rem auto;
		display: block;
	}

	.add-item-btn:hover {
		background: #2563ebff;
	}

	.loading-overlay {
		position: absolute;
		inset: 0;
		background: #ffffffcc;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.spinner {
		width: 2rem;
		height: 2rem;
		border: 3px solid #e5e7ebff;
		border-top-color: #3b82f6ff;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>

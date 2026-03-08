<script lang="ts">
	import { onMount } from 'svelte';
	import { editMode, repeatableStore, loadRepeatableItems } from '$lib/cms';
	import type { RepeatableComponentType } from '$lib/types/cms';
	import RepeatableContainer from '$lib/cms/RepeatableContainer.svelte';
	import Quote from '$lib/components/repeatable/Quote.svelte';

	interface Props {
		ref: string;
		type?: RepeatableComponentType;
		autoRotateDelay?: number;
	}

	let { ref, type = 'Quote', autoRotateDelay = 5000 }: Props = $props();

	const componentMap: Partial<Record<RepeatableComponentType, any>> = { Quote };
	let Component = $derived(componentMap[type]);
	let items = $derived($repeatableStore[ref] || []);
	let currentIndex = $state(0);
	let autoRotate = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	onMount(async () => {
		// Load items for view mode; RepeatableContainer handles reload in edit mode.
		await loadRepeatableItems(ref);
	});

	// Keep index in bounds when items change
	$effect(() => {
		if (items.length > 0 && currentIndex >= items.length) {
			currentIndex = items.length - 1;
		}
	});

	// Auto-rotate
	$effect(() => {
		if (autoRotate && !$editMode && items.length > 1) {
			intervalId = setInterval(() => {
				currentIndex = (currentIndex + 1) % items.length;
			}, autoRotateDelay);
		} else {
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
		}
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
		};
	});

	function prev() {
		currentIndex = (currentIndex - 1 + items.length) % items.length;
	}

	function next() {
		currentIndex = (currentIndex + 1) % items.length;
	}

	function goTo(index: number) {
		currentIndex = index;
	}
</script>

<div class="carousel">
	{#if $editMode}
		<!-- Edit mode: RepeatableContainer provides identical controls to other repeatable types -->
		<RepeatableContainer {ref} {type} />
	{:else}
		<!-- View mode: carousel display -->
		{#if items.length > 0 && Component}
			<div class="carousel-track">
				<Component item={items[currentIndex]} />
			</div>

			{#if items.length > 1}
				<div class="carousel-nav">
					<button class="nav-arrow" onclick={prev} aria-label="Previous">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M15 18l-6-6 6-6" />
						</svg>
					</button>

					<div class="carousel-dots">
						{#each items as _, i}
							<button
								class="dot"
								class:active={i === currentIndex}
								onclick={() => goTo(i)}
								aria-label="Go to slide {i + 1}"
							></button>
						{/each}
					</div>

					<button class="nav-arrow" onclick={next} aria-label="Next">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M9 18l6-6-6-6" />
						</svg>
					</button>
				</div>

				<div class="carousel-footer">
					<span class="slide-count">{currentIndex + 1} / {items.length}</span>
					<button
						class="autorotate-btn"
						class:active={autoRotate}
						onclick={() => (autoRotate = !autoRotate)}
						title={autoRotate ? 'Pause auto-rotate' : 'Start auto-rotate'}
					>
						{#if autoRotate}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
								<rect x="6" y="4" width="4" height="16" rx="1" />
								<rect x="14" y="4" width="4" height="16" rx="1" />
							</svg>
							Pause
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
								<polygon points="5 3 19 12 5 21 5 3" />
							</svg>
							Auto-play
						{/if}
					</button>
				</div>
			{/if}
		{:else}
			<div class="empty-state">No items yet.</div>
		{/if}
	{/if}
</div>

<style>
	.carousel {
		position: relative;
		width: 100%;
	}

	/* ── View mode ── */
	.carousel-track {
		width: 100%;
	}

	.carousel-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.nav-arrow {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		border: 1px solid var(--color-white-10);
		background: var(--gradient-card);
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.nav-arrow:hover {
		background: var(--color-primary-20);
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.carousel-dots {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		border: none;
		background: var(--color-white-20);
		cursor: pointer;
		padding: 0;
		transition: all 0.2s;
	}

	.dot.active {
		background: var(--color-primary);
		width: 1.5rem;
		border-radius: 0.25rem;
	}

	.carousel-footer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-top: 0.75rem;
	}

	.slide-count {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		min-width: 3rem;
		text-align: center;
	}

	.autorotate-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		border-radius: 9999px;
		border: 1px solid var(--color-white-10);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s;
	}

	.autorotate-btn:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.autorotate-btn.active {
		background: var(--color-primary-20);
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>

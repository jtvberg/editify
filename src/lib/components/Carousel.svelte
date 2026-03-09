<script lang="ts">
	import { onMount } from 'svelte';
	import { editMode, repeatableStore, loadRepeatableItems } from '$lib/cms';
	import type { RepeatableComponentType } from '$lib/types/cms';
	import RepeatableContainer from '$lib/cms/RepeatableContainer.svelte';
	import Quote from '$lib/components/repeatable/Quote.svelte';

	interface Props {
		ref: string;
		type?: RepeatableComponentType;
		/** If true, slides advance automatically. Default false (manual nav only). */
		autoRotate?: boolean;
		/** Delay between auto-rotations in ms. Only used when autoRotate is true. */
		autoRotateDelay?: number;
	}

	let { ref, type = 'Quote', autoRotate = false, autoRotateDelay = 5000 }: Props = $props();

	const componentMap: Partial<Record<RepeatableComponentType, any>> = { Quote };
	let Component = $derived(componentMap[type]);
	let items = $derived($repeatableStore[ref] || []);
	let currentIndex = $state(0);
	let direction = $state<'next' | 'prev'>('next'); // drives enter animation
	let animating = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	onMount(async () => {
		await loadRepeatableItems(ref);
	});

	// Keep index in bounds when items change
	$effect(() => {
		if (items.length > 0 && currentIndex >= items.length) {
			currentIndex = items.length - 1;
		}
	});

	// Auto-rotate — re-runs whenever autoRotate/editMode/items change
	$effect(() => {
		if (autoRotate && !$editMode && items.length > 1) {
			startTimer();
		}
		return stopTimer;
	});

	function startTimer() {
		stopTimer();
		intervalId = setInterval(() => navigate('next'), autoRotateDelay);
	}

	function stopTimer() {
		if (intervalId !== null) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function navigate(dir: 'next' | 'prev', resetTimer = false) {
		if (animating) return;
		direction = dir;
		animating = true;
		currentIndex =
			dir === 'next'
				? (currentIndex + 1) % items.length
				: (currentIndex - 1 + items.length) % items.length;
		setTimeout(() => (animating = false), 400);
		if (resetTimer && autoRotate) startTimer();
	}

	function prev() {
		navigate('prev', true);
	}

	function next() {
		navigate('next', true);
	}

	function goTo(index: number) {
		if (index === currentIndex) return;
		navigate(index > currentIndex ? 'next' : 'prev', true);
		// override the index set by navigate since we want a specific one
		currentIndex = index;
	}
</script>

<div class="carousel">
	{#if $editMode}
		<RepeatableContainer {ref} {type} />
	{:else}
		{#if items.length > 0 && Component}
			<div class="carousel-track">
				{#key currentIndex}
					<div class="slide" class:slide-next={direction === 'next'} class:slide-prev={direction === 'prev'}>
						<Component item={items[currentIndex]} />
					</div>
				{/key}
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
		overflow: hidden;
	}

	/* ── View mode ── */
	.carousel-track {
		width: 100%;
		position: relative;
	}

	/* Slide enters from the right when going next, from the left when going prev */
	.slide {
		animation-duration: 0.4s;
		animation-timing-function: ease;
		animation-fill-mode: both;
	}

	.slide-next {
		animation-name: slide-in-right;
	}

	.slide-prev {
		animation-name: slide-in-left;
	}

	@keyframes slide-in-right {
		from { opacity: 0; transform: translateX(3rem); }
		to   { opacity: 1; transform: translateX(0); }
	}

	@keyframes slide-in-left {
		from { opacity: 0; transform: translateX(-3rem); }
		to   { opacity: 1; transform: translateX(0); }
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

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>

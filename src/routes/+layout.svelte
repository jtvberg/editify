<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { initializeCMS, subscribeToChanges } from '$lib/cms';
	import { EditModeToggle, CMSOverlay } from '$lib';
	import type { CMSStore } from '$lib/types/cms';
	import '$lib/styles/theme.css';
	import '$lib/styles/cms.css';

	interface Props {
		children?: import('svelte').Snippet;
		data?: { cmsContent?: CMSStore };
	}

	let { children, data }: Props = $props();

	$effect(() => {
		if (data?.cmsContent) {
			initializeCMS(data.cmsContent);
		}
	});

	onMount(() => {
		const unsubscribe = subscribeToChanges();
		return unsubscribe;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<EditModeToggle />
<CMSOverlay />

<style>
	:global(.cms-editable) {
		position: relative;
		outline: 2px dashed var(--cms-outline-idle);
		outline-offset: 2px;
		transition: outline 0.2s;
		cursor: pointer;
		min-height: 1em;
	}

	:global(.cms-editable:hover) {
		outline: 2px solid var(--cms-outline-hover);
		background-color: var(--cms-bg-hover);
	}

	:global(.cms-editable:focus) {
		outline: 2px solid var(--cms-outline-active);
		background-color: var(--cms-bg-active);
		cursor: text;
	}

	:global(.cms-editable:empty::before) {
		content: 'Click to edit...';
		color: var(--color-text-muted);
		font-style: italic;
	}

	/* Image-specific styles */
	:global(.cms-image.cms-editable) {
		outline: none !important;
		background-color: transparent !important;
	}

	:global(.cms-image.cms-editable img) {
		outline: 2px dashed var(--cms-outline-idle);
		outline-offset: 2px;
		transition: outline 0.2s, background-color 0.2s;
		cursor: pointer;
	}

	:global(.cms-image.cms-editable:hover img) {
		outline: 2px solid var(--cms-outline-hover);
		background-color: var(--cms-bg-hover);
	}

	:global(.cms-image.cms-editable:focus img) {
		outline: 2px solid var(--cms-outline-active);
		background-color: var(--cms-bg-active);
	}

    :global(body) {
        color: var(--color-text-primary);
		background-color: var(--color-bg-primary);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
	}

	:global(h1, h2, h3) {
		margin-block: 1rem;
	}

	:global(.hero h1) {
		font-size: 4rem;
		font-weight: 900;
		margin-bottom: 1.5rem;
		background: var(--gradient-hero);
		background-size: 200% 200%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: -0.02em;
		line-height: 1.1;
		animation: gradientShift 4s ease infinite;
	}

	:global(.tag) {
		background-color: var(--color-primary-20);
		color: var(--color-text-secondary);
		padding: 0.375rem 0.75rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		border: 1px solid var(--color-primary-30);
	}

	:global(a:link) {
		color: var(--color-accent);
	}

	:global(a:visited) {
		color: var(--color-text-muted);
	}

	:global(a:hover, a:active) {
		color: var(--color-accent);
	}

	@keyframes gradientShift {
		0%, 100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}
</style>

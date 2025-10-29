<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { initializeCMS, subscribeToChanges } from '$lib/cms';
	import { EditModeToggle, CMSOverlay } from '$lib';
	import type { CMSStore } from '$lib/types/cms';

	interface Props {
		children?: import('svelte').Snippet;
		data?: { cmsContent?: CMSStore };
	}

	let { children, data }: Props = $props();

	// Initialize CMS with data from server
	$effect(() => {
		if (data?.cmsContent) {
			initializeCMS(data.cmsContent);
		}
	});

	// Subscribe to real-time changes
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
		outline: 2px dashed #3b82f680;
		outline-offset: 2px;
		transition: outline 0.2s;
		cursor: pointer;
		min-height: 1em;
	}

	:global(.cms-editable:hover) {
		outline: 2px solid #3b82f6cc;
		background-color: #3b82f60d;
	}

	:global(.cms-editable:focus) {
		outline: 2px solid #3b82f6ff;
		background-color: #3b82f61a;
		cursor: text;
	}

	:global(.cms-editable:empty::before) {
		content: 'Click to edit...';
		color: #9ca3afff;
		font-style: italic;
	}

    :global(body) {
        color: #f9fafbff;
		background-color: #131720ff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
	}

	:global(h1, h2, h3) {
		margin-block: 1rem;
	}

	:global(.hero h1) {
		font-size: 4rem;
		font-weight: 900;
		margin-bottom: 1.5rem;
		background: linear-gradient(135deg, #667eeaff 0%, #764ba2ff 50%, #f093fbff 100%);
		background-size: 200% 200%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: -0.02em;
		line-height: 1.1;
		animation: gradientShift 4s ease infinite;
	}

	:global(img) {
		width: 100%;
		border-radius: 12px;
		margin-bottom: 2rem;
		box-shadow: 0 10px 30px #0000004d;
	}

	:global(a:link) {
		color: #ad8bf7ff;
	}

	:global(a:visited) {
		color: #7d7490ff;
	}

	:global(a:hover, a:active) {
		color: #cf68ffff;
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

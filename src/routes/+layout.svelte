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
		outline: 2px dashed rgba(59, 130, 246, 0.5);
		outline-offset: 2px;
		transition: outline 0.2s;
		cursor: pointer;
		min-height: 1em;
	}

	:global(.cms-editable:hover) {
		outline: 2px solid rgba(59, 130, 246, 0.8);
		background-color: rgba(59, 130, 246, 0.05);
	}

	:global(.cms-editable:focus) {
		outline: 2px solid rgb(59, 130, 246);
		background-color: rgba(59, 130, 246, 0.1);
		cursor: text;
	}

	:global(.cms-editable:empty::before) {
		content: 'Click to edit...';
		color: #9ca3af;
		font-style: italic;
	}
</style>

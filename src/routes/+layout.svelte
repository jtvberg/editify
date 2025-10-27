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

<script lang="ts">
	import type { RepeatableItem } from '$lib/types/cms';
	import CMSContent from '$lib/cms/CMSContent.svelte';
	import { cmsStore } from '$lib/cms';

	export let item: RepeatableItem;

	$: labelRef = item.data.label_ref;
	$: label = $cmsStore[labelRef]?.content || '';
</script>

<span class="tag">
	<CMSContent ref={labelRef} type="text">
		{label}
	</CMSContent>
</span>

<style>
	.tag {
		display: inline-block;
		padding: 0.5rem 0.75rem;
		background-color: #6474aaff;
		color: #e7e6f3ff;
		border-radius: 0.25rem;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.tag:hover {
		background-color: #778fdbff;
	}
</style>

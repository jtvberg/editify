<script lang="ts">
	import type { RepeatableItem } from '$lib/types/cms';
	import { cms } from '$lib/cms/action';
	import { cmsStore } from '$lib/cms';

	export let item: RepeatableItem;

	$: labelRef = item.data.label_ref;
	$: label = $cmsStore[labelRef]?.content || '';
</script>

<span 
	class="tag" 
	data-cms-ref={labelRef} 
	data-cms-type="text" 
	use:cms
>
	{label}
</span>

<style>
	.tag {
		display: inline-block;
		padding: 0.375rem 0.75rem;
		background-color: #667eea33;
		color: #a5b4fcff;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s;
    	border: 1px solid #667eea4d;
	}

	.tag:hover {
		background-color: #778fdbff;
	}
</style>

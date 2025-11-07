<script lang="ts">
	import CMSContent from '$lib/cms/CMSContent.svelte';
	import { cmsStore } from '$lib/cms';
	import type { RepeatableItem } from '$lib/types/cms';

	interface Props {
		item: RepeatableItem;
	}

	let { item }: Props = $props();
	let data = $derived(item.data);

	// Get content from cmsStore using refs
	let title = $derived(data.title_ref ? ($cmsStore[data.title_ref]?.content || '') : '');
	let description = $derived(data.description_ref ? ($cmsStore[data.description_ref]?.content || '') : '');
</script>

<div class="section-item">
    {#if data.title_ref}
        <h3 class="section-title">
            <CMSContent ref={data.title_ref} type="text">
                {title || 'Untitled Project'}
            </CMSContent>
        </h3>
    {/if}

    {#if data.description_ref}
        <div class="section-description">
            <CMSContent ref={data.description_ref} type="html">
                {@html description || '<p>No description</p>'}
            </CMSContent>
        </div>
    {/if}
</div>

<style>
	.section-item {
		padding: 2rem;
		background: linear-gradient(135deg, #667eea1a 0%, #764ba21a 100%);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		border: 1px solid #ffffff1a;
		box-shadow: 0 8px 32px #0000004d;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.section-item:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px #667eea33;
		border-color: #667eea99;
	}

	.section-item h3 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #f9fafbff;
		margin-bottom: 1rem;
	}
</style>

<script lang="ts">
	import CMSContent from '$lib/cms/CMSContent.svelte';
	import { cmsStore } from '$lib/cms';
	import type { RepeatableItem } from '$lib/types/cms';

	interface Props {
		item: RepeatableItem;
	}

	let { item }: Props = $props();
	let data = $derived(item.data);
	let title = $derived(data.title_ref ? ($cmsStore[data.title_ref]?.content || '') : '');
	let description = $derived(data.description_ref ? ($cmsStore[data.description_ref]?.content || '') : '');
</script>

<div class="section-item">
    {#if data.title_ref}
        <h3 class="section-title">
            <CMSContent ref={data.title_ref} type="text">
                {title || 'Title'}
            </CMSContent>
        </h3>
    {/if}

    {#if data.description_ref}
        <div class="section-description">
            <CMSContent ref={data.description_ref} type="html">
                {@html description || '<p>Description</p>'}
            </CMSContent>
        </div>
    {/if}
</div>

<style>
	.section-item {
		padding: 2rem;
		background: var(--gradient-card);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		border: 1px solid var(--color-white-10);
		box-shadow: 0 8px 32px var(--color-black-50);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.section-item:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px var(--color-primary-20);
		border-color: var(--color-primary);
	}

	.section-item h3 {
		font-size: 1.625rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 1rem;
	}

	.section-description {
		font-size: 1.05rem;
		color: var(--color-text-secondary);
		line-height: 1.7;
	}
</style>

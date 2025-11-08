<script lang="ts">
	import CMSContent from '$lib/cms/CMSContent.svelte';
	import RepeatableContainer from '$lib/cms/RepeatableContainer.svelte';
	import { cmsStore } from '$lib/cms';
	import type { RepeatableItem } from '$lib/types/cms';

	interface Props {
		item: RepeatableItem;
	}

	let { item }: Props = $props();
	let data = $derived(item.data);
	let title = $derived(data.title_ref ? ($cmsStore[data.title_ref]?.content || '') : '');
	let description = $derived(data.description_ref ? ($cmsStore[data.description_ref]?.content || '') : '');
	let image = $derived(data.image_ref ? ($cmsStore[data.image_ref]?.content || '') : '');
	let link = $derived(data.link_ref ? ($cmsStore[data.link_ref]?.content || '') : '');
	let tagsRef = $derived(`${item.parent_ref}.${item.id}.tags`);
</script>

<div class="card">
	{#if data.image_ref}
		<div class="card-image">
			<CMSContent ref={data.image_ref} type="image" />
		</div>
	{/if}

	<div class="card-content">
		{#if data.title_ref}
			<h3 class="card-title">
				<CMSContent ref={data.title_ref} type="text">
					{title || 'Title'}
				</CMSContent>
			</h3>
		{/if}

		{#if data.description_ref}
			<div class="card-description">
				<CMSContent ref={data.description_ref} type="html">
					{@html description || '<p>Description</p>'}
				</CMSContent>
			</div>
		{/if}

		{#if data.link_ref}
			<div class="card-link">
				<CMSContent ref={data.link_ref} type="html">
					{@html link || '<p>Link</p>'}
				</CMSContent>
			</div>
		{/if}

		<!-- Nested tags as repeatables -->
		<div class="card-tags">
			<RepeatableContainer ref={tagsRef} type="Tag" containerClass="tag-list" />
		</div>
	</div>
</div>

<style>
	.card {
		overflow: hidden;
		background: linear-gradient(135deg, #667eea1a 0%, #764ba21a 100%);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		border: 1px solid #ffffff1a;
		box-shadow: 0 8px 32px #0000004d;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.card:hover {
		transform: translateY(-8px);
		box-shadow: 0 20px 40px #667eea4d;
		border-color: #667eeaff;
	}

	.card-image {
		width: 100%;
		height: 200px;
		background: linear-gradient(135deg, #667eea33 0%, #764ba233 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px solid #ffffff1a;
		overflow: clip;
	}

	.card-content {
		padding: 2rem;
	}

	.card-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #f9fafbff;
		margin-top: 0rem;
		letter-spacing: -0.01em;
	}

	.card-description {
		color: #d1d5dbff;
		line-height: 1.7;
		font-size: 1.05rem;
		margin-bottom: 1.5rem;
	}

	.card-description :global(p) {
		margin: 0;
	}

	.card-description :global(p:last-child) {
		margin-bottom: 0;
	}

	.card-tags {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #ffffff1a;
	}

	.card-tags :global(.tag-list) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
</style>

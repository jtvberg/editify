<script lang="ts">
	import type { RepeatableItem } from '$lib/types/cms';

	interface Props {
		item: RepeatableItem;
	}

	let { item }: Props = $props();
</script>

<div class="carousel-placeholder">
	<p>Carousel Component - Coming Soon</p>
	<pre>{JSON.stringify(item.data, null, 2)}</pre>
</div>

<style>
	.carousel-placeholder {
		padding: 2rem;
		background: #f3f4f6ff;
		border-radius: 0.5rem;
		text-align: center;
	}

	pre {
		text-align: left;
		background: #ffffffff;
		padding: 1rem;
		border-radius: 0.25rem;
		overflow: auto;
	}
</style>

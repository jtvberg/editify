<script lang="ts">
	import { onMount } from 'svelte';
	import { cmsStore, editMode, ensureContent } from '$lib/cms';
	import { cms } from '$lib/cms/action';

	interface Props {
		ref: string;
		/** Fallback text shown when no content is stored yet */
		defaultValue?: string;
		/** Scroll duration in seconds — longer = slower */
		duration?: number;
		/** Gap between repetitions (CSS value, e.g. "4rem") */
		gap?: string;
	}

	let { ref, defaultValue = 'Your marquee text here...', duration = 20, gap = '4rem' }: Props = $props();

	let content = $derived($cmsStore[ref]?.content || defaultValue);

	onMount(async () => {
		await ensureContent(ref, defaultValue, 'text');
	});
</script>

{#if $editMode}
	<div class="marquee-edit">
		<span class="marquee-label">Marquee</span>
		<!-- use:cms manages the DOM directly — no Svelte reactive binding inside -->
		<div
			data-cms-ref={ref}
			data-cms-type="text"
			data-placeholder={defaultValue}
			use:cms
			class="marquee-field"
		></div>
	</div>
{:else}
	<div class="marquee-outer" aria-label={content}>
		<div
			class="marquee-track hero"
			style="--duration: {duration}s; --gap: {gap};"
		>
			<!-- Two copies for seamless loop -->
			<h1 class="marquee-content">{content}</h1>
			<h1 class="marquee-content">{content}</h1>
		</div>
	</div>
{/if}

<style>
	.marquee-outer {
		overflow: hidden;
		width: 100%;
	}

	.marquee-track {
		display: flex;
		width: max-content;
		animation: marquee var(--duration, 20s) linear infinite;
	}

	.marquee-content {
		white-space: nowrap;
		padding-right: var(--gap, 4rem);
        font-size: 3rem;
        font-weight: 700;
	}

	@keyframes marquee {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	/* Edit mode */
	.marquee-edit {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.75rem;
		border: 1px dashed var(--cms-outline-idle);
		border-radius: 4px;
	}

	.marquee-label {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--cms-primary);
		white-space: nowrap;
		flex-shrink: 0;
	}

	/* Editable field — takes full remaining width */
	.marquee-field {
		flex: 1;
		min-width: 0;
	}

	/* CSS placeholder when the field has no content */
	.marquee-field:empty::before {
		content: attr(data-placeholder);
		opacity: 0.35;
		pointer-events: none;
	}
</style>

<script lang="ts">
	import { cmsStore, cms } from '$lib';
    import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import RepeatableContainer from '$lib/cms/RepeatableContainer.svelte';
</script>

<Header />
<main class="container">
	<section class="hero">
		<h1 data-cms-ref="home.hero.title" data-cms-type="text" use:cms>
			{$cmsStore['home.hero.title']?.content || 'Welcome to Editify'}
		</h1>
		
		<p data-cms-ref="home.hero.subtitle" data-cms-type="text" class="subtitle" use:cms>
			{$cmsStore['home.hero.subtitle']?.content || 'A lightweight CMS built with SvelteKit and Supabase'}
		</p>

		<div data-cms-ref="home.hero.description" data-cms-type="html" class="description" use:cms>
			{@html $cmsStore['home.hero.description']?.content || '<p>Click Edit Mode to start editing content inline. No complex admin panels, just direct editing where content lives.</p>'}
		</div>
	</section>

	<section class="features-detail">
		<h2 data-cms-ref="home.features.title" data-cms-type="text" use:cms>
			{$cmsStore['home.features.title']?.content || 'Key Features'}
		</h2>

		<div class="features">
			<RepeatableContainer 
				ref="home.features"
				type="Section" 
				containerClass="feature-grid"
			/>
		</div>
	</section>

	<section class="demo">
		<h2 data-cms-ref="home.demo.title" data-cms-type="text" use:cms>
			{$cmsStore['home.demo.title']?.content || 'Try It Out'}
		</h2>

		<div data-cms-ref="home.demo.instructions" data-cms-type="html" class="instructions" use:cms>
			{@html $cmsStore['home.demo.instructions']?.content || `
				<ol>
					<li>Set up your Supabase project and run the schema SQL</li>
					<li>Add your credentials to <code>.env</code></li>
					<li>Run <code>npm run cms:sync</code> to sync content refs</li>
					<li>Log in as an editor to see the Edit Mode button</li>
					<li>Click any editable content to start editing!</li>
				</ol>
			`}
		</div>
	</section>
</main>
<Footer />

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.hero {
		text-align: center;
		padding: 6rem 0 5rem;
		animation: fadeInUp 0.8s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.subtitle {
		font-size: 1.625rem;
		color: var(--color-text-muted);
		margin-bottom: 2rem;
		font-weight: 400;
		letter-spacing: -0.01em;
	}

	.description {
		font-size: 1.125rem;
		color: var(--color-text-secondary);
		max-width: 800px;
		margin: 0 auto;
		line-height: 1.8;
	}

	.description :global(p) {
		margin: 0;
	}

	.features-detail {
		padding: 5rem 0;
	}

	.features-detail h2 {
		font-size: 2.75rem;
		font-weight: 800;
		text-align: center;
		margin-bottom: 4rem;
		color: var(--color-text-primary);
		letter-spacing: -0.02em;
	}

	:global(.feature-grid) {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.demo {
		padding: 2rem 1rem;
		background: var(--gradient-card);
		border-radius: 20px;
		margin: 3rem 0;
		border: 1px solid var(--color-white-10);
		box-shadow: 0 8px 32px var(--color-black-50);
	}

	.demo h2 {
		font-size: 2.75rem;
		font-weight: 800;
		text-align: center;
		margin-bottom: 3rem;
		color: var(--color-text-primary);
		letter-spacing: -0.02em;
	}

	.instructions {
		max-width: 700px;
		margin: 0 auto;
		font-size: 1.125rem;
		line-height: 1.8;
		color: var(--color-text-secondary);
	}

	.instructions :global(ol) {
		padding-left: 1.75rem;
		counter-reset: list-counter;
	}

	.instructions :global(li) {
		margin-bottom: 1.25rem;
		position: relative;
	}

	.instructions :global(code) {
		background-color: var(--color-primary-20);
		padding: 0.35rem 0.65rem;
		border-radius: 6px;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace;
		font-size: 0.95em;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-primary-30);
	}

	@media (max-width: 768px) {
		.hero {
			padding: 4rem 0 3rem;
		}

		.hero h1 {
			font-size: 2.75rem;
		}

		.subtitle {
			font-size: 1.375rem;
		}

		.features-detail h2,
		.demo h2 {
			font-size: 2.25rem;
		}

		.demo {
			padding: 3rem 2rem;
		}
	}

	@media (max-width: 480px) {
		.container {
			padding: 1rem;
		}

		.hero h1 {
			font-size: 2.25rem;
		}

		.subtitle {
			font-size: 1.125rem;
		}
	}
</style>

<script lang="ts">
	import { cmsStore, cms } from '$lib';
	import Footer from '$lib/components/Footer.svelte';
</script>

<main class="container">
	<section class="hero">
		<h1 data-cms-ref="home.hero.title" data-cms-type="text" use:cms>
			{$cmsStore['home.hero.title']?.content || 'Welcome to Editify'}
		</h1>
		
		<p data-cms-ref="home.hero.subtitle" data-cms-type="text" class="subtitle" use:cms>
			{$cmsStore['home.hero.subtitle']?.content || 'A lightweight CMS built with SvelteKit and Supabase'}
		</p>

		<div data-cms-ref="home.hero.description" data-cms-type="rich-text" class="description" use:cms>
			{@html $cmsStore['home.hero.description']?.content || '<p>Click Edit Mode to start editing content inline. No complex admin panels, just direct editing where content lives.</p>'}
		</div>
	</section>

	<section class="features">
		<h2 data-cms-ref="home.features.title" data-cms-type="text" use:cms>
			{$cmsStore['home.features.title']?.content || 'Key Features'}
		</h2>

		<div class="feature-grid">
			<div class="feature-card">
				<h3 data-cms-ref="home.features.inline.title" data-cms-type="text" use:cms>
					{$cmsStore['home.features.inline.title']?.content || '✏️ Inline Editing'}
				</h3>
				<p data-cms-ref="home.features.inline.description" data-cms-type="text" use:cms>
					{$cmsStore['home.features.inline.description']?.content || 'Edit content directly where it appears on your site'}
				</p>
			</div>

			<div class="feature-card">
				<h3 data-cms-ref="home.features.refs.title" data-cms-type="text" use:cms>
					{$cmsStore['home.features.refs.title']?.content || '🔗 Content References'}
				</h3>
				<p data-cms-ref="home.features.refs.description" data-cms-type="text" use:cms>
					{$cmsStore['home.features.refs.description']?.content || 'Reuse content across multiple pages with shared refs'}
				</p>
			</div>

			<div class="feature-card">
				<h3 data-cms-ref="home.features.realtime.title" data-cms-type="text" use:cms>
					{$cmsStore['home.features.realtime.title']?.content || '⚡ Real-time Updates'}
				</h3>
				<p data-cms-ref="home.features.realtime.description" data-cms-type="text" use:cms>
					{$cmsStore['home.features.realtime.description']?.content || 'Changes sync instantly across all open sessions'}
				</p>
			</div>

			<div class="feature-card">
				<h3 data-cms-ref="home.features.test.title" data-cms-type="text" use:cms>
					{$cmsStore['home.features.test.title']?.content || '⚡ Test thing'}
				</h3>
				<p data-cms-ref="home.features.test.description" data-cms-type="text" use:cms>
					{$cmsStore['home.features.test.description']?.content || 'Tests are tests'}
				</p>
			</div>
		</div>
	</section>

	<section class="demo">
		<h2 data-cms-ref="home.demo.title" data-cms-type="text" use:cms>
			{$cmsStore['home.demo.title']?.content || 'Try It Out'}
		</h2>

		<div data-cms-ref="home.demo.instructions" data-cms-type="rich-text" class="instructions" use:cms>
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
		padding: 4rem 0;
	}

	.hero h1 {
		font-size: 3.5rem;
		font-weight: 800;
		margin-bottom: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		font-size: 1.5rem;
		color: #6b7280;
		margin-bottom: 2rem;
	}

	.description {
		font-size: 1.125rem;
		color: #374151;
		max-width: 800px;
		margin: 0 auto;
		line-height: 1.75;
	}

	.features {
		padding: 4rem 0;
	}

	.features h2 {
		font-size: 2.5rem;
		font-weight: 700;
		text-align: center;
		margin-bottom: 3rem;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.feature-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}

	.feature-card h3 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.feature-card p {
		color: #6b7280;
		line-height: 1.6;
	}

	.demo {
		padding: 4rem 0;
		background: #f9fafb;
		border-radius: 12px;
		margin: 2rem 0;
		padding: 3rem;
	}

	.demo h2 {
		font-size: 2.5rem;
		font-weight: 700;
		text-align: center;
		margin-bottom: 2rem;
	}

	.instructions {
		max-width: 700px;
		margin: 0 auto;
		font-size: 1.125rem;
		line-height: 1.75;
	}

	.instructions :global(ol) {
		padding-left: 1.5rem;
	}

	.instructions :global(li) {
		margin-bottom: 1rem;
	}

	.instructions :global(code) {
		background: #e5e7eb;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.95em;
	}

	@media (max-width: 768px) {
		.hero h1 {
			font-size: 2.5rem;
		}

		.subtitle {
			font-size: 1.25rem;
		}

		.feature-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

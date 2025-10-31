<script lang="ts">
	import { cmsStore, cms } from '$lib';
    import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
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
		color: #9ca3afff;
		margin-bottom: 2rem;
		font-weight: 400;
		letter-spacing: -0.01em;
	}

	.description {
		font-size: 1.125rem;
		color: #d1d5dbff;
		max-width: 800px;
		margin: 0 auto;
		line-height: 1.8;
	}

	.description :global(p) {
		margin: 0;
	}

	.features {
		padding: 5rem 0;
	}

	.features h2 {
		font-size: 2.75rem;
		font-weight: 800;
		text-align: center;
		margin-bottom: 4rem;
		color: #f9fafbff;
		letter-spacing: -0.02em;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		background: linear-gradient(135deg, #667eea1a 0%, #764ba21a 100%);
		backdrop-filter: blur(10px);
		padding: 2rem;
		border-radius: 16px;
		border: 1px solid #ffffff1a;
		box-shadow: 0 8px 32px #0000004d;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.feature-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 20px 40px #667eea4d;
		border-color: #667eeaff;
	}

	.feature-card h3 {
		font-size: 1.625rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: #f9fafbff;
		letter-spacing: -0.01em;
	}

	.feature-card p {
		color: #d1d5dbff;
		line-height: 1.7;
		font-size: 1.05rem;
	}

	.demo {
		padding: 2rem 1rem;
		background: linear-gradient(135deg, #667eea14 0%, #764ba21a 100%);
		border-radius: 20px;
		margin: 3rem 0;
		border: 1px solid #ffffff14;
		box-shadow: 0 8px 32px #0000004d;
	}

	.demo h2 {
		font-size: 2.75rem;
		font-weight: 800;
		text-align: center;
		margin-bottom: 3rem;
		color: #f9fafbff;
		letter-spacing: -0.02em;
	}

	.instructions {
		max-width: 700px;
		margin: 0 auto;
		font-size: 1.125rem;
		line-height: 1.8;
		color: #d1d5dbff;
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
		background-color: #667eea33;
		padding: 0.35rem 0.65rem;
		border-radius: 6px;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace;
		font-size: 0.95em;
		color: #a5b4fcff;
		border: 1px solid #667eea4d;
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

		.features h2,
		.demo h2 {
			font-size: 2.25rem;
		}

		.feature-grid {
			grid-template-columns: 1fr;
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

		.feature-card {
			padding: 2rem;
		}
	}
</style>

<script lang="ts">
	import { cmsStore, cms } from '$lib';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<Header />
<main class="container">
	<section class="portfolio-hero hero">
		<h1 data-cms-ref="portfolio.hero.title" data-cms-type="text" use:cms>
			{$cmsStore['portfolio.hero.title']?.content || 'Portfolio'}
		</h1>
		
		<p data-cms-ref="portfolio.hero.subtitle" data-cms-type="text" class="subtitle" use:cms>
			{$cmsStore['portfolio.hero.subtitle']?.content || 'Showcasing projects built with Editify'}
		</p>
	</section>

	<section class="projects">
		<div class="project-grid">
			<article class="project-card">
				<div class="project-image">
					<div class="placeholder-image">🎨</div>
				</div>
				<div class="project-content">
					<h3 data-cms-ref="portfolio.project1.title" data-cms-type="text" use:cms>
						{$cmsStore['portfolio.project1.title']?.content || 'E-Commerce Site'}
					</h3>
					<div data-cms-ref="portfolio.project1.description" data-cms-type="rich-text" class="project-description" use:cms>
						{@html $cmsStore['portfolio.project1.description']?.content || '<p>A modern e-commerce platform with inline content editing for product descriptions, banners, and marketing content.</p>'}
					</div>
					<div class="project-tags">
						<span class="tag">SvelteKit</span>
						<span class="tag">Supabase</span>
						<span class="tag">Stripe</span>
					</div>
				</div>
			</article>

			<article class="project-card">
				<div class="project-image">
					<div class="placeholder-image">📝</div>
				</div>
				<div class="project-content">
					<h3 data-cms-ref="portfolio.project2.title" data-cms-type="text" use:cms>
						{$cmsStore['portfolio.project2.title']?.content || 'Blog Platform'}
					</h3>
					<div data-cms-ref="portfolio.project2.description" data-cms-type="rich-text" class="project-description" use:cms>
						{@html $cmsStore['portfolio.project2.description']?.content || '<p>A clean and minimalist blog with rich text editing capabilities and real-time collaboration features.</p>'}
					</div>
					<div class="project-tags">
						<span class="tag">SvelteKit</span>
						<span class="tag">MDX</span>
						<span class="tag">Tailwind</span>
					</div>
				</div>
			</article>

			<article class="project-card">
				<div class="project-image">
					<div class="placeholder-image">🏢</div>
				</div>
				<div class="project-content">
					<h3 data-cms-ref="portfolio.project3.title" data-cms-type="text" use:cms>
						{$cmsStore['portfolio.project3.title']?.content || 'Corporate Website'}
					</h3>
					<div data-cms-ref="portfolio.project3.description" data-cms-type="rich-text" class="project-description" use:cms>
						{@html $cmsStore['portfolio.project3.description']?.content || '<p>A professional corporate website with multi-language support and content reusability across pages.</p>'}
					</div>
					<div class="project-tags">
						<span class="tag">SvelteKit</span>
						<span class="tag">i18n</span>
						<span class="tag">Analytics</span>
					</div>
				</div>
			</article>

			<article class="project-card">
				<div class="project-image">
					<div class="placeholder-image">🎓</div>
				</div>
				<div class="project-content">
					<h3 data-cms-ref="portfolio.project4.title" data-cms-type="text" use:cms>
						{$cmsStore['portfolio.project4.title']?.content || 'Learning Platform'}
					</h3>
					<div data-cms-ref="portfolio.project4.description" data-cms-type="rich-text" class="project-description" use:cms>
						{@html $cmsStore['portfolio.project4.description']?.content || '<p>An educational platform with course content management and student progress tracking.</p>'}
					</div>
					<div class="project-tags">
						<span class="tag">SvelteKit</span>
						<span class="tag">Video</span>
						<span class="tag">Auth</span>
					</div>
				</div>
			</article>
		</div>
	</section>
</main>
<Footer />

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
	}

	.portfolio-hero {
		text-align: center;
		padding: 5rem 0 4rem;
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
		font-size: 1.5rem;
		color: #9ca3afff;
		font-weight: 400;
		letter-spacing: -0.01em;
	}

	.projects {
		padding: 3rem 0 5rem;
	}

	.project-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2.5rem;
	}

	.project-card {
		background: linear-gradient(135deg, #667eea1a 0%, #764ba21a 100%);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		border: 1px solid #ffffff1a;
		box-shadow: 0 8px 32px #0000004d;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.project-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 20px 40px #667eea4d;
		border-color: #667eea4d;
	}

	.project-image {
		width: 100%;
		height: 200px;
		background: linear-gradient(135deg, #667eea33 0%, #764ba233 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px solid #ffffff1a;
	}

	.placeholder-image {
		font-size: 4rem;
		opacity: 0.6;
	}

	.project-content {
		padding: 2rem;
	}

	.project-content h3 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #f9fafbff;
		margin-bottom: 1rem;
		letter-spacing: -0.01em;
	}

	.project-description {
		color: #d1d5dbff;
		line-height: 1.7;
		font-size: 1.05rem;
		margin-bottom: 1.5rem;
	}

	.project-description :global(p) {
		margin: 0;
	}

	.project-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		background-color: #667eea33;
		color: #a5b4fcff;
		padding: 0.375rem 0.75rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		border: 1px solid #667eea4d;
	}

	@media (max-width: 768px) {
		.portfolio-hero {
			padding: 3rem 0 2rem;
		}

		.portfolio-hero h1 {
			font-size: 2.5rem;
		}

		.subtitle {
			font-size: 1.25rem;
		}

		.project-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

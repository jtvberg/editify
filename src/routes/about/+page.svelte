<script lang="ts">
	import { cmsStore, cms } from '$lib';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<Header />
<main class="container">
	<section class="about-hero hero">
		<h1 data-cms-ref="about.hero.title" data-cms-type="text" use:cms>
			{$cmsStore['about.hero.title']?.content || 'About Editify'}
		</h1>
		
		<div data-cms-ref="about.hero.description" data-cms-type="rich-text" class="description" use:cms>
			{@html $cmsStore['about.hero.description']?.content || '<p>Editify is a lightweight, inline CMS built with SvelteKit and Supabase. It allows content editors to update website content directly on the page without navigating through complex admin interfaces.</p>'}
		</div>
	</section>

	<section class="mission">
		<h2 data-cms-ref="about.mission.title" data-cms-type="text" use:cms>
			{$cmsStore['about.mission.title']?.content || 'Our Mission'}
		</h2>

		<div data-cms-ref="about.mission.content" data-cms-type="rich-text" class="content" use:cms>
			{@html $cmsStore['about.mission.content']?.content || '<p>We believe content management should be intuitive and seamless. Our mission is to make content editing as simple as clicking and typing, removing the barriers between content creators and their websites.</p>'}
		</div>
	</section>

	<section class="features-detail">
		<h2 data-cms-ref="about.features.title" data-cms-type="text" use:cms>
			{$cmsStore['about.features.title']?.content || 'What Makes Us Different'}
		</h2>

		<div class="feature-list">
			<div class="feature-item">
				<h3 data-cms-ref="about.features.direct.title" data-cms-type="text" use:cms>
					{$cmsStore['about.features.direct.title']?.content || '🎯 Direct Editing'}
				</h3>
				<div data-cms-ref="about.features.direct.description" data-cms-type="rich-text" use:cms>
					{@html $cmsStore['about.features.direct.description']?.content || '<p>Edit content exactly where it appears. No need to navigate to separate admin pages or figure out which field corresponds to which content.</p>'}
				</div>
			</div>

			<div class="feature-item">
				<h3 data-cms-ref="about.features.lightweight.title" data-cms-type="text" use:cms>
					{$cmsStore['about.features.lightweight.title']?.content || '🪶 Lightweight'}
				</h3>
				<div data-cms-ref="about.features.lightweight.description" data-cms-type="rich-text" use:cms>
					{@html $cmsStore['about.features.lightweight.description']?.content || '<p>Minimal overhead with a simple architecture. No bloated plugins or unnecessary features—just the essentials for content management.</p>'}
				</div>
			</div>

			<div class="feature-item">
				<h3 data-cms-ref="about.features.developer.title" data-cms-type="text" use:cms>
					{$cmsStore['about.features.developer.title']?.content || '👨‍💻 Developer Friendly'}
				</h3>
				<div data-cms-ref="about.features.developer.description" data-cms-type="rich-text" use:cms>
					{@html $cmsStore['about.features.developer.description']?.content || '<p>Built with modern web standards using SvelteKit. Easy to integrate, customize, and extend to fit your specific needs.</p>'}
				</div>
			</div>
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

	.about-hero {
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

	.description,
	.content {
		font-size: 1.25rem;
		color: #d1d5dbff;
		max-width: 800px;
		margin: 0 auto;
		line-height: 1.8;
	}

	.description :global(p),
	.content :global(p) {
		margin: 0 0 1rem 0;
	}

	.mission {
		padding: 5rem 0;
		text-align: center;
	}

	.mission h2 {
		font-size: 2.75rem;
		font-weight: 800;
		color: #f9fafbff;
		margin-bottom: 2rem;
		letter-spacing: -0.02em;
	}

	.features-detail {
		padding: 5rem 0;
	}

	.features-detail h2 {
		font-size: 2.75rem;
		font-weight: 800;
		color: #f9fafbff;
		text-align: center;
		margin-bottom: 4rem;
		letter-spacing: -0.02em;
	}

	.feature-list {
		display: grid;
		gap: 3rem;
		max-width: 900px;
		margin: 0 auto;
	}

	.feature-item {
		background: linear-gradient(135deg, #667eea1a 0%, #764ba21a 100%);
		backdrop-filter: blur(10px);
		padding: 2rem;
		border-radius: 16px;
		border: 1px solid #ffffff1a;
		box-shadow: 0 8px 32px #0000004d;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.feature-item:hover {
		transform: translateY(-8px);
		box-shadow: 0 20px 40px #667eea4d;
		border-color: #667eeaff;
	}

	.feature-item h3 {
		font-size: 1.75rem;
		font-weight: 700;
		color: #f9fafbff;
		margin-bottom: 1rem;
		letter-spacing: -0.01em;
	}

	.feature-item :global(p) {
		color: #d1d5dbff;
		line-height: 1.7;
		font-size: 1.125rem;
		margin: 0;
	}

	@media (max-width: 768px) {
		.about-hero {
			padding: 3rem 0 2rem;
		}

		.about-hero h1 {
			font-size: 2.5rem;
		}

		.mission h2,
		.features-detail h2 {
			font-size: 2rem;
		}

		.description,
		.content {
			font-size: 1.125rem;
		}

		.feature-item {
			padding: 2rem;
		}
	}
</style>

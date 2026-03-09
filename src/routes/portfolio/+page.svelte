<script lang="ts">
	import { cmsStore, cms } from '$lib';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import RepeatableContainer from '$lib/cms/RepeatableContainer.svelte';
	import Marquee from '$lib/components/Marquee.svelte';
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
		<RepeatableContainer 
			ref="portfolio.projects" 
			type="Card" 
			containerClass="project-grid"
		/>
	</section>

	<section class="marquee-section">
		<Marquee ref="portfolio.marquee" duration={30} gap="6rem" />
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
		color: var(--color-text-muted);
		font-weight: 400;
		letter-spacing: -0.01em;
	}

	.projects {
		padding: 3rem 0 5rem;
	}

	:global(.project-grid) {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2.5rem;
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

		:global(.project-grid) {
			grid-template-columns: 1fr;
		}
	}
</style>

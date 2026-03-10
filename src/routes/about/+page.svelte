<script lang="ts">
	import { cmsStore, cms, Accordion } from '$lib';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import defaultMissionImage from '$lib/assets/default_image.jpg';
	import RepeatableContainer from '$lib/cms/RepeatableContainer.svelte';
</script>

<Header />
<main class="container">
	<section class="about-hero hero">
		<h1 data-cms-ref="about.hero.title" data-cms-type="text" use:cms>
			{$cmsStore['about.hero.title']?.content || 'About Editify'}
		</h1>
		
		<div data-cms-ref="about.hero.description" data-cms-type="html" class="description" use:cms>
			{@html $cmsStore['about.hero.description']?.content || '<p>Editify is a lightweight, inline CMS built with SvelteKit and Supabase. It allows content editors to update website content directly on the page without navigating through complex admin interfaces.</p>'}
		</div>
	</section>

	<section class="mission">
		<h2 data-cms-ref="about.mission.title" data-cms-type="text" use:cms>
			{$cmsStore['about.mission.title']?.content || 'Our Mission'}
		</h2>

		<div data-cms-ref="about.mission.image" data-cms-type="image" class="image" use:cms>
			<img src={$cmsStore['about.mission.image']?.content || defaultMissionImage} alt="Our Mission" />
		</div>

		<div data-cms-ref="about.mission.content" data-cms-type="html" class="content" use:cms>
			{@html $cmsStore['about.mission.content']?.content || '<p>We believe content management should be intuitive and seamless. Our mission is to make content editing as simple as clicking and typing, removing the barriers between content creators and their websites.</p>'}
		</div>
	</section>

	<section class="features-detail">
		<h2 data-cms-ref="about.features.title" data-cms-type="text" use:cms>
			{$cmsStore['about.features.title']?.content || 'What Makes Us Different'}
		</h2>

		<div class="features">
			<RepeatableContainer 
				ref="about.features"
				type="Section" 
				containerClass="feature-list"
			/>
		</div>
	</section>

	<section>
		<h2 data-cms-ref="about.faq.title" data-cms-type="text" use:cms>
			{$cmsStore['about.faq.title']?.content || 'Frequently Asked Questions'}
		</h2>

		<Accordion ref="about.faq" type="AccordionItem" />
	</section>
</main>
<Footer />

<style>
	img {
		width: 100%;
		border-radius: 12px;
		margin-bottom: 2rem;
		box-shadow: 0 10px 30px var(--color-black-50);
	}
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
		color: var(--color-text-secondary);
		max-width: 800px;
		margin: 0 auto;
		line-height: 1.8;
	}

	.image {
		width: 50vw;
		margin: auto;
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
		color: var(--color-text-primary);
		margin-bottom: 2rem;
		letter-spacing: -0.02em;
	}

	.features-detail {
		padding: 5rem 0;
	}

	.features-detail h2 {
		font-size: 2.75rem;
		font-weight: 800;
		color: var(--color-text-primary);
		text-align: center;
		margin-bottom: 4rem;
		letter-spacing: -0.02em;
	}

	:global(.feature-list) {
		display: flex;
		flex-direction: column;
		gap: 3rem;
		max-width: 900px;
		margin: 0 auto;
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
	}
</style>

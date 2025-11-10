<script lang="ts">
	import { cmsStore, cms } from '$lib';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let formData = $state({
		name: '',
		email: '',
		message: ''
	});

	let submitted = $state(false);

	function handleSubmit(e: Event) {
		e.preventDefault();
		console.log('Form submitted:', formData);
		submitted = true;

		setTimeout(() => {
			formData = { name: '', email: '', message: '' };
			submitted = false;
		}, 3000);
	}
</script>

<Header />
<main class="container">
	<section class="contact-hero hero">
		<h1 data-cms-ref="contact.hero.title" data-cms-type="text" use:cms>
			{$cmsStore['contact.hero.title']?.content || 'Get In Touch'}
		</h1>
		
		<p data-cms-ref="contact.hero.subtitle" data-cms-type="text" class="subtitle" use:cms>
			{$cmsStore['contact.hero.subtitle']?.content || 'Have questions? We\'d love to hear from you.'}
		</p>
	</section>

	<section class="contact-content">
		<div class="contact-grid">
			<div class="contact-info">
				<h2 data-cms-ref="contact.info.title" data-cms-type="text" use:cms>
					{$cmsStore['contact.info.title']?.content || 'Let\'s Talk'}
				</h2>
				
				<div data-cms-ref="contact.info.description" data-cms-type="html" class="info-description" use:cms>
					{@html $cmsStore['contact.info.description']?.content || '<p>Whether you have questions about Editify, need help with implementation, or want to discuss a project, our team is ready to answer all your questions.</p>'}
				</div>

				<div class="contact-methods">
					<div class="contact-method">
						<span class="method-icon">📧</span>
						<div>
							<h3>Email</h3>
							<p data-cms-ref="contact.email" data-cms-type="text" use:cms>
								{$cmsStore['contact.email']?.content || 'hello@editify.dev'}
							</p>
						</div>
					</div>

					<div class="contact-method">
						<span class="method-icon">💬</span>
						<div>
							<h3>Support</h3>
							<p data-cms-ref="contact.support" data-cms-type="text" use:cms>
								{$cmsStore['contact.support']?.content || 'Available Monday-Friday, 9am-5pm EST'}
							</p>
						</div>
					</div>

					<div class="contact-method">
						<span class="method-icon">🔗</span>
						<div>
							<h3>GitHub</h3>
							<p data-cms-ref="contact.github" data-cms-type="text" use:cms>
								{$cmsStore['contact.github']?.content || 'github.com/editify'}
							</p>
						</div>
					</div>
				</div>
			</div>

			<div class="contact-form-wrapper">
				<form class="contact-form" onsubmit={handleSubmit}>
					<div class="form-group">
						<label for="name">Name</label>
						<input 
							id="name" 
							type="text" 
							bind:value={formData.name}
							required 
							placeholder="Your name"
						/>
					</div>

					<div class="form-group">
						<label for="email">Email</label>
						<input 
							id="email" 
							type="email" 
							bind:value={formData.email}
							required 
							placeholder="your.email@example.com"
						/>
					</div>

					<div class="form-group">
						<label for="message">Message</label>
						<textarea 
							id="message" 
							bind:value={formData.message}
							required 
							placeholder="Tell us about your project or question..."
							rows="6"
						></textarea>
					</div>

					{#if submitted}
						<div class="success-message">
							✓ Message sent successfully!
						</div>
					{:else}
						<button type="submit" class="submit-btn">
							Send Message
						</button>
					{/if}
				</form>
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

	.contact-hero {
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

	.contact-content {
		padding: 3rem 0 5rem;
	}

	.contact-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: start;
	}

	.contact-info h2 {
		font-size: 2.25rem;
		font-weight: 800;
		color: var(--color-text-primary);
		margin-bottom: 1.5rem;
		letter-spacing: -0.02em;
	}

	.info-description {
		font-size: 1.125rem;
		color: var(--color-text-secondary);
		line-height: 1.8;
		margin-bottom: 3rem;
	}

	.info-description :global(p) {
		margin: 0;
	}

	.contact-methods {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.contact-method {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.method-icon {
		font-size: 2rem;
		line-height: 1;
	}

	.contact-method h3 {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 0.25rem;
	}

	.contact-method p {
		color: var(--color-text-muted);
		font-size: 1rem;
		margin: 0;
	}

	.contact-form-wrapper {
		background: var(--gradient-card);
		backdrop-filter: blur(10px);
		padding: 2rem;
		border-radius: 16px;
		border: 1px solid var(--color-white-10);
		box-shadow: 0 8px 32px var(--color-black-50);
	}

	.contact-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		color: var(--color-text-primary);
		font-weight: 600;
		font-size: 0.9375rem;
	}

	.form-group input,
	.form-group textarea {
		background-color: rgba(17, 24, 39, 0.5);
		border: 1px solid var(--color-white-10);
		border-radius: 8px;
		padding: 0.875rem 1rem;
		color: var(--color-text-primary);
		font-size: 1rem;
		font-family: inherit;
		transition: all 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: rgba(102, 126, 234, 0.5);
		background-color: rgba(17, 24, 39, 0.7);
		box-shadow: 0 0 0 3px var(--color-primary-10);
	}

	.form-group input::placeholder,
	.form-group textarea::placeholder {
		color: var(--cms-placeholder-text);
	}

	.form-group textarea {
		resize: vertical;
		min-height: 120px;
	}

	.submit-btn {
		background: var(--gradient-primary);
		color: var(--cms-overlay-bg);
		border: none;
		border-radius: 8px;
		padding: 1rem 2rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
		box-shadow: 0 4px 12px var(--color-primary-20);
	}

	.submit-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px var(--color-primary-30);
	}

	.submit-btn:active {
		transform: translateY(0);
	}

	.success-message {
		background-color: var(--cms-success-bg);
		border: 1px solid var(--cms-success-border);
		color: var(--cms-success-text);
		padding: 1rem;
		border-radius: 8px;
		text-align: center;
		font-weight: 600;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.contact-hero {
			padding: 3rem 0 2rem;
		}

		.contact-hero h1 {
			font-size: 2.5rem;
		}

		.subtitle {
			font-size: 1.25rem;
		}

		.contact-grid {
			grid-template-columns: 1fr;
			gap: 3rem;
		}

		.contact-form-wrapper {
			padding: 2rem;
		}
	}
</style>

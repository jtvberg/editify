<script lang="ts">
	import { page } from '$app/stores';
	
	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/portfolio', label: 'Portfolio' },
		{ href: '/contact', label: 'Contact' }
	];

	let mobileMenuOpen = false;

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	$: currentPath = $page.url.pathname;
</script>

<header class="header">
	<nav class="nav-container">
		<div class="nav-content">
			<!-- Logo/Brand -->
			<a href="/" class="logo" on:click={closeMobileMenu}>
				<span class="logo-icon"></span>
				<span class="logo-text">Editify</span>
			</a>

			<!-- Desktop Navigation -->
			<div class="nav-links">
				{#each navItems as item}
					<a 
						href={item.href} 
						class="nav-link"
						class:active={currentPath === item.href}
					>
						{item.label}
					</a>
				{/each}
			</div>

			<!-- Mobile Menu Button -->
			<button 
				class="mobile-menu-btn" 
				on:click={toggleMobileMenu}
				aria-label="Toggle menu"
			>
				{#if mobileMenuOpen}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="3" y1="12" x2="21" y2="12"></line>
						<line x1="3" y1="6" x2="21" y2="6"></line>
						<line x1="3" y1="18" x2="21" y2="18"></line>
					</svg>
				{/if}
			</button>
		</div>

		<!-- Mobile Navigation -->
		{#if mobileMenuOpen}
			<div class="mobile-nav">
				{#each navItems as item}
					<a 
						href={item.href} 
						class="mobile-nav-link"
						class:active={currentPath === item.href}
						on:click={closeMobileMenu}
					>
						{item.label}
					</a>
				{/each}
			</div>
		{/if}
	</nav>
</header>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 50;
		backdrop-filter: blur(12px);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.nav-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 4rem;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.5rem;
		font-weight: 800;
		text-decoration: none;
		color: var(--color-text-primary);
		transition: opacity 0.2s;
		letter-spacing: -0.02em;
	}

	.logo:hover {
		opacity: 0.8;
	}

	.logo-icon {
		font-size: 1.75rem;
		line-height: 1;
	}

	.logo-text {
		background: var(--gradient-hero);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-link {
		padding: 0.5rem 1rem;
		text-decoration: none;
		color: var(--color-text-secondary);
		font-weight: 500;
		font-size: 0.9375rem;
		border-radius: 8px;
		transition: all 0.2s;
		position: relative;
	}

	.nav-link:hover {
		color: var(--color-text-primary);
		background-color: var(--color-primary-10);
	}

	.nav-link.active {
		color: var(--color-text-primary);
	}

	.nav-link.active::after {
		content: '';
		position: absolute;
		bottom: 0.25rem;
		left: 50%;
		transform: translateX(-50%);
		width: 60%;
		height: 2px;
		background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark));
		border-radius: 2px;
	}

	.mobile-menu-btn {
		display: none;
		background: none;
		border: none;
		color: var(--color-text-primary);
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 8px;
		transition: background 0.2s;
	}

	.mobile-menu-btn:hover {
		background-color: var(--color-primary-10);
	}

	.mobile-nav {
		display: none;
		flex-direction: column;
		padding: 1rem 0;
		gap: 0.5rem;
		border-top: 1px solid var(--color-white-10);
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.mobile-nav-link {
		display: block;
		padding: 0.75rem 1rem;
		text-decoration: none;
		color: var(--color-text-secondary);
		font-weight: 500;
		font-size: 1rem;
		border-radius: 8px;
		transition: all 0.2s;
	}

	.mobile-nav-link:hover {
		color: var(--color-text-primary);
		background-color: var(--color-primary-10);
	}

	.mobile-nav-link.active {
		color: var(--color-text-primary);
		background-color: var(--color-primary-20);
		border-left: 3px solid var(--color-primary);
		padding-left: calc(1rem - 3px);
	}

	@media (max-width: 768px) {
		.nav-links {
			display: none;
		}

		.mobile-menu-btn {
			display: block;
		}

		.mobile-nav {
			display: flex;
		}

		.nav-container {
			padding: 0 1rem;
		}
	}
</style>

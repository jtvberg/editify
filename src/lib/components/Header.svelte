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
				<span class="logo-icon">✏️</span>
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
				<a href="/login" class="nav-link login-link">Login</a>
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
				<a 
					href="/login" 
					class="mobile-nav-link login-link"
					on:click={closeMobileMenu}
				>
					Login
				</a>
			</div>
		{/if}
	</nav>
</header>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: rgba(17, 24, 39, 0.8);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
		color: #f9fafb;
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
		background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
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
		color: #d1d5db;
		font-weight: 500;
		font-size: 0.9375rem;
		border-radius: 8px;
		transition: all 0.2s;
		position: relative;
	}

	.nav-link:hover {
		color: #f9fafb;
		background: rgba(102, 126, 234, 0.1);
	}

	.nav-link.active {
		color: #f9fafb;
		background: rgba(102, 126, 234, 0.15);
	}

	.nav-link.active::after {
		content: '';
		position: absolute;
		bottom: 0.25rem;
		left: 50%;
		transform: translateX(-50%);
		width: 60%;
		height: 2px;
		background: linear-gradient(90deg, #667eea, #764ba2);
		border-radius: 2px;
	}

	.login-link {
		margin-left: 0.5rem;
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
		border: 1px solid rgba(102, 126, 234, 0.3);
		color: #a5b4fc;
	}

	.login-link:hover {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
		border-color: rgba(102, 126, 234, 0.5);
		color: #c7d2fe;
	}

	.mobile-menu-btn {
		display: none;
		background: none;
		border: none;
		color: #f9fafb;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 8px;
		transition: background 0.2s;
	}

	.mobile-menu-btn:hover {
		background: rgba(102, 126, 234, 0.1);
	}

	.mobile-nav {
		display: none;
		flex-direction: column;
		padding: 1rem 0;
		gap: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
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
		color: #d1d5db;
		font-weight: 500;
		font-size: 1rem;
		border-radius: 8px;
		transition: all 0.2s;
	}

	.mobile-nav-link:hover {
		color: #f9fafb;
		background: rgba(102, 126, 234, 0.1);
	}

	.mobile-nav-link.active {
		color: #f9fafb;
		background: rgba(102, 126, 234, 0.15);
		border-left: 3px solid #667eea;
		padding-left: calc(1rem - 3px);
	}

	.mobile-nav-link.login-link {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
		border: 1px solid rgba(102, 126, 234, 0.3);
		color: #a5b4fc;
		margin-top: 0.5rem;
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

<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin() {
		loading = true;
		error = '';

		const { error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (signInError) {
			error = signInError.message;
			loading = false;
		} else {
			goto('/');
		}
	}
</script>

<Header />
<div class="login-container">
	<h1>CMS Login</h1>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleLogin();
		}}
	>
		<div class="form-group">
			<label for="email">Email</label>
			<input id="email" type="email" bind:value={email} required placeholder="editor@example.com" />
		</div>

		<div class="form-group">
			<label for="password">Password</label>
			<input id="password" type="password" bind:value={password} required placeholder="••••••••" />
		</div>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<button type="submit" disabled={loading}>
			{loading ? 'Logging in...' : 'Log In'}
		</button>
	</form>
</div>

<style>
	.login-container {
		max-width: 450px;
		margin: 6rem auto;
		padding: 3rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
		background: var(--gradient-card);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		border: 1px solid var(--color-white-10);
		box-shadow: 0 8px 32px var(--color-black-50);
		animation: fadeInUp 0.6s ease-out;
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

	.login-container h1 {
		font-size: 2rem;
		font-weight: 800;
		color: var(--color-text-primary);
		margin-bottom: 2rem;
		text-align: center;
		letter-spacing: -0.02em;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
		font-size: 0.9375rem;
	}

	input {
		width: -webkit-fill-available;
		padding: 0.875rem 1rem;
		background-color: rgba(17, 24, 39, 0.5);
		border: 1px solid var(--color-white-10);
		border-radius: 8px;
		font-size: 1rem;
		color: var(--color-text-primary);
		font-family: inherit;
		transition: all 0.2s;
	}

	input:focus {
		outline: none;
		border-color: rgba(102, 126, 234, 0.5);
		background-color: rgba(17, 24, 39, 0.7);
		box-shadow: 0 0 0 3px var(--color-primary-10);
	}

	input::placeholder {
		color: var(--cms-placeholder-text);
	}

	button {
		width: 100%;
		padding: 0.875rem;
		background: var(--gradient-primary);
		color: var(--cms-overlay-bg);
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
		box-shadow: 0 4px 12px var(--color-primary-20);
		margin-top: 0.5rem;
	}

	button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px var(--color-primary-30);
	}

	button:active:not(:disabled) {
		transform: translateY(0);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.error {
		background-color: var(--cms-error-bg);
		border: 1px solid var(--cms-error-border);
		color: var(--cms-error-text);
		padding: 0.875rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		font-size: 0.9375rem;
	}

	@media (max-width: 768px) {
		.login-container {
			margin: 3rem auto;
			padding: 2rem;
		}

		.login-container h1 {
			font-size: 1.75rem;
		}
	}
</style>

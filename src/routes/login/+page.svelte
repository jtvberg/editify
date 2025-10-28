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
		background: linear-gradient(135deg, #667eea1a 0%, #764ba21a 100%);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		border: 1px solid #ffffff1a;
		box-shadow: 0 8px 32px #0000004d;
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
		color: #f9fafbff;
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
		color: #f9fafbff;
		font-size: 0.9375rem;
	}

	input {
		width: 100%;
		padding: 0.875rem 1rem;
		background-color: #11182780;
		border: 1px solid #ffffff1a;
		border-radius: 8px;
		font-size: 1rem;
		color: #f9fafbff;
		font-family: inherit;
		transition: all 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #667eea80;
		background-color: #111827b3;
		box-shadow: 0 0 0 3px #667eea1a;
	}

	input::placeholder {
		color: #6b7280ff;
	}

	button {
		width: 100%;
		padding: 0.875rem;
		background: linear-gradient(135deg, #667eeaff 0%, #764ba2ff 100%);
		color: #ffffffff;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
		box-shadow: 0 4px 12px #667eea66;
		margin-top: 0.5rem;
	}

	button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px #667eea80;
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
		background-color: #ef444433;
		border: 1px solid #ef444433;
		color: #fca5a5ff;
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
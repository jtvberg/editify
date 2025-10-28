<script lang="ts">
	import { cmsStore, cms } from '$lib';
</script>

<footer class="footer">
    <p data-cms-ref="global.footer.copyright" data-cms-type="text" use:cms>
        {$cmsStore['global.footer.copyright']?.content || '© 2025 Editify. Built with SvelteKit/Supabase/Vite.'}
    </p>
	<a href="/login" class="nav-link login-link">Login</a>
</footer>

<style>
	.footer {
		text-align: center;
		padding: 3rem 0;
		margin-top: 4rem;
	}

	.footer p {
		color: #6b7280ff;
	}

	.login-link {
		color: #a5b4fcff;
	}

	.login-link:hover {
		color: #c7d2feff;
	}
</style>

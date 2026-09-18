<script lang="ts">
	import '../app.css';
	import MeshBackground from '$lib/components/MeshBackground.svelte';
	import { WORKSHOP } from '$lib/feedback';

	let { children } = $props();
</script>

<MeshBackground />

<div class="shell">
	<header>
		<a class="brand" href="https://www.symphozen.com" target="_blank" rel="noreferrer">
			<img src="/logo.svg" alt="SymphoZen Labs" />
		</a>
		<span class="tag">Workshop feedback</span>
	</header>

	<main>
		{@render children?.()}
	</main>

	<footer>
		<p>&copy; {new Date().getFullYear()} {WORKSHOP.host} — Building Smart Digital Ecosystems</p>
	</footer>
</div>

<style>
	.shell {
		display: flex;
		flex-direction: column;
		min-height: 100svh;
		max-width: 1080px;
		margin: 0 auto;
		padding: 0 clamp(1rem, 4vw, 2.5rem);
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: clamp(1.25rem, 3vw, 2rem) 0;
		animation: settle var(--dur-slow) var(--ease-out) backwards;
	}

	.brand {
		display: block;
		line-height: 0;
		transition: opacity var(--dur-fast) var(--ease-out);
	}

	.brand:hover {
		opacity: 0.72;
	}

	.brand img {
		height: clamp(30px, 5vw, 40px);
		width: auto;
	}

	.tag {
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-muted);
		padding: 0.4rem 0.85rem;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-pill);
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		white-space: nowrap;
	}

	/* Column flex so the hero can claim exactly the space between header and
	   footer — the landing view then fits the fold with no stray scroll. */
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	footer {
		padding: 2rem 0;
		border-top: 1px solid var(--color-line);
		font-size: 0.8rem;
		color: var(--color-faint);
		text-align: center;
	}

	@keyframes settle {
		from {
			opacity: 0;
			transform: translateY(-12px);
		}
	}

	/* The logo lockup already says who this is — drop the pill when space is tight */
	@media (max-width: 440px) {
		.tag {
			display: none;
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { magnetic, celebrate } from '$lib/motion';
	import { WORKSHOP } from '$lib/feedback';

	let { name = '', onReset }: { name?: string; onReset: () => void } = $props();

	const firstName = $derived(name.trim().split(/\s+/)[0] ?? '');

	let seal = $state<HTMLElement | undefined>();

	onMount(() => {
		// Let the seal start drawing, then bloom outward from its centre.
		const timer = setTimeout(() => {
			if (!seal) return;
			const rect = seal.getBoundingClientRect();
			celebrate({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
		}, 340);

		return () => clearTimeout(timer);
	});
</script>

<section class="done">
	<div class="seal" bind:this={seal}>
		<svg viewBox="0 0 64 64" aria-hidden="true">
			<circle class="ring" cx="32" cy="32" r="29" />
			<path class="check" d="M19 33.5l9 9 17-19" />
		</svg>
	</div>

	<p class="eyebrow">Received</p>
	<h1>
		Thank you{firstName ? `, ${firstName}` : ''}.
	</h1>
	<p class="lede">
		Your feedback on <strong>{WORKSHOP.title}</strong> is in. It goes straight to the team
		who ran the session and shapes what we build next.
	</p>

	<div class="actions">
		<a class="btn primary" href="https://www.symphozen.com" use:magnetic={{ strength: 0.22 }}>
			Explore SymphoZen Labs
			<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
		</a>
		<button type="button" class="btn ghost" onclick={onReset}>
			Submit another response
		</button>
	</div>
</section>

<style>
	.done {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1rem;
		padding: clamp(3rem, 9vw, 6rem) 1rem;
		max-width: 620px;
		margin: 0 auto;
	}

	.seal {
		width: 96px;
		height: 96px;
		margin-bottom: 0.5rem;
		animation: seal-in 0.7s var(--ease-spring) backwards;
	}

	.seal svg {
		width: 100%;
		height: 100%;
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.ring {
		stroke: var(--color-primary);
		stroke-width: 2;
		opacity: 0.32;
		stroke-dasharray: 183;
		animation: draw-ring 1s var(--ease-out) backwards 0.1s;
	}

	.check {
		stroke: var(--color-primary);
		stroke-width: 4;
		stroke-dasharray: 40;
		animation: draw-check 0.5s var(--ease-out) backwards 0.35s;
	}

	h1 {
		font-size: clamp(2rem, 6vw, 3.1rem);
	}

	.lede {
		color: var(--color-muted);
		font-size: 1.02rem;
		max-width: 46ch;
	}

	.lede strong {
		color: var(--color-base-content);
		font-weight: 600;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
		margin-top: 1.25rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.8rem 1.5rem;
		border-radius: var(--radius-pill);
		font-size: 0.93rem;
		font-weight: 600;
		text-decoration: none;
		transition:
			transform var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out),
			background var(--dur-fast) var(--ease-out);
	}

	.btn svg {
		width: 15px;
		height: 15px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: transform var(--dur-fast) var(--ease-out);
	}

	.btn:hover svg {
		transform: translateX(3px);
	}

	.primary {
		background: var(--color-primary);
		color: var(--color-primary-content);
		box-shadow: var(--shadow-md);
	}

	.primary:hover {
		background: var(--color-primary-deep);
		box-shadow: var(--shadow-lg);
	}

	.ghost {
		color: var(--color-muted);
		border: 1px solid var(--color-line);
		background: rgba(255, 255, 255, 0.5);
	}

	.ghost:hover {
		color: var(--color-base-content);
		border-color: var(--color-base-content);
	}

	@keyframes seal-in {
		from {
			opacity: 0;
			transform: scale(0.5);
		}
	}

	@keyframes draw-ring {
		from {
			stroke-dashoffset: 183;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes draw-check {
		from {
			stroke-dashoffset: 40;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
</style>

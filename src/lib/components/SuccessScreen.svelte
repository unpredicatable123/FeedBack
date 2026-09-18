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

	<a
		class="download"
		href={WORKSHOP.slides.href}
		download={WORKSHOP.slides.filename}
		use:magnetic={{ strength: 0.18 }}
	>
		<span class="doc" aria-hidden="true">
			<svg viewBox="0 0 24 24"><path d="M6 2.8h8l4 4v14.4H6z M14 2.8v4h4" /></svg>
			<span class="doc-tag">PDF</span>
		</span>
		<span class="download-text">
			<span class="download-title">Download the session slides</span>
			<span class="download-meta">{WORKSHOP.title} · {WORKSHOP.slides.size}</span>
		</span>
		<span class="download-icon" aria-hidden="true">
			<svg viewBox="0 0 16 16"><path d="M8 2.5v8.5M4.5 7.5 8 11l3.5-3.5M3 13.5h10" /></svg>
		</span>
	</a>

	<div class="actions">
		<a class="btn ghost" href="https://www.symphozen.com" use:magnetic={{ strength: 0.22 }}>
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
		/* Auto margins switch off flex stretch, so without an explicit width the
		   section sizes to its content and can outgrow a phone screen. */
		width: 100%;
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

	/* ---------- slides download ---------- */

	.download {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		max-width: 440px;
		margin-top: 1.5rem;
		padding: 0.9rem 1rem 0.9rem 0.9rem;
		border-radius: var(--radius-box);
		background: var(--color-primary);
		color: var(--color-primary-content);
		text-align: left;
		text-decoration: none;
		box-shadow: var(--shadow-md);
		animation: rise var(--dur-slow) var(--ease-out) backwards 0.55s;
		transition:
			background var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out);
	}

	.download:hover {
		background: var(--color-primary-deep);
		box-shadow: var(--shadow-lg);
	}

	.download:focus-visible {
		outline: none;
		box-shadow: var(--shadow-focus);
	}

	.doc {
		position: relative;
		display: grid;
		place-items: center;
		flex: 0 0 auto;
		width: 46px;
		height: 52px;
		border-radius: var(--radius-field);
		background: rgba(255, 255, 255, 0.16);
	}

	.doc svg {
		width: 26px;
		height: 26px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linejoin: round;
	}

	.doc-tag {
		position: absolute;
		bottom: 6px;
		padding: 0 4px;
		border-radius: 3px;
		background: var(--color-primary-content);
		color: var(--color-primary-deep);
		font-size: 0.56rem;
		font-weight: 700;
		letter-spacing: 0.06em;
	}

	.download-text {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		flex: 1 1 auto;
		min-width: 0;
	}

	.download-title {
		font-weight: 600;
		font-size: 0.98rem;
	}

	.download-meta {
		font-size: 0.8rem;
		opacity: 0.8;
	}

	.download-icon {
		display: grid;
		place-items: center;
		flex: 0 0 auto;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.18);
		transition: background var(--dur-fast) var(--ease-out);
	}

	.download-icon svg {
		width: 17px;
		height: 17px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* The arrow drops into the tray on hover */
	.download:hover .download-icon {
		background: rgba(255, 255, 255, 0.28);
	}

	.download:hover .download-icon svg {
		animation: drop 0.9s var(--ease-out) infinite;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
		margin-top: 0.75rem;
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

	.ghost {
		color: var(--color-muted);
		border: 1px solid var(--color-line);
		background: rgba(255, 255, 255, 0.5);
	}

	.ghost:hover {
		color: var(--color-base-content);
		border-color: var(--color-base-content);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
	}

	@keyframes drop {
		0% {
			transform: translateY(-3px);
			opacity: 0;
		}
		35% {
			opacity: 1;
		}
		70%,
		100% {
			transform: translateY(1px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.download {
			animation: none;
		}
		.download:hover .download-icon svg {
			animation: none;
		}
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

<script lang="ts">
	type Props = {
		steps: readonly string[];
		current: number;
		onJump?: (index: number) => void;
		furthest?: number;
	};

	let { steps, current, onJump, furthest = 0 }: Props = $props();

	const pct = $derived(Math.round((current / (steps.length - 1)) * 100));
</script>

<nav class="rail" aria-label="Form progress">
	<ol>
		{#each steps as step, i (step)}
			{@const done = i < current}
			{@const active = i === current}
			<li>
				{#if i > 0}
					<span class="link" class:filled={i <= current} aria-hidden="true">
						<span class="link-fill"></span>
					</span>
				{/if}

				<button
					type="button"
					class="node"
					class:done
					class:active
					disabled={i > furthest}
					aria-current={active ? 'step' : undefined}
					aria-label="Step {i + 1}: {step}"
					onclick={() => onJump?.(i)}
				>
					<span class="badge">
						{#if done}
							<svg class="tick" viewBox="0 0 16 16" aria-hidden="true">
								<path d="M3.5 8.5l3 3 6-7" />
							</svg>
						{:else}
							<span class="num">{i + 1}</span>
						{/if}
						{#if active}<span class="halo"></span>{/if}
					</span>

					<span class="label"><span class="label-text">{step}</span></span>

					{#if active}<span class="sheen"></span>{/if}
				</button>
			</li>
		{/each}
	</ol>

	<p class="sr-only" aria-live="polite">
		Step {current + 1} of {steps.length}: {steps[current]} — {pct}% complete
	</p>
</nav>

<style>
	.rail {
		container-type: inline-size;
	}

	ol {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* Each item grows so its connector can absorb the leftover width; the
	   first has no connector, so it stays at its natural size. */
	li {
		display: flex;
		align-items: center;
		flex: 1 1 auto;
		min-width: 0;
	}

	li:first-child {
		flex: 0 0 auto;
	}

	/* ---------- connectors ---------- */

	.link {
		position: relative;
		display: block;
		height: 2px;
		border-radius: 2px;
		background: var(--color-base-300);
		overflow: hidden;
		flex: 1 1 auto;
		min-width: 6px;
	}

	.link-fill {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--color-primary-deep), var(--color-primary));
		transform: scaleX(0);
		transform-origin: left;
		transition: transform var(--dur-slow) var(--ease-out);
	}

	.link.filled .link-fill {
		transform: scaleX(1);
	}

	/* ---------- the morphing pill ---------- */

	.node {
		position: relative;
		display: flex;
		align-items: center;
		height: 44px;
		padding: 0 4px;
		border-radius: var(--radius-pill);
		border: 2px solid var(--color-base-300);
		background: var(--color-base-100);
		overflow: hidden;
		flex: 0 0 auto;
		min-width: 0;
		transition:
			padding var(--dur-slow) var(--ease-spring),
			background var(--dur-base) var(--ease-out),
			border-color var(--dur-base) var(--ease-out),
			box-shadow var(--dur-base) var(--ease-out),
			transform var(--dur-fast) var(--ease-spring);
	}

	.node:not(:disabled):hover {
		border-color: var(--color-primary);
		transform: translateY(-2px);
	}

	.node:disabled {
		cursor: default;
	}

	.node.done {
		border-color: var(--color-primary);
		background: var(--color-primary-soft);
	}

	/* Only the expanded pill may shrink — its label ellipsises instead of
	   pushing the row wider than the card. */
	.node.active {
		flex: 0 1 auto;
		padding-right: 1rem;
		background: var(--color-primary);
		border-color: var(--color-primary);
		box-shadow: var(--shadow-md);
	}

	/* ---------- badge ---------- */

	.badge {
		position: relative;
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		flex: 0 0 auto;
		font-size: 0.82rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--color-faint);
		transition:
			background var(--dur-base) var(--ease-out),
			color var(--dur-base) var(--ease-out);
	}

	.node.done .badge {
		background: var(--color-primary);
		color: var(--color-primary-content);
	}

	.node.active .badge {
		background: rgba(255, 255, 255, 0.22);
		color: var(--color-primary-content);
	}

	.num {
		animation: pop-in var(--dur-base) var(--ease-spring);
	}

	.tick {
		width: 16px;
		height: 16px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2.4;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-dasharray: 16;
		animation: draw var(--dur-base) var(--ease-out) backwards;
	}

	/* Expanding ring that pulses out of the live step */
	.halo {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.85);
		animation: halo 2.2s var(--ease-out) infinite;
		pointer-events: none;
	}

	/* ---------- label ---------- */

	.label {
		display: grid;
		grid-template-columns: 0fr;
		margin-left: 0;
		transition:
			grid-template-columns var(--dur-slow) var(--ease-spring),
			margin-left var(--dur-slow) var(--ease-spring),
			opacity var(--dur-base) var(--ease-out);
		opacity: 0;
	}

	.label-text {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		color: var(--color-primary-content);
	}

	.node.active .label {
		grid-template-columns: 1fr;
		margin-left: 0.6rem;
		opacity: 1;
	}

	/* Slow light sweep across the live pill */
	.sheen {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 62%;
		background: linear-gradient(
			100deg,
			transparent 0%,
			rgba(255, 255, 255, 0.22) 50%,
			transparent 100%
		);
		animation: sheen 2.8s var(--ease-in-out) infinite;
		pointer-events: none;
	}

	/* ---------- keyframes ---------- */

	@keyframes draw {
		from {
			stroke-dashoffset: 16;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes pop-in {
		from {
			opacity: 0;
			transform: scale(0.6);
		}
	}

	@keyframes halo {
		0% {
			opacity: 0.7;
			transform: scale(1);
		}
		70%,
		100% {
			opacity: 0;
			transform: scale(1.75);
		}
	}

	@keyframes sheen {
		0% {
			left: -50%;
		}
		55%,
		100% {
			left: 120%;
		}
	}

	/* Narrow screens: trim the label so four pills still fit on one row. */
	@container (max-width: 460px) {
		.label-text {
			font-size: 0.76rem;
		}
		.node.active {
			padding-right: 0.7rem;
		}
		.node.active .label {
			margin-left: 0.45rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.halo,
		.sheen {
			animation: none;
			opacity: 0;
		}
	}
</style>

<script lang="ts">
	let { value = $bindable<number | null>(null) }: { value?: number | null } = $props();

	const points = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	function band(n: number) {
		if (n <= 6) return 'detractor';
		if (n <= 8) return 'passive';
		return 'promoter';
	}

	const verdicts: Record<string, string> = {
		detractor: 'Sorry we missed the mark — tell us more below.',
		passive: 'Good, but there is room to grow.',
		promoter: 'Wonderful — thank you!'
	};
</script>

<div class="nps">
	<div
		class="row"
		role="radiogroup"
		tabindex="-1"
		aria-label="How likely are you to recommend this workshop?"
	>
		{#each points as n (n)}
			<button
				type="button"
				role="radio"
				aria-checked={value === n}
				aria-label="{n} out of 10"
				class="dot {band(n)}"
				class:on={value === n}
				style="--i: {n}"
				onclick={() => (value = n)}
			>
				{n}
			</button>
		{/each}
	</div>

	<div class="legend">
		<span>Not likely</span>
		<span>Extremely likely</span>
	</div>

	{#if value !== null}
		<p class="verdict {band(value)}">{verdicts[band(value)]}</p>
	{/if}
</div>

<style>
	.nps {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.row {
		display: grid;
		grid-template-columns: repeat(11, 1fr);
		gap: 5px;
	}

	.dot {
		aspect-ratio: 1;
		min-height: 38px;
		display: grid;
		place-items: center;
		border-radius: var(--radius-field);
		background: var(--color-base-200);
		border: 1px solid var(--color-line);
		font-size: 0.82rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--color-muted);
		transition:
			transform var(--dur-fast) var(--ease-spring),
			background var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}

	.dot:hover {
		transform: translateY(-4px);
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.dot.on {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-primary-content);
		transform: translateY(-6px) scale(1.08);
		box-shadow: var(--shadow-md);
	}

	.dot.on.detractor {
		background: var(--color-danger);
		border-color: var(--color-danger);
	}

	.dot.on.passive {
		background: var(--color-neutral);
		border-color: var(--color-neutral);
	}

	.legend {
		display: flex;
		justify-content: space-between;
		font-size: 0.76rem;
		color: var(--color-faint);
	}

	.verdict {
		font-size: 0.88rem;
		font-weight: 500;
		color: var(--color-primary);
		animation: rise var(--dur-base) var(--ease-out);
	}

	.verdict.detractor {
		color: var(--color-danger);
	}
	.verdict.passive {
		color: var(--color-muted);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}

	@media (max-width: 560px) {
		.row {
			grid-template-columns: repeat(6, 1fr);
		}
		.dot {
			min-height: 44px;
		}
	}
</style>

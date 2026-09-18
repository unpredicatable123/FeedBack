<script lang="ts">
	let {
		value = $bindable(0),
		label,
		hint = ''
	}: { value?: number; label: string; hint?: string } = $props();

	const steps = [1, 2, 3, 4, 5];
	const id = `scale-${Math.random().toString(36).slice(2, 9)}`;

	let hovered = $state(0);
	const shown = $derived(hovered || value);
</script>

<div class="scale">
	<div class="head">
		<div>
			<span class="label" {id}>{label}</span>
			{#if hint}<span class="hint">{hint}</span>{/if}
		</div>
		<span class="value" class:set={value > 0}>{value > 0 ? `${value}/5` : '—'}</span>
	</div>

	<div
		class="track"
		role="radiogroup"
		tabindex="-1"
		aria-labelledby={id}
		onmouseleave={() => (hovered = 0)}
	>
		{#each steps as n (n)}
			<button
				type="button"
				role="radio"
				aria-checked={value === n}
				aria-label="{label}: {n} out of 5"
				class="seg"
				class:on={shown >= n}
				style="--i: {n}"
				onmouseenter={() => (hovered = n)}
				onfocus={() => (hovered = n)}
				onblur={() => (hovered = 0)}
				onclick={() => (value = n)}
			>
				<span class="fill"></span>
			</button>
		{/each}
	</div>
</div>

<style>
	.scale {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	.label {
		display: block;
		font-weight: 600;
		font-size: 0.95rem;
	}

	.hint {
		display: block;
		font-size: 0.82rem;
		color: var(--color-muted);
		margin-top: 0.1rem;
	}

	.value {
		font-variant-numeric: tabular-nums;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-faint);
		transition: color var(--dur-base) var(--ease-out);
	}

	.value.set {
		color: var(--color-primary);
	}

	.track {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 6px;
	}

	.seg {
		position: relative;
		height: 12px;
		padding: 0;
		border-radius: var(--radius-pill);
		background: var(--color-base-300);
		overflow: hidden;
		transition: transform var(--dur-fast) var(--ease-spring);
	}

	.seg:hover {
		transform: scaleY(1.45);
	}

	.fill {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--color-primary), var(--color-primary-deep));
		transform: scaleX(0);
		transform-origin: left;
		transition: transform var(--dur-base) var(--ease-spring);
		transition-delay: calc(var(--i) * 28ms);
	}

	.seg.on .fill {
		transform: scaleX(1);
	}
</style>

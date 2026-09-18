<script lang="ts">
	type Props = {
		options: readonly string[];
		label: string;
		multiple?: boolean;
		selected?: string[];
	};

	let { options, label, multiple = false, selected = $bindable([]) }: Props = $props();

	function toggle(option: string) {
		if (multiple) {
			selected = selected.includes(option)
				? selected.filter((s) => s !== option)
				: [...selected, option];
		} else {
			selected = selected[0] === option ? [] : [option];
		}
	}
</script>

<div class="chips" role={multiple ? 'group' : 'radiogroup'} tabindex="-1" aria-label={label}>
	{#each options as option, i (option)}
		{@const on = selected.includes(option)}
		<button
			type="button"
			role={multiple ? 'checkbox' : 'radio'}
			aria-checked={on}
			class="chip"
			class:on
			style="--i: {i}"
			onclick={() => toggle(option)}
		>
			{#if multiple}
				<svg class="tick" viewBox="0 0 16 16" aria-hidden="true">
					<path d="M3.5 8.5l3 3 6-7" />
				</svg>
			{/if}
			{option}
		</button>
	{/each}
</div>

<style>
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.55rem 1rem;
		border-radius: var(--radius-pill);
		border: 1px solid var(--color-line);
		background: var(--color-base-100);
		font-size: 0.88rem;
		font-weight: 500;
		color: var(--color-base-content);
		transition:
			transform var(--dur-fast) var(--ease-spring),
			background var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out);
		animation: pop var(--dur-base) var(--ease-out) backwards;
		animation-delay: calc(var(--i) * 34ms);
	}

	.chip:hover {
		border-color: var(--color-primary);
		color: var(--color-primary-deep);
		transform: translateY(-2px);
		box-shadow: var(--shadow-sm);
	}

	.chip.on {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-primary-content);
		box-shadow: var(--shadow-md);
	}

	.tick {
		width: 0;
		height: 14px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-dasharray: 16;
		stroke-dashoffset: 16;
		margin-left: -0.15rem;
		transition:
			width var(--dur-fast) var(--ease-out),
			stroke-dashoffset var(--dur-base) var(--ease-out) 60ms;
	}

	.chip.on .tick {
		width: 14px;
		stroke-dashoffset: 0;
	}

	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.96);
		}
	}
</style>

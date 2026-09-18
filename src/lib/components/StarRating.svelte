<script lang="ts">
	import { celebrate } from '$lib/motion';

	let {
		value = $bindable(0),
		label = 'Overall rating'
	}: { value?: number; label?: string } = $props();

	const stars = [1, 2, 3, 4, 5];
	const captions = ['', 'Not for me', 'It was okay', 'Good', 'Really good', 'Outstanding'];

	let hovered = $state(0);
	let pulsed = $state(0);

	const shown = $derived(hovered || value);

	function pick(n: number, event: MouseEvent) {
		value = n;
		pulsed = n;
		setTimeout(() => (pulsed = 0), 480);

		if (n === 5) {
			// Bloom from the star itself rather than the middle of the screen.
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
			celebrate({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, 26);
		}
	}
</script>

<div class="stars-field">
	<span class="sr-only" id="stars-label">{label}</span>
	<div
		class="stars"
		role="radiogroup"
		tabindex="-1"
		aria-labelledby="stars-label"
		onmouseleave={() => (hovered = 0)}
	>
		{#each stars as n (n)}
			<button
				type="button"
				role="radio"
				aria-checked={value === n}
				aria-label="{n} out of 5"
				class="star"
				class:filled={shown >= n}
				class:pulse={pulsed === n}
				onmouseenter={() => (hovered = n)}
				onfocus={() => (hovered = n)}
				onblur={() => (hovered = 0)}
				onclick={(event) => pick(n, event)}
			>
				<span class="ripple"></span>
				<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
					<path
						d="M12 2.6l2.9 5.88 6.49.95-4.7 4.58 1.11 6.46L12 17.42 6.2 20.47l1.11-6.46-4.7-4.58 6.49-.95L12 2.6z"
					/>
				</svg>
			</button>
		{/each}
	</div>

	<p class="caption" class:visible={shown > 0}>
		{captions[shown] || ' '}
	</p>
</div>

<style>
	.stars-field {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.stars {
		display: flex;
		gap: clamp(0.35rem, 2vw, 0.85rem);
	}

	.star {
		position: relative;
		width: clamp(38px, 10vw, 54px);
		height: clamp(38px, 10vw, 54px);
		padding: 4px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		transition: transform var(--dur-fast) var(--ease-spring);
	}

	.star:hover {
		transform: scale(1.14);
	}

	.star:active {
		transform: scale(0.94);
	}

	.star svg {
		position: relative;
		z-index: 1;
	}

	.star path {
		fill: transparent;
		stroke: var(--color-faint);
		stroke-width: 1.4;
		stroke-linejoin: round;
		transition:
			fill var(--dur-base) var(--ease-out),
			stroke var(--dur-base) var(--ease-out);
	}

	.star.filled path {
		fill: var(--color-primary);
		stroke: var(--color-primary);
	}

	.ripple {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: var(--color-primary);
		opacity: 0;
		transform: scale(0.4);
	}

	.star.pulse .ripple {
		animation: ripple 0.52s var(--ease-out);
	}

	@keyframes ripple {
		0% {
			opacity: 0.3;
			transform: scale(0.4);
		}
		100% {
			opacity: 0;
			transform: scale(2.1);
		}
	}

	.caption {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-primary);
		opacity: 0;
		transform: translateY(-4px);
		transition:
			opacity var(--dur-base) var(--ease-out),
			transform var(--dur-base) var(--ease-out);
	}

	.caption.visible {
		opacity: 1;
		transform: none;
	}
</style>

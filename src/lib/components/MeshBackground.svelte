<script lang="ts">
	/** Drifting mesh-gradient field with a grain overlay. Purely decorative. */
</script>

<div class="mesh grain" aria-hidden="true">
	<span class="blob blob-1"></span>
	<span class="blob blob-2"></span>
	<span class="blob blob-3"></span>
	<span class="blob blob-4"></span>
	<div class="rings"></div>
</div>

<style>
	.mesh {
		position: fixed;
		inset: 0;
		z-index: -1;
		overflow: hidden;
		background:
			radial-gradient(120% 90% at 50% -10%, #ffffff 0%, var(--color-base-200) 58%),
			var(--color-base-100);
	}

	.blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(72px);
		opacity: 0.5;
		will-change: transform;
	}

	.blob-1 {
		width: 46vw;
		height: 46vw;
		top: -12vw;
		left: -8vw;
		background: radial-gradient(circle, rgba(90, 138, 69, 0.42), transparent 68%);
		animation: drift-1 26s var(--ease-in-out) infinite;
	}

	.blob-2 {
		width: 38vw;
		height: 38vw;
		top: 8vh;
		right: -10vw;
		background: radial-gradient(circle, rgba(168, 199, 154, 0.5), transparent 68%);
		animation: drift-2 32s var(--ease-in-out) infinite;
	}

	.blob-3 {
		width: 42vw;
		height: 42vw;
		bottom: -16vw;
		left: 18vw;
		background: radial-gradient(circle, rgba(240, 196, 106, 0.26), transparent 68%);
		animation: drift-3 29s var(--ease-in-out) infinite;
	}

	.blob-4 {
		width: 30vw;
		height: 30vw;
		bottom: 6vh;
		right: 12vw;
		background: radial-gradient(circle, rgba(48, 48, 48, 0.12), transparent 68%);
		animation: drift-4 35s var(--ease-in-out) infinite;
	}

	/* Faint concentric guides — echoes the mark's radial geometry */
	.rings {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 140vmax;
		height: 140vmax;
		transform: translate(-50%, -50%);
		opacity: 0.4;
		background-image: repeating-radial-gradient(
			circle at center,
			transparent 0 78px,
			rgba(36, 36, 36, 0.035) 78px 79px
		);
		mask-image: radial-gradient(circle at center, #000 18%, transparent 62%);
		-webkit-mask-image: radial-gradient(circle at center, #000 18%, transparent 62%);
		animation: rings 70s linear infinite;
	}

	@keyframes drift-1 {
		0%,
		100% {
			transform: translate3d(0, 0, 0) scale(1);
		}
		50% {
			transform: translate3d(8vw, 6vh, 0) scale(1.14);
		}
	}

	@keyframes drift-2 {
		0%,
		100% {
			transform: translate3d(0, 0, 0) scale(1.06);
		}
		50% {
			transform: translate3d(-7vw, 9vh, 0) scale(0.92);
		}
	}

	@keyframes drift-3 {
		0%,
		100% {
			transform: translate3d(0, 0, 0) scale(0.95);
		}
		50% {
			transform: translate3d(6vw, -7vh, 0) scale(1.12);
		}
	}

	@keyframes drift-4 {
		0%,
		100% {
			transform: translate3d(0, 0, 0) scale(1);
		}
		50% {
			transform: translate3d(-5vw, -5vh, 0) scale(1.18);
		}
	}

	@keyframes rings {
		to {
			transform: translate(-50%, -50%) rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.blob,
		.rings {
			animation: none;
		}
	}
</style>

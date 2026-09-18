import type { Action } from 'svelte/action';

export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Reveals an element the first time it scrolls into view.
 * Pairs with the `[data-reveal]` rules in app.css.
 */
export const reveal: Action<HTMLElement, { delay?: number } | undefined> = (
	node,
	params
) => {
	node.dataset.reveal = '';
	if (params?.delay) node.style.setProperty('--reveal-delay', `${params.delay}ms`);

	const show = () => (node.dataset.reveal = 'in');

	if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
		show();
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				show();
				observer.unobserve(node);
			}
		},
		{ threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
	);

	observer.observe(node);

	// Safety net: never leave content invisible if the observer never fires
	// (tall elements, printing, headless renderers, odd scroll containers).
	const failsafe = setTimeout(() => {
		show();
		observer.disconnect();
	}, 1800);

	return {
		destroy() {
			clearTimeout(failsafe);
			observer.disconnect();
		}
	};
};

/**
 * Pulls an element gently toward the cursor while it is hovered.
 * `strength` is the fraction of the cursor offset the element travels.
 */
export const magnetic: Action<HTMLElement, { strength?: number } | undefined> = (
	node,
	params
) => {
	const strength = params?.strength ?? 0.28;
	if (prefersReducedMotion()) return;

	let frame = 0;

	function move(event: PointerEvent) {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => {
			const rect = node.getBoundingClientRect();
			const dx = event.clientX - (rect.left + rect.width / 2);
			const dy = event.clientY - (rect.top + rect.height / 2);
			node.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
		});
	}

	function reset() {
		cancelAnimationFrame(frame);
		node.style.transform = '';
	}

	node.addEventListener('pointermove', move);
	node.addEventListener('pointerleave', reset);
	node.addEventListener('pointerdown', reset);

	return {
		destroy() {
			cancelAnimationFrame(frame);
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', reset);
			node.removeEventListener('pointerdown', reset);
		}
	};
};

/** Subtle 3D tilt that follows the pointer across a card. */
export const tilt: Action<HTMLElement, { max?: number } | undefined> = (node, params) => {
	const max = params?.max ?? 6;
	if (prefersReducedMotion()) return;

	let frame = 0;

	function move(event: PointerEvent) {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => {
			const rect = node.getBoundingClientRect();
			const px = (event.clientX - rect.left) / rect.width - 0.5;
			const py = (event.clientY - rect.top) / rect.height - 0.5;
			node.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg)`;
		});
	}

	function reset() {
		cancelAnimationFrame(frame);
		node.style.transform = '';
	}

	node.addEventListener('pointermove', move);
	node.addEventListener('pointerleave', reset);

	return {
		destroy() {
			cancelAnimationFrame(frame);
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', reset);
		}
	};
};

/** Spring-ish slide used between form steps. */
export function slideStep(
	node: Element,
	{ direction = 1, duration = 440 }: { direction?: number; duration?: number } = {}
) {
	if (prefersReducedMotion()) {
		return { duration: 160, css: (t: number) => `opacity: ${t}` };
	}

	return {
		duration,
		easing: (t: number) => 1 - Math.pow(1 - t, 4),
		css: (t: number, u: number) =>
			`opacity: ${t};
			 transform: translate3d(${u * 44 * direction}px, 0, 0) scale(${0.97 + t * 0.03});
			 filter: blur(${u * 5}px);`
	};
}

/* ==========================================================================
   Celebration — a lotus-petal bloom, echoing the SymphoZen mark

   Petals are flung out of the origin on an ease-out arc, then buoyancy takes
   over and they drift upward, swaying and flipping in 3D as they fade. Three
   staggered ripple rings expand underneath. Self-cleaning canvas.
   ========================================================================== */

const PETAL_COLORS = [
	'#5a8a45',
	'#476e36',
	'#7fae63',
	'#a8c79a',
	'#cde0c2',
	'#f0c46a'
];

type Petal = {
	angle: number;
	dist: number;
	speed: number;
	rise: number;
	sway: number;
	swaySpeed: number;
	size: number;
	rot: number;
	vr: number;
	flip: number;
	flipSpeed: number;
	color: string;
	delay: number;
};

type Ring = { delay: number; hue: string };

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function drawPetal(ctx: CanvasRenderingContext2D, size: number) {
	const w = size * 0.62;
	const h = size;
	ctx.beginPath();
	ctx.moveTo(0, -h / 2);
	ctx.bezierCurveTo(w, -h * 0.18, w, h * 0.22, 0, h / 2);
	ctx.bezierCurveTo(-w, h * 0.22, -w, -h * 0.18, 0, -h / 2);
	ctx.closePath();
	ctx.fill();
}

export function celebrate(origin?: { x: number; y: number }, count = 46) {
	if (typeof document === 'undefined' || prefersReducedMotion()) return;

	const canvas = document.createElement('canvas');
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	canvas.style.cssText =
		'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
	canvas.width = vw * dpr;
	canvas.height = vh * dpr;
	document.body.appendChild(canvas);

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		canvas.remove();
		return;
	}
	ctx.scale(dpr, dpr);

	const ox = origin?.x ?? vw / 2;
	const oy = origin?.y ?? vh / 2.8;

	const petals: Petal[] = Array.from({ length: count }, (_, i) => {
		// Bias emission sideways and slightly upward so the bloom opens outward
		// rather than firing straight up like a party popper.
		const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
		return {
			angle,
			dist: 0,
			speed: 130 + Math.random() * 190,
			rise: 26 + Math.random() * 44,
			sway: Math.random() * Math.PI * 2,
			swaySpeed: 0.9 + Math.random() * 1.1,
			size: 13 + Math.random() * 13,
			rot: Math.random() * Math.PI * 2,
			vr: (Math.random() - 0.5) * 1.6,
			flip: Math.random() * Math.PI * 2,
			flipSpeed: 1.4 + Math.random() * 2.2,
			color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
			delay: Math.random() * 0.14
		};
	});

	const rings: Ring[] = [
		{ delay: 0, hue: 'rgba(90, 138, 69, 0.5)' },
		{ delay: 0.1, hue: 'rgba(127, 174, 99, 0.36)' },
		{ delay: 0.22, hue: 'rgba(240, 196, 106, 0.3)' }
	];

	const start = performance.now();
	const lifetime = 3200;
	let raf = 0;

	function frame(now: number) {
		const elapsed = now - start;
		if (elapsed > lifetime) {
			canvas.remove();
			return;
		}

		const t = elapsed / lifetime; // 0 → 1 over the whole animation
		const seconds = elapsed / 1000;
		ctx!.clearRect(0, 0, vw, vh);

		// --- ripple rings -------------------------------------------------
		for (const ring of rings) {
			const rt = (t - ring.delay) / 0.42;
			if (rt <= 0 || rt >= 1) continue;
			const radius = easeOutCubic(rt) * 210;
			ctx!.save();
			ctx!.globalAlpha = (1 - rt) * 0.9;
			ctx!.strokeStyle = ring.hue;
			ctx!.lineWidth = 2 - rt * 1.4;
			ctx!.beginPath();
			ctx!.arc(ox, oy, radius, 0, Math.PI * 2);
			ctx!.stroke();
			ctx!.restore();
		}

		// --- petals ---------------------------------------------------------
		for (const p of petals) {
			const pt = (t - p.delay) / (1 - p.delay);
			if (pt <= 0) continue;

			// Outward burst decays; buoyancy lifts the petal for the rest of its life.
			const out = easeOutCubic(Math.min(pt / 0.34, 1)) * p.speed;
			const lift = pt > 0.34 ? Math.pow((pt - 0.34) / 0.66, 1.4) * p.rise * 4.2 : 0;
			const swayX = Math.sin(p.sway + seconds * p.swaySpeed) * 16 * pt;

			const x = ox + Math.cos(p.angle) * out + swayX;
			const y = oy + Math.sin(p.angle) * out * 0.78 - lift;

			// Fade in fast, hold, then fade out over the last 45%
			const alpha = pt < 0.08 ? pt / 0.08 : pt > 0.55 ? 1 - (pt - 0.55) / 0.45 : 1;
			if (alpha <= 0) continue;

			const flip = Math.cos(p.flip + seconds * p.flipSpeed);

			ctx!.save();
			ctx!.translate(x, y);
			ctx!.rotate(p.rot + seconds * p.vr);
			// Horizontal squash simulates the petal turning through 3D space.
			ctx!.scale(Math.max(Math.abs(flip), 0.18), 1);
			ctx!.globalAlpha = alpha;
			ctx!.fillStyle = p.color;
			drawPetal(ctx!, p.size);
			ctx!.restore();
		}

		raf = requestAnimationFrame(frame);
	}

	raf = requestAnimationFrame(frame);

	// Stop cleanly if the page goes away mid-animation.
	window.addEventListener(
		'pagehide',
		() => {
			cancelAnimationFrame(raf);
			canvas.remove();
		},
		{ once: true }
	);
}

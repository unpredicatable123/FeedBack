<script lang="ts">
	import StarRating from '$lib/components/StarRating.svelte';
	import ScaleRating from '$lib/components/ScaleRating.svelte';
	import NpsScale from '$lib/components/NpsScale.svelte';
	import ChipGroup from '$lib/components/ChipGroup.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import ProgressRail from '$lib/components/ProgressRail.svelte';
	import SuccessScreen from '$lib/components/SuccessScreen.svelte';

	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	import { magnetic, reveal, slideStep, celebrate, prefersReducedMotion } from '$lib/motion';
	import {
		WORKSHOP,
		ROLES,
		NEXT_TOPICS,
		RATING_FIELDS,
		emptyFeedback,
		submitFeedback,
		isFirebaseConfigured,
		type Feedback
	} from '$lib/feedback';

	const STEPS = ['About you', 'Your ratings', 'Recommend', 'In your words'] as const;

	let data = $state<Feedback>(emptyFeedback());
	let roleChoice = $state<string[]>([]);
	let roleOther = $state('');
	const isOtherRole = $derived(roleChoice[0] === 'Other');

	let step = $state(0);
	let furthest = $state(0);
	let direction = $state(1);
	let errors = $state<Record<string, string>>({});

	let status = $state<'idle' | 'sending' | 'done' | 'error'>('idle');
	let submitError = $state('');
	let submittedName = $state('');

	// The form stays closed until the hero CTA is pressed, so the landing view
	// resolves cleanly instead of trailing a half-visible card off the fold.
	let formOpen = $state(false);
	let formSection = $state<HTMLElement | undefined>();

	function openForm() {
		if (formOpen) {
			scrollToForm();
			return;
		}
		formOpen = true;
		// The scroll happens on `onintroend` — scrolling while the card is still
		// expanding would clamp against a page that has not grown yet.
	}

	function scrollToForm() {
		formSection?.scrollIntoView({
			behavior: prefersReducedMotion() ? 'auto' : 'smooth',
			block: 'start'
		});
	}

	// Keep the chip group (array-based) in sync with the single `role` field.
	// "Other" is stored with its prefix so custom roles still group together.
	$effect(() => {
		data.role = isOtherRole ? `Other: ${roleOther.trim()}` : (roleChoice[0] ?? '');
	});

	const headline = 'How was Claude Code in Action?'.split(' ');

	const avgDetail = $derived.by(() => {
		const values = Object.values(data.ratings).filter((v) => v > 0);
		if (!values.length) return 0;
		return values.reduce((a, b) => a + b, 0) / values.length;
	});

	function validate(index: number): boolean {
		const next: Record<string, string> = {};

		if (index === 0) {
			if (!data.name.trim()) next.name = 'Please tell us who you are.';

			if (!data.email.trim()) {
				next.email = 'Please add your email address.';
			} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())) {
				next.email = 'That email address does not look right.';
			}

			if (isOtherRole && !roleOther.trim()) next.roleOther = 'Please tell us your role.';
		}

		if (index === 1 && data.overall === 0) {
			next.overall = 'Pick an overall rating to continue.';
		}

		if (index === 2 && data.nps === null) {
			next.nps = 'Choose a score from 0 to 10.';
		}

		errors = next;
		return Object.keys(next).length === 0;
	}

	function go(target: number) {
		if (target > step && !validate(step)) return;
		direction = target > step ? 1 : -1;
		step = target;
		furthest = Math.max(furthest, step);
		errors = {};
	}

	function next() {
		if (step < STEPS.length - 1) go(step + 1);
	}

	function back() {
		if (step > 0) go(step - 1);
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (status === 'sending') return;
		if (!validate(step)) return;

		status = 'sending';
		submitError = '';

		try {
			await submitFeedback(data);
			submittedName = data.name;
			status = 'done';
			// Jump instantly: the whole view is being replaced, and a smooth scroll
			// would leave SuccessScreen measuring a stale position for its bloom.
			window.scrollTo({ top: 0, behavior: 'auto' });
		} catch (error) {
			console.error('[feedback] submit failed', error);
			submitError =
				error instanceof Error
					? error.message
					: 'Something went wrong. Please try again in a moment.';
			status = 'error';
		}
	}

	function reset() {
		data = emptyFeedback();
		roleChoice = [];
		roleOther = '';
		step = 0;
		furthest = 0;
		errors = {};
		status = 'idle';
		submittedName = '';
		formOpen = true;
	}
</script>

<svelte:head>
	<title>Feedback — {WORKSHOP.title} | {WORKSHOP.host}</title>
</svelte:head>

{#if status === 'done'}
	<SuccessScreen name={submittedName} onReset={reset} />
{:else}
	<section class="hero">
		<p class="eyebrow" use:reveal>{WORKSHOP.host} · Workshop</p>

		<h1>
			{#each headline as word, i (i)}
				<span class="word" style="--d: {i * 70}ms">{word}</span>{' '}
			{/each}
		</h1>

		<p class="lede" use:reveal={{ delay: 320 }}>
			Four short steps, about two minutes. Your answers go straight to the people who
			ran the session — every one of them is read.
		</p>

		<div class="cta-wrap" use:reveal={{ delay: 420 }}>
			<button
				type="button"
				class="cta"
				onclick={openForm}
				use:magnetic={{ strength: 0.24 }}
				aria-expanded={formOpen}
				aria-controls="feedback-form"
			>
				<span>{formOpen ? 'Back to the form' : 'Give feedback'}</span>
				<svg viewBox="0 0 16 16" aria-hidden="true">
					<path d="M8 3v10M4 9l4 4 4-4" />
				</svg>
			</button>
		</div>

		<div class="meta-row" use:reveal={{ delay: 520 }}>
			<span class="pill"><i class="dot"></i> Open for responses</span>
			<span class="pill">~2 min</span>
			<span class="pill">Stored securely</span>
		</div>
	</section>

	{#if formOpen}
		<div
			class="form-section"
			bind:this={formSection}
			transition:slide={{ duration: prefersReducedMotion() ? 0 : 520, easing: cubicOut }}
			onintroend={scrollToForm}
		>
			<form id="feedback-form" class="card" onsubmit={handleSubmit} novalidate>
		<ProgressRail steps={STEPS} current={step} {furthest} onJump={go} />

		<div class="stage">
			{#key step}
				<div
					class="step"
					in:slideStep={{ direction }}
					out:slideStep={{ direction: -direction }}
				>
					{#if step === 0}
						<header class="step-head">
							<h2>First, a little about you</h2>
							<p>
								Your name and email let us follow up on what you tell us. Your role is
								optional — it just helps us read the results in context.
							</p>
						</header>

						<div class="grid-2">
							<TextField
								bind:value={data.name}
								label="Your name"
								placeholder="Ada Lovelace"
								autocomplete="name"
								maxlength={120}
								error={errors.name}
							/>
							<TextField
								bind:value={data.email}
								label="Email"
								placeholder="ada@company.com"
								type="email"
								autocomplete="email"
								maxlength={200}
								error={errors.email}
							/>
						</div>

						<div class="block">
							<span class="block-label">What best describes your role?</span>
							<ChipGroup options={ROLES} label="Your role" bind:selected={roleChoice} />

							{#if isOtherRole}
								<div
									class="other-role"
									transition:slide={{ duration: prefersReducedMotion() ? 0 : 320, easing: cubicOut }}
									onintroend={(e) => e.currentTarget.querySelector('input')?.focus()}
								>
									<TextField
										bind:value={roleOther}
										label="Your role"
										placeholder="e.g. Data Scientist"
											maxlength={50}
										error={errors.roleOther}
									/>
								</div>
							{/if}
						</div>
					{:else if step === 1}
						<header class="step-head">
							<h2>How did we do?</h2>
							<p>Start with the overall feel, then rate the parts that made it up.</p>
						</header>

						<div class="overall">
							<StarRating bind:value={data.overall} label="Overall rating" />
							{#if errors.overall}
								<p class="field-error">{errors.overall}</p>
							{/if}
						</div>

						<div class="scales">
							{#each RATING_FIELDS as field (field.key)}
								<ScaleRating
									bind:value={data.ratings[field.key]}
									label={field.label}
									hint={field.hint}
								/>
							{/each}
						</div>

						{#if avgDetail > 0}
							<p class="running-avg">
								Detail average <strong>{avgDetail.toFixed(1)}</strong> / 5
							</p>
						{/if}
					{:else if step === 2}
						<header class="step-head">
							<h2>Would you recommend it?</h2>
							<p>
								How likely are you to recommend <strong>{WORKSHOP.title}</strong> to a
								colleague?
							</p>
						</header>

						<NpsScale bind:value={data.nps} />
						{#if errors.nps}
							<p class="field-error">{errors.nps}</p>
						{/if}
					{:else}
						<header class="step-head">
							<h2>Tell us more</h2>
							<p>This is the part we quote back to the team. Say as much or as little as you like.</p>
						</header>

						<TextField
							bind:value={data.bestPart}
							label="What was the best part?"
							placeholder="The live hooks demo finally made it click…"
							multiline
							rows={3}
						/>

						<TextField
							bind:value={data.improve}
							label="What changes would you expect in the upcomming sessions?"
							placeholder="More time on…"
							multiline
							rows={3}
						/>

						<div class="block">
							<span class="block-label">What should we cover next time?</span>
							<ChipGroup
								options={NEXT_TOPICS}
								label="Topics for the next workshop"
								multiple
								bind:selected={data.nextTopics}
							/>
						</div>

						<TextField
							bind:value={data.comments}
							label="Anything else? (optional)"
							placeholder="Open floor — thoughts, thanks, gripes."
							multiline
							rows={3}
						/>
					{/if}
				</div>
			{/key}
		</div>

		{#if submitError}
			<p class="submit-error" role="alert">{submitError}</p>
		{/if}

		<footer class="controls">
			<button type="button" class="btn ghost" onclick={back} disabled={step === 0}>
				<svg class="flip" viewBox="0 0 16 16" aria-hidden="true"
					><path d="M3 8h10M9 4l4 4-4 4" /></svg
				>
				Back
			</button>

			<span class="counter">{step + 1} / {STEPS.length}</span>

			{#if step < STEPS.length - 1}
				<button
					type="button"
					class="btn primary"
					onclick={next}
					use:magnetic={{ strength: 0.2 }}
				>
					Continue
					<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
				</button>
			{:else}
				<button
					type="submit"
					class="btn primary"
					disabled={status === 'sending'}
					use:magnetic={{ strength: 0.2 }}
				>
					{#if status === 'sending'}
						<span class="spinner" aria-hidden="true"></span>
						Sending…
					{:else}
						Send feedback
						<svg viewBox="0 0 16 16" aria-hidden="true"
							><path d="M3 8h10M9 4l4 4-4 4" /></svg
						>
					{/if}
				</button>
			{/if}
			</footer>
			</form>

			{#if !isFirebaseConfigured}
				<p class="dev-note">
					<strong>Dev note:</strong> Firebase is not configured yet — responses are being kept
					in <code>localStorage</code>. Copy <code>.env.example</code> to <code>.env</code>,
					add your project keys and restart the dev server.
				</p>
			{/if}
		</div>
	{/if}
{/if}

<style>
	/* ---------- Hero ---------- */

	/* `flex: 1 0 auto` fills the fold when the form is closed, then falls back
	   to content height once the form pushes the page taller. */
	.hero {
		flex: 1 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: clamp(1.5rem, 5vw, 3rem) 0;
		max-width: 760px;
		width: 100%;
		margin: 0 auto;
	}

	h1 {
		font-size: clamp(2.3rem, 7vw, 4.2rem);
		margin: 0.85rem 0 1.1rem;
	}

	.word {
		display: inline-block;
		animation: word-in 0.8s var(--ease-out) backwards;
		animation-delay: var(--d);
	}

	/* Emphasise the workshop name: "Claude Code in Action?" */
	.word:nth-child(n + 3) {
		color: var(--color-primary);
		font-style: italic;
	}

	@keyframes word-in {
		from {
			opacity: 0;
			transform: translateY(24px) rotate(2deg);
			filter: blur(6px);
		}
	}

	.lede {
		color: var(--color-muted);
		font-size: clamp(1rem, 2.2vw, 1.1rem);
		max-width: 52ch;
		margin: 0 auto;
	}

	.cta-wrap {
		margin-top: 2.25rem;
	}

	.cta {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		padding: 1rem 2.15rem;
		border-radius: var(--radius-pill);
		background: var(--color-primary);
		color: var(--color-primary-content);
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		box-shadow: var(--shadow-md);
		transition:
			background var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-base) var(--ease-out);
	}

	/* Soft pulsing halo — draws the eye without moving the button itself,
	   so it stays friendly with the magnetic pointer transform. */
	.cta::before {
		content: '';
		position: absolute;
		inset: -4px;
		border-radius: inherit;
		border: 1px solid var(--color-primary);
		opacity: 0;
		animation: halo 3s var(--ease-out) infinite;
		pointer-events: none;
	}

	.cta:hover {
		background: var(--color-primary-deep);
		box-shadow: var(--shadow-lg);
	}

	.cta svg {
		width: 17px;
		height: 17px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		animation: nudge 2.4s var(--ease-in-out) infinite;
	}

	.cta:hover svg {
		animation: none;
		transform: translateY(3px);
		transition: transform var(--dur-fast) var(--ease-out);
	}

	@keyframes halo {
		0% {
			opacity: 0.55;
			transform: scale(1);
		}
		70%,
		100% {
			opacity: 0;
			transform: scale(1.12);
		}
	}

	@keyframes nudge {
		0%,
		70%,
		100% {
			transform: translateY(0);
		}
		80% {
			transform: translateY(3px);
		}
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
		margin-top: 2rem;
	}

	.form-section {
		padding-bottom: 3rem;
		scroll-margin-top: 1.5rem;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.35rem 0.85rem;
		border-radius: var(--radius-pill);
		border: 1px solid var(--color-line);
		background: rgba(255, 255, 255, 0.65);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--color-muted);
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--color-primary);
		box-shadow: 0 0 0 0 rgba(90, 138, 69, 0.55);
		animation: ping 2.2s var(--ease-out) infinite;
	}

	@keyframes ping {
		70%,
		100% {
			box-shadow: 0 0 0 7px rgba(90, 138, 69, 0);
		}
	}

	/* ---------- Card ---------- */

	.card {
		background: rgba(255, 255, 255, 0.78);
		backdrop-filter: blur(20px) saturate(1.3);
		-webkit-backdrop-filter: blur(20px) saturate(1.3);
		border: 1px solid rgba(255, 255, 255, 0.9);
		border-radius: var(--radius-box);
		box-shadow: var(--shadow-lg);
		padding: clamp(1.5rem, 4vw, 2.75rem);
		display: flex;
		flex-direction: column;
		gap: clamp(1.75rem, 4vw, 2.5rem);
	}

	.stage {
		display: grid;
	}

	.step {
		grid-area: 1 / 1;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.step-head h2 {
		font-size: clamp(1.4rem, 3.4vw, 1.9rem);
		margin-bottom: 0.4rem;
	}

	.step-head p {
		color: var(--color-muted);
		font-size: 0.95rem;
		max-width: 56ch;
	}

	.step-head strong {
		color: var(--color-base-content);
		font-weight: 600;
	}

	.grid-2 {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}

	.block {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.block-label {
		font-size: 0.9rem;
		font-weight: 600;
	}

	/* Padding, not margin, so `slide` animates the gap along with the field */
	.other-role {
		max-width: 360px;
		padding-top: 0.3rem;
	}

	.overall {
		padding: clamp(1.25rem, 3vw, 2rem);
		border-radius: var(--radius-box);
		background: linear-gradient(160deg, var(--color-primary-soft), rgba(247, 248, 245, 0.4));
		border: 1px solid var(--color-line);
	}

	/* Deliberate 2×2 block rather than an auto-fit 3+1 orphan */
	.scales {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem 2.5rem;
	}

	@media (min-width: 640px) {
		.scales {
			grid-template-columns: 1fr 1fr;
		}
	}

	.running-avg {
		font-size: 0.85rem;
		color: var(--color-muted);
		text-align: right;
	}

	.running-avg strong {
		color: var(--color-primary);
		font-size: 1rem;
	}

	.field-error,
	.submit-error {
		color: var(--color-danger);
		font-size: 0.85rem;
		font-weight: 500;
		margin-top: 0.75rem;
		text-align: center;
		animation: shake 0.42s var(--ease-out);
	}

	.submit-error {
		padding: 0.75rem 1rem;
		border-radius: var(--radius-field);
		background: rgba(180, 71, 47, 0.08);
		border: 1px solid rgba(180, 71, 47, 0.25);
		margin-top: 0;
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-5px);
		}
		75% {
			transform: translateX(5px);
		}
	}

	/* ---------- Controls ---------- */

	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-line);
	}

	.counter {
		font-size: 0.8rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--color-faint);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.4rem;
		border-radius: var(--radius-pill);
		font-size: 0.92rem;
		font-weight: 600;
		transition:
			transform var(--dur-fast) var(--ease-out),
			background var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out),
			opacity var(--dur-fast) var(--ease-out);
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

	.btn:hover svg:not(.flip) {
		transform: translateX(3px);
	}

	.btn:hover svg.flip {
		transform: translateX(-3px);
	}

	.flip {
		transform: scaleX(-1);
	}

	.btn:hover .flip {
		transform: scaleX(-1) translateX(3px);
	}

	.primary {
		background: var(--color-primary);
		color: var(--color-primary-content);
		box-shadow: var(--shadow-md);
	}

	.primary:hover:not(:disabled) {
		background: var(--color-primary-deep);
		box-shadow: var(--shadow-lg);
	}

	.ghost {
		color: var(--color-muted);
		border: 1px solid var(--color-line);
	}

	.ghost:hover:not(:disabled) {
		color: var(--color-base-content);
		border-color: var(--color-base-content);
	}

	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.spinner {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.35);
		border-top-color: #fff;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ---------- Dev note ---------- */

	.dev-note {
		margin-top: 1.5rem;
		padding: 0.9rem 1.1rem;
		border-radius: var(--radius-field);
		border: 1px dashed var(--color-base-300);
		background: rgba(255, 255, 255, 0.55);
		font-size: 0.82rem;
		color: var(--color-muted);
		text-align: center;
	}

	.dev-note code {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.9em;
		background: var(--color-base-200);
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
	}

	@media (max-width: 520px) {
		.controls {
			flex-wrap: wrap;
		}
		.counter {
			order: 3;
			width: 100%;
			text-align: center;
		}
	}
</style>

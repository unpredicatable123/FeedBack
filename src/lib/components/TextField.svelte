<script lang="ts">
	type Props = {
		value?: string;
		label: string;
		placeholder?: string;
		type?: 'text' | 'email';
		multiline?: boolean;
		rows?: number;
		maxlength?: number;
		error?: string;
		autocomplete?: HTMLInputElement['autocomplete'];
	};

	let {
		value = $bindable(''),
		label,
		placeholder = '',
		type = 'text',
		multiline = false,
		rows = 4,
		maxlength = 2000,
		error = '',
		autocomplete
	}: Props = $props();

	const id = `field-${Math.random().toString(36).slice(2, 9)}`;
	let focused = $state(false);

	const remaining = $derived(maxlength - value.length);
	const showCount = $derived(multiline && focused && remaining < 400);
</script>

<div class="field" class:focused class:invalid={!!error} class:filled={value.length > 0}>
	<label for={id}>{label}</label>

	<div class="shell">
		{#if multiline}
			<textarea
				{id}
				{rows}
				{placeholder}
				{maxlength}
				bind:value
				onfocus={() => (focused = true)}
				onblur={() => (focused = false)}
				aria-invalid={!!error}
			></textarea>
		{:else}
			<input
				{id}
				{type}
				{placeholder}
				{maxlength}
				{autocomplete}
				bind:value
				onfocus={() => (focused = true)}
				onblur={() => (focused = false)}
				aria-invalid={!!error}
			/>
		{/if}
		<span class="underglow"></span>
	</div>

	<div class="meta">
		{#if error}
			<span class="error">{error}</span>
		{:else if showCount}
			<span class="count">{remaining} characters left</span>
		{/if}
	</div>
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	label {
		font-size: 0.9rem;
		font-weight: 600;
		transition: color var(--dur-fast) var(--ease-out);
	}

	.field.focused label {
		color: var(--color-primary);
	}

	.field.invalid label {
		color: var(--color-danger);
	}

	.shell {
		position: relative;
	}

	input,
	textarea {
		width: 100%;
		padding: 0.8rem 0.95rem;
		border-radius: var(--radius-field);
		border: 1px solid var(--color-line);
		background: var(--color-base-100);
		font-size: 0.95rem;
		line-height: 1.55;
		resize: vertical;
		transition:
			border-color var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out),
			background var(--dur-fast) var(--ease-out);
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--color-faint);
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: var(--shadow-focus);
	}

	.field.invalid input,
	.field.invalid textarea {
		border-color: var(--color-danger);
	}

	/* Animated underline that sweeps out from the centre on focus */
	.underglow {
		position: absolute;
		left: 12%;
		right: 12%;
		bottom: -1px;
		height: 2px;
		border-radius: 2px;
		background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
		transform: scaleX(0);
		transition: transform var(--dur-base) var(--ease-out);
		pointer-events: none;
	}

	.field.focused .underglow {
		transform: scaleX(1);
	}

	.meta {
		min-height: 1rem;
		font-size: 0.78rem;
	}

	.error {
		color: var(--color-danger);
		font-weight: 500;
	}

	.count {
		color: var(--color-faint);
	}
</style>

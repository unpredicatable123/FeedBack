import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebase';

export const WORKSHOP = {
	slug: 'claude-code-in-action',
	title: 'Claude Code in Action',
	host: 'SymphoZen Labs'
} as const;

export const COLLECTION = 'feedback';

export type Feedback = {
	name: string;
	email: string;
	role: string;
	overall: number;
	ratings: {
		content: number;
		pacing: number;
		labs: number;
		instructor: number;
	};
	nps: number | null;
	bestPart: string;
	improve: string;
	nextTopics: string[];
	comments: string;
};

export const ROLES = [
	'Engineer',
	'Tech Lead',
	'Product / PM',
	'Designer',
	'Founder',
	'Student',
	'Other'
];

export const NEXT_TOPICS = [
	'MCP servers',
	'Hooks & automation',
	'Subagents',
	'Custom skills',
	'CI/CD integration',
	'Agent SDK',
	'Prompt engineering',
	'Codebase onboarding'
];

export const RATING_FIELDS = [
	{ key: 'content', label: 'Content depth', hint: 'Was the material substantial enough?' },
	{ key: 'pacing', label: 'Pacing', hint: 'Did the session move at the right speed?' },
	{ key: 'labs', label: 'Hands-on labs', hint: 'How useful were the live exercises?' },
	{ key: 'instructor', label: 'Instructor', hint: 'Clarity, energy and answers to questions.' }
] as const;

export function emptyFeedback(): Feedback {
	return {
		name: '',
		email: '',
		role: '',
		overall: 0,
		ratings: { content: 0, pacing: 0, labs: 0, instructor: 0 },
		nps: null,
		bestPart: '',
		improve: '',
		nextTopics: [],
		comments: ''
	};
}

/** Trim strings and strip anything the form shouldn't be sending. */
function sanitize(input: Feedback) {
	return {
		name: input.name.trim().slice(0, 120),
		email: input.email.trim().toLowerCase().slice(0, 200),
		role: input.role,
		overall: input.overall,
		ratings: { ...input.ratings },
		nps: input.nps,
		bestPart: input.bestPart.trim().slice(0, 2000),
		improve: input.improve.trim().slice(0, 2000),
		nextTopics: input.nextTopics.slice(0, NEXT_TOPICS.length),
		comments: input.comments.trim().slice(0, 2000)
	};
}

export type SubmitResult = { ok: true; id: string; stored: 'firestore' | 'local' };

/**
 * Writes one response to Firestore. When `.env` has not been filled in yet the
 * response is kept in localStorage instead, so the form is still demoable.
 */
export async function submitFeedback(input: Feedback): Promise<SubmitResult> {
	const payload = {
		...sanitize(input),
		workshop: WORKSHOP.slug,
		workshopTitle: WORKSHOP.title,
		userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
		submittedAt: new Date().toISOString()
	};

	const db = getDb();

	if (!db) {
		const id = `local-${Date.now()}`;
		try {
			const key = 'symphozen:feedback:pending';
			const existing = JSON.parse(localStorage.getItem(key) ?? '[]');
			existing.push({ id, ...payload });
			localStorage.setItem(key, JSON.stringify(existing));
		} catch {
			// Private mode or blocked storage — the response is simply not persisted.
		}
		console.warn(
			'[feedback] Firebase is not configured. Copy .env.example to .env and add your project keys.'
		);
		return { ok: true, id, stored: 'local' };
	}

	const ref = await addDoc(collection(db, COLLECTION), {
		...payload,
		createdAt: serverTimestamp()
	});

	return { ok: true, id: ref.id, stored: 'firestore' };
}

export { isFirebaseConfigured };

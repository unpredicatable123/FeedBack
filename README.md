# Claude Code in Action — Workshop Feedback

A feedback site for the **Claude Code in Action** workshop by
[SymphoZen Labs](https://www.symphozen.com). Built with SvelteKit (Svelte 5
runes) and Firebase Firestore, styled with the SymphoZen brand system.

## Quick start

```bash
npm install
cp .env.example .env     # then paste your Firebase keys in
npm run dev
```

The app runs **without** Firebase configured — responses fall back to
`localStorage` and a dev note appears under the form, so you can work on the UI
before the backend exists.

## Firebase setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Build → Firestore Database → Create database** (production mode).
3. **Project settings → General → Your apps → Web app** → copy the config
   values into `.env`:

   | `.env` key | Config field |
   | --- | --- |
   | `VITE_FIREBASE_API_KEY` | `apiKey` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `VITE_FIREBASE_PROJECT_ID` | `projectId` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
   | `VITE_FIREBASE_APP_ID` | `appId` |

4. Deploy the security rules:

   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use --add            # pick your project
   firebase deploy --only firestore:rules,firestore:indexes
   ```

5. Restart `npm run dev`.

These keys are **not secrets** — every Firebase web app ships them in its
bundle. Access is controlled by `firestore.rules`, not by hiding the key.

### Security model

`firestore.rules` makes the `feedback` collection **write-only from the
browser**: anyone can create a response, nobody can read, edit or delete one
from the client. Responses are validated server-side (field allow-list, value
ranges, string lengths) and `createdAt` is pinned to the server clock so entries
cannot be backdated.

Read the results in the Firebase console, or server-side with the Admin SDK,
which bypasses rules.

## Deploying

The site is fully prerendered, so it drops onto Firebase Hosting as static files:

```bash
npm run build
firebase deploy --only hosting
```

`firebase.json` already points hosting at `build/`.

## Data shape

One document per response in the `feedback` collection:

```jsonc
{
  "name": "Ada Lovelace",
  "email": "ada@company.com",
  "role": "Engineer",
  "overall": 5,                       // 1–5 stars
  "ratings": {
    "content": 5, "pacing": 4,
    "labs": 5, "instructor": 5        // each 0–5, 0 = skipped
  },
  "nps": 9,                           // 0–10
  "bestPart": "…",
  "improve": "…",
  "nextTopics": ["MCP servers", "Hooks & automation"],
  "comments": "…",
  "workshop": "claude-code-in-action",
  "workshopTitle": "Claude Code in Action",
  "userAgent": "…",
  "submittedAt": "2026-09-18T10:12:00.000Z",  // client clock
  "createdAt": "<server timestamp>"           // authoritative
}
```

## Project layout

```
src/
  app.css                    Brand tokens (colors, type, motion, elevation)
  app.html                   Google Fonts + meta
  lib/
    firebase.ts              SDK init, guarded by config presence
    feedback.ts              Schema, question content, submit + sanitise
    motion.ts                reveal / magnetic / tilt actions, petal bloom, step transition
    components/
      MeshBackground.svelte  Drifting gradient field + grain
      ProgressRail.svelte    Four-step progress indicator
      StarRating.svelte      Overall 1–5 stars, ripple + petal bloom at 5
      ScaleRating.svelte     Segmented 1–5 bar
      NpsScale.svelte        0–10 recommend scale
      ChipGroup.svelte       Single- or multi-select chips
      TextField.svelte       Input / textarea with focus underglow
      SuccessScreen.svelte   Post-submit state
  routes/
    +layout.svelte           Header, footer, background
    +layout.ts               prerender = true
    +page.svelte             The four-step survey
```

Editing the questions, roles or topic chips is all done in
[`src/lib/feedback.ts`](src/lib/feedback.ts).

## Brand

Pulled from symphozen.com's live theme:

| Token | Value |
| --- | --- |
| Display font | Playfair Display 500/600 |
| Body font | Inter 400–700 |
| Primary | `#5a8a45` |
| Base 100 / 200 / 300 | `#ffffff` / `#f7f8f5` / `#e5e7e2` |
| Base content | `#242424` |
| Neutral | `#303030` |
| Radius box / field | `1.1rem` / `0.55rem` |

## Accessibility

Every control is a real button with an ARIA role and label, the flow is fully
keyboard-navigable, and all motion — drifting gradients, step transitions,
magnetic buttons, petal bloom — is disabled under `prefers-reduced-motion`.

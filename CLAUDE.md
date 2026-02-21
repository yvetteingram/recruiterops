# CLAUDE.md — RecruiterOps

This file provides guidance for AI assistants working in this codebase. It covers project structure, development workflows, conventions, and key architectural decisions.

---

## Project Overview

**RecruiterOps** is an AI-powered operations agent for independent recruiters and boutique staffing agencies. It automates high-friction recruiting tasks: stalled candidate detection, interview scheduling, outreach drafting, and daily pipeline briefings. The goal is to accelerate placement velocity.

The app is a **React SPA** connected to **Supabase** (auth + PostgreSQL) and **Google Gemini** (AI features). Payment/subscription management is handled via **Gumroad** webhooks processed by a **Netlify Function**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.7, Vite 6 |
| Styling | Tailwind CSS (CDN), Font Awesome (CDN) |
| Charts | Recharts 2 |
| Database & Auth | Supabase (PostgreSQL + Supabase Auth) |
| AI | Google Gemini API (`@google/genai`) |
| Serverless | Netlify Functions |
| Payments | Gumroad (webhook-based) |

---

## Directory Structure

```
recruiterops/
├── components/               # React UI components (one file per view)
│   ├── AuthView.tsx          # Sign up / login
│   ├── Dashboard.tsx         # KPIs, daily AI briefing, stalled candidates
│   ├── JobsView.tsx          # Job order CRUD
│   ├── CandidatesView.tsx    # Candidate pipeline (largest component)
│   ├── SettingsView.tsx      # Profile, subscription, webhooks
│   ├── LandingView.tsx       # Public marketing page
│   ├── Sidebar.tsx           # Navigation + logout + connection status
│   ├── HowItWorksModal.tsx   # (stub — not yet implemented)
│   ├── OnboardingTour.tsx    # (stub — not yet implemented)
│   └── QuickStartModal.tsx   # (stub — not yet implemented)
├── services/
│   ├── gemini.ts             # All Google Gemini AI calls
│   ├── supabase.ts           # Supabase client initialization
│   └── useProfile.ts         # Custom React hook for profile fetching
├── netlify/
│   └── functions/
│       └── gumroad-webhook.ts # Payment webhook handler (server-side only)
├── App.tsx                   # Root component: routing, auth state, layout
├── index.tsx                 # React entry point
├── index.html                # HTML template (loads Tailwind & Font Awesome from CDN)
├── types.ts                  # All TypeScript interfaces and enums
├── constants.tsx             # Mock/demo data and subscription tier definitions
├── vite.config.ts            # Vite build config (env variable mapping)
├── tsconfig.json             # TypeScript config (ESNext, strict mode)
├── package.json              # Dependencies and npm scripts
└── metadata.json             # Netlify project metadata
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the schema below
- A Google Gemini API key
- (Optional) Gumroad account for payments

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_KEY=<google-gemini-api-key>
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_MAKE_WEBHOOK_OUTREACH=<optional-make.com-or-zapier-url>
VITE_MAKE_WEBHOOK_SCREENING=<optional-make.com-or-zapier-url>
```

For the Netlify Function (server-side, not prefixed with `VITE_`):

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Development Server

```bash
npm run dev       # Vite dev server (default: http://localhost:3000)
```

### Build & Preview

```bash
npm run build     # TypeScript compile + Vite bundle → dist/
npm run preview   # Serve the production build locally
```

### Demo Mode

If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are not set, the app runs in **demo mode** — all data is in-memory from `constants.tsx`. No login is required. This is useful for UI development without a backend.

---

## Database Schema

Run the following SQL in the Supabase SQL editor before using the app:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  role TEXT,
  plan TEXT DEFAULT 'starter',
  license_key TEXT,
  subscription_status TEXT DEFAULT 'trialing',
  webhook_outreach TEXT,
  webhook_calendar TEXT
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  client TEXT,
  salary TEXT,
  location TEXT,
  status TEXT DEFAULT 'active',
  description TEXT,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  linkedin_url TEXT,
  stage TEXT DEFAULT 'Sourced',
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  outreach_draft TEXT,
  match_score INTEGER,
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  action TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

Enable Row Level Security (RLS) on all tables and add policies so users can only access their own data.

---

## Architecture & Key Files

### `App.tsx`

The root component. Responsibilities:
- Determines auth state via `supabase.auth.onAuthStateChange()`
- Controls which view is rendered: `LandingView`, `AuthView`, or the main app shell
- Manages top-level state: `jobs`, `candidates`, `selectedJobId`, `activeView`
- Passes data and callbacks as props down to child components (no global state library)

### `types.ts`

Single source of truth for all TypeScript types. Add new types here. Key interfaces:
- `Job` — job order record
- `Candidate` — candidate pipeline record
- `Profile` — user profile with plan and subscription info
- `PricingTier` — subscription plan definition
- `CandidateStage` (enum) — pipeline stages: `Sourced | Screening | Interviewing | Offer | Placed`

### `services/gemini.ts`

All Gemini API calls live here. Each function accepts typed inputs and returns typed outputs. Key functions:
- `getDailySummary(jobs, candidates)` → markdown briefing string
- `detectStalledCandidates(candidates)` → array of flagged candidates
- `coordinateInterview(candidate, job)` → meeting invite text
- `generateOutreach(candidate, job)` → follow-up email draft

When modifying AI prompts, keep them in this file. Do not embed prompt strings in components.

### `services/supabase.ts`

Initializes and exports the Supabase client using environment variables. Import the client from here; never create a second instance.

### `services/useProfile.ts`

A custom hook (`useProfile(userId)`) that fetches the authenticated user's profile row from Supabase. Returns `{ profile, loading, error, refetch }`.

### `constants.tsx`

- `MOCK_JOBS` and `MOCK_CANDIDATES` — used in demo mode
- `PRICING_TIERS` — defines plan names, prices, job limits, and feature lists

### `netlify/functions/gumroad-webhook.ts`

A serverless function invoked by Gumroad on `sale`, `refund`, and `subscription_cancelled` events. It uses the Supabase **service role key** (bypasses RLS). This runs server-side only and should never be imported by frontend code.

---

## Coding Conventions

### TypeScript

- Strict mode is enabled. Do not use `any` — always define or import proper types.
- All types and interfaces belong in `types.ts`.
- Use TypeScript enums (defined in `types.ts`) for candidate stages and other constrained values.

### React

- Use **functional components** with hooks only. No class components.
- State lives at the lowest component that needs it, or in `App.tsx` when shared across views.
- Props are destructured in the function signature.
- Avoid prop drilling beyond two levels; lift state to `App.tsx` if needed.
- No Redux, Zustand, or Context API is used — keep it simple unless complexity demands it.

### Styling

- Use **Tailwind CSS utility classes** inline. No separate CSS files.
- Consistent color palette: `slate` grays for neutral surfaces, `indigo` for primary actions.
- Design is mobile-first and responsive.
- Icons come from Font Awesome — use class names like `fas fa-user`.

### Error Handling

- Wrap async operations in `try/catch`.
- Show user-facing error messages in the UI; log technical details to `console.error`.
- Never silently swallow errors.
- Loading states must be tracked with a boolean state variable and shown with a spinner or disabled UI.

### AI Calls

- All Gemini calls go through `services/gemini.ts`. No direct `genai` usage in components.
- Expect AI calls to fail intermittently — always handle the error case gracefully.
- Do not expose the raw API response to the user; parse and format it first.

---

## Subscription & Plan Logic

Plans are defined in `constants.tsx` as `PRICING_TIERS`:

| Plan Key | Name | Job Limit |
|----------|------|-----------|
| `starter` | Solo Accelerator | 1 |
| `professional` | Boutique Office | 10 |
| `pro_plus` | Velocity Scale | 1000 |

The user's active plan is stored in `profiles.plan`. Gate features by checking `profile.plan` against the tier definitions. Job creation is blocked when the user hits their plan's `jobLimit`.

`subscription_status` values: `active`, `trialing`, `cancelled`. Show a subscription renewal modal when status is `cancelled`.

---

## Webhook Integrations

Users can configure external webhook URLs (e.g., Make.com, Zapier) in **Settings**. These are stored on `profiles.webhook_outreach` and `profiles.webhook_calendar`. The app POSTs JSON payloads to these URLs when triggering outreach or calendar actions from `CandidatesView`.

System-wide webhook URLs for the AI screening pipeline can also be set via `VITE_MAKE_WEBHOOK_SCREENING` and `VITE_MAKE_WEBHOOK_OUTREACH` environment variables.

---

## Testing

There is **no test framework configured**. When adding tests:
- Recommended: Vitest (compatible with Vite) + React Testing Library
- Add `vitest` and `@testing-library/react` as dev dependencies
- Create a `vitest.config.ts` or extend `vite.config.ts`
- Place test files as `*.test.tsx` alongside the component being tested

---

## Deployment

**Recommended stack:**
- **Frontend + Netlify Functions**: Deploy to Netlify. Set all `VITE_*` env vars in the Netlify dashboard under Site Settings → Environment Variables. The `netlify/functions/` directory is auto-detected.
- **Database & Auth**: Supabase (managed PostgreSQL). No additional deployment needed.

**Build command:** `npm run build`
**Publish directory:** `dist`

---

## Known Stubs / Incomplete Features

The following component files exist but are empty — they are placeholders for future features:

- `components/HowItWorksModal.tsx`
- `components/OnboardingTour.tsx`
- `components/QuickStartModal.tsx`

Do not import or render these until they are implemented.

---

## Key Patterns to Follow When Extending

1. **New AI feature?** Add the Gemini call to `services/gemini.ts`, define input/output types in `types.ts`, call it from the component.
2. **New database table?** Add the schema to the SQL above, add the TypeScript interface to `types.ts`, use the Supabase client from `services/supabase.ts`.
3. **New view?** Create a new file in `components/`, add a route entry in `App.tsx`'s view-switching logic, and add a nav item to `Sidebar.tsx`.
4. **New plan feature?** Add it to the appropriate `PricingTier` in `constants.tsx` and gate it in the component by reading `profile.plan`.
5. **Environment variable?** Prefix with `VITE_` for frontend use. Server-side (Netlify Function) vars are unprefixed. Map both in `vite.config.ts` as needed.

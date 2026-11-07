# Project BMDC — web platform

Landing page + student platform + admin panel for the Project BMDC RQE course.
**Stack:** Next.js 16 (App Router, Turbopack) · Supabase (Postgres + Auth + Storage) · Tailwind 4 · Vercel.

Specs: [prd.md](prd.md) · [design.md](design.md) · [plan.md](plan.md) · live status: [state.md](state.md) · brand: [docs/brand-kit-logo2.md](docs/brand-kit-logo2.md)

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the keys
npm run dev                  # http://localhost:3000
```

## Map of the code

| Area | Where |
|---|---|
| Landing page | `src/app/page.tsx`, `src/components/landing/` |
| Auth (email + Google, reset, onboarding, device-blocked) | `src/app/(auth)/`, `src/app/auth/callback/route.ts` |
| One-device lock | `src/proxy.ts` (every protected request) + `src/lib/device.ts` (on login) + SQL `claim_device()` |
| Student platform | `src/app/(student)/` — dashboard, classes, mcq, notes, profile, leaderboard |
| MCQ engine UI | `src/components/mcq/` (practice + exam runners, T/F question card) |
| Admin panel | `src/app/admin/` + `src/app/admin/actions.ts` |
| Brand (logo, film backgrounds, motion) | `src/components/brand/B2.tsx`, `src/app/globals.css` |
| Database schema | `supabase/migrations/*.sql` (already applied to the Supabase project) |
| Curriculum + MCQ content | `content/curriculum.json`, `content/mcq/*.json` |

## Security model (short)

- Every table has Row Level Security. Students can never read `question_options.is_true` / explanations directly; answers are checked and scored in `security definer` SQL functions (`check_practice_question`, `save_exam_answers`, `submit_attempt`, `get_attempt`).
- Paid access = `profiles.is_paid` and `access_expires_at` in the future; checked in SQL (`has_paid_access()`), not in the browser.
- Notes PDFs live in a **private** bucket; storage RLS only signs URLs for entitled users; URLs expire in 2 minutes.
- Live class Meet links are returned only by `get_live_sessions()`, which hides `paid` links from free accounts.

## Adding MCQs (done by Claude)

1. Write `content/mcq/<set>.json` (format: see `content/mcq/pyq-2025-may.json`; subject/chapter names must match `content/curriculum.json`).
2. `node scripts/content-to-import.mjs mcq content/mcq/<set>.json` → prints `select public.import_mcq(...)`.
3. Run that SQL in Supabase (MCP or SQL editor). It upserts, so re-running is safe, and it rebuilds the topic-wise sets.

## One-time setup checklist (owner)

See **state.md → "Waiting on the owner"** for the live list. In short:

1. **Supabase → Authentication → Sign In / Providers → Email:** turn **OFF** "Confirm email" (signup without verification).
2. **Supabase → Authentication → URL Configuration:** Site URL = your live URL; add `http://localhost:3000/**` and `https://<your-domain>/**` to Redirect URLs.
3. **Google login:** Google Cloud Console → OAuth client (Web) → Authorized redirect URI `https://gmmpzehlfeuigtopekoq.supabase.co/auth/v1/callback` → paste the Client ID/Secret into Supabase → Authentication → Providers → Google.
4. **Make yourself admin:** sign up on the site, then in Supabase SQL editor:
   `update public.profiles set role = 'admin' where email = '<your email>';`
5. **GitHub + Vercel:** push this folder to a private GitHub repo, import it in Vercel, add the env vars from `.env.example`, deploy. Set `NEXT_PUBLIC_SITE_URL` to the Vercel URL.
6. **Workshop link:** Admin → Live sessions → edit "Free workshop…" → paste the Google Meet link.

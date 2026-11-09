# Project BMDC — Build Plan

> Version 1.0 · 2026-11-08 · Requirements: [prd.md](prd.md) · UI: [design.md](design.md) · Status: [state.md](state.md)

---

## 1. Key dates & milestones

| Milestone | Date | Must be live |
|---|---|---|
| **M1 — Workshop launch** | **by 15 Nov 2026** (workshop 20 Nov) | Landing page with the workshop section, signup/login (Google + email), one-device lock, basic dashboard showing the workshop Meet link, admin overview + students list + live sessions |
| **M2 — Batch launch** | **by 28 Nov 2026** (batch starts 1 Dec) | Mark-paid flow + access expiry, free/paid gating, live class links, notes (upload + viewer), MCQ practice + exam + review (with first content imported), profile basics |
| **M3 — Progress** | Dec 2026 | Full profile stats, subject accuracy, mock history chart, leaderboard, streak |
| **M4 — Recordings** | Later (when owner is ready) | Bunny Stream upload + secure playback + watch-time tracking |

---

## 2. Stack (free-tier first)

| Layer | Choice | Free-tier notes |
|---|---|---|
| Framework | **Next.js 15** (App Router, TypeScript, Server Components, Server Actions) | — |
| Styling | Tailwind CSS + brand kit global CSS | — |
| Auth / DB / Storage | **Supabase** (Postgres + RLS, Auth with Google + email/password, Storage) | Free: 500 MB DB, 1 GB storage, 5 GB egress/mo, 50k MAU. Pauses after 7 days of no activity (not an issue once live). |
| Hosting | **Vercel** (Hobby) | See risk R1 |
| Repo | **GitHub** (private) → Vercel auto-deploys `main`, preview deploys on PRs | — |
| Video | **Bunny Stream** — later (M4) | Pay-as-you-go, very cheap |
| Live classes | Google Meet links (pasted by admin) | Free |
| PDF viewer | `react-pdf` (PDF.js) | — |
| Charts | Recharts (lazy-loaded) | — |
| Forms/validation | `react-hook-form` + `zod` | — |
| Supabase client | `@supabase/ssr` | — |
| Icons | `lucide-react` | — |

---

## 3. Architecture

One Next.js app, three route groups:

```
app/
  (marketing)/            → public website
    page.tsx              → landing
    privacy/ terms/
  (auth)/
    login/ signup/ forgot-password/ reset-password/
    onboarding/           → collect phone for Google users
    device-blocked/
  auth/callback/route.ts  → Supabase OAuth/code exchange
  (student)/              → requires session + device check
    dashboard/
    classes/              → ?tab=next|recorded
    classes/[recordingId]/
    mcq/                  → hub
    mcq/[section]/        → pyq | model | topic
    mcq/set/[setId]/practice/
    mcq/set/[setId]/exam/
    mcq/attempt/[attemptId]/        → result
    mcq/attempt/[attemptId]/review/
    notes/  notes/[noteId]/
    profile/  leaderboard/
  admin/                  → requires role=admin
    page.tsx (overview) students/ students/[id]/ payments/
    live/ recordings/ notes/ subjects/ settings/
components/
  brand/ (B2Defs, B2Mark, B2Logo, Film)  ui/  landing/  student/  mcq/  admin/
lib/
  supabase/ (server.ts, client.ts, middleware.ts, admin.ts)
  auth/device.ts  access.ts  scoring.ts  time.ts (Asia/Dhaka)
supabase/
  migrations/*.sql  seed.sql
content/
  mcq/*.json              → MCQ source files (imported via script)
scripts/
  import-mcq.ts
middleware.ts             → session refresh, device check, route guards
public/brand/             → logo files copied from LOGO/LOGO 2
```

### Request guard (middleware.ts)
1. Refresh the Supabase session (`@supabase/ssr`).
2. `/dashboard…` routes: no session → `/login`. Session → **device check** (§5). Missing phone → `/onboarding`.
3. `/admin…` routes: require `profiles.role = 'admin'` (and check it again in every admin server action + RLS).

---

## 4. Data model (Supabase / Postgres)

```sql
-- users
profiles(id uuid pk → auth.users, full_name text, phone text, role text default 'student' check in ('student','admin'),
         is_paid bool default false, access_expires_at timestamptz, created_at, last_active_at, admin_note text)
-- derived status: admin | paid (is_paid and (access_expires_at is null or > now())) | expired | free

devices(user_id uuid pk → profiles, device_id uuid not null, user_agent text, bound_at timestamptz, last_seen_at timestamptz)

payments(id, user_id, amount int, trx_id text, method text default 'bkash', paid_on date, recorded_by uuid, created_at)

settings(key text pk, value jsonb)   -- price 10000, offer_price 8000, bkash_number, whatsapp_number, batch_start 2026-12-01,
                                     -- workshop_at 2026-11-20T20:00+06:00, workshop_meet_url (placeholder), default_access_end 2027-05-01, facebook_url

-- hierarchy (generic until chapter list arrives)
subjects(id, name, slug, sort)
chapters(id, subject_id, name, slug, sort)

-- live
live_sessions(id, title, meet_url, starts_at timestamptz, duration_min int, audience text check in ('all','paid'), created_at)

-- recordings (Bunny later)
recordings(id, chapter_id, class_code text null /* e.g. W1C2 */, title, sort, duration_sec int, bunny_video_id text null, is_free_sample bool, published bool)
-- subjects/chapters are seeded from content/curriculum.json (7 subjects, 39 chapters)
watch_progress(user_id, recording_id, seconds_watched int, last_position int, completed bool, updated_at, pk(user_id, recording_id))

-- notes
notes(id, chapter_id, title, storage_path text, page_count int, sort, is_free_sample bool, published bool)
note_views(user_id, note_id, last_viewed_at, pk(user_id, note_id))

-- MCQ (RQE true/false only)
questions(id, ext_id text unique, stem text, subject_id, chapter_id null, pyq_year int null, pyq_session text null,
          pearl text null, created_at)
question_options(id, question_id, label char(1) check in ('A','B','C','D'), text, is_true bool, explanation text null,
                 unique(question_id,label))
question_sets(id, ext_id text unique, kind text check in ('pyq','model','topic'), title, subject_id null, chapter_id null,
              pyq_year int null, duration_min int, is_free_sample bool, published bool, sort)
question_set_items(set_id, question_id, position int, pk(set_id, question_id))

attempts(id, user_id, set_id, mode text check in ('practice','exam'), started_at, submitted_at null, duration_min int,
         score numeric(6,2) null, n_correct int, n_wrong int, n_blank int)
attempt_answers(attempt_id, option_id, answer bool null, is_correct bool null, flagged bool default false,
                pk(attempt_id, option_id))

daily_activity(user_id, day date, mcq_count int, watch_seconds int, pk(user_id, day))   -- streaks + stats
```

**Helper SQL functions:** `is_admin()`, `has_paid_access(uid)`, `can_access(is_free_sample)`. Views: `v_student_stats` and `v_leaderboard` (best exam score per model test per paid student, display name = first name + last initial).

**RLS summary**
- `profiles`: users can read/update their own row (not `role`, `is_paid` or `access_expires_at`); admins have full access.
- Content tables (`recordings`, `notes`, `question_sets`): every signed-in user can read the **metadata** (so locked items can be listed). Protected payloads are only handed out by server code after `can_access()`.
- `question_options.is_true` / `explanation`: **never readable by students directly**. Practice feedback and exam review go through a server action that checks the attempt state (practice: after answering that question; exam: only after submit).
- `live_sessions.meet_url`: readable via the `rpc_next_session()` server function, which hides the URL from free users when `audience = 'paid'`.
- Storage bucket `notes` is **private**. Signed URLs (60 s) come only from a server action after `can_access()`.
- `attempts`, `attempt_answers`, `watch_progress`, `daily_activity`: owner only, plus admin.

---

## 5. One-device lock — implementation

1. `lib/auth/device.ts`: on the first page load, if there's no `bmdc_did` cookie, generate a UUID and set it (httpOnly, Secure, SameSite=Lax, 400 days).
2. After login (email or OAuth callback) → server action `bindOrCheckDevice()`:
   - no `devices` row → insert one (bind this device), then call `supabase.auth.signOut({ scope: 'others' })`;
   - row with the same `device_id` → update `last_seen_at`;
   - row with a different `device_id` → `signOut()` and redirect to `/device-blocked`.
3. `middleware.ts` repeats the comparison on every protected request (cached on a short-lived signed cookie `bmdc_dok` for 5 minutes to limit DB hits).
4. Admin → Student → **Reset device**, which deletes the `devices` row.
5. Admins are exempt.
6. Tests: two browsers, same account → the second is blocked; after a reset the second works and the first is blocked.

---

## 6. MCQ import workflow (owner → Claude → DB)

The owner sends questions in any form (text, doc, images). Claude converts them into `content/mcq/<file>.json` and runs:

```bash
node scripts/content-to-import.mjs mcq content/mcq/<file>.json   # prints: select public.import_mcq('<json>')
```

Claude runs that SQL through the Supabase MCP. `import_mcq()` (an owner-only SQL function; students and anon can't call it) validates the data and **upserts** by `ext_id`, so re-running is safe. No service-role key is needed or stored anywhere.
*(As built: Next.js 16 renamed `middleware.ts` to `src/proxy.ts`.)*

```json
{
  "set": { "ext_id": "pyq-2024-jan", "kind": "pyq", "title": "RQE January 2024", "pyq_year": 2024,
           "subject": "Mixed", "duration_min": 100, "is_free_sample": false },
  "questions": [
    {
      "ext_id": "pyq-2024-jan-030",
      "subject": "Pharmacology", "chapter": "Antidiabetic drugs",
      "stem": "Adverse effects of metformin are:",
      "options": [
        { "label": "A", "text": "Lactic acidosis", "is_true": true,  "explanation": "Rare but serious; risk rises with renal impairment, hypoxia and alcohol." },
        { "label": "B", "text": "Abdominal discomfort", "is_true": true, "explanation": "GI upset is the most common side effect." },
        { "label": "C", "text": "Weight gain", "is_true": false, "explanation": "Weight neutral or mild weight loss." },
        { "label": "D", "text": "Hypoglycemia", "is_true": false, "explanation": "Doesn't increase insulin secretion, so alone it doesn't cause hypos." }
      ],
      "pearl": "Long-term use can cause vitamin B12 deficiency."
    }
  ]
}
```

`subject` and `chapter` must match names in `content/curriculum.json`; otherwise the script fails, so we don't end up with typos as new chapters. Explanations are optional, but practice mode looks best with them. Every PYQ paper becomes one `pyq` set. Topic-wise practice is built from the chapter tags, so no duplicate questions are needed.

**Content status:** `content/mcq/pyq-2025-may.json` holds 10 sample PYQs with explanations (readable version: `pyq-2025-may.preview.md`). The rest of `BMDCPQ.pdf` (Oct 2017 → May 2025, about 300+ questions) gets converted after the website is built.

**Scoring (`lib/scoring.ts`, server only):** for each option: answer is null → 0; answer matches `is_true` → +0.25; otherwise → −0.06. The question score is the sum, and the attempt score is the sum over all questions (shown to 2 decimals, out of `n_questions`).

**Exam timer:** the deadline is `started_at + duration_min`, set by the server. The client counts down from the server's deadline. Answers autosave (debounced 1 s plus on navigation). A server-side check rejects saves after the deadline plus 30 s grace, and auto-submits on the next load once it has expired.

---

## 7. Phases & tasks

### Phase 0 — Setup (Day 1)
- [ ] `create-next-app` (TS, App Router, Tailwind, ESLint), Prettier, the folder structure above
- [ ] GitHub repo (private), push, connect to Vercel, set env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` server only, `NEXT_PUBLIC_SITE_URL`)
- [ ] Supabase project (free, region Singapore — closest to Bangladesh); turn **Confirm email OFF**; enable the Google provider (Google Cloud OAuth client; redirect URLs for localhost + vercel.app)
- [ ] Brand foundation: kit CSS → `globals.css`, Tailwind tokens, `next/font` (Outfit, Hind Siliguri), `B2Defs/B2Mark/B2Logo/Film` components, favicons + OG from `LOGO/LOGO 2`
- [ ] UI primitives: Button, Card, Input, Sheet/Modal, Toast, Countdown, Loader, Lock overlay, EnrollSheet

### Phase 1 — Landing page (M1)
- [ ] Sticky header + mobile menu + workshop bar
- [ ] Hero, **Free Workshop section with countdown** (auto-switches after the date), Course details, RQE explainer, Platform preview, Instructors, Pricing, bKash/WhatsApp enroll steps (copy buttons, `wa.me` link), FAQ, Final CTA, Footer
- [ ] Sticky mobile bottom CTA bar
- [ ] Copy that changes (price, numbers, dates) comes from `settings`, with fallback constants
- [ ] SEO: metadata, OG image, sitemap, robots

### Phase 2 — Auth + device lock (M1)
- [ ] Migrations: `profiles` (trigger on `auth.users` insert), `devices`, `settings`
- [ ] Signup (name, email, phone, password), login, Google OAuth, callback, onboarding (phone), forgot/reset password, logout
- [ ] Device lock (§5) + `/device-blocked`
- [ ] Middleware route guards

### Phase 3 — Student shell + dashboard + live (M1 → M2)
- [ ] Layout: mobile bottom tabs + sticky top bar; desktop sidebar
- [ ] `live_sessions` + `rpc_next_session()`; dashboard next-session card (workshop visible to free users)
- [ ] Classes page: Next class tab + schedule; Recorded tab with an empty state
- [ ] Status banners (free/paid/expired) + EnrollSheet

### Phase 4 — Admin core (M1 → M2)
- [ ] Admin guard + layout
- [ ] Overview stats (total/free/paid/expired/new this week/revenue) + signups chart
- [ ] Students table + detail: **Mark as paid** (amount, TrxID, access end date) → writes `payments` + updates the profile; extend/revoke; **Reset device**; note field
- [ ] Payments log, Live sessions CRUD, Settings editor, Subjects & chapters CRUD

### Phase 5 — Notes (M2)
- [ ] `notes` table + private bucket; admin upload (PDF only, ≤ 20 MB), list, reorder, free-sample flag
- [ ] Student notes list (locked states) + viewer (`react-pdf`, no download/print, sticky toolbar, pinch zoom, lazy pages), signed URLs; `note_views`

### Phase 6 — MCQ (M2)
- [ ] MCQ tables + RLS + scoring functions
- [ ] `scripts/import-mcq.ts` + sample content (the metformin PYQ from our post plus a few demo questions)
- [ ] MCQ hub + section lists (PYQ by year, model tests, topic-wise by subject → chapter)
- [ ] Practice mode (instant per-question feedback + explanations + pearl)
- [ ] Exam mode (server timer, palette, flag, autosave, auto-submit, RQE scoring)
- [ ] Result page + review
- [ ] `daily_activity` updates

### Phase 7 — Profile & progress (M3)
- [ ] Profile info + edit name/phone
- [ ] Stats: MCQs done, accuracy, hours watched, notes viewed, recordings completed
- [ ] Subject-wise accuracy, mock score history chart, streak, leaderboard page

### Phase 8 — Recordings with Bunny Stream (M4, later)
- [ ] Bunny library + API key (server env), admin upload via Bunny TUS direct upload, store `bunny_video_id`
- [ ] Token-authenticated embed URLs (expiring), allowed-referrer = our domain
- [ ] Player page: resume, 15 s heartbeat → `watch_progress` + `daily_activity`, mark complete

### Phase 9 — QA & launch (every milestone)
- [ ] Mobile QA at 360/390/412 px + a real Android + iPhone; no horizontal scroll; sticky bars correct with the keyboard open
- [ ] Reduced motion, keyboard nav, contrast check
- [ ] RLS tests (free user can't fetch paid content, options or URLs)
- [ ] Device-lock test matrix
- [ ] Lighthouse ≥ 90 on landing (mobile)
- [ ] Error/empty/loading states with brand copy

---

## 8. Risks & mitigations

| # | Risk | Mitigation |
|---|---|---|
| R1 | **Vercel Hobby is officially non-commercial.** A paid course could be flagged. | Start on Hobby. Move to Vercel Pro (~$20/mo) or Cloudflare Pages / Netlify free once revenue starts. The code stays portable (no Vercel-only APIs). |
| R2 | Supabase free egress (5 GB/mo) used up by PDF views | Compress PDFs, cache signed URL sessions per view, monitor usage; videos are on Bunny, not Supabase |
| R3 | Supabase free project pauses after 7 days inactive (before launch) | Regular dev activity; it won't happen once students use it |
| R4 | Device lock frustrates students who clear their browser data | Clear message + WhatsApp button; fast admin reset; FAQ entry |
| R5 | Tight timeline to the 20 Nov workshop | M1 scope kept minimal (landing + auth + workshop link + basic admin) |
| R6 | Notes/screens can still be screenshotted | Accept; in-app viewer only (owner chose no watermark) |
| R7 | Google OAuth consent screen needs verification for the brand name/logo | Use basic scopes (email, profile), so no sensitive-scope review is needed; publish the app in Google Cloud |

# Project BMDC — Project State

> Living document. Update after every work session.
> Last updated: **2026-11-08**

---

## Current status

**Phase:** All phases are built in code; **not deployed yet**. Waiting on the owner's one-time setup (below) before launch.
**Next milestone:** **M1 — Workshop launch, by 15 Nov 2026** (workshop is 20 Nov, 8 PM).
**Code:** Next.js 16 app at the repo root (`D:\BMDC`). Local git repo exists (create-next-app's initial commit); **this work is not committed yet**.
**Supabase project:** "Project BMDC" · ref `gmmpzehlfeuigtopekoq` · Singapore · free plan. Migrations 0001–0005 applied; curriculum (7 subjects, 39 chapters) and 10 PYQs (May 2025) imported. The workshop session exists with no Meet link yet.

| Phase | Status |
|---|---|
| 0 Setup | ✅ Scaffold, Supabase project, schema, brand foundation (GitHub/Vercel: owner step) |
| 1 Landing page | ✅ Built; checked in browser at 375 px and ~800 px |
| 2 Auth + device lock | ✅ Built; guards verified. ⚠️ Full sign-in flow not tested yet (needs "Confirm email" OFF + a test account) |
| 3 Student shell + dashboard + live | ✅ Built (not yet tested signed in) |
| 4 Admin core | ✅ Built (not yet tested signed in) |
| 5 Notes | ✅ Built (upload + viewer; not yet tested with a real PDF) |
| 6 MCQ | ✅ Built: practice, exam (server timer, autosave, flag, auto-submit), RQE scoring in SQL, result, review |
| 7 Profile & progress | ✅ Built: stats, subject accuracy, score chart, streak, leaderboard |
| 8 Recordings (Bunny) | 🟡 Code ready (secure token embed + watch tracking); activates when BUNNY_* env vars are set |
| 9 QA & launch | 🟡 Production build ✅, lint ✅, typecheck ✅, mobile layout ✅. Pending: signed-in end-to-end test, deploy |

---

## Live

| What | Where |
|---|---|
| **Live site** | **https://www.projectbmdc.com** (bare projectbmdc.com redirects to www; projectbmdc.vercel.app still works). Domain from Namecheap, DNS: A @ 216.198.79.1, CNAME www → Vercel (Vercel project `project-bmdc`, team "arnob's projects", functions in `sin1` Singapore) |
| GitHub | https://github.com/arnobalam10-tech/project-bmdc (branch `main`; every push redeploys) |
| Supabase | project `gmmpzehlfeuigtopekoq` (Singapore) |
| Owner admin login | `admin@bmdc.com` (password given by owner in chat; **change it after first login**; this email has no real inbox, so ask Claude to reset it if forgotten) |
| Test accounts | `.env.test.local` (student = multi-device on, paid; test admin). Delete before announcing. |

**Live check (2026-11-08):** 25/26 automated checks passed on the live site, and the 26th was a test-script issue (the row is visible). Covered: landing (light default, workshop), student login, dashboard, classes, MCQ hub/PYQ/topic, notes, profile, leaderboard, practice check + explanation, admin blocked for students, admin login and all 9 admin pages.

## MCQ bank (2026-11-08)

**857 questions · 3,428 True/False statements · 10 PYQ papers · 39 chapter (topic-wise) sets.**
May 2025 (86, answers decided by us; no key in source), May 2022 (67), Nov 2022 (82), Oct 2021 (84), Oct 2020 (87), Oct 2019 (99), Apr 2019 (84), Oct 2018 (90), Apr 2018 (88), Oct 2017 (90).
Source: `BMDCPQ.pdf`. 84 printed answer keys were corrected against standard textbooks (list in the helper reports). Topic-only recall lists (Oct 2023, May 2023, Oct 2022, Oct 2021) were not imported; saved for the owner as `Downloads/BMDC-Recent-Exam-Topics-2021-2023.pdf`.
Files: `content/mcq/*.json`. Re-import: `node scripts/import-mcq.mjs` (needs `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`; `--wipe` deletes all questions/sets/attempts first). Validate/merge helper output: `node scripts/merge-mcq.mjs <dir>`.
**Free access (per question, enforced in the database):** free accounts get the first `free_count` questions of every set — 2 for every chapter and paper, 10 for May 2025 (95 distinct questions in total); the rest show blurred with a join message and are never sent to the browser. Change per set in Admin → MCQ sets ("Free Qs"); "Whole set free" opens a whole set.

## Decisions log

| Date | Decision |
|---|---|
| 2026-11-08 | Stack: Next.js + Supabase, GitHub, Vercel. Free tiers wherever possible. |
| 2026-11-08 | Brand: **Logo 2 (“Four B's”)** kit only — `LOGO/LOGO 2/PROJECT-BMDC-LOGO-2-WEBSITE-KIT.md`. |
| 2026-11-08 | Payment: bKash **Send Money** to 01322654646 (Personal) + verification on WhatsApp 01886688253; admin marks paid manually. |
| 2026-11-08 | Price: ৳8,000 offer (regular ৳10,000). Single course, no batches. Next batch starts 1 Dec 2026. |
| 2026-11-08 | Free workshop 20 Nov 2026, registration = free signup; the workshop must be presented very prominently. |
| 2026-11-08 | Instructors: Dr. Nafisa Alam, Dr. Omar (Xiamen University, China; passed BMDC in one attempt). No photos → monogram avatars. |
| 2026-11-08 | Auth: Google (verified) + email/password with **no email verification**; forgot-password via email; phone (+880) collected at signup. |
| 2026-11-08 | **One device per student**: second device blocked, admin-only reset. |
| 2026-11-08 | Live classes on **Google Meet**; admin pastes the link. Free signups do **not** see class links (only `audience=all` sessions like the workshop). |
| 2026-11-08 | Recordings on **Bunny Stream**, deferred to a later phase. |
| 2026-11-08 | MCQ: RQE **True/False only** (4 statements, +0.25/−0.06/0). Practice = instant feedback; Exam = timed, RQE marking, review at the end. Sections: PYQ, model tests, topic-wise (hierarchy pending chapter list). |
| 2026-11-08 | MCQs are uploaded **through Claude** (JSON + import script), not the admin panel. No explanation editing in admin. |
| 2026-11-08 | Notes: in-app PDF viewer only, no download/print, **no watermark**. |
| 2026-11-08 | Free tier default: free samples (1 recording, 1 note, limited practice MCQs, 1 mock), all else locked + visible. Configurable. |
| 2026-11-08 | Paid access ends at a per-student end date set by the admin. |
| 2026-11-08 | Single admin (owner). |
| 2026-11-08 | UI language: English + Bangla accent lines. |
| 2026-11-08 | Profile: subject accuracy, mock score chart, leaderboard, streak, MCQs done, hours watched. |
| 2026-11-08 | Landing page is built directly in Next.js (no static mock). |
| 2026-11-08 | **Mobile-first is a hard requirement**: sticky header/tab bar/exam bars, fully responsive (see design.md §4). |
| 2026-11-08 | No testimonials section until real results exist. Domain TBD → vercel.app for now. |
| 2026-11-08 | **Light mode is the default theme** (dark still available via the sun/moon toggle). Set in `src/lib/theme.ts`. |
| 2026-11-08 | Launch steps written in **LAUNCH.md** (owner's step-by-step guide). |
| 2026-11-08 | Workshop: **20 Nov 2026, 11:00 PM** (Asia/Dhaka). Meet link = placeholder until the owner sends it. |
| 2026-11-09 | Workshop moved to **20 Nov 2026, 8:00 PM** (Asia/Dhaka). The header banner now reads the time from the `workshop_at` setting. |
| 2026-11-08 | Paid access ends **1 May 2027** (default end date; editable per student). |
| 2026-11-08 | Free samples are toggled by the owner in admin (`is_free_sample`); nothing is free by default. |
| 2026-11-08 | Curriculum from `TIMELINE FINAL.pdf` → `content/curriculum.json`: 7 subjects, 39 chapters, 48 classes over 16 weeks. Part 1/Part 2 = one chapter. W6C3 “Derma + Rheum (Extra)” belongs to both chapters. |
| 2026-11-08 | All of `BMDCPQ.pdf` is PYQ (papers Oct 2017 → May 2025). One set per paper; each question also tagged to a curriculum chapter for topic-wise practice. |

---

## Waiting on the owner

**Before launch (one-time setup; steps in README.md):**
- [ ] Supabase → Auth → Email: turn **OFF "Confirm email"** (required for no-verification signup; otherwise the free email limit of ~2/hour blocks signups)
- [ ] Supabase → Auth → URL configuration: Site URL + redirect URLs
- [ ] Google OAuth client → paste into Supabase Google provider
- [ ] Sign up with your own account, then make it admin (one SQL line in README, or ask Claude)
- [ ] Approve a test account so Claude can run the signed-in end-to-end test (practice, exam, admin mark-paid, device lock)
- [ ] GitHub repo + Vercel project (or approve Claude doing it) → set env vars → deploy
- [ ] Workshop Google Meet link → Admin → Live sessions
- [ ] Later: custom SMTP (e.g. Resend free) so password-reset emails aren't rate-limited

**Content:**
- [x] Course chapter list → `content/curriculum.json`
- [ ] Owner review of the 10 sample PYQs (`content/mcq/pyq-2025-may.preview.md`)
- [ ] Rest of the PYQs (convert after the website is built) + any model tests
- [x] Workshop time → 20 Nov, 8 PM · [ ] **Google Meet link**
- [x] Access length → 1 May 2027
- [x] Free samples → owner manages in admin
- [ ] Domain name (optional)
- [ ] Payment verification time promise (“unlocked within X hours”)
- [ ] Short instructor bios beyond university + “passed in one attempt” (optional)

---

## Next steps

1. Phase 0: scaffold the Next.js app in `D:\BMDC\web` (or repo root), create the GitHub repo, Supabase project, and Vercel project.
2. Phase 1 + 2 in parallel toward M1 (landing + auth + device lock).
3. Workshop session entered in admin with `audience = all` once the Meet link is known.

---

## Session notes

- **2026-11-08 (4):** Created test accounts (one student, one admin; credentials in git-ignored `.env.test.local`; delete them before launch). Tested signed in, in the browser: email login → dashboard (workshop card + free-account banner), free student sees PYQ locked, admin login → overview counts, admin marks the student paid (end 1 May 2027, device shown), student sees the paper unlocked, practice check (per-statement ✓/✗, "You marked T", explanation, pearl), exam (timer, autosave "Saved", palette, submit confirm), RQE score (1 correct → 0.25/10). Not yet tested: notes upload/viewer with a real PDF, Google login, device block from a second browser.
- **2026-11-08 (3):** Built all phases. Created the Supabase project (free) and applied migrations 0001–0005 (core, MCQ engine, import functions, fix, grant lockdown; security advisor findings resolved). Imported the curriculum and 10 PYQs. Next.js 16 app: landing (workshop countdown, outline, bKash steps, sticky mobile CTA), auth (email/Google/reset/onboarding), one-device lock (proxy + claim_device), student dashboard/classes/MCQ/notes/profile/leaderboard, admin (overview, students + mark paid/reset device, payments, live, recordings, notes upload, MCQ visibility, curriculum, settings). Fixed CSS-layer and mobile overflow issues found in the browser. Not done: signed-in E2E test (creating a test account directly in the DB was blocked pending owner approval), commit, deploy.
- **2026-11-08 (2):** Read TIMELINE FINAL.pdf → curriculum.json. Extracted BMDCPQ.pdf (110 pages, papers 2017–2025). Wrote 10 PYQs from the May 2025 paper with per-statement explanations + exam pearls, each mapped to a chapter (`content/mcq/pyq-2025-may.json`, preview `.md`). Updated prd/plan with workshop time, 1 May 2027 access end, admin-managed free samples.
- **2026-11-08:** Reviewed the brand kit (Logo 2), social posts 01–03 (who we are, metformin PYQ, RQE format). Asked the owner 3 rounds of questions and wrote prd.md, design.md, plan.md, state.md.

# Project BMDC — Product Requirements (PRD)

> Version 1.0 · 2026-11-08 · Owner: Project BMDC
> Companion docs: [design.md](design.md) (brand + UI) · [plan.md](plan.md) (build plan) · [state.md](state.md) (live status)

---

## 1. Product summary

Project BMDC is an online course platform that prepares Bangladeshi doctors who finished their MBBS abroad for the **BMDC Registration Qualifying Examination (RQE)**, the licensing exam. It is a **4-month course** taught by doctors who **passed the BMDC exam in one attempt**.

The product is **one Next.js web app with three parts**:

| Part | Who | Purpose |
|---|---|---|
| **1. Public website** (landing) | Visitors | Explain the course, promote the free workshop, explain how to pay (bKash) and verify (WhatsApp), drive signups |
| **2. Student platform** | Signed-in students (free + paid) | Live classes, recorded classes, MCQ practice/exams, notes, profile/progress |
| **3. Admin panel** | One admin (the owner) | Manage students & payments, upload notes & recordings, set live class links, see stats |

**Tagline:** “Your gateway to BMDC licence.” · Bangla: “বিদেশে MBBS, দেশে লাইসেন্স।”

---

## 2. Business facts (source of truth for copy)

| Item | Value |
|---|---|
| Course | 4-month BMDC RQE prep course (single course, no batches) |
| Regular price | ~~৳10,000~~ |
| **Offer price** | **৳8,000** |
| Payment method | bKash **Send Money** to **01322654646** (Personal number) |
| Payment verification | WhatsApp **01886688253** (send TrxID + screenshot) |
| Next batch starts | **1 December 2026** |
| **Free workshop** | **20 November 2026, 11:00 PM (Bangladesh time)** · free with signup · *must be presented very prominently* · Google Meet link: **placeholder** (owner will send) |
| **Paid access ends** | **1 May 2027** for everyone paying for this batch (default end date when the admin marks someone paid; still editable per student) |
| Curriculum | 16 weeks × 3 classes = 48 classes, Medicine → Obstetrics. Source: `TIMELINE FINAL.pdf` → [content/curriculum.json](content/curriculum.json). Classes split into “Part 1/Part 2” count as **one chapter** (e.g. Hepatology). |
| Previous-year papers | `BMDCPQ.pdf`: BMDC papers Oct 2017 → May 2025 (Oct 2017, Apr & Oct 2018, Apr & Oct 2019, Oct 2020, Oct 2021, Oct 2022, May & Oct 2023, May 2025). All are PYQ. |
| Instructors | **Dr. Nafisa Alam** and **Dr. Omar**, both MBBS from **Xiamen University, China**, both passed the BMDC exam in one attempt. No photos (use brand monogram avatars). |
| Facebook | https://www.facebook.com/profile.php?id=61596008175287 |
| Live class platform | Google Meet |
| Domain | Not decided → `*.vercel.app` until then |
| Testimonials / results | None yet → section **omitted** (brand rule: real results only) |

Exam format (from our RQE post, used in the landing explainer and exam engine):
100 questions · 4 True/False statements each (A–D) · 400 statements · correct statement **+0.25** · wrong **−0.06** · blank **0** · total 100 marks · 100 minutes.

---

## 3. Users & roles

| Role | How they get it | Can access |
|---|---|---|
| **Visitor** | — | Public website |
| **Free student** | Signs up (Google or email) | Dashboard shell, **free workshop link**, **free samples** (see §6), locked previews of everything else, profile |
| **Paid student** | Admin marks them *Paid* after verifying bKash payment on WhatsApp | Everything in the student platform until their **access end date** |
| **Expired student** | Paid student whose access end date has passed | Treated like a free student; sees “Your access ended on …, message us on WhatsApp to extend.” |
| **Admin** | Set manually in Supabase (`profiles.role = 'admin'`) — exactly one | Admin panel + can view the student platform |

Persona: Bangladeshi doctor, 23–30, MBBS from China/Russia/India/Nepal/etc., may still be abroad, studies on phone and laptop, anxious about failing, busy. Speak peer-to-peer (“Dr.”), calm, encouraging.

---

## 4. Part 1 — Public website (landing page)

One long landing page at `/` (plus `/login`, `/signup`, legal pages). Sections in order:

1. **Header** — logo (`b2-logo` lockup), anchor links (Course · Workshop · How to enroll · FAQ), `Log in` (secondary) and `Join the batch` (primary). Sticky; one-line logo on mobile.
2. **Workshop announcement bar** — slim film-spring strip above/below header: “Free workshop · 20 November · Register free →”. Auto-hides after the workshop date.
3. **Hero** (film background, `is-intro` symbol) — eyebrow “BMDC Licensing Exam · 4-Month Course”, headline “Your gateway to **BMDC licence.**”, Bangla line, sub-copy “Taught by doctors who’ve already passed it. Batch starts 1 December.” CTAs: `Join the batch` + `Register for the free workshop`. Small stat chips: 4 months · Recorded classes · Timed mock exams · Previous papers.
4. **FREE WORKSHOP — the eye-catching section** (must be the most visually striking block after the hero): film-spring background, large “FREE” badge, date “20 November 2026”, **live countdown timer** (days/hours/min/sec), what you’ll learn (3 bullets), who’s teaching (both instructors), big CTA “Sign up free & get the workshop link”. Copy note: signing up is the registration; the Meet link appears on the student dashboard. After the workshop ends, this section switches to “Missed the workshop? Batch starts 1 December.”
5. **Course details** — what the 4-month course covers: every topic explained clearly, all previous BMDC question papers, MCQ bank + topic-wise tests, real timed mock exams with RQE marking, every class recorded (rewatch anytime), chapter-wise notes. **16-week course outline** from the curriculum: subject tabs/accordion (Medicine, General Surgery, Specialized Surgery, Basic Sciences, Pediatrics, Gynecology, Obstetrics) listing each week’s 3 classes.
6. **How the RQE is marked** — compact explainer from Post 03 (100 Q, 400 options, +0.25/−0.06, 100 min) + “Our mocks use this exact marking.”
7. **Platform preview** — phone/laptop mock of the MCQ answer+explanation screen (as in the social posts): “Wrong answer? Know exactly why.”
8. **Instructors** — two cards (monogram avatars, no photos): Dr. Nafisa Alam, Dr. Omar · MBBS, Xiamen University, China · “Passed the BMDC exam in one attempt”.
9. **Pricing** — single card: ~~৳10,000~~ **৳8,000** offer, “Batch starts 1 December”, list of inclusions, CTA `Join the batch`.
10. **How to enroll — pay with bKash** (“Check out with bKash”):
    1. Create your free account (Sign up).
    2. Open bKash → **Send Money** → **01322654646** (Personal) → ৳8,000. Reference: your registered phone number.
    3. Send the **TrxID + screenshot** and your registered email to WhatsApp **01886688253** (button opens `wa.me/8801886688253` with a pre-filled message).
    4. We verify and unlock your account (target: within a few hours; state actual SLA once decided).
    Copy-to-clipboard buttons on both numbers.
11. **FAQ** — e.g. Can I study from abroad? Are classes recorded? Can I share my account? (No — one device per account.) What if I miss a live class? Is a pass guaranteed? (Honest: built to help you pass in one attempt, no guarantees.)
12. **Final CTA band** (film) — “We reserved a seat for you.” + `Join the batch`.
13. **Footer** (film deep) — logo, Facebook link, WhatsApp, quick links, © Project BMDC, Privacy / Terms links.

Non-functional: mobile-first, Lighthouse ≥ 90 (perf/accessibility/SEO), OG image + favicons from `LOGO/LOGO 2`, `prefers-reduced-motion` respected.

---

## 5. Authentication & accounts

| Requirement | Detail |
|---|---|
| Sign up with Google | Supabase Google OAuth (Google has verified the email). After first login, ask for **phone/WhatsApp** if missing (onboarding step). |
| Sign up with email | Name, email, password, **phone/WhatsApp (+880)**. **No email verification** (Supabase “Confirm email” turned OFF). User is signed in immediately. |
| Log in | Google or email + password. |
| Forgot password | Email reset link (Supabase), `/reset-password` page. |
| Log out | From profile/menu; also frees nothing (device stays bound, see below). |
| **One-device lock** | See §5.1. |

### 5.1 One-device restriction (anti-sharing)

- Each account is bound to **one device** (browser). The first successful login binds the device.
- Device identity = random `device_id` (UUID) generated on first visit, stored in a long-lived httpOnly cookie + localStorage, plus user-agent summary for the admin's reference.
- On every login and on every authenticated request (middleware), the server checks `devices.device_id` for the user:
  - none bound → bind this device;
  - matches → allow;
  - different → **block**: sign the session out and redirect to `/device-blocked`: “Your account is already active on another device. To switch devices, message us on WhatsApp: 01886688253.” (WhatsApp button pre-filled with their email.)
- Only the **admin** can reset the binding (Admin → Student → “Reset device”). After reset, the next device to log in becomes bound.
- Also enforce **single Supabase session**: on successful bind/login, revoke other refresh tokens (`signOut({ scope: 'others' })`).
- Known limitation (documented for support): clearing browser data / using incognito / switching browser counts as a new device → student must contact admin. The admin account is exempt.

---

## 6. Access model (free vs paid)

Generalised so the owner can change it later without code changes: every content item (recording, note, MCQ set) has an **`is_free_sample` toggle that the owner manages from the admin panel**. Nothing is free by default; the table below is the behaviour, not a fixed list of items.

| Feature | Free | Paid (not expired) |
|---|---|---|
| Free workshop (20 Nov) Meet link | ✅ | ✅ |
| Next live class link | ❌ (locked card: “Join the batch to get live class links”) | ✅ |
| Recorded classes | Items flagged *free sample* only | ✅ all |
| Notes | Items flagged *free sample* only | ✅ all |
| MCQ practice | Sets flagged *free sample* only | ✅ all |
| MCQ exams / model tests | Sets flagged *free sample* only | ✅ all |
| Profile & progress | ✅ (on what they’ve used) | ✅ |
| Leaderboard | View only | ✅ ranked |

Locked items are still **visible** with a lock icon and a “Join the batch — ৳8,000” upsell that opens the enroll/bKash instructions.

Live sessions have an **audience** field: `all` (e.g. workshop) or `paid` (normal classes). This is how free signups see the workshop link but not class links.

---

## 7. Part 2 — Student platform

Navigation (sidebar on desktop, bottom tab bar on mobile): **Dashboard · Classes · MCQ · Notes · Profile**.

### 7.1 Dashboard
- Greeting “Good evening, Dr. {first name}”.
- Status banner: Free → “You’re on a free account. Join the batch to unlock everything.” · Paid → “Access until {date}”. · Expired → renewal message.
- **Next live session card** (workshop or class, by audience) with date/time (Asia/Dhaka), countdown, `Join on Google Meet` (enabled from 15 min before start; link shown only to allowed audience).
- Continue watching (last recording), continue practising (last MCQ set), streak, quick stats (MCQs done, hours watched, last mock score).

### 7.2 Classes (“Live classes” section)
Two tabs:
1. **Next class** — the next upcoming live session (Google Meet link) + list of upcoming schedule.
2. **Recorded classes** — chapter-wise list (Subject → Chapter → recordings). Player page with resume position, mark complete, next/previous.
   - Video host: **Bunny Stream** — integrated **later**. Until then: recordings section ships with the data model and UI, showing “Recordings will appear here after each class.” Admin can still create recording entries.
   - Watch time tracking: heartbeat every 15 s while playing → `watch_progress` (used for “hours watched”).
   - Chapter list: from the curriculum (7 subjects, 39 chapters — see `content/curriculum.json`). Each recording is also tagged with its week/class (e.g. W1C2) so it can be listed in schedule order. The W6C3 “Derma + Rheumatology (Extra)” class sits under both chapters.

### 7.3 MCQ
Format: **RQE True/False only** — every question = stem + 4 statements (A–D), each True or False, each statement can have its own explanation, plus an optional “Exam pearl”.

Sections:
- **Previous-year questions (PYQ)** — one set per BMDC paper (e.g. “BMDC RQE — May 2025”), newest first. Every PYQ is **also tagged to a subject → chapter**, so it shows up in topic-wise practice too (“PYQs from Hepatology”).
- **Model tests** — full papers (default 100 Q / 100 min).
- **Topic-wise** — grouped by subject → chapter, using the curriculum (Medicine, General Surgery, Specialized Surgery, Basic Sciences, Pediatrics, Gynecology, Obstetrics).

Each set can be opened in two modes:

| | Practice | Exam |
|---|---|---|
| Timer | None | Countdown (duration from set; full mock = 100 min; shorter sets scaled ~1 min/question) |
| Feedback | **Immediately after each question**: correct answer per statement, ✓/✗, explanation per statement, exam pearl | **Only at the end** |
| Navigation | Next/previous | Question palette (answered / flagged / blank), **flag for review**, next/previous |
| Submit | Ends when finished | Manual submit (confirm dialog) or **auto-submit at 0:00** |
| Scoring | Running tally of correct statements | **RQE marking**: +0.25 / −0.06 / 0 per statement; total and percentage |
| After | Summary | Result page (score, correct/wrong/blank counts, time used, subject breakdown) → full review with explanations |

Exam answers are saved continuously (resume after refresh/network loss; timer is server-anchored to `started_at`). Answers and correctness are **never sent to the client during an exam** — scoring happens server-side on submit.

MCQ content upload: **not via admin panel**. The owner sends questions to Claude, who converts them into the repo’s JSON import format and runs the import script (see plan.md §MCQ import).

### 7.4 Notes
- Chapter-wise list of PDF notes.
- Viewed **only inside the platform** with an in-app PDF.js viewer: no download button, no print button, right-click disabled on the viewer, files stored in a **private** Supabase bucket and served via **short-lived signed URLs** (≈ 60 s) only to entitled users. No watermark (owner’s choice).
- Honest limitation: no web viewer can fully prevent screenshots; this deters casual downloading/sharing.

### 7.5 Profile & progress
- Personal info: name, email, phone (editable name/phone), account status, access end date, device bound (“This device”).
- Progress:
  - **Total MCQ statements/questions attempted**, accuracy %.
  - **Hours of recordings watched**.
  - **Subject-wise accuracy** (weak areas highlighted).
  - **Mock score history chart** (exam-mode scores over time).
  - **Study streak** (consecutive days with any activity, Asia/Dhaka days).
  - Notes opened, recordings completed.
- **Leaderboard**: model-test ranking (best score per student per model test + overall average). Shows “Dr. {first name} {last initial}.” only, never email/phone. Paid students only are ranked.

---

## 8. Part 3 — Admin panel (`/admin`, admin only)

| Area | Features |
|---|---|
| **Overview** | Counts: total signups, **free**, **paid (active)**, **expired**, signups today/this week, workshop registrations (= signups before workshop date), revenue (sum of approved payments). Simple signups-over-time chart. |
| **Students** | Searchable/filterable table (name, email, phone, status, joined, access end, last active). Student detail: **Mark as paid** (enter amount, bKash TrxID, access end date — default **1 May 2027** from settings, editable), extend/revoke access, **Reset device**, view progress summary, notes field. |
| **Payments** | Log of recorded payments (amount, TrxID, date, student). Manual entries only (no gateway). |
| **Live sessions** | Create/edit/delete: title, Google Meet URL, start time (Asia/Dhaka), duration, audience (`all` / `paid`). The workshop is just a session with audience `all`. |
| **Recordings** | Create/edit chapter-wise entries: subject, chapter, title, order, duration, free-sample flag, Bunny video ID (Bunny upload integration later). |
| **Notes** | Upload PDF (to private bucket), title, subject/chapter, order, free-sample flag; replace/delete. |
| **Subjects & chapters** | CRUD for the hierarchy used by recordings/notes/MCQs. |
| **Settings** | Course price & offer price, bKash number, WhatsApp number, batch start date, workshop date/time, free-tier limits, Facebook URL — feeds the landing page so copy updates without code. |

Not in admin (by decision): MCQ upload, MCQ explanations editing.

---

## 9. Non-functional requirements

- **Cost:** free tiers wherever possible — Supabase Free, Vercel Hobby, GitHub Free, Google OAuth (free). Bunny Stream (paid, pay-as-you-go) added later.
- **Security:** Supabase Row Level Security on every table; entitlement checks server-side; admin routes guarded in middleware + RLS; private storage buckets; no secrets in client.
- **Performance:** works on slow mobile data; SSR/ISR for landing; lazy-load heavy parts (PDF viewer, charts).
- **Accessibility:** WCAG AA contrast pairs from the brand kit; keyboard-navigable exam UI; reduced-motion support.
- **Timezone:** all schedules displayed in Asia/Dhaka.
- **Languages:** English UI with Bangla support lines (Hind Siliguri, `lang="bn"`).
- **Browsers:** latest Chrome/Edge/Safari/Firefox, Android Chrome, iOS Safari.

---

## 10. Out of scope (v1)

Automated payment gateway · native mobile apps · multiple courses/batches · PDF watermarking · discussion forum/chat · certificates · email marketing · admin MCQ editor · Bunny Stream integration (planned for a later phase).

---

## 11. Open questions / pending inputs

1. ~~Chapter list~~ — done (`content/curriculum.json`).
2. MCQ content — 10 sample PYQs with explanations done (`content/mcq/pyq-2025-may.json`); the rest of `BMDCPQ.pdf` is imported after the website is built.
3. Workshop Google Meet link (time is set: 20 Nov, 11:00 PM BD).
4. ~~Access length~~ — 1 May 2027.
5. ~~Free samples~~ — owner toggles them in admin.
6. Domain name.
7. Payment verification SLA wording (“within X hours”).
8. Vercel Hobby plan is officially for non-commercial use — may need Vercel Pro once revenue starts (see plan.md risks).

# Project BMDC — Design System & UI Spec

> Version 1.0 · 2026-11-08
> **Brand source of truth:** `LOGO/LOGO 2/PROJECT-BMDC-LOGO-2-WEBSITE-KIT.md` (Logo 2 · “Four B's”). Logo 1 is **not** used anywhere.
> This file explains how that kit applies to the landing page, student platform and admin panel. If anything here conflicts with the kit, the kit wins.
> Visual reference: the social posts in `SOCIAL/` (especially `POST-02…/slide-02.png` and `POST-01…/slide-06.png`, which show the MCQ and mock-exam screens).

---

## 1. Principles

1. **Dark-first, film look.** Rich Black / Dark Green surfaces, film-gradient + grain on heroes, banners and CTAs, and bright green only for highlights.
2. **Calm & premium.** Plenty of space, no clutter, no shouting. One accent word per headline in Caribbean Green.
3. **Mobile-first, always.** Most students study on their phones. Every screen is designed at **360 px first**, then scaled up. Nothing should feel like a desktop page squeezed onto a phone (see §4).
4. **Exam-accurate.** The MCQ/exam UI mirrors the real RQE format (T/F × 4) and the screens in our posts.
5. **Accessible.** Use only the WCAG AA pairs from the kit, keyboard support everywhere, and respect reduced motion.

---

## 2. Tokens (from the brand kit)

### Colour
| Token | Hex | Use |
|---|---|---|
| `b2-black` Rich Black | `#021A17` | Page background, text on light |
| `b2-dark` Dark Green | `#032221` | Cards, nav, sidebars, inputs |
| `b2-bd` Bangladesh Green | `#03624C` | Gradient base, secondary fills |
| `b2-meadow` Mountain Meadow | `#2CC295` | Links, icons, secondary button border |
| `b2-caribbean` Caribbean Green | `#00DF81` | Primary buttons, key highlights, success, “True”/correct |
| `b2-flash` Anti-Flash White | `#F1F7F6` | Text on dark, light reading surfaces |
| Secondary | Pine `#06302B` · Basil `#0B453A` · Forest `#095544` · Frog `#17876D` · Mint `#2FA98C` · Stone `#707D7D` · Pistachio `#AACBC4` | Pistachio = muted text on dark; Basil = disabled bg; Stone = large labels/disabled text only |
| UI status | Card border `#13302B` · Divider `#1C3A35` · Error `#FF5A5F` · Warning `#F5B83D` · Muted on light `#3F5652` | Status only, never decoration |

Balance: Black/Dark ~60% · film ~20% · Flash ~12% · Caribbean/Meadow ~8%.

### Type
- **Outfit** 300–700 (UI + headings), **Anek Bangla** 400/500/600 for Bangla (`lang="bn"`). Load both via `next/font/google`. *(Changed from the brand kit's Hind Siliguri on 2026-11-08: Hind Siliguri renders the ন্স conjunct in "লাইসেন্স" incorrectly.)*
- Display 72/42 px (desktop/mobile), H2 44/30, H3 22/20, body 16–18 (line-height 1.6), eyebrow 13 px uppercase in Caribbean with 0.16em tracking.
- Numbers in timers/scores use `font-variant-numeric: tabular-nums`.

### Layout
- Spacing: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96.
- Radius: 10 (inputs, chips) · 20 (cards) · 32 (large panels) · 999 (buttons, pills).
- Shadow: none, or a green glow `0 12px 40px rgba(0,223,129,.10)`.
- Max width 1200 px; text blocks 680 px.
- Section padding: 96 px desktop / 64 px mobile; **16 px side gutter at ≤ 400 px**, 24 px up to 900 px.

### Implementation
- Tailwind with the `b2` colour extension from the kit, plus the kit's global CSS (§4 of the kit) pasted into `app/globals.css` unchanged.
- `<B2Defs/>` goes once in the root layout. `<B2Mark/>` and `<B2Logo/>` come from kit §5d.
- `<body class="b2-grain-page">` on every page.
- Icons: Lucide, 1.75 px stroke, Meadow colour.

---

## 3. Components

| Component | Spec |
|---|---|
| **Button / primary** | Caribbean bg, Rich Black text, 600 weight, pill, `14px 28px`. Hover Meadow; pressed Frog with Flash text. **Min height 48 px on mobile.** |
| **Button / secondary** | Transparent, `1px solid` Meadow, Meadow text. |
| **Button / disabled** | Basil bg, Stone text. |
| **Card** | Dark Green, `1px solid #13302B`, radius 20, padding 20 (mobile) / 24. |
| **Film panel** | `.b2-film` / `.spring` / `.deep` from the kit, radius 32 on large panels. |
| **Input** | `.b2-input` + `.b2-label` from the kit. Phone input has a fixed `+880` prefix and `type="tel"` / `inputmode="tel"`. **Font size 16 px minimum**, so iOS doesn't zoom in on focus. |
| **Chip / pill** | Radius 999, Dark Green with Meadow text; active state is Caribbean with Black text. |
| **Lock overlay** | Content card dimmed to 60% with a lock icon and the line “Join the batch to unlock”, which opens the Enroll sheet. |
| **Enroll sheet** | Bottom sheet on mobile, modal on desktop. Shows the price (~~৳10,000~~ **৳8,000**), the bKash Send Money steps, a copy button for **01322654646**, and a WhatsApp button that opens `wa.me/8801886688253` with a pre-filled message containing the student's email. |
| **Loader** | Every spinner is replaced by the `B2Mark` with the `is-loading` class. Skeletons use Dark Green → Pine shimmer, and the shimmer stops under reduced motion. |
| **Toast** | Dark Green card, coloured left border (success Caribbean / error `#FF5A5F` / warning `#F5B83D`), copy in the kit's voice. |
| **Countdown** | Tabular numerals in boxes for days/hours/min/sec. Used for the workshop, the next class and the exam timer. |
| **Empty state** | `B2Mark` with `is-wave`, one calm sentence and one CTA. Example: “No tests yet. Your first mock unlocks on Saturday.” |
| **Avatar (instructor)** | No photos. A circle on `.b2-film.spring` with initials (NA / O) in Outfit 600, and a small mark badge. |

---

## 4. Mobile, stickiness & responsiveness (hard requirement)

The phone is the **primary** device. Every page must pass these rules.

### 4.1 Breakpoints
`< 640` phone · `640–899` large phone / small tablet · `900–1199` tablet / small laptop · `≥ 1200` desktop. Build mobile styles first and add `sm: md: lg:` on top.

### 4.2 Sticky elements
| Where | Sticky behaviour |
|---|---|
| **Landing header** | `position: sticky; top: 0`. Transparent over the hero, then turns solid Dark Green (90% opacity + backdrop blur) once the hero scrolls past. On mobile: one-line logo on the left, `Join` button and hamburger on the right. The hamburger opens a full-screen film-deep menu. |
| **Workshop bar** | A slim strip that stays attached under the sticky header until 20 Nov. It can be dismissed (remembered per browser). |
| **Landing mobile CTA** | A **sticky bottom bar** on phones (it appears after the hero): “৳8,000 · Join the batch” plus a WhatsApp icon button. It uses safe-area padding (`env(safe-area-inset-bottom)`) and hides while the pricing section is on screen. |
| **Student app – mobile** | **Bottom tab bar** fixed to the bottom with 5 tabs (Dashboard, Classes, MCQ, Notes, Profile), icon + label, 56 px tall + safe area. A compact top bar is sticky and shows the page title + streak. |
| **Student app – desktop** | Left sidebar (240 px) that stays fixed. The content area scrolls by itself. |
| **Exam screen** | The **top bar is sticky**: set name, a **countdown timer** that is always visible, a progress bar and the question number. The **bottom action bar is sticky**: Prev · Flag · Next/Submit. The question palette opens as a bottom sheet on mobile and is a sticky right column on desktop. |
| **Practice screen** | The sticky bottom bar holds “Check answer” first and then “Next”. The explanation panel scrolls into view smoothly once the answer is checked. |
| **Notes viewer** | Sticky top toolbar: back, title, page x / y, zoom − / +. Pinch-zoom works on mobile, and the PDF fits the screen width by default. |
| **Video player** | Sticky to the top on mobile while the chapter list scrolls underneath. |
| **Admin** | Sticky table header and sticky page action bar. On mobile, the sidebar collapses into a drawer. |

### 4.3 Responsive rules
- **No horizontal scroll**, ever, at 360 px. Wide tables (admin) become stacked cards on phones.
- Tap targets are at least **44 × 44 px**, with 8 px between them. T/F radio buttons in the MCQ UI are 44 px hit areas.
- Use `100dvh` (not `100vh`) for full-height layouts, so the mobile browser bars don't cut anything off.
- Respect safe areas (`viewport-fit=cover` plus `env(safe-area-inset-*)`) on fixed bars.
- Headline sizes use `clamp()`. Body text stays at 16 px or more on mobile.
- Grids: 1 column on phones → 2 at `sm`/`md` → 3–4 at `lg`.
- Images and video are fluid with fixed aspect ratios, so the layout doesn't jump while loading.
- Forms are single-column on mobile, use the correct `inputmode` / `autocomplete`, and keep the submit button reachable above the keyboard.
- Test on Chrome device emulation (360×740, 390×844, 412×915) plus a real Android and iPhone before every milestone.

---

## 5. Landing page layout (see PRD §4)

```
[Sticky header ─ logo · links · Log in · Join the batch]
[Workshop bar ─ FREE workshop · 20 Nov · Register free →]
┌ HERO (.b2-film) ─ is-intro mark · eyebrow · H1 “Your gateway to BMDC licence.”
│  বিদেশে MBBS, দেশে লাইসেন্স। · CTAs · stat chips
├ FREE WORKSHOP (.b2-film.spring, the most eye-catching block)
│  big “FREE” badge · 20 NOVEMBER 2026 · live countdown · 3 bullets · instructors
│  · CTA “Sign up free & get the workshop link” · is-heartbeat mark
├ COURSE DETAILS (cards grid, 6 items) + chapter outline (placeholder)
├ HOW THE RQE IS MARKED (4 stat tiles + worked example)
├ PLATFORM PREVIEW (phone mock of the answer + explanation screen)
├ INSTRUCTORS (2 monogram cards)
├ PRICING (single card, ~~10,000~~ 8,000, batch starts 1 Dec)
├ HOW TO ENROLL ─ bKash steps 1-2-3-4 with copy buttons + WhatsApp button
├ FAQ (accordion)
├ FINAL CTA (.b2-film) “We reserved a seat for you.”
└ FOOTER (.b2-film.deep) logo · Facebook · WhatsApp · links
[Mobile only: sticky bottom CTA bar]
```

**The workshop section must stand out:** it has the strongest film-spring gradient on the page, a large outline “FREE” word (Outfit 700, around 120 px desktop / 64 px mobile) in Caribbean, a pulsing live dot next to “Registration open”, and countdown boxes with a green glow. On mobile it sits directly under the hero and has a full-width CTA. After the workshop date it switches automatically to the “Missed it? Batch starts 1 December” version.

---

## 6. Auth pages

A split layout on desktop: a film panel on the left (vertical logo, tagline, Bangla line) and the form card on the right. On mobile it's a single column with a compact film header and the form below.
- “Continue with Google” is a white button with the Google “G” logo, placed above the divider “or with email”.
- Signup fields: Full name · Email · Phone/WhatsApp (+880) · Password (with show/hide).
- `/device-blocked`: a centred card with the `is-heartbeat` mark, the text “Your account is active on another device.”, a WhatsApp button and a Log out link.

---

## 7. Student platform screens

### Dashboard
Mobile order: greeting → status banner → **next live session card** (film-spring, countdown, `Join on Google Meet`) → continue watching → continue practising → stats row (MCQs · hours · streak · last mock). On desktop this becomes a 2-column grid.

### Classes
Tabs at the top (sticky): **Next class** | **Recorded**. Recorded classes are an accordion by Subject → Chapter, with each row showing a thumbnail, title, duration, progress bar and lock if needed. Until Bunny is connected, the empty state reads: “Recordings will appear here after each class.”

### MCQ
- Hub: 3 large cards — **Previous-year questions**, **Model tests**, **Topic-wise** — then a list of sets grouped by year / test / subject → chapter. Each set row shows the question count, best score and buttons `Practice` | `Exam`.
- **Question card** (matches the post mockups): a source line (“Previous year · Pharmacology”), “Question 30”, the stem in Outfit 500, then **T and F column headers** and 4 statement rows A–D, each with a T radio and an F radio (44 px targets). Tapping the selected option again clears it (leaves it blank).
- **Practice feedback:** each row gets ✓ (Caribbean) or ✗ (`#FF5A5F`) on the right. A wrong row is tinted, and the correct choice gets a dashed ring. A “2 / 4 correct” pill appears top right. The **Explanation panel** follows, with a T/F tag per statement, a bold term, the explanation, “You marked F” in red where wrong, and an **Exam pearl** separated by a dashed divider.
- **Exam mode:** the sticky timer pill turns Warning colour under 10 min and Error colour under 2 min. Rows are Answered/Flagged/Blank. The palette is a grid of numbers (answered = Caribbean fill, flagged = Warning ring, blank = outline). Submitting asks for confirmation and shows the count of blank items.
- **Result:** a large score “72.38 / 100”, percentage, correct/wrong/blank chips, time used, subject breakdown bars, then `Review answers` (the same review UI as practice) and `Back to MCQ`.

### Notes
A chapter-wise list (subject accordion → chapter → note cards with a page count). The viewer is full-screen with a sticky toolbar. On light-mode reading, pages render on a Flash surface. There are no download or print controls.

### Profile
Header card: name, email, phone, status pill (Free / Paid until … / Expired), and the bound device. Stat tiles: MCQs done, accuracy, hours watched, streak. Sections: **Subject-wise accuracy** (horizontal bars, weakest first), **Mock score history** (line chart in Caribbean on Dark Green with a Divider-colour grid), **Leaderboard** (top 20 plus the student's own rank row pinned).

---

## 8. Admin panel
Same brand, denser layout. Desktop has a sidebar (Overview · Students · Payments · Live sessions · Recordings · Notes · Subjects · Settings). Overview shows stat tiles (Total · Free · Paid · Expired · Signups this week · Revenue) and a signups chart. Tables have sticky headers, search and filters, and turn into cards on mobile. Destructive actions (reset device, revoke access, delete) use a confirm dialog with an Error-coloured button.

---

## 9. Motion
Use only the kit's classes: `is-intro` (hero + header on load), `is-loading` (all loaders), `is-wave` (empty states), `is-heartbeat` (workshop + CTA blocks), `.b2-hover` (logo), `is-scroll` (a large decorative hero mark). UI transitions are 150–250 ms ease-out. Everything turns off under `prefers-reduced-motion`.

---

## 10. Copy rules (from the kit)
Calm, peer-to-peer (“Dr.”), honest. Never write “guaranteed”, “100%”, ALL CAPS or “!!!”. Preferred CTAs: “Join the batch”, “Start free mock test”, “Register for the free workshop”. Error message: “That didn't go through. Check your connection and try again.” Always write the name as “Project BMDC”.

---

## 11. Light theme (added 2026-11-08)

Two themes share every component. `<html data-theme="dark|light">` is set before first paint by `src/lib/theme.ts`; visitors switch with the sun/moon button (landing header, app top bar, sidebar, login pages). The choice is remembered per browser. **The site default is one line: `DEFAULT_THEME` in `src/lib/theme.ts`.**

| Token role | Dark | Light |
|---|---|---|
| Page (`b2-black`) | `#021A17` | `#FFFFFF` |
| Cards / nav (`b2-dark`) | `#032221` | `#F4F8F7` |
| Main text (`b2-flash`) | `#F1F7F6` | `#021A17` |
| Muted text (`b2-pistachio`) | `#AACBC4` | `#3F5652` |
| Links / icons (`b2-meadow`) | `#2CC295` | `#03624C` (Bangladesh Green, for contrast on white) |
| Borders / dividers | `#13302B` / `#1C3A35` | `#D6E3DF` / `#E3ECE9` |
| Highlight text (eyebrows, `em.hl`) | Caribbean `#00DF81` | `#03624C` |
| Buttons, pills, progress | Caribbean fill + ink text | unchanged |

**Film panels stay dark in both themes** (hero, workshop, live-class cards, enroll sheet, footer, login side panel): `.b2-film` restores the dark tokens inside itself, so the brand's grainy green look is kept as accent blocks on the white page. In light mode the landing header is always a solid white bar. Text on Caribbean fills always uses `text-b2-ink` (constant `#021A17`).

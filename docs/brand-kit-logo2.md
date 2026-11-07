# Project BMDC — Website Brand Kit (Logo 2 · “Four B's”)

> **For the AI website builder:** this file is the single source of truth for the Project BMDC Logo 2 brand.
> Copy every code block exactly. Do not redraw, recolour or re-letter the logo.
> Use the **film backgrounds** (gradient + grain) from section 4 for heroes, banners and feature sections, so the whole site keeps the grainy, film-like green look.
> Animate the symbol only with the classes in section 7.

Project BMDC is a 4-month prep course that helps doctors who completed their MBBS outside Bangladesh pass the BMDC licensing exam and get licensed to practise at home.
**The symbol:** four letter **B**'s, each lying on its side with two rounded bowls, turn around a glowing core with a **medical cross** cut out of it. **Mood:** dark greens, glowing spring green and film grain. Calm, premium, modern.

---

## 0. Brand identity

**Name:** Project BMDC (always written "Project BMDC": capital P, BMDC in capitals).
**What we do:** a 4-month course for foreign medical graduates (Bangladeshi doctors who did their MBBS abroad) to pass the BMDC licensing exam, ideally in one attempt. Every instructor has passed the BMDC licensing exam (RQE) themselves. Say "passed the BMDC exam", never "licence holder". We cover every topic clearly, plus all previous question papers, MCQ banks and MCQ tests. On our website, students get every class recorded, MCQ practice and real timed mock exams.
**Mission:** get every doctor who trained abroad licensed at home: clearly, calmly and in one attempt.
**Audience:** Bangladeshi doctors (roughly 23–30) who finished their MBBS abroad (e.g. China, Russia, India, Nepal, Ukraine, Kyrgyzstan) and need the BMDC licence to practise or do an internship in Bangladesh. They are busy, sometimes still abroad, under family pressure and anxious about failing. They study on mobile and laptop, in English and Bangla.
**Positioning:** the focused licensing-exam course taught by people who passed it. Structured, exam-accurate, online-first.
**Positioning:** the modern, focused prep brand. Less noise than traditional coaching centres, with more structure, data and support.

**Brand personality (use these as design and copy filters):**
| We are | We are not |
|---|---|
| Calm & confident | Loud, panicky, “last chance!!!” |
| Smart & precise | Vague, generic, clip-art medical |
| Supportive, like a senior who already made it | Preachy or scary |
| Modern & premium | Cheap, cluttered, over-discounted |

**Symbol meaning (for the About page):** four letter B's turn around one centre, the way doctors keep revising and moving towards one goal. A medical cross is cut into the glowing core: the BMDC licence that lets them practise at home.

**Tagline (main, already used on Facebook):** “Your gateway to BMDC licence.”
**Supporting lines:**
- “We reserved a seat for you.” (campaign line)
- “Taught by doctors who've already passed it.”
- Bangla: “বিদেশে MBBS, দেশে লাইসেন্স।” (*MBBS abroad, licence at home.*)

### Voice & tone
- **Clear:** short sentences and concrete numbers (“4-month course”, “full timed mock exams”). No fluff.
- **Peer to peer:** we speak to qualified doctors as colleagues (“Dr.”, “you've already done the hard part”), never like school kids.
- **Encouraging, not scary:** “You have 4 months. Here's the plan.” Never “Most people fail this exam.”
- **Bilingual by nature:** English headlines with a Bangla line underneath, or the other way round. Write Bangla properly in Hind Siliguri, never as Banglish in Latin letters.
- **Honest:** say “built to help you pass in one attempt”, never “guaranteed pass”. Don't invent pass rates. Show real results only.
- **Words we like:** licence, one attempt, plan, focus, practice, mock exam, previous papers, mentor, seat.
- **Avoid:** guaranteed, 100%, crash-and-burn, ALL CAPS shouting, too many exclamation marks.

| Situation | Write like this |
|---|---|
| CTA button | “Join the batch”, “Start free mock test”, “See the routine” |
| Empty state | “No tests yet. Your first mock unlocks on Saturday.” |
| Error | “That didn't go through. Check your connection and try again.” |
| Success | “Submitted. Your score will be ready in 5 minutes.” |

---

## 1. Rules (read first)

1. Site mood is **dark-first**: Rich Black / Dark Green backgrounds, light text, and bright greens only as highlights.
2. Hero, banners, CTAs and feature blocks use a **film background** (`.b2-film`, `.b2-film.spring`, `.b2-film.deep`). Never use flat, grain-free green blocks for big areas.
3. Add the subtle **page-wide grain** (`<body class="b2-grain-page">`) so every page has the film texture.
4. The logo goes on Rich Black, a film background, or Anti-Flash White. Don't put it on Mountain Meadow or Caribbean Green (too little contrast).
5. Symbol size: 48 px or bigger uses the grainy mark. Below 48 px (favicons, tiny badges), use the flat version (remove `filter="url(#b2-grain)"`).
6. Wordmark: “Project” in Outfit 400 over “BMDC” in Outfit 600, letter-spacing -0.02em, line-height 0.92.
7. Don't stretch, outline, add drop shadows to, or recolour the logo. Rotate it only through the animations below.
8. All motion respects `prefers-reduced-motion` (built in).
9. **Clear space:** keep empty space around the logo at least 1/3 of the symbol's width on every side. Nothing (text, edges, other logos) goes inside it.
10. **Minimum sizes:** symbol 24 px (flat version), full horizontal logo 120 px wide.

---

## 2. Colour tokens

### Primary
| Name | HEX | RGB | Use |
|---|---|---|---|
| Rich Black | `#021A17` | 2 26 23 | Main page background, text on light |
| Dark Green | `#032221` | 3 34 33 | Cards, nav bar, alternate sections |
| Bangladesh Green | `#03624C` | 3 98 76 | Gradient base, secondary buttons |
| Mountain Meadow | `#2CC295` | 44 194 149 | Links, icons, highlights |
| Caribbean Green | `#00DF81` | 0 223 129 | Primary buttons, key highlights, logo core |
| Anti-Flash White | `#F1F7F6` | 241 247 246 | Text on dark, light sections |

### Secondary
Pine `#06302B` · Basil `#0B453A` · Forest `#095544` · Frog `#17876D` · Mint `#2FA98C` · Stone `#707D7D` (borders, disabled states, large labels only) · Pistachio `#AACBC4` (muted text on dark)

**Extra UI colours** (not brand colours; use only for status):
Muted text on light `#3F5652` · Card border on dark `#13302B` · Divider on dark `#1C3A35` · Error `#FF5A5F` · Warning `#F5B83D` · Success = Caribbean `#00DF81`

### Accessible colour pairs (WCAG AA)
| Text | Background | Contrast | OK for |
|---|---|---|---|
| Anti-Flash White `#F1F7F6` | Rich Black `#021A17` | ~17:1 | All text |
| Pistachio `#AACBC4` | Rich Black `#021A17` | ~10:1 | Body / muted text |
| Caribbean `#00DF81` | Rich Black `#021A17` | ~10:1 | Links, highlights |
| Mountain Meadow `#2CC295` | Rich Black `#021A17` | ~8:1 | Links, icons |
| Rich Black `#021A17` | Caribbean `#00DF81` | ~10:1 | Primary button text |
| Rich Black `#021A17` | Anti-Flash White `#F1F7F6` | ~17:1 | Text on light sections |
| `#3F5652` | Anti-Flash White `#F1F7F6` | ~7:1 | Muted text on light |
| Stone `#707D7D` | Anti-Flash White `#F1F7F6` | ~3.9:1 | **Large text (24 px+) only, never body text** |

On film backgrounds, keep text Anti-Flash White and place it over the darker part of the gradient.

**Balance:** Rich Black / Dark Green about 60% · film gradients 20% · Anti-Flash White 12% · Caribbean + Meadow highlights 8%.

### Tailwind (if used)
```js
// tailwind.config.js → theme.extend
colors: {
  b2: {
    black:'#021A17', dark:'#032221', bd:'#03624C', meadow:'#2CC295', caribbean:'#00DF81', flash:'#F1F7F6',
    pine:'#06302B', basil:'#0B453A', forest:'#095544', frog:'#17876D', mint:'#2FA98C', stone:'#707D7D', pistachio:'#AACBC4'
  }
},
fontFamily: { sans: ['Outfit','system-ui','sans-serif'], bangla: ['"Hind Siliguri"','sans-serif'] },
borderRadius: { card: '20px', pill: '999px' },
```
With Tailwind, still paste the CSS in section 4 and use the `.b2-film` classes for the grain.

---

## 3. Typography

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
```

| Role | Font / weight | Size (desktop / mobile) | Letter-spacing |
|---|---|---|---|
| Display / hero | Outfit 600 | 72 / 42 px, line-height 1.02 | -0.03em |
| H2 | Outfit 600 | 44 / 30 px | -0.03em |
| H3 | Outfit 500 | 22 / 20 px | -0.01em |
| Body | Outfit 400 | 16–18 px, line-height 1.6 | 0 |
| Eyebrow label | Outfit 500, UPPERCASE, Caribbean | 13 px | 0.16em |
| Bangla text | Hind Siliguri 400/600/700 | match English | 0 |

Highlight one key word in headlines with Caribbean Green (`<em>` styled `color:#00DF81;font-style:normal`), as in “Your gateway to **BMDC licence.**”

---

## 4. Global CSS: logo, film backgrounds, motion (paste once)

```css
/* ===== PROJECT BMDC LOGO 2 — TOKENS ===== */
:root{
  --b2-rich-black:#021A17; --b2-dark-green:#032221; --b2-bd-green:#03624C; --b2-meadow:#2CC295;
  --b2-caribbean:#00DF81; --b2-flash:#F1F7F6; --b2-pine:#06302B; --b2-basil:#0B453A; --b2-forest:#095544;
  --b2-frog:#17876D; --b2-mint:#2FA98C; --b2-stone:#707D7D; --b2-pistachio:#AACBC4;
}

/* ===== FILM BACKGROUNDS — gradient + grain, exactly as in the brand previews ===== */
:root{
  --b2-grain:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  --b2-bg-hero:
    radial-gradient(70% 90% at 18% 110%,#00DF81 0%,rgba(0,223,129,0) 60%),
    radial-gradient(60% 70% at 85% -10%,#2CC295 0%,rgba(44,194,149,0) 55%),
    linear-gradient(135deg,#03624C 0%,#032221 55%,#021A17 100%);
  --b2-bg-spring:
    radial-gradient(80% 120% at 0% 0%,#00DF81 0%,rgba(0,223,129,0) 60%),
    linear-gradient(120deg,#2CC295 0%,#17876D 45%,#032221 100%);
  --b2-bg-deep:
    radial-gradient(60% 80% at 80% 100%,#17876D 0%,rgba(23,135,109,0) 70%),
    linear-gradient(160deg,#095544,#021A17 70%);
}
.b2-film{position:relative;overflow:hidden;isolation:isolate;background-image:var(--b2-bg-hero);background-color:#021A17}
.b2-film.spring{background-image:var(--b2-bg-spring)}
.b2-film.deep{background-image:var(--b2-bg-deep)}
.b2-film::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;
  background-image:var(--b2-grain);mix-blend-mode:overlay;opacity:.55}
.b2-film > *{position:relative;z-index:1}
/* page-wide film grain over the whole site (subtle) */
body.b2-grain-page::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:9998;
  background-image:var(--b2-grain);mix-blend-mode:overlay;opacity:.18}

/* ===== LOGO ===== */
.b2-mark{display:block;width:56px;height:56px;overflow:visible;flex:none;transform-origin:50% 50%}
.b2-mark .b2-piece,.b2-mark .b2-core{transform-box:view-box;transform-origin:60px 60px}
.b2-logo{display:inline-flex;align-items:center;gap:.4em;font-family:"Outfit",system-ui,sans-serif;font-size:24px;font-weight:600;
  letter-spacing:-.02em;line-height:.92;color:var(--b2-rich-black);text-decoration:none;white-space:nowrap}
.b2-logo .b2-mark{width:2.1em;height:2.1em}
.b2-logo .b2-wm{display:flex;flex-direction:column}
.b2-logo .b2-wm span:first-child{font-weight:400}
.b2-logo.light{color:var(--b2-flash)}
.b2-logo.wide{gap:.35em;line-height:1}.b2-logo.wide .b2-mark{width:1.35em;height:1.35em}.b2-logo.wide .b2-wm{flex-direction:row;gap:.24em}
.b2-logo.vertical{flex-direction:column;gap:.45em;text-align:center}.b2-logo.vertical .b2-mark{width:3em;height:3em}.b2-logo.vertical .b2-wm{align-items:center}

/* ===== MOTION ===== */
/* 1) INTRO — the four B's slide in from outside, then the cross core spins in */
@keyframes b2-piece-in{from{transform:translateY(-36px);opacity:0}to{transform:none;opacity:1}}
@keyframes b2-core-in{0%{transform:scale(0) rotate(-90deg)}70%{transform:scale(1.12) rotate(0)}100%{transform:none}}
.b2-mark.is-intro .b2-piece{animation:b2-piece-in .8s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i) * 110ms)}
.b2-mark.is-intro .b2-core{animation:b2-core-in .6s cubic-bezier(.3,1.3,.5,1) .55s both}
/* 2) LOADER — quarter turns with a pause */
@keyframes b2-spin{0%{transform:rotate(0)}20%,25%{transform:rotate(90deg)}45%,50%{transform:rotate(180deg)}70%,75%{transform:rotate(270deg)}95%,100%{transform:rotate(360deg)}}
.b2-mark.is-loading{animation:b2-spin 2.4s cubic-bezier(.65,0,.35,1) infinite}
/* 3) WAVE — each B pushes out and back in turn */
@keyframes b2-wave{0%,60%,100%{transform:none}25%{transform:translateY(-7px)}}
.b2-mark.is-wave .b2-piece{animation:b2-wave 2.2s ease-in-out infinite;animation-delay:calc(var(--i) * 180ms)}
/* 4) HEARTBEAT — the cross core double-pulses */
@keyframes b2-beat{0%,100%{transform:scale(1)}10%{transform:scale(1.14)}20%{transform:scale(1)}30%{transform:scale(1.08)}40%{transform:scale(1)}}
.b2-mark.is-heartbeat .b2-core{animation:b2-beat 2.2s ease-in-out infinite}
/* 5) HOVER — B's open outward, the cross turns a quarter */
.b2-hover .b2-piece,.b2-hover .b2-core{transition:transform .5s cubic-bezier(.3,1.4,.5,1)}
.b2-hover:hover .b2-piece,.b2-hover:focus-visible .b2-piece{transform:translateY(-5px)}
.b2-hover:hover .b2-core,.b2-hover:focus-visible .b2-core{transform:rotate(90deg)}
/* 6) SCROLL — rotation driven by --b2-scroll */
.b2-mark.is-scroll{transform:rotate(calc(var(--b2-scroll,0) * 1deg))}

@media (prefers-reduced-motion:reduce){
  .b2-mark,.b2-mark *{animation:none!important;transition:none!important}
  .b2-mark.is-scroll{transform:none}
}
```

---

## 5. Logo markup

### 5a. Defs sprite: paste ONCE, right after `<body>`

Every Logo 2 mark on the page reuses these gradients, the grain filter and the B shape.
**Don't** hide this SVG with `display:none` (that breaks the gradients). Keep the zero-size style shown.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="b2-piece-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="78" y2="38">
      <stop offset="0" stop-color="#2CC295"/><stop offset=".6" stop-color="#17876D"/><stop offset="1" stop-color="#095544"/>
    </linearGradient>
    <linearGradient id="b2-core-grad" gradientUnits="userSpaceOnUse" x1="41" y1="41" x2="79" y2="79">
      <stop offset="0" stop-color="#7CF5BE"/><stop offset=".5" stop-color="#00DF81"/><stop offset="1" stop-color="#2CC295"/>
    </linearGradient>
    <filter id="b2-grain" x="-35%" y="-35%" width="170%" height="170%">
      <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" stitchTiles="stitch" result="noise">
        <!-- live film flicker: delete this <animate> line for static grain -->
        <animate attributeName="seed" values="1;2;3;4;5;6" dur=".6s" repeatCount="indefinite" calcMode="discrete"/>
      </feTurbulence>
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.25" result="specks"/>
      <feComposite in="specks" in2="SourceGraphic" operator="in" result="grain"/>
      <feBlend in="grain" in2="SourceGraphic" mode="soft-light"/>
    </filter>
    <path id="b2-b" d="M0 38.5V18Q0 0 18 0H21Q39 0 39 17Q39 0 57 0H60.5Q78.5 0 78.5 18V38.5Z"/>
  </defs>
</svg>
```

### 5b. The symbol (inline it wherever the mark appears)

```html
<svg class="b2-mark" viewBox="0 0 120 120" role="img" aria-label="Project BMDC">
  <g filter="url(#b2-grain)">
    <g transform="rotate(0 60 60)"><g class="b2-piece" style="--i:0"><use href="#b2-b" fill="url(#b2-piece-grad)"/></g></g>
    <g transform="rotate(90 60 60)"><g class="b2-piece" style="--i:1"><use href="#b2-b" fill="url(#b2-piece-grad)"/></g></g>
    <g transform="rotate(180 60 60)"><g class="b2-piece" style="--i:2"><use href="#b2-b" fill="url(#b2-piece-grad)"/></g></g>
    <g transform="rotate(270 60 60)"><g class="b2-piece" style="--i:3"><use href="#b2-b" fill="url(#b2-piece-grad)"/></g></g>
    <g class="b2-core"><path fill="url(#b2-core-grad)" fill-rule="evenodd" d="M45.5 41.5H74.5Q78.5 41.5 78.5 45.5V74.5Q78.5 78.5 74.5 78.5H45.5Q41.5 78.5 41.5 74.5V45.5Q41.5 41.5 45.5 41.5ZM54.5 47H65.5V54.5H73V65.5H65.5V73H54.5V65.5H47V54.5H54.5Z"/></g>
  </g>
</svg>
```
- **Flat (no grain), for small sizes:** remove `filter="url(#b2-grain)"`.
- **White one-colour:** replace both fills with `#F1F7F6`, and add `fill-opacity=".5"` on the four `<use>` elements.
- **Black one-colour:** the same, but with `#021A17` and `fill-opacity=".55"`.
- **Motion:** add `is-intro`, `is-loading`, `is-wave`, `is-heartbeat` or `is-scroll` to the `<svg>` class.

### 5c. Header logo (horizontal: mark + two-line wordmark)
```html
<a href="/" class="b2-logo b2-hover light" aria-label="Project BMDC home">
  <!-- symbol from 5b, with aria-hidden="true" instead of role/aria-label -->
  <span class="b2-wm"><span>Project</span><span>BMDC</span></span>
</a>
```
Drop `light` on light backgrounds. For narrow mobile headers use `class="b2-logo wide light"`, and for square/hero spaces `class="b2-logo vertical light"`.

### 5d. React / Next.js
```jsx
// B2Mark.jsx — put <B2Defs /> once in your root layout
export function B2Defs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="b2-piece-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="78" y2="38">
          <stop offset="0" stopColor="#2CC295" /><stop offset=".6" stopColor="#17876D" /><stop offset="1" stopColor="#095544" />
        </linearGradient>
        <linearGradient id="b2-core-grad" gradientUnits="userSpaceOnUse" x1="41" y1="41" x2="79" y2="79">
          <stop offset="0" stopColor="#7CF5BE" /><stop offset=".5" stopColor="#00DF81" /><stop offset="1" stopColor="#2CC295" />
        </linearGradient>
        <filter id="b2-grain" x="-35%" y="-35%" width="170%" height="170%">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" stitchTiles="stitch" result="noise">
            <animate attributeName="seed" values="1;2;3;4;5;6" dur=".6s" repeatCount="indefinite" calcMode="discrete" />
          </feTurbulence>
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.25" result="specks" />
          <feComposite in="specks" in2="SourceGraphic" operator="in" result="grain" />
          <feBlend in="grain" in2="SourceGraphic" mode="soft-light" />
        </filter>
        <path id="b2-b" d="M0 38.5V18Q0 0 18 0H21Q39 0 39 17Q39 0 57 0H60.5Q78.5 0 78.5 18V38.5Z" />
      </defs>
    </svg>
  );
}

const CORE = "M45.5 41.5H74.5Q78.5 41.5 78.5 45.5V74.5Q78.5 78.5 74.5 78.5H45.5Q41.5 78.5 41.5 74.5V45.5Q41.5 41.5 45.5 41.5ZM54.5 47H65.5V54.5H73V65.5H65.5V73H54.5V65.5H47V54.5H54.5Z";

export function B2Mark({ className = "", size, grain = true, decorative = false }) {
  return (
    <svg className={`b2-mark ${className}`} viewBox="0 0 120 120" style={size ? { width: size, height: size } : undefined}
         {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": "Project BMDC" })}>
      <g filter={grain ? "url(#b2-grain)" : undefined}>
        {[0, 90, 180, 270].map((r, i) => (
          <g key={r} transform={`rotate(${r} 60 60)`}>
            <g className="b2-piece" style={{ "--i": i }}><use href="#b2-b" fill="url(#b2-piece-grad)" /></g>
          </g>
        ))}
        <g className="b2-core"><path fill="url(#b2-core-grad)" fillRule="evenodd" d={CORE} /></g>
      </g>
    </svg>
  );
}

export function B2Logo({ variant = "", light = true, className = "" }) {
  return (
    <a href="/" aria-label="Project BMDC home" className={`b2-logo b2-hover ${variant} ${light ? "light" : ""} ${className}`}>
      <B2Mark decorative />
      <span className="b2-wm"><span>Project</span><span>BMDC</span></span>
    </a>
  );
}
```

---

## 6. Page patterns using the film backgrounds

**Hero (always film):**
```html
<body class="b2-grain-page" style="background:#021A17;color:#F1F7F6;font-family:Outfit,sans-serif">
  <!-- defs sprite from 5a here -->
  <section class="b2-film" style="min-height:90vh;display:grid;place-items:center;padding:96px 24px;border-radius:0 0 32px 32px">
    <div style="max-width:960px;text-align:center">
      <!-- symbol from 5b with class="b2-mark is-intro" style="width:120px;height:120px;margin:0 auto 28px" -->
      <p style="font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#00DF81">BMDC Licensing Exam · 4-Month Course</p>
      <h1 style="font-size:clamp(42px,7vw,72px);font-weight:600;letter-spacing:-.03em;line-height:1.02;margin:12px 0 20px">
        Your gateway to <em style="font-style:normal;color:#00DF81">BMDC licence.</em></h1>
      <p lang="bn" style="font-family:'Hind Siliguri',sans-serif;font-size:20px;color:#AACBC4">বিদেশে MBBS, দেশে লাইসেন্স।</p>
      <a href="#enroll" style="display:inline-block;margin-top:28px;background:#00DF81;color:#021A17;font-weight:600;border-radius:999px;padding:14px 28px;text-decoration:none">Join the batch →</a>
    </div>
  </section>
</body>
```

**Where each background goes:**
| Surface | Background |
|---|---|
| Page | `#021A17` + `body.b2-grain-page` |
| Hero, page headers, final CTA band | `.b2-film` (hero) |
| Feature highlight, results/merit banner, promo cards | `.b2-film.spring` |
| Footer, testimonial sections, quote slides | `.b2-film.deep` |
| Normal cards | `#032221` with `1px solid #13302B` border, radius 20px |
| Light reading sections (articles, notes) | `#F1F7F6` with `#021A17` text |

**Buttons:** primary = Caribbean `#00DF81` background, Rich Black text, pill radius, weight 600, padding `14px 28px`; hover = `#2CC295`; pressed = `#17876D` with Anti-Flash text. Secondary = transparent with a `1px solid #2CC295` border and Meadow text. Disabled = `#0B453A` background with Stone text.

**Layout tokens:**
| Token | Value |
|---|---|
| Spacing scale | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 px |
| Section padding | 96 px desktop / 64 px mobile (vertical), 24 px side gutter on mobile |
| Max content width | 1200 px; text blocks 680 px |
| Radius | small 10 px (inputs, chips) · card 20 px · large panels 32 px · buttons/pills 999 px |
| Shadow | prefer none. If needed: `0 12px 40px rgba(0,223,129,.10)` (green glow, not grey) |
| Breakpoints | 640 · 900 · 1200 px |

**Forms & inputs (dark):**
```css
.b2-input{width:100%;font:400 16px Outfit,sans-serif;color:#F1F7F6;background:#032221;border:1px solid #13302B;border-radius:10px;padding:14px 16px}
.b2-input::placeholder{color:#707D7D}
.b2-input:focus{outline:none;border-color:#00DF81;box-shadow:0 0 0 3px rgba(0,223,129,.25)}
.b2-input[aria-invalid="true"]{border-color:#FF5A5F}
.b2-label{display:block;font:500 14px Outfit,sans-serif;color:#AACBC4;margin-bottom:8px}
:focus-visible{outline:2px solid #00DF81;outline-offset:3px}  /* keyboard focus everywhere */
```
Use `type="tel"` with `+880` for Bangladeshi phone numbers.
**Icons:** rounded 1.75 px line icons (e.g. Lucide) in Mountain Meadow.
**Images:** darken with a gradient overlay (`linear-gradient(180deg,rgba(2,26,23,0),#021A17)`) so they blend into the dark film look.

---

## 7. Animating the symbol: where to use what

| Animation | Class | Use for |
|---|---|---|
| Intro | `is-intro` | Hero and header logo on page load. Plays once (~1.2 s). |
| Loader | `is-loading` | Page/route transitions, form submit, quiz and test loading. Replace every spinner. |
| Wave | `is-wave` | Calm idle loop on hero symbols and empty states. |
| Heartbeat | `is-heartbeat` | Medical-themed sections, results highlights, CTA blocks. |
| Hover | wrapper `.b2-hover` | Header logo and logo buttons. |
| Scroll | `is-scroll` + JS | Big decorative symbol in the hero background. |
| Film flicker | built into the grain filter | Always on; delete the `<animate>` line in 5a to turn it off. |

```html
<script>
  // scroll-linked rotation for .is-scroll
  addEventListener('scroll', () => document.documentElement.style.setProperty('--b2-scroll', (scrollY * 0.25).toFixed(1)), { passive: true });
  // play the intro when a mark scrolls into view: add data-b2-intro to any .b2-mark
  const b2io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-intro'); b2io.unobserve(e.target); } }), { threshold: .4 });
  document.querySelectorAll('.b2-mark[data-b2-intro]').forEach(m => b2io.observe(m));
  // replay on demand
  function b2Replay(m){ m.classList.remove('is-intro'); void m.getBoundingClientRect(); m.classList.add('is-intro'); }
</script>
```

**Full-screen loading splash:**
```html
<div id="b2-splash" class="b2-film" style="position:fixed;inset:0;display:grid;place-items:center;z-index:9999;transition:opacity .4s">
  <!-- symbol from 5b with class="b2-mark is-loading" style="width:84px;height:84px" -->
</div>
<script>addEventListener('load',()=>{const s=document.getElementById('b2-splash');s.style.opacity=0;setTimeout(()=>s.remove(),400);});</script>
```

---

## 8. Files in this folder

| File | Use |
|---|---|
| `SVG/project-bmdc-logo2-horizontal-color.svg` | Main logo with dark text: light backgrounds, documents |
| `SVG/project-bmdc-logo2-horizontal-color-white-text.svg` | Main logo on dark/film backgrounds |
| `SVG/project-bmdc-logo2-horizontal-on-film.svg` | Logo with the film background baked in |
| `SVG/project-bmdc-logo2-vertical-*.svg` | Square spaces, hero, social |
| `SVG/project-bmdc-logo2-oneline-*.svg` | Narrow headers |
| `SVG/project-bmdc-logo2-horizontal-white.svg` / `-black.svg` | One-colour print |
| `SVG/project-bmdc-logo2-icon-*.svg` | Symbol only (color with grain, flat, white, black) |
| `SVG/project-bmdc-logo2-app-icon-*.svg` | App/PWA icons |
| `PNG/…-favicon-32/192/512.png` | Favicon and web app manifest |
| `PNG/…-on-film / -on-light / -on-spring…png` | Social posts and slides with the background baked in |
| `PNG/…-transparent.png` | Transparent logos |
| `Project-BMDC-Logo-2.pdf` | Full brand guidelines |
| `logo2-animations-demo.html` | Open in a browser to preview every animation and the film backgrounds |

```html
<link rel="icon" type="image/png" sizes="32x32" href="/project-bmdc-logo2-favicon-32.png">
<link rel="icon" type="image/svg+xml" href="/project-bmdc-logo2-icon-flat.svg">
<link rel="apple-touch-icon" href="/project-bmdc-logo2-favicon-192.png">
<meta name="theme-color" content="#021A17">
```

**Important:** the files above are on your computer (`D:\BMDC\LOGO\LOGO 2`). Upload the PNG/SVG files you use into your website builder's assets or `public/` folder, then use those paths. The builder can't see your D: drive.

---

## 9. Builder checklist (do every item)

- [ ] Google Fonts link (section 3) in `<head>`
- [ ] Global CSS (section 4) pasted once
- [ ] Defs sprite (5a) right after `<body>`, not `display:none`
- [ ] `<body class="b2-grain-page">` with background `#021A17`
- [ ] Header uses the `b2-logo b2-hover light` lockup; one-line version on mobile
- [ ] Hero uses `.b2-film` with the `is-intro` symbol
- [ ] Spinners replaced by the `is-loading` symbol
- [ ] Only the brand colours, plus status colours for errors and warnings
- [ ] Body text passes the contrast table (no Stone body text on light)
- [ ] Bangla text uses Hind Siliguri with `lang="bn"`
- [ ] Copy follows the voice rules (no "guaranteed", no ALL CAPS)
- [ ] Favicons and theme-color set
- [ ] Tested with reduced motion turned on

# Project BMDC — Launch guide (step by step)

> Goal: site live **by 15 November 2026**, so you have 5 days to promote the **free workshop on 20 November, 11 PM**.
> Everything here is free except an optional domain (~৳1,200–1,500 a year).
> Where a step says **"or tell Claude"**, I can do it for you if you say so in chat.

**Checklist at a glance**

| # | Step | Who | Time | Needed for |
|---|---|---|---|---|
| 1 | Turn off "Confirm email" in Supabase | You | 2 min | Signups work |
| 2 | Save the code to GitHub | You (or Claude commits + you push) | 15 min | Hosting |
| 3 | Put the site online with Vercel | You | 15 min | Public link |
| 4 | Tell Supabase your live web address | You | 3 min | Login and reset links |
| 5 | Set up "Continue with Google" | You | 20 min | Google login |
| 6 | Make your own admin account | You + 1 SQL line (or tell Claude) | 5 min | Admin panel |
| 7 | Delete the two test accounts | Tell Claude | 1 min | Clean data |
| 8 | Add the workshop Google Meet link | You, in admin | 3 min | Workshop |
| 9 | Test everything on your phone | You | 20 min | Confidence |
| 10 | Announce it | You | — | Students |
| 11 | Before 1 December: classes, notes, MCQs, free samples | You + Claude | ongoing | Batch start |
| 12 | Optional: own domain + reliable email | You | 30 min | Polish |

---

## 1. Turn off email confirmation (required)

You decided email signups need no verification. Supabase has it **on** by default, and its free email service only sends about 2 emails an hour, so signups would get stuck.

1. Go to **https://supabase.com/dashboard** and sign in.
2. Open the project **Project BMDC**.
3. Left menu → **Authentication** → **Sign In / Providers**.
4. Click **Email**.
5. Turn **Confirm email** OFF. Leave "Enable Email provider" ON.
6. Click **Save**.

✅ Check: sign up on the site with a new email. You should land on the dashboard straight away.

---

## 2. Save the code to GitHub

GitHub stores the code. Vercel reads it from there and rebuilds the site every time it changes.

**2a. Commit the code** (a snapshot of the current version). Tell Claude **"commit it"**, or run this in a terminal in `D:\BMDC`:

```bash
git add -A
```

```bash
git commit -m "Project BMDC website v1"
```

Your secrets (`.env.local`, `.env.test.local`) and the big `LOGO/` and `SOCIAL/` folders are excluded automatically.

**2b. Create the GitHub repository**
1. Go to **https://github.com** and sign up or sign in.
2. Top right **+** → **New repository**.
3. Name: `project-bmdc`. Visibility: **Private**. Don't tick README, .gitignore or licence.
4. Click **Create repository**.
5. GitHub shows a page with commands. Use the ones under **"…or push an existing repository from the command line"**. They look like this (with your username):

```bash
git remote add origin https://github.com/YOUR-USERNAME/project-bmdc.git
```

```bash
git branch -M main
```

```bash
git push -u origin main
```

If a window asks you to sign in to GitHub, sign in.

✅ Check: refresh the GitHub page. You should see `src/`, `supabase/`, `prd.md` and the other files.

---

## 3. Put the site online with Vercel

1. Go to **https://vercel.com** → **Sign Up** → **Continue with GitHub**. Choose the **Hobby (free)** plan.
2. Click **Add New… → Project**.
3. Find `project-bmdc` → **Import**. If it's not listed, click **Adjust GitHub App Permissions** and allow that repository.
4. Framework preset: **Next.js** (detected automatically). Leave the build settings as they are.
5. Open **Environment Variables** and add these three. Copy the values from your `D:\BMDC\.env.local` file:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gmmpzehlfeuigtopekoq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | (from `.env.local`; starts with `sb_publishable_`) |
| `NEXT_PUBLIC_SITE_URL` | `https://projectbmdc.vercel.app` (change it in step 7 below if your address is different) |

6. Click **Deploy** and wait about 2 minutes.
7. Vercel shows your live address, e.g. `https://projectbmdc.vercel.app`. If it's different from what you typed in step 5:
   **Settings → Environment Variables** → edit `NEXT_PUBLIC_SITE_URL` to the real address → **Deployments** → the latest one → **⋯ → Redeploy**.

✅ Check: open the address on your phone. You should see the light landing page with the workshop countdown.

> From now on, every time code is pushed to GitHub, Vercel updates the live site automatically.

---

## 4. Tell Supabase your live web address

Login, Google and password-reset links send people back to this address.

1. Supabase → **Project BMDC** → **Authentication** → **URL Configuration**.
2. **Site URL**: your live address, e.g. `https://projectbmdc.vercel.app`.
3. **Redirect URLs** → **Add URL**, and add both:
   - `https://projectbmdc.vercel.app/**`
   - `http://localhost:3000/**` (for testing on your computer)
4. Click **Save**.

---

## 5. Set up "Continue with Google"

**5a. Google Cloud**
1. Go to **https://console.cloud.google.com** and sign in with the Google account that should own this (e.g. the Project BMDC Gmail).
2. Top bar project picker → **New project** → name `Project BMDC` → **Create**, then select it.
3. Menu → **APIs & Services → OAuth consent screen** (it may be called **Google Auth Platform → Branding**). Click **Get started**.
   - App name: **Project BMDC**
   - User support email: your email
   - Audience: **External**
   - Contact email: your email → agree → **Create**
4. In **Branding**: upload the logo `LOGO/LOGO 2/PNG/project-bmdc-logo2-favicon-512.png`. Under **Authorized domains** add `supabase.co`, plus your own domain if you have one. Save.
5. **Audience** → click **Publish app** → confirm. Without this, only test users can log in with Google.
6. **Clients** (or **Credentials**) → **Create client** / **Create credentials → OAuth client ID**.
   - Application type: **Web application**. Name: `Project BMDC web`.
   - **Authorized JavaScript origins**: `https://projectbmdc.vercel.app` and `http://localhost:3000`
   - **Authorized redirect URIs**: `https://gmmpzehlfeuigtopekoq.supabase.co/auth/v1/callback`
   - Click **Create**, then copy the **Client ID** and **Client secret**.

**5b. Supabase**
1. Supabase → **Authentication → Sign In / Providers → Google**.
2. Turn **Enable** ON. Paste the **Client ID** and **Client secret** → **Save**.

✅ Check: on the live site, tap **Continue with Google**. After choosing your account, you should be asked for your WhatsApp number, then land on the dashboard.

> We only ask Google for name and email, so Google does **not** need to review the app.

---

## 6. Make your own admin account

1. On the **live site**, sign up with the email you'll manage the course with (Google or email).
2. Make that account admin. Either:
   - tell Claude **"make <your email> admin"**, or
   - Supabase → **SQL Editor** → **New query** → paste the line below with your email → **Run**:

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

3. Refresh the site. You'll now see **Admin panel** in the menu, at `/admin`.

---

## 7. Delete the two test accounts

Tell Claude **"delete the test accounts"**. This removes `student.test@…` and `admin.test@…` and their practice data. Do it after you've finished testing with them.

---

## 8. Add the workshop Google Meet link

1. Open **Google Calendar** → create an event on **20 November, 11:00 PM–12:30 AM** → **Add Google Meet video conferencing** → Save → copy the `meet.google.com/...` link.
2. Live site → **Admin → Live sessions** → tap **"Free workshop: How to pass the BMDC RQE…"**.
3. Paste the link into **Google Meet link** → **Save changes**.

Students see the **Join on Google Meet** button 15 minutes before it starts. Free accounts can see this one because its "Who can join" is set to **Everyone**.

---

## 9. Test everything on your phone (do this before announcing)

Use a second email or a friend's phone as a "student".

- [ ] Landing page loads fast on mobile data; workshop countdown is running
- [ ] **Sign up** with email (no confirmation email needed) → dashboard shows the workshop card
- [ ] **Sign up with Google** → asks for WhatsApp number → dashboard
- [ ] **Forgot password** sends a reset email. The free email limit is about 2 an hour; see step 12 to fix that.
- [ ] **One-device lock**: log in to the same student on a second phone → it shows "active on another device" → Admin → that student → **Reset device** → the second phone can now log in
- [ ] **Payment flow**: Admin → Students → open the student → **Mark as paid & unlock** (TrxID, ৳8,000, end date 1 May 2027) → the student's MCQs unlock
- [ ] **MCQ**: Practice shows explanations; Exam has a timer and gives a score
- [ ] **Theme** button switches light/dark

---

## 10. Announce

- Add the website link to the **Facebook page** (Edit page info → Website) and pin a post about the free workshop.
- Share the link in your WhatsApp groups. The link preview shows the logo image automatically.
- Every **"Join the batch"** button already shows the bKash number and opens WhatsApp with a ready-made message.

**Your daily routine once students pay:**
1. A student sends the TrxID and screenshot on WhatsApp.
2. Check it in your bKash app.
3. Admin → **Students** → search their email or phone → **Mark as paid & unlock**.
4. Device change requests: Admin → that student → **Reset device**.

---

## 11. Before the batch starts (1 December)

- [ ] **Class schedule**: Admin → **Live sessions** → add Week 1 (and later weeks) with date, time and Meet link, "Who can join" = **Paid students only**. Tell me the class days and times and I can add all 48 classes at once.
- [ ] **Notes**: Admin → **Notes** → upload PDFs chapter by chapter (max 25 MB each).
- [ ] **MCQs**: send me the rest of the previous papers. I'll add explanations and import them, the same way as the first 10.
- [ ] **Free samples**: in Admin → **MCQ sets**, **Notes** and **Recordings**, switch **Free** on for whatever free accounts should be able to try.
- [ ] **Recordings (later)**: when you're ready for Bunny Stream, tell me and I'll walk you through it. It's about 10 minutes plus two settings in Vercel.

---

## 12. Optional, but recommended soon

**Your own domain (e.g. `projectbmdc.com`)**
1. Buy it at **Namecheap**, **Porkbun** or **Cloudflare** (about $10–13 a year).
2. Vercel → your project → **Settings → Domains** → add it → follow the DNS instructions shown (copy 1–2 records into your domain provider).
3. Then update: Vercel `NEXT_PUBLIC_SITE_URL` (+ redeploy), Supabase **Site URL / Redirect URLs** (step 4), and Google **origins** (step 5a).

**Reliable emails (password reset)**
Supabase's built-in email is limited to about 2 an hour. Free fix with **Resend** (3,000 emails a month free; needs your own domain):
1. Sign up at **https://resend.com** → **Domains** → add your domain → add the DNS records it shows.
2. **API Keys** → create one.
3. Supabase → **Authentication → Emails → SMTP Settings** → enable custom SMTP:
   host `smtp.resend.com`, port `465`, username `resend`, password = the API key, sender e.g. `no-reply@yourdomain.com`, sender name `Project BMDC`.

**Good to know**
- **Vercel Hobby** is officially for non-commercial sites. It's fine to launch on it. Once fees are coming in regularly, move to **Vercel Pro (~$20/month)** to stay within their rules.
- **Supabase free** stops the database after 7 days with **no visitors at all**. That won't happen once students are using the site.
- **Backups**: the free plan has no automatic downloadable backups. Every few weeks, ask Claude to export the students and payments lists.

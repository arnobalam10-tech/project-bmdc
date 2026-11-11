import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Check,
  ClipboardList,
  FileText,
  MessageCircle,
  PlayCircle,
  Quote,
  ShieldCheck,
  Sparkles,
  Timer,
  Video,
  X,
} from "lucide-react";
import { B2Logo, B2Mark } from "@/components/brand/B2";
import { ButtonLink, btn } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/client";
import { SectionTitle } from "@/components/ui/primitives";
import { PixelEvent } from "@/components/app/MetaPixel";
import { COURSE } from "@/lib/pixel";
import { Header, MobileCtaBar } from "@/components/landing/client";
import { CourseOutline } from "@/components/landing/CourseOutline";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { getSettings, waLink } from "@/lib/settings";
import { fmtDate, fmtTime, isPast, taka } from "@/lib/format";

export const revalidate = 300;

const INSTRUCTORS = [
  {
    name: "Dr. Nafisa Alam",
    initials: "NA",
    quote:
      "Every doctor who studied abroad deserves a fair chance to practise in their home country. At Project BMDC, we’re here to make that journey a little easier by building a system specifically designed for the BMDC exam.",
  },
  {
    name: "Dr. Omar",
    initials: "O",
    quote:
      "When I prepared for this exam, I wished there was someone to show me the way. There wasn’t, so we built what we wish we had — a clear roadmap, the right guidance, and a little more clarity for everyone taking this journey after us.",
  },
];

const FEATURES = [
  { icon: Video, title: "Live classes, 3 classes a week", body: "48 structured classes over 16 weeks on Google Meet, from Medicine to Obstetrics." },
  { icon: PlayCircle, title: "Every class recorded", body: "Missed one? Rewatch any class, chapter by chapter, any time." },
  { icon: ClipboardList, title: "All previous BMDC papers", body: "Structured according to the BMDC exam pattern." },
  { icon: BookOpenCheck, title: "Topic-wise MCQ practice", body: "True/False MCQs by chapter. Instant answers and explanations after every question." },
  { icon: Timer, title: "Real timed mock exams", body: "100 questions, 100 minutes, the exact RQE marking. Know your score before exam day." },
  { icon: FileText, title: "Chapter-wise notes", body: "Clean, exam-focused PDF notes for every chapter, inside the platform." },
];

const FAQ = [
  ["Is this an online course?", "Yes, it's 100% online. Live classes are on Google Meet, and recordings, MCQs, mock exams and notes are all on this website. This batch prepares you for the April 2027 BMDC exam."],
  ["Can I study from abroad?", "Yes. Classes are live on Google Meet and every class is recorded, so you can study from China, Russia, India, Nepal or anywhere, on phone or laptop."],
  ["What if I miss a live class?", "Every class is recorded and added to your dashboard chapter-wise. Rewatch it whenever you like."],
  ["How do I pay?", "bKash Send Money to our personal number, then place your order on this website with the bKash number you sent it from. We verify the payment and unlock your account."],
  ["Can I share my account?", "No. Each account works on one device only, to keep the course fair for everyone. If you change your phone or laptop, message us on WhatsApp and we'll move your account."],
  ["How long do I keep access?", "Until 1 May 2027, which covers the full course and your revision time before the exam."],
  ["Is a pass guaranteed?", "No honest course can guarantee a pass. The course is built to help you pass in one attempt: every topic, every previous paper, and mocks with the real marking."],
  ["Is the workshop really free?", "Yes. Create a free account and the Google Meet link appears on your dashboard. No payment needed."],
] as const;

export default async function Home() {
  const s = await getSettings();
  const workshopOver = isPast(s.workshop_at, 2 * 3600_000);
  const save = s.price - s.offer_price;

  return (
    <>
      <Header workshopAt={s.workshop_at} />
      <PixelEvent event="ViewContent" params={{ ...COURSE, value: s.offer_price }} />

      <main className="landing-main -mt-16 md:-mt-[72px]">
        {/* ───────── HERO ───────── */}
        <section id="hero" className="b2-film rounded-b-[32px] px-4 pb-8 pt-24 sm:px-6 sm:pb-16 sm:pt-28 md:pb-24 md:pt-40">
          <B2Mark
            className="is-wave pointer-events-none !absolute -right-24 top-24 hidden opacity-20 md:block"
            size={520}
            decorative
          />
          <div className="mx-auto max-w-[820px] text-center">
            <div className="hidden sm:block">
              <B2Mark className="is-intro mx-auto mb-7" size={96} />
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] sm:gap-2 sm:text-[13px]">
              <span className="rounded-full bg-b2-caribbean px-2.5 py-1 text-b2-ink sm:px-3.5 sm:py-1.5">April 2027 batch</span>
              <span className="rounded-full border border-b2-flash/25 px-2.5 py-1 text-b2-flash/90 sm:px-3.5 sm:py-1.5">100% online</span>
            </div>
            <h1 className="mt-4 text-[40px] font-semibold leading-[1] tracking-[-0.04em] sm:mt-5 sm:text-6xl md:text-[76px]">
              Pass the BMDC RQE <br />
              <em className="hl">in one attempt.</em>
            </h1>
            <p className="mx-auto mt-3 max-w-[640px] text-[15px] leading-relaxed text-b2-flash/80 sm:mt-5 sm:text-[17px] md:text-lg">
              A 4-month online course for doctors who studied MBBS abroad. Starts{" "}
              <strong className="font-semibold text-b2-flash">{fmtDate(s.batch_start, { year: undefined })}</strong>.
            </p>
            <div className="mx-auto mt-5 grid max-w-[420px] gap-2.5 sm:mt-8 sm:flex sm:max-w-none sm:justify-center sm:gap-3">
              <ButtonLink href="/enroll" variant="white" size="lg">
                Join the batch · {taka(s.offer_price)} <ArrowRight size={18} />
              </ButtonLink>
              <a
                href="/group"
                className={btn("secondary", "lg", "!border-[#25D366] !bg-[#25D366] !text-white hover:!bg-[#1ebe5b]")}
              >
                <WhatsAppIcon size={22} /> Join our free WhatsApp group
              </a>
            </div>
            <a
              href={waLink(s.whatsapp_number, "Hi, I have a question about the Project BMDC online course.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-10 items-center gap-1.5 text-[14px] text-b2-flash/80 hover:text-b2-flash sm:mt-3"
            >
              Questions? Message us · <span className="font-semibold">{s.whatsapp_number}</span>
            </a>
            <div className="mx-auto mt-3 grid max-w-[420px] grid-cols-3 divide-x divide-b2-flash/15 rounded-2xl border border-b2-flash/15 bg-b2-black/30 py-3 sm:mt-6 sm:max-w-[560px] sm:py-4">
              {[
                ["48", "live classes"],
                ["2017–25", "past papers"],
                [fmtDate(s.default_access_end, { year: undefined, month: "short" }), "access till"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="tabular text-[19px] font-semibold text-b2-caribbean sm:text-2xl">{n}</p>
                  <p className="text-[11.5px] text-b2-pistachio sm:text-sm">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── FREE WORKSHOP ───────── */}
        <section id="workshop" className="px-4 py-8 sm:px-6 sm:py-16 md:py-24">
          <div
            className="b2-film spring mx-auto max-w-[1200px] rounded-[32px] p-6 shadow-[0_12px_60px_rgba(0,223,129,.18)] !p-5 sm:!p-10 md:!p-14"
            style={{
              // spring film mirrored: glow bottom-right, so the copy (top-left) sits on the dark side (brand kit §2)
              backgroundImage:
                "radial-gradient(80% 110% at 100% 100%,#00DF81 0%,rgba(0,223,129,0) 60%),linear-gradient(300deg,#2CC295 0%,#17876D 40%,#032221 85%)",
            }}
          >
            <B2Mark className="is-heartbeat pointer-events-none !absolute -bottom-16 -right-16 opacity-30" size={300} decorative />
            {workshopOver ? (
              <div className="max-w-[640px]">
                <p className="eyebrow !text-b2-flash">Missed the workshop?</p>
                <h2 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px] md:text-5xl">
                  The batch starts {fmtDate(s.batch_start, { year: undefined })}. Your seat is waiting.
                </h2>
                <div className="mt-8">
                  <ButtonLink href="/enroll" variant="white" size="lg">
                    Join the batch →
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <div className="grid items-center gap-5 sm:gap-10 md:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="live-dot" />
                    <span className="text-sm font-semibold uppercase tracking-[0.16em]">Registration open</span>
                  </div>
                  <div className="mt-3 flex items-end gap-3 sm:mt-4 sm:gap-4">
                    <p className="free-word text-[58px] font-bold leading-[0.85] tracking-[-0.05em] sm:text-[104px] md:text-[128px]">
                      FREE
                    </p>
                    <span className="free-ticket mb-1 sm:mb-3">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] opacity-75">Live</span>
                      <span className="block text-sm font-semibold leading-tight sm:text-base">Workshop</span>
                    </span>
                  </div>
                  <h2 className="mt-2 text-[23px] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[30px] md:text-[44px]">
                    Workshop: how to pass the BMDC RQE in{" "}
                    <span className="underline decoration-b2-caribbean decoration-4 underline-offset-[6px]">one attempt.</span>
                  </h2>
                  <p className="mt-3 text-[15px] text-b2-flash/90 sm:mt-4 sm:text-lg">
                    <CalendarDays className="mr-1.5 inline -translate-y-0.5" size={18} />
                    {fmtDate(s.workshop_at, { weekday: "long" })} · {fmtTime(s.workshop_at)} (Bangladesh time) · Google Meet
                  </p>
                  <ul className="mt-4 space-y-2 text-[14.5px] sm:mt-6 sm:space-y-3 sm:text-[16px]">
                    {[
                      "How the RQE is set and marked, and how to beat the negative marking",
                      "The 4-month plan: what to study, in what order",
                      "Live Q&A with Dr. Nafisa Alam and Dr. Omar",
                    ].map((t) => (
                      <li key={t} className="flex gap-3">
                        <Check className="mt-0.5 flex-none text-b2-caribbean" size={18} strokeWidth={2.5} />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[24px] border border-b2-flash/15 bg-b2-black/55 p-4 backdrop-blur-sm sm:rounded-[28px] sm:p-8">
                  <p className="text-sm font-medium uppercase tracking-[0.14em] text-b2-pistachio">Starts in</p>
                  <div className="mt-3 sm:mt-4">
                    <Countdown to={s.workshop_at} size="lg" doneLabel="Workshop is live" />
                  </div>
                  <a href="/group" className={btn("secondary", "lg", "mt-5 w-full !border-[#25D366] !bg-[#25D366] !text-white hover:!bg-[#1ebe5b] sm:mt-8")}>
                    <WhatsAppIcon size={22} /> Join our WhatsApp group
                  </a>
                  <p className="mt-2 text-center text-[13px] text-b2-pistachio sm:mt-3 sm:text-sm">
                    The Google Meet link is shared in the group. No payment needed.
                  </p>
                  <a
                    href={waLink(s.whatsapp_number, "Hi, I want to join the free BMDC workshop.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={btn("secondary", "md", "mt-3 w-full !border-b2-flash/30 !text-b2-flash sm:mt-4")}
                  >
                    <MessageCircle size={18} /> Ask on WhatsApp · {s.whatsapp_number}
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ───────── COURSE DETAILS ───────── */}
        <section id="course" className="px-4 py-8 sm:px-6 sm:py-16 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <SectionTitle
              eyebrow="The 4-month online course · April 2027 batch"
              title={
                <>
                  Everything you need to pass, <em className="hl">in one place.</em>
                </>
              }
              sub="You've already done the hard part. Here's the plan for the last step: clear classes, every previous paper, and practice that feels like exam day."
            />
            <div className="mt-5 grid gap-2 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-3 rounded-[18px] border border-b2-border bg-b2-dark p-3.5 sm:block sm:rounded-[20px] sm:p-6">
                  <span className="grid size-10 flex-none place-items-center rounded-xl bg-b2-pine text-b2-meadow sm:size-12 sm:rounded-2xl">
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-medium leading-snug tracking-[-0.01em] sm:mt-5 sm:text-[20px] md:text-[22px]">{title}</h3>
                    <p className="mt-0.5 text-[14px] leading-snug text-b2-pistachio sm:mt-2 sm:text-base sm:leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── RQE MARKING ───────── */}
        <section className="px-4 py-8 sm:px-6 sm:py-16 md:py-24">
          <div className="mx-auto grid max-w-[1200px] items-center gap-5 sm:gap-10 md:grid-cols-2">
            <SectionTitle
              eyebrow="Know the exam"
              title={
                <>
                  How the BMDC RQE is <em className="hl">marked.</em>
                </>
              }
              sub={
                <>
                  <p>
                    100 questions with 4 statements each, every statement True or False. A right answer earns more than a
                    wrong one costs, so an educated guess usually beats a blank.
                  </p>
                  <p className="mt-3 text-b2-flash">Our mock exams use this exact marking.</p>
                </>
              }
            />
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 sm:gap-3">
              {[
                ["100", "questions"],
                ["400", "True/False statements"],
                ["100", "minutes"],
                ["100", "total marks"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-[16px] border border-b2-border bg-b2-dark p-2.5 text-center sm:rounded-[20px] sm:p-5 sm:text-left">
                  <p className="tabular text-[22px] font-semibold tracking-tight text-b2-caribbean sm:text-4xl">{n}</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-b2-pistachio sm:mt-1 sm:text-base">{l}</p>
                </div>
              ))}
              <div className="col-span-4 grid grid-cols-3 overflow-hidden rounded-[16px] sm:col-span-2 sm:rounded-[20px] border border-b2-border text-center">
                <div className="bg-b2-dark p-4">
                  <p className="tabular text-2xl font-semibold text-b2-caribbean">+0.25</p>
                  <p className="text-sm text-b2-pistachio">correct</p>
                </div>
                <div className="border-x border-b2-border bg-b2-dark p-4">
                  <p className="tabular text-2xl font-semibold text-b2-error">−0.06</p>
                  <p className="text-sm text-b2-pistachio">wrong</p>
                </div>
                <div className="bg-b2-dark p-4">
                  <p className="tabular text-2xl font-semibold">0</p>
                  <p className="text-sm text-b2-pistachio">blank</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── COURSE OUTLINE ───────── */}
        <section id="outline" className="px-4 py-8 sm:px-6 sm:py-16 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <SectionTitle
              eyebrow="Course outline"
              title={
                <>
                  Week by week, <em className="hl">start to finish.</em>
                </>
              }
              sub={`Medicine first, then Surgery, Basic Sciences, Pediatrics, Gynae and Obs. Every class live on Google Meet and recorded. Starts ${fmtDate(s.batch_start, { year: undefined })}.`}
            />
            <CourseOutline />
          </div>
        </section>

        {/* ───────── PLATFORM PREVIEW ───────── */}
        <section className="px-4 py-8 sm:px-6 sm:py-16 md:py-24">
          <div className="b2-film deep mx-auto grid max-w-[1200px] items-center gap-6 rounded-[28px] p-5 sm:gap-10 sm:rounded-[32px] sm:p-10 md:grid-cols-2 md:p-14">
            <div>
              <p className="eyebrow">Practise it on our website</p>
              <h2 className="mt-2 text-[25px] font-semibold leading-[1.1] tracking-[-0.03em] sm:mt-3 sm:text-[30px] md:text-[44px]">
                Wrong answer? Know <em className="hl">exactly why.</em>
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-b2-pistachio sm:mt-4 sm:text-[17px]">
                Every statement comes with its answer and the reason, plus an exam pearl. A wrong answer becomes a lesson,
                not a lost mark.
              </p>
              <ul className="mt-4 space-y-2 text-[14.5px] sm:mt-6 sm:space-y-3 sm:text-base">
                {["Practice mode: instant answer + explanation", "Exam mode: timed, flag & review, RQE marking", "Track your accuracy subject by subject"].map((t) => (
                  <li key={t} className="flex gap-3">
                    <Sparkles className="mt-0.5 flex-none text-b2-caribbean" size={18} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <PhoneMock />
          </div>
        </section>

        {/* ───────── INSTRUCTORS ───────── */}
        <section id="instructors" className="px-4 py-8 sm:px-6 sm:py-16 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <SectionTitle
              eyebrow="Your mentors"
              title={
                <>
                  Taught by doctors who&apos;ve <em className="hl">already passed it.</em>
                </>
              }
              sub="They sat the same exam after studying abroad, and passed in one attempt. Now they teach the way they wish they'd been taught."
            />
            <div className="mt-5 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4">
              {INSTRUCTORS.map((p) => (
                <figure key={p.name} className="flex flex-col rounded-[20px] border border-b2-border bg-b2-dark p-4 sm:p-6">
                  <div className="flex items-center gap-3.5 sm:gap-5">
                    <div className="b2-film spring relative grid size-14 flex-none place-items-center rounded-full text-lg font-semibold sm:size-24 sm:text-3xl">
                      <span>{p.initials}</span>
                      <B2Mark size={26} grain={false} decorative className="!absolute -bottom-1 -right-1" />
                    </div>
                    <div>
                      <h3 className="text-[18px] font-medium tracking-[-0.01em] sm:text-[22px]">{p.name}</h3>
                      <p className="mt-0.5 text-[13px] text-b2-pistachio sm:mt-1 sm:text-base">MBBS, Xiamen University, China</p>
                      <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-b2-pine px-2.5 py-0.5 text-[11.5px] font-medium text-b2-caribbean sm:mt-3 sm:gap-1.5 sm:px-3 sm:py-1 sm:text-sm">
                        <Check size={14} /> Passed the BMDC exam in one attempt
                      </p>
                    </div>
                  </div>
                  <blockquote className="relative mt-4 border-t border-b2-divider pt-4 sm:mt-5 sm:pt-5">
                    <Quote size={28} className="absolute -top-3.5 left-0 bg-b2-dark pr-2 text-b2-caribbean" aria-hidden />
                    <p className="text-[14.5px] leading-relaxed text-b2-flash/90 sm:text-[17px]">{p.quote}</p>
                  </blockquote>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── PRICING + ENROLL ───────── */}
        <section id="pricing" className="px-4 py-8 sm:px-6 sm:py-16 md:py-24">
          <div className="mx-auto max-w-[1200px]">
            <SectionTitle
              center
              eyebrow="One course, one price"
              title={
                <>
                  Join the April 2027 batch. <em className="hl">Starts {fmtDate(s.batch_start, { year: undefined })}.</em>
                </>
              }
            />
            <div className="mx-auto mt-5 max-w-[620px] sm:mt-10">
              <div className="b2-film spring relative overflow-hidden rounded-[28px] p-5 sm:rounded-[32px] sm:p-9">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[12px] font-semibold uppercase leading-snug tracking-[0.12em] sm:text-sm sm:tracking-[0.14em]">Full 4-month online course · April 2027 batch</p>
                  <span className="flex-none whitespace-nowrap rounded-full bg-b2-flash px-3 py-1 text-xs font-bold text-b2-ink">Save {taka(save)}</span>
                </div>
                <div className="mt-3 flex items-end gap-3 sm:mt-5">
                  <span className="tabular text-[46px] font-semibold leading-none tracking-[-0.03em] sm:text-7xl">{taka(s.offer_price)}</span>
                  <span className="tabular mb-1.5 text-xl text-b2-flash/70 line-through">{taka(s.price)}</span>
                </div>
                <p className="mt-2 text-[14px] text-b2-flash/85 sm:mt-3 sm:text-base">
                  One payment · less than {taka(Math.ceil(s.offer_price / 120))} a day for the whole course
                </p>
                <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2.5 sm:mt-7 sm:gap-x-6 sm:gap-y-3">
                  {[
                    "48 live classes on Google Meet",
                    "Every class recorded",
                    "All previous papers 2017–2025",
                    "Topic-wise MCQs with explanations",
                    "Timed mock exams, RQE marking",
                    "Chapter-wise notes",
                    `Access until ${fmtDate(s.default_access_end)}`,
                    "Mentors who passed in one attempt",
                  ].map((t) => (
                    <li key={t} className="flex gap-2 text-[13px] leading-snug sm:gap-3 sm:text-[15px]">
                      <span className="mt-0.5 grid size-4 flex-none sm:size-5 place-items-center rounded-full bg-b2-flash/90 text-b2-ink">
                        <Check size={13} strokeWidth={3} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <ButtonLink href="/enroll" variant="white" size="lg" className="mt-6 w-full !min-h-14 !text-[18px] sm:mt-8">
                  Join now <ArrowRight size={20} />
                </ButtonLink>
                <p className="mt-3 text-center text-sm text-b2-flash/80">Pay with bKash · no account needed to order</p>
              </div>
              <ul className="mt-3 grid grid-cols-3 gap-2 text-center text-xs sm:mt-5 text-b2-pistachio sm:text-sm">
                <li className="flex flex-col items-center gap-1.5 rounded-2xl border border-b2-border bg-b2-dark px-2 py-3">
                  <span className="grid size-8 place-items-center rounded-full bg-[#E2136E] text-[11px] font-bold text-white">bK</span>
                  Pay with bKash
                </li>
                <li className="flex flex-col items-center gap-1.5 rounded-2xl border border-b2-border bg-b2-dark px-2 py-3">
                  <ShieldCheck size={22} className="text-b2-meadow" />
                  Verified &amp; unlocked fast
                </li>
                <li className="flex flex-col items-center gap-1.5 rounded-2xl border border-b2-border bg-b2-dark px-2 py-3">
                  <MessageCircle size={22} className="text-b2-meadow" />
                  WhatsApp support
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ───────── FAQ ───────── */}
        <section id="faq" className="px-4 py-8 sm:px-6 sm:py-16 md:py-24">
          <div className="mx-auto max-w-[800px]">
            <SectionTitle center eyebrow="Questions" title="Frequently asked" />
            <div className="mt-5 divide-y divide-b2-divider rounded-[20px] sm:mt-10 border border-b2-border bg-b2-dark">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group px-4 sm:px-6">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[15px] font-medium sm:min-h-14 sm:py-4 sm:text-[17px] [&::-webkit-details-marker]:hidden">
                    {q}
                    <X size={18} className="flex-none rotate-45 text-b2-meadow transition-transform group-open:rotate-0" />
                  </summary>
                  <p className="pb-4 text-[14.5px] leading-relaxed text-b2-pistachio sm:pb-5 sm:text-base">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── FINAL CTA ───────── */}
        <section className="px-4 pb-8 sm:px-6 sm:pb-16 md:pb-24">
          <div className="b2-film mx-auto max-w-[1200px] rounded-[28px] px-5 py-9 text-center sm:rounded-[32px] sm:px-10 sm:py-14 md:py-20">
            <B2Mark className="is-heartbeat mx-auto" size={64} />
            <h2 className="mt-4 text-[27px] font-semibold leading-[1.08] tracking-[-0.03em] sm:mt-6 sm:text-[34px] md:text-[56px]">
              We reserved <em className="hl">a seat for you.</em>
            </h2>
            <p lang="bn" className="mt-2 font-bangla text-base text-b2-pistachio sm:mt-3 sm:text-lg">
              প্রথমবারেই পাস করার লক্ষ্যে, আমরা আছি আপনার পাশে।
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
              <ButtonLink href="/enroll" size="lg">
                Join the batch
              </ButtonLink>
              <a href="/group" className={btn("secondary", "lg", "!border-[#25D366] !bg-[#25D366] !text-white hover:!bg-[#1ebe5b]")}>
                <WhatsAppIcon size={20} /> Join our WhatsApp group
              </a>
              <ButtonLink href={waLink(s.whatsapp_number, "Hi, I have a question about Project BMDC.")} external variant="secondary" size="lg">
                <MessageCircle size={18} /> Ask on WhatsApp
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      {/* ───────── FOOTER ───────── */}
      <footer className="b2-film deep rounded-t-[28px] px-5 pb-28 pt-9 sm:rounded-t-[32px] sm:px-6 sm:pt-14 md:pb-14">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
          <div className="col-span-2 md:col-span-1">
            <B2Logo />
            <p className="mt-3 max-w-sm text-[14px] text-b2-pistachio sm:mt-4 sm:text-base">Your gateway to BMDC licence. A 4-month online course for doctors who finished their MBBS abroad. April 2027 batch.</p>
          </div>
          <div>
            <p className="font-semibold">Contact</p>
            <ul className="mt-3 space-y-2 text-b2-pistachio">
              <li>
                <a className="hover:text-b2-flash" href={waLink(s.whatsapp_number)} target="_blank" rel="noopener noreferrer">
                  WhatsApp: {s.whatsapp_number}
                </a>
              </li>
              <li>
                <a className="hover:text-b2-flash" href={s.facebook_url} target="_blank" rel="noopener noreferrer">
                  Facebook page
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Platform</p>
            <ul className="mt-3 space-y-2 text-b2-pistachio">
              <li><Link className="hover:text-b2-flash" href="/login">Log in</Link></li>
              <li><Link className="hover:text-b2-flash" href="/signup">Sign up free</Link></li>
              <li><Link className="hover:text-b2-flash" href="/terms">Terms</Link></li>
              <li><Link className="hover:text-b2-flash" href="/privacy">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-7 max-w-[1200px] border-t border-b2-divider pt-5 text-[13px] sm:mt-10 sm:pt-6 sm:text-sm text-b2-stone">
          © {new Date().getFullYear()} Project BMDC. Built to help you pass in one attempt. No guarantees, just a good plan.
        </p>
      </footer>

      <MobileCtaBar price={s.offer_price} whatsapp={s.whatsapp_number} />
    </>
  );
}

/** Static recreation of the practice screen from our social post. */
function PhoneMock() {
  const rows = [
    { l: "A", t: "Lactic acidosis", you: "T", ok: true },
    { l: "B", t: "Abdominal discomfort", you: "F", ok: false },
    { l: "C", t: "Weight gain", you: "F", ok: true },
    { l: "D", t: "Hypoglycemia", you: "T", ok: false },
  ];
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[34px] border-[5px] border-b2-black bg-b2-black p-2.5 sm:max-w-[380px] sm:rounded-[40px] sm:border-[6px] sm:p-3 shadow-[0_12px_60px_rgba(0,223,129,.18)]">
      <div className="rounded-[26px] bg-b2-dark p-3 text-[13px] sm:rounded-[30px] sm:p-4 sm:text-base">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-b2-pistachio">Previous year · Pharmacology</p>
            <p className="font-semibold">Question 30</p>
          </div>
          <span className="rounded-full bg-b2-caribbean px-3 py-1 text-xs font-semibold text-b2-ink">2 / 4 correct</span>
        </div>
        <div className="mt-3 rounded-2xl border border-b2-border bg-b2-black/40 p-3">
          <p className="font-medium">Adverse effects of metformin are:</p>
          <div className="mt-2 space-y-1.5">
            {rows.map((r) => (
              <div key={r.l} className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm ${r.ok ? "" : "bg-b2-error/10"}`}>
                <span className={`grid size-6 place-items-center rounded-full border-2 text-[10px] font-bold ${r.you === "T" ? "border-b2-caribbean" : "border-b2-stone"}`}>T</span>
                <span className={`grid size-6 place-items-center rounded-full border-2 text-[10px] font-bold ${r.you === "F" ? "border-b2-caribbean" : "border-b2-stone"}`}>F</span>
                <span className="flex-1">{r.l}. {r.t}</span>
                <span className={`grid size-5 place-items-center rounded-full ${r.ok ? "bg-b2-caribbean text-b2-ink" : "bg-b2-error text-b2-ink"}`}>
                  {r.ok ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-2xl border border-b2-border p-3 text-[13px] leading-relaxed">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-b2-caribbean">Explanation</p>
          <p className="mt-1.5"><b>Abdominal discomfort:</b> GI upset is the most common side effect. <span className="text-b2-error">You marked F</span></p>
          <p className="mt-1.5"><b>Hypoglycemia:</b> doesn&apos;t raise insulin, so alone it doesn&apos;t cause hypos. <span className="text-b2-error">You marked T</span></p>
          <p className="mt-2 border-t border-dashed border-b2-divider pt-2"><b className="text-b2-caribbean">Exam pearl:</b> long-term use can cause B12 deficiency.</p>
        </div>
      </div>
    </div>
  );
}

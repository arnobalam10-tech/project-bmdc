import { CLASS_SCHEDULE } from "@/lib/schedule";

const TONE: Record<string, string> = {
  Medicine: "bg-[#2CC295]",
  "General Surgery": "bg-[#7FB3FF]",
  "Systemic Surgery": "bg-[#5ED6E0]",
  "Basic Sciences": "bg-[#B79CFF]",
  Pediatrics: "bg-[#F5C84C]",
  Gynecology: "bg-[#FF8FB1]",
  Obstetrics: "bg-[#8FE3A8]",
};

/** 48 classes as 16 weekly cards (3 a week), in course order. */
function weeks() {
  const flat = CLASS_SCHEDULE.flatMap((g) => g.topics.map((topic) => ({ subject: g.subject, topic })));
  const out: { week: number; classes: { n: number; subject: string; topic: string }[] }[] = [];
  flat.forEach((c, i) => {
    const w = Math.floor(i / 3);
    (out[w] ??= { week: w + 1, classes: [] }).classes.push({ n: i + 1, ...c });
  });
  return out;
}

/** Swipeable week-by-week outline: one row of snap-scrolling cards, so phones swipe instead of scroll. */
export function CourseOutline() {
  const list = weeks();
  return (
    <div className="mt-5 sm:mt-10">
      <div className="mb-3 flex items-center justify-between gap-3 text-[13px] text-b2-pistachio">
        <span>16 weeks · 48 live classes · 3 a week</span>
        <span className="flex items-center gap-1 font-medium text-b2-caribbean">
          Swipe <span aria-hidden>→</span>
        </span>
      </div>
      <ol
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-3 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
        aria-label="Course outline, week by week"
      >
        {list.map((w) => (
          <li
            key={w.week}
            className="w-[82%] max-w-[340px] flex-none snap-start rounded-[20px] border border-b2-border bg-b2-dark p-4 sm:w-[300px] sm:p-5"
          >
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-b2-caribbean">Week {w.week}</p>
              <p className="text-xs text-b2-pistachio">
                Classes {w.classes[0].n}–{w.classes[w.classes.length - 1].n}
              </p>
            </div>
            <ul className="mt-3 space-y-2.5">
              {w.classes.map((c) => (
                <li key={c.n} className="flex gap-3">
                  <span className="tabular grid size-8 flex-none place-items-center rounded-full bg-b2-pine text-[13px] font-semibold text-b2-caribbean">
                    {c.n}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium leading-snug">{c.topic}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-b2-pistachio">
                      <span className={`size-2 rounded-full ${TONE[c.subject] ?? "bg-b2-caribbean"}`} />
                      {c.subject}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

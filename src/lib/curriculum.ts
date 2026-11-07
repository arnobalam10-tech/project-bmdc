import data from "../../content/curriculum.json";

export type Chapter = { name: string; slug: string; classes: string[] };
export type Subject = { name: string; slug: string; chapters: Chapter[] };
export type ScheduledClass = { code: string; week: number; cls: number; subject: string; topic: string };

export const subjects = data.subjects as Subject[];

/** 48 classes in week order, rebuilt from chapter class codes (W1C1 …). */
export function schedule(): ScheduledClass[] {
  const uses = new Map<string, number>();
  for (const s of subjects) for (const c of s.chapters) for (const code of c.classes) uses.set(code, (uses.get(code) ?? 0) + 1);

  const map = new Map<string, ScheduledClass>();
  for (const s of subjects) {
    for (const c of s.chapters) {
      const own = c.classes.filter((code) => uses.get(code) === 1);
      for (const code of c.classes) {
        const m = /^W(\d+)C(\d+)$/.exec(code)!;
        const shared = (uses.get(code) ?? 0) > 1;
        const part = !shared && own.length > 1 ? ` (Part ${own.indexOf(code) + 1})` : "";
        if (!map.has(code)) {
          map.set(code, {
            code,
            week: +m[1],
            cls: +m[2],
            subject: s.name,
            topic: shared ? "Derma + Rheumatology (Extra)" : c.name + part,
          });
        }
      }
    }
  }
  return [...map.values()].sort((a, b) => a.week - b.week || a.cls - b.cls);
}

export const TOTAL_WEEKS = 16;

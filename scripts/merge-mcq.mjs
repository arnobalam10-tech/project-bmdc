#!/usr/bin/env node
// Merge + validate helper outputs into content/mcq/<set>.json.
//   node scripts/merge-mcq.mjs <dir-with-helper-json>
// - joins "<set>.partN.json" files in order and renumbers question ext_ids
// - validates shape, booleans, explanations and subject/chapter against content/curriculum.json
// - drops exact duplicate stems+options inside a paper
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error("usage: merge-mcq.mjs <dir>");
  process.exit(1);
}
const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const curriculum = JSON.parse(readFileSync(join(root, "content/curriculum.json"), "utf8"));
const valid = new Set(curriculum.subjects.flatMap((s) => s.chapters.map((c) => `${s.name}|${c.name}`)));

const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
const groups = new Map();
for (const f of files) {
  const base = f.replace(/\.part\d+\.json$/, "").replace(/\.json$/, "");
  groups.set(base, [...(groups.get(base) ?? []), f]);
}

const problems = [];
let total = 0;
const report = [];
for (const [base, parts] of groups) {
  let set = null;
  const questions = [];
  for (const f of parts) {
    let data;
    try {
      data = JSON.parse(readFileSync(join(dir, f), "utf8"));
    } catch (e) {
      problems.push(`${f}: invalid JSON (${e.message})`);
      continue;
    }
    set ??= data.set;
    questions.push(...(data.questions ?? []));
  }
  if (!set) continue;

  const seen = new Set();
  const clean = [];
  for (const q of questions) {
    const where = `${base} "${String(q.stem).slice(0, 50)}"`;
    const opts = q.options ?? [];
    const sig = (q.stem + opts.map((o) => o.text).join("|")).toLowerCase().replace(/\W+/g, "");
    if (seen.has(sig)) {
      problems.push(`${where}: duplicate dropped`);
      continue;
    }
    seen.add(sig);
    if (opts.length !== 4 || opts.map((o) => o.label).join("") !== "ABCD") {
      problems.push(`${where}: needs options A-D (has ${opts.map((o) => o.label).join("")})`);
      continue;
    }
    if (opts.some((o) => typeof o.is_true !== "boolean")) {
      problems.push(`${where}: is_true must be boolean`);
      continue;
    }
    if (!valid.has(`${q.subject}|${q.chapter}`)) {
      problems.push(`${where}: unknown chapter "${q.subject} | ${q.chapter}"`);
      continue;
    }
    if (!q.stem?.trim() || opts.some((o) => !String(o.text ?? "").trim())) {
      problems.push(`${where}: empty stem/option`);
      continue;
    }
    if (opts.some((o) => !String(o.explanation ?? "").trim())) problems.push(`${where}: missing explanation (kept)`);
    clean.push(q);
  }
  clean.forEach((q, i) => (q.ext_id = `${set.ext_id}-${String(i + 1).padStart(3, "0")}`));
  set.duration_min = clean.length;
  writeFileSync(join(root, "content/mcq", `${set.ext_id}.json`), JSON.stringify({ set, questions: clean }, null, 2));
  total += clean.length;
  report.push(`${set.ext_id.padEnd(16)} ${String(clean.length).padStart(4)}  (${parts.join(" + ")})`);
}
console.log(report.join("\n"));
console.log(`TOTAL ${total} questions in ${report.length} sets`);
console.log(`\n${problems.length} problem(s):`);
for (const p of problems) console.log(" - " + p);

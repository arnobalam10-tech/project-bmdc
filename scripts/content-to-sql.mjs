#!/usr/bin/env node
// Converts content JSON into idempotent SQL that Claude runs against Supabase (via MCP / SQL editor).
//
//   node scripts/content-to-sql.mjs curriculum            > supabase/seed/curriculum.sql
//   node scripts/content-to-sql.mjs mcq content/mcq/x.json > supabase/seed/x.sql
//
// MCQ files must use subject/chapter names that exist in content/curriculum.json.
import { readFileSync } from "node:fs";

const [, , kind, file] = process.argv;
const q = (s) => (s === null || s === undefined ? "null" : `'${String(s).replace(/'/g, "''")}'`);
const curriculum = JSON.parse(readFileSync(new URL("../content/curriculum.json", import.meta.url), "utf8"));

function curriculumSql() {
  const out = ["-- generated from content/curriculum.json", "begin;"];
  curriculum.subjects.forEach((s, si) => {
    out.push(
      `insert into public.subjects (name, slug, sort) values (${q(s.name)}, ${q(s.slug)}, ${si})
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort;`
    );
    s.chapters.forEach((c, ci) => {
      const codes = `array[${c.classes.map(q).join(",")}]::text[]`;
      out.push(
        `insert into public.chapters (subject_id, name, slug, sort, class_codes)
  select id, ${q(c.name)}, ${q(c.slug)}, ${si * 100 + ci}, ${codes} from public.subjects where slug = ${q(s.slug)}
  on conflict (slug) do update set name = excluded.name, sort = excluded.sort, class_codes = excluded.class_codes, subject_id = excluded.subject_id;`
      );
    });
  });
  out.push("commit;");
  return out.join("\n");
}

function mcqSql(path) {
  const data = JSON.parse(readFileSync(path, "utf8"));
  const valid = new Map();
  for (const s of curriculum.subjects) for (const c of s.chapters) valid.set(`${s.name}|${c.name}`, { s, c });
  const set = data.set;
  if (!["pyq", "model", "topic"].includes(set.kind)) throw new Error(`bad set kind ${set.kind}`);

  const out = [`-- generated from ${path}`, "begin;"];
  out.push(
    `insert into public.question_sets (ext_id, kind, title, pyq_year, pyq_session, duration_min, sort)
  values (${q(set.ext_id)}, ${q(set.kind)}, ${q(set.title)}, ${set.pyq_year ?? "null"}, ${q(set.pyq_session)}, ${set.duration_min ?? data.questions.length}, ${-(set.pyq_year ?? 0)})
  on conflict (ext_id) do update set title = excluded.title, kind = excluded.kind, pyq_year = excluded.pyq_year,
    pyq_session = excluded.pyq_session, duration_min = excluded.duration_min;`
  );

  data.questions.forEach((qq, i) => {
    const hit = valid.get(`${qq.subject}|${qq.chapter}`);
    if (!hit) throw new Error(`${qq.ext_id}: unknown subject/chapter "${qq.subject} → ${qq.chapter}"`);
    const labels = qq.options.map((o) => o.label).join("");
    if (labels !== "ABCD") throw new Error(`${qq.ext_id}: options must be A,B,C,D`);
    out.push(
      `insert into public.questions (ext_id, stem, subject_id, chapter_id, pyq_year, pyq_session, pearl)
  select ${q(qq.ext_id)}, ${q(qq.stem)}, s.id, c.id, ${set.pyq_year ?? "null"}, ${q(set.pyq_session)}, ${q(qq.pearl)}
    from public.subjects s join public.chapters c on c.subject_id = s.id
   where s.slug = ${q(hit.s.slug)} and c.slug = ${q(hit.c.slug)}
  on conflict (ext_id) do update set stem = excluded.stem, subject_id = excluded.subject_id, chapter_id = excluded.chapter_id,
    pyq_year = excluded.pyq_year, pyq_session = excluded.pyq_session, pearl = excluded.pearl;`
    );
    for (const o of qq.options) {
      out.push(
        `insert into public.question_options (question_id, label, text, is_true, explanation)
  select id, ${q(o.label)}, ${q(o.text)}, ${o.is_true ? "true" : "false"}, ${q(o.explanation)} from public.questions where ext_id = ${q(qq.ext_id)}
  on conflict (question_id, label) do update set text = excluded.text, is_true = excluded.is_true, explanation = excluded.explanation;`
      );
    }
    out.push(
      `insert into public.question_set_items (set_id, question_id, position)
  select s.id, qn.id, ${i + 1} from public.question_sets s, public.questions qn
   where s.ext_id = ${q(set.ext_id)} and qn.ext_id = ${q(qq.ext_id)}
  on conflict (set_id, question_id) do update set position = excluded.position;`
    );
  });
  out.push("select public.refresh_topic_sets();", "commit;");
  return out.join("\n");
}

if (kind === "curriculum") console.log(curriculumSql());
else if (kind === "mcq" && file) console.log(mcqSql(file));
else {
  console.error("usage: content-to-sql.mjs curriculum | mcq <file.json>");
  process.exit(1);
}

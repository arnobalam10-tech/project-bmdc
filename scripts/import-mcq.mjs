#!/usr/bin/env node
// Import content/mcq/*.json into Supabase using the service-role key from .env.local.
//   node scripts/import-mcq.mjs              # upsert all sets (safe to re-run)
//   node scripts/import-mcq.mjs --wipe       # FIRST delete every question, set and attempt, then import
// The key is read from .env.local (SUPABASE_SERVICE_ROLE_KEY) and never printed.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const env = Object.fromEntries(
  readFileSync(join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()])
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

if (process.argv.includes("--wipe")) {
  // order matters only for clarity; FKs cascade anyway
  for (const [table, col] of [
    ["attempts", "id"],
    ["question_set_items", "set_id"],
    ["question_sets", "id"],
    ["questions", "id"],
  ]) {
    const { error } = await sb.from(table).delete().not(col, "is", null);
    if (error) {
      console.error(`wipe ${table} failed:`, error.message);
      process.exit(1);
    }
  }
  console.log("Wiped all questions, sets and attempts.");
}

const dir = join(root, "content/mcq");
const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
let ok = 0;
for (const f of files) {
  const data = JSON.parse(readFileSync(join(dir, f), "utf8"));
  const { data: res, error } = await sb.rpc("import_mcq", { p: data });
  if (error) console.error(`✗ ${f}: ${error.message}`);
  else {
    ok++;
    console.log(`✓ ${res}`);
  }
}

const [{ count: q }, { count: o }, { data: sets }] = await Promise.all([
  sb.from("questions").select("id", { count: "exact", head: true }),
  sb.from("question_options").select("id", { count: "exact", head: true }),
  sb.from("question_sets").select("kind"),
]);
const byKind = (sets ?? []).reduce((m, s) => ((m[s.kind] = (m[s.kind] ?? 0) + 1), m), {});
console.log(`\n${ok}/${files.length} files imported. Database now: ${q} questions, ${o} statements, sets ${JSON.stringify(byKind)}`);

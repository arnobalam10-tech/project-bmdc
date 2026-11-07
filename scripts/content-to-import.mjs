#!/usr/bin/env node
// Wraps a content JSON file in the compact SQL call that imports it (run via Supabase MCP or SQL editor).
//   node scripts/content-to-import.mjs curriculum content/curriculum.json
//   node scripts/content-to-import.mjs mcq content/mcq/pyq-2025-may.json
// import_* functions live in supabase/migrations/0003_import_functions.sql and are owner-only.
// (scripts/content-to-sql.mjs produces equivalent long-form SQL if you prefer plain inserts.)
import { readFileSync } from "node:fs";

const [, , kind, file] = process.argv;
if (!["curriculum", "mcq"].includes(kind) || !file) {
  console.error("usage: content-to-import.mjs curriculum|mcq <file.json>");
  process.exit(1);
}
const json = JSON.stringify(JSON.parse(readFileSync(file, "utf8")));
if (json.includes("$j$")) throw new Error("file contains $j$");
console.log(`select public.import_${kind}($j$${json}$j$::jsonb);`);

"""Insert the Project BMDC Free Mock Test (scripts/free_mock_questions.json) as a scheduled model test.

- opens 22 Nov 2026, 7:00 PM Bangladesh time, for every account (free or paid)
- hide_results: one attempt each, no score shown until an admin publishes the results
- the questions are NOT added to the topic sets (that would leak the answers through practice)
Refuses to run if the set already exists."""
import json, os, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env = {}
for line in open(os.path.join(ROOT, ".env.local"), encoding="utf-8"):
    if "=" in line and not line.startswith("#"):
        k, v = line.strip().split("=", 1); env[k] = v.strip('"')
URL, KEY = env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE_KEY"]
H = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json", "Prefer": "return=representation"}
EXT = "mock-free-2026-11"


def call(method, path, body=None):
    req = urllib.request.Request(URL + "/rest/v1/" + path, method=method, headers=H,
                                 data=json.dumps(body).encode() if body is not None else None)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read() or b"[]")


Q = json.load(open(os.path.join(ROOT, "scripts", "free_mock_questions.json"), encoding="utf-8"))
if call("GET", f"question_sets?select=id&ext_id=eq.{EXT}"):
    raise SystemExit("set already exists")
chapters = {c["slug"]: c for c in call("GET", "chapters?select=id,slug,subject_id")}

qset = call("POST", "question_sets", {
    "ext_id": EXT, "kind": "model", "title": "Project BMDC Free Mock Test", "duration_min": len(Q),
    "is_free_sample": True, "free_count": len(Q), "sort": -1000, "published": True,
    "opens_at": "2026-11-22T13:00:00Z", "hide_results": True})[0]

qs = call("POST", "questions", [{
    "ext_id": f"{EXT}-{q['n']:03d}", "stem": q["stem"], "pearl": q["pearl"],
    "subject_id": chapters[q["chapter"]]["subject_id"], "chapter_id": chapters[q["chapter"]]["id"]} for q in Q])
by_ext = {x["ext_id"]: x for x in qs}

opts, items = [], []
for q in Q:
    row = by_ext[f"{EXT}-{q['n']:03d}"]
    for k, text in enumerate(q["options"]):
        opts.append({"question_id": row["id"], "label": "ABCD"[k], "text": text.replace("× 109/L", "× 10⁹/L"),
                     "is_true": q["key"][k] == "T", "explanation": None})
    items.append({"set_id": qset["id"], "question_id": row["id"], "position": q["n"]})
call("POST", "question_options", opts)
call("POST", "question_set_items", items)
print("set", qset["id"], "questions", len(qs), "options", len(opts))

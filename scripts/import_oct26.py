"""Insert the BMDC RQE October 2026 paper (scripts/oct26_questions.py) via the Supabase REST API.
Idempotent: refuses to run if the set already exists."""
import json, urllib.request, urllib.parse
from oct26_questions import Q

env = {}
for line in open(r"D:\BMDC\.env.local", encoding="utf-8"):
    if "=" in line and not line.startswith("#"):
        k, v = line.strip().split("=", 1); env[k] = v.strip('"')
URL, KEY = env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE_KEY"]
H = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json", "Prefer": "return=representation"}


def call(method, path, body=None):
    req = urllib.request.Request(URL + "/rest/v1/" + path, method=method, headers=H,
                                 data=json.dumps(body).encode() if body is not None else None)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read() or b"[]")


if call("GET", "question_sets?select=id&ext_id=eq.pyq-2026-oct"):
    raise SystemExit("set already exists")

chapters = {c["slug"]: c for c in call("GET", "chapters?select=id,slug,subject_id")}
topic_sets = {s["chapter_id"]: s["id"] for s in call("GET", "question_sets?select=id,chapter_id&kind=eq.topic")}

qset = call("POST", "question_sets", {"ext_id": "pyq-2026-oct", "kind": "pyq", "title": "BMDC RQE — October 2026",
            "pyq_year": 2026, "pyq_session": "October", "duration_min": len(Q), "free_count": 10,
            "sort": -202610, "published": True})[0]

qs = call("POST", "questions", [{"ext_id": f"pyq-2026-oct-{i:03d}", "stem": stem, "pearl": pearl,
          "subject_id": chapters[ch]["subject_id"], "chapter_id": chapters[ch]["id"],
          "pyq_year": 2026, "pyq_session": "October"} for i, (ch, stem, _, pearl) in enumerate(Q, 1)])
by_ext = {q["ext_id"]: q for q in qs}

opts, items = [], []
next_pos = {}
for i, (ch, _, options, _) in enumerate(Q, 1):
    q = by_ext[f"pyq-2026-oct-{i:03d}"]
    for k, (text, is_true, expl) in enumerate(options):
        opts.append({"question_id": q["id"], "label": "ABCD"[k], "text": text, "is_true": is_true, "explanation": expl})
    items.append({"set_id": qset["id"], "question_id": q["id"], "position": i})
    ts = topic_sets[q["chapter_id"]]
    if ts not in next_pos:
        cur = call("GET", f"question_set_items?select=position&set_id=eq.{ts}&order=position.desc&limit=1")
        next_pos[ts] = (cur[0]["position"] if cur else 0) + 1
    items.append({"set_id": ts, "question_id": q["id"], "position": next_pos[ts]})
    next_pos[ts] += 1

call("POST", "question_options", opts)
call("POST", "question_set_items", items)
print("set", qset["id"], "questions", len(qs), "options", len(opts), "items", len(items))

"""Build topic flashcards from the MCQ bank and replace public.flashcards.

Each card = one topic per chapter (MCQs with the same stem topic are merged):
  points = the correct options (for "except" stems, the other options), de-duplicated
  notes  = the teaching pearls, de-duplicated
Wrong options are never shown. Re-run after adding questions:
  python scripts/build_flashcards.py          # build + upload
  python scripts/build_flashcards.py --dry    # build only, writes flashcards.preview.json
"""
import json, re, os, collections, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = dict(l.strip().split("=", 1) for l in open(os.path.join(ROOT, ".env.local"), encoding="utf-8") if "=" in l and not l.startswith("#"))
URL = ENV["NEXT_PUBLIC_SUPABASE_URL"].strip('"'); KEY = ENV["SUPABASE_SERVICE_ROLE_KEY"].strip('"')
HDR = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}

def rest(method, path, body=None, extra=None):
    r = urllib.request.Request(f"{URL}/rest/v1/{path}", method=method, headers={**HDR, **(extra or {})},
                               data=json.dumps(body).encode() if body is not None else None)
    with urllib.request.urlopen(r) as res:
        txt = res.read(); return json.loads(txt) if txt else None

def get_all(path):
    out, off = [], 0
    while True:
        d = rest("GET", path, extra={"Range": f"{off}-{off+999}"}); out += d
        if len(d) < 1000: return out
        off += 1000

d = {
    "chapters": get_all("chapters?select=id,slug,name,subject_id,sort"),
    "questions": get_all("questions?select=id,ext_id,stem,pearl,chapter_id,pyq_year,pyq_session"),
    "options": get_all("question_options?select=question_id,label,text,is_true,explanation"),
}
opts = collections.defaultdict(list)
for o in d["options"]: opts[o["question_id"]].append(o)
chap = {c["id"]: c for c in d["chapters"]}

STOP = set("of the a an and in is are by with for to on following which seen caused due may be can its their".split())
CAT = [  # stem prefix -> category, so 'Causes of X' and 'Features of X' never merge
  (r"^(common |important |major |main )?(causes?|aetiology|etiology|causative)\b|caused by|\bcauses?\b", "cause"),
  (r"^(clinical )?(features?|signs?|symptoms?|manifestations?|characteristics?|findings?)\b|presents? with|clinical", "feature"),
  (r"complications?", "complication"),
  (r"^(treatment|management|drugs?|indications?)", "treatment"),
  (r"risk factors?|predispos", "risk"),
  (r"investigations?|diagnos|tests?", "invest"),
]
def stem_word(w):
    w = re.sub(r"(ies)$", "y", w); return re.sub(r"(es|s)$", "", w) if len(w) > 4 else w
def key(stem):
    s = stem.lower().rstrip(": ")
    s = re.sub(r",?\s*except$", "", s)
    s = re.sub(r"\([^)]*\)", " ", s)
    cat = next((c for p, c in CAT if re.search(p, s)), "other")
    if cat == "other" and re.search(r"(seen|found|occurs?) in$", s): cat = "cause"
    toks = [stem_word(t) for t in re.findall(r"[a-z0-9]+", s)]
    drop = {"cause","feature","sign","symptom","complication","clinical","common","major","important","main","risk","factor","treatment","management","drug","indication","investigation","diagnosi","test","characteristic","finding","manifestation",
            "caused","seen","found","occur","typically","usually","aetiology","etiology","causative"}
    toks = sorted(set(t for t in toks if t not in STOP and t not in drop))
    return cat, tuple(toks)

def title(stem):
    t = stem.strip().rstrip(":").strip()
    t = re.sub(r",?\s*except$", "", t, flags=re.I)
    t = re.sub(r"\s*\((high|low)[^)]*\)", "", t, flags=re.I)
    t = re.sub(r"^regarding\s+", "", t, flags=re.I)
    t = re.sub(r"^(the following are|which of the following)\s+", "", t, flags=re.I)
    t = re.sub(r"\s+(is|are) caused by$", " — causes", t, flags=re.I)
    t = re.sub(r"\s+((is|are)\s+)?((typically|usually|commonly|mostly)\s+)?(found|seen|occurs?) in$", " — seen in", t, flags=re.I)
    t = re.sub(r"\s+(include|includes|is|are)$", "", t, flags=re.I)
    return t[:1].upper() + t[1:]


ABBR = {"tb":"tuberculosis","sle":"systemic lupus erythematosus","mi":"myocardial infarction","dm":"diabetes mellitus","ckd":"chronic kidney disease","pid":"pelvic inflammatory disease","uti":"urinary tract infection","copd":"chronic obstructive pulmonary disease","ibd":"inflammatory bowel disease","htn":"hypertension"}
def canon(x):
    x = re.sub(r"\([^)]*\)", " ", x.lower())
    w = [ABBR.get(t, t) for t in re.findall(r"[a-z0-9]+", x)]
    return " ".join(stem_word(t) for t in " ".join(w).split())
def dedupe_points(pts):
    keep = []
    for p in pts:
        c = canon(p); hit = None
        for i, k in enumerate(keep):
            kc = canon(k)
            if c == kc or f" {c} " in f" {kc} " or f" {kc} " in f" {c} ":
                hit = i; break
        if hit is None: keep.append(p)
        elif len(p) > len(keep[hit]): keep[hit] = p   # keep the more descriptive wording
    return keep
def dedupe_notes(ns):
    keep = []
    for n in ns:
        a = set(canon(n).split()); hit = None
        for i, k in enumerate(keep):
            b = set(canon(k).split())
            if len(a & b) / max(1, min(len(a), len(b))) >= 0.6: hit = i; break
        if hit is None: keep.append(n)
        elif len(n) > len(keep[hit]): keep[hit] = n
    return keep

OVERRIDE = {"The following are NOT immovable joints:": "Joints that are not immovable"}
def norm(x): return re.sub(r"[^a-z0-9]+", " ", x.lower()).strip()

groups = collections.OrderedDict()
for q in sorted(d["questions"], key=lambda q: (chap[q["chapter_id"]]["sort"] if q["chapter_id"] else 999, q["ext_id"])):
    if not q["chapter_id"]: continue
    k = (q["chapter_id"],) + key(q["stem"])
    groups.setdefault(k, []).append(q)

cards = []; pos = collections.Counter()
for k, qs in groups.items():
    pts, seen, notes, nseen, years = [], set(), [], set(), set()
    for q in qs:
        neg = bool(re.search(r"\bexcept\b", q["stem"], re.I))
        for o in sorted(opts[q["id"]], key=lambda o: o["label"]):
            if o["is_true"] != neg and norm(o["text"]) not in seen:
                seen.add(norm(o["text"])); pts.append(o["text"].strip())
        if q["pearl"] and norm(q["pearl"]) not in nseen:
            nseen.add(norm(q["pearl"])); notes.append(q["pearl"].strip())
        if q["pyq_year"]: years.add(q["pyq_year"])
    pts, notes = dedupe_points(pts), dedupe_notes(notes)
    if not pts and not notes: continue
    # pick the cleanest title: shortest stem that starts like a heading
    best = min(qs, key=lambda q: (not q["stem"].lower().startswith(("causes", "features", "complications", "clinical", "treatment", "signs", "risk")), q["stem"].lower().startswith(("a ", "an ", "in ", "the ", "which")), len(q["stem"])))
    t = OVERRIDE.get(best["stem"], title(best["stem"]))
    pos[k[0]] += 1
    cards.append({"chapter_id": k[0], "position": pos[k[0]], "title": t, "points": pts, "notes": notes,
                  "years": sorted(years), "question_ids": [q["id"] for q in qs]})
print("questions", sum(len(c["question_ids"]) for c in cards), "-> cards", len(cards))
print("merged cards", sum(len(c["question_ids"]) > 1 for c in cards), "no-points", sum(not c["points"] for c in cards))

if "--dry" in sys.argv:
    json.dump(cards, open(os.path.join(ROOT, "flashcards.preview.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    sys.exit()
rest("DELETE", "flashcards?id=not.is.null")
for i in range(0, len(cards), 200):
    rest("POST", "flashcards", cards[i:i + 200], {"Prefer": "return=minimal"})
print("uploaded", len(cards))

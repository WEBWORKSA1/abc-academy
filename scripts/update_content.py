#!/usr/bin/env python3
"""ABC.Academy auto-refresh job (run daily by .github/workflows/auto-refresh.yml).

Updates, without touching the HTML pages:
  data/daily.json   letter of the day, word of the day, number puzzle
  data/videos.json  latest uploads from trusted kids' learning channels (YouTube RSS) merged with the curated list
  data/news.json    early-learning headlines (Google News RSS)
  data/status.json  run report

Standard library only. Every source is optional: if a fetch fails, the previous data is kept.
"""
import datetime as dt
import json
import pathlib
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
UA = {"User-Agent": "Mozilla/5.0 (compatible; ABC.Academy content refresher; +https://abc.academy)"}
NOW = dt.datetime.now(dt.timezone.utc)
TODAY = NOW.date()

# Channels: handle -> (known channel id or "", default category)
CHANNELS = {
    "JackHartmann": ("", "Phonics & reading"),
    "SuperSimpleSongs": ("", "Songs & vocabulary"),
    "KidsTV123": ("", "Alphabet"),
    "Thesingingwalrus": ("", "Songs & vocabulary"),
    "Numberblocks": ("UCPlwvN0w4qFSP1FllALB92w", "Numbers & math"),
    "Alphablocks": ("", "Phonics & reading"),
    "ScratchGarden": ("", "Songs & vocabulary"),
    "havefunteaching": ("", "Phonics & reading"),
    "StorylineOnline": ("", "Stories"),
}
CATEGORY_RULES = [
    ("Alphabet", r"\b(abc|alphabet|letter [a-z]\b|letters)\b"),
    ("Phonics & reading", r"\b(phonics|sound|vowel|cvc|sight word|reading|rhym|blend|digraph|word famil)"),
    ("Numbers & math", r"\b(count|number|math|maths|add|subtract|numberblocks|skip|1-10|1-100|to 100)\b"),
    ("Shapes & colors", r"\b(shape|color|colour)"),
    ("Calendar & time", r"\b(day|days|week|month|season|time|clock|calendar)\b"),
    ("Stories", r"\b(read aloud|read-aloud|story|storytime)\b"),
]
NEWS_QUERIES = ["early childhood literacy", "kindergarten readiness", "phonics reading instruction", "preschool education"]

LETTERS = [("A", "ah", "apple", "🍎"), ("B", "buh", "ball", "⚽"), ("C", "kuh", "cat", "🐱"), ("D", "duh", "dog", "🐶"), ("E", "eh", "egg", "🥚"),
           ("F", "fff", "fish", "🐟"), ("G", "guh", "goat", "🐐"), ("H", "huh", "hat", "🎩"), ("I", "ih", "insect", "🐞"), ("J", "juh", "juice", "🧃"),
           ("K", "kuh", "kite", "🪁"), ("L", "lll", "lion", "🦁"), ("M", "mmm", "moon", "🌙"), ("N", "nnn", "nose", "👃"), ("O", "ah", "octopus", "🐙"),
           ("P", "puh", "pig", "🐷"), ("Q", "kwuh", "queen", "👸"), ("R", "rrr", "rabbit", "🐰"), ("S", "sss", "sun", "☀️"), ("T", "tuh", "tiger", "🐯"),
           ("U", "uh", "umbrella", "☂️"), ("V", "vvv", "van", "🚐"), ("W", "wuh", "watermelon", "🍉"), ("X", "ks", "box", "📦"), ("Y", "yuh", "yo-yo", "🪀"), ("Z", "zzz", "zebra", "🦓")]
WORDS = [("curious", "🔍", "A curious kid asks lots of questions."), ("gigantic", "🦕", "The dinosaur was gigantic."), ("gentle", "🕊️", "Be gentle with the kitten."),
         ("brave", "🦁", "It was brave to try the tall slide."), ("sparkle", "✨", "The stars sparkle at night."), ("tiny", "🐜", "An ant is tiny."),
         ("delicious", "🍓", "The strawberries were delicious."), ("giggle", "😆", "The puppy made us giggle."), ("enormous", "🐘", "An elephant is enormous."),
         ("quiet", "🤫", "The library is a quiet place."), ("shiny", "🪙", "She found a shiny coin."), ("fluffy", "🐑", "The sheep is fluffy."),
         ("speedy", "🏎️", "The race car is speedy."), ("grumpy", "😠", "The grumpy cat wanted a nap."), ("patient", "⏳", "Be patient while the cookies bake."),
         ("explore", "🧭", "Let's explore the garden."), ("melt", "🍦", "Ice cream can melt in the sun."), ("soar", "🦅", "Eagles soar high in the sky."),
         ("crunchy", "🥕", "Carrots are crunchy."), ("cozy", "🛋️", "The blanket feels cozy."), ("splash", "💦", "We splash in the puddles."),
         ("whisper", "🤫", "Please whisper in the hallway."), ("bright", "☀️", "The sun is bright today."), ("sticky", "🍯", "Honey is sticky."),
         ("helpful", "🤝", "Thank you for being helpful."), ("soggy", "🥣", "The cereal got soggy."), ("wobble", "🍮", "The jelly began to wobble."),
         ("build", "🧱", "We can build a tall tower."), ("chilly", "🥶", "It is chilly outside."), ("proud", "🏅", "I feel proud of my work.")]


def fetch(url, timeout=20):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def load(name, default):
    p = DATA / name
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return default


def save(name, obj):
    (DATA / name).write_text(json.dumps(obj, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def daily():
    n = (TODAY - dt.date(1970, 1, 1)).days
    l = LETTERS[n % 26]
    w = WORDS[n % len(WORDS)]
    a, b = 1 + (n * 7) % 9, 1 + (n * 3) % 9
    save("daily.json", {"date": TODAY.isoformat(), "letter": {"upper": l[0], "lower": l[0].lower(), "sound": l[1], "word": l[2], "emoji": l[3]},
                        "word": {"word": w[0], "emoji": w[1], "sentence": w[2]}, "challenge": {"q": f"{a} + {b} = ?", "a": a + b}})
    return "ok"


def resolve_channel(handle):
    html = fetch(f"https://www.youtube.com/@{handle}").decode("utf-8", "ignore")
    for pat in (r'"externalId":"(UC[\w-]{22})"', r'<meta itemprop="identifier" content="(UC[\w-]{22})"', r'"channelId":"(UC[\w-]{22})"',
                r'youtube\.com/channel/(UC[\w-]{22})'):
        m = re.search(pat, html)
        if m:
            return m.group(1)
    return None


def categorize(title, default):
    t = title.lower()
    for cat, pat in CATEGORY_RULES:
        if re.search(pat, t):
            return cat
    return default


def videos():
    data = load("videos.json", {"videos": []})
    cache = data.get("channels", {})
    existing = {v["id"]: v for v in data.get("videos", [])}
    ns = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015", "media": "http://search.yahoo.com/mrss/"}
    added, errors = 0, []
    for handle, (cid, default_cat) in CHANNELS.items():
        try:
            cid = cid or cache.get(handle) or resolve_channel(handle)
            if not cid:
                errors.append(f"{handle}: channel id not found")
                continue
            cache[handle] = cid
            root = ET.fromstring(fetch(f"https://www.youtube.com/feeds/videos.xml?channel_id={cid}"))
            channel_name = (root.findtext("a:title", default=handle, namespaces=ns) or handle).strip()
            for e in root.findall("a:entry", ns)[:8]:
                vid = e.findtext("yt:videoId", namespaces=ns)
                title = (e.findtext("a:title", default="", namespaces=ns) or "").strip()
                if not vid or "#short" in title.lower():
                    continue
                if vid not in existing:
                    added += 1
                existing[vid] = {**existing.get(vid, {}), "id": vid, "title": title, "channel": channel_name,
                                 "category": existing.get(vid, {}).get("category") or categorize(title, default_cat),
                                 "published": e.findtext("a:published", default="", namespaces=ns)}
        except Exception as ex:  # keep going on any channel failure
            errors.append(f"{handle}: {ex}")
    vids = list(existing.values())
    pinned = [v for v in vids if v.get("pinned")]
    fresh = sorted([v for v in vids if not v.get("pinned")], key=lambda v: v.get("published", ""), reverse=True)[:150]
    # Interleave newest uploads ahead of the curated favourites so the library feels new every day.
    merged, i, j = [], 0, 0
    while i < len(fresh) or j < len(pinned):
        merged.extend(fresh[i:i + 3]); i += 3
        if j < len(pinned):
            merged.append(pinned[j]); j += 1
    data.update({"updated": NOW.isoformat(timespec="seconds"), "channels": cache, "videos": merged})
    save("videos.json", data)
    return f"{len(merged)} videos, {added} new" + (f"; errors: {errors}" if errors else "")


def news():
    data = load("news.json", {"items": []})
    items = {i["title"]: i for i in data.get("items", [])}
    errors, fetched = [], 0
    for q in NEWS_QUERIES:
        url = "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": q + " when:14d", "hl": "en-US", "gl": "US", "ceid": "US:en"})
        try:
            root = ET.fromstring(fetch(url))
            for it in root.iter("item"):
                title = (it.findtext("title") or "").strip()
                src = (it.findtext("source") or "").strip()
                if src and title.endswith(" - " + src):
                    title = title[: -len(src) - 3]
                if not title:
                    continue
                pub = it.findtext("pubDate") or ""
                try:
                    pub_iso = dt.datetime.strptime(pub, "%a, %d %b %Y %H:%M:%S %Z").replace(tzinfo=dt.timezone.utc).isoformat()
                except Exception:
                    pub_iso = NOW.isoformat()
                fetched += 1
                items[title] = {"title": title, "link": it.findtext("link") or "", "source": src, "date": pub_iso, "topic": q}
        except Exception as ex:
            errors.append(f"{q}: {ex}")
    if not fetched:
        return "no new headlines fetched; kept existing" + (f"; errors: {errors}" if errors else "")
    cutoff = (NOW - dt.timedelta(days=120)).isoformat()
    keep = sorted([i for i in items.values() if i.get("date", "") >= cutoff], key=lambda i: i["date"], reverse=True)[:60]
    if keep:
        save("news.json", {"updated": NOW.isoformat(timespec="seconds"), "items": keep})
    return f"{len(keep)} headlines" + (f"; errors: {errors}" if errors else "")


def main():
    report = {"ran": NOW.isoformat(timespec="seconds")}
    for name, fn in (("daily", daily), ("videos", videos), ("news", news)):
        try:
            report[name] = fn()
        except Exception as ex:
            report[name] = f"failed: {ex}"
    save("status.json", report)
    print(json.dumps(report, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()

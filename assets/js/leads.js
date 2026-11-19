/* Multi-step learning-plan + tutor-match lead form with lead scoring and an instant starter plan. */
(function () {
  var ABC = window.ABC;
  var form = document.getElementById("lead-form"); if (!form) return;
  var steps = form.querySelectorAll(".step"), bar = form.querySelector(".stepper"), cur = 0, KEY = "lead_draft";
  bar.innerHTML = Array.prototype.map.call(steps, function () { return "<i></i>"; }).join("");

  function show(i) {
    cur = i;
    steps.forEach(function (s, j) { s.classList.toggle("active", j === i); });
    bar.querySelectorAll("i").forEach(function (b, j) { b.classList.toggle("on", j <= i); });
    form.querySelector("[data-prev]").style.visibility = i === 0 ? "hidden" : "visible";
    form.querySelector("[data-next]").hidden = i === steps.length - 1;
    form.querySelector("[type=submit]").hidden = i !== steps.length - 1;
    form.querySelector(".step-count").textContent = "Step " + (i + 1) + " of " + steps.length;
  }
  function valid(i) {
    var s = steps[i], ok = true;
    s.querySelectorAll("input,select,textarea").forEach(function (el) {
      if (ok && !el.checkValidity()) { el.reportValidity(); ok = false; }
    });
    var group = s.querySelector("[data-need-one]");
    if (ok && group && !group.querySelector("input:checked")) { ABC.toast("Pick at least one option to continue."); ok = false; }
    return ok;
  }
  form.querySelector("[data-next]").addEventListener("click", function () { if (valid(cur)) { save(); show(cur + 1); form.scrollIntoView({ behavior: "smooth", block: "start" }); } });
  form.querySelector("[data-prev]").addEventListener("click", function () { show(Math.max(0, cur - 1)); });

  function save() {
    var d = {}; new FormData(form).forEach(function (v, k) { if (k.charAt(0) !== "_") d[k] = d[k] ? [].concat(d[k], v) : v; });
    ABC.store.set(KEY, d);
  }
  function restore(d) {
    Object.keys(d || {}).forEach(function (k) {
      var vals = [].concat(d[k]);
      form.querySelectorAll('[name="' + k + '"]').forEach(function (el) {
        if (el.type === "radio" || el.type === "checkbox") el.checked = vals.indexOf(el.value) > -1;
        else if (el.tagName !== "INPUT" || el.type !== "hidden") el.value = vals[0];
      });
    });
  }
  restore(ABC.store.get(KEY, null));
  var p = new URLSearchParams(location.search);
  var focusMap = { letters: "Letters & sounds", reading: "Phonics & reading", math: "Numbers & math", motor: "Handwriting" };
  var ageMap = { "3": "Age 3", "4": "Age 4 (Pre-K)", "5": "Age 5 (Kindergarten)", "6": "Age 6 (Grade 1)", "7": "Age 7-8 (Grade 2+)" };
  if (p.get("age") && ageMap[p.get("age")]) { var a = form.querySelector('[name="child_age"][value="' + ageMap[p.get("age")] + '"]'); if (a) a.checked = true; }
  if (p.get("focus") && focusMap[p.get("focus")]) { var f = form.querySelector('[name="focus"][value="' + focusMap[p.get("focus")] + '"]'); if (f) f.checked = true; }
  form.querySelector("[name=source]").value = p.get("from") || document.referrer.replace(/^https?:\/\/[^/]+/, "") || "direct";
  if (p.get("score")) form.querySelector("[name=readiness_score]").value = p.get("score") + "%";
  form.addEventListener("change", save);

  function score(d) {
    var s = 0;
    s += { "Online 1:1 tutor": 30, "In-person tutor": 30, "Small-group class": 20, "School or center program": 25, "Learning app suggestions": 10, "Just the free plan": 0 }[d.support] || 0;
    s += { "Free resources only": 0, "Under $50/month": 10, "$50-$150/month": 25, "$150-$300/month": 35, "$300+/month": 40 }[d.budget] || 0;
    s += { "This week": 25, "This month": 15, "Just exploring": 0 }[d.timeline] || 0;
    if (d.phone) s += 5;
    return s;
  }
  var plans = {
    "Letters & sounds": ["Explore 3 letters in the Alphabet explorer and say each sound", "Trace your letter of the day (print a letter sheet)", "Letter Pop game: 1 full round", "Find 5 things at home that start with today's letter", "Big & Little Match game", "Read a picture book; point to letters you know", "Review week: say A to Z together"],
    "Phonics & reading": ["Build 5 words in the Phonics lab (-at family)", "Read 'The Big Red Bus' together", "Rhyme Time game: 1 round", "CVC picture-write worksheet", "Spell It game: 1 round", "Read 'Ten Hens in a Pen' and answer the questions", "Magic e: try 5 word pairs"],
    "Sight words": ["Flashcards: 10 Pre-primer words", "Listening quiz: 10 questions", "Trace 8 sight words (print a sheet)", "Sight Word Hunt game", "Read 'Max Can Help' and spot sight words", "Word wall: read every word you know", "Quiz again and beat your score"],
    "Numbers & math": ["Count & Tap game: 1 round", "Ten frame: show 1 to 10", "Number tracing 1 to 10", "Hundred chart: count by 10s", "Addition within 5 (10 problems)", "Missing numbers to 20 worksheet", "Practice mode: get a streak of 5"],
    "Handwriting": ["Name tracing sheet", "Trace 2 letters on screen with a finger", "Letter tracing sheet: first letter of their name", "Draw circles, crosses and squares", "Number tracing 1 to 10", "Trace 5 sight words", "Write their name without tracing"],
    "School readiness": ["Readiness check (5 minutes)", "Alphabet explorer: A to G", "Count & Tap game", "Name tracing sheet", "Read 'Kate and the Kite' together", "Rhyme Time game", "Talk about the school day with a story"]
  };

  ABC.bindForm(form, {
    enrich: function (d) {
      var s = score(d); d.lead_score = s; d.lead_tier = s >= 70 ? "HOT" : s >= 40 ? "WARM" : "NURTURE";
      d.name = d.parent_name;
    },
    done: function (d) {
      ABC.store.set(KEY, null);
      var focus = (d.focus || "School readiness").split(", ")[0], list = plans[focus] || plans["School readiness"];
      document.getElementById("plan-out").innerHTML = "<h3>Your first 7 days: " + ABC.esc(focus) + '</h3><ol style="text-align:left">' +
        list.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol><p class=\"muted\">The full 30-day plan is on its way to your inbox." +
        (d.support && d.support !== "Just the free plan" ? " A team member will follow up about " + ABC.esc(d.support.toLowerCase()) + " options." : "") + "</p>";
    }
  });
  show(0);
})();

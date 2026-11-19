/* Reading & school readiness check: a parent checklist that scores four skill areas. */
(function () {
  var ABC = window.ABC;
  var form = document.getElementById("rq"); if (!form) return;
  var domains = [
    { k: "letters", n: "Letters & sounds", link: "alphabet.html", tool: "Alphabet explorer", items: ["Names most capital letters when you point to them", "Says the sound many letters make (B says /b/)", "Hears the first sound in a word (ball starts with /b/)"] },
    { k: "reading", n: "Early reading", link: "phonics.html", tool: "Phonics lab", items: ["Hears or makes rhymes (cat, hat, bat)", "Recognizes their own name in print", "Retells a short story in the right order"] },
    { k: "math", n: "Numbers", link: "math.html", tool: "Numbers & math", items: ["Counts objects to 10, touching each one once", "Recognizes written numbers 1 to 10", "Tells which group has more"] },
    { k: "motor", n: "Writing & focus", link: "worksheets.html?type=name", tool: "Name tracing sheets", items: ["Holds a crayon with fingers, not a fist", "Copies a circle, a cross and a square", "Sticks with a calm activity for about 10 minutes"] }
  ];
  var list = document.getElementById("rq-items"), n = 0;
  list.innerHTML = domains.map(function (d) {
    return '<fieldset class="q-card" style="margin-bottom:1rem;border:2px solid var(--rule-soft)"><legend class="legend" style="padding:0 .4rem">' + d.n + "</legend>" +
      d.items.map(function (it) {
        n++; var nm = "q" + n;
        return '<div style="margin:.8rem 0 1.1rem"><div>' + it + '</div><div class="scale" role="radiogroup" aria-label="' + ABC.esc(it) + '">' +
          ["Not yet", "Sometimes", "Yes, easily"].map(function (lab, v) { return '<label><input type="radio" name="' + nm + '" value="' + v + '" data-d="' + d.k + '" required><span>' + lab + "</span></label>"; }).join("") + "</div></div>";
      }).join("") + "</fieldset>";
  }).join("");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var age = form.age.value, sums = {}, total = 0;
    domains.forEach(function (d) { sums[d.k] = 0; });
    form.querySelectorAll("input[type=radio]:checked").forEach(function (r) { sums[r.dataset.d] += +r.value; total += +r.value; });
    var pct = Math.round(total / 24 * 100), expect = { "3": 30, "4": 50, "5": 70, "6": 85, "7": 90 }[age] || 60;
    var status = pct >= expect + 10 ? "Ahead of the curve" : pct >= expect - 10 ? "Right on track" : "Ready for a boost";
    var ranked = domains.slice().sort(function (a, b) { return sums[a.k] - sums[b.k]; }), focus = ranked[0];
    var out = document.getElementById("rq-result");
    out.innerHTML = '<div class="panel ruled-top"><p class="step-count">Your child\'s snapshot · age ' + ABC.esc(age) + '</p><h2 style="margin-bottom:.2rem">' + status + '</h2><p class="lede">Overall score ' + pct + "%. The strongest next step is <b>" + focus.n.toLowerCase() + "</b>.</p>" +
      domains.map(function (d) {
        var p = Math.round(sums[d.k] / 6 * 100);
        return '<div style="margin:.9rem 0"><div style="display:flex;justify-content:space-between"><b>' + d.n + "</b><span>" + p + '%</span></div><div class="meter"><i style="width:' + p + '%"></i></div></div>';
      }).join("") +
      '<h3 style="margin-top:1.5rem">Try this week</h3><ul>' + ranked.slice(0, 2).map(function (d) { return '<li><a href="' + ABC.url(d.link) + '">' + d.tool + "</a>: 10 minutes a day on " + d.n.toLowerCase() + ".</li>"; }).join("") +
      '<li>Read one picture book together every day and talk about it.</li></ul>' +
      '<div class="inline-cta" style="margin-bottom:0"><h3>Get a free 30-day plan built around these results</h3><p>We\'ll send a day-by-day plan for ' + focus.n.toLowerCase() + ' and, if you want, match you with a vetted tutor or program in your budget.</p>' +
      '<a class="btn btn-primary btn-lg" href="' + ABC.url("get-started.html") + "?from=readiness&age=" + encodeURIComponent(age) + "&focus=" + focus.k + "&score=" + pct + '">Send me the free plan</a></div>' +
      '<p class="form-note">This checklist is a home guide, not a diagnosis. If you have concerns about speech, hearing, vision or development, talk to your pediatrician or your child\'s teacher.</p></div>';
    out.hidden = false; out.scrollIntoView({ behavior: "smooth" });
    ABC.store.set("readiness", { age: age, pct: pct, focus: focus.k, t: Date.now() });
  });
})();

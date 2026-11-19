/* Page modules: home, videos, news, contests, careers, support, search. Each runs only if its elements exist. */
(function () {
  var ABC = window.ABC, W = window.ABCWords, $ = function (id) { return document.getElementById(id); };
  function fmtDate(s) { try { return new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); } catch (e) { return ""; } }

  // ---------- Home: alphabet wall ----------
  var wall = $("alpha-wall");
  if (wall && W) {
    var cols = ["c-red", "c-sky", "c-leaf", "c-sun", "c-grape"], said = $("said");
    W.letters.forEach(function (L, i) {
      var b = document.createElement("button"); b.className = "block " + cols[i % 5]; b.textContent = L.l; b.style.animationDelay = (i * 22) + "ms";
      b.setAttribute("aria-label", L.l + " is for " + L.w[0][0]);
      b.addEventListener("click", function () {
        var w = ABC.pick(L.w);
        said.textContent = L.l + " is for " + w[0] + " " + w[1];
        ABC.speak(L.l + ". " + L.l + " says " + L.s + ". " + L.l + " is for " + w[0]);
      });
      wall.appendChild(b);
    });
    var rnd = document.createElement("button"); rnd.className = "block c-ink"; rnd.textContent = "?"; rnd.setAttribute("aria-label", "Surprise letter");
    rnd.addEventListener("click", function () { wall.querySelectorAll(".block")[Math.floor(Math.random() * 26)].click(); });
    var all = document.createElement("a"); all.className = "block c-ink"; all.href = ABC.url("alphabet.html"); all.textContent = "▶"; all.setAttribute("aria-label", "Open the alphabet explorer"); all.style.textDecoration = "none";
    wall.appendChild(rnd); wall.appendChild(all);
  }

  // ---------- Home: daily cards ----------
  if ($("daily-letter")) {
    ABC.daily().then(function (d) {
      if (!d) return;
      $("daily-letter").innerHTML = '<div class="big">' + d.letter.upper + d.letter.lower + " " + d.letter.emoji + '</div><p>' + d.letter.upper + " says /" + d.letter.sound + "/, like <b>" + d.letter.word + '</b>.</p><a href="' + ABC.url("alphabet.html?letter=" + d.letter.upper) + '">Explore the letter ' + d.letter.upper + "</a>";
      $("daily-word").innerHTML = '<div class="big">' + d.word.word + " " + d.word.emoji + "</div><p>" + d.word.sentence + '</p><button class="btn btn-ghost btn-sm" data-say-text="' + ABC.esc(d.word.word + ". " + d.word.sentence) + '">🔊 Hear it</button>';
      $("daily-challenge").innerHTML = '<div class="big">' + d.challenge.q + '</div><p>Count on your fingers or use the ten frame.</p><button class="btn btn-ghost btn-sm" data-reveal="' + d.challenge.a + '">Show the answer</button>';
    });
    document.addEventListener("click", function (e) {
      var s = e.target.closest("[data-say-text]"); if (s) ABC.speak(s.getAttribute("data-say-text"));
      var r = e.target.closest("[data-reveal]"); if (r) { r.outerHTML = '<b style="font-size:1.4rem">' + r.getAttribute("data-reveal") + " 🎉</b>"; ABC.addStar(1); }
    });
  }

  // ---------- Videos ----------
  var vgrid = $("video-grid"), hv = $("home-videos");
  if (vgrid || hv) {
    ABC.json("data/videos.json").then(function (data) {
      var vids = data.videos || [];
      if (hv) { hv.innerHTML = vids.slice(0, 6).map(ABC.videoCard).join(""); ABC.liteYT(hv); return; }
      var cats = ["All"].concat(vids.map(function (v) { return v.category; }).filter(function (c, i, a) { return c && a.indexOf(c) === i; }));
      var chips = $("video-cats"), q = $("video-q"), more = $("video-more"), active = "All", shown = 18;
      $("video-updated").textContent = data.updated ? "Library refreshed " + fmtDate(data.updated) + " · " + vids.length + " videos" : vids.length + " videos";
      chips.innerHTML = cats.map(function (c) { return '<button class="chip' + (c === "All" ? " on" : "") + '">' + ABC.esc(c) + "</button>"; }).join("");
      function draw() {
        var term = (q.value || "").toLowerCase();
        var list = vids.filter(function (v) { return (active === "All" || v.category === active) && (!term || (v.title + " " + v.channel).toLowerCase().indexOf(term) > -1); });
        vgrid.innerHTML = list.slice(0, shown).map(ABC.videoCard).join("") || '<p class="muted">No videos match that search. Try a letter, a number or a topic like "shapes".</p>';
        more.hidden = list.length <= shown; ABC.liteYT(vgrid);
      }
      chips.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; active = b.textContent; shown = 18; chips.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); });
      q.addEventListener("input", draw); more.addEventListener("click", function () { shown += 18; draw(); });
      draw();
    }).catch(function () { (vgrid || hv).innerHTML = '<p class="muted">Videos are loading slowly. Refresh the page to try again.</p>'; });
  }

  // ---------- News ----------
  var nl = $("news-list"), hn = $("home-news");
  if (nl || hn) {
    ABC.json("data/news.json").then(function (d) {
      var items = (d.items || []).slice(0, hn ? 6 : 40);
      var html = items.map(function (n) {
        return '<li><a href="' + ABC.esc(n.link) + '" target="_blank" rel="noopener nofollow">' + ABC.esc(n.title) + '</a><div class="meta">' + ABC.esc(n.source || "") + (n.date ? " · " + fmtDate(n.date) : "") + "</div></li>";
      }).join("");
      (nl || hn).innerHTML = html || '<li class="muted">Headlines refresh every day. Check back soon.</li>';
      if ($("news-updated") && d.updated) $("news-updated").textContent = "Updated " + fmtDate(d.updated);
    }).catch(function () { (nl || hn).innerHTML = '<li class="muted">Headlines refresh every day. Check back soon.</li>'; });
  }

  // ---------- Contests ----------
  if ($("contest-theme")) {
    ABC.json("data/contests.json").then(function (d) {
      var now = new Date(), m = now.getMonth(), t = d.themes[m], end = new Date(now.getFullYear(), m + 1, 0, 23, 59, 59);
      var month = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
      $("contest-theme").innerHTML = '<div class="block c-sun" style="width:96px;height:100px;font-size:3rem;cursor:default">' + t.emoji + '</div><div><p class="step-count">' + month + " contest</p><h2 style=\"margin:.1rem 0 .4rem\">" + ABC.esc(t.title) + "</h2><p class=\"muted\" style=\"margin:0\">" + ABC.esc(t.brief) + "</p></div>";
      $("contest-prize").textContent = d.prize;
      var sel = document.querySelector("[name=contest_theme]"); if (sel) sel.value = month + " — " + t.title;
      $("contest-next").innerHTML = [1, 2, 3].map(function (k) { var n = d.themes[(m + k) % 12], dt = new Date(now.getFullYear(), m + k, 1); return "<li><b>" + dt.toLocaleDateString(undefined, { month: "long" }) + ":</b> " + n.emoji + " " + ABC.esc(n.title) + "</li>"; }).join("");
      function tick() {
        var s = Math.max(0, Math.floor((end - new Date()) / 1000)), dd = Math.floor(s / 86400), hh = Math.floor(s % 86400 / 3600), mm = Math.floor(s % 3600 / 60);
        $("countdown").innerHTML = "<div><b>" + dd + "</b><span>days</span></div><div><b>" + hh + "</b><span>hours</span></div><div><b>" + mm + "</b><span>minutes</span></div>";
      }
      tick(); setInterval(tick, 30000);
    });
  }

  // ---------- Careers ----------
  if ($("jobs")) {
    ABC.json("data/jobs.json").then(function (d) {
      $("jobs").innerHTML = d.jobs.map(function (j) {
        return '<article class="job"><div><h3>' + ABC.esc(j.title) + '</h3><div class="chips" style="margin:.3rem 0 .5rem"><span class="chip">' + ABC.esc(j.type) + '</span><span class="chip">' + ABC.esc(j.location) + "</span></div><p class=\"muted\" style=\"margin:0\">" + ABC.esc(j.summary) + '</p></div><a class="btn btn-ink btn-sm" href="#apply" data-role="' + ABC.esc(j.title) + '">Apply</a></article>';
      }).join("");
      var sel = $("role"); d.jobs.forEach(function (j) { sel.add(new Option(j.title, j.title)); }); sel.add(new Option("Something else", "Other"));
      $("jobs").addEventListener("click", function (e) { var a = e.target.closest("[data-role]"); if (a) sel.value = a.getAttribute("data-role"); });
    });
  }

  // ---------- Support / donations ----------
  var tiers = $("tiers");
  if (tiers) {
    var amt = $("amount"), freq = "One-time", cfg = ABC.config.donate;
    tiers.addEventListener("click", function (e) {
      var b = e.target.closest(".tier"); if (!b) return;
      tiers.querySelectorAll(".tier").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      amt.value = b.dataset.amt; $("purpose").value = b.dataset.purpose; $("pledge").scrollIntoView({ behavior: "smooth", block: "center" });
    });
    document.querySelectorAll("[data-freq]").forEach(function (b) {
      b.addEventListener("click", function () {
        freq = b.dataset.freq; $("frequency").value = freq;
        document.querySelectorAll("[data-freq]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });
    var pay = $("pay-links"), links = [];
    if (cfg.stripe) links.push('<a class="btn btn-primary" href="' + cfg.stripe + '" target="_blank" rel="noopener">Donate by card</a>');
    if (cfg.paypal) links.push('<a class="btn btn-ink" href="' + cfg.paypal + '" target="_blank" rel="noopener">Donate with PayPal</a>');
    if (cfg.buymeacoffee) links.push('<a class="btn btn-sun" href="' + cfg.buymeacoffee + '" target="_blank" rel="noopener">Buy us a coffee</a>');
    if (pay && links.length) { pay.innerHTML = links.join(""); pay.hidden = false; }
  }

  // ---------- Search ----------
  var sr = $("search-results");
  if (sr) {
    var qs = new URLSearchParams(location.search).get("q") || "", input = $("search-q"); input.value = qs;
    ABC.json("data/search-index.json").then(function (idx) {
      function run() {
        var terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
        if (!terms.length) { sr.innerHTML = '<p class="muted">Type a topic like "sight words", "tracing" or "kindergarten".</p>'; return; }
        var res = idx.map(function (p) {
          var hay = (p.title + " " + p.description + " " + (p.keywords || "")).toLowerCase(), s = 0;
          terms.forEach(function (t) { if (hay.indexOf(t) > -1) s += p.title.toLowerCase().indexOf(t) > -1 ? 3 : 1; });
          return [s, p];
        }).filter(function (x) { return x[0] > 0; }).sort(function (a, b) { return b[0] - a[0]; });
        sr.innerHTML = res.length ? res.map(function (x) { return '<div class="result-item"><a href="' + ABC.url(x[1].url) + '">' + ABC.esc(x[1].title) + '</a><p class="muted" style="margin:.2rem 0 0">' + ABC.esc(x[1].description) + "</p></div>"; }).join("")
          : '<p>No pages match "' + ABC.esc(input.value) + '". Try a shorter word, or browse the <a href="' + ABC.url("guides.html") + '">parent guides</a>.</p>';
      }
      input.addEventListener("input", run); run();
    });
  }
})();

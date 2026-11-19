/* Numbers & math: counting, ten frame, fact practice, hundred chart. */
(function () {
  var ABC = window.ABC;
  var emos = ["🍎", "⭐", "🐟", "🚗", "🌸", "🐞", "🍪", "🎈", "🐥", "⚽"];

  // ---- Count it ----
  var area = document.getElementById("count-area"), copts = document.getElementById("count-opts"), clvl = document.getElementById("count-level");
  if (area) {
    var n = 0;
    function newCount() {
      var max = +clvl.value; n = 1 + Math.floor(Math.random() * max); var e = ABC.pick(emos);
      area.innerHTML = new Array(n + 1).join("<span>" + e + "</span>");
      var opts = [n]; while (opts.length < 4) { var o = Math.max(1, n + Math.floor(Math.random() * 7) - 3); if (opts.indexOf(o) < 0) opts.push(o); }
      copts.innerHTML = ABC.shuffle(opts).map(function (o) { return "<button>" + o + "</button>"; }).join("");
    }
    copts.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || copts.dataset.lock) return;
      if (+b.textContent === n) { b.classList.add("right"); ABC.addStar(1); ABC.speak(n + "! Great counting."); }
      else { b.classList.add("wrong"); ABC.speak("Let's count again. There are " + n + "."); copts.querySelectorAll("button").forEach(function (x) { if (+x.textContent === n) x.classList.add("right"); }); }
      copts.dataset.lock = 1; setTimeout(function () { delete copts.dataset.lock; newCount(); }, 1400);
    });
    clvl.addEventListener("change", newCount);
    document.getElementById("count-say").addEventListener("click", function () {
      var spans = area.querySelectorAll("span"), i = 0;
      (function step() { if (i >= spans.length) return; spans.forEach(function (s, j) { s.style.opacity = j <= i ? 1 : .35; }); ABC.speak(String(i + 1), { rate: 1, onend: function () { i++; step(); } }); })();
    });
    newCount();
  }

  // ---- Ten frame ----
  var tf = document.getElementById("tenframe"), tfOut = document.getElementById("tf-out");
  if (tf) {
    for (var i = 0; i < 10; i++) { var b = document.createElement("button"); b.setAttribute("aria-label", "Ten frame box " + (i + 1)); tf.appendChild(b); }
    function tfCount() {
      var c = tf.querySelectorAll(".on").length; tfOut.textContent = c + (c === 10 ? " — a full ten!" : " counters. " + (10 - c) + " more make 10.");
      return c;
    }
    tf.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return; b.classList.toggle("on"); b.textContent = b.classList.contains("on") ? "🔴" : "";
      var c = tfCount(); ABC.speak(String(c), { rate: 1 });
    });
    document.getElementById("tf-clear").addEventListener("click", function () { tf.querySelectorAll("button").forEach(function (b) { b.classList.remove("on"); b.textContent = ""; }); tfCount(); });
    document.getElementById("tf-random").addEventListener("click", function () {
      var k = Math.floor(Math.random() * 11); tf.querySelectorAll("button").forEach(function (b, j) { var on = j < k; b.classList.toggle("on", on); b.textContent = on ? "🔴" : ""; });
      tfOut.textContent = "How many counters? How many more make 10?";
    });
    tfCount();
  }

  // ---- Fact practice ----
  var pq = document.getElementById("pq"), pin = document.getElementById("pa"), pmsg = document.getElementById("pmsg"), pop = document.getElementById("pop"), plv = document.getElementById("plv");
  if (pq) {
    var ans = 0, streak = 0;
    function newQ() {
      var max = +plv.value, op = pop.value === "mix" ? ABC.pick(["+", "−"]) : pop.value;
      var a = Math.floor(Math.random() * (max + 1)), b = Math.floor(Math.random() * (max + 1));
      if (op === "+") { while (a + b > max) { b = Math.floor(Math.random() * (max - a + 1)); } ans = a + b; }
      else { if (b > a) { var t = a; a = b; b = t; } ans = a - b; }
      pq.textContent = a + " " + op + " " + b + " = ?"; pin.value = ""; pin.focus({ preventScroll: true });
    }
    document.getElementById("pform").addEventListener("submit", function (e) {
      e.preventDefault(); if (pin.value === "") return;
      if (+pin.value === ans) { streak++; ABC.addStar(1); pmsg.textContent = "Correct! Streak: " + streak + (streak % 5 === 0 ? " 🔥" : ""); newQ(); }
      else { streak = 0; pmsg.textContent = "Not quite — the answer is " + ans + ". Try the next one."; setTimeout(newQ, 1200); }
    });
    pop.addEventListener("change", newQ); plv.addEventListener("change", newQ);
    document.getElementById("p-print").addEventListener("click", function () { location.href = ABC.url("worksheets.html") + "?type=math&op=" + encodeURIComponent(pop.value === "−" ? "-" : pop.value) + "&max=" + plv.value; });
    newQ();
  }

  // ---- Hundred chart ----
  var hc = document.getElementById("hundred"), skip = document.getElementById("skip");
  if (hc) {
    for (var k = 1; k <= 100; k++) { var c = document.createElement("button"); c.textContent = k; hc.appendChild(c); }
    hc.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { b.classList.toggle("hl"); ABC.speak(b.textContent, { rate: 1 }); } });
    skip.addEventListener("change", function () {
      var v = skip.value;
      hc.querySelectorAll("button").forEach(function (b) {
        var x = +b.textContent, on = false;
        if (v === "odd") on = x % 2 === 1; else if (v === "even") on = x % 2 === 0; else if (v) on = x % +v === 0;
        b.classList.toggle("hl", on);
      });
      if (v && v !== "odd" && v !== "even") {
        var seq = []; for (var j = +v; j <= 100; j += +v) seq.push(j); ABC.speak(seq.slice(0, 10).join(", "), { rate: 1 });
      }
    });
  }
})();

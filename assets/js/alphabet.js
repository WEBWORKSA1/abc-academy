/* Alphabet explorer: hear each letter, see words, trace on screen. */
(function () {
  var W = window.ABCWords, ABC = window.ABC;
  var grid = document.getElementById("letter-grid"); if (!grid) return;
  var colors = ["c-red", "c-sky", "c-leaf", "c-sun", "c-grape"];
  var cur = 0, caseMode = "upper", ink = "#E5484D";

  W.letters.forEach(function (L, i) {
    var b = document.createElement("button");
    b.className = "block " + colors[i % 5]; b.textContent = L.l; b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", "Letter " + L.l);
    b.addEventListener("click", function () { select(i, true); });
    grid.appendChild(b);
  });

  var bigU = document.getElementById("big-upper"), bigL = document.getElementById("big-lower"),
    soundLine = document.getElementById("sound-line"), words = document.getElementById("letter-words");

  function sayLetter(L) { ABC.speak(L.l + ". " + L.l + " says " + L.s + ". " + L.l + " is for " + L.w[0][0] + "."); }

  function select(i, speak) {
    cur = i; var L = W.letters[i];
    grid.querySelectorAll(".block").forEach(function (b, j) { b.setAttribute("aria-pressed", j === i ? "true" : "false"); });
    bigU.textContent = L.l; bigL.textContent = L.l.toLowerCase();
    soundLine.innerHTML = "<b>" + L.l + "</b> says <b>/" + L.s + "/</b>" + (L.l === "X" ? " — usually at the end of a word" : "");
    words.innerHTML = "";
    L.w.forEach(function (w) {
      var c = document.createElement("button"); c.className = "word-chip";
      c.innerHTML = "<em>" + w[1] + "</em>" + w[0];
      c.addEventListener("click", function () { ABC.speak(w[0]); });
      words.appendChild(c);
    });
    drawGuide();
    if (speak) sayLetter(L);
    history.replaceState(null, "", "?letter=" + L.l);
  }

  document.getElementById("hear-letter").addEventListener("click", function () { sayLetter(W.letters[cur]); });
  document.getElementById("next-letter").addEventListener("click", function () { select((cur + 1) % 26, true); });
  document.getElementById("prev-letter").addEventListener("click", function () { select((cur + 25) % 26, true); });

  var singing = false;
  document.getElementById("sing-all").addEventListener("click", function () {
    if (singing) { singing = false; speechSynthesis && speechSynthesis.cancel(); this.textContent = "Say A to Z"; return; }
    singing = true; this.textContent = "Stop"; var btn = this, i = 0;
    (function next() {
      if (!singing || i > 25) { singing = false; btn.textContent = "Say A to Z"; return; }
      select(i, false); ABC.speak(W.letters[i].l, { rate: 0.9, onend: function () { i++; setTimeout(next, 120); } });
    })();
  });

  // ---- Tracing canvas ----
  var canvas = document.getElementById("trace"), ctx = canvas.getContext("2d"), drawing = false, last = null, strokes = 0;
  function size() {
    var r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = r.width * dpr; canvas.height = r.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGuide();
  }
  function drawGuide() {
    var r = canvas.getBoundingClientRect(), w = r.width, h = r.height;
    ctx.clearRect(0, 0, w, h);
    var top = h * 0.16, mid = h * 0.5, base = h * 0.84;
    ctx.lineWidth = 2; ctx.strokeStyle = "#8FB2EA"; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(0, top); ctx.lineTo(w, top); ctx.stroke();
    ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    ctx.setLineDash([]); ctx.strokeStyle = "#E5484D"; ctx.beginPath(); ctx.moveTo(0, base); ctx.lineTo(w, base); ctx.stroke();
    var L = W.letters[cur].l, txt = caseMode === "upper" ? L : L.toLowerCase();
    var fs = (base - top) * 1.32;
    ctx.font = "700 " + fs + "px Andika, Lexend, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(125,136,168,.22)"; ctx.fillText(txt, w / 2, base);
    ctx.setLineDash([6, 8]); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(27,35,64,.45)"; ctx.strokeText(txt, w / 2, base); ctx.setLineDash([]);
    strokes = 0;
  }
  function pos(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  canvas.addEventListener("pointerdown", function (e) { drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); strokes++; });
  canvas.addEventListener("pointermove", function (e) {
    if (!drawing) return; var p = pos(e);
    ctx.strokeStyle = ink; ctx.lineWidth = 12; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p;
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) { canvas.addEventListener(ev, function () { drawing = false; }); });
  document.getElementById("clear-trace").addEventListener("click", drawGuide);
  document.getElementById("case-toggle").addEventListener("click", function () {
    caseMode = caseMode === "upper" ? "lower" : "upper";
    this.textContent = caseMode === "upper" ? "Switch to lowercase" : "Switch to uppercase"; drawGuide();
  });
  document.getElementById("done-trace").addEventListener("click", function () {
    if (strokes < 1) { ABC.toast("Trace the letter first, then press I did it."); return; }
    var s = ABC.addStar(1); ABC.speak("Great tracing!"); ABC.toast("⭐ Star earned! You have " + s + " stars.");
    setTimeout(function () { select((cur + 1) % 26, true); }, 900);
  });
  document.querySelectorAll(".swatch").forEach(function (sw) {
    sw.addEventListener("click", function () {
      ink = sw.getAttribute("data-c");
      document.querySelectorAll(".swatch").forEach(function (x) { x.setAttribute("aria-pressed", x === sw ? "true" : "false"); });
    });
  });
  window.addEventListener("resize", size);

  var q = new URLSearchParams(location.search).get("letter");
  var start = q ? Math.max(0, "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(q.toUpperCase())) : 0;
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { size(); select(start, false); });
})();

/* Sight words: Dolch lists with flashcards, listening quiz and word wall. */
(function () {
  var W = window.ABCWords, ABC = window.ABC;
  var tabs = document.getElementById("list-tabs"); if (!tabs) return;
  var listName = "Pre-primer", mode = "cards", deck = [], idx = 0, known = ABC.store.get("known", {});
  var card = document.getElementById("sw-card"), dots = document.getElementById("sw-dots"), area = document.getElementById("sw-area"),
    stat = document.getElementById("sw-stat"), wall = document.getElementById("sw-wall");

  Object.keys(W.dolch).forEach(function (name) {
    var b = document.createElement("button"); b.className = "chip" + (name === listName ? " on" : ""); b.textContent = name + " (" + W.dolch[name].length + ")";
    b.addEventListener("click", function () { listName = name; tabs.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); start(); });
    tabs.appendChild(b);
  });
  document.querySelectorAll("[data-mode]").forEach(function (b) {
    b.addEventListener("click", function () {
      mode = b.getAttribute("data-mode");
      document.querySelectorAll("[data-mode]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      start();
    });
  });

  function kset() { return known[listName] || (known[listName] = []); }
  function save() { ABC.store.set("known", known); }
  function updateStat() {
    var n = kset().length, t = W.dolch[listName].length;
    stat.textContent = n + " of " + t + " words mastered in " + listName;
    dots.innerHTML = W.dolch[listName].map(function (w) { return '<i class="' + (kset().indexOf(w) > -1 ? "ok" : "") + '" title="' + w + '"></i>'; }).join("");
  }

  function start() {
    deck = ABC.shuffle(W.dolch[listName]); idx = 0; updateStat();
    document.getElementById("mode-cards").hidden = mode !== "cards";
    document.getElementById("mode-quiz").hidden = mode !== "quiz";
    document.getElementById("mode-wall").hidden = mode !== "wall";
    if (mode === "cards") showCard(); else if (mode === "quiz") quiz(); else drawWall();
  }
  function showCard() { card.textContent = deck[idx]; }
  document.getElementById("sw-hear").addEventListener("click", function () { ABC.speak(deck[idx]); });
  document.getElementById("sw-know").addEventListener("click", function () {
    var w = deck[idx]; if (kset().indexOf(w) < 0) { kset().push(w); save(); ABC.addStar(1); }
    idx = (idx + 1) % deck.length; showCard(); updateStat();
  });
  document.getElementById("sw-again").addEventListener("click", function () {
    var w = deck.splice(idx, 1)[0]; deck.splice(Math.min(deck.length, idx + 3), 0, w); showCard();
  });
  document.getElementById("sw-reset").addEventListener("click", function () { known[listName] = []; save(); updateStat(); ABC.toast("Progress for " + listName + " cleared."); });

  // Listening quiz
  var qWord = null, qOpts = document.getElementById("quiz-opts"), qMsg = document.getElementById("quiz-msg"), score = 0, total = 0;
  function quiz() {
    var list = W.dolch[listName]; qWord = ABC.pick(list);
    var opts = ABC.shuffle([qWord].concat(ABC.shuffle(list.filter(function (w) { return w !== qWord; })).slice(0, 3)));
    qOpts.innerHTML = opts.map(function (o) { return "<button>" + o + "</button>"; }).join("");
    qMsg.textContent = "Listen, then tap the word you hear. Score: " + score + "/" + total;
    setTimeout(function () { ABC.speak(qWord); }, 250);
  }
  document.getElementById("quiz-hear").addEventListener("click", function () { if (qWord) ABC.speak(qWord); });
  qOpts.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || qOpts.dataset.lock) return;
    total++;
    if (b.textContent === qWord) { b.classList.add("right"); score++; ABC.addStar(1); ABC.speak("Yes! " + qWord); if (kset().indexOf(qWord) < 0) { kset().push(qWord); save(); updateStat(); } }
    else { b.classList.add("wrong"); qOpts.querySelectorAll("button").forEach(function (x) { if (x.textContent === qWord) x.classList.add("right"); }); ABC.speak("This one says " + qWord); }
    qOpts.dataset.lock = "1"; setTimeout(function () { delete qOpts.dataset.lock; quiz(); }, 1500);
  });

  function drawWall() {
    wall.innerHTML = W.dolch[listName].slice().sort().map(function (w) { return '<button class="word-chip" data-say="' + w + '">' + w + "</button>"; }).join("");
  }
  wall.addEventListener("click", function (e) { var b = e.target.closest("[data-say]"); if (b) ABC.speak(b.getAttribute("data-say")); });
  document.getElementById("sw-print").addEventListener("click", function () { location.href = ABC.url("worksheets.html") + "?type=sight&list=" + encodeURIComponent(listName); });

  start();
})();

/* Game arcade: eight short learning games sharing one stage. */
(function () {
  var W = window.ABCWords, ABC = window.ABC;
  var stage = document.getElementById("game-body"), picker = document.getElementById("game-picker"); if (!stage) return;
  var titleEl = document.getElementById("game-title"), roundEl = document.getElementById("game-round"), cele = document.getElementById("celebrate");
  var AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), colors = ["#E5484D", "#2F7FF0", "#22A86B", "#7C5CE6", "#F29D38"];
  var round = 0, ROUNDS = 8, timers = [];

  function clearTimers() { timers.forEach(clearTimeout); timers.forEach(clearInterval); timers = []; }
  function setRound() { roundEl.textContent = "Round " + Math.min(round + 1, ROUNDS) + " of " + ROUNDS; }
  function win(next) {
    ABC.addStar(1); round++;
    if (round >= ROUNDS) { cele.classList.add("show"); ABC.speak("You did it! Amazing work."); ABC.addStar(3); return; }
    setRound(); timers.push(setTimeout(next, 900));
  }
  function miss(msg) { ABC.speak(msg || "Try again!"); }
  function prompt(html, say) { return '<p class="prompt-line">' + html + ' <button class="btn btn-ghost btn-sm" data-replay="' + ABC.esc(say) + '">🔊 Hear it</button></p>'; }
  stage.addEventListener("click", function (e) { var r = e.target.closest("[data-replay]"); if (r) ABC.speak(r.getAttribute("data-replay")); });

  var games = {
    pop: { t: "Letter Pop", run: function letterPop() {
      clearTimers(); var target = ABC.pick(AZ), say = "Pop the letter " + target;
      stage.innerHTML = prompt("Pop the letter <b>" + target + "</b>", say) + '<div class="bubble-field" id="bf"></div>';
      ABC.speak(say);
      var bf = document.getElementById("bf"), w = bf.clientWidth, h = bf.clientHeight;
      var set = ABC.shuffle(AZ.filter(function (x) { return x !== target; })).slice(0, 7).concat([target, target]);
      ABC.shuffle(set).forEach(function (L, i) {
        var b = document.createElement("button"); b.className = "bubble"; b.textContent = Math.random() < .35 ? L.toLowerCase() : L;
        b.dataset.l = L; b.style.background = colors[i % 5];
        b.style.left = Math.random() * Math.max(10, w - 80) + "px"; b.style.top = Math.random() * Math.max(10, h - 80) + "px";
        b.addEventListener("click", function () {
          if (b.dataset.l === target) { b.style.transform = "scale(1.4)"; b.style.opacity = 0; win(letterPop); }
          else { miss("That is " + b.dataset.l + ". Find " + target); }
        });
        bf.appendChild(b);
      });
      timers.push(setInterval(function () {
        bf.querySelectorAll(".bubble").forEach(function (b) {
          var y = parseFloat(b.style.top) - 6; if (y < -70) y = h; b.style.top = y + "px";
        });
      }, 120));
    } },
    memory: { t: "Big & Little Match", run: function memory() {
      clearTimers(); var picks = ABC.shuffle(AZ).slice(0, 8), cards = [];
      picks.forEach(function (L) { cards.push(L, L.toLowerCase()); });
      cards = ABC.shuffle(cards);
      stage.innerHTML = '<p class="prompt-line">Match each big letter with its little letter.</p><div class="mem-grid" id="mg"></div>';
      var mg = document.getElementById("mg"), open = [], found = 0;
      cards.forEach(function (c) {
        var b = document.createElement("button"); b.className = "mem-card"; b.dataset.v = c; b.setAttribute("aria-label", "Hidden card");
        b.addEventListener("click", function () {
          if (b.classList.contains("up") || b.classList.contains("done") || open.length === 2) return;
          b.classList.add("up"); b.textContent = c; b.setAttribute("aria-label", c); open.push(b); ABC.speak(c.toUpperCase(), { rate: 1 });
          if (open.length === 2) {
            var a = open[0], z = open[1];
            if (a.dataset.v.toUpperCase() === z.dataset.v.toUpperCase() && a.dataset.v !== z.dataset.v) {
              a.classList.add("done"); z.classList.add("done"); open = []; found++; ABC.addStar(1);
              if (found === 8) { round = ROUNDS - 1; win(memory); }
            } else timers.push(setTimeout(function () { a.classList.remove("up"); z.classList.remove("up"); a.textContent = ""; z.textContent = ""; open = []; }, 900));
          }
        });
        mg.appendChild(b);
      });
    } },
    first: { t: "First Sound", run: function first() {
      clearTimers(); var L = ABC.pick(W.letters.filter(function (x) { return x.l !== "X"; })), w = ABC.pick(L.w);
      var opts = ABC.shuffle([L.l].concat(ABC.shuffle(AZ.filter(function (x) { return x !== L.l; })).slice(0, 2)));
      var say = "What sound does " + w[0] + " start with?";
      stage.innerHTML = '<div class="big-emoji">' + w[1] + "</div>" + prompt(w[0][0].toUpperCase() + w[0].slice(1) + " starts with…", say) + '<div class="tiles" id="ft"></div>';
      ABC.speak(say);
      var ft = document.getElementById("ft");
      opts.forEach(function (o, i) {
        var b = document.createElement("button"); b.className = "block " + ["c-red", "c-sky", "c-leaf"][i]; b.textContent = o;
        b.addEventListener("click", function () { if (o === L.l) { ABC.speak(w[0] + " starts with " + L.s); win(first); } else miss(w[0] + " does not start with " + o); });
        ft.appendChild(b);
      });
    } },
    missing: { t: "Missing Letter", run: function missing() {
      clearTimers(); var s = Math.floor(Math.random() * 23), seq = AZ.slice(s, s + 4), gap = 1 + Math.floor(Math.random() * 3), ans = seq[gap];
      var opts = ABC.shuffle([ans].concat(ABC.shuffle(AZ.filter(function (x) { return x !== ans; })).slice(0, 2)));
      stage.innerHTML = prompt("Which letter is missing?", "Which letter is missing?") + '<div class="slots">' + seq.map(function (x, i) { return "<span>" + (i === gap ? "?" : x) + "</span>"; }).join("") + '</div><div class="tiles" id="mt"></div>';
      var mt = document.getElementById("mt");
      opts.forEach(function (o, i) {
        var b = document.createElement("button"); b.className = "block " + ["c-grape", "c-sun", "c-sky"][i]; b.textContent = o;
        b.addEventListener("click", function () { if (o === ans) { stage.querySelectorAll(".slots span")[gap].textContent = ans; ABC.speak(seq.join(" ")); win(missing); } else miss(); });
        mt.appendChild(b);
      });
      ABC.speak("Which letter is missing?");
    } },
    rhyme: { t: "Rhyme Time", run: function rhyme() {
      clearTimers(); var pair = ABC.pick(W.rhymes), others = ABC.shuffle(W.rhymes.filter(function (p) { return p[2] !== pair[2] && p[0] !== pair[0]; })).slice(0, 2);
      var opts = ABC.shuffle([[pair[2], pair[3], true]].concat(others.map(function (p) { return [p[0], p[1], false]; })));
      var say = "Which word rhymes with " + pair[0] + "?";
      stage.innerHTML = '<div class="big-emoji">' + pair[1] + "</div>" + prompt("What rhymes with <b>" + pair[0] + "</b>?", say) + '<div class="pic-choices" id="rc"></div>';
      ABC.speak(say);
      var rc = document.getElementById("rc");
      opts.forEach(function (o) {
        var b = document.createElement("button"); b.innerHTML = o[1] + "<small>" + o[0] + "</small>";
        b.addEventListener("click", function () { if (o[2]) { ABC.speak(pair[0] + ", " + o[0] + ". They rhyme!"); win(rhyme); } else miss(pair[0] + " and " + o[0] + " do not rhyme."); });
        rc.appendChild(b);
      });
    } },
    count: { t: "Count & Tap", run: function count() {
      clearTimers(); var n = 1 + Math.floor(Math.random() * 10), e = ABC.pick(["🐞", "🍓", "🐠", "🚀", "🌼", "🧁"]);
      var opts = [n]; while (opts.length < 3) { var o = 1 + Math.floor(Math.random() * 10); if (opts.indexOf(o) < 0) opts.push(o); }
      stage.innerHTML = prompt("How many do you see?", "How many do you see?") + '<div class="count-area">' + new Array(n + 1).join("<span>" + e + "</span>") + '</div><div class="tiles" id="ct" style="margin-top:1rem"></div>';
      ABC.speak("How many do you see?");
      var ct = document.getElementById("ct");
      ABC.shuffle(opts).forEach(function (o, i) {
        var b = document.createElement("button"); b.className = "block " + ["c-leaf", "c-red", "c-sky"][i]; b.textContent = o;
        b.addEventListener("click", function () { if (o === n) { ABC.speak(n + "!"); win(count); } else miss("Count again"); });
        ct.appendChild(b);
      });
    } },
    spell: { t: "Spell It", run: function spell() {
      clearTimers(); var fams = Object.keys(W.cvc), r, o, guard = 0;
      do { r = ABC.pick(fams); o = ABC.pick(Object.keys(W.cvc[r])); guard++; } while (!W.cvc[r][o] && guard < 50);
      var word = o + r, emo = W.cvc[r][o], pos = 0;
      var letters = ABC.shuffle(word.split("").concat(ABC.shuffle("bdfgmnpst".split("").filter(function (x) { return word.indexOf(x) < 0; })).slice(0, 2)));
      stage.innerHTML = '<div class="big-emoji">' + emo + "</div>" + prompt("Spell the word", "Spell " + word) + '<div class="slots">' + word.split("").map(function () { return "<span></span>"; }).join("") + '</div><div class="tiles" id="st"></div>';
      ABC.speak("Spell " + word);
      var st = document.getElementById("st"), slots = stage.querySelectorAll(".slots span");
      letters.forEach(function (l, i) {
        var b = document.createElement("button"); b.className = "block " + ["c-sky", "c-red", "c-leaf", "c-grape", "c-sun"][i % 5]; b.textContent = l;
        b.addEventListener("click", function () {
          if (l === word[pos]) { slots[pos].textContent = l; b.disabled = true; b.style.opacity = .3; pos++; if (pos === word.length) { ABC.speak(word + "!"); win(spell); } }
          else miss("Listen: " + word);
        });
        st.appendChild(b);
      });
    } },
    hunt: { t: "Sight Word Hunt", run: function hunt() {
      clearTimers(); var list = W.dolch["Pre-primer"].concat(W.dolch["Primer"]), word = ABC.pick(list);
      var opts = ABC.shuffle([word].concat(ABC.shuffle(list.filter(function (x) { return x !== word; })).slice(0, 5)));
      stage.innerHTML = prompt("Find the word you hear", word) + '<div class="quiz-opts" id="ho" style="grid-template-columns:repeat(3,1fr)"></div>';
      ABC.speak(word);
      var ho = document.getElementById("ho");
      opts.forEach(function (o) {
        var b = document.createElement("button"); b.textContent = o;
        b.addEventListener("click", function () { if (o === word) { b.classList.add("right"); win(hunt); } else { b.classList.add("wrong"); miss("Listen again: " + word); } });
        ho.appendChild(b);
      });
    } }
  };

  var current = "pop";
  function startGame(key) {
    current = key; round = 0; setRound(); cele.classList.remove("show");
    titleEl.textContent = games[key].t;
    picker.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.game === key ? "true" : "false"); });
    games[key].run();
    history.replaceState(null, "", "?game=" + key);
  }
  picker.addEventListener("click", function (e) { var b = e.target.closest("[data-game]"); if (b) { startGame(b.dataset.game); document.getElementById("stage").scrollIntoView({ behavior: "smooth", block: "start" }); } });
  document.getElementById("again").addEventListener("click", function () { startGame(current); });
  document.getElementById("restart").addEventListener("click", function () { startGame(current); });
  var q = new URLSearchParams(location.search).get("game");
  startGame(games[q] ? q : "pop");
})();

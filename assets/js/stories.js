/* Story time: original decodable read-along stories with word highlighting and questions. */
(function () {
  var ABC = window.ABC;
  var shelf = document.getElementById("story-shelf"); if (!shelf) return;
  var stories = [
    { id: "big-red-bus", t: "The Big Red Bus", lvl: "Short a and u", pic: "🚌🐶☀️",
      text: "Sam has a big red bus. The bus can go up the hill. Sam has a pup. The pup is in the bus. The sun is hot. Sam and the pup sit in the sun. The bus has a map. Sam can see the map. Up, up, up the hill! Sam and the pup had fun.",
      q: [["What color is the bus?", ["red", "blue", "tan"], 0], ["Who is in the bus with Sam?", ["a cat", "a pup", "a hen"], 1], ["Where does the bus go?", ["up the hill", "in the pond", "to the moon"], 0]] },
    { id: "ten-hens", t: "Ten Hens in a Pen", lvl: "Short e", pic: "🐔🔟🥚",
      text: "Ten hens sit in a pen. Ben has a red pen and a pad. Ben gets the eggs. One egg, two eggs, ten eggs! The hens are fed. Ben pets a hen. The hen is not upset. Ben and the ten hens rest in the sun.",
      q: [["How many hens are in the pen?", ["six", "ten", "two"], 1], ["What does Ben get?", ["eggs", "bugs", "hats"], 0], ["How does the hen feel when Ben pets it?", ["upset", "not upset", "sad"], 1]] },
    { id: "fox-box", t: "The Fox and the Box", lvl: "Short o", pic: "🦊📦🧦",
      text: "A fox got a box. The box is on a log. The fox hops on top. Pop! The box is not shut. In the box is a sock. The fox has a sock on his nose. The fox trots off to the pond. What a fun day for the fox!",
      q: [["Where is the box?", ["on a log", "in a bed", "on a bus"], 0], ["What is in the box?", ["a hat", "a sock", "a cup"], 1], ["Where does the fox go?", ["to the pond", "to the shop", "to bed"], 0]] },
    { id: "pip-pig", t: "Pip the Pig Can Dig", lvl: "Short i", pic: "🐷⛏️🐛",
      text: "Pip is a pig. Pip can dig. Pip digs in the mud. Pip digs a big pit. In the pit is a bug. The bug is tiny. Pip sits and grins. The bug sits on his lip. Pip did not mind. Pip and the bug are pals.",
      q: [["What can Pip do?", ["dig", "fly", "swim"], 0], ["What is in the pit?", ["a fish", "a bug", "a bell"], 1], ["Are Pip and the bug friends?", ["yes", "no", "we do not know"], 0]] },
    { id: "ship-shop", t: "A Ship and a Shop", lvl: "sh, ch and th", pic: "🚢🐚🧀",
      text: "Beth went on a ship. The ship had a shop. The shop had shells and fish and cheese. Beth chose a shell. Then she had lunch. She had a dish of chips. The ship went fast. Beth held the rail with both hands. What a thrill!",
      q: [["What did the shop have?", ["shells, fish and cheese", "cars and trucks", "socks"], 0], ["What did Beth choose?", ["a shell", "a fish", "a chick"], 0], ["What did Beth eat for lunch?", ["chips", "cake", "jam"], 0]] },
    { id: "kate-kite", t: "Kate and the Kite", lvl: "Magic e", pic: "🪁👧🌬️",
      text: "Kate has a kite. It is white and blue. Kate takes the kite to the lake. The wind is strong. Up goes the kite! It flies so high. Kate holds the line tight. Then the kite dives and lands in a pine tree. Kate's dad helps get it home. Kate smiles. What a fine day.",
      q: [["Where does Kate take the kite?", ["to the lake", "to the store", "to bed"], 0], ["Where does the kite land?", ["in a pine tree", "in the lake", "on a car"], 0], ["Who helps Kate?", ["her dad", "a dog", "a cat"], 0]] },
    { id: "max-helps", t: "Max Can Help", lvl: "Sight words", pic: "👦🧹🏠",
      text: "Max wants to help. He can make his bed. He can put away his toys. He can help Mom with the dishes. He can give the dog some water. Mom says, thank you, Max! You are a big help. Max feels proud. Helping is fun.",
      q: [["What does Max want to do?", ["help", "sleep", "run"], 0], ["What does Max give the dog?", ["water", "a toy", "a hat"], 0], ["How does Max feel?", ["proud", "angry", "scared"], 0]] },
    { id: "snail-race", t: "The Snail Race", lvl: "Blends", pic: "🐌🏁🌸",
      text: "Two snails had a race. Fred was fast. Glen was slow. Fred slid past a flower. He stopped to smell it. He fell asleep in the grass. Glen kept going, step by step. Glen crossed the line first! Fred woke up and clapped. Slow and steady wins the race.",
      q: [["Which snail was fast?", ["Fred", "Glen", "both"], 0], ["Why did Fred stop?", ["to smell a flower", "to eat", "to swim"], 0], ["Who won the race?", ["Glen", "Fred", "nobody"], 0]] }
  ];

  var reader = document.getElementById("reader"), textEl = document.getElementById("story-text"), titleEl = document.getElementById("story-title"),
    lvlEl = document.getElementById("story-level"), picEl = document.getElementById("story-pic"), qEl = document.getElementById("story-q"), cur = null;

  shelf.innerHTML = stories.map(function (s) {
    return '<button class="card link" data-story="' + s.id + '" style="text-align:left;cursor:pointer"><div style="font-size:2.2rem;letter-spacing:.2rem">' + s.pic + '</div><h3 style="margin:.6rem 0 .2rem">' + s.t + '</h3><span class="chip">' + s.lvl + "</span></button>";
  }).join("");
  shelf.addEventListener("click", function (e) { var b = e.target.closest("[data-story]"); if (b) open(b.getAttribute("data-story"), true); });

  function open(id, scroll) {
    cur = stories.filter(function (s) { return s.id === id; })[0] || stories[0];
    titleEl.textContent = cur.t; lvlEl.textContent = cur.lvl; picEl.textContent = cur.pic;
    var idx = 0;
    textEl.innerHTML = cur.text.split(" ").map(function (w) { var s = '<span class="w" data-i="' + idx + '">' + ABC.esc(w) + "</span>"; idx += w.length + 1; return s; }).join(" ");
    qEl.innerHTML = cur.q.map(function (q, qi) {
      return '<div class="q-card" style="margin-bottom:.8rem"><b>' + (qi + 1) + ". " + q[0] + '</b><div class="chips" style="margin-top:.6rem">' +
        q[1].map(function (o, oi) { return '<button class="chip" data-q="' + qi + '" data-o="' + oi + '">' + o + "</button>"; }).join("") + "</div></div>";
    }).join("");
    reader.hidden = false;
    if (scroll) reader.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", "?story=" + cur.id);
  }
  textEl.addEventListener("click", function (e) { var w = e.target.closest(".w"); if (w) ABC.speak(w.textContent.replace(/[^\w']/g, "")); });
  qEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-q]"); if (!b) return;
    var q = cur.q[+b.dataset.q], ok = +b.dataset.o === q[2];
    b.style.background = ok ? "#dff5ea" : "#fde4e5"; b.style.color = "var(--ink)";
    if (ok) { ABC.addStar(1); ABC.speak("Yes!"); } else ABC.speak("Look back at the story and try again.");
  });

  document.getElementById("read-aloud").addEventListener("click", function () {
    if (!cur) return;
    var spans = textEl.querySelectorAll(".w"), bounded = false;
    function hl(ci) { spans.forEach(function (s) { s.classList.toggle("on", +s.dataset.i === ci); }); }
    ABC.speak(cur.text, {
      rate: 0.8,
      onboundary: function (ev) { if (ev.name && ev.name !== "word") return; bounded = true; var best = 0; spans.forEach(function (s) { if (+s.dataset.i <= ev.charIndex) best = +s.dataset.i; }); hl(best); },
      onend: function () { hl(-1); ABC.addStar(1); }
    });
  });
  document.getElementById("stop-read").addEventListener("click", function () { if (window.speechSynthesis) speechSynthesis.cancel(); });

  var q = new URLSearchParams(location.search).get("story");
  open(q || stories[0].id, false);
})();

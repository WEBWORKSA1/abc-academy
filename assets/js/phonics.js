/* Phonics lab: CVC word builder, digraphs, blends, magic e. */
(function () {
  var W = window.ABCWords, ABC = window.ABC;
  var snd = { b: "buh", c: "kuh", d: "duh", f: "fff", g: "guh", h: "huh", j: "juh", k: "kuh", l: "lll", m: "mmm", n: "nnn", p: "puh", r: "rrr", s: "sss", t: "tuh", v: "vvv", w: "wuh", z: "zzz", x: "ks" };
  var vow = { a: "aa", e: "eh", i: "ih", o: "ah", u: "uh" };

  // ---- CVC builder ----
  var onsetSel = document.getElementById("onset"), rimeSel = document.getElementById("rime");
  if (onsetSel) {
    W.onsets.forEach(function (o) { onsetSel.add(new Option(o, o)); });
    Object.keys(W.cvc).forEach(function (r) { rimeSel.add(new Option("-" + r, r)); });
    var out = document.getElementById("built-word"), note = document.getElementById("built-note"), fam = document.getElementById("family-list");
    function render() {
      var o = onsetSel.value, r = rimeSel.value, word = o + r, fam0 = W.cvc[r], real = Object.prototype.hasOwnProperty.call(fam0, o);
      out.innerHTML = (real && fam0[o] ? '<span class="emo">' + fam0[o] + "</span>" : '<span class="emo">' + (real ? "📖" : "🤔") + "</span>") + word;
      note.textContent = real ? "Real word! Tap Sound it out to blend it." : "That's a silly word — fun to read, but not a real word.";
      fam.innerHTML = Object.keys(fam0).map(function (k) { return '<button class="word-chip" data-w="' + k + r + '"><em>' + (fam0[k] || "📖") + "</em>" + k + r + "</button>"; }).join("");
    }
    fam && fam.addEventListener("click", function (e) {
      var b = e.target.closest("[data-w]"); if (!b) return; var w = b.getAttribute("data-w");
      onsetSel.value = w[0]; render(); blend(w);
    });
    function blend(word) {
      var parts = word.split("").map(function (ch, i) { return i === 1 ? vow[ch] : snd[ch] || ch; });
      ABC.speak(parts.join("... ") + "... " + word + "!", { rate: 0.75 });
    }
    onsetSel.addEventListener("change", render); rimeSel.addEventListener("change", render);
    document.getElementById("sound-out").addEventListener("click", function () { blend(onsetSel.value + rimeSel.value); });
    document.getElementById("random-word").addEventListener("click", function () {
      var r = ABC.pick(Object.keys(W.cvc)), o = ABC.pick(Object.keys(W.cvc[r]));
      rimeSel.value = r; onsetSel.value = o; render(); blend(o + r); ABC.addStar(1);
    });
    rimeSel.value = "at"; onsetSel.value = "c"; render();
  }

  // ---- Digraphs ----
  function chipRow(target, list) {
    target.innerHTML = list.map(function (w) { return '<button class="word-chip" data-say="' + w[0] + '"><em>' + w[1] + "</em>" + w[0] + "</button>"; }).join("");
  }
  var dg = document.getElementById("digraph-btns"), dgOut = document.getElementById("digraph-words");
  if (dg) {
    Object.keys(W.digraphs).forEach(function (k, i) {
      var b = document.createElement("button"); b.className = "block " + ["c-red", "c-sky", "c-leaf", "c-grape", "c-sun", "c-ink"][i];
      b.textContent = k; b.style.width = "76px";
      b.addEventListener("click", function () {
        chipRow(dgOut, W.digraphs[k]);
        ABC.speak(k.split("").join(" ") + " together say " + { sh: "shh", ch: "ch", th: "th", wh: "wuh", ph: "fff", ck: "kuh" }[k] + ". Like " + W.digraphs[k][0][0]);
      });
      dg.appendChild(b);
    });
    chipRow(dgOut, W.digraphs.sh);
  }
  var bl = document.getElementById("blend-btns"), blOut = document.getElementById("blend-words");
  if (bl) {
    Object.keys(W.blends).forEach(function (k) {
      var b = document.createElement("button"); b.className = "chip"; b.textContent = k;
      b.addEventListener("click", function () {
        bl.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); });
        chipRow(blOut, W.blends[k]); ABC.speak(W.blends[k][0][0] + ". " + W.blends[k][1][0]);
      });
      bl.appendChild(b);
    });
    chipRow(blOut, W.blends.bl);
  }
  document.addEventListener("click", function (e) { var s = e.target.closest("[data-say]"); if (s) ABC.speak(s.getAttribute("data-say")); });

  // ---- Magic e ----
  var me = document.getElementById("magic-e");
  if (me) {
    var i = 0, on = false, word = document.getElementById("me-word"), btn = document.getElementById("me-toggle");
    function show() { var p = W.magicE[i]; word.innerHTML = on ? p[0] + '<span style="color:var(--red)">e</span>' : p[0]; }
    btn.addEventListener("click", function () { on = !on; show(); var p = W.magicE[i]; ABC.speak(on ? p[1] : p[0]); btn.textContent = on ? "Take the e away" : "Add magic e"; });
    document.getElementById("me-next").addEventListener("click", function () { i = (i + 1) % W.magicE.length; on = false; btn.textContent = "Add magic e"; show(); ABC.speak(W.magicE[i][0]); });
    show();
  }
})();

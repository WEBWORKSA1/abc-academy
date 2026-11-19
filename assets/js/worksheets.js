/* Printable worksheet generator. Everything renders in the browser; Print saves a PDF. */
(function () {
  var W = window.ABCWords, ABC = window.ABC;
  var typeSel = document.getElementById("ws-type"); if (!typeSel) return;
  var sheet = document.getElementById("sheet"), opts = document.getElementById("ws-opts");
  var AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  var params = new URLSearchParams(location.search);

  var forms = {
    letter: '<div class="field"><label for="o-letter">Letter</label><select id="o-letter">' + AZ.map(function (l) { return "<option>" + l + "</option>"; }).join("") + '</select></div>' +
      '<div class="field"><label for="o-case">Letters to trace</label><select id="o-case"><option value="both">Uppercase and lowercase</option><option value="upper">Uppercase only</option><option value="lower">Lowercase only</option></select></div>',
    name: '<div class="field"><label for="o-name">Child\'s first name</label><input id="o-name" type="text" maxlength="14" value="Maya" autocomplete="off"><span class="hint">Stays on this device. Nothing is uploaded.</span></div>' +
      '<div class="field"><label for="o-ncase">Style</label><select id="o-ncase"><option value="title">First letter capital (Maya)</option><option value="upper">All capitals (MAYA)</option><option value="lower">All lowercase (maya)</option></select></div>',
    sight: '<div class="field"><label for="o-list">Word list</label><select id="o-list">' + Object.keys(W.dolch).map(function (k) { return "<option>" + k + "</option>"; }).join("") + "</select></div>",
    numbers: '<div class="field"><label for="o-range">Numbers</label><select id="o-range"><option value="0-9">0 to 9</option><option value="1-10" selected>1 to 10</option><option value="11-20">11 to 20</option></select></div>',
    math: '<div class="field"><label for="o-op">Operation</label><select id="o-op"><option value="+">Addition</option><option value="-">Subtraction</option><option value="mix">Mixed</option></select></div>' +
      '<div class="field"><label for="o-max">Numbers within</label><select id="o-max"><option>5</option><option selected>10</option><option>20</option></select></div>' +
      '<label class="check"><input type="checkbox" id="o-key" checked> Include answer key at the bottom</label>',
    cvc: '<div class="field"><label for="o-fam">Word family</label><select id="o-fam"><option value="mix">Mixed families</option>' + Object.keys(W.cvc).map(function (k) { return '<option value="' + k + '">-' + k + "</option>"; }).join("") + "</select></div>",
    missing: '<div class="field"><label for="o-to">Count up to</label><select id="o-to"><option>20</option><option selected>50</option><option>100</option></select></div>',
    cert: '<div class="field"><label for="o-cname">Child\'s name</label><input id="o-cname" type="text" maxlength="24" value="Maya"></div>' +
      '<div class="field"><label for="o-ach">Achievement</label><select id="o-ach"><option>knows all 26 letters</option><option>can read 10 sight words</option><option>counted to 100</option><option>finished the phonics lab</option><option>read a whole story</option><option>is a super reader</option></select></div>'
  };

  function head(title, ins) {
    return '<div class="sheet-head"><span>Name: ______________________</span><span>Date: ____________</span></div><h2>' + title + '</h2><p class="ins">' + ins + "</p>";
  }
  function foot() { return '<div class="ws-key" style="border:0;text-align:center;margin-top:auto">Free printable from ABC.Academy · Personal and classroom use</div>'; }
  function row(text, solidFirst) {
    var s = solidFirst ? '<span class="solid">' + text.split(" ")[0] + "</span>" : "";
    return '<div class="trace-row">' + s + '<span class="ghost">' + text + "</span></div>";
  }
  function repeatTo(str, len) { var out = []; while (out.join(" ").length < len) out.push(str); return out.join(" "); }
  function val(id, d) { var e = document.getElementById(id); return e ? (e.type === "checkbox" ? e.checked : e.value) : d; }

  var render = {
    letter: function () {
      var L = val("o-letter", "A"), c = val("o-case", "both"), rows = [];
      var data = W.letters[AZ.indexOf(L)];
      if (c !== "lower") { rows.push(row(repeatTo(L, 14), true), row(repeatTo(L, 14)), row(repeatTo(L, 14))); }
      if (c !== "upper") { rows.push(row(repeatTo(L.toLowerCase(), 16), true), row(repeatTo(L.toLowerCase(), 16)), row(repeatTo(L.toLowerCase(), 16))); }
      var words = data.w.slice(0, 2).map(function (w) { return row(w[0] + "  " + w[0], false); });
      return head("Trace the letter " + L + " " + L.toLowerCase(), "Start at the top line. Trace each gray letter, then write your own on the last row. " + data.w[0][1] + " " + L + " is for " + data.w[0][0] + ".") +
        rows.join("") + words.join("") + '<div class="trace-row"></div>' + foot();
    },
    name: function () {
      var n = (val("o-name", "Maya") || "Name").replace(/[^A-Za-z\- ]/g, "").slice(0, 14) || "Name", st = val("o-ncase", "title");
      n = st === "upper" ? n.toUpperCase() : st === "lower" ? n.toLowerCase() : n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
      var r = []; for (var i = 0; i < 7; i++) r.push(row(n + "  " + n, i === 0));
      return head("I can write my name", "Trace " + ABC.esc(n) + " on every line. Then write it on your own at the bottom.") + r.join("") + '<div class="trace-row"></div><div class="trace-row"></div>' + foot();
    },
    sight: function () {
      var list = val("o-list", "Pre-primer"), words = ABC.shuffle(W.dolch[list]).slice(0, 8);
      return head("Sight words: " + list, "Read the word. Trace it. Then read it again to a grown-up.") +
        words.map(function (w) { return row(w + "  " + w + "  " + w, true); }).join("") + foot();
    },
    numbers: function () {
      var r = val("o-range", "1-10").split("-"), a = +r[0], b = +r[1], rows = [];
      for (var i = a; i <= b; i++) rows.push(row(repeatTo(String(i), i > 9 ? 16 : 14), true));
      return head("Number tracing " + a + " to " + b, "Trace each number. Say it out loud as you write it.") +
        '<div style="columns:2;column-gap:2rem">' + rows.join("") + "</div>" + foot();
    },
    math: function () {
      var op = val("o-op", "+"), max = +val("o-max", 10), key = val("o-key", true), probs = [];
      for (var i = 0; i < 20; i++) {
        var o = op === "mix" ? (Math.random() < .5 ? "+" : "-") : op, a = Math.floor(Math.random() * (max + 1)), b = Math.floor(Math.random() * (max + 1));
        if (o === "+") { while (a + b > max) b = Math.floor(Math.random() * (max - a + 1)); probs.push([a, "+", b, a + b]); }
        else { if (b > a) { var t = a; a = b; b = t; } probs.push([a, "−", b, a - b]); }
      }
      var name = op === "+" ? "Addition" : op === "-" ? "Subtraction" : "Addition and subtraction";
      return head(name + " within " + max, "Solve each problem. Use your fingers or draw dots if you need to.") +
        '<div class="ws-grid">' + probs.map(function (p, i) { return '<div class="ws-prob"><span class="n">' + (i + 1) + ".</span>" + p[0] + " " + p[1] + " " + p[2] + " = ______</div>"; }).join("") + "</div>" +
        (key ? '<div class="ws-key">Answer key: ' + probs.map(function (p, i) { return (i + 1) + ") " + p[3]; }).join(" · ") + "</div>" : "") + foot();
    },
    cvc: function () {
      var fam = val("o-fam", "mix"), pool = [];
      Object.keys(W.cvc).forEach(function (r) { if (fam !== "mix" && r !== fam) return; Object.keys(W.cvc[r]).forEach(function (o) { if (W.cvc[r][o]) pool.push([o + r, W.cvc[r][o]]); }); });
      var items = ABC.shuffle(pool).slice(0, 8);
      return head("Say it, sound it, write it", "Look at the picture. Say the word slowly, sound by sound. Write the word on the line.") +
        '<div class="ws-cvc">' + items.map(function (it) { return "<div><em>" + it[1] + "</em><span></span></div>"; }).join("") + "</div>" +
        '<div class="ws-key">Answer key: ' + items.map(function (it, i) { return (i + 1) + ") " + it[0]; }).join(" · ") + "</div>" + foot();
    },
    missing: function () {
      var to = +val("o-to", 50), rows = [];
      for (var i = 0; i < 10; i++) {
        var s = 1 + Math.floor(Math.random() * (to - 5)), gap = Math.floor(Math.random() * 5);
        rows.push('<div class="ws-prob" style="gap:1rem">' + [0, 1, 2, 3, 4].map(function (k) { return k === gap ? "____" : String(s + k); }).join("&nbsp;&nbsp;") + "</div>");
      }
      return head("Fill in the missing numbers", "Count forward. Write the number that is missing in each row.") +
        '<div style="display:grid;gap:1.1rem;font-size:1.3rem">' + rows.join("") + "</div>" + foot();
    },
    cert: function () {
      var n = ABC.esc((val("o-cname", "Maya") || "").slice(0, 24)), a = ABC.esc(val("o-ach", "knows all 26 letters"));
      return '<div class="cert"><div><div style="font-size:3rem">🏅</div><h2>Certificate of Achievement</h2><p style="font-family:var(--body)">This certificate is proudly presented to</p><div class="name">' + n +
        '</div><p style="font-size:1.4rem">who ' + a + '!</p><p style="font-family:var(--body);margin-top:2rem">Signed: ____________________ &nbsp; Date: ____________</p><p class="small" style="font-family:var(--body);color:#666">ABC.Academy · Free early learning</p></div></div>';
    }
  };

  function draw() {
    var t = typeSel.value;
    sheet.style.display = "flex"; sheet.style.flexDirection = "column";
    sheet.innerHTML = render[t]();
  }
  function setType(t) {
    typeSel.value = t; opts.innerHTML = forms[t];
    opts.querySelectorAll("input,select").forEach(function (el) { el.addEventListener("input", draw); el.addEventListener("change", draw); });
    draw();
  }
  typeSel.addEventListener("change", function () { setType(typeSel.value); history.replaceState(null, "", "?type=" + typeSel.value); });
  document.getElementById("ws-new").addEventListener("click", draw);
  document.getElementById("ws-print").addEventListener("click", function () {
    var c = ABC.store.get("printed", 0) + 1; ABC.store.set("printed", c); window.print();
  });

  var t = params.get("type");
  setType(forms[t] ? t : "letter");
  if (t === "sight" && params.get("list")) { var l = document.getElementById("o-list"); l.value = params.get("list"); draw(); }
  if (t === "math") { var op = params.get("op"), mx = params.get("max"); if (op) document.getElementById("o-op").value = op === "−" ? "-" : op; if (mx) document.getElementById("o-max").value = mx; draw(); }
  if (t === "letter" && params.get("letter")) { document.getElementById("o-letter").value = params.get("letter").toUpperCase(); draw(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
})();

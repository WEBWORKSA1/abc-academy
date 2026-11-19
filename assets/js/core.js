/* ABC.Academy core: navigation, speech, forms, daily content, consent, lead prompts. */
(function () {
  "use strict";
  var doc = document, body = doc.body;
  var ROOT = (body.getAttribute("data-root") || ".").replace(/\/$/, "");

  // ---- Site configuration (edit payment links here; empty = pledge form is used) ----
  var CONFIG = {
    donate: { stripe: "", paypal: "", buymeacoffee: "" },
    exitIntentDays: 7
  };

  // Delivery address is assembled at runtime and never appears in page source.
  var _k = ["bW9jLmx", "pYW1nQD", "Fhc2tyb", "3diZXc="];
  function inbox() { try { return atob(_k.join("")).split("").reverse().join(""); } catch (e) { return ""; } }
  function endpoint() { return "https://formsubmit.co/ajax/" + inbox(); }

  var ABC = window.ABC = { root: ROOT, config: CONFIG };
  ABC.url = function (p) { return ROOT + "/" + p.replace(/^\//, ""); };

  // ---- Storage ----
  ABC.store = {
    get: function (k, d) { try { var v = localStorage.getItem("abc_" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("abc_" + k, JSON.stringify(v)); } catch (e) {} }
  };

  // ---- Toast ----
  var toastEl;
  ABC.toast = function (msg, ms) {
    if (!toastEl) { toastEl = doc.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, ms || 2600);
  };

  // ---- Speech (Web Speech API) ----
  var voice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    var vs = speechSynthesis.getVoices();
    voice = vs.filter(function (v) { return /en[-_]US/i.test(v.lang) && /female|samantha|google us english|aria|jenny/i.test(v.name); })[0]
      || vs.filter(function (v) { return /^en/i.test(v.lang); })[0] || null;
  }
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  ABC.canSpeak = "speechSynthesis" in window;
  ABC.speak = function (text, opts) {
    opts = opts || {};
    if (!ABC.canSpeak) { if (!ABC._warned) { ABC.toast("Sound is not supported in this browser."); ABC._warned = true; } return; }
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.rate = opts.rate || 0.85; u.pitch = opts.pitch || 1.1; u.lang = "en-US";
    if (opts.onboundary) u.onboundary = opts.onboundary;
    if (opts.onend) u.onend = opts.onend;
    speechSynthesis.speak(u);
    return u;
  };

  // ---- Stars (shared progress across tools) ----
  ABC.addStar = function (n) {
    var s = ABC.store.get("stars", 0) + (n || 1); ABC.store.set("stars", s);
    doc.querySelectorAll("[data-stars]").forEach(function (el) { el.textContent = s; });
    return s;
  };
  doc.querySelectorAll("[data-stars]").forEach(function (el) { el.textContent = ABC.store.get("stars", 0); });

  ABC.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  ABC.pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  ABC.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  ABC.json = function (path) {
    return fetch(ABC.url(path) + "?v=" + new Date().toISOString().slice(0, 10), { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  };

  // ---- Navigation ----
  var here = location.pathname.replace(/\/$/, "/index.html");
  doc.querySelectorAll(".nav a[href]").forEach(function (a) {
    var p = a.pathname.replace(/\/$/, "/index.html");
    if (p === here && !a.classList.contains("btn")) a.setAttribute("aria-current", "page");
    if (/\/guides\/[^/]+\.html$/.test(here) && /\/guides\.html$/.test(p)) a.setAttribute("aria-current", "page");
  });
  var nav = doc.querySelector(".nav"), toggle = doc.querySelector(".menu-toggle"), close = doc.querySelector(".nav-close");
  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle("open", open); body.classList.toggle("menu-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (toggle) toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  if (close) close.addEventListener("click", function () { setMenu(false); });
  doc.querySelectorAll(".dd-btn").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var li = b.parentElement, was = li.classList.contains("open");
      doc.querySelectorAll(".dd.open").forEach(function (x) { x.classList.remove("open"); x.querySelector(".dd-btn").setAttribute("aria-expanded", "false"); });
      if (!was) { li.classList.add("open"); b.setAttribute("aria-expanded", "true"); }
    });
  });
  doc.addEventListener("click", function (e) {
    if (!e.target.closest(".dd")) doc.querySelectorAll(".dd.open").forEach(function (x) { x.classList.remove("open"); });
  });
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { setMenu(false); doc.querySelectorAll(".dd.open").forEach(function (x) { x.classList.remove("open"); }); closeModal(); }
  });

  // ---- Forms → email delivery (FormSubmit) ----
  function formToObject(form) {
    var data = {}, fd = new FormData(form);
    fd.forEach(function (v, k) {
      if (k === "_honey") return;
      if (data[k] !== undefined) data[k] = [].concat(data[k], v); else data[k] = v;
    });
    Object.keys(data).forEach(function (k) { if (Array.isArray(data[k])) data[k] = data[k].join(", "); });
    return data;
  }
  ABC.send = function (data) {
    data._captcha = "false"; data._template = "table";
    data["Page"] = location.href; data["Submitted"] = new Date().toISOString();
    return fetch(endpoint(), { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.message || r.status); return j; }); });
  };
  ABC.bindForm = function (form, opts) {
    opts = opts || {};
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var hp = form.querySelector("[name=_honey]");
      if (hp && hp.value) return; // bot
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = formToObject(form);
      if (opts.enrich) opts.enrich(data);
      data._subject = "ABC.Academy — " + (form.getAttribute("data-form") || "Form") + (data.name ? " from " + data.name : "");
      data["Form"] = form.getAttribute("data-form") || "Form";
      var btn = form.querySelector("[type=submit]"), label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      ABC.send(data).then(function () {
        form.classList.add("sent");
        var log = ABC.store.get("sent", []); log.push({ f: data.Form, t: Date.now() }); ABC.store.set("sent", log.slice(-20));
        ABC.store.set("lead_done", true);
        if (opts.done) opts.done(data);
        var d = form.querySelector(".form-done"); if (d) { d.setAttribute("tabindex", "-1"); d.focus(); }
      }).catch(function () {
        ABC.toast("We couldn't send that. Check your connection and try again.", 4000);
      }).then(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
    });
  };
  doc.querySelectorAll("form[data-form]:not([data-manual])").forEach(function (f) { ABC.bindForm(f); });

  // ---- Lite YouTube embeds (load the player only on click) ----
  ABC.liteYT = function (scope) {
    (scope || doc).querySelectorAll(".lite[data-id]:not([data-bound])").forEach(function (el) {
      el.setAttribute("data-bound", "1");
      var id = el.getAttribute("data-id");
      el.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
      el.addEventListener("click", function () {
        if (el.querySelector("iframe")) return;
        var f = doc.createElement("iframe");
        f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1";
        f.title = el.getAttribute("aria-label") || "Video";
        f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        f.allowFullscreen = true; el.appendChild(f);
        var log = ABC.store.get("watched", 0); ABC.store.set("watched", log + 1);
      });
    });
  };
  ABC.liteYT();

  ABC.videoCard = function (v) {
    return '<article class="vcard"><button class="lite" data-id="' + ABC.esc(v.id) + '" aria-label="Play: ' + ABC.esc(v.title) + '"></button>' +
      '<div class="vbody"><h3>' + ABC.esc(v.title) + '</h3><div class="meta">' + ABC.esc(v.channel || "") + (v.category ? " · " + ABC.esc(v.category) : "") + '</div></div></article>';
  };

  // ---- Daily content (auto-refreshed by the scheduled workflow; computed locally as fallback) ----
  ABC.daily = function () {
    return ABC.json("data/daily.json").catch(function () { return null; }).then(function (d) {
      var today = new Date().toISOString().slice(0, 10);
      if (d && d.date === today) return d;
      var W = window.ABCWords;
      if (!W) return d;
      var n = Math.floor(Date.now() / 864e5);
      var L = W.letters[n % 26];
      var words = W.wordOfDay;
      var w = words[n % words.length];
      var a = 1 + (n * 7) % 9, b = 1 + (n * 3) % 9;
      return { date: today, letter: { upper: L.l, lower: L.l.toLowerCase(), sound: L.s, word: L.w[0][0], emoji: L.w[0][1] },
        word: { word: w[0], emoji: w[1], sentence: w[2] }, challenge: { q: a + " + " + b + " = ?", a: a + b } };
    });
  };

  // ---- Cookie / consent notice ----
  if (!ABC.store.get("consent", null)) {
    var c = doc.createElement("div"); c.className = "cookie show"; c.setAttribute("role", "dialog"); c.setAttribute("aria-label", "Cookie notice");
    c.innerHTML = '<strong>Cookies on ABC.Academy</strong><p class="small" style="margin:.3rem 0 0">We use cookies for ads (Google AdSense), basic analytics and to remember progress on this device. See our <a href="' + ABC.url("privacy.html") + '">privacy policy</a>.</p><div class="btn-row"><button class="btn btn-ink btn-sm" data-c="all">Accept</button><button class="btn btn-ghost btn-sm" data-c="min">Necessary only</button></div>';
    body.appendChild(c);
    c.addEventListener("click", function (e) {
      var v = e.target.getAttribute("data-c"); if (!v) return;
      ABC.store.set("consent", v);
      if (v === "min") { (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1; }
      c.remove();
    });
  } else if (ABC.store.get("consent") === "min") {
    (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1;
  }

  // ---- Exit-intent learning-plan prompt (desktop) and sticky mobile CTA ----
  var modal = doc.getElementById("plan-modal");
  function closeModal() { if (modal) modal.classList.remove("show"); }
  ABC.openModal = function () {
    if (!modal) return;
    modal.classList.add("show");
    var f = modal.querySelector("input,select,button"); if (f) setTimeout(function () { f.focus(); }, 50);
    ABC.store.set("exit_seen", Date.now());
  };
  if (modal) {
    modal.addEventListener("click", function (e) { if (e.target === modal || e.target.closest(".modal-x")) closeModal(); });
    var eligible = body.getAttribute("data-exit") === "1" && !ABC.store.get("lead_done", false) &&
      (Date.now() - ABC.store.get("exit_seen", 0)) > CONFIG.exitIntentDays * 864e5;
    if (eligible) {
      var armed = false; setTimeout(function () { armed = true; }, 12000);
      doc.addEventListener("mouseout", function h(e) {
        if (!armed || e.relatedTarget || e.clientY > 8) return;
        doc.removeEventListener("mouseout", h); ABC.openModal();
      });
    }
    doc.querySelectorAll("[data-open-plan]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); ABC.openModal(); }); });
  }
  var sticky = doc.querySelector(".sticky-cta");
  if (sticky && !ABC.store.get("lead_done", false)) {
    window.addEventListener("scroll", function onS() {
      if (window.scrollY > doc.documentElement.scrollHeight * 0.3) {
        sticky.classList.add("show"); body.classList.add("has-sticky"); window.removeEventListener("scroll", onS);
      }
    }, { passive: true });
  }

  // ---- Newsletter / search shortcuts ----
  doc.querySelectorAll("form[data-search]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault(); var q = f.querySelector("input").value.trim();
      location.href = ABC.url("search.html") + "?q=" + encodeURIComponent(q);
    });
  });
  doc.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---- Guide table of contents (built from the article's h2 headings) ----
  doc.querySelectorAll("[data-auto-toc]").forEach(function (ol) {
    var hs = doc.querySelectorAll(".prose h2[id]");
    ol.innerHTML = Array.prototype.map.call(hs, function (h) { return '<li><a href="#' + h.id + '">' + ABC.esc(h.textContent) + "</a></li>"; }).join("");
    if (!hs.length) ol.closest(".toc").remove();
  });
})();

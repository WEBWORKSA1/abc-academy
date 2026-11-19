/* ABC.Academy shared word bank. Dolch lists are public domain (E. W. Dolch, 1936/1948). */
window.ABCWords = (function () {
  var letters = [
    { l: "A", s: "ah", w: [["apple", "🍎"], ["ant", "🐜"], ["alligator", "🐊"], ["astronaut", "🧑‍🚀"]] },
    { l: "B", s: "buh", w: [["ball", "⚽"], ["bear", "🐻"], ["banana", "🍌"], ["bus", "🚌"]] },
    { l: "C", s: "kuh", w: [["cat", "🐱"], ["cake", "🎂"], ["car", "🚗"], ["corn", "🌽"]] },
    { l: "D", s: "duh", w: [["dog", "🐶"], ["duck", "🦆"], ["drum", "🥁"], ["door", "🚪"]] },
    { l: "E", s: "eh", w: [["egg", "🥚"], ["elephant", "🐘"], ["elf", "🧝"], ["envelope", "✉️"]] },
    { l: "F", s: "fff", w: [["fish", "🐟"], ["frog", "🐸"], ["fox", "🦊"], ["fire", "🔥"]] },
    { l: "G", s: "guh", w: [["goat", "🐐"], ["grapes", "🍇"], ["gift", "🎁"], ["guitar", "🎸"]] },
    { l: "H", s: "huh", w: [["hat", "🎩"], ["horse", "🐴"], ["house", "🏠"], ["heart", "❤️"]] },
    { l: "I", s: "ih", w: [["insect", "🐞"], ["iguana", "🦎"], ["ink", "🖋️"], ["infant", "👶"]] },
    { l: "J", s: "juh", w: [["juice", "🧃"], ["jet", "✈️"], ["jeans", "👖"], ["jaguar", "🐆"]] },
    { l: "K", s: "kuh", w: [["kite", "🪁"], ["kangaroo", "🦘"], ["key", "🔑"], ["king", "🤴"]] },
    { l: "L", s: "lll", w: [["lion", "🦁"], ["lemon", "🍋"], ["leaf", "🍃"], ["lamp", "💡"]] },
    { l: "M", s: "mmm", w: [["moon", "🌙"], ["monkey", "🐵"], ["milk", "🥛"], ["mouse", "🐭"]] },
    { l: "N", s: "nnn", w: [["nose", "👃"], ["nut", "🥜"], ["net", "🥅"], ["night", "🌃"]] },
    { l: "O", s: "ah", w: [["octopus", "🐙"], ["ox", "🐂"], ["otter", "🦦"], ["olive", "🫒"]] },
    { l: "P", s: "puh", w: [["pig", "🐷"], ["pizza", "🍕"], ["pencil", "✏️"], ["penguin", "🐧"]] },
    { l: "Q", s: "kwuh", w: [["queen", "👸"], ["question", "❓"], ["quarter", "🪙"], ["quiet", "🤫"]] },
    { l: "R", s: "rrr", w: [["rabbit", "🐰"], ["rainbow", "🌈"], ["robot", "🤖"], ["rocket", "🚀"]] },
    { l: "S", s: "sss", w: [["sun", "☀️"], ["snake", "🐍"], ["sock", "🧦"], ["star", "⭐"]] },
    { l: "T", s: "tuh", w: [["tiger", "🐯"], ["tree", "🌳"], ["train", "🚂"], ["turtle", "🐢"]] },
    { l: "U", s: "uh", w: [["umbrella", "☂️"], ["up", "⬆️"], ["under", "⬇️"], ["upside down", "🙃"]] },
    { l: "V", s: "vvv", w: [["van", "🚐"], ["violin", "🎻"], ["volcano", "🌋"], ["vest", "🦺"]] },
    { l: "W", s: "wuh", w: [["watermelon", "🍉"], ["worm", "🪱"], ["wolf", "🐺"], ["web", "🕸️"]] },
    { l: "X", s: "ks", w: [["box", "📦"], ["fox", "🦊"], ["x-ray", "🩻"], ["six", "6️⃣"]] },
    { l: "Y", s: "yuh", w: [["yo-yo", "🪀"], ["yak", "🐃"], ["yarn", "🧶"], ["yellow", "💛"]] },
    { l: "Z", s: "zzz", w: [["zebra", "🦓"], ["zipper", "🤐"], ["zero", "0️⃣"], ["zigzag", "⚡"]] }
  ];

  var dolch = {
    "Pre-primer": "a and away big blue can come down find for funny go help here I in is it jump little look make me my not one play red run said see the three to two up we where yellow you".split(" "),
    "Primer": "all am are at ate be black brown but came did do eat four get good have he into like must new no now on our out please pretty ran ride saw say she so soon that there they this too under want was well went what white who will with yes".split(" "),
    "First grade": "after again an any as ask by could every fly from give going had has her him his how just know let live may of old once open over put round some stop take thank them then think walk were when".split(" "),
    "Second grade": "always around because been before best both buy call cold does don't fast first five found gave goes green its made many off or pull read right sing sit sleep tell their these those upon us use very wash which why wish work would write your".split(" "),
    "Third grade": "about better bring carry clean cut done draw drink eight fall far full got grow hold hot hurt if keep kind laugh light long much myself never only own pick seven shall show six small start ten today together try warm".split(" "),
    "Nouns": "apple baby back ball bear bed bell bird birthday boat box boy bread brother cake car cat chair chicken children coat corn cow day dog doll door duck egg eye farm farmer father feet fire fish floor flower game garden girl goodbye grass ground hand head hill home horse house kitty leg letter man men milk money morning mother name nest night paper party picture pig rabbit rain ring robin school seed sheep shoe sister snow song squirrel stick street sun table thing time top toy tree watch water way wind window wood".split(" ")
  };

  // CVC words that are real, kid-friendly, with a picture where one fits.
  var cvc = {
    at: { b: "🦇", c: "🐱", h: "🎩", m: "🧘", r: "🐀", s: "🪑", f: "", p: "🖐️", v: "🛢️" },
    an: { c: "🥫", f: "🌀", m: "👨", p: "🍳", r: "🏃", t: "🟫", v: "🚐" },
    ap: { c: "🧢", m: "🗺️", n: "😴", t: "🚰", l: "🦵", g: "", s: "🌳", r: "🎤" },
    ag: { b: "👜", r: "🧽", t: "🏷️", w: "🐕", n: "", s: "", l: "" },
    ad: { d: "👨", b: "👎", h: "", m: "😠", p: "📝", s: "😢" },
    ig: { b: "🐘", d: "⛏️", f: "🫐", p: "🐷", w: "💇", j: "💃" },
    in: { b: "🗑️", f: "🦈", p: "📌", t: "🥫", w: "🏆" },
    it: { b: "", f: "💪", h: "🏏", k: "🧰", l: "🕯️", p: "🕳️", s: "🪑" },
    ip: { d: "🏊", h: "🕺", l: "👄", r: "", s: "🥤", t: "💡", z: "🤐" },
    ot: { c: "🛏️", d: "⚫", g: "", h: "🔥", l: "", n: "🚫", p: "🍲", r: "" },
    op: { h: "🐇", m: "🧹", p: "🎈", t: "🔝" },
    og: { d: "🐶", f: "🌫️", h: "🐗", j: "🏃", l: "🪵" },
    ug: { b: "🐛", h: "🤗", j: "🏺", m: "☕", r: "🟥", t: "🚢" },
    un: { b: "🍞", f: "🎉", r: "🏃", s: "☀️" },
    ut: { b: "", c: "✂️", h: "🛖", n: "🥜" },
    en: { d: "🦊", h: "🐔", m: "👨‍👨‍👦", p: "🖊️", t: "🔟" },
    et: { b: "", g: "", j: "✈️", l: "", m: "🤝", n: "🥅", p: "🐕", s: "", v: "🩺", w: "💧" },
    ed: { b: "🛏️", f: "🍽️", l: "", r: "🔴", w: "💒" }
  };
  var onsets = "b c d f g h j k l m n p r s t v w z".split(" ");

  var digraphs = {
    sh: [["ship", "🚢"], ["shell", "🐚"], ["fish", "🐟"], ["shoe", "👞"]],
    ch: [["chick", "🐥"], ["cheese", "🧀"], ["chair", "🪑"], ["lunch", "🍱"]],
    th: [["thumb", "👍"], ["three", "3️⃣"], ["bath", "🛁"], ["teeth", "🦷"]],
    wh: [["whale", "🐋"], ["wheel", "🛞"], ["white", "⚪"], ["whisper", "🤫"]],
    ph: [["phone", "📱"], ["photo", "📷"], ["dolphin", "🐬"], ["elephant", "🐘"]],
    ck: [["duck", "🦆"], ["sock", "🧦"], ["clock", "🕐"], ["truck", "🚚"]]
  };
  var blends = {
    bl: [["block", "🧱"], ["blue", "🔵"]], cl: [["clap", "👏"], ["clock", "🕐"]], fl: [["flag", "🚩"], ["flower", "🌸"]],
    gl: [["glass", "🥛"], ["glove", "🧤"]], pl: [["plane", "✈️"], ["plate", "🍽️"]], sl: [["slide", "🛝"], ["sled", "🛷"]],
    br: [["bread", "🍞"], ["brush", "🪥"]], cr: [["crab", "🦀"], ["crown", "👑"]], dr: [["drum", "🥁"], ["dress", "👗"]],
    fr: [["frog", "🐸"], ["fruit", "🍓"]], gr: [["grapes", "🍇"], ["green", "🟢"]], tr: [["tree", "🌳"], ["train", "🚂"]],
    st: [["star", "⭐"], ["stop", "🛑"]], sn: [["snail", "🐌"], ["snake", "🐍"]], sp: [["spoon", "🥄"], ["spider", "🕷️"]], sw: [["swan", "🦢"], ["swim", "🏊"]]
  };
  var magicE = [["cap", "cape"], ["tap", "tape"], ["can", "cane"], ["hat", "hate"], ["kit", "kite"], ["bit", "bite"], ["pin", "pine"],
    ["rid", "ride"], ["hop", "hope"], ["not", "note"], ["rob", "robe"], ["cub", "cube"], ["tub", "tube"], ["cut", "cute"], ["mad", "made"], ["dim", "dime"]];

  var rhymes = [
    ["cat", "🐱", "hat", "🎩"], ["dog", "🐶", "log", "🪵"], ["bee", "🐝", "tree", "🌳"], ["cake", "🎂", "snake", "🐍"],
    ["star", "⭐", "car", "🚗"], ["moon", "🌙", "spoon", "🥄"], ["bug", "🐛", "mug", "☕"], ["fox", "🦊", "box", "📦"],
    ["goat", "🐐", "boat", "⛵"], ["mouse", "🐭", "house", "🏠"], ["bear", "🐻", "chair", "🪑"], ["frog", "🐸", "log", "🪵"],
    ["king", "🤴", "ring", "💍"], ["sock", "🧦", "clock", "🕐"], ["fish", "🐟", "dish", "🍽️"], ["pig", "🐷", "wig", "💇"]
  ];

  var wordOfDay = [
    ["curious", "🔍", "A curious kid asks lots of questions."], ["gigantic", "🦕", "The dinosaur was gigantic."], ["gentle", "🕊️", "Be gentle with the kitten."],
    ["brave", "🦁", "It was brave to try the tall slide."], ["sparkle", "✨", "The stars sparkle at night."], ["tiny", "🐜", "An ant is tiny."],
    ["delicious", "🍓", "The strawberries were delicious."], ["giggle", "😆", "The puppy made us giggle."], ["enormous", "🐘", "An elephant is enormous."],
    ["quiet", "🤫", "The library is a quiet place."], ["shiny", "🪙", "She found a shiny coin."], ["fluffy", "🐑", "The sheep is fluffy."],
    ["speedy", "🏎️", "The race car is speedy."], ["grumpy", "😠", "The grumpy cat wanted a nap."], ["patient", "⏳", "Be patient while the cookies bake."],
    ["explore", "🧭", "Let's explore the garden."], ["melt", "🍦", "Ice cream can melt in the sun."], ["soar", "🦅", "Eagles soar high in the sky."],
    ["crunchy", "🥕", "Carrots are crunchy."], ["cozy", "🛋️", "The blanket feels cozy."], ["splash", "💦", "We splash in the puddles."],
    ["whisper", "🤫", "Please whisper in the hallway."], ["bright", "☀️", "The sun is bright today."], ["sticky", "🍯", "Honey is sticky."],
    ["helpful", "🤝", "Thank you for being helpful."], ["soggy", "🥣", "The cereal got soggy."], ["wobble", "🍮", "The jelly began to wobble."],
    ["build", "🧱", "We can build a tall tower."], ["chilly", "🥶", "It is chilly outside."], ["proud", "🏅", "I feel proud of my work."]
  ];

  return { letters: letters, dolch: dolch, cvc: cvc, onsets: onsets, digraphs: digraphs, blends: blends, magicE: magicE, rhymes: rhymes, wordOfDay: wordOfDay };
})();

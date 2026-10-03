/* Aureum studio
   Copyright (c) 2026 Shrinjoy Ghosh
   MIT License. See LICENSE in the repository root.

   One page. The ledger is written to localStorage for this browser
   and this file. Nothing is uploaded.
*/
(function () {
  var L = globalThis.AureumLedger;
  var KEY = "aureum-capital-classes-v1";

  var data = L.seedData();
  var storageOk = true;
  var notice = "";
  var confirmReset = false;
  var celebrate = false;
  var openTier = null;
  var composer = { title: "", body: "", error: "" };
  var editingId = null;
  var editDraft = { title: "", body: "", error: "" };
  var confirmingId = null;
  var restoreFocus = false;
  var numberDraft = { monthly: null, yield: null };

  function esc(value) {
    return String(value)
      .replace(/&/g, "\u0026amp;")
      .replace(/</g, "\u0026lt;")
      .replace(/>/g, "\u0026gt;")
      .replace(/"/g, "\u0026quot;");
  }

  function svg(path) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      path +
      "</svg>"
    );
  }

  var ICONS = {
    crown: svg('<path d="M3 17h18"/><path d="M4 17 6.5 8 12 13l5.5-5L20 17"/>'),
    gem: svg('<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/><path d="M12 21 8 9l4-6 4 6z"/>'),
    compass: svg('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'),
    hourglass: svg('<path d="M6 3h12M6 21h12"/><path d="M7 3c0 5 10 5 10 8s-10 3-10 8"/><path d="M17 3c0 5-10 5-10 8s10 3 10 8"/>'),
    shield: svg('<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="M12 8v5"/><path d="M12 16h.01"/>'),
    download: svg('<path d="M12 4v10"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/>'),
    upload: svg('<path d="M12 16V6"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    pencil: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>'),
    trash: svg('<path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M7 7l1 13h8l1-13"/>'),
    check: svg('<path d="m5 12 5 5L20 7"/>'),
    back: svg('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>'),
  };

  var TIER_ICON = { S: "crown", A: "gem", B: "compass", C: "hourglass", D: "shield" };

  function touch(recipe) {
    var next = structuredClone(data);
    recipe(next);
    data = next;
    persist();
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ state: { data: data }, version: 0 }));
      storageOk = true;
    } catch (err) {
      storageOk = false;
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      storageOk = true;
      if (!raw) {
        data = L.seedData();
        persist();
        return;
      }
      var parsed = L.parseBackup(raw);
      if (!parsed.ok) {
        data = L.seedData();
        notice = "What was stored here is not an Aureum ledger. Starter notes are in its place.";
        persist();
        return;
      }
      data = parsed.data;
    } catch (err) {
      storageOk = false;
      data = L.seedData();
      notice =
        "This browser will not keep the ledger. Export a JSON backup before you close the tab.";
    }
  }

  function setNotice(text) {
    notice = text;
    render();
  }

  function fieldNumber(bind, numeric) {
    if (numberDraft[bind] != null) return esc(numberDraft[bind]);
    return esc(numeric);
  }

  function view() {
    var score = L.clarityScore(data);
    var rank = L.rankFor(score);
    var total = L.strategyCount(data);
    var goal = data.goal;
    var capital = L.capitalRequired(goal.monthlyAmount, goal.yieldPercent);
    var monthly = L.formatMoney(goal.monthlyAmount, goal.currency);
    var name = goal.dedication.trim();

    var currencyOptions = L.CURRENCIES.map(function (code) {
      return '<option value="' + code + '"' + (code === goal.currency ? " selected" : "") + ">" + code + "</option>";
    }).join("");

    var capitalLine;
    if (capital == null) {
      capitalLine = "Set a monthly amount and a yield to see the capital that could carry it.";
    } else {
      capitalLine =
        "At " +
        esc(goal.yieldPercent) +
        "% a year, about <strong class=\"nums\">" +
        esc(L.formatMoney(capital, goal.currency)) +
        "</strong> of productive capital can carry " +
        esc(monthly) +
        " a month. That is an S-class shape: the money works, and the days stay yours.";
    }

    var ladder = L.TIERS.map(function (tier) {
      var count = data.tiers[tier].strategies.length;
      var tone = tier === "D" ? (count ? "clay" : "mute") : count ? "gold" : "mute";
      return (
        "<li><span class=\"" +
        tone +
        "\">" +
        tier +
        " class" +
        (count ? "" : " · empty") +
        "</span><span class=\"nums dim\">" +
        count +
        "</span></li>"
      );
    }).join("");

    var jumps = L.TIERS.map(function (tier) {
      var cls = tier === "D" ? "btn btn-ghost clay" : "btn btn-ghost";
      return (
        '<a class="' +
        cls +
        '" href="#tier-' +
        tier +
        '">' +
        tier +
        ' class <span class="nums mute">' +
        data.tiers[tier].strategies.length +
        "</span></a>"
      );
    }).join("");

    var sections = L.TIERS.map(renderTier).join("");

    var reached = goal.achieved
      ? '<div class="reached"><p>This amount is marked reached. The blessing is still here.</p><button type="button" class="btn btn-gold" data-action="read-blessing">Read it again</button></div>'
      : "";

    var resetBlock = confirmReset
      ? '<div class="confirm"><p class="dim">Replace everything on this device with the starter notes?</p><div class="row"><button type="button" class="btn btn-clay" data-action="restore">Restore starters</button><button type="button" class="btn btn-ghost" data-action="cancel-reset">Cancel</button></div></div>'
      : '<button type="button" class="btn btn-ghost" data-action="ask-reset">' + ICONS.back + " Restore starter notes</button>";

    var storageLine = storageOk
      ? "Saved in this browser, on this device. It is not uploaded."
      : "This browser did not store the last change.";

    return (
      '<div class="shell">' +
      '<header class="top"><div class="top-inner"><div><p class="kicker">Capital classes</p><h1>Aureum</h1><p class="lede">Written with care' +
      (name ? " for " + esc(name) : "") +
      ". The summit is S. The fail path is D.</p></div><p class=\"rank-line\">Rank · <span class=\"gold\">" +
      esc(rank.title) +
      "</span></p></div></header>" +
      '<div class="page"><div class="stack main">' +
      '<section class="card"><p class="kicker">The amount you want</p><h2 class="display" style="font-size:1.85rem;margin-top:0.4rem">Enter the capital you mean to receive.</h2><p class="dim" style="margin-top:0.5rem;max-width:40rem">A monthly figure, kept with care. The classes below are how you get there — from the path that grows you to the one that spends you.</p>' +
      '<div class="grid-2"><label><span class="lbl">Currency</span><select class="field" data-bind="currency" aria-label="Currency">' +
      currencyOptions +
      '</select></label><label><span class="lbl">Monthly amount</span><input class="field nums" data-bind="monthly" inputmode="decimal" aria-label="Monthly amount" autocomplete="off" value="' +
      fieldNumber("monthly", goal.monthlyAmount) +
      '"></label></div>' +
      '<p class="display amount nums">' +
      esc(monthly) +
      '<span class="per">each month</span></p>' +
      '<label style="margin-top:1.5rem"><span class="lbl">What this income is for</span><input class="field" data-bind="intent" maxlength="180" value="' +
      esc(goal.intent) +
      '" placeholder="Freedom income, a quieter life, a family kept well"></label>' +
      '<div class="grid-2"><label><span class="lbl">Yearly yield %</span><input class="field nums" data-bind="yield" inputmode="decimal" aria-label="Assumed yearly yield percent" autocomplete="off" value="' +
      fieldNumber("yield", goal.yieldPercent) +
      '"></label><div class="note">' +
      capitalLine +
      "</div></div>" +
      '<label style="margin-top:1.25rem"><span class="lbl">Kept with love for</span><input class="field" data-bind="dedication" maxlength="80" value="' +
      esc(goal.dedication) +
      '" placeholder="Your name"></label>' +
      '<div class="mark-row"><div><p style="font-weight:500">Have you reached this amount?</p><p class="mute" style="font-size:0.92rem">Mark it yourself. Unmark any time — the ledger will not scold you.</p></div><button type="button" class="btn ' +
      (goal.achieved ? "btn-gold" : "btn-ghost") +
      ' wide" role="switch" aria-checked="' +
      goal.achieved +
      '" data-action="toggle-achieved">' +
      ICONS.check +
      (goal.achieved ? " Reached" : " Not yet") +
      "</button></div></section>" +
      reached +
      "</div>" +
      '<aside class="side"><div class="side-inner"><section class="panel"><p class="kicker">Path rank</p><p class="display" style="font-size:1.9rem;margin-top:0.4rem">' +
      esc(rank.title) +
      '</p><p class="dim" style="margin-top:0.25rem">' +
      esc(rank.line) +
      '</p><div class="meter" aria-hidden="true"><span style="width:' +
      score +
      '%"></span></div><p class="mute nums" style="margin-top:0.5rem;font-size:0.92rem">Clarity ' +
      score +
      " · " +
      total +
      ' strategies</p><ul class="ladder">' +
      ladder +
      "</ul></section>" +
      '<section class="panel"><p class="kicker">On this device</p><p class="dim" style="margin-top:0.5rem;font-size:0.92rem">' +
      esc(storageLine) +
      " Export JSON if you want a copy you can move.</p>" +
      '<div class="actions"><button type="button" class="btn btn-gold" data-action="export">' +
      ICONS.download +
      ' Export JSON</button><button type="button" class="btn btn-ghost" data-action="pick-import">' +
      ICONS.upload +
      ' Import JSON</button><input id="import-file" class="sr" type="file" accept="application/json,.json">' +
      resetBlock +
      "</div>" +
      (notice ? '<p class="status" role="status">' + esc(notice) + "</p>" : "") +
      "</section></div></aside>" +
      '<div class="stack main"><nav class="jumps" aria-label="Strategy classes">' +
      jumps +
      '</nav><p class="mute" style="font-size:0.92rem">Five rooms, kept apart. Starter notes sit in each one — edit or remove any line. Everything stays in this browser until you export a backup.</p>' +
      sections +
      "</div></div>" +
      '<footer class="foot"><p>Aureum keeps this path locally, with love. S class is the life you are building. D class is the life you refuse.</p><p class="fine">Copyright © 2026 Shrinjoy Ghosh. Released under the MIT License.</p></footer>' +
      (celebrate ? blessing(monthly) : "") +
      "</div>"
    );
  }

  function renderTier(tier) {
    var meta = L.TIER_META[tier];
    var block = data.tiers[tier];
    var items;
    if (!block.strategies.length) {
      items = '<li class="empty">This class is quiet. ' + esc(meta.write) + "</li>";
    } else {
      items = block.strategies
        .map(function (item) {
          return renderStrategy(tier, item);
        })
        .join("");
    }

    var writer;
    if (openTier === tier) {
      writer =
        '<form class="composer" data-action="composer">' +
        '<label><span class="lbl">Title</span><input class="field" data-bind="composer-title" maxlength="140" value="' +
        esc(composer.title) +
        '" placeholder="' +
        esc(meta.write) +
        '"></label>' +
        '<label style="margin-top:0.75rem"><span class="lbl">The strategy</span><textarea class="field tall" data-bind="composer-body" placeholder="Write it plainly. Why this belongs in this class, and what it does to your life.">' +
        esc(composer.body) +
        "</textarea></label>" +
        (composer.error ? '<p class="clay" style="margin-top:0.5rem;font-size:0.92rem">' + esc(composer.error) + "</p>" : "") +
        '<div class="row"><button type="submit" class="btn btn-gold">' +
        ICONS.plus +
        " Save in " +
        esc(meta.name) +
        '</button><button type="button" class="btn btn-ghost" data-action="cancel-composer">Cancel</button></div></form>';
    } else {
      writer =
        '<button type="button" class="btn btn-gold" style="margin-top:1rem" data-action="open-composer" data-tier="' +
        tier +
        '">' +
        ICONS.plus +
        " Write in " +
        esc(meta.name) +
        "</button>";
    }

    return (
      '<section class="card section tier-' +
      tier.toLowerCase() +
      '" id="tier-' +
      tier +
      '"><div class="head"><span class="seal" aria-hidden="true">' +
      tier +
      '</span><div><div class="chips"><h2 class="display" style="font-size:1.6rem">' +
      esc(meta.name) +
      '</h2><span class="chip' +
      (tier === "D" ? " clay" : "") +
      '">' +
      esc(meta.role) +
      '</span><span class="mute nums" style="font-size:0.92rem">' +
      block.strategies.length +
      ' written</span></div><p class="creed">' +
      ICONS[TIER_ICON[tier]] +
      "<span>" +
      esc(meta.creed) +
      "</span></p></div></div>" +
      '<label style="margin-top:1.25rem"><span class="lbl">Class note — yours to edit</span><textarea class="field" data-bind="motto-' +
      tier +
      '">' +
      esc(block.motto) +
      "</textarea></label><ul class=\"list\">" +
      items +
      "</ul>" +
      writer +
      "</section>"
    );
  }

  function renderStrategy(tier, item) {
    if (editingId === item.id) {
      return (
        '<li class="editing"><label><span class="lbl">Title</span><input class="field" data-bind="edit-title" maxlength="140" value="' +
        esc(editDraft.title) +
        '"></label><label style="margin-top:0.75rem"><span class="lbl">The strategy</span><textarea class="field tall" data-bind="edit-body">' +
        esc(editDraft.body) +
        "</textarea></label>" +
        (editDraft.error ? '<p class="clay" style="margin-top:0.5rem;font-size:0.92rem">' + esc(editDraft.error) + "</p>" : "") +
        '<div class="row"><button type="button" class="btn btn-gold" data-action="save-edit" data-tier="' +
        tier +
        '" data-id="' +
        esc(item.id) +
        '">Save edits</button><button type="button" class="btn btn-ghost" data-action="cancel-edit">Cancel</button></div></li>'
      );
    }

    var remove = confirmingId === item.id
      ? '<button type="button" class="btn btn-clay" data-action="remove" data-tier="' +
        tier +
        '" data-id="' +
        esc(item.id) +
        '">' +
        ICONS.trash +
        " Remove from " +
        tier +
        '</button><button type="button" class="btn btn-quiet" data-action="cancel-remove">Keep it</button>'
      : '<button type="button" class="btn btn-quiet" data-action="ask-remove" data-id="' +
        esc(item.id) +
        '">' +
        ICONS.trash +
        " Remove</button>";

    return (
      '<li class="item"><h3>' +
      esc(item.title) +
      "</h3>" +
      (item.body
        ? "<p>" + esc(item.body) + "</p>"
        : '<p class="mute">No detail yet. Edit to write the rest.</p>') +
      '<div class="row"><button type="button" class="btn btn-quiet" data-action="edit" data-tier="' +
      tier +
      '" data-id="' +
      esc(item.id) +
      '">' +
      ICONS.pencil +
      " Edit</button>" +
      remove +
      "</div></li>"
    );
  }

  function blessing(monthly) {
    var name = data.goal.dedication.trim() || "dear one";
    var bits = "";
    for (var i = 0; i < 12; i++) bits += "<i></i>";
    return (
      '<div class="veil" role="dialog" aria-modal="true" aria-labelledby="blessing-title"><button type="button" class="veil-bg" aria-label="Close congratulations" data-action="close-blessing"></button><div class="dialog"><div class="confetti" aria-hidden="true">' +
      bits +
      '</div><div class="dialog-body"><p class="kicker">A blessing for the arrival</p><h2 id="blessing-title">Congratulations, ' +
      esc(name) +
      '.</h2><p class="sum nums">' +
      esc(monthly) +
      ' a month.</p><p class="dim" style="margin-top:1rem">You marked this amount as reached. That is not a small thing. You named a number, you sorted the paths, and you kept the one that grows you instead of the one that spends you.</p><p class="dim" style="margin-top:0.75rem">May this income come home as peace — dividends, distributions, and days that still belong to you. This ledger was kept with love and care. The summit was never the exhaustion. It was the life the capital was meant to protect.</p><div class="row"><button type="button" class="btn btn-gold" data-action="close-blessing">I receive this</button><button type="button" class="btn btn-ghost" data-action="unmark">Not yet — unmark</button></div></div></div></div>'
    );
  }

  function render() {
    var active = document.activeElement;
    var bind = restoreFocus && active && active.dataset ? active.dataset.bind : "";
    var start = bind ? active.selectionStart : null;
    var end = bind ? active.selectionEnd : null;
    var y = window.scrollY;
    document.getElementById("app").innerHTML = view();
    if (bind) {
      var next = document.querySelector('[data-bind="' + CSS.escape(bind) + '"]');
      if (next) {
        next.focus();
        if (typeof start === "number" && next.setSelectionRange) {
          try {
            next.setSelectionRange(start, end);
          } catch (err) {
            /* number inputs on some browsers */
          }
        }
      }
    }
    restoreFocus = false;
    window.scrollTo(0, y);
  }

  function readNumber(raw) {
    var cleaned = String(raw).replace(/,/g, "");
    if (!/^\d*\.?\d*$/.test(cleaned)) return null;
    if (cleaned === "" || cleaned === ".") return 0;
    var next = Number(cleaned);
    if (!Number.isFinite(next) || next < 0) return null;
    return next;
  }

  function onInput(event) {
    var el = event.target;
    var bind = el.dataset ? el.dataset.bind : "";
    if (!bind) return;
    restoreFocus = true;

    if (bind === "monthly" || bind === "yield") {
      var cleaned = String(el.value).replace(/,/g, "");
      if (!/^\d*\.?\d*$/.test(cleaned)) {
        el.value = numberDraft[bind] != null
          ? numberDraft[bind]
          : String(bind === "monthly" ? data.goal.monthlyAmount : data.goal.yieldPercent);
        return;
      }
      var next = readNumber(cleaned);
      if (next == null) return;
      numberDraft[bind] = cleaned;
      touch(function (draft) {
        if (bind === "monthly") draft.goal.monthlyAmount = next;
        else draft.goal.yieldPercent = next;
      });
      render();
      return;
    }

    if (bind === "intent" || bind === "dedication") {
      touch(function (draft) {
        draft.goal[bind] = el.value;
      });
      render();
      return;
    }

    if (bind.indexOf("motto-") === 0) {
      var tier = bind.slice(6);
      touch(function (draft) {
        draft.tiers[tier].motto = el.value;
      });
      render();
      return;
    }

    if (bind === "composer-title") composer.title = el.value;
    if (bind === "composer-body") composer.body = el.value;
    if (bind === "edit-title") editDraft.title = el.value;
    if (bind === "edit-body") editDraft.body = el.value;
    restoreFocus = false;
  }

  function onFocusOut(event) {
    var el = event.target;
    var bind = el.dataset && el.dataset.bind;
    if (bind !== "monthly" && bind !== "yield") return;
    if (restoreFocus) return;
    if (numberDraft[bind] == null) return;
    numberDraft[bind] = null;
    var numeric = bind === "monthly" ? data.goal.monthlyAmount : data.goal.yieldPercent;
    el.value = String(numeric);
  }

  function onChange(event) {
    var el = event.target;
    if (el.dataset && el.dataset.bind === "currency") {
      touch(function (draft) {
        draft.goal.currency = el.value;
      });
      render();
      return;
    }
    if (el.id === "import-file" && el.files && el.files[0]) {
      importFile(el.files[0]);
      el.value = "";
    }
  }

  function onSubmit(event) {
    var form = event.target;
    if (!form || !form.dataset || form.dataset.action !== "composer") return;
    event.preventDefault();
    if (!openTier) return;
    if (!composer.title.trim()) {
      composer.error = "Give the strategy a title.";
      render();
      return;
    }
    var tier = openTier;
    var title = composer.title;
    var body = composer.body;
    touch(function (draft) {
      var now = new Date().toISOString();
      draft.tiers[tier].strategies.unshift({
        id: L.newId(),
        title: title.trim(),
        body: body.trim(),
        createdAt: now,
        updatedAt: now,
      });
    });
    composer = { title: "", body: "", error: "" };
    openTier = null;
    render();
  }

  function onClick(event) {
    var node = event.target.closest("[data-action]");
    if (!node) return;
    var action = node.dataset.action;
    var tier = node.dataset.tier;
    var id = node.dataset.id;

    if (action === "toggle-achieved") {
      var next = !data.goal.achieved;
      touch(function (draft) {
        draft.goal.achieved = next;
        draft.goal.achievedAt = next ? new Date().toISOString() : null;
      });
      celebrate = next;
      render();
      return;
    }
    if (action === "read-blessing") {
      celebrate = true;
      render();
      return;
    }
    if (action === "close-blessing") {
      celebrate = false;
      render();
      return;
    }
    if (action === "unmark") {
      touch(function (draft) {
        draft.goal.achieved = false;
        draft.goal.achievedAt = null;
      });
      celebrate = false;
      render();
      return;
    }
    if (action === "export") {
      exportJson();
      return;
    }
    if (action === "pick-import") {
      var input = document.getElementById("import-file");
      if (input) input.click();
      return;
    }
    if (action === "ask-reset") {
      confirmReset = true;
      render();
      return;
    }
    if (action === "cancel-reset") {
      confirmReset = false;
      render();
      return;
    }
    if (action === "restore") {
      data = L.seedData();
      persist();
      celebrate = false;
      confirmReset = false;
      editingId = null;
      confirmingId = null;
      openTier = null;
      notice = "Starter notes restored.";
      render();
      return;
    }
    if (action === "open-composer") {
      openTier = tier;
      composer = { title: "", body: "", error: "" };
      render();
      var field = document.querySelector('[data-bind="composer-title"]');
      if (field) field.focus();
      return;
    }
    if (action === "cancel-composer") {
      openTier = null;
      composer = { title: "", body: "", error: "" };
      render();
      return;
    }
    if (action === "edit") {
      var found = data.tiers[tier].strategies.find(function (item) {
        return item.id === id;
      });
      if (!found) return;
      editingId = id;
      confirmingId = null;
      editDraft = { title: found.title, body: found.body, error: "" };
      render();
      return;
    }
    if (action === "cancel-edit") {
      editingId = null;
      editDraft = { title: "", body: "", error: "" };
      render();
      return;
    }
    if (action === "save-edit") {
      if (!editDraft.title.trim()) {
        editDraft.error = "A strategy needs a title.";
        render();
        return;
      }
      var title = editDraft.title;
      var body = editDraft.body;
      touch(function (draft) {
        var item = draft.tiers[tier].strategies.find(function (entry) {
          return entry.id === id;
        });
        if (!item) return;
        item.title = title.trim();
        item.body = body.trim();
        item.updatedAt = new Date().toISOString();
      });
      editingId = null;
      render();
      return;
    }
    if (action === "ask-remove") {
      confirmingId = id;
      render();
      return;
    }
    if (action === "cancel-remove") {
      confirmingId = null;
      render();
      return;
    }
    if (action === "remove") {
      touch(function (draft) {
        draft.tiers[tier].strategies = draft.tiers[tier].strategies.filter(function (item) {
          return item.id !== id;
        });
      });
      confirmingId = null;
      editingId = null;
      render();
    }
  }

  function onKey(event) {
    if (event.key === "Escape" && celebrate) {
      celebrate = false;
      render();
    }
  }

  function exportJson() {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "aureum-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotice("Backup downloaded. Keep the file somewhere you trust.");
  }

  function importFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var parsed = L.parseBackup(String(reader.result || ""));
      if (!parsed.ok) {
        setNotice("That file is not an Aureum backup. Nothing was changed.");
        return;
      }
      data = parsed.data;
      persist();
      celebrate = false;
      editingId = null;
      confirmingId = null;
      openTier = null;
      notice = "Backup restored. Your classes are back as you saved them.";
      render();
    };
    reader.onerror = function () {
      setNotice("Could not read that file. Export a fresh backup if you are unsure.");
    };
    reader.readAsText(file);
  }

  function boot() {
    load();
    document.body.addEventListener("click", onClick);
    document.body.addEventListener("input", onInput);
    document.body.addEventListener("change", onChange);
    document.body.addEventListener("focusout", onFocusOut);
    document.body.addEventListener("submit", onSubmit);
    document.addEventListener("keydown", onKey);
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

// iSite status page. No dependencies, same shape as main.js.
//
// The page asks the application for its own health. The upstream providers are
// checked server-side and returned under generic labels, so no provider name or
// address ever reaches the visitor.
//
// If the fetch fails, that is itself the answer: the application is not
// responding. We say so rather than showing a guessed green, because a status
// page that lies is worse than no status page.
(function () {
  "use strict";

  var ENDPOINT = "https://app.isite.srscloud.co.uk/api/status";
  var TIMEOUT_MS = 8000;

  // Design preview only, reached with ?demo=1. Never used for a real visitor,
  // so the live page can never show invented data.
  var DEMO = {
    checkedAt: new Date().toISOString(),
    services: [
      { label: "Application", state: "operational" },
      { label: "Database", state: "operational" },
      { label: "Email delivery", state: "degraded" },
      { label: "Platform hosting", state: "operational" }
    ]
  };

  var STATE_LABEL = {
    operational: "Normal",
    degraded: "Degraded",
    down: "Not working",
    unknown: "Unknown"
  };

  var banner = document.getElementById("status-banner");
  var bannerText = document.getElementById("status-banner-text");
  var list = document.getElementById("status-list");
  var checked = document.getElementById("status-checked");
  if (!banner || !list) return;

  function isDemo() {
    return window.location.search.indexOf("demo=1") !== -1;
  }

  function setBanner(cls, text) {
    banner.className = "status-banner " + cls;
    bannerText.textContent = text;
  }

  // Built as DOM nodes rather than markup, so a label can never be treated as
  // HTML even if the endpoint returns something unexpected.
  function row(label, state) {
    var known = Object.prototype.hasOwnProperty.call(STATE_LABEL, state) ? state : "unknown";
    var li = document.createElement("li");
    li.className = "status-row is-" + known;

    var dot = document.createElement("span");
    dot.className = "status-dot";
    dot.setAttribute("aria-hidden", "true");

    var name = document.createElement("span");
    name.className = "status-name";
    name.textContent = label;

    var value = document.createElement("span");
    value.className = "status-state";
    value.textContent = STATE_LABEL[known];

    li.appendChild(dot);
    li.appendChild(name);
    li.appendChild(value);
    return li;
  }

  function render(data, note) {
    var services = (data && data.services) || [];
    list.textContent = "";
    services.forEach(function (s) {
      list.appendChild(row(String(s.label || "Unknown"), String(s.state || "unknown")));
    });

    var states = services.map(function (s) { return s.state; });
    if (states.indexOf("down") !== -1) {
      setBanner("is-down", "There is a problem affecting iSite");
    } else if (states.indexOf("degraded") !== -1) {
      setBanner("is-warn", "Some parts of iSite are degraded");
    } else if (states.length && states.every(function (s) { return s === "operational"; })) {
      setBanner("is-ok", "All systems normal");
    } else {
      setBanner("is-unknown", "We could not check every service");
    }

    if (checked) {
      var when = data && data.checkedAt ? new Date(data.checkedAt) : null;
      checked.textContent = note
        ? note
        : when && !isNaN(when.getTime())
          ? "Last checked " + when.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
          : "";
    }
  }

  function unreachable() {
    list.textContent = "";
    list.appendChild(row("Application", "down"));
    list.appendChild(row("Database", "unknown"));
    list.appendChild(row("Email delivery", "unknown"));
    list.appendChild(row("Platform hosting", "unknown"));
    setBanner("is-down", "We cannot reach iSite right now");
    if (checked) {
      checked.textContent =
        "This page could not get a reply from the platform. That usually means iSite itself is " +
        "unavailable, though it can also be your own connection. Checked " +
        new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) + ".";
    }
  }

  if (isDemo()) {
    render(DEMO, "Preview with sample data. This is not the live state of the platform.");
    banner.insertAdjacentElement("beforebegin", (function () {
      var p = document.createElement("p");
      p.className = "status-demo";
      p.textContent = "Design preview: sample data, not a real check.";
      return p;
    })());
    return;
  }

  // AbortController so a hanging request still resolves to an honest answer
  // rather than leaving the page on "Checking" forever.
  var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  var timer = window.setTimeout(function () { if (controller) controller.abort(); }, TIMEOUT_MS);

  fetch(ENDPOINT, {
    method: "GET",
    cache: "no-store",
    signal: controller ? controller.signal : undefined
  })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      window.clearTimeout(timer);
      if (!data || !Array.isArray(data.services)) throw new Error("unexpected shape");
      render(data);
    })
    .catch(function () {
      window.clearTimeout(timer);
      unreachable();
    });
})();

/* Firsthand embed. One script, one div, no iframe, no tracking beyond a daily view count. */
(function () {
  var script = document.currentScript;
  var base = "";
  try {
    base = new URL((script && script.src) || location.href).origin;
  } catch {}

  function rotate(root) {
    var box = root.querySelector("[data-fh-rotate]");
    if (!box || box.children.length < 2) return;
    var items = box.children;
    var i = 0;
    setInterval(function () {
      items[i].hidden = true;
      i = (i + 1) % items.length;
      items[i].hidden = false;
    }, 6000);
  }

  function mount(el) {
    if (el.__fh) return;
    el.__fh = 1;
    var id = el.getAttribute("data-firsthand");
    if (!id) return;
    var q = [];
    ["theme", "accent", "radius"].forEach(function (k) {
      var v = el.getAttribute("data-" + k);
      if (v) q.push(k + "=" + encodeURIComponent(v));
    });
    var url = base + "/api/widget/" + encodeURIComponent(id) + (q.length ? "?" + q.join("&") : "");
    fetch(url, { credentials: "omit" })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (html) {
        el.innerHTML = html;
        rotate(el);
        var view = base + "/api/widget/" + encodeURIComponent(id) + "/view";
        if (navigator.sendBeacon) navigator.sendBeacon(view);
        else fetch(view, { method: "POST", keepalive: true, credentials: "omit" }).catch(function () {});
      })
      .catch(function () {
        // Leave the host page as it was. Collapse the reserved space.
        el.style.minHeight = "0";
      });
  }

  function render() {
    var els = document.querySelectorAll("[data-firsthand]");
    for (var i = 0; i < els.length; i++) mount(els[i]);
  }

  window.Firsthand = { render: render };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();

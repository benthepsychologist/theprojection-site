/* The Projection — "Listen" button for the briefing.
   No backend, no generated audio file: reads the on-page briefing text
   aloud via the browser's own window.speechSynthesis. Self-wires onto any
   element with [data-listen-target] that points (by #id) at the text to
   read — currently just the front/beat-page briefing (briefing.html).

   Chunking: a single long SpeechSynthesisUtterance is unreliable past
   roughly 200-250 characters (multiple browsers cut it off mid-sentence),
   so the target text is split into sentence-length pieces and queued —
   speechSynthesis plays a queue in order on its own, no manual chaining
   needed once each piece is short enough. */
(function () {
  "use strict";

  if (!("speechSynthesis" in window)) return; // no silent button that does nothing

  function extractText(root) {
    // Plain-text pass — speechSynthesis doesn't care about markup, so this
    // is deliberately simpler than copy-chat.js's markdown-preserving walk.
    // Skip the button itself and anything explicitly marked decorative.
    var clone = root.cloneNode(true);
    clone.querySelectorAll(".listen-btn, [aria-hidden='true']").forEach(function (n) {
      n.remove();
    });
    var text = clone.textContent || "";
    return text.replace(/\s+/g, " ").trim();
  }

  function chunkText(text) {
    // Split on sentence boundaries; merge short sentences up to ~200 chars
    // per chunk so we're not making one utterance per clause, but never
    // cross the length where browsers have been observed truncating.
    var sentences = text.match(/[^.!?]+[.!?]+(\s+|$)/g) || [text];
    var chunks = [];
    var current = "";
    sentences.forEach(function (s) {
      if ((current + s).length > 200 && current) {
        chunks.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    });
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  function init(btn) {
    var targetSel = btn.getAttribute("data-listen-target");
    var target = targetSel && document.querySelector(targetSel);
    if (!target) { btn.remove(); return; }

    var labelSpan = btn.querySelector(".listen-label");
    var state = "idle"; // idle | playing | paused

    function setState(next) {
      state = next;
      var label = { idle: "🔊 Listen to this briefing", playing: "⏸ Pause", paused: "▶ Resume" }[state];
      if (labelSpan) labelSpan.textContent = label; else btn.textContent = label;
      btn.setAttribute("aria-pressed", state !== "idle" ? "true" : "false");
    }

    function stop() {
      speechSynthesis.cancel();
      setState("idle");
    }

    // Reset if the page is left mid-playback — speechSynthesis is
    // per-tab-global and a stray queued utterance on the wrong page reads
    // as a bug, not a feature.
    window.addEventListener("pagehide", function () { speechSynthesis.cancel(); });

    btn.addEventListener("click", function () {
      if (state === "idle") {
        var chunks = chunkText(extractText(target));
        if (!chunks.length) return;
        speechSynthesis.cancel(); // clear anything stray from a prior click
        chunks.forEach(function (chunk, i) {
          var utter = new SpeechSynthesisUtterance(chunk);
          if (i === chunks.length - 1) {
            utter.onend = function () { setState("idle"); };
            utter.onerror = function () { setState("idle"); };
          }
          speechSynthesis.speak(utter);
        });
        setState("playing");
      } else if (state === "playing") {
        speechSynthesis.pause();
        setState("paused");
      } else if (state === "paused") {
        speechSynthesis.resume();
        setState("playing");
      }
    });

    setState("idle");
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".listen-btn[data-listen-target]").forEach(init);
  });
})();

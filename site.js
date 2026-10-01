// PMR Field App legal pages — small progressive-enhancement helpers.
// No tracking, no third-party calls: this file only touches the current page.
(function () {
  "use strict";

  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function initCopyButtons() {
    var buttons = document.querySelectorAll("[data-copy-email]");
    buttons.forEach(function (btn) {
      var email = btn.getAttribute("data-copy-email");
      btn.addEventListener("click", function () {
        var done = function () {
          var original = btn.textContent;
          btn.textContent = "Copied!";
          btn.disabled = true;
          setTimeout(function () {
            btn.textContent = original;
            btn.disabled = false;
          }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(done, function () {
            window.location.href = "mailto:" + email;
          });
        } else {
          window.location.href = "mailto:" + email;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setYear();
    initCopyButtons();
  });
})();

(() => {
  // Runs only on youtube.com (see manifest matches).
  // Focus mode is active only when ALL of these hold:
  //   1. user enabled it via popup (chrome.storage.local.enabled)
  //   2. current page is a watch page (/watch) with a <video> present
  //   3. browser is not in native fullscreen (let native fullscreen win)
  //
  // v2: no backdrop overlay. v1's top-level black div painted above the
  // player because YouTube ancestors create stacking contexts (hence the
  // all-black screen). Now we just toggle classes; focus.css hides
  // everything via visibility except the .yt-focus-player branch.

  let enabled = false;

  const PLAYER_SELECTORS = ["#movie_player", ".html5-video-player", "ytd-player"];
  const VIDEO_SELECTOR = "video.html5-main-video, #movie_player video, video";

  function isWatchPage() {
    // Strictly /watch so homepage / search / channel / shorts do nothing.
    return window.location.pathname === "/watch";
  }

  function getVideo() {
    return document.querySelector(VIDEO_SELECTOR);
  }

  function getPlayers() {
    return document.querySelectorAll(PLAYER_SELECTORS.join(", "));
  }

  function hasSelectedVideo() {
    // "one video is selected" = watch page AND a video element exists.
    // Works for playing AND paused (readyState/currentSrc checks would
    // wrongly exclude paused/buffering videos, so just require the node).
    if (!isWatchPage()) return false;
    return !!getVideo();
  }

  function inNativeFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement
    );
  }

  function shouldApply() {
    return enabled && hasSelectedVideo() && !inNativeFullscreen();
  }

  function removeLegacyBackdrop() {
    // Cleanup for v1 installs that left #yt-focus-backdrop in the DOM.
    const old = document.getElementById("yt-focus-backdrop");
    if (old) old.remove();
  }

  function apply() {
    const on = shouldApply();
    removeLegacyBackdrop();
    document.documentElement.classList.toggle("yt-focus-on", on);
    getPlayers().forEach((p) => p.classList.toggle("yt-focus-player", on));
    return on;
  }

  // Re-check after DOM churn (YouTube is an SPA: the <video> node is
  // created/destroyed on navigation without a full page load).
  let rafQueued = false;
  function scheduleApply() {
    if (rafQueued) return;
    rafQueued = true;
    requestAnimationFrame(() => {
      rafQueued = false;
      try {
        apply();
      } catch (e) {
        // Never break the host page.
        console.warn("[YT Focus]", e);
      }
    });
  }

  // Initial state from storage.
  chrome.storage.local.get({ enabled: false }, (res) => {
    enabled = !!res.enabled;
    scheduleApply();
  });

  // React to popup toggles (fires in every YouTube tab).
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.enabled) {
      enabled = !!changes.enabled.newValue;
      scheduleApply();
    }
  });

  // Popup also sends an explicit message so the active tab updates
  // instantly even if storage sync lags.
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === "YT_FOCUS_SET") {
      enabled = !!msg.enabled;
      scheduleApply();
    }
  });

  // SPA navigation hooks.
  window.addEventListener("yt-navigate-finish", scheduleApply, true);
  window.addEventListener("yt-page-data-updated", scheduleApply, true);
  window.addEventListener("popstate", scheduleApply);
  document.addEventListener("fullscreenchange", scheduleApply);
  document.addEventListener("webkitfullscreenchange", scheduleApply);

  // Watch for player swaps / late video creation.
  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Re-apply on resize so centering stays exact.
  window.addEventListener("resize", scheduleApply);

  // First paint + a couple of delayed retries for slow player boot.
  scheduleApply();
  setTimeout(scheduleApply, 1000);
  setTimeout(scheduleApply, 3000);
})();

const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

function setStatus(enabled, isYouTubeVideo) {
  if (!isYouTubeVideo) {
    status.textContent = "Open a YouTube video to preview it.";
    status.classList.remove("on");
    return;
  }
  status.textContent = enabled ? "Focus mode is ON." : "Focus mode is OFF.";
  status.classList.toggle("on", enabled);
}

async function init() {
  const { enabled = false } = await chrome.storage.local.get({ enabled: false });
  toggle.checked = !!enabled;

  let isYouTubeVideo = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url || "";
    // Toggle state is global; this only affects the hint text.
    // Content script no-ops on non-/watch pages by itself.
    isYouTubeVideo =
      /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/watch|youtu\.be\/)/.test(url) ||
      (url.includes("youtube.com") && url.includes("watch"));
  } catch (e) {
    // If we can't read the tab, leave the toggle usable.
  }

  setStatus(toggle.checked, isYouTubeVideo);

  toggle.addEventListener("change", async () => {
    const on = toggle.checked;
    await chrome.storage.local.set({ enabled: on });
    setStatus(on, isYouTubeVideo);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: "YT_FOCUS_SET", enabled: on });
    } catch (e) {
      // Content script may not be injected yet (e.g. fresh install);
      // storage.onChanged covers it on next load.
    }
  });
}

init();

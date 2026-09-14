# YouTube Focus — Distraction-Free Video Mode (Chrome & Brave Extension)

A lightweight, privacy-friendly Chrome extension (Manifest V3, also works in Brave) that turns any YouTube watch page into a **distraction-free focus mode**: the entire site fades to black except the video that's playing.

Perfect for studying, deep work, movie nights, and anyone who wants **YouTube without recommendations, comments, or clutter**.

## Features

- **Video-only blackout mode** — hides homepage UI, sidebar, suggestions, comments, and channel clutter; only the video and its player controls stay visible
- **One-click toggle** — turn focus mode on/off from the toolbar popup; your choice persists across tabs
- **Watch pages only** — automatically does nothing on the homepage, search results, channels, and Shorts
- **Smart scaling** — the video is centered and scaled up until the first screen edge, always preserving aspect ratio (never stretched or cropped)
- **Works paused or playing** — activates whenever a video is selected, not just while it's playing
- **Respects native fullscreen** — pressing `F` or the fullscreen button hands control back to YouTube
- **No tracking, no accounts** — everything runs locally in your browser; no data leaves your device

## Installation (Load Unpacked)

The extension lives in the [`youtube-focus/`](./youtube-focus/) folder.

**Chrome:**

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right corner)
3. Click **Load unpacked** and select the `youtube-focus` folder
4. Pin the extension to your toolbar for quick access

**Brave:**

1. Open `brave://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `youtube-focus` folder

## How to Use

1. Open any YouTube video (`youtube.com/watch?...`)
2. Click the **YouTube Focus** icon in your toolbar
3. Flip **Focus mode** ON — everything except the video fades to black
4. Flip it OFF to restore the normal YouTube layout instantly

## How It Works

- A content script (`content.js`) runs only on `youtube.com` and activates solely on `/watch` pages with a `<video>` element present
- `focus.css` hides all page content via `visibility` (so the player branch stays rendered) and pins the player centered at full viewport size with `object-fit: contain`
- Toggle state is stored in `chrome.storage.local`; YouTube's single-page-app navigation is handled via `yt-navigate-finish` listeners and a `MutationObserver`
- On exit, the extension forces a reflow plus synthetic `resize` events so YouTube recomputes the player layout and the video snaps back to its exact original position

## Privacy

This extension requests only `storage` (to remember your toggle) and `activeTab` (to apply the toggle to the current YouTube tab). It collects, stores, and transmits nothing.

## FAQ

**Does it work on YouTube Shorts, the homepage, or search?**
No — by design it only affects `/watch` video pages and leaves everything else untouched.

**Does it crop or stretch the video?**
Neither. The video scales with aspect ratio intact until the first edge (width or height) hits the window — pure letterboxing, like a cinema screen.

**How do I exit focus mode?**
Click the toolbar icon and toggle it OFF. (ESC won't exit it, since it's not real browser fullscreen.)

## Project Structure

```text
youtube-focus/
├── manifest.json   # MV3 manifest, scoped to youtube.com
├── content.js      # Watch-page detection, toggle logic, layout restore
├── focus.css       # Blackout + centered full-viewport player styles
├── popup.html      # Toolbar toggle UI
└── popup.js        # Persists toggle, notifies the active tab
```

## Keywords

youtube focus mode, distraction free youtube, youtube blackout extension, youtube cinema mode, study with youtube, adhd focus tool, minimal youtube, hide youtube recommendations, hide youtube comments, brave youtube extension, chrome manifest v3 extension

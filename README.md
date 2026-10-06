# Tab Organiser

A Chrome extension that helps you tame a huge number of open tabs.

It looks at your open tabs and **suggests** what to do with each one. It never acts without a click.

## What it does

| Goal | How |
|---|---|
| **Close stale tabs** | Flags tabs you haven't looked at for a while (uses Chrome's `lastAccessed` time) |
| **Merge duplicates** | Finds same-URL and near-duplicate tabs |
| **Group related tabs** | Suggests named groups, then creates real Chrome tab groups when you accept |
| **Park tabs for later** | Saves tabs to a "check later" list that survives restarts |
| **Send them elsewhere** | Exports the list as Markdown or JSON, copies it, or saves it to a "Read later" bookmark folder |

### Privacy: on-device AI only

Grouping, merging and read-later hints use Chrome's built-in AI (Gemini Nano, via the Prompt API). It runs on your machine. Your tab titles and URLs are never sent to a third-party AI.

If Gemini Nano isn't available, the popup shows a setup message with the model download state. Age and exact-duplicate checks work without it.

### Safety rules

- Nothing is closed, grouped or merged until you click.
- Pinned tabs and tabs playing audio are never suggested for closing.
- The last close can be undone.

## Status

Early development. Work is tracked as local markdown tickets.

| Ticket | Feature | State |
|---|---|---|
| 01 | Tab list popup with "last accessed" age, plus test runner | Built (manual Chrome check pending) |
| 02 | Stale and duplicate suggestions | Built (manual Chrome check pending) |
| 03 | Read-later list (stored) | Not started |
| 04 | Export Markdown, JSON, clipboard | Not started |
| 05 | Save list to bookmarks | Not started |
| 06 | Gemini Nano check and setup message | Not started |
| 07 | AI group suggestions | Not started |
| 08 | AI merge and read-later hints | Not started |
| 09 | Bulk close and undo | Not started |
| 10 | Configurable age threshold | Not started |

- **Spec:** `.scratch/tab-organiser/spec.md`
- **Tickets:** `.scratch/tab-organiser/issues/` (tick the `- [ ]` boxes as work lands)

## Development

Built with [WXT](https://wxt.dev), React 19 and TypeScript. Uses [Bun](https://bun.sh) as the package manager.

### Setup

```bash
bun install
```

`postinstall` runs `wxt prepare`, which generates the `.wxt/` types.

### Run in dev mode

```bash
bun run dev
```

WXT opens a Chrome window with the extension loaded and reloads it when you save files. Click the extension icon to open the popup.

### Load the extension by hand

Use this to try a build in your normal Chrome profile.

1. `bun run build`
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and pick `.output/chrome-mv3`.

### Test and typecheck

```bash
bun run test      # Vitest, runs once
bun run compile   # TypeScript check, no output files
```

Tests cover pure logic (for example `utils/tab-age.ts`). The popup and the Chrome API wrappers are checked by hand in a real browser.

### Build for production

```bash
bun run build     # unpacked extension in .output/chrome-mv3
bun run zip       # store-ready zip in .output/
```

Upload the zip to the [Chrome Web Store developer dashboard](https://chrome.google.com/webstore/devconsole).

Firefox builds exist as `build:firefox`, `dev:firefox` and `zip:firefox`. They are not a target yet, because the AI features rely on Chrome's Prompt API.

### Scripts

| Script | What it does |
|---|---|
| `dev` | Dev server with hot reload, opens Chrome |
| `build` | Production build to `.output/chrome-mv3` |
| `zip` | Production build plus a zip for the store |
| `test` | Run Vitest once |
| `compile` | `tsc --noEmit` |

### Project layout

| Path | Purpose |
|---|---|
| `entrypoints/popup/` | React popup UI |
| `entrypoints/background.ts` | Background service worker |
| `entrypoints/content.ts` | Content script |
| `utils/` | Pure logic and its tests |
| `wxt.config.ts` | WXT config and manifest permissions |
| `.scratch/tab-organiser/` | Spec and tickets |

### Permissions

| Permission | Why | When |
|---|---|---|
| `tabs` | Read tab titles, URLs and last-accessed time | Now |
| `tabGroups` | Create Chrome tab groups | Ticket 07 |
| `storage` | Keep the read-later list and settings | Tickets 03, 10 |
| `bookmarks` | Save the list to a "Read later" folder | Ticket 05 |

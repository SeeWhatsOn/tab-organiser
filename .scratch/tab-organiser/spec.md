# Spec: Tab Organiser

**Status:** ready-for-agent

## Problem Statement

I keep so many tabs open that Chrome slows down. Some tabs are stale and should be closed. Some are duplicates or near-duplicates that should be merged. Some belong together and should be grouped. Others are things I want to read later and need to park somewhere safe, then pick up again or send elsewhere. Sorting this by hand is slow, and I don't want my tab data sent to a third-party AI.

## Solution

A Chrome extension that looks at my open tabs and **suggests** what to do with each: close, group, merge, or save for later. The AI is Chrome's built-in Gemini Nano (Prompt API), running on-device. Nothing happens until I click. Saved "read later" tabs are kept in extension storage so they survive restarts, can be written to a "Read later" bookmark folder, and can be exported as Markdown or JSON.

## User Stories

1. As a tab hoarder, I want to open the popup and see all my open tabs listed, so that I know what I'm dealing with
2. As a tab hoarder, I want each tab to show how long since I last looked at it, so that I can judge what is stale
3. As a tab hoarder, I want tabs untouched for a long time flagged as "suggest close", so that I can free memory fast
4. As a tab hoarder, I want to set the age threshold for "stale", so that it fits how I work
5. As a tab hoarder, I want duplicate tabs (same URL) detected, so that I can close the extras
6. As a tab hoarder, I want near-duplicate tabs (same page, different URL params) suggested for merging, so that I keep one
7. As a tab hoarder, I want the AI to suggest groups of related tabs with a name for each, so that I can organise by topic
8. As a tab hoarder, I want to accept or reject each group suggestion, so that I stay in control
9. As a tab hoarder, I want accepted groups created as real Chrome tab groups, so that they appear in my tab strip
10. As a tab hoarder, I want the AI to point out tabs that look like "read later" research, so that I can park them
11. As a tab hoarder, I want to save a tab to the "check later" list in one click, so that I can close it without losing it
12. As a tab hoarder, I want the "check later" list stored in the extension, so that it is still there after I restart Chrome
13. As a tab hoarder, I want to reopen a saved item, so that I can read it when I have time
14. As a tab hoarder, I want to remove an item from the list, so that it doesn't grow forever
15. As a tab hoarder, I want to save the list into a "Read later" bookmark folder, so that I can use it in Chrome's own bookmarks
16. As a tab hoarder, I want to export the list as Markdown, so that I can paste it into notes
17. As a tab hoarder, I want to export the list as JSON, so that I can import it elsewhere
18. As a tab hoarder, I want to copy the list to my clipboard, so that I can share it fast
19. As a tab hoarder, I want exporters to be easy to add later, so that Todoist or Notion can be added without a rewrite
20. As a tab hoarder, I want nothing closed, grouped, or merged until I click, so that I never lose unsaved work
21. As a tab hoarder, I want pinned tabs and tabs playing audio left out of close suggestions, so that important tabs are safe
22. As a tab hoarder, I want a bulk "close all suggested" with a confirm step, so that cleanup is quick but deliberate
23. As a tab hoarder, I want an undo for the last close, so that I can recover a mistake
24. As a privacy-minded user, I want AI to run on-device only, so that my tab titles and URLs never leave my machine
25. As a user without Gemini Nano, I want a clear setup message explaining how to enable it, so that I know what to do
26. As a user, I want the setup message to show the model download state, so that I know if it's still downloading
27. As a user, I want suggestions to explain why, so that I can trust them
28. As a user, I want the popup to stay responsive with hundreds of tabs, so that it is usable at my worst

## Implementation Decisions

- **Suggest only.** No action runs without a user click.
- **Age = `lastAccessed`** from the Chrome tabs API. Default threshold is configurable.
- **AI = Chrome Prompt API (Gemini Nano), on-device only.** No third-party AI calls. If unavailable, show a **setup message** with model status. There is **no rule-based fallback** for AI features.
- **Non-AI rules still work without the model:** age flagging and exact-duplicate detection need no AI. Grouping, near-duplicate merging, and read-later detection need the AI.
- **`TabAdvisor` module:** takes tab snapshots, the current time, and an `ai` function. Returns a list of suggestions (close, group, merge, read-later) each with a reason.
- **`ReadLaterList` module:** add, remove, list, and export. Persisted in `chrome.storage.local`.
- **Exporters are pluggable:** Markdown, JSON, clipboard, and bookmarks now. Other services later via the same interface.
- **Bookmarks:** write the list into a "Read later" folder using `chrome.bookmarks`.
- **Safety rules:** skip pinned tabs and tabs playing audio for close suggestions. Keep an undo for the last close.
- **Thin Chrome wrapper:** reads real tabs, calls the Prompt API, applies accepted suggestions. It holds no decision logic.
- **UI:** extension popup (React, WXT).
- **Permissions needed:** `tabs`, `tabGroups`, `storage`, `bookmarks`.

## Testing Decisions

- A good test checks **external behaviour only**: given tabs and a fake AI, what suggestions come out. It never checks internals.
- **Seam 1: `TabAdvisor`.** Tested with a fake `ai` function and fixed timestamps.
- **Seam 2: `ReadLaterList`.** Tested with a fake store. Covers add, remove, list, and each export output.
- The Chrome wrapper and popup are verified by hand in a real browser, not unit tested.
- **Prior art:** none yet. This repo is a fresh WXT starter with no tests. A test runner must be chosen and set up.

## Out of Scope

- Exporting to Todoist, Notion, or other services (later, via the exporter interface)
- Any cloud or third-party AI
- Automatic closing, grouping, or merging
- Cross-device sync
- Firefox support

## Further Notes

- The Prompt API is still evolving. Confirm the current API shape and Chrome version requirements before building.
- Gemini Nano needs a one-time model download and capable hardware.

@AGENTS.md

# Tab Organiser

Chrome extension (Manifest V3) that suggests which tabs to close, group, merge or save for later. AI is Chrome's built-in Gemini Nano (Prompt API), on-device only. No third-party AI calls.

- **Spec:** GitHub issue #1. Tickets are its sub-issues (#2 to #11), with native blocked-by links.
- **Work from GitHub issues.** Tick the acceptance boxes in the issue as work lands. Close an issue only once every box is ticked.
- **README:** keep the ticket status table in `README.md` current.

## Stack and commands

WXT + React 19 + TypeScript. Use `bun`, not `npm`, `yarn` or `pnpm`.

```bash
bun run dev       # dev server, opens Chrome
bun run test      # Vitest, runs once
bun run compile   # tsc --noEmit
bun run build     # production build to .output/chrome-mv3
```

Run `bun run compile` and `bun run test` before every commit.

## Conventions

- **Suggest only.** Nothing closes, groups or merges without a user click.
- **Never suggest closing** pinned tabs or tabs playing audio.
- **Logic is pure and lives in `utils/`.** It takes plain data in and returns plain data out. No `browser.*` calls there.
- **Chrome calls stay thin** in `entrypoints/`. They read tabs, call the Prompt API, and apply accepted suggestions. No decision logic.
- **Test at the seams only:** `TabAdvisor` (`utils/tab-advisor.ts`) and `ReadLaterList`. Use fixed timestamps and a fake `ai` function. The popup is checked by hand.
- **TDD:** write the failing test first, then the minimum code to pass it.
- **Add permissions only when a ticket needs them** (`tabGroups`, `storage`, `bookmarks`).
- **No Claude or Claude Code attribution** in commits or PRs. This is set in `.claude/settings.json`.

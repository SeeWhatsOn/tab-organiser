# 08: AI near-duplicate merge and read-later hints

**What to build:** The AI suggests merging near-duplicate tabs (same page, different params) and flags tabs that look like read-later research, each with a reason. Accepting a read-later hint saves it to the list.

**Blocked by:** 02, 03, 06

**Status:** ready-for-agent

- [ ] TabAdvisor returns merge and read-later suggestions via the ai function
- [ ] Accepting a merge closes the extras and keeps one
- [ ] Accepting a read-later hint adds it to ReadLaterList
- [ ] Each suggestion carries a reason
- [ ] Tests use a fake ai function

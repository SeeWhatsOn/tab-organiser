# 02: Stale and duplicate suggestions

**What to build:** TabAdvisor suggests closing stale tabs and extra copies of same-URL tabs, with a reason each. I click to close. Pinned and audible tabs are never suggested.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] TabAdvisor returns close suggestions for tabs older than the threshold
- [ ] Same-URL duplicates suggest closing the extras and keeping one
- [ ] Pinned and audible tabs are never suggested for close
- [ ] Each suggestion carries a reason
- [ ] Tests cover these using fixed timestamps (no AI)
- [ ] Popup shows suggestions; clicking closes that tab

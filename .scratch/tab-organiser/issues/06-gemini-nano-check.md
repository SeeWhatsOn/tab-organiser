# 06: Gemini Nano check and setup message

**What to build:** The popup detects whether Chrome's built-in AI is ready. If not, it shows a clear setup message with the model download state. Non-AI features keep working.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] A wrapper that reports the Prompt API status: unavailable, downloadable, downloading, ready
- [ ] Popup shows a setup message with the right state when not ready
- [ ] Non-AI features (tickets 02, 03) still work when AI is unavailable
- [ ] Exposes an ai function the advisor can call; tests swap in a fake
- [ ] No network calls to any third-party AI

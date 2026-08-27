---
name: Linux hosting
description: Non-obvious hosting constraints for running QIPOS outside Replit.
---

QIPOS is designed to run as a static SPA plus a separate Express API backed by PostgreSQL. The simplest production topology serves the SPA and proxies `/api` through the same domain.

**Why:** Browser sessions, SPA refreshes, and API calls otherwise fail when the frontend and API are placed on different origins or when a reverse proxy hides HTTPS from Express.

**How to apply:** Keep `X-Forwarded-Proto` enabled in the proxy, keep Express proxy trust enabled, configure `VITE_API_BASE_URL` and `CORS_ORIGIN` when using separate domains, and use the PostgreSQL session store for production.
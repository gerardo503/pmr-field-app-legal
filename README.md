# PMR Field App — Legal pages

Static public pages (Privacy Policy, Terms of Use, Support, Account Deletion) required
by Google Play and the App Store for the **PMR Field App** mobile app
(`com.pmrroofing.fieldapp`, repo [`pmr-field-app`](https://github.com/gerardo503/pmr-field-app)).

Deployed separately from the app repo so these pages can be edited and published
without a mobile build. No backend, no login, no build step — plain HTML/CSS/JS.

## Part of the PMR Field App family of repos

PMR Roofing's internal tooling is split across a few repos — kept separate so this one
can be the single **public** piece without pulling app code or secrets into it:

| Repo | What it is | Public? |
|---|---|---|
| `pmr-connect` | PMR Connect: PMR's operations platform (API + web app at `connect.pmrroofing.com`), used by office/admin staff | No — internal |
| [`pmr-field-app`](https://github.com/gerardo503/pmr-field-app) | PMR Field App, the mobile client for field crews/technicians | No — internal |
| **`pmr-field-app-legal`** (this repo) | Public legal pages for PMR Field App | **Yes** |

## Pages
- `index.html` — links to all pages
- `privacy.html` — Privacy Policy
- `terms.html` — Terms of Use
- `support.html` — Support & contact
- `delete-account.html` — Account/data deletion request process

## Before publishing for real
- Contact email set to `dev@pmrroofing.com` (2026-10-01).
- Confirm data retention periods and what the backend (`pmr-connect`) can actually delete.
- Point a subdomain (e.g. `legal.pmrroofing.com` or `privacy.pmrroofing.com` — requested from Vitas, response pending) at this repo's deployment.

## Deploy
Live now on GitHub Pages: https://gerardo503.github.io/pmr-field-app-legal/

This is a temporary URL while we wait for a PMR subdomain (requested from Vitas,
e.g. `legal.pmrroofing.com`). Once that subdomain exists, add a `CNAME` file here
and point its DNS (CNAME record) at `gerardo503.github.io`, then update the URLs
in the Play Console / App Store Connect listings and inside the app.

Any other static host also works as-is (Netlify, Cloudflare Pages) if preferred.

## Files
- `site.js` — small vanilla JS: fills in the footer year, and a "Copy" button next
  to the contact email on Support and Delete account. No tracking, no third-party
  calls.

## Security

Applied now (works on any static host, including GitHub Pages):
- Strict `Content-Security-Policy` and `Referrer-Policy` meta tags on every page —
  only this origin, Google Fonts, and the PMR logo CDN are allowed; no inline
  scripts/styles (all CSS lives in `style.css`, no `style="..."` attributes), no
  third-party connections.
- HTTPS enforced (GitHub Pages does this automatically for `*.github.io` and for a
  custom domain once one is attached).
- No forms, no cookies, no analytics, no user input stored anywhere.

**Known gap while hosted on GitHub Pages:** it does not support custom HTTP response
headers, so `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`
and a header-level CSP can't be set yet — only what a `<meta>` tag can express. The
`_headers` file in this repo (Netlify/Cloudflare Pages format) already has the full
set ready to go the moment this moves to a host that supports it, or behind a reverse
proxy. Re-apply it (or an equivalent nginx/CDN config) once the real production
subdomain and host are decided.

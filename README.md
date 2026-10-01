# PMR Field App — Legal pages

Static public pages (Privacy Policy, Terms of Use, Support, Account Deletion) required
by Google Play and the App Store for the **PMR Field App** mobile app
(`com.pmrroofing.fieldapp`, repo `pmr-field-app`).

Deployed separately from the app repo so these pages can be edited and published
without a mobile build. No backend, no login, no build step — plain HTML/CSS.

## Pages
- `index.html` — links to all pages
- `privacy.html` — Privacy Policy
- `terms.html` — Terms of Use
- `support.html` — Support & contact
- `delete-account.html` — Account/data deletion request process

## Before publishing for real
- Replace `REPLACE-WITH-PMR-EMAIL` in `privacy.html`, `terms.html`, `support.html`, `delete-account.html`.
- Confirm data retention periods and what the backend (`pmr-connect`) can actually delete.
- Point a subdomain (e.g. `legal.pmrroofing.com` or `privacy.pmrroofing.com` — pending Vitas) at this repo's deployment.

## Deploy
Any static host works (GitHub Pages, Netlify, Cloudflare Pages). For GitHub Pages:
Settings → Pages → Deploy from branch `main` / root.

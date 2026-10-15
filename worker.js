/**
 * PMR Roofing — legal & privacy site (Cloudflare Worker, single file).
 *
 * Paste this whole file into a Cloudflare Worker ("Edit code"), deploy, and attach it
 * to your domain (e.g. pmrroofing.ai). No build step, no dependencies, no storage.
 *
 * What it serves (all from this one file):
 *   /                 full page: about + privacy + terms + support + account deletion
 *   /privacy          same page, scrolled to the Privacy Policy
 *   /terms            same page, scrolled to the Terms of Use
 *   /support          same page, scrolled to Support & Contact
 *   /delete-account   same page, scrolled to Account & Data Deletion
 *   /robots.txt, /.well-known/security.txt
 *
 * Use these URLs in the stores:
 *   Google Play  -> Privacy policy: https://<your-domain>/privacy
 *                   Account deletion URL: https://<your-domain>/delete-account
 *   App Store    -> Privacy Policy URL: https://<your-domain>/privacy
 *                   Support URL: https://<your-domain>/support
 *
 * Unlike GitHub Pages, a Worker sends REAL HTTP security headers (CSP, HSTS,
 * X-Frame-Options, nosniff, Permissions-Policy), set in securityHeaders() below.
 *
 * Everything you may need to edit is in CONFIG. Do not edit the legal text without
 * having it reviewed — it is written to match what the apps and the PMR Connect
 * backend actually do (see the "Facts this text relies on" note at the bottom).
 */

const CONFIG = {
  companyLegal: 'Paragon Multi-Family Roofing, Inc.',
  brand: 'PMR Roofing',
  appName: 'PMR Field App',
  webAppName: 'PMR Connect',
  androidPackage: 'com.pmrroofing.fieldapp',
  iosBundleId: 'com.pmrroofing.fieldapp',

  marketingUrl: 'https://pmrroofing.com',
  webAppUrl: 'https://connect.pmrroofing.com',
  ownedDomains: ['pmrroofing.com', 'pmrroofing.ai', 'connect.pmrroofing.com'],

  // Where privacy / support / deletion requests go. Change here, nowhere else.
  supportEmail: 'dev@pmrroofing.com',
  generalEmail: 'info@pmrroofing.com',
  phoneDisplay: '469.409.ROOF',
  phoneTel: '+14694097663',
  addressLines: ['2006 N State Highway 360', 'Grand Prairie, TX 75050-1423'],

  lastUpdated: 'October 15, 2026',
  deletionResponseDays: 30,
  locationRetentionDays: 3,

  // Show a "pending legal review" ribbon at the top of every page. Set to false once
  // the company's counsel has approved the text.
  showReviewBanner: false,

  logoUrl:
    'https://images.squarespace-cdn.com/content/v1/5f9cc210d7bcd2463df1aee4/0bcbf64a-7e6f-4446-9408-c7936361ad6b/PMR-LOGO-CREAM-WEB.png?format=300w',
};

// ---------------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------------

const PAGES = {
  '/': { section: null, title: 'Legal & Privacy' },
  '/privacy': { section: 'privacy', title: 'Privacy Policy' },
  '/terms': { section: 'terms', title: 'Terms of Use' },
  '/support': { section: 'support', title: 'Support & Contact' },
  '/delete-account': { section: 'delete-account', title: 'Account & Data Deletion' },
};

// Old / alternate spellings that should keep working (e.g. the earlier GitHub Pages URLs).
const ALIASES = {
  '/index.html': '/',
  '/privacy.html': '/privacy',
  '/privacy-policy': '/privacy',
  '/terms.html': '/terms',
  '/terms-of-use': '/terms',
  '/support.html': '/support',
  '/delete-account.html': '/delete-account',
  '/account-deletion': '/delete-account',
  '/delete': '/delete-account',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    let path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;
    if (path === '') path = '/';

    if (path === '/robots.txt') {
      return plain(request, 'User-agent: *\nAllow: /\n');
    }
    if (path === '/.well-known/security.txt') {
      return plain(
        request,
        [
          `Contact: mailto:${CONFIG.supportEmail}`,
          'Expires: 2027-10-15T00:00:00.000Z',
          'Preferred-Languages: en, es',
          `Canonical: https://${url.host}/.well-known/security.txt`,
          '',
        ].join('\n'),
      );
    }

    if (ALIASES[path]) {
      return Response.redirect(`${url.origin}${ALIASES[path]}`, 301);
    }

    const page = PAGES[path];
    const nonce = makeNonce();

    if (!page) {
      return html(request, renderNotFound(nonce), nonce, 404);
    }
    return html(request, renderPage({ page, path, host: url.host, nonce }), nonce, 200);
  },
};

function makeNonce() {
  return btoa(crypto.randomUUID()).replace(/=+$/, '');
}

function securityHeaders(nonce) {
  return {
    'Content-Security-Policy': [
      "default-src 'none'",
      `style-src 'nonce-${nonce}' https://fonts.googleapis.com`,
      'font-src https://fonts.gstatic.com',
      'img-src https://images.squarespace-cdn.com data:',
      `script-src 'nonce-${nonce}'`,
      "base-uri 'none'",
      "form-action 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      'upgrade-insecure-requests',
    ].join('; '),
    'Strict-Transport-Security': 'max-age=31536000',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
  };
}

function html(request, body, nonce, status) {
  return new Response(request.method === 'HEAD' ? null : body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      ...securityHeaders(nonce),
    },
  });
}

function plain(request, body) {
  return new Response(request.method === 'HEAD' ? null : body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// ---------------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------------

const CSS = `
:root{
  --bg:#fff;--fg:#1b2f33;--muted:#53666a;--line:#dcd6c9;--card:#f6f3ec;
  --link:#b8480f;--accent:#f7712f;--hero:#1b2f33;--hero-fg:#eee9e0;
}
@media (prefers-color-scheme:dark){
  :root{--bg:#101a1c;--fg:#eee9e0;--muted:#a7b3b0;--line:#2a3b3e;--card:#17262a;
    --link:#ff9a63;--accent:#f7712f;--hero:#0b1214;--hero-fg:#eee9e0}
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:64px}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.65 Roboto,-apple-system,system-ui,"Segoe UI",sans-serif}
h1,h2,h3{font-family:"Roboto Slab",Georgia,serif;font-weight:400;line-height:1.2;margin:0}
a{color:var(--link)}
a:focus-visible,button:focus-visible{outline:3px solid var(--accent);outline-offset:2px;border-radius:3px}
.skip{position:absolute;left:-999px;top:0;background:#fff;color:#000;padding:8px 12px;z-index:10}
.skip:focus{left:8px;top:8px}
.ribbon{background:var(--accent);color:#1b2f33;text-align:center;padding:8px 16px;font-weight:500;font-size:.95rem}
header.hero{background:var(--hero);color:var(--hero-fg)}
.wrap{max-width:820px;margin:0 auto;padding:0 20px}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 0}
.brand{display:flex;align-items:center;gap:12px;color:var(--hero-fg);text-decoration:none}
.brand img{height:40px;width:auto;display:block}
.brand span{font-family:"Roboto Slab",Georgia,serif;font-size:1.05rem}
.bar a.ext{color:var(--hero-fg);font-size:.95rem;opacity:.9}
.hero-body{padding:36px 0 44px}
.hero h1{font-size:clamp(1.9rem,5vw,2.8rem);font-weight:300;letter-spacing:-.01em}
.hero h1 strong{font-weight:600}
.hero p{max-width:60ch;opacity:.92;margin:14px 0 0}
.hero em{color:var(--accent);font-style:normal}
nav.toc{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line)}
nav.toc ul{display:flex;gap:6px 22px;flex-wrap:wrap;list-style:none;margin:0;padding:12px 20px;max-width:820px;margin-inline:auto}
nav.toc a{text-decoration:none;font-weight:500;font-size:.95rem}
main{padding-bottom:56px}
section{padding-top:44px}
section>h2{font-size:1.8rem;padding-bottom:10px;border-bottom:3px solid var(--accent);display:inline-block;margin-bottom:6px}
h3{font-size:1.2rem;margin:28px 0 6px}
p{margin:.7em 0}
ul,ol{padding-left:1.25em}li{margin:.35em 0}
.muted{color:var(--muted);font-size:.92rem}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px 20px;margin:18px 0}
.card p:first-child{margin-top:0}.card p:last-child{margin-bottom:0}
.tbl{overflow-x:auto;margin:14px 0}
table{border-collapse:collapse;width:100%;font-size:.95rem;min-width:560px}
th,td{border:1px solid var(--line);padding:9px 11px;text-align:left;vertical-align:top}
th{background:var(--card);font-weight:500}
.btn{display:inline-block;font:inherit;font-size:.9rem;padding:3px 12px;margin-left:6px;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:6px;cursor:pointer}
.btn:hover{border-color:var(--accent)}
dl.facts{display:grid;grid-template-columns:max-content 1fr;gap:6px 18px;margin:12px 0}
dl.facts dt{font-weight:500}dl.facts dd{margin:0}
@media (max-width:560px){dl.facts{grid-template-columns:1fr}dl.facts dd{margin-bottom:8px}}
footer{background:var(--hero);color:var(--hero-fg);padding:34px 0;font-size:.95rem}
footer a{color:var(--hero-fg)}
footer .cols{display:flex;flex-wrap:wrap;gap:24px 48px}
footer p{margin:.25em 0}
footer p.legal{margin-top:18px;opacity:.8}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
`;

const SCRIPT = `
(function(){
  var map={"/privacy":"privacy","/terms":"terms","/support":"support","/delete-account":"delete-account"};
  var id=map[location.pathname.replace(/\\/+$/,"")];
  if(id&&!location.hash){var el=document.getElementById(id);if(el){el.scrollIntoView();}}
  var y=document.getElementById("yr");if(y)y.textContent=String(new Date().getFullYear());
  document.querySelectorAll("[data-copy]").forEach(function(b){
    b.addEventListener("click",function(){
      var t=b.getAttribute("data-copy"),old=b.textContent;
      var ok=function(){b.textContent="Copied";setTimeout(function(){b.textContent=old},1500)};
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,function(){location.href="mailto:"+t})}
      else{location.href="mailto:"+t}
    });
  });
})();
`;

const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#1b2f33"/><text x="32" y="41" font-family="Georgia,serif" font-size="24" font-weight="700" text-anchor="middle" fill="#eee9e0">PMR</text></svg>',
  );

function mail(subject) {
  const e = CONFIG.supportEmail;
  const q = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `<a href="mailto:${e}${q}">${e}</a><button type="button" class="btn" data-copy="${e}">Copy</button>`;
}

function renderPage({ page, path, host, nonce }) {
  const c = CONFIG;
  const canonical = `https://${esc(host)}${path === '/' ? '/' : path}`;
  const desc = `${c.appName} privacy policy, terms of use, support and account deletion. Operated by ${c.companyLegal} (${c.brand}).`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(page.title)} — ${esc(c.appName)} · ${esc(c.brand)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow">
<meta name="theme-color" content="#1b2f33">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Slab:wght@300;400;600&display=swap">
<style nonce="${nonce}">${CSS}</style>
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
${c.showReviewBanner ? '<div class="ribbon" role="note">Pending legal review — content may change before publication.</div>' : ''}
<header class="hero">
  <div class="wrap">
    <div class="bar">
      <a class="brand" href="/" aria-label="${esc(c.brand)} legal home">
        <img src="${c.logoUrl}" alt="${esc(c.brand)}" width="140" height="40">
        <span>Legal &amp; Privacy</span>
      </a>
      <a class="ext" href="${c.marketingUrl}" rel="noopener">pmrroofing.com&nbsp;↗</a>
    </div>
    <div class="hero-body">
      <h1>Roofing with a <strong>strong foundation</strong>.<br>Software that respects <em>your data</em>.</h1>
      <p>This is the official legal and privacy site for ${esc(c.appName)} and ${esc(c.webAppName)}, the internal tools used by the people of ${esc(c.brand)}. Everything Google Play, the Apple App Store and our own team need to know is on this page.</p>
    </div>
  </div>
</header>

<nav class="toc" aria-label="Sections">
  <ul>
    <li><a href="#about">About</a></li>
    <li><a href="#privacy">Privacy Policy</a></li>
    <li><a href="#terms">Terms of Use</a></li>
    <li><a href="#support">Support</a></li>
    <li><a href="#delete-account">Delete account</a></li>
  </ul>
</nav>

<main id="content" class="wrap">

<section id="about">
  <h2>About this site</h2>
  <div class="card">
    <p><strong>This website is owned and operated by ${esc(c.companyLegal)}</strong>, the company behind ${esc(c.brand)}. The domains <strong>${c.ownedDomains.map(esc).join('</strong>, <strong>')}</strong> all belong to the same organization: <a href="${c.marketingUrl}" rel="noopener">pmrroofing.com</a> is our company website, <a href="${c.webAppUrl}" rel="noopener">connect.pmrroofing.com</a> is ${esc(c.webAppName)} (our operations platform), and <strong>pmrroofing.ai</strong> is the legal and compliance home for our software.</p>
  </div>
  <p>${esc(c.brand)} is a Texas roofing company serving commercial, multifamily and residential customers. Our software is built for our own people:</p>
  <ul>
    <li><strong>${esc(c.webAppName)}</strong> — the web platform our office and administrators use to run jobs, customers, crews, warranty and messaging.</li>
    <li><strong>${esc(c.appName)}</strong> — the mobile app (Android and iOS) our field crews and technicians use at the job site. It has no backend of its own: everything it shows or saves lives in ${esc(c.webAppName)}.</li>
  </ul>
  <p><strong>Who may use these apps.</strong> They are internal business tools. Accounts are created and managed by ${esc(c.brand)} using work credentials; there is no public sign-up, and the apps are not intended for the general public. This site is public because Apple and Google require every app in their stores to publish a privacy policy, a way to contact us and a way to request deletion — and because anyone whose data we handle deserves to read it.</p>
  <dl class="facts">
    <dt>App</dt><dd>${esc(c.appName)}</dd>
    <dt>Developer / operator</dt><dd>${esc(c.companyLegal)} (“${esc(c.brand)}”)</dd>
    <dt>Android package</dt><dd><code>${esc(c.androidPackage)}</code></dd>
    <dt>iOS bundle ID</dt><dd><code>${esc(c.iosBundleId)}</code></dd>
    <dt>Address</dt><dd>${c.addressLines.map(esc).join('<br>')}</dd>
    <dt>Phone</dt><dd><a href="tel:${c.phoneTel}">${esc(c.phoneDisplay)}</a></dd>
    <dt>Email</dt><dd>${mail('')}</dd>
    <dt>Last updated</dt><dd>${esc(c.lastUpdated)}</dd>
  </dl>
</section>

<section id="privacy">
  <h2>Privacy Policy</h2>
  <p class="muted">Effective ${esc(c.lastUpdated)}</p>
  <p>This policy explains what personal information ${esc(c.appName)} and ${esc(c.webAppName)} (together, “the apps”) collect when you use them, why, who can see it, how long we keep it, and what you can do about it. It is written for the people who actually use the apps: ${esc(c.brand)} employees, crew members and authorized partners.</p>

  <h3>1. Information we collect</h3>
  <div class="tbl"><table>
    <thead><tr><th>What</th><th>Details</th><th>Why we need it</th></tr></thead>
    <tbody>
      <tr><td><strong>Account &amp; identity</strong></td><td>Name, work email, user ID, role and crew assignment. Created by ${esc(c.brand)} when your account is set up.</td><td>Sign you in, decide what you may see and do, and show who performed each action.</td></tr>
      <tr><td><strong>Work activity</strong></td><td>Check-in / check-out times, job status updates, notes, expenses, incident reports and messages with the office.</td><td>Run and document jobs, safety follow-up, customer service and warranty records.</td></tr>
      <tr><td><strong>Photos</strong></td><td>Job-site photos you take or choose (before / after / damage / other), attached to a specific job.</td><td>Evidence of work performed. Only photos you select are uploaded.</td></tr>
      <tr><td><strong>Precise location</strong></td><td>Your device’s GPS position, only while the app is open on screen and only after you grant permission.</td><td>(a) Show your position on the route map and give directions — this happens on your device. (b) If ${esc(c.brand)} has turned on live location for your crew, your position is sent to ${esc(c.webAppName)} <em>only during an active job visit</em> so the office can see where crews are. It stops when you check out, sign out or revoke permission.</td></tr>
      <tr><td><strong>Device &amp; notifications</strong></td><td>Push-notification token, platform (iOS or Android) and app version.</td><td>Deliver job and message notifications; keep the app compatible.</td></tr>
      <tr><td><strong>Technical data</strong></td><td>IP address, timestamps and request metadata recorded in server logs; sign-in tokens kept in your phone’s secure storage.</td><td>Security, abuse prevention and troubleshooting.</td></tr>
    </tbody>
  </table></div>
  <p><strong>What we do not do.</strong> The apps contain no advertising, no analytics or tracking SDKs and no third-party crash-reporting. We do not collect location in the background (when the app is closed), we do not sell personal information, and we do not use it to track you across other companies’ apps or websites. Work you submit while offline is stored on your device until it can be sent.</p>

  <h3>2. How we use information</h3>
  <p>To operate the apps and run ${esc(c.brand)}’s business: scheduling and dispatch, job documentation, safety and incident follow-up, customer service and warranty, security, and compliance with the law. We do not make automated decisions that have legal or similarly significant effects on you. Because these are workplace tools, your use of them is also subject to ${esc(c.brand)}’s employment or engagement policies.</p>

  <h3>3. Who can see it, and who we share it with</h3>
  <ul>
    <li><strong>Authorized ${esc(c.brand)} staff</strong>, according to their role in ${esc(c.webAppName)} (for example office staff, administrators and your own crew lead).</li>
    <li><strong>Service providers that run the apps for us:</strong> Amazon Web Services (hosting and storage, United States); Expo, Apple Push Notification service and Google Firebase Cloud Messaging (delivering push notifications — they receive your notification token and the notification text); Google Maps on Android and Apple Maps on iOS (map display — the map provider receives standard request data such as your IP address).</li>
    <li><strong>Legal and safety.</strong> We may disclose information if required by law, to protect people’s safety, or in a sale or reorganization of the business.</li>
  </ul>
  <p>These providers act on our instructions and may not use the data for their own advertising. We do not sell or “share” personal information for cross-context behavioral advertising.</p>

  <h3>4. How long we keep it</h3>
  <div class="tbl"><table>
    <thead><tr><th>Data</th><th>Retention</th></tr></thead>
    <tbody>
      <tr><td>Live location points</td><td>Automatically and permanently deleted after <strong>${c.locationRetentionDays} days</strong>.</td></tr>
      <tr><td>Push-notification token</td><td>Removed when you sign out or your device unregisters.</td></tr>
      <tr><td>Account details (name, email, role)</td><td>Kept while your account is active, and after deactivation until erased on request — see <a href="#delete-account">Account &amp; Data Deletion</a>.</td></tr>
      <tr><td>Job records (check-ins, notes, expenses, incident reports, photos, messages)</td><td>Kept as business records of ${esc(c.brand)} for as long as needed for operations, warranty, safety and legal obligations.</td></tr>
      <tr><td>Server logs</td><td>Kept for a limited period for security and troubleshooting.</td></tr>
    </tbody>
  </table></div>

  <h3>5. Permissions the app asks for</h3>
  <div class="tbl"><table>
    <thead><tr><th>Permission</th><th>Used for</th></tr></thead>
    <tbody>
      <tr><td>Camera</td><td>Taking job-site photos.</td></tr>
      <tr><td>Photos / media</td><td>Attaching photos you already have to a job.</td></tr>
      <tr><td>Location — while using the app</td><td>Route map, directions and (if enabled) live crew location during an active visit.</td></tr>
      <tr><td>Notifications</td><td>Job assignments and messages.</td></tr>
    </tbody>
  </table></div>
  <p>Every permission is optional. If you decline one, only the matching feature stops working. You can change or withdraw any permission at any time in your device’s Settings.</p>

  <h3>6. Your choices and rights</h3>
  <p>You can ask us to give you a copy of your information, correct it, or delete it, and you can withdraw permissions at any time. See <a href="#delete-account">Account &amp; Data Deletion</a> or contact us below. Depending on where you live you may have additional rights under local law; we will honor valid requests. We will not retaliate against you for making one.</p>

  <h3>7. Security</h3>
  <p>Data travels over encrypted connections (HTTPS/TLS). Sign-in tokens are stored in your device’s secure storage, and access inside ${esc(c.webAppName)} is limited by role. No system is perfectly secure; if you believe your account or data has been compromised, contact us right away.</p>

  <h3>8. Children</h3>
  <p>The apps are for working adults and are not directed to anyone under 18. We do not knowingly collect information from children.</p>

  <h3>9. Changes</h3>
  <p>If our practices change we will update this page and the date above. Material changes will also be communicated to app users.</p>

  <h3>10. Contact</h3>
  <p>${esc(c.companyLegal)}, ${c.addressLines.map(esc).join(', ')} · <a href="tel:${c.phoneTel}">${esc(c.phoneDisplay)}</a> · ${mail('Privacy question — PMR Field App')}</p>
</section>

<section id="terms">
  <h2>Terms of Use</h2>
  <p class="muted">Effective ${esc(c.lastUpdated)}</p>
  <p>By signing in to or using ${esc(c.appName)} or ${esc(c.webAppName)} you agree to these terms. They do not change the terms of your employment or engagement with ${esc(c.brand)}; if they conflict with a written agreement you have with us, that agreement controls.</p>

  <h3>1. Authorized use only</h3>
  <p>The apps are for ${esc(c.brand)} employees, crew members and partners who were given an account. Do not share your login, and do not let anyone else use your session. We may suspend or remove access at any time, including when your role ends.</p>

  <h3>2. What you agree to</h3>
  <ul>
    <li>Enter accurate information — check-ins, notes, expenses and photos are business records.</li>
    <li>Do not upload unlawful, offensive or unrelated content, and avoid photographing people or private property beyond what the job requires.</li>
    <li>Do not try to access data or accounts that are not yours, probe or disrupt the service, or reverse-engineer the apps.</li>
    <li><strong>Work safely.</strong> Never use the app while driving, on a ladder or near a roof edge. No task in the app is worth an injury.</li>
  </ul>

  <h3>3. Content and records</h3>
  <p>Photos, notes, reports, messages and other job content you submit as part of your work are business records of ${esc(c.brand)}. You keep any rights you have in your own personal information as described in the Privacy Policy.</p>

  <h3>4. Live location</h3>
  <p>If ${esc(c.brand)} turns on live location for your crew, your location during active job visits is visible to authorized staff as described in the Privacy Policy. It is collected only while the app is open and only after you grant permission.</p>

  <h3>5. Availability and disclaimers</h3>
  <p>The apps are provided “as is” and “as available.” Features such as offline queuing depend on your device and connection, and we do not guarantee uninterrupted or error-free service. To the fullest extent permitted by law, ${esc(c.companyLegal)} is not liable for indirect, incidental or consequential damages arising from use of the apps. Nothing in these terms limits liability that cannot be limited by law.</p>

  <h3>6. Termination</h3>
  <p>You may stop using the apps at any time. We may suspend or end access when needed for security, misuse, or the end of your role. Sections that by their nature should survive (records, disclaimers, governing law) will survive.</p>

  <h3>7. Governing law</h3>
  <p>These terms are governed by the laws of the State of Texas, without regard to conflict-of-law rules.</p>

  <h3>8. Changes and contact</h3>
  <p>We may update these terms; continued use after an update means you accept it. Questions: ${mail('Terms question — PMR Field App')}.</p>
</section>

<section id="support">
  <h2>Support &amp; Contact</h2>
  <p>Need help with ${esc(c.appName)}? Email ${mail('Support — PMR Field App')} and tell us your name, your crew and what you were doing. A screenshot helps. You can also call <a href="tel:${c.phoneTel}">${esc(c.phoneDisplay)}</a>.</p>
  <h3>Common questions</h3>
  <p><strong>I can’t sign in.</strong> Accounts are created by ${esc(c.brand)}. Ask your manager to confirm your account exists, is active and is assigned to a crew.</p>
  <p><strong>I see no jobs.</strong> You may not be assigned to a crew or a route today. Contact the office.</p>
  <p><strong>My photos or updates didn’t send.</strong> The app saves them on your phone when there is no signal and sends them automatically when the connection returns. Keep the app installed and open it once you have signal.</p>
  <p><strong>Notifications don’t arrive.</strong> Make sure notifications are allowed for the app in your device’s Settings.</p>
  <p><strong>Security concern.</strong> Write to ${mail('Security — PMR Field App')} (see also <a href="/.well-known/security.txt">security.txt</a>).</p>
</section>

<section id="delete-account">
  <h2>Account &amp; Data Deletion</h2>
  <dl class="facts">
    <dt>App</dt><dd>${esc(c.appName)} (${esc(c.androidPackage)})</dd>
    <dt>Developer</dt><dd>${esc(c.companyLegal)}</dd>
  </dl>
  <p>${esc(c.appName)} accounts are created and managed by ${esc(c.brand)}, so there is no in-app sign-up and deletion is handled by request.</p>

  <h3>How to request</h3>
  <ol>
    <li>Email ${mail('Delete my PMR Field App account')} with the subject “Delete my PMR Field App account”, from your work email — or ask your ${esc(c.brand)} manager to submit it for you.</li>
    <li>We verify your identity and confirm within <strong>${c.deletionResponseDays} days</strong>.</li>
  </ol>

  <h3>What happens to your data</h3>
  <div class="tbl"><table>
    <thead><tr><th>Data</th><th>What happens</th></tr></thead>
    <tbody>
      <tr><td>Account access</td><td><strong>Deactivated immediately:</strong> you can no longer sign in and you stop appearing as an active crew member.</td></tr>
      <tr><td>Push-notification token</td><td><strong>Removed</strong>; your device stops receiving notifications.</td></tr>
      <tr><td>Live location points</td><td><strong>Automatically and permanently deleted</strong> after ${c.locationRetentionDays} days at most, regardless of any request.</td></tr>
      <tr><td>Name, work email and account details</td><td><strong>Retained after deactivation today</strong> for recordkeeping, warranty and legal purposes. On your request we will erase or anonymize them as far as our systems and legal obligations allow; we handle this manually and will tell you what was done.</td></tr>
      <tr><td>Job records — check-ins, notes, expenses, incident reports, photos, messages</td><td><strong>Retained</strong> as business records of ${esc(c.brand)} (they document work for customers). Where possible they are kept without your personal identifiers; they are kept in full where the law or a warranty requires it.</td></tr>
    </tbody>
  </table></div>
  <p>To withdraw only some permissions (camera, photos, location, notifications) you do not need to delete your account: change them in your device’s Settings.</p>
</section>

</main>

<footer>
  <div class="wrap">
    <div class="cols">
      <div>
        <p><strong>${esc(c.companyLegal)}</strong></p>
        <p>${c.addressLines.map(esc).join('<br>')}</p>
      </div>
      <div>
        <p><a href="tel:${c.phoneTel}">${esc(c.phoneDisplay)}</a></p>
        <p><a href="mailto:${c.generalEmail}">${c.generalEmail}</a></p>
        <p><a href="${c.marketingUrl}" rel="noopener">pmrroofing.com</a> · <a href="${c.webAppUrl}" rel="noopener">connect.pmrroofing.com</a></p>
      </div>
    </div>
    <p class="legal">© <span id="yr">${new Date().getUTCFullYear()}</span> ${esc(c.companyLegal)} All rights reserved. pmrroofing.ai is owned and operated by ${esc(c.companyLegal)}.</p>
  </div>
</footer>
<script nonce="${nonce}">${SCRIPT}</script>
</body>
</html>`;
}

function renderNotFound(nonce) {
  const c = CONFIG;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Page not found — ${esc(c.brand)}</title><meta name="robots" content="noindex">
<style nonce="${nonce}">body{margin:0;display:grid;place-items:center;min-height:100vh;background:#1b2f33;color:#eee9e0;font:18px/1.6 system-ui,sans-serif;text-align:center;padding:24px}a{color:#f7712f}h1{font-weight:400;font-family:Georgia,serif}</style>
</head><body><main><h1>Page not found</h1><p>The page you were looking for doesn’t exist.</p>
<p><a href="/">Legal &amp; Privacy home</a> · <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms</a> · <a href="/support">Support</a></p></main></body></html>`;
}

/*
 * Facts this text relies on (verified against the code, 2026-10-15) — re-check before
 * changing the legal wording:
 *  - Deactivating a user in PMR Connect only sets isActive=false; it does NOT erase
 *    name/email (pmr-connect apps/api/src/modules/admin/admin.service.ts).
 *  - Live-location points are purged automatically after PING_RETENTION_DAYS = 3
 *    (apps/api/src/modules/location-tracking/location-tracking.constants.ts).
 *  - Push tokens are hard-deleted on unregister / sign-out (devices.service.ts).
 *  - The mobile app collects location in the foreground only, has no analytics or
 *    crash-reporting SDK, and has no in-app account creation (LoginScreen only).
 *  - If any of that changes (e.g. a real erase/anonymize job ships), update the
 *    retention table and the deletion table, and bump CONFIG.lastUpdated.
 */

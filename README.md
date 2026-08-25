# iSite — marketing site

The public marketing / intro site for **iSite**, the construction site access,
induction and attendance platform. Served at **https://isite.srscloud.co.uk**.
The application itself lives one hop away at **https://app.isite.srscloud.co.uk**.

This is a **static site** — plain HTML, CSS and a little vanilla JavaScript, with
no build step. Currently served by **GitHub Pages** — see "Hosting" below
before changing anything that depends on response headers.

## Structure

```
index.html      One-page landing (hero, what it is, features, how it works,
                who it's for, contact)
pricing.html    Plans and prices. Linked from the main nav.
privacy.html    Privacy policy. Has placeholders — see below.
styles.css      All styles. Palette matches the app's neutral iSite theme.
main.js         Mobile nav, footer year, scroll-reveal. No dependencies.
404.html        Branded not-found page.

favicon.ico     Multi-size tab icon (16/32/48). At the root on purpose, so a
                bare /favicon.ico request resolves instead of hitting 404.html.
assets/
  logo.svg              The iSite logo mark (shared with the app icon).
  apple-touch-icon.png  180x180 iOS home-screen icon.
  og-image.png          1200x630 social card. PNG because no social platform
                        renders an SVG og:image.
tools/
  generate-assets.mjs   Regenerates the three raster assets from the logo
                        shapes. Optional, not part of any build.

_headers        Cloudflare Pages security response headers. Currently inert —
                see "Hosting" below.
robots.txt      / sitemap.xml — indexing.
```

## Local preview

No build needed — it's static files. Serve the folder with anything, e.g.:

```bash
npx --yes serve .
# or
python -m http.server 4321
```

Then open the printed URL. Editing a file and refreshing is the whole loop.

## Hosting — read this first

**The live site is served by GitHub Pages, not Cloudflare Pages.** The response
from `https://isite.srscloud.co.uk` carries `Server: GitHub.com`, and the
`CNAME` file in this repo is the GitHub Pages convention.

That matters because **GitHub Pages does not read `_headers`**. Every header in
that file — the CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options` — is
currently doing nothing. The file looks like working configuration and is not.

Pick one:

- **Move to Cloudflare Pages** (the steps below) and `_headers` starts working.
  Check inline `<style>`/`style=` usage first: the CSP is `style-src 'self'`
  with no `'unsafe-inline'`, so any inline CSS is dropped the moment the
  headers take effect. There is none right now — keep it that way.
- **Stay on GitHub Pages** and delete `_headers`, or leave it with a comment
  saying it is aspirational. GitHub Pages has no mechanism for setting response
  headers, so HSTS and `frame-ancestors` are simply not available there.

If you do move to Cloudflare Pages, update the hosting provider named in
`privacy.html` section 5 (it currently says GitHub, Inc.).

## Deploy — Cloudflare Pages

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**,
   select this repo.
3. Build settings: **Framework preset = None**, **Build command = (blank)**,
   **Build output directory = `/`** (the site is served as-is; there is no build).
4. Deploy. You'll get a `*.pages.dev` URL to check.

### Point the domain

Once the `*.pages.dev` deploy looks right, attach the custom domain:

1. In the Pages project → **Custom domains → Set up a custom domain** →
   `isite.srscloud.co.uk`.
2. In DNS, repoint the **`isite`** CNAME from the Railway target
   (`011s592o.up.railway.app`) to the Pages project (Cloudflare will tell you the
   exact target, typically `<project>.pages.dev`).
3. In **Railway → app service → Settings → Domains**, remove
   `isite.srscloud.co.uk` so Railway stops claiming it. The app keeps running on
   `app.isite.srscloud.co.uk`.

That completes the split: **isite** = this marketing site, **app.isite** = the
application.

## Editing notes

- Colours are CSS variables at the top of `styles.css`, taken from the app's
  neutral (non-tenant) iSite palette so the two properties feel like one brand.
- Copy is written to match what the application actually does — keep it honest;
  don't add features here that aren't in the product.
- **After editing `styles.css` or `main.js`, bump the `?v=` number on their
  `<link>`/`<script>` tags in all four HTML files.** The host serves both with
  `Cache-Control: max-age=600` and neither filename ever changes, so without a
  bump returning visitors get up to ten minutes of new HTML against old CSS —
  which on the pricing page renders as a completely unstyled mess, not as a
  minor visual glitch. Currently at `v=3`. One-liner to check they all match:

  ```bash
  grep -h -o 'styles.css?v=[0-9]*|main.js?v=[0-9]*' *.html | sort -u
  ```
- The contact address is `hello@srscloud.co.uk`, and appears in the CTA and
  footer of `index.html`, `pricing.html` and `privacy.html`. `_headers` allows
  `mailto:` form actions. Grep for it if the address changes.

## Before the privacy policy goes live

`privacy.html` is a working draft and **needs a read-through by whoever owns
compliance.** It names **SRS Support** as the data controller and covers this
marketing site only — the application at `app.isite.srscloud.co.uk` is
explicitly out of scope and needs its own notice.

Search the file for `class="placeholder"` and fill in:

| Placeholder | Where |
| --- | --- |
| `[ICO REGISTRATION NUMBER]` | §1 Who we are |
| `[EMAIL PROVIDER]` | §5 Who we share it with |
| `[RETENTION PERIOD]` x3 | §7 How long we keep it |

The controller is **SRS Support Limited**, company number **07805852**,
registered office Woodland View, Heol Llangeinor, Llangeinor, Bridgend,
CF32 8PW. Those came from Companies House and are already filled in. The ICO
number is on a separate register (the ICO fee-payers register), not derivable
from Companies House, so it still needs looking up by hand.

The placeholders are visually highlighted, so anything missed is obvious on the
page rather than buried in the source. Also update the "Last updated" date in
the page hero when you edit it.

## Regenerating the icons and social card

Only needed if the logo or the social-card copy changes:

```bash
npm install @resvg/resvg-js
node tools/generate-assets.mjs
```

Then commit `favicon.ico`, `assets/apple-touch-icon.png` and
`assets/og-image.png`. `node_modules/` is gitignored; the site itself still has
no build step and deploys as-is.

The small favicon sizes use simplified marks rather than the full logo — three
nested levels (tile > pin > disc > "i") turn to mud below about 48px, so 16px
gets the pin silhouette alone and 32/48px get the pin with a bold "i" knocked
out of it. That logic lives in `tools/generate-assets.mjs`.

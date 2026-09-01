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
ar/index.html   Arabic (RTL) landing page for the Gulf market. Deliberately not
                a mirror of the English site — see "The Arabic page" below.
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

## The privacy policy

`privacy.html` covers **this marketing site only**. The application at
`app.isite.srscloud.co.uk` is explicitly out of scope and still needs its own
notice — that is a real gap, not an oversight in this file.

The controller is **SRS Support Limited**, company number **07805852**,
registered office Woodland View, Heol Llangeinor, Llangeinor, Bridgend,
CF32 8PW, ICO registration **ZC230256**. Section 1 therefore also satisfies the
Companies Act 2006 trading-disclosure rules, which require the registered name,
number, place of registration and registered office to appear on the company's
website. Nothing else on the site carries them, so do not delete that block.

Provenance, because it matters if anyone challenges it:

- Company name, number and registered office were taken from Companies House
  and verified against the company profile page.
- The **ICO number was supplied by hand and has not been independently
  verified** — ico.org.uk returns 403 to automated requests, on both its search
  and its direct entry URLs.
- Cloudflare's analytics retention (7 days unsampled, then aggregated to a ~10%
  sample) is quoted from Cloudflare's own Web Analytics FAQ.
- The 90-day enquiry and 6-year post-customer retention periods came from SRS
  Support. Six years matches the Limitation Act 1980 claim window and HMRC's
  business-record requirement.

There are **no placeholders left**. If you edit the policy, update the
"Last updated" date in the page hero and the `lastmod` for `privacy.html` in
`sitemap.xml`. It has not had a solicitor's review.

## The Arabic page

`ar/index.html` is a **standalone landing page, not a translation of the site.**
It covers hero, what it is, features, how it works and contact. There is no
Arabic pricing page: the CTA routes to an email enquiry instead, so UAE pricing
stays flexible and no GBP figure anchors the conversation.

Three things to keep in mind when editing:

- **It will drift from the English page, and that is expected.** They are
  separate documents with no shared source. If you change a feature claim in
  `index.html`, decide consciously whether `ar/index.html` needs the same edit.
- **The UK framing is deliberately absent.** The "Built for UK construction"
  line and the RAMS reference have no Arabic equivalent here — RAMS is rendered
  as the region-neutral وثائق تقييم المخاطر. Do not "restore parity" by
  translating the UK-specific claims back in.
- **The safety terminology has not been reviewed by a native speaker.** Grammar
  and register are sound; what needs a second pair of eyes is whether a Dubai
  site manager actually says التعريف بالسلامة for induction and نداء التجمّع for
  muster. Get that reviewed before leaning on this page commercially.

### RTL mechanics

The layout mirrors on its own because every directional rule in `styles.css` is
a logical property (`padding-inline-start`, `inset-inline-start`,
`border-inline-end`) rather than a physical one. **Keep it that way** — a single
`padding-left` will put the pricing tick marks on the wrong side of their text
the moment the page is flipped.

Arabic-specific rules live in the `[dir="rtl"]` block at the end of the
stylesheet: an Arabic-first font stack, taller line-height, and
`letter-spacing: normal` because negative tracking damages cursive joins.

The header collapses to the hamburger at **900px**, not 760px. The language
switcher is what pushed it over — below roughly 900px the brand, six nav items,
the switcher and two buttons no longer fit on one line.

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

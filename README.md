# iSite — marketing site

The public marketing / intro site for **iSite**, the construction site access,
induction and attendance platform. Served at **https://isite.srscloud.co.uk**.
The application itself lives one hop away at **https://app.isite.srscloud.co.uk**.

This is a **static site** — plain HTML, CSS and a little vanilla JavaScript, with
no build step. Hosted on **Cloudflare Pages**.

## Structure

```
index.html      One-page landing (hero, what it is, features, how it works,
                who it's for, contact)
styles.css      All styles. Palette matches the app's neutral iSite theme.
main.js         Mobile nav, footer year, scroll-reveal. No dependencies.
assets/logo.svg The iSite logo mark (shared with the app icon).
_headers        Cloudflare Pages security response headers.
robots.txt      / sitemap.xml — indexing.
404.html        Branded not-found page.
```

## Local preview

No build needed — it's static files. Serve the folder with anything, e.g.:

```bash
npx --yes serve .
# or
python -m http.server 4321
```

Then open the printed URL. Editing a file and refreshing is the whole loop.

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
- The contact address is `hello@srscloud.co.uk` in `index.html` (hero/CTA/footer)
  and `_headers` allows `mailto:` form actions. Change it in one place if the
  address changes.

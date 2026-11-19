# ABC.Academy

Free early learning for children ages 2–8: an interactive alphabet, phonics lab, all Dolch sight words, early math tools, eight learning games, read-along decodable stories, a printable worksheet generator, a video library and parent/teacher guides.

Static site (HTML/CSS/vanilla JS) hosted on GitHub Pages from the `main` branch. No build step is needed to serve it.

## Structure

| Path | What it is |
|---|---|
| `*.html`, `guides/*.html` | Generated pages (edit the sources in `builder/`, then rebuild) |
| `assets/css/style.css` | Design system |
| `assets/js/` | `core.js` (navigation, speech, forms, consent, lead prompts), `words.js` (word bank), one module per tool |
| `data/` | JSON content: videos, news, daily items, contest themes, jobs, search index |
| `builder/build.py` | Wraps page bodies with the shared layout; regenerates `sitemap.xml`, `robots.txt`, `data/search-index.json` |
| `scripts/update_content.py` | Daily refresh: videos (YouTube RSS), news (Google News RSS), daily items, sitemap dates |
| `scripts/make_images.py` | Generates app icons and the social share image |
| `.github/workflows/auto-refresh.yml` | Runs the refresh every day at 06:17 UTC (and on demand) |

## Common tasks

- **Rebuild pages:** `python3 builder/build.py`
- **Add a guide:** add `builder/guides/<slug>.html`, add an entry to `GUIDES` in `builder/build.py`, rebuild.
- **Add a page:** add `builder/pages/<slug>.html`, add an entry to `PAGES`, rebuild.
- **Donation buttons:** paste Stripe / PayPal / Buy Me a Coffee links into `CONFIG.donate` at the top of `assets/js/core.js`. Until then, donations arrive as pledges through the support form.
- **Contest themes and prize text:** `data/contests.json`. **Job openings:** `data/jobs.json`.
- **Video channels and news topics:** `CHANNELS` and `NEWS_QUERIES` in `scripts/update_content.py`.

## Custom domain

When `abc.academy` DNS points to GitHub Pages (A records 185.199.108.153, .109.153, .110.153, .111.153), add a `CNAME` file containing `abc.academy` and set the custom domain in Settings → Pages. All internal links are relative, so the site works at both addresses.

© ABC.Academy. Independent site, not affiliated with ABCmouse®, Age of Learning, Inc., or the American Broadcasting Company. See `disclaimer.html`.

# ABC.Academy

Free early learning for children ages 2–8: interactive alphabet, phonics lab, all Dolch sight words, early math tools, eight learning games, read-along decodable stories, a printable worksheet generator, a self-updating video library and parent/teacher guides.

Hosted on GitHub Pages from the `main` branch. GitHub Pages builds the site with Jekyll automatically — there is nothing to install.

## Structure

| Path | What it is |
|---|---|
| `_layouts/default.html` | Shared page shell: head, AdSense, top contact bar, navigation, footer, lead pop-up |
| `_layouts/guide.html` | Article layout used by every guide |
| `*.html` | Pages. Each starts with a short front matter block (title, description, scripts) |
| `_guides/*.html` | Parent & teacher guides (a Jekyll collection, published at `/guides/`) |
| `assets/css/style.css` | Design system |
| `assets/js/` | `core.js` (navigation, speech, forms, consent, lead prompts), `words.js` (word bank), one module per tool |
| `data/` | JSON content: videos, news, daily items, contest themes, jobs; `search-index.json` is generated |
| `sitemap.xml` | Generated on every build from all pages and guides |
| `scripts/update_content.py` | Daily refresh: videos (YouTube RSS), news (Google News RSS), letter/word of the day |
| `scripts/make_images.py` | Generates the app icons and social share image |

## Common tasks

- **Add a guide:** create `_guides/<slug>.html` with front matter `title`, `headline`, `desc`, `cat`, `mins`, `order`, `slug_id`, then the article HTML (use `<h2 id="...">` headings; the table of contents builds itself). It appears on the home page, the guides hub, related links, search and the sitemap automatically.
- **Add a page:** create `<name>.html` with front matter `title`, `desc`, `slug`, `crumb` and optional `js: ["file.js"]`.
- **Donation buttons:** paste Stripe / PayPal / Buy Me a Coffee links into `CONFIG.donate` at the top of `assets/js/core.js`. Until then, donations arrive as pledges through the support form.
- **Contest themes and prize text:** `data/contests.json`. **Job openings:** `data/jobs.json`.
- **Video channels and news topics:** `CHANNELS` and `NEWS_QUERIES` in `scripts/update_content.py`.

## Custom domain

When `abc.academy` DNS points to GitHub Pages (A records 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153), set the custom domain in Settings → Pages (this adds a `CNAME` file). All internal links are relative, so the site works at both addresses.

© ABC.Academy. Independent site, not affiliated with ABCmouse®, Age of Learning, Inc., or the American Broadcasting Company. See `disclaimer.html`.

# Roamadic Mechanic — website source

Static site for roamadicmechanic.com. No build step — plain HTML/CSS/JS, ready to publish on GitHub Pages.

## Files

- `index.html` — the whole homepage
- `assets/css/style.css` — all styles
- `assets/js/main.js` — one small script (auto-updates the footer year)
- `assets/img/` — photos (logo, hero, recent-work gallery)
- `assets/icons/` — favicon set
- `CNAME` — tells GitHub Pages to serve this at roamadicmechanic.com
- `robots.txt`, `sitemap.xml` — basic SEO plumbing

## Editing content

Everything on the page is in `index.html` — service cards, hours, phone number, gallery captions. Open it in any text editor, change the text between the tags, save, and re-upload (or `git push` if using the command line).

The booking link used throughout is the Google Calendar appointment page:
`https://calendar.app.google/qG533FuFE7YUvCbU6`

## Deploying

See the deployment guide provided alongside this file for the no-command-line, drag-and-drop steps to publish this on GitHub Pages and point roamadicmechanic.com at it.

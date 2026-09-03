# Roamadic Mechanic — website source

Static site for roamadicmechanic.com. No build step — plain HTML/CSS/JS, ready to publish on GitHub Pages.

## Files

- `index.html` — the whole homepage
- `thank-you.html` — standalone "thanks / leave a review" page. Not linked from
  the site; text or email the URL to a customer after a job.
- `assets/css/style.css` — all styles
- `assets/js/main.js` — one small script (auto-updates the footer year)
- `assets/img/` — photos (logo, hero, recent-work gallery)
- `assets/icons/` — favicon set
- `CNAME` — tells GitHub Pages to serve this at roamadicmechanic.com
- `robots.txt`, `sitemap.xml` — basic SEO plumbing

## Editing content

Everything on the page is in `index.html` — service cards, hours, phone number, gallery captions. Open it in any text editor, change the text between the tags, save, and re-upload (or `git push` if using the command line).

Every public booking button opens `/schedule/`, Roamadic Mechanic's own intake
and scheduling flow. Availability and confirmed appointments are synchronized
with the business calendar by the private booking bridge.

## Deploying

See the deployment guide provided alongside this file for the no-command-line, drag-and-drop steps to publish this on GitHub Pages and point roamadicmechanic.com at it.

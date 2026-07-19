# Aurelia Journeys — website + booking backend

## What's in this build

- `index.html`, `style.css`, `script.js` — the marketing site (hero, destinations,
  featured stay, trip-cost estimator, testimonials, journal, FAQ, planner form).
- `santorini.html`, `maldives.html`, `kyoto.html` — real, indexable destination
  guide pages (previously these were JS-only modals, invisible to search engines).
- `journal-cyclades.html`, `journal-arriving.html` — real blog post pages.
- `privacy.html`, `terms.html` — legal pages (see disclaimer in each — have a
  lawyer review before relying on them).
- `sitemap.xml`, `robots.txt` — basic SEO plumbing.
- `server.js` — Express backend that emails booking inquiries and newsletter
  signups, now with input validation, rate limiting, security headers (helmet),
  a spam honeypot, and an auto-responder email to the customer.
- `build_pages.py` — the generator used to produce the destination/journal/legal
  pages above. Re-run it (`python3 build_pages.py`) if you edit the shared
  header/footer or destination data inside it, rather than hand-editing all
  seven files individually.

## Before you deploy — replace these placeholders

This build uses `aureliajourneys.example` as a placeholder domain (in canonical
tags, sitemap.xml, robots.txt, schema.org markup) and placeholder contact
details (`hello@aureliajourneys.example`, `+1 (800) 555-0142`, the WhatsApp
number). Find-and-replace these with your real domain and contact details
before going live.

## Local setup

```bash
npm install
cp .env.example .env
# edit .env with real values
npm start
```

Then open `index.html` directly in a browser, or serve the folder with any
static file server (`npx serve .`) so relative links between pages work.

## Required environment variables (`.env`)

See `.env.example`. At minimum you need `EMAIL_USER` / `EMAIL_PASS` (or
`EMAIL_HOST`/`EMAIL_PORT` for direct SMTP) and ideally `TO_EMAIL`.

**Do not commit `.env` to git** — `.gitignore` already excludes it.

## Things that still need a real account / API key to go from "demo" to "production"

These were called out in the original roadmap and are not things I can wire up
without credentials that belong to you:

1. **Transactional email provider.** Gmail SMTP works for testing but gets
   rate-limited and flagged as spam at real volume. Swap `EMAIL_HOST` in `.env`
   for a provider like Resend, Postmark, or SendGrid SMTP — the `server.js`
   code already supports generic SMTP, so this is a config change, not a code
   change.
2. **Real newsletter list.** `/api/subscribe` currently just emails you each
   new signup — it does not add anyone to an actual mailing list. For real
   campaigns, wire this endpoint to Mailchimp, ConvertKit, or similar (needs
   their API key).
3. **Real customer reviews.** Testimonials are still hand-authored placeholder
   copy. Swap in a Google Reviews or Trustpilot widget/API once you have a
   business profile with real reviews.
4. **Hosting + HTTPS + domain.** Deploy `server.js` somewhere (Render,
   Railway, Fly.io, a VPS, etc.) and the static files somewhere with HTTPS
   (Netlify, Vercel, Cloudflare Pages, or the same host). Update
   `ALLOWED_ORIGINS` in `.env` to your real production domain(s) once deployed.
5. **Photography.** The hero and two destination-card images were generated
   with Higgsfield AI; the Kyoto and featured-stay images are sourced,
   free-license Unsplash photography (credited to Unsplash's license terms —
   swap for your own licensed/brand photography for a fully custom look).

## What changed from the original version (security)

The original `.env.example` contained a real, working Gmail address and app
password. That has been removed and replaced with placeholders — if you had
committed that file anywhere public, revoke that app password in your Google
Account security settings immediately.

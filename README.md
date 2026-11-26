# Auto Care Detailing

Brisbane mobile car-detailing website: live morning/afternoon booking calendar, contact form, loyalty card, donation page, and a locked-down ops desk for the operator. Formerly "Squeaky Solutions" (renamed Nov 2026).

> **Working on this with an AI assistant?** Read [`AGENTS.md`](./AGENTS.md) first. This is Next.js 16 and has breaking changes versus older versions; the real docs live in `node_modules/next/dist/docs/`.

---

## Quick start

```bash
npm install
cp .env.example .env.local      # Windows PowerShell: Copy-Item .env.example .env.local
npm run admin:setup             # makes your admin password + 2FA key (see "Admin & security")
npm run dev                     # http://localhost:3000   (or: npx next dev -p 3001)
```

**Windows PowerShell blocks `npm`?** Use `npm.cmd run <script>` instead, or run once:
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / run |
| `npm run lint` | ESLint |
| `npm run admin:setup` | Generates `ADMIN_PASSWORD_HASH` + `ADMIN_TOTP_SECRET` (nothing is saved to disk) |
| `npm run db:backup` | Copies the SQLite DB to `data/backups/` with a timestamp |
| `npm run db:studio` | Drizzle Studio (browse the DB) |

---

## Stack

- **Next.js 16** (App Router, Turbopack), React 19, TypeScript, **Tailwind v4**
- **SQLite** via `better-sqlite3` + Drizzle (tables are auto-created on first run in `src/lib/db/index.ts`)
- **zod** for request validation
- **Gmail SMTP** (`nodemailer`) for desk emails, **Twilio** for customer SMS (both optional locally)

---

## Brand

| | |
| --- | --- |
| Name | Auto Care Detailing |
| Palette | Galaxy black `#0B0B0D`, seal grey `#8C8F94`, sunrise orange `#F0560A` |
| Logo (full, transparent) | `public/logo.png` (hero, link-preview image, app icon) |
| Logo (car crop) | `public/logo-mark.png` (header, footer, loyalty card) |
| Favicon / Apple icon | `src/app/icon.png`, `src/app/apple-icon.png` |

- Colour tokens are CSS variables at the top of `src/app/globals.css` (`--ink`, `--cream`, `--paper`, `--sun`, `--sun-deep`, `--sun-on-ink`, `--line`, `--chrome`).
- Contrast rules: use `--sun-on-ink` (`#F88830`) for orange on dark, and `--sun-deep` (`#B83D00`) for orange links on light cards. Bright orange on seal grey fails contrast.
- Business name, phone, email, ABN, tagline, hours, prices: `src/lib/constants.ts`.
- Suburb list: `src/lib/suburbs.ts`.
- The site is a dark page; light surfaces (`.card`, `bg-paper`) force ink text via a rule in `globals.css`.

---

## Admin & security

The ops desk is at `/admin`. It is single-user: **password + authenticator-app code**, no username.

### First-time setup

1. `npm run admin:setup` (use `-- --choose` to type your own passphrase of 16+ chars).
2. Add the printed key to an authenticator app ("enter a setup key").
3. Paste the two printed lines into `.env.local` **and** your host's environment variables:
   ```
   ADMIN_PASSWORD_HASH=...
   ADMIN_TOTP_SECRET=...
   ```
4. Restart the server. Changing either value signs out every session.

Never paste the password, hash or 2FA key into chat/issues. If you do, run `admin:setup` again and replace them.

In **production** the desk refuses to work unless both the hash and the 2FA secret are set. In dev only, a plain `ADMIN_PASSWORD` (16+ chars) is accepted as a fallback.

### What's protecting it

- Password stored as a **scrypt hash**, never plain text.
- **TOTP 2FA** (RFC 6238), each code is single-use (replay-proof).
- **Server-side sessions** in SQLite: 30 min idle / 8 h absolute timeout, max 5 sessions, bound to the browser's user-agent, killed when the password/2FA is rotated. `__Host-` + `HttpOnly` + `SameSite=Strict` cookie in production.
- **Lockouts that survive restarts**: 5 failed logins per IP per 15 min, plus 50 failed logins per hour site-wide (stops IP-rotating attackers). Failed logins take a randomised ~0.6-0.9 s and return one generic error.
- **Email alerts** for every successful login and every lockout (needs the Gmail env vars).
- **Security panel** in the ops desk: recent sign-ins, active sessions, "Sign out everywhere".
- Optional **`ADMIN_ALLOWED_IPS`**: everyone else gets a 404 for `/admin` and the login API.
- Admin pages and `/api/admin/*` are `no-store` + `noindex`; every mutating route checks Origin and the session.

### Public forms (booking + contact)

- **Per-IP limits** (`takeRateLimit`) plus **database-backed flood caps** that IP rotation can't dodge (`src/lib/abuse.ts`): 3 bookings / phone / day, 20 / hour overall, 4 messages / phone / day, 30 / hour overall. Tunable via env.
- **Honeypot** field (`BotGuard`): bots that fill it get a fake success and nothing is stored or sent.
- **Cloudflare Turnstile** (optional, free): set both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` to turn it on; fails closed.
- Request bodies are size-capped before parsing (`readJsonLimited`); user text is stripped of control characters before it reaches email headers.

### Client IP and rate limits

`clientIp()` never trusts the left side of `X-Forwarded-For` (clients can fake it). Set `TRUSTED_IP_HEADER` to the header your host overwrites:
Cloudflare `cf-connecting-ip` · Fly `fly-client-ip` · Vercel `x-vercel-forwarded-for`. Unset = right-most `X-Forwarded-For` hop (OK on Railway/Render).

### Headers

`next.config.ts` sets CSP, HSTS (prod), COOP/CORP, X-Frame-Options, a locked-down Permissions-Policy, and so on. The CSP deliberately allows inline scripts: a nonce-based CSP forces every page to render per request, which would throw away static caching (the cheapest defence against traffic floods).

### Tested attack scenarios

Verified with scripted tests in Nov 2026 (23 checks, all passing): wrong password / wrong or missing / replayed 2FA code, stolen cookie from another browser, foreign-Origin POSTs, spoofed `X-Forwarded-For` against the lockout, oversized bodies, honeypot hits, rotating-IP booking and contact floods, admin IP allowlist, cache headers. The test scripts were throwaway and aren't in the repo. Re-create them if you change the auth code.

---

## Environment variables

See [`.env.example`](./.env.example) for the full, commented list. Summary:

| Variable | Needed | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | prod | Public origin (canonicals, sitemap, CSRF origin allowlist) |
| `ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET` | prod | From `npm run admin:setup` |
| `TRUSTED_IP_HEADER` | prod, behind a CDN | Real-IP header for rate limits |
| `ADMIN_ALLOWED_IPS` | optional | Hide `/admin` from every other IP |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | recommended | Bot check on the forms |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `NOTIFY_EMAIL` | prod | Booking/inquiry/security emails (use an App Password) |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | optional | Customer SMS confirmations |
| `DATABASE_PATH` | prod | Persistent SQLite path (e.g. `/data/binbus.db`) |
| `BOOKING_MAX_*`, `INQUIRY_MAX_*` | optional | Flood-cap overrides |

`.env.local` is gitignored. Never commit it.

---

## Deploying

SQLite needs a **persistent disk**. Don't use Vercel's ephemeral filesystem for production bookings. Use Railway/Fly/a VPS with a volume (or move to Turso/Postgres).

Go-live checklist:

1. Set all production env vars on the host (table above). Generate **fresh** admin credentials; don't reuse dev ones.
2. Put the site behind **Cloudflare** (free plan): orange-cloud proxy on, a rate-limit rule on `/api/*`, only accept traffic from Cloudflare at the host, `TRUSTED_IP_HEADER=cf-connecting-ip`. This is the actual DDoS protection; app code can't absorb a flood.
3. Create a Turnstile widget and add its two keys.
4. Turn on **2FA** on the domain registrar, host, GitHub, Gmail and Twilio accounts (account takeover is a likelier path in than the site).
5. **Schedule `npm run db:backup`** and copy backups off the server. Restore = stop the app, copy a backup over the live DB, start again.
6. Run `npm audit --omit=dev` before each deploy.

---

## Project layout

```
src/
  app/                  pages + route handlers (App Router)
    api/admin/*         login, logout, security, bookings, blocked, settings, inquiries
    api/bookings        public booking endpoint
    api/contact         public inquiry endpoint
    api/availability    live calendar slots
    admin/              ops desk page
    globals.css         design tokens + all styles
  components/           UI (Header, Footer, BookingForm, ContactForm, AdminPanel, BotGuard, BrandMark, HeroCrest, ...)
  lib/
    auth.ts             admin sessions, lockouts, auth events
    password.ts totp.ts scrypt verify, TOTP verify
    security.ts         client IP, rate limit, origin check, body limit
    abuse.ts            DB-backed flood caps
    turnstile.ts        Cloudflare bot-check verify
    notify.ts           Gmail + Twilio
    booking.ts          availability + booking transaction
    constants.ts        business details, packages, prices
    db/                 SQLite schema + bootstrap
scripts/
  admin-setup.mjs       credential generator
  backup-db.cjs         DB backup
public/                 logo, images, llms.txt
```

---

## Known leftovers / to-do

- **Email + domain** are placeholders `hello@autocaredetailing.com.au` / `autocaredetailing.com.au` (`src/lib/constants.ts`, `src/lib/site.ts`, `.env.example`). Swap in the real ones.
- **ABN** is the placeholder `00 000 000 000`.
- **Google reviews** not linked yet (`googleReviewUrl`, `googleMapsUrl` in `constants.ts`; quotes in `src/lib/reviews.ts`).
- Old project name still in internals: DB file `data/binbus.db`, `binbus2026` in the weak-password list. Renaming the DB file would hide existing bookings, so migrate it deliberately.
- A few pre-existing `react-hooks/set-state-in-effect` lint errors (AdminPanel, AnimateIn, BookingForm, ThanksDetails). Not security-related.
- Dev-tool `drizzle-kit` has 4 moderate advisories; it's a dev dependency and never ships.

---

## Studio redesign (branch `claude-redesign`)

- **Live 3D hero** (`src/components/WashHero.tsx`, `src/lib/wash/*`). A real-time three.js car you wash by scrolling: dirty → snow foam → pressure rinse → gloss → callouts → showroom turntable. No video files.
  - Car model: `public/models/car.glb` (~135 KB, meshopt). Built in Blender from code: `tools/blender/car.py` (`pip install bpy`, then `python3 tools/blender/car.py out.glb preview.png`, then `npx @gltf-transform/cli optimize out.glb public/models/car.glb --compress meshopt --palette false`).
  - Dirt / foam / wet are a shader on the paint, not textures. Camera is a scroll cue list (`src/lib/wash/cues.ts`).
  - "Hold to wash" + synthesised pressure-washer sound (Web Audio, no audio files). Wireframe toggle. Paint picker. Cursor rotates the studio lighting.
  - Bloom + ACES + film grain. Pixel ratio and bloom step down automatically if fps drops under 40.
  - Falls back to a still photo if WebGL isn't available. `?snap` in the URL skips camera easing (for screenshots).
- New design system in `src/app/redesign.css` (loaded after `globals.css`, so it re-skins every page): black studio, bone type, one signal orange; Archivo (expanded) / Inter / JetBrains Mono, self-hosted from npm — no Google Fonts request.
- New header (fixed, mobile menu), footer, wordmark, homepage sections (size-aware package picker, donation feature, craft, steps, loyalty card, jobs, FAQ, final CTA).
- Donation popup removed; the 10% donation is now a full section on the homepage plus the existing page.
- Google reviews section only shows once reviews/rating are set (it used to show an owner note to the public).

### Car v3 (current hero car)
- `public/models/car.glb` is the Khronos **Car Concept** (Eric Chadwick / Darmstadt Graphics Group, **CC BY 4.0**), logos removed, black paint, black interior, orange calipers. Credit is in the footer and `public/models/CREDITS.txt` — keep both if you change the site (the licence requires attribution).
- Rebuild: take the model's `glTF` folder, clean the textures (see CREDITS.txt), then `gltf-transform copy → prune → resize 1024 → webp → quantize`. Don't run `simplify`: it opens the panel seams.
- Textures load through `<img>` (blob:) so the CSP `connect-src 'self'` stays strict.
- The earlier code-built cars (`tools/blender/coupe.py`, `gt.py`) are kept for reference.
- **Logo** is the orange droplet + "AUTO CARE / DETAILING" wordmark (`src/components/Wordmark.tsx`; images in `public/logo.png`, `logo-transparent.png`, `logo-mark.png`).

### Car + logo v2
- Hero car is now an original sports coupe (`tools/blender/coupe.py`): wing, orange calipers and rim lips, LED blades, splitter, diffuser, quad exhausts. Wheels are separate nodes and spin when the car rolls in on load.
- Stripes and the door decal are drawn by the paint shader, so they get dirty and foamed with the rest of the car. Foam has real thickness (vertex push), and water beads sit on the paint after the rinse.
- New logo from the same car (`public/logo.png`, `logo-transparent.png`, `logo-mark.png`), no third-party car or badge. Re-render with `python3 tools/blender/coupe.py out.glb car.png logo`.
- App icon / favicon: orange drop mark (`src/app/icon.png`, `apple-icon.png`, `favicon.ico`).

## History

- Rebranded Squeaky Solutions → **Auto Care Detailing**, new logo, new galaxy-black / seal-grey / sunrise-orange palette.
- Admin auth rebuilt (hash + 2FA + server-side sessions + persistent lockouts + alerts).
- Public-form abuse protection, security headers, Next.js upgraded to 16.4.6 to close known RCE advisories.

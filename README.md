# Squeaky Solutions

Brisbane mobile car-detailing site with a duck mascot, live AM/PM booking calendar, and a simple admin desk.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin](http://localhost:3000/admin)  
Default password is in `.env.local` (`ADMIN_PASSWORD`).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- SQLite via better-sqlite3 + Drizzle schema
- Cookie session for admin

## Notes

- SQLite file: `data/binbus.db` (gitignored). Override with `DATABASE_PATH` for a persistent volume.
- **Do not** rely on Vercel’s ephemeral filesystem for production bookings. Use Railway/Fly with disk, or Turso/Postgres.
- Nightly backup: `npm run db:backup` (writes `data/backups/`). Schedule it on the host.
- Brand, phone, email, ABN, and prices: `src/lib/constants.ts`
- Suburbs list: `src/lib/suburbs.ts`
- Admin: set **different** `ADMIN_PASSWORD` (≥16 chars) and `ADMIN_SECRET` (≥32 random chars) in `.env.local`
- Google reviews: create a [Google Business Profile](https://business.google.com), then paste `googleReviewUrl` / `googleMapsUrl` (and rating counts) into `src/lib/constants.ts`. Curated quotes go in `src/lib/reviews.ts`.

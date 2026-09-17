# Squeaky Clean

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

- SQLite file: `data/binbus.db` (gitignored)
- Brand, phone, email, ABN, and prices: `src/lib/constants.ts`
- Duck mascot: `src/components/SqueakyDuck.tsx`
- Suburbs list: `src/lib/suburbs.ts`
- Vercel filesystem is ephemeral — for production use Railway/Fly with disk, or Turso

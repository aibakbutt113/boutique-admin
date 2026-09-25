# boutique-admin

Admin panel for Fustan Jameel (Next.js). Talks to the NestJS API in `boutique-backend`; the storefront lives in `boutique-frontend`.

## Run it

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STORE_URL
npm install
npm run dev                  # http://localhost:3001
```

Log in at `/login` with the admin account seeded by the backend (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). The API must allow this origin via `ADMIN_URL` in its `.env`.

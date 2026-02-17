# MyModels.dev

Share the models you use for planning, building, and debugging.

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/)
- Supabase project
- GitHub OAuth App (for sign-in)

## Local Development

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables (see `.env.example` for details):

| Variable                        | Description                                                       |
| ------------------------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`                  | Supabase PostgreSQL connection string (use pooler URL, port 6543) |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (publishable) key                              |
| `NEXT_PUBLIC_APP_URL`           | App URL (default: `http://localhost:3000` for dev)                |

### 3. Supabase setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. **Authentication > URL Configuration**
   - Site URL: `http://localhost:3000` (development) or your production URL
   - Redirect URLs: Add `http://localhost:3000/auth/callback` (and your production callback URL)
3. **Authentication > Providers > GitHub**
   - Enable GitHub provider
   - Create a GitHub OAuth App with callback URL: `https://[project-ref].supabase.co/auth/v1/callback`

### 4. Database

Apply migrations and seed the model catalog:

```bash
pnpm db:push     # or: pnpm db:migrate
pnpm db:seed
```

### 5. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

### Build command

```
pnpm run build
```

### Environment variables

Set these in Vercel Project Settings:

- `DATABASE_URL` – Supabase connection pooling URL (port 6543)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` – Your production URL (e.g. `https://mymodels.dev`)

### Before first deploy

1. **Apply migrations** to your production database:

   ```bash
   DATABASE_URL="postgresql://..." pnpm db:migrate
   ```

2. **Seed the model catalog**:

   ```bash
   DATABASE_URL="postgresql://..." pnpm db:seed
   ```

3. **Supabase Auth**
   - Set Site URL and Redirect URLs in Supabase Dashboard to your production domain
   - Ensure GitHub OAuth App has the production callback URL

## Scripts

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `pnpm dev`         | Start development server (Turbopack) |
| `pnpm build`       | Build for production                 |
| `pnpm start`       | Start production server              |
| `pnpm lint`        | Run ESLint                           |
| `pnpm format`      | Format with Prettier                 |
| `pnpm db:generate` | Generate migrations from schema      |
| `pnpm db:migrate`  | Run migrations                       |
| `pnpm db:push`     | Push schema (dev only)               |
| `pnpm db:studio`   | Open Drizzle Studio                  |
| `pnpm db:seed`     | Seed model catalog                   |

### Lint (Next.js 16)

If `pnpm lint` fails with "Invalid project directory provided", this is a known Next.js 16 issue. The build (which includes type-checking) is the primary quality gate. You can run `eslint .` directly if you have a compatible flat config.

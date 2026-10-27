# Remix-test / mori

A small Japanese task manager built with **Remix 3**, **Cloudflare Workers**, **Cloudflare D1**, **Drizzle ORM**, and **Better Auth**.

## Features

- Email and password sign-up, sign-in, and sign-out
- Session cookies managed by Better Auth
- Task creation, completion, deletion, and filtering
- Per-user task isolation enforced by the API and database queries
- Persistent task storage in Cloudflare D1 through Drizzle ORM
- `/health` health-check endpoint

Email verification and password-reset email delivery are not configured yet. Accounts can sign in immediately after signing up. Add an email provider and enable verification before using this as a public production service.

The previous anonymous task table is preserved as `tasks_legacy_anonymous` during migration. Those old anonymous tasks are not automatically attached to a new account.

## Requirements

- Node.js 24.3.0 or newer
- A Cloudflare account with permission to create D1 databases and deploy Workers

## Local setup

### 1. Install dependencies and configure a local secret

```bash
npm install
cp .dev.vars.example .dev.vars
```

Generate a unique secret (32+ characters) and put it in `.dev.vars` as `BETTER_AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Do not commit `.dev.vars`. It is ignored by Git.

### 2. Create the D1 database

```bash
npx wrangler login
npm run db:create
```

Copy the `database_id` from Wrangler's output into `wrangler.jsonc`, replacing the all-zero placeholder in the `d1_databases` entry. Keep the binding name as `DB`.

### 3. Apply migrations locally

```bash
npm run db:migrate:local
```

This creates Better Auth's `user`, `session`, `account`, and `verification` tables, then rebuilds the task table with a foreign key to the authenticated user.

### 4. Run the Worker

```bash
npm run dev
```

Open the local URL printed by Wrangler (usually [http://localhost:8787](http://localhost:8787)). Create an account from the sign-in panel to start using mori.

## Deploy to Cloudflare

First update `database_id` in `wrangler.jsonc` with the real D1 database ID. Apply migrations to the remote database, store the Better Auth secret in Cloudflare, and deploy:

```bash
npm run db:migrate:remote
npx wrangler secret put BETTER_AUTH_SECRET
npm run deploy
```

When Wrangler prompts for the secret, use a generated random value with at least 32 characters. Keep the value private. The app derives its base URL from the incoming request by default, so it can work on the assigned Workers URL or a configured custom domain. Do not deploy with the example secret.

## Database and migrations

- `app/db/schema.ts`: Drizzle task schema, linked to Better Auth's user table
- `app/db/auth-schema.ts`: Drizzle definitions for Better Auth tables
- `app/auth.ts`: Better Auth configuration using the native D1 binding
- `drizzle/0000_create_tasks.sql`: initial task schema
- `drizzle/0001_create_better_auth_tables.sql`: Better Auth tables
- `drizzle/0002_scope_tasks_to_user.sql`: preserve the old anonymous table and create user-owned tasks

After changing a schema, generate and review a new migration:

```bash
npm run db:generate
npm run db:migrate:local
```

Then apply the reviewed migration remotely with `npm run db:migrate:remote`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Cloudflare Workers runtime |
| `npm run typecheck` | Run TypeScript checks |
| `npm run db:create` | Create the remote D1 database |
| `npm run db:generate` | Generate a SQL migration from the Drizzle schema |
| `npm run db:migrate:local` | Apply migrations to the local D1 emulator |
| `npm run db:migrate:remote` | Apply migrations to Cloudflare D1 |
| `npm run deploy` | Deploy the Worker |
| `npm run types` | Generate Workers environment types |

## Auth and API routes

Better Auth handles the `/api/auth/*` endpoints directly in the Worker. The UI uses:

- `POST /api/auth/sign-up/email` — create an account
- `POST /api/auth/sign-in/email` — sign in
- `GET /api/auth/get-session` — read the current session
- `POST /api/auth/sign-out` — sign out

Task endpoints require an authenticated session:

- `GET /api/tasks` — list the signed-in user's tasks
- `POST /api/tasks` — create a task with JSON `{"title":"..." }`
- `POST /api/tasks/:id/toggle` — toggle completion
- `POST /api/tasks/:id/delete` — delete a task
- `POST /api/tasks/clear-completed` — delete completed tasks
- `GET /health` — health check

The task API checks the session for each request and scopes every database operation to that user's ID. Mutating task endpoints also reject cross-origin requests.

## Notes

- User and session storage are managed by Better Auth and persisted in the same D1 database used by Drizzle.
- Task rows reference the Better Auth user with `ON DELETE CASCADE`, so database-level user deletion also removes that user's tasks.
- Sign-up is currently email/password only. No OAuth provider or email delivery service is configured.

# Remix-test / mori

A small Japanese task manager built with **Remix 3**, **Cloudflare Workers**, **D1**, and **Drizzle ORM**.

## Features

- Add, complete, and delete tasks
- Filter by all, active, or completed tasks
- Completion progress
- Persistent task storage in Cloudflare D1 through Drizzle
- Anonymous browser workspaces, isolated with an HTTP-only cookie
- `/health` health-check endpoint

There is no sign-in system. Each browser gets an anonymous workspace. Clearing that browser's cookies creates a new workspace; it does not recover the previous one.

## Requirements

- Node.js 24.3.0 or newer
- A Cloudflare account for creating a remote D1 database and deploying the Worker

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a D1 database

Log in to Cloudflare through Wrangler, then create the database:

```bash
npx wrangler login
npm run db:create
```

Copy the `database_id` from Wrangler's output into `wrangler.jsonc`, replacing the all-zero placeholder in the `d1_databases` entry. Keep the binding name as `DB`.

### 3. Apply the D1 migration

For the local development database:

```bash
npm run db:migrate:local
```

For the Cloudflare remote database:

```bash
npm run db:migrate:remote
```

### 4. Run locally

```bash
npm run dev
```

Open the local URL printed by Wrangler (usually http://localhost:8787).

### 5. Deploy

After setting your real D1 database ID and applying the remote migration:

```bash
npm run deploy
```

## Database workflow

The Drizzle schema lives in `app/db/schema.ts`. The initial D1-compatible SQL migration and Drizzle snapshot are committed in `drizzle/`.

When you change the schema:

```bash
npm run db:generate
npm run db:migrate:local
```

Review and commit the generated SQL and updated `drizzle/meta/` files. Apply it to the remote database with `npm run db:migrate:remote` when ready.

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

## API

- `GET /api/tasks` — list tasks for this anonymous browser
- `POST /api/tasks` — create a task with JSON `{"title":"..." }`
- `POST /api/tasks/:id/toggle` — toggle completion
- `POST /api/tasks/:id/delete` — delete a task
- `POST /api/tasks/clear-completed` — delete completed tasks
- `GET /health` — health check

Mutations are scoped to the browser's anonymous ID. The application does not expose the owner ID to the page, and task rows are filtered by that ID for every read and write.

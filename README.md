# Remix-test

A small Japanese task manager built with Remix 3 and plain browser APIs.

## Requirements

- Node.js 24.3.0 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For production-style startup:

```bash
npm start
```

Type-check the TypeScript files:

```bash
npm run typecheck
```

## Features

- Add, complete, and delete tasks
- Filter by all, active, or completed tasks
- View completion progress
- Save tasks in the browser's local storage
- Health endpoint at `/health`

Task data stays in the current browser. There is no account or server-side database.

# WORK IN PROGRESS

# Prerequisites

- NodeJs >v.16
- npm
- Docker (running)

# Install locally

Run `npm install`

# Setup PRISMA
1. Generate client: `npx prisma generate` (also executed automatically after `npm install`)
2. Migrate database:
2.1: Non-Prod: npx prisma migrate dev
2.2: Prod: npx prisma migrate deploy

# Run locally

Options to run locally:

- `npm run dev`: Starts the database and the app. Initially migrates and seeds database and in case of schema changes.
- `npm run dev:clean`: Starts the database and the app. Always cleans and seeds the database.

Open http://localhost:3000 in browser

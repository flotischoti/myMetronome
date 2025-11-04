# About

This repository contains the source for [metronomes.xyz](http://www.metronomes.xyz)

This project was created as a use case to familiarize myself with nextjs and solve a problem which I faced as musician when practicing different songs or excercises at the same time: Remembering the progress of each song or excercise with a distinguished metronome.

# Prerequisites

- Node.js >v.16
- npm
- Postgres database
- Docker (optional)

# Install locally

Run `npm install`

Create .env file with following values according to .env.local.template

# Setup PRISMA

1. Generate client: `npx prisma generate` (also executed automatically after `npm install`)
2. Migrate database (database must be up and running):

- Non-Prod: `npx prisma migrate dev` or `npm run migrate`
- Prod: `npx prisma migrate deploy`

3. Seed data (optional)
   `npm run seed`

# Run locally

### Development mode

`npm run dev`

### Production mode

1. `npm run build`
2. `npm run start`

Open http://localhost:3000 in browser

# Vercel build/deploy pipelines

- dev (preview) build: push to dev branch
- prod build: accepted merge request to master branch

# Using docker

The following npm scripts can be used to setup docker:

- `npm run docker:create`: Create container based on postgres image
- `npm run docker:start`: Start container

# About

This repository contains the source for [metronomes.xyz](http://www.metronomes.xyz)

The project was created as a use case to familiarize myself with nextjs and solve a problem which I faced as musician when practicing different songs or excercises at the same time: Remembering the progress of each song or excercise with a distinguished metronome.

The app is run on vercel facilitating the default CI/CD integration with GitHub.

The repository also contains code to setup Azure cloud via Terraform and deploy the app via GitHub workflow as a containerized application (deactivated by default).

# Prerequisites

- Node.js >v.16
- npm
- Postgres database
- Docker (optional)

# Install locally

Run `npm install`

This will also run `npx prisma generate` as postinstall to generate prisma client which is used for all database operations. Caution: The prisma client will use the connection string from environemnt variable `POSTGRES_PRISMA_URL`. Make sure it always points to the right database instance.

Create .env file and copy content from env.local.template.
Make sure that postgres user, password and database are the same as in the docker compose files to successfully connect to the local database container. By default, no change needed from env.local.template.

# Run locally

## Development mode

### Run App

To start the app locally run the following npm script:

`npm run dev`

Open http://localhost:3000 in browser

### Run Database on Docker

To start and stop a local postgres instance within a docker container run the following npm scripts:

- `npm run dev:db:start`: Starts a database container and migrates the database
- `npm run dev:db:stop`

## Production mode

### Docker Fullstack

The app can be built as a docker image and run in a container together with the database using the following npm scripts:

- `npm run docker:up:build`: Builds the image from Dockerfile via docker-compose and additionally runs a container for the app and the database.
- `npm run docker:up`: Runs the previously built docker images as containers without building

Open http://localhost:3000 in browser

- `npm run docker:down`: Stops and removes the containers and network

### Docker partial stack

To only run the app outside of docker run the following npm scripts:

1. `npm run build`: Builds the app
2. `npm run start`: Runs the app

Open http://localhost:3000 in browser

See

# Vercel build/deploy pipelines

- dev (preview) build: push to dev branch
- prod build: accepted merge request to master branch

# Debug in VSCode

### Application

Run any of the Launch configurations in `launch.json`:

- Next.js: debug full stack
- Next.js: debug server-side
- Next.js: debug client-side

### Tests

- Write `debugger` where you want to add a breakpoint
- Run tests with `node --inspect-brk ./node_modules/jest/bin/jest.js --runInBand` (Optional arguments like -t "Test name" can be added)
- Run launch configuration `Attach debugger to Jest`

# Setup PRISMA

When running on docker - locally and remote - no manual Prisma setup should be necessary. Prisma client is generated and database is migrated automatically.

Optionally, manual PRISMA setup steps are:

1. Generate client: `npx prisma generate` (also executed automatically after `npm install`)
2. Migrate database (database must be up and running):

   - Non-Prod: `npm run db:migrate`
   - Prod: `npx prisma migrate deploy`

3. Seed data (optional)
   `npm run db:seed`

4. Reset the database (optional)

   `npm run db:reset`: This will delete all data and reset the database to the inital migration state.

# Server Documentation

## Overview

This document describes the server component of the Campus-Trade-Deep application. The server implements a REST API built with Express and PostgreSQL and provides authentication, listings, categories, messaging, reviews, search, statistics, and user management.

Project layout (server folder):

- `src/` : application source code
  - `server.js` : app entry point
  - `db.js` : database connection helper
  - `middleware/` : Express middleware (including `auth.js`)
  - `routes/` : route handlers (see list below)
- `schema.sql`, `setup.sql`, `seed.sql` : database schema and seed data
- `package.json` : npm scripts and dependencies

## Quick Start

- Install dependencies:

  npm install

- Create a PostgreSQL database and run schema/setup/seed SQL files (example using `psql`):

  psql -U <dbuser> -d <dbname> -f setup.sql
  psql -U <dbuser> -d <dbname> -f schema.sql
  psql -U <dbuser> -d <dbname> -f seed.sql

- Configure environment variables (create a `.env` file at the project root):

  PORT=4000
  DATABASE_URL=postgres://user:password@host:port/dbname
  JWT_SECRET=your_jwt_secret
  GOOGLE_CLIENT_ID=optional_google_client_id
  GOOGLE_CLIENT_SECRET=optional_google_client_secret

- Start the server in development mode:

  npm run dev

- Start in production mode:

  npm start

Notes: The project's `package.json` exposes `start` and `dev` scripts. `dev` runs `nodemon src/server.js` and `start` runs `node src/server.js`.

## Environment variables

- **PORT**: Port the server listens on (default commonly 3000 or 4000).
- **DATABASE_URL**: Full Postgres connection string or individual Postgres env vars (`PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`).
- **JWT_SECRET**: Secret used to sign JWT access tokens.
- **GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET**: If Google auth is used.

Place sensitive values into `.env` and do not commit it.

## Database

- SQL files:
  - `setup.sql` : initial database creation steps and role setup (run first)
  - `schema.sql` : table definitions, constraints and indexes
  - `seed.sql` : sample data for development

- The server uses the `pg` client and reads the connection from `DATABASE_URL` or standard PG env vars.

## Authentication & Middleware

- `src/middleware/auth.js` protects routes and validates JWTs. Use the `Authorization: Bearer <token>` header for protected endpoints.
- Passwords are hashed with `bcrypt` and tokens are issued using `jsonwebtoken`.

## Routes / Endpoints (high-level)

The server exposes route modules mounted under path segments that match the filenames in `src/routes`. Typical endpoints implemented include:

- `auth` (`/auth`)
  - `POST /auth/register` : create new user
  - `POST /auth/login` : login with email/password
  - `POST /auth/google` : sign-in with Google (if implemented)
  - `GET /auth/me` : get current user (protected)

- `users` (`/users`)
  - `GET /users` : list users (admin)
  - `GET /users/:id` : get user profile
  - `PUT /users/:id` : update user

- `categories` (`/categories`)
  - `GET /categories` : list categories
  - `POST /categories` : create category (auth/admin)

- `listings` (`/listings`)
  - `GET /listings` : list/filter listings
  - `GET /listings/:id` : get listing
  - `POST /listings` : create listing (protected)
  - `PUT /listings/:id` : update listing (owner/protected)
  - `DELETE /listings/:id` : delete listing (owner/protected)

- `messages` (`/messages`)
  - `GET /messages` : list messages for a user (protected)
  - `POST /messages` : send a message

- `reviews` (`/reviews`)
  - `GET /reviews` : list reviews
  - `POST /reviews` : add review (protected)

- `search` (`/search`)
  - `GET /search` : query listings and/or categories

- `statistics` (`/statistics`)
  - `GET /statistics` : aggregate metrics (views, counts, etc.)

These are high-level endpoint descriptions. For the exact route signatures and request/response shapes, inspect the route files under `src/routes/`.

## Errors & Validation

- The server returns standard HTTP status codes. Validation errors typically return `4xx`, server faults `5xx`.
- Ensure client-side requests include the correct headers and JSON body as required by each endpoint.

## Dependencies (high level)

- `express` — web framework
- `pg` — Postgres client
- `bcrypt` — password hashing
- `jsonwebtoken` — JWT handling
- `cors` — CORS support
- `dotenv` — environment variables
- `google-auth-library` — (optional) Google sign-in

Dev dependencies:

- `nodemon` — auto-reload during development

## Logging & Debugging

- Run `npm run dev` to start the server with `nodemon`.
- Add `console.log` or use a logger wrapper to capture request/response details while debugging.

## Deploying / Production notes

- Use a process manager (PM2, systemd) or container orchestration to run `npm start` in production.
- Ensure environment variables are injected securely and the database is reachable from the host.
- Use HTTPS in front of the API and rotate `JWT_SECRET` as needed.

## Contributing / Extending

- Routes are implemented in `src/routes/` — add a new file and mount it in `src/server.js`.
- Use `src/middleware/auth.js` to protect routes that require authentication.

## Useful file references

- Server entry: [server/src/server.js](server/src/server.js#L1)
- Database helper: [server/src/db.js](server/src/db.js#L1)
- Auth middleware: [server/src/middleware/auth.js](server/src/middleware/auth.js#L1)
- Routes folder: [server/src/routes](server/src/routes)
- SQL schema: [server/schema.sql](server/schema.sql#L1)

## Next steps I can help with

- Generate an OpenAPI/Swagger spec for the endpoints
- Produce example cURL requests or Postman collection
- Add types/validation (e.g., Joi/Zod) to routes

---
Generated by the project assistant to document the `server` component. If you want the OpenAPI spec or cURL examples next, tell me which routes to prioritize.

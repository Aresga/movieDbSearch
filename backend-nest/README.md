# backend-nest

Core API gateway and business backend for the project.

This service is the main HTTP entry point for clients. It handles authentication, user and social features, movie-facing APIs, real-time chat integration, and orchestration of AI-powered features exposed by the Python backend.

## What this service does

The NestJS backend is responsible for:

1. Authentication and session management
2. User profiles and social features
3. Movie APIs such as search passthrough, details, trending, reviews, wishlist, and watched list
4. Real-time messaging through Socket.IO
5. Orchestration of semantic search, recommendations, and sentiment analysis through the Python service
6. Observability, request validation, and API protection

## High-level architecture

At startup, the service initializes framework modules and external integrations:

- PostgreSQL access via Prisma
- MongoDB connection for chat and message data
- Prometheus metrics and custom HTTP latency histogram
- Global throttling guard for rate limiting
- Vault-backed secret loading before Nest bootstrap
- Swagger documentation under the global API prefix

The startup flow is defined in [src/main.ts](src/main.ts) and the module composition is in [src/app.module.ts](src/app.module.ts).

### Startup sequence

1. Load `.env` if present.
2. Fetch secrets from Vault and inject them into `process.env`.
3. Create the Nest application.
4. Register the global `api` prefix, excluding `/metrics`.
5. Enable cookie parsing and trust proxy mode.
6. Configure CORS from `ALLOWED_ORIGINS`.
7. Install the global validation pipe.
8. Mount Swagger at `/api/docs`.
9. Start listening on `0.0.0.0:3000`.

## Request flow

### 1. Semantic search passthrough

When a client calls `GET /api/search?q=...`, the service:

- Validates that `q` is present
- Reads the authenticated user id if a valid access token is available
- Calls the Python backend `/search` endpoint using `AI_SERVICE_URL`
- Returns the normalized search results to the client

This flow is implemented in [src/app.controller.ts](src/app.controller.ts) and [src/app.service.ts](src/app.service.ts).

### 2. Recommendations

When a client calls `GET /api/recommendations` with a valid JWT, the service:

- Reads the authenticated user id from the access token
- Calls the Python backend `/recommendations/{user_id}` endpoint
- Returns ranked recommendations to the client

### 3. Sentiment analysis

The review flow can call the Python `/sentiment` endpoint through [AppService.analyzeSentiment](src/app.service.ts).

If sentiment inference fails, review creation is intentionally non-blocking and continues without a result.

### 4. Movie metadata

The service also exposes local movie endpoints backed by Prisma and TMDB integrations:

- `GET /api/movie/:id`
- `GET /api/movie/:id/full`
- `GET /api/trending`

## ML orchestration

NestJS does not run ML models directly. It orchestrates the Python service and keeps client-facing concerns in this process.

### Python service calls

The app service uses `AI_SERVICE_URL` to call:

- `/search` for semantic search
- `/recommendations/{user_id}` for recommendations
- `/sentiment` for review sentiment analysis

This keeps the ML stack isolated in the Python service while the Nest app stays focused on business logic and HTTP orchestration.

## Authentication

Authentication is cookie-based with JWT access and refresh tokens.

### Login flow

The login route is [src/auth/auth.controller.ts](src/auth/auth.controller.ts):

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### OAuth flow

OAuth support is available for:

- Google
- GitHub

The relevant routes are:

- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/github`
- `GET /api/auth/github/callback`

### Token storage

- `access_token` is stored as an HTTP-only cookie on the root path
- `refresh_token` is stored as an HTTP-only cookie scoped to `/api/auth/refresh`
- Both cookies are set with `secure: true` and `sameSite: lax`

### Two-factor behavior

If a user requires 2FA, login returns a short-lived partial access cookie and defers issuing the refresh token until 2FA is completed.

## Social and profile features

### User profile endpoints

The user controller exposes:

- `GET /api/user/me`
- `POST /api/user/me/avatar`
- `PATCH /api/user/me`
- `PATCH /api/user/me/email`
- `PATCH /api/user/me/password`
- `POST /api/user/me/password`
- `DELETE /api/user/me`
- `GET /api/user/me/export`
- `GET /api/user/:id`

### Friends endpoints

The friends controller exposes:

- `GET /api/friends`
- `POST /api/friends/:id`
- `DELETE /api/friends/:id`
- `GET /api/friends/:id`

### Wishlist endpoints

The wishlist controller exposes:

- `GET /api/wish`
- `GET /api/wish/user/:userId`
- `GET /api/wish/status/:movieId`
- `POST /api/wish/:movieId`
- `DELETE /api/wish/:movieId`

### Watched list endpoints

The watched list controller exposes:

- `GET /api/watched`
- `GET /api/watched/user/:userId`
- `GET /api/watched/status/:movieId`
- `POST /api/watched/:movieId`
- `DELETE /api/watched/:movieId`

### Reviews endpoints

The reviews controller exposes:

- `GET /api/reviews/:movieId`
- `GET /api/reviews/user/:userId`
- `POST /api/reviews/:movieId`
- `POST /api/reviews/:movieId/edit`
- `DELETE /api/reviews/:movieId`

## Real-time chat

The gateway module uses Socket.IO for live messaging and presence updates.

### What it does

- Authenticates sockets using access tokens from auth headers or cookies
- Marks users online and offline in PostgreSQL
- Notifies friends when a user changes presence
- Broadcasts room messages
- Marks rooms as read

### Socket events

Important events handled by the gateway include:

- `joinRoom`
- `leaveRoom`
- `sendMessage`
- `markRoomAsRead`
- `receiveMessage`
- `receiveMessageNotification`
- `friendStatus`
- `markAsRead`

### Connection behavior

A socket connection is rejected if no token can be found. The gateway then verifies the JWT and uses the user id to track online state.

## Modules

Main module wiring is in [src/app.module.ts](src/app.module.ts). Feature areas include:

- `auth/`
- `twofactorauth/`
- `user/`
- `friends/`
- `review/`
- `wishlist/`
- `watchedlist/`
- `gateway/`
- `message/`
- `tmdb/`
- `email/`
- `metrics/`
- `prisma/`

## API surface summary

Representative endpoints from the main controller:

- `GET /api/health`
- `GET /api/search`
- `GET /api/movie/:id`
- `GET /api/movie/:id/full`
- `GET /api/trending`
- `GET /api/recommendations`

Additional routes are exposed by the feature modules listed above.

## Observability

Prometheus instrumentation is configured through [@willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus):

- Default runtime metrics are enabled
- Custom histogram `http_request_duration_seconds` is registered
- Scrape endpoint is exposed at `/metrics`

Swagger is enabled in [src/main.ts](src/main.ts):

- Internal docs route: `/api/docs`
- Mounted with the global `api` prefix

## Configuration

This service reads environment variables directly and also merges secrets loaded from Vault during bootstrap.

### Required values

- `DATABASE_URL`
- `POSTGRES_USER`
- `POSTGRES_DB`
- `MONGO_URI`
- `JWT_SECRET`
- `AI_SERVICE_URL`

### Common optional values

- `VAULT_ADDR` - defaults to `http://vault:8200`
- `ALLOWED_ORIGINS` - comma-separated CORS origins, defaults to `https://localhost`
- `JWT_EXPIRES_IN` - defaults to `15m`
- `JWT_REFRESH_EXPIRES_IN` - defaults to `7d`
- `THROTTLE_TTL_MS` - defaults to `60000`
- `THROTTLE_LIMIT` - defaults to `120`
- `FRONTEND_URL` - used for OAuth redirects
- `GOOGLE_CLIENT_ID` - Google OAuth client id
- `GITHUB_CLIENT_ID` - GitHub OAuth client id
- SMTP values used by the email module

### Runtime behavior

- Global route prefix is `api` except for the Prometheus metrics endpoint
- CORS origins are controlled via `ALLOWED_ORIGINS`
- `trust proxy` is enabled for reverse-proxy deployments
- Cookie parsing is enabled globally
- The validation pipe uses `whitelist`, `forbidNonWhitelisted`, and `transform`

## Throttling

The app uses `@nestjs/throttler` as a global guard.

### What it does

- Limits how many requests a client can make within a time window
- Helps protect login, auth, and public endpoints from brute-force and spam traffic
- Reduces accidental overload from aggressive clients or repeated retries

### Current configuration

In [src/app.module.ts](src/app.module.ts), the throttler is configured from config values:

- `THROTTLE_TTL_MS` controls the time window in milliseconds
- `THROTTLE_LIMIT` controls how many requests are allowed in that window

If the env vars are missing, the defaults are:

- `ttl = 60000`
- `limit = 120`

### Practical effect

With the defaults, one client can make up to 120 requests per 60 seconds before the guard starts returning HTTP 429 responses.

## Bootstrap and secrets

The bootstrap code in [src/main.ts](src/main.ts) loads Vault secrets before Nest starts.

### Sequence

1. Load `.env` if it exists in the current working directory.
2. Fetch secrets from Vault through [src/common/vault.loader.ts](src/common/vault.loader.ts).
3. Merge those secrets into `process.env`.
4. Start the Nest application.

This means runtime secrets can come from Vault instead of being stored directly in the repository or baked into the image.

## Database access

### PostgreSQL

Prisma is the main relational data access layer. [src/prisma/prisma.service.ts](src/prisma/prisma.service.ts) connects to `DATABASE_URL` and handles connect/disconnect lifecycle events.

### MongoDB

MongoDB is used for the chat and message domain through Mongoose.

## Running the service

### With Docker

This repository runs the Nest service through the project-level compose files.

### Locally

From `backend-nest/`:

```bash
npm install
npm run start:dev
```

The service listens on `0.0.0.0:3000`.

## Troubleshooting

- If `/api/search` fails, check that `AI_SERVICE_URL` points to the Python backend.
- If auth cookies are missing, confirm that HTTPS and `secure: true` cookies are supported in your environment.
- If the app boots but requests are rejected early, check `THROTTLE_TTL_MS` and `THROTTLE_LIMIT`.
- If Swagger is not reachable, confirm the global prefix and the `/api/docs` path.

## Notes

- NestJS is the system-facing backend entrypoint.
- FastAPI remains the AI compute service; NestJS orchestrates it for client-facing flows.
- For full-stack behavior, read the root project README and the Python backend README.

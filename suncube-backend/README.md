# Suncube AI - Backend

TypeScript backend service for the Suncube Customer Portal.

## Stack
- **Node.js** + **Fastify**
- **PostgreSQL** + **Knex** (Migrations)
- **Redis** + **BullMQ** (Jobs)
- **S3** Compatible Storage

## Setup

1. **Environment**:
   Copy `.env.example` to `.env`.
   ```bash
   cp .env.example .env
   ```

2. **Docker Dev**:
   Start Postgres, Redis, and MinIO.
   ```bash
   docker-compose up -d
   ```

3. **Install Deps**:
   ```bash
   npm install
   ```

4. **Migrations**:
   Apply SQL schema.
   ```bash
   npm run migrate
   ```

5. **Bootstrap Admin**:
   Create initial admin user.
   ```bash
   npx ts-node scripts/db_bootstrap.ts
   ```

6. **Run**:
   ```bash
   npm run dev
   ```

## Integrations (Supabase)

This project uses adapter patterns to easily swap for Supabase.

*   **Database**: The migrations are standard SQL. You can run them in Supabase SQL Editor.
*   **Auth**: In `src/plugins/auth.ts`, replace `fastify-jwt` with logic that verifies Supabase tokens using their JWKS or Secret.
*   **Storage**: In `src/plugins/s3.ts`, replace the AWS SDK client with `supabase.storage`.

## Serverless

Templates for Edge/Lambda functions are in `serverless/`.

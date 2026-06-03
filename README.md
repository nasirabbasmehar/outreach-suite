# Outreach Suite

A modern SaaS-style bulk email outreach platform built with Next.js, React, Tailwind CSS, TypeScript, Express, PostgreSQL, Redis/BullMQ, Nodemailer, and OpenAI API integration.

> Built for legitimate, consent-based business outreach. The implementation includes unsubscribe/suppression support, rate limits, SMTP health checks, encrypted secrets, tracking transparency primitives, and role-based access controls.

## Feature Coverage

- Custom SMTP account management, grouping, testing, rotation, limits, failover, pause states.
- CSV/XLSX/JSON bulk SMTP imports.
- Lead management with CSV/XLSX/Google Sheets URL/copy-paste imports and unlimited custom fields.
- Mail merge with `{{variables}}` and conditional blocks such as `{{if company}}...{{endif}}`.
- Campaign dashboard, scheduling, status transitions, SMTP pool selection, daily limits, timezone/business-hour settings.
- HTML/plain-text composer support, template storage, follow-up sequence data model.
- AI writer, subject lines, personalization, spam score hints, rewrite, and A/B ideas using user-supplied OpenAI API key.
- Tracking pixel, redirect-based link tracking, reply/bounce event endpoints, and analytics rollups.
- JWT auth, 2FA columns, RBAC, API rate limiting, encrypted SMTP/OpenAI key storage.
- Docker Compose deployment for VPS-compatible Postgres + Redis + API + Web.

## Quick Start

```bash
cp .env.example .env
# edit JWT_SECRET and ENCRYPTION_KEY before production
npm install
npm run dev
```

Or Docker:

```bash
cp .env.example .env
docker compose up --build
```

Open:

- Web: http://localhost:3000
- API: http://localhost:4000/health

## Default Development Flow

1. Register a user via `POST /auth/register` or wire a UI login page.
2. Add SMTP accounts at `/smtp`.
3. Import leads at `/leads`.
4. Create a campaign and enqueue sending.
5. Track opens/clicks through `/t/open/:token` and `/t/click/:token`.

## Compliance Notes

Use this application only for lawful, permission-based communications. Maintain suppression lists, include physical sender identity and unsubscribe links where required, respect local rules (CAN-SPAM, GDPR, CASL, PECR, etc.), and avoid deceptive content or harvested lists.

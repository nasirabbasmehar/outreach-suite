# Security and Deliverability Notes

This project is designed for legitimate, consent-based outreach and transactional/business communications.

## Security Controls Implemented

- JWT authentication with HTTP-only cookie support.
- Role-based access control: `ADMIN`, `MANAGER`, `TEAM_MEMBER`.
- API rate limiting with `express-rate-limit`.
- HTTP security headers via Helmet.
- AES-256-GCM encryption for SMTP passwords and user-supplied OpenAI API keys.
- PostgreSQL-backed suppression list for unsubscribes.
- 2FA schema and bootstrap endpoint ready for TOTP implementation.

## Deliverability Controls Implemented

- Per-SMTP hourly and daily sending limits.
- SMTP grouping and rotation.
- Automatic failover if one SMTP account is unavailable.
- SMTP verification endpoint and health status tracking.
- Pause/resume for problematic SMTP accounts.
- List-Unsubscribe header and tracked unsubscribe URL.
- Bounce and reply event endpoints.
- AI spam-score analysis prompt that checks trigger words and recommendations.

## Production Checklist

- Use a strong `JWT_SECRET` and `ENCRYPTION_KEY`; never commit production `.env` files.
- Configure SPF, DKIM, and DMARC for every sender domain.
- Warm up new SMTP accounts gradually.
- Use verified, permission-based lead sources and keep suppression lists indefinitely.
- Add a physical sender identity and unsubscribe language where applicable.
- Respect CAN-SPAM, GDPR, CASL, PECR, and local data protection laws.
- Add webhook authentication/signatures to `/t/bounce` and `/t/reply` before public production use.
- Replace the dev 2FA placeholder with TOTP QR generation and verification.
- Run `npm audit` and upgrade dependencies regularly.

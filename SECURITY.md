# SECURITY.md — Checklist

## Secrets
- [ ] No keys in code. Use `.env.local`; commit only `.env.example`.
- [ ] `.env*` in `.gitignore`.
- [ ] Only `NEXT_PUBLIC_` vars are browser-safe (Supabase URL + anon key). Service role key NEVER in client code.

## Auth & access
- [ ] Supabase Auth (email/password or magic link).
- [ ] Protected routes check session on the server.
- [ ] RLS enabled on every table; policies scoped to `auth.uid()`.
- [ ] No security that depends on hiding UI.

## Input & API
- [ ] Validate all input server-side (zod).
- [ ] Server actions / route handlers check auth first.
- [ ] Rate-limit sensitive endpoints (login, writes) where possible.

## Errors & data
- [ ] No stack traces or DB errors shown to users.
- [ ] Generic error messages in Hindi; details only in server logs.
- [ ] Mic/voice audio is processed in-browser, not stored.

## Headers / deploy
- [ ] Security headers (CSP, X-Frame-Options, Referrer-Policy) in `next.config`.
- [ ] `npm audit` before each release.

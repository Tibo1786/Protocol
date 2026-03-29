# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Rules Register — B2B SaaS decision engine. Organisations manage business rules in YAML format;
the evaluation API matches JSON payloads against those rules in real time.
Target: compliance teams, ops managers, non-technical users.

## Stack

- Next.js 15 (App Router), TypeScript strict mode
- Prisma ORM → PostgreSQL (Supabase)
- BetterAuth (auth + orgs + RBAC)
- Tailwind CSS + shadcn/ui
- Deployed on Vercel

## Commands

- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npm run db:push` — push schema changes (dev only)
- `npm run db:migrate` — create migration (production)
- `npm run typecheck` — tsc --noEmit
- `npm run lint` — eslint

## Architecture

- `src/lib/engine.ts` — pure rule evaluation logic, no framework deps
- `src/app/api/evaluate/` — public decision API (core product)
- `prisma/schema.prisma` — single source of truth for data model
- Multi-tenancy via Postgres RLS + `organisation_id` on every table
- Auth routes handled by BetterAuth under `src/app/api/auth/`

## Code Rules

- TypeScript strict mode, no `any`
- Named exports only, no default exports
- Every API route validates the session and resolves org from auth claims
- Never trust client-supplied organisation_id — always derive from session
- Engine functions in `src/lib/engine.ts` must be pure (no DB calls, no side effects)

## Key Gotchas

- RLS policies live in `prisma/migrations` — don't bypass with service role key
- Rule conditions use dot-notation field paths: `user.age`, `transaction.amount`
- The evaluate API must return `matched`, `action`, `conditions`, and `rule_id`
- See `docs/api.md` for the full evaluate API contract before touching that route

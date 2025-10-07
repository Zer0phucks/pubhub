# Repository Guidelines

## Project Structure & Module Organization
PubHub is a Vite-powered React dashboard. Core UI and business logic live in `src/`, with feature components under `src/components`, shared context providers in `src/contexts`, utilities in `src/utils`, and Supabase client helpers in both `src/utils/supabase` and `lib/supabase`. API request handlers that back the dashboard sit in `api/`, while the Hono gateway for server-side AI endpoints is defined in `server.ts`. Database schemas and SQL seeds are in `supabase/`, and `scripts/setup.sh` bootstraps local Supabase resources. Keep media and design artifacts within `src/assets` and Tailwind themes in `src/styles`.

## Build, Test, and Development Commands
- `npm install` – install all frontend, Supabase, and AI dependencies.
- `./scripts/setup.sh` – provision local Supabase schema, storage buckets, and edge functions.
- `npm run dev` – launch the Vite dev server on port 5173/3000 for the React app.
- `npm run dev:server` – start the Hono API on port 3001 (AI, auth, ingestion endpoints).
- `npm run dev:all` – run frontend and API servers concurrently; the fastest loop for feature work.
- `npm run build` – produce an optimized production bundle and type-check via Vite/TSX.

## Coding Style & Naming Conventions
Follow the existing TypeScript-first approach with 2-space indentation and Prettier-compatible formatting. Name React components and files in PascalCase (`src/components/UnifiedInbox.tsx`), hooks in camelCase (`useAuthSession`), and utility modules with kebab or snake case only when matching folders (`supabase/functions`). Compose UI strictly with Tailwind utility classes plus shadcn/ui primitives found in `src/components/ui`. Keep shared types in `src/types`, and isolate Supabase queries in the helper modules rather than React components.

## Testing Guidelines
Automated tests have not been formalized yet; until the Vitest + React Testing Library stack lands, document manual QA steps for every change. Use the flows in `claudedocs/auth-testing-guide.md` as a baseline, and expand them for new features. When introducing automated coverage, co-locate specs under `src/__tests__` or alongside components, and wire an `npm test` script so the suite can run in CI. Always state data prerequisites (mock Supabase records, env vars) in your PR description.

## Commit & Pull Request Guidelines
Follow the conventional commits style visible in history (`feat:`, `fix:`, `chore:`, etc.) and keep subjects under ~70 characters. Group related changes per commit and include context in the body when touching Supabase schema or AI configuration. Pull requests should summarize the change, link any tracked issue, list environment or schema updates, and attach UI screenshots or console traces when affecting the dashboard. Finish by outlining verification steps others can repeat (`npm run dev:all`, auth signup flow, etc.).

## Security & Configuration Tips
Never commit `.env*` files or Supabase secrets. Reference `.env.example`, and document any new key in AI or Supabase guides. When debugging, prefer seeded test accounts and avoid logging sensitive payloads from `api/auth` routes.

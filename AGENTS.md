# Repository Guidelines

## Project Structure & Module Organization
Application code lives under `src`, with feature UI built from `components` and route-level logic in `pages`. Shared helpers sit in `lib` and `utils`; Vitest fixtures reside in `src/test`. Static assets and the HTML shell are under `public`, while build output drops into `build`. Supabase edge functions are tracked in `supabase/functions`, and configuration for tooling is in repo-level `.ts` config files such as `vite.config.ts` and `vitest.config.ts`.

## Build, Test, and Development Commands
Install dependencies with `npm install`. Use `npm run dev` for a Vite-powered development server at `http://localhost:5173`. `npm run build` performs a production bundle into `build`, and `npm run test` starts the Vitest watcher. Run `npm run test:coverage` to collect coverage reports in `coverage/`, and `npm run test:ui` opens the Vitest UI when you need interactive debugging.

## Coding Style & Naming Conventions
All TypeScript and TSX files are formatted with two-space indentation. Components and hooks follow PascalCase (`FeedItem.tsx`) and camelCase (`useProject`). Co-locate styles using Tailwind utility classes inside JSX. Prefer named exports for shared modules and include succinct inline comments only where logic is non-obvious. Align imports using absolute paths resolved from `src` as configured by Vite.

## Testing Guidelines
Vitest and Testing Library power unit tests located in `__tests__` folders alongside the code they cover (for example, `src/components/__tests__/Feed.test.tsx`). Name files with the `.test.ts` or `.test.tsx` suffix to ensure they are discovered automatically. Each test should assert user-facing behavior rather than implementation details, and new functionality should ship with coverage that keeps `npm run test:coverage` passing.

## Commit & Pull Request Guidelines
Follow Conventional Commit prefixes observed in history (`feat:`, `refactor:`, `fix:`). Keep subject lines under 72 characters and include relevant scope detail when practical. For pull requests, provide a concise summary, reference related issues, list manual or automated test commands executed, and attach UI screenshots or GIFs when visual changes occur. Ensure CI-friendly commands (`npm run build`, `npm run test`) pass before requesting review.

## Environment & Integration Notes
Secrets and API keys belong in a local `.env` file consumed by Vite (use the `VITE_` prefix). Supabase edge functions in `supabase/functions` should remain deploy-ready; coordinate schema updates with the backend team before merging. When integrating Clerk or other third-party services, update the relevant setup docs under `src` (for example, `CLERK_SETUP.md`) so downstream agents stay in sync.

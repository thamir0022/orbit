# Orbit repository guide

## Product and repository map

Orbit is an in-development, multi-tenant team-workspace SaaS. Its implemented
areas include authentication and sessions, authorization, workspaces and
memberships, projects, teams, sprints, work items/stories, documents, mail, and
platform administration. The repository is a pnpm workspace; despite the root
README mentioning Turborepo, there is no Turbo configuration or Turbo script.

| Path                   | Responsibility                                                                  |
| ---------------------- | ------------------------------------------------------------------------------- |
| `apps/api`             | NestJS 12 API, MongoDB/Mongoose persistence, Redis-backed services, and Swagger |
| `apps/client`          | Main user-facing Next.js 16 / React 19 App Router application                   |
| `apps/admin`           | Platform-admin Next.js application                                              |
| `apps/web`             | Public marketing Next.js application                                            |
| `packages/http-client` | Axios builder, interceptors, typed response envelope, and error normalization   |
| `packages/ui`          | Shared shadcn/Radix-style React components and Tailwind CSS tokens              |

Use `pnpm` from the repository root. Do not introduce npm/yarn lockfiles or
assume a build step exists for the shared packages: consumers import their
TypeScript source through the packages' `exports` maps.

## Before changing code

1. Read the closest `AGENTS.md` and the files that own the behavior. The
   public web app has additional Next.js guidance in `apps/web/AGENTS.md`.
2. Keep a change scoped to the app/package and domain feature it belongs to.
   Do not use a feature change as an excuse for broad renames or formatting
   churn.
3. Preserve local/unrelated working-tree edits. Never read, print, commit, or
   hard-code values from `.env*` files.
4. Match the style of the file being edited. The API and client generally omit
   semicolons, while `apps/admin`, `apps/web`, and shared packages contain
   generated/semicolon-based code. Do not reformat unrelated files.

## Running and validating

```bash
pnpm install --frozen-lockfile    # CI-compatible install
pnpm api:dev                      # Docker Compose API + MongoDB + Redis (API :5000)
pnpm client:dev                   # Main client (:3000 by default)
pnpm admin:dev                    # Admin app (:3001)
pnpm --filter web dev             # Public site (:3002)

pnpm --filter api lint
pnpm --filter api typecheck
pnpm --filter api test
pnpm --filter client lint
pnpm --filter client typecheck
pnpm --filter admin lint
pnpm --filter web lint
pnpm ci:verify                    # CI: format check, recursive lint/typecheck/build
```

Run the narrowest relevant checks first, then a broader check when a change
crosses package or app boundaries. `apps/api` is the only workspace currently
configured with Jest (`*.spec.ts` under `src`); there were no checked-in test
files when this guide was written. Add focused tests alongside meaningful API
behavior changes rather than treating that absence as permission to skip
verification.

CI runs on Node 26.11.1 with pnpm 12.11.2 and executes `pnpm ci:verify`.
The pre-commit hook runs `pnpm lint-staged`; its configured targets currently
cover only `apps/api` and `apps/client`.

## API conventions (`apps/api`)

### Architecture

Feature modules follow Clean Architecture / DDD boundaries:

```text
modules/<feature>/
  domain/          entities, value objects, domain rules/exceptions
  application/     use cases, ports/repositories, input/output contracts
  infrastructure/  Mongoose schemas/repositories and external adapters
  presentation/    controllers, request/response DTOs, HTTP concerns
```

Existing modules are `authentication`, `authorization`, `user`, `mail`,
`workspace`, `platform-admin`, `project`, `team`, `sprint`, `workitem`, and
`document`. Follow the spelling of an existing feature directory—even where
the repository uses the established typo `persistance`/`intercepters`—unless a
dedicated migration is requested.

- Keep domain code independent of Nest, Mongoose, Express, and HTTP DTOs.
  Put business rules and invariant checks in domain entities/value objects or
  application use cases; use the existing `DomainException` flow for expected
  business failures.
- Controllers should validate/deserialize request DTOs, extract trusted actor
  and workspace information with `@CurrentAuth`, and call a use case. Do not
  obtain tenant or actor identity from request bodies, query strings, or route
  parameters when it is available from the auth context.
- Add application ports and symbolic DI tokens, bind them in the feature
  module/provider file, and inject the token/interface into use cases. Keep
  Mongoose models and repository implementation in infrastructure.
- Preserve workspace isolation across projects, teams, sprints, work items,
  and documents. New queries and mutations must constrain by the authenticated
  `workspaceId` and authorize the relevant actor.
- The bootstrap globally applies validation with `transform`, `whitelist`, and
  `forbidNonWhitelisted`. Define class-validator DTOs deliberately; unknown
  request fields should remain rejected.

### HTTP and configuration

- The API prefix is `/api/v1`; Swagger is served at `/api/docs`.
- The global response interceptor wraps successful results as
  `{ success, statusCode, message, data, error, timestamp, path, method }`.
  The global exception filter uses the same envelope with `success: false`.
  Do not create one-off response shapes.
- Authentication uses cookies as well as bearer support; CORS is credentials
  enabled. Preserve cookie/refresh handling when extending authentication.
- Configuration is centralized under
  `src/shared/infrastructure/config`. Keep required environment validation
  there and update `apps/api/.env.example` with placeholders—not secrets—when
  adding a setting. Docker Compose reads `apps/api/.env.local` and supplies
  MongoDB and Redis for local development.
- The root helper commands `permission:sync`, `role:sync`, and `admin:create`
  execute API CLI programs inside the Docker service. Do not change system
  permission/role catalogs without considering these synchronization paths.

## Main client conventions (`apps/client`)

- This is a strict TypeScript Next.js 16 App Router application using React 19,
  Tailwind CSS 4, shadcn/Radix-style components, React Query, Zustand, React
  Hook Form, and Zod. The `@/*` alias resolves to `src/*`.
- Keep `app/` route files thin: they compose route layouts/providers and
  delegate screen UI to `src/_pages`. Organize reusable domain data/types in
  `src/entities`, user workflows in `src/features`, composite areas in
  `src/widgets`, and generic UI/API/hooks/lib in `src/shared`.
- Keep server-only code server-side. `serverFetch` reads Next request cookies
  and uses `API_BASE_URL`; browser requests use the configured Axios client,
  `NEXT_PUBLIC_BASE_URL`, `withCredentials`, and the guarded 401 refresh flow.
  Do not replace these paths with ad-hoc unauthenticated fetches or duplicate
  refresh logic.
- Use React Query for remote server state and the existing Zustand stores for
  client/session/workspace state. Maintain the distinction between the URL
  workspace slug, workspace ID, team key, project key, and API identifiers.
- The Tiptap editor under `src/shared/ui/tiptap` is a large vendored-style
  component system. Prefer local, minimal edits and do not bulk-refactor it as
  part of unrelated work.
- Reuse `src/shared/ui` or `@orbit/ui` before adding a near-duplicate primitive.
  Keep Tailwind CSS 4 tokens and the established accessible Radix/shadcn
  patterns rather than inventing a separate design system.
- For data-heavy screens, follow the project-browser/story-list pattern: use
  `tableFeatures({ rowSortingFeature })`, `createColumnHelper`, and
  `useTable` from the installed TanStack Table package; render sort controls in
  headers, set `aria-sort` on `<th>`, and use `manualSorting` only when the API
  owns sorting. Preserve a card alternative below the table breakpoint rather
  than forcing horizontal table interaction onto small screens.
- Prefer the installed shadcn/Radix composition primitives (`InputGroup`,
  `DropdownMenuCheckboxItem`, `ToggleGroup`, `ScrollArea`, `Empty`, `Card`,
  and `Tooltip` when a label is not visible) over custom equivalents. Start
  with mobile styles and add Tailwind responsive variants progressively; every
  icon-only control needs an accessible name and status changes need an
  appropriate live region.

## Admin, public web, and shared packages

- `apps/admin` uses the App Router and a root-relative `@/*` alias. It runs on
  port 3001 and explicitly transpiles `@orbit/ui` and `@orbit/http-client`.
  Keep its dashboard/sign-in separation and shared HTTP/error/query patterns.
- `apps/web` is the independent public site on port 3002. Obey its nested
  `AGENTS.md`: Next.js 16 APIs may differ from earlier versions, so consult the
  locally installed Next docs before adding or changing framework behavior.
- `packages/http-client` owns the shared Axios builder, interceptors, typed
  `ApiSuccess`/`ApiFailure` envelope, and `ApiError` normalization. Extend and
  export it through the package's public barrel rather than deep-importing
  private source files from consuming apps.
- `packages/ui` owns shared presentational components, its `cn` helper, and
  CSS design tokens. Preserve public export patterns (`@orbit/ui/components/*`,
  `@orbit/ui/lib/*`, `@orbit/ui/hooks/*`) when adding reusable UI.

## Delivery expectations

- Report the affected areas and exact checks run, including any checks that
  could not run and why.
- Do not silently "fix" existing debug logging, TODOs, hard-coded development
  values, or architecture inconsistencies outside the requested scope. Flag a
  security or correctness concern when it materially affects the requested
  change.
- Prefer small, reviewable patches that preserve API compatibility. When an API
  contract changes, update the relevant client contract/call site in the same
  change or explicitly document the required coordinated rollout.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev           # Watch mode
npm run start:dev:local     # Load .env.dev.local and watch

# Testing
npm run test:unit           # Unit tests (*.unit.spec.ts)
npm run test:unit:watch     # Unit tests watch mode
npm run test:unit:cov       # Unit tests with coverage report
npm run test:e2e            # E2E tests

# Code quality
npm run lint                # Fix ESLint issues + import order
npm run lint:check          # Check without fixing
npm run format:all          # Prettier + lint

# Migrations
npm run migration:run       # Run pending migrations (local)
npm run migration:revert    # Revert last migration (local)
npm run migration:show      # Show migration status (local)
npm run migration:generate  # Generate new migration from entity diff
make docker-migrate         # Run migrations inside running container
make docker-migrate-revert  # Revert inside running container
```

## Architecture

**Stack:** NestJS 11 + Express, TypeScript, TypeORM + PostgreSQL, MongoDB, RabbitMQ (`@golevelup/nestjs-rabbitmq`), Redis (`@adatechnology/cache`), Keycloak (`@adatechnology/auth-keycloak`).

**Purpose:** Core business API. Exposes REST endpoints, applies business rules, persists data, publishes domain events to RabbitMQ.

**Spec:** `.agents/skills/SPEC-API.md`

### Module structure

```
src/modules/
├── shared/
│   ├── providers/database/   # TypeORM (Postgres) + migrations
│   └── providers/queue/      # RabbitMQ producer
├── user/                     # Users + phones + addresses
├── address/                  # Address lookups
├── phone/                    # Phone management
├── notification/             # In-app notifications (MongoDB — read only)
├── error/                    # Global error handling
└── health/                   # Liveness/readiness
```

### Pattern per module

```
Controller → Service → UseCase → Repository → Database
```

- **Controllers:** thin — validate input, translate DTOs, delegate to Service
- **Services:** orchestration — call UseCases, coordinate providers (cache, queue), side-effects
- **UseCases:** single business operation, pure domain logic, reusable
- **Repositories:** TypeORM implementation, injected via `Symbol` token from `*.token.ts`

### DI tokens

Always use `Symbol` tokens defined in `<module>.token.ts`. Never inject by class directly.

### RabbitMQ (producer only)

Exchange: `zolve.events` (topic, durable). Publish domain events from UseCases.

### TypeScript path aliases

```
@app/*      → src/*
@config/*   → src/config/*
@modules/*  → src/modules/*
```

### Migrations

`migrationsRun: false` is hardcoded in `postgres.database-connection.ts`. Never set it to `true`.
Run migrations explicitly via `make docker-migrate` or `npm run migration:run`.

### Testing conventions

- Unit test files: `*.unit.spec.ts`
- Coverage threshold: 50% functions/lines/statements
- Mock `AmqpConnection`, TypeORM repositories, cache, keycloak

## Code Style

**Full reference:** `.agents/skills/CODE_STYLE.md`

### Logger

Always inject via `@Inject(LOGGER_PROVIDER)` from `@adatechnology/logger`. Never use `new Logger()`.

```ts
constructor(@Inject(LOGGER_PROVIDER) private readonly log: LogProviderInterface) {}

this.log.info({ message: 'Event processed', context: 'MyService.method', meta: { id } });
```

### Function parameters

Functions with more than one parameter MUST accept a single object. Use `<FunctionName>Params` / `<FunctionName>Result` naming.

### Validation (DTOs)

Use `ErrorMessages` from `@modules/shared/domain/constants/error-messages.constant.ts` for all `class-validator` messages.

```ts
@IsNotEmpty({ message: ErrorMessages['empty']('Nome') })
```

# Code Style & Conventions

This document records project conventions and examples. Developers should follow these rules when adding new code.

## Logger

- Always inject logger via token (do not construct logger instances directly).
- Use the provided token `LOGGER_PROVIDER` from `@adatechnology/logger` and the `LogProviderInterface`.
- For structured log payloads, use `meta` (preferred).
- `params` is legacy/compatibility only; avoid it in new code.
- Repeated log strings (message/context) should be extracted to constants.
- If a context string is reused multiple times in the same class, keep it in a class property (e.g. `private readonly logContext = 'MyUseCase.execute'`).

Example:

```ts
import { Inject } from '@nestjs/common';
import { LOGGER_PROVIDER } from '@adatechnology/logger';
import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';

constructor(@Inject(LOGGER_PROVIDER) private readonly log: LogProviderInterface) {}

this.log.warn({ message: 'Something happened', context: 'MyService', params: { foo: 'bar' } });

// Preferred (new code)
this.log.warn({ message: 'Something happened', context: 'MyService.doWork', meta: { foo: 'bar' } });

// Better for repeated strings
const MY_SERVICE_LOG_MESSAGES = {
  SOMETHING_HAPPENED: 'Something happened',
} as const;

class MyService {
  private readonly logContext = 'MyService.doWork';

  doWork() {
    this.log.warn({
      message: MY_SERVICE_LOG_MESSAGES.SOMETHING_HAPPENED,
      context: this.logContext,
      meta: { foo: 'bar' },
    });
  }
}

// Legacy compatibility (avoid in new code)
this.log.warn({ message: 'Something happened', context: 'MyService.doWork', params: { foo: 'bar' } });
```

## Repeated strings and constants

- Avoid repeating literals (messages, contexts, error keys, event names) in the same flow.
- Move repeated literals to `const` / `as const` objects in the same folder/module.
- Reuse constants in both implementation and unit tests whenever possible.

## Function parameters and return types

- Functions/methods with more than one parameter MUST accept a single object parameter.
- Use the naming convention `<FunctionName>Params` for the input type and `<FunctionName>Result` for the return type when applicable.
- Place types in `src/modules/<module>/types/*.ts`.

Example:

```ts
// src/modules/health/types/health.types.ts
export type CheckDatabaseParams = { timeoutMs: number };
export type CheckDatabaseResult = { status: 'up'|'down'; responseMs?: number };

// service
async checkDatabase(params: CheckDatabaseParams): Promise<CheckDatabaseResult> {
  const { timeoutMs } = params;
  // ...
}
```

## File organization

- Module-specific types go to `src/modules/<module>/types/`.
- Keep one types file per module when possible.

## Tests

- Add unit tests under `test/unit/` and use the existing jest config.
- Provide template files under `test/unit/templates/` to encourage consistent mocks (e.g. for injecting `LOGGER_PROVIDER`, `DATABASE_POSTGRES_SOURCE`, `CACHE_PROVIDER`).

## Enforcement

- Linting is configured; please run `npm run lint` before opening PRs.
- CI runs lint + unit tests. If you want stricter enforcement (custom ESLint rule for object-param pattern), we'll add it in a follow-up.
- PRs must complete the checklist in `.github/pull_request_template.md`, including logger/constants conventions.

## Layer responsibilities

- Controllers should be thin: perform request validation, translate DTOs, and delegate orchestration to Services. Avoid performing business logic or side-effects in controllers.
- Services are the orchestration layer: they call UseCases, coordinate third-party providers (cache, queue, external APIs), and perform side-effects such as cache invalidation or emitting events.
- UseCases should encapsulate single business operations (pure domain logic) and be reusable by Services. Keep UseCases focused and side-effect free when possible; orchestration and integration belong to Services.

Example (good):

```
// Controller
const user = await this.userService.createUser(params);

// Service
const user = await this.userCreateUseCase.execute(params);
await this.cacheProvider.del('users:list').catch(() => null);
return user;
```

This keeps controllers simple and makes testing and reuse easier.

Rule: Do not perform domain lookups in controllers

- Controllers must not call `getUserByKeycloakId` or other domain lookups directly when the flow involves multiple steps. Instead, add a descriptive orchestration method on the Service (e.g. `listUserAddressesByKeycloakId`, `addUserAddressByKeycloakId`) and call that from the controller. This centralizes lookup logic, reduces duplication, and keeps controllers thin.

Example (addresses):

```ts
// Controller
return this.userService.listUserAddressesByKeycloakId(keycloakId);

// Service
async listUserAddressesByKeycloakId(keycloakId: string) {
  const user = await this.getUserByKeycloakId(keycloakId);
  return this.listUserAddresses(user.id);
}
```

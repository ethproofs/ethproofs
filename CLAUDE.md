# Code style

- Don't use enums.
- DO NOT USE COMMENTS UNLESS EXPLICITLY ASKED.
- Default to interfaces for object signatures.
- Use `function` declaration for top-level functions and React components.
- Use arrow functions for callbacks.
- Use object method shorthand syntax in objects and interfaces.
- Prefer constants over magic numbers or strings.
- Default to lowercase casing for UI text strings.

## Drizzle migrations

- For schema changes (new tables, columns, constraints), run:
  ```bash
  npx drizzle-kit generate --name <description>
  ```
  This auto-generates migration SQL AND updates the snapshot.
- Only use `--custom` flag for data-only migrations (no schema changes):
  ```bash
  npx drizzle-kit generate --custom --name <description>
  ```
  The `--custom` flag creates an empty SQL file and copies the previous snapshot unchanged.
- If you must use `--custom` with schema changes, manually update the snapshot in `supabase/migrations/meta/`.

## Naming

- use camelCase for file-level constants, screaming snake case in the "constants" package or constants.ts files.
- Use descriptive, elaborate, intention-revealing names that explain what the function does, not how.
- Booleans start with is/has/should/can.

## Never use exceptions for control flow

- Do not throw errors in helpers, utility functions, or any part of normal control paths (e.g., React lifecycle, async setup, reducers, render logic).
- Exceptions are for truly unexpected, unrecoverable failures—not for branching or expected conditions.
- Use explicit return values like null, undefined, or well-typed status objects to represent expected failure or alternative paths.

## Decompose impure logic

- Avoid mixing unrelated concerns (e.g., state access, conditional logic, async side effects, configuration).
- Separate pure computation from impure operations (e.g., store reads/writes, I/O, global mutations).
- Factor out non-trivial meaningful logic into named functions, even if only used once.
- Prefer composable functions with clear input/output boundaries.

## Typescript

- Do not use type casting through `as` or non-null assertions (!).
- If a cast is truly necessary, include a runtime check and/or a type guard.
- Do not use `any`; prefer `unknown` with further narrowing if a type cannot be immediately described.

## React component props

- Define component props in a separate interface above the component, in the format
  ComponentNameProps.
- Destructure props directly in the signature: `function Component({ propA, propB }: ComponentProps)`

## File naming

- Use kebab-case file names
- File names must explain their contents, e.g., a file containing `AlternateHeaderLayout`
  is called `alternate-header-layout.tsx`
- Avoid using index.ts(x) files, except for the following scenarios:
  - Barrel exports from library packages
  - Required by file-based router
- use \*.spec.ts(x) for tests

## Use Remeda for functional utilities

Prefer [Remeda](https://remedajs.com) when working with non-trivial data transformations that benefit from strong typing, immutability, and composability.

### Typed object utilities

Use `keys`, `entries`, and `fromEntries` instead of `Object.keys`, `Object.entries`, and `Object.fromEntries`. Remeda retains exact key types, including literal unions.

```ts
import { keys } from "remeda"

const obj = { foo: 1, bar: 2 }
const result = keys(obj) // type: ('foo' | 'bar')[]
```

### Chained transformations

```ts
import { filter, groupBy, mapValues, pipe } from "remeda"

const users = [
  { id: 1, role: "admin", isActive: true },
  { id: 2, role: "user", isActive: true },
  { id: 3, role: "admin", isActive: false },
]

const counts = pipe(
  users,
  filter((u) => u.isActive),
  groupBy((u) => u.role),
  mapValues((list) => list.length)
)
// type: { admin: number; user: number }
```

### When not to use Remeda

Use native JS methods for trivial operations where type inference is already correct and readability is higher:

```ts
const ids = items.map((x) => x.id)
```

# Commit conventions

- Use conventional commits format.
- Use imperative language.
- Do not add anything to the commit message body unless explicitly asked.
